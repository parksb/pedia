import { Simpesys, Document } from "@simpesys/core";
import createFuzzySearch, { FuzzySearcher } from "@nozbe/microfuzz";
import { Asset } from "./types.ts";
import { readFile, Log, sortBy } from "./utils.ts";
import { Anchor } from "./components/anchor.tsx";
import { ASSETS_DIR_PATH, MARKDOWN_DIRECTORY_PATH } from "./consts.ts";
import { WEBSITE_DOMAIN } from "./consts.ts";
import { List } from "./components/list.tsx";
import { App } from "./components/app.tsx";
import { Content } from "./components/content.tsx";

export class System {
  private dict: Record<string, Document> = {};
  private list: Document[] = [];

  private searcher: FuzzySearcher<Document> | null = null;
  private asset: Asset = { css: "", js: "" };

  private simpesys: Simpesys = new Simpesys(
    {
      web: {
        domain: WEBSITE_DOMAIN,
      },
      docs: {
        root: "simonpedia",
        notFound: "http-404",
        subdocumentsSectionTitle: "하위문서",
        publicationsSectionTitle: "문헌",
        backlinksSectionTitle: "이 문서를 인용한 문서",
      },
    },
    {
      manipulateMarkdown: (markdown, candidate) => {
        let result = markdown;

        if (candidate.type === "publication") {
          result = result.replace(/^#\s(.*)/, "# 『$1』");
        }

        return result;
      },
      onInternalLinkUnresolved: (error: Error) => {
        Log.warn(error.message);
      },
    },
    {
      normal: (key: string) => {
        return Anchor({ href: key, scrollTo: true }).toString();
      },
      labeled: (key, label) => {
        return Anchor({ href: key, label, scrollTo: true }).toString();
      },
    },
  );

  async init() {
    const start = performance.now();

    this.asset = {
      css: await readFile(`${ASSETS_DIR_PATH}/index.css`),
      js: await readFile(`${ASSETS_DIR_PATH}/index.js`),
    };

    this.simpesys = await this.simpesys.init({ syncMetadata: true });

    this.dict = this.simpesys.getDocuments();
    this.list = Object.values(this.simpesys.getDocuments());

    this.searcher = createFuzzySearch.default(this.list, {
      getText: (document) => [
        document.title,
        document.filename,
        document.markdown,
      ],
    });

    const end = performance.now();

    this.printInfo(end - start);

    return this;
  }

  getSitemap() {
    const urls = this.list
      .map(
        ({ filename }) => `<url><loc>${WEBSITE_DOMAIN}/${filename}</loc></url>`,
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
        ${urls}
      </urlset>`;
  }

  getList(query?: string, orderBy?: string) {
    return List({ documents: this.getDocuments(query, orderBy) });
  }

  getDocument(id: string, swap = false) {
    const document = this.dict[id];

    if (!document) return null;

    if (swap) {
      return Content({ document });
    } else {
      return App({
        documents: this.getDocuments(),
        document,
        css: this.asset.css,
        js: this.asset.js,
      });
    }
  }

  private getDocuments(query?: string, orderBy: string = "c") {
    let documents = [...this.list];

    if (query) {
      return this.searcher!(query).map(({ item }) => item);
    }

    if (orderBy === "c") {
      documents = documents.sort((a, b) => sortBy(a, b, "createdAt"));
    } else if (orderBy === "u") {
      documents = documents.sort((a, b) => sortBy(a, b, "updatedAt"));
    }

    return [
      this.dict["simonpedia"],
      ...documents.filter((x) => x.filename !== "simonpedia"),
    ];
  }

  private printInfo(timeTaken: number) {
    for (const { name: filename } of Deno.readDirSync(
      MARKDOWN_DIRECTORY_PATH,
    ).filter(({ name: filename }) => filename.endsWith(".md"))) {
      if (
        !new Set(Object.keys(this.dict)).has(filename.replace(/\.md$/, "")) &&
        !filename.startsWith("private/")
      ) {
        Log.warn(`Isolated document: ${filename}`);
      }
    }

    Log.info(
      `${this.list.length} documents loaded in ${timeTaken?.toFixed(0)}ms`,
    );
  }
}
