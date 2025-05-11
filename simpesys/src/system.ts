import Denque from "denque";
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
} from "./consts.ts";
import { Breadcrumb, Document, SearchIndex } from "./types.ts";
import { readFile } from "./utils.ts";
import { App } from "./components/app.tsx";
import { Content } from "./components/content.tsx";

export class System {
	private dict: Record<string, Document> = {};
	private list: Document[] = [];
	private written: Set<string> = new Set(["simonpedia"]);

	async init() {
		console.time("Build");

		const queue = new Denque<{ filename: string; breadcrumbs: Breadcrumb[] }>([
			{
				filename: "simonpedia",
				breadcrumbs: [],
			},
		]);

		// Find all the documents using BFS.
		while (queue.length > 0) {
			const { filename, breadcrumbs } = queue.shift()!;

			try {
				const markdown = await readFile(
					`${MARKDOWN_DIRECTORY_PATH}/${filename}.md`,
				);
				const title = markdown.match(/^#\s.*/)![0].replace(/^#\s/, "");

				const document: Document = {
					title,
					filename,
					markdown,
					html: "",
					breadcrumbs: [...breadcrumbs, { title, filename }],
					children: [],
					referred: [],
				};

				this.dict[filename] = document;

				for (const subdoc of findSubdocs(markdown)) {
					if (!this.written.has(subdoc)) {
						queue.push({ filename: subdoc, breadcrumbs: document.breadcrumbs });
						this.written.add(subdoc);
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
					'<a href="/$1" hx-get="/swap/$1" hx-target="#main" hx-push-url="/$1" hx-swap="show:top" hx-on:click="select(\'$1\') && scrollToActive()">$2</a>',
				)
				.replace(
					LINK_REGEX,
					'<a href="/$1" hx-get="/swap/$1" hx-target="#main" hx-push-url="/$1" hx-swap="show:top" hx-on:click="select(\'$1\') && scrollToActive()">$1</a>',
				);
		}

		this.list = Object.values(this.dict);

		return this;
	}

	printInfo() {
		for (const { name: filename } of Deno.readDirSync(
			MARKDOWN_DIRECTORY_PATH,
		).filter(({ name: filename }) => filename.endsWith(".md"))) {
			if (
				!this.written.has(filename.replace(/\.md$/, "")) &&
				!filename.startsWith("private/")
			) {
				console.warn(`Isolated document: ${filename}`);
			}
		}
	}

	getDocument(id: string, swap = false) {
		const document = this.dict[id];

    if (!document) return null

		if (swap) {
			return Content(document);
		} else {
			return App(this.list, document);
		}
	}
}
