import * as ejs from 'ejs';
import { promises as fs } from 'fs';
import dayjs from 'dayjs';
import Denque from 'denque';

import { appendReferred, findReferences, findReferredSentences, findSubdocs, labelInternalLinks, md, prependToc } from './markdown';
import { Document, SearchIndex } from './types';
import { WEBSITE_DOMAIN, MARKDOWN_DIRECTORY_PATH, DIST_DIRECTORY_PATH, APP_TEMPLATE_FILE, DOC_TEMPLATE_FILE, SITEMAP_PATH, LABELED_LINK_REGEX, LINK_REGEX } from './consts';

(async () => {
  console.time('Build');

  const queue = new Denque([{ filename: 'simonpedia', breadcrumbs: [] }]);
  const written = new Set<string>(['simonpedia']);
  const dict: Record<string, Document> = {};

  // Find all the documents using BFS.
  while (queue.length > 0) {
    const { filename, breadcrumbs } = queue.shift();

    try {
      const markdown = (await fs.readFile(`${MARKDOWN_DIRECTORY_PATH}/${filename}.md`)).toString();
      const title = markdown.match(/^#\s.*/)[0].replace(/^#\s/, '');

      const document: Document = {
        title,
        filename,
        markdown,
        html: '',
        breadcrumbs: [...breadcrumbs, { title, filename }],
        children: [],
        referred: []
      };

      dict[filename] = document;

      for (const subdoc of findSubdocs(markdown)) {
        if (!written.has(subdoc)) {
          queue.push({ filename: subdoc, breadcrumbs: document.breadcrumbs });
          written.add(subdoc);
        }
      }
    } catch {
      continue;
    }
  }

  for (const document of Object.values(dict)) {
    document.markdown = labelInternalLinks(document.markdown, dict, document.filename);
    for (const reference of findReferences(document.markdown)) {
      dict[reference].referred.push({
        document,
        sentences: findReferredSentences(document.markdown, dict[reference].filename, dict),
      })
    }
  }

  for (const document of Object.values(dict)) {
    document.markdown = appendReferred(document.markdown, document.referred, dict);
    document.markdown = prependToc(document.markdown);
    document.html = md.render(document.markdown)
      .replace(LABELED_LINK_REGEX, '<a href="/$1.html" hx-get="/$1.html" hx-target="#main" hx-push-url="/$1" hx-swap="show:top" hx-on:click="select(\'/$1\') && scrollToActive()">$2</a>')
      .replace(LINK_REGEX, '<a href="/$1.html" hx-get="/$1.html" hx-target="#main" hx-push-url="/$1" hx-swap="show:top" hx-on:click="select(\'/$1\') && scrollToActive()">$1</a>');
  }

  const generateMetaFiles = async () => {
    const sitemapUrls: string[] = [];
    const searchIndices: SearchIndex[] =[];

    for (const document of Object.values(dict)) {
      const { title, filename, markdown } = document;
      const searchIndex: SearchIndex = { title, filename, text: markdown };
      searchIndices.push(searchIndex);

      fs.writeFile(`${DIST_DIRECTORY_PATH}/${filename}.html`, ejs.render(String(await DOC_TEMPLATE_FILE), { document }));
      sitemapUrls.push(`<url><loc>${WEBSITE_DOMAIN}/${filename}</loc><changefreq>daily</changefreq><priority>1.00</priority></url>`);
    }

    fs.writeFile(`${DIST_DIRECTORY_PATH}/search.json`, JSON.stringify(searchIndices));
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
  };

  const printInfo = async () => {
    for (const filename of (await fs.readdir(MARKDOWN_DIRECTORY_PATH)).filter((filename) => filename.endsWith('.md'))) {
      if (!written.has(filename.replace(/\.md$/, '')) && !filename.startsWith('private/')) {
        console.warn(`Isolated document: ${filename}`);
      }
    }
  };

  Promise.all([
    generateMetaFiles(), printInfo(),
    fs.writeFile(`${DIST_DIRECTORY_PATH}/index.html`, ejs.render(String(await APP_TEMPLATE_FILE), { documents: Object.values(dict) })),
  ]);

  console.info('Total documents:', Object.keys(dict).length);
  console.timeEnd('Build');
})();
