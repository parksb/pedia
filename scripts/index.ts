import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

import * as MarkdownIt from 'markdown-it';
import * as katex from 'katex';
import * as highlightJs from 'highlight.js';
import * as mdFootnote from 'markdown-it-footnote';
import * as mdTex from 'markdown-it-texmath';
import * as mdAnchor from 'markdown-it-anchor';
import * as mdTableOfContents from 'markdown-it-table-of-contents';
import * as mdInlineComment from 'markdown-it-inline-comments';
import * as mdCheckbox from 'markdown-it-task-checkbox';

const MARKDOWN_DIRECTORY_PATH: string = path.join(__dirname, '../docs');
const DIST_DIRECTORY_PATH: string = path.join(__dirname, '../build');
const TEMPLATE_FILE_PATH: Buffer = fs.readFileSync(path.join(__dirname, './index.ejs'));
const SITEMAP_PATH = `${DIST_DIRECTORY_PATH}/sitemap.xml`;

interface Document {
  title: string;
  filename: string; // without extension
  html: string;
  breadcrumbs: string[]; // without extension
  children: Document[];
}

(() => {
  const md: MarkdownIt = new MarkdownIt({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '“”‘’',
    highlight: (str, lang) => {
      if (lang && highlightJs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${highlightJs.highlight(lang, str, true).value}</code></pre>`;
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  }).use(mdFootnote)
    .use(mdInlineComment)
    .use(mdTex, {
      engine: katex,
      delimiters: 'gitlab',
      macros: { '\\RR': '\\mathbb{R}' },
    })
    .use(mdAnchor)
    .use(mdTableOfContents, {
      includeLevel: [2, 3, 4],
    })
    .use(mdCheckbox, {
      disabled: true,
    });

    // https://github.com/johngrib/johngrib-jekyll-skeleton/blob/v1.0/_includes/createLink.html
    const linkRegex = /\[\[(.+?)\]\]/g;
    const labeledLinkRegex = /\[\[(.+?)\]\]\{(.+?)\}/g;

    const findInternalLinks = (markdown: string) => {
      return [
        ...markdown.match(linkRegex)?.map((link) => link.replace(/(\[\[)|(\]\])/g, '')) || [],
        ...markdown.match(labeledLinkRegex)?.map((link) => link.replace(/(\[\[)|(\]\])|({(.+?)})/g, '')) || [],
      ];
    };
    
    const parseMarkdown = (filename: string, breadcrumbs: string[]): Document => {
      const preContents = '[[toc]]\n\n';
      const markdown = fs.readFileSync(`${MARKDOWN_DIRECTORY_PATH}/${filename}.md`).toString();

      const html = md.render(`${preContents}${markdown}`)
        .replace(labeledLinkRegex, '<a href="$1.html">$2</a>')
        .replace(linkRegex, '<a href="$1.html">$1</a>');

      const links = findInternalLinks(markdown);
      const children = links.map((link) => parseMarkdown(link, [...breadcrumbs, link]));

      const title = markdown.match(/^#\s.*/)[0].replace(/^#\s/, '');
      return { title, filename, html, breadcrumbs, children };
    };

    const writeHTML = (document: Document) => {
      fs.writeFileSync(
        `${DIST_DIRECTORY_PATH}/${document.filename}.html`,
        ejs.render(String(TEMPLATE_FILE_PATH), { document }),
      );

      document.children.map((child) => writeHTML(child));
    };

    const writeSitemap = () => {
      const htmlFiles = fs.readdirSync(DIST_DIRECTORY_PATH).filter((file) => !file.startsWith('.'));
      const urls = htmlFiles.map((file) => `<url><loc>https://wikiwikiwi.vercel.app/${file}</loc><changefreq>daily</changefreq><priority>1.00</priority></url>`);
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url><loc>https://wikiwikiwi.vercel.app/</loc><changefreq>daily</changefreq><priority>1.00</priority></url>
${urls.join('\n')}
</urlset>
`;
      fs.writeFileSync(SITEMAP_PATH, content);
    };

    const root = parseMarkdown('index', []);

    writeHTML(root);
    writeSitemap();
})();