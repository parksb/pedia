import Denque from "denque";
import createFuzzySearch, { FuzzySearcher } from "@nozbe/microfuzz";
import {
  appendReferred,
  findReferences,
  findReferredSentences,
  findSubdocs,
  labelInternalLinks,
  md,
  prependToc,
} from "./markdown.ts";
import {
  LABELED_LINK_REGEX,
  LINK_REGEX,
  MARKDOWN_DIRECTORY_PATH,
  ROOT_PATH,
  WEBSITE_DOMAIN,
} from "./consts.ts";
import { Breadcrumb, Document, DocumentMetadata } from "./types.ts";
import { Log, readFile } from "./utils.ts";
import { App } from "./components/app.tsx";
import { Content } from "./components/content.tsx";
import { List } from "./components/list.tsx";
import { Anchor } from "./components/anchor.tsx";

export class System {
  private dict: Record<string, Document> = {};
  private list: Document[] = [];
  private written: Set<string> = new Set(["simonpedia"]);
  private searcher: FuzzySearcher<Document> | null = null;

  async init() {
    const metadata: Record<string, DocumentMetadata> = JSON.parse(
      await readFile(`${ROOT_PATH}/.metadata.json`),
    );

    const queue = new Denque<{
      filename: string;
      type: Document["type"];
      breadcrumbs: Breadcrumb[];
    }>([
      {
        filename: "simonpedia",
        type: "subject",
        breadcrumbs: [],
      },
    ]);

    while (queue.length > 0) {
      const { filename, type, breadcrumbs } = queue.shift()!;

      try {
        let markdown = await readFile(
          `${MARKDOWN_DIRECTORY_PATH}/${filename}.md`,
        );

        if (type === "publication") {
          markdown = markdown.replace(/^#\s(.*)/, "# 『$1』");
        }

        const title = markdown.match(/^#\s.*/)![0].replace(/^#\s/, "");

        const document: Document = {
          title,
          filename,
          markdown,
          html: "",
          breadcrumbs: [...breadcrumbs, { title, filename }],
          children: [],
          referred: [],
          type,
          createdAt: metadata[filename]?.createdAt || Temporal.Now.instant(),
          updatedAt: metadata[filename]?.updatedAt,
        };

        this.dict[filename] = document;

        for (const subdoc of findSubdocs(markdown, type)) {
          if (!this.written.has(subdoc.filename)) {
            queue.push({
              filename: subdoc.filename,
              type: subdoc.type,
              breadcrumbs: document.breadcrumbs,
            });
            this.written.add(subdoc.filename);
          }
        }
      } catch {
        continue;
      }
    }

    for (const document of Object.values(this.dict)) {
      document.markdown = labelInternalLinks(
        document.markdown,
        this.dict,
        document.filename,
      );
      for (const reference of findReferences(document.markdown)) {
        this.dict[reference].referred.push({
          document,
          sentences: findReferredSentences(
            document.markdown,
            this.dict[reference].filename,
            this.dict,
          ),
        });
      }
    }

    for (const document of Object.values(this.dict)) {
      document.markdown = appendReferred(
        document.markdown,
        document.referred,
        this.dict,
      );
      document.markdown = prependToc(document.markdown);
      document.html = md
        .render(document.markdown)
        .replace(
          LABELED_LINK_REGEX,
          Anchor({ href: "$1", label: "$2", scrollTo: true }),
        )
        .replace(LINK_REGEX, Anchor({ href: "$1", scrollTo: true }));
    }

    this.list = Object.values(this.dict);

    this.searcher = createFuzzySearch.default(this.list, {
      getText: (document: Document) => [
        document.title,
        document.filename,
        document.markdown,
      ],
    });

    this.printInfo();

    return this;
  }

  private printInfo() {
    Log.info(`Documents loaded: ${this.list.length}`);

    for (
      const { name: filename } of Deno.readDirSync(
        MARKDOWN_DIRECTORY_PATH,
      ).filter(({ name: filename }) => filename.endsWith(".md"))
    ) {
      if (
        !this.written.has(filename.replace(/\.md$/, "")) &&
        !filename.startsWith("private/")
      ) {
        Log.warn(`Isolated document: ${filename}`);
      }
    }
  }

  getSitemap() {
    const urls = this.list
      .map(({ filename }) =>
        `<url><loc>${WEBSITE_DOMAIN}/${filename}</loc></url>`
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
        ${urls}
      </urlset>`;
  }

  getList(q?: string) {
    return List({
      documents: q ? this.searcher!(q).map(({ item }) => item) : this.list,
    });
  }

  getDocument(id: string, swap = false) {
    const document = this.dict[id];

    if (!document) return null;

    if (swap) {
      return Content({ document });
    } else {
      return App({ documents: this.list, document });
    }
  }
}
