import * as ejs from 'ejs';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as dayjs from 'dayjs';

import * as MarkdownIt from 'markdown-it';
import * as katex from 'katex';
import hljs from 'highlight.js';
import * as mdFootnote from 'markdown-it-footnote';
import * as mdTex from 'markdown-it-texmath';
import mdAnchor from 'markdown-it-anchor';
import * as mdTableOfContents from 'markdown-it-table-of-contents';
import * as mdInlineComment from 'markdown-it-inline-comments';
import * as mdCheckbox from 'markdown-it-task-checkbox';
import { full as mdEmoji } from 'markdown-it-emoji';
import * as mdExternalLink from 'markdown-it-external-links';
import mdMermaid from 'markdown-it-mermaid';
import * as mdContainer from 'markdown-it-container';

const Denque = require('denque');

interface Document {
  title: string;
  filename: string; // without extension
  html: string;
  markdown: string;
  breadcrumbs: string[]; // without extension
  children: Document[];
  parent?: Document;
  referredFrom: Document[];
}

interface SearchIndex {
  title: string;
  filename: string; // without extension
  text: string;
}

(async () => {
  console.time('Build');

  const WEBSITE_DOMAIN = 'https://pedia.parksb.xyz';
  const MARKDOWN_DIRECTORY_PATH: string = path.join(__dirname, '../docs');
  const DIST_DIRECTORY_PATH: string = path.join(__dirname, '../build');

  const TEMPLATE_DIR_PATH = path.join(__dirname, './templates');
  const APP_TEMPLATE_FILE: Buffer = await fs.readFile(path.join(TEMPLATE_DIR_PATH, 'app.ejs'));
  const DOC_TEMPLATE_FILE: Buffer = await fs.readFile(path.join(TEMPLATE_DIR_PATH, 'document.ejs'));
  const SEARCH_TEMPLATE_FILE: Buffer = await fs.readFile(path.join(TEMPLATE_DIR_PATH, 'search.ejs'));

  const SITEMAP_PATH = `${DIST_DIRECTORY_PATH}/sitemap.xml`;

  const md: MarkdownIt = new MarkdownIt({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  }).use(mdFootnote)
  .use(mdInlineComment)
  .use(mdMermaid)
  .use(mdEmoji)
  .use(mdTex, {
    engine: katex,
    delimiters: 'dollars',
    macros: { '\\RR': '\\mathbb{R}' },
  })
  .use(mdAnchor)
  .use(mdTableOfContents, {
    includeLevel: [2, 3, 4],
    format: (content: string) => content.replace(/\[\^.*\]/, ''),
  })
  .use(mdCheckbox, {
    disabled: true,
  })
  .use(mdContainer, 'TOGGLE', {
    validate(params: string) {
      return params.trim().match(/^TOGGLE\s+(.*)$/);
    },
    render(tokens: unknown, idx: number) {
      const content = tokens[idx].info.trim().match(/^TOGGLE\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        return `<details><summary>${md.utils.escapeHtml(content[1])}</summary>\n`;
      }
      return '</details>\n';
    },
  })
  .use(mdContainer, 'NOTE', {
    validate: () => true,
  })
  .use(mdExternalLink, {
    externalClassName: 'external',
    internalDomains: ['pedia.parksb.xyz'],
  });

  const sitemapUrls: string[] = [];
  const searchIndices: SearchIndex[] =[];

  // https://github.com/johngrib/johngrib-jekyll-skeleton/blob/v1.0/_includes/createLink.html
  const linkRegex = /\[\[(.+?)\]\]/g;
  const labeledLinkRegex = /\[\[(.+?)\]\]\{(.+?)\}/g;

  const queue = new Denque([{ filename: 'simonpedia', breadcrumbs: [] }]);
  const writtenFiles: Set<string> = new Set(['simonpedia']);
  const documents: { [key: string]: Document } = {};

  const findSubFilenames = (markdown: string): string[] => {
    const filenames = []
    const subdocSection = new RegExp('## 하위문서\\s*\\n([^#]*)', 'g').exec(markdown);

    if (!subdocSection) return filenames;

    const lines = subdocSection[1].trim().split('\n');
    for (const line of lines) {
      const match = line.match(/(-|\*) \[\[(.*?)\]\]/);
      if (match) {
        filenames.push(match[2]);
      }
    }

    return filenames;
  };

  const findReferredFilenames = (markdown: string): string[] => {
    return [
      ...new Set([
        ...markdown.match(linkRegex)?.map((link) => link.replace(/(\[\[)|(\]\])/g, '')) || [],
        ...markdown.match(labeledLinkRegex)?.map((link) => link.replace(/(\[\[)|(\]\])|({(.+?)})/g, '')) || [],
      ]),
    ];
  };

  const labelInternalLink = (markdown: string, parent?: string): string => {
    let ret = markdown;

    ret = ret.replace(/\[\[([^\]]+)\]\](\{[^}]+\})?/g, (match, link, label) => {
      try {
        if (link.startsWith('private/') && !label) {
          console.warn(`Unlabeled private internal link: ${match} in ${parent}.md`);
        }

        if (!documents[link]) {
          throw new Error(`Unresolved internal link: ${match} in ${parent}.md`);
        }

        if (label) {
          return match;
        }
        return `${match}{${documents[link].title}}`;
      } catch (e) {
        console.warn(e.message);
        if (label) {
          return `[[http-404]]${label}`;
        }
        return `[[http-404]]${link}`;
      }
    });

    return ret;
  }

  const insertToc = (markdown: string) => {
    const match = markdown.match(/^(# .+?)(\n|$)/m);
    if (!match) return markdown;
    const headerIndex = match.index + match[0].length
    return `${markdown.slice(0, headerIndex)}\n[[toc]]\n${markdown.slice(headerIndex)}`;
  };

  while (queue.length > 0) {
    const { filename, breadcrumbs } = queue.shift();

    try {
      const markdown = (await fs.readFile(`${MARKDOWN_DIRECTORY_PATH}/${filename}.md`)).toString();
      const title = markdown.match(/^#\s.*/)[0].replace(/^#\s/, '');

      const document: Document = { title, filename, markdown, html: '', breadcrumbs: [...breadcrumbs, { title, filename }], children: [], referredFrom: [] };
      documents[filename] = document;

      for (const internalFilename of findSubFilenames(markdown)) {
        if (!writtenFiles.has(internalFilename)) {
          queue.push({ filename: internalFilename, breadcrumbs: document.breadcrumbs });
          writtenFiles.add(internalFilename);
        }
      }
    } catch (e) {
      console.warn(`Unresolved markdown file: ${filename}.md`);
      continue;
    }
  }

  for (const document of Object.values(documents)) {
    for (const referredFilename of findReferredFilenames(document.markdown)) {
      if (referredFilename in documents) {
        documents[referredFilename].referredFrom.push(document);
      }
    }

    document.markdown = labelInternalLink(document.markdown, document.filename);
    document.html = md.render(`${insertToc(document.markdown)}`)
      .replace(labeledLinkRegex, '<a href="/$1">$2</a>')
      .replace(linkRegex, '<a href="/$1">$1</a>');
  }

  for (const document of Object.values(documents)) {
    const { title, filename, markdown } = document;
    const searchIndex: SearchIndex = { title, filename, text: markdown };
    searchIndices.push(searchIndex);

    fs.writeFile(`${DIST_DIRECTORY_PATH}/${filename}.html`, ejs.render(String(DOC_TEMPLATE_FILE), { document }));
    sitemapUrls.push(`<url><loc>${WEBSITE_DOMAIN}/${filename}.html</loc><changefreq>daily</changefreq><priority>1.00</priority></url>`);
  }

  fs.writeFile(`${DIST_DIRECTORY_PATH}/index.html`, ejs.render(String(APP_TEMPLATE_FILE), { documents: Object.values(documents) }));
  fs.writeFile(`${DIST_DIRECTORY_PATH}/search.html`, ejs.render(String(SEARCH_TEMPLATE_FILE), { document: JSON.stringify(searchIndices) }));

  if (process.env.NODE_ENV === 'production') {
    fs.writeFile(
      SITEMAP_PATH,
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url><loc>${WEBSITE_DOMAIN}/</loc><lastmod>${dayjs().format('YYYY-MM-DDTHH:mm:ss')}Z</lastmod><changefreq>daily</changefreq><priority>1.00</priority></url>
${sitemapUrls.join('\n')}
</urlset>`,
    );
  }
  console.timeEnd('Build');
})();
