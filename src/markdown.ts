import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import mdFootnote from "markdown-it-footnote";
import mdTex from "markdown-it-texmath";
import mdAnchor from "markdown-it-anchor";
import mdTableOfContents from "markdown-it-table-of-contents";
import mdInlineComment from "markdown-it-inline-comments";
import mdCheckbox from "markdown-it-task-checkbox";
import mdExternalLink from "markdown-it-external-links";
import mdMermaid from "@markslides/markdown-it-mermaid";
import mdContainer from "markdown-it-container";
import { full as mdEmoji } from "markdown-it-emoji";
import * as katex from "katex";

import { type Document, DocumentDict, Reference } from "./types.ts";
import { LABELED_LINK_REGEX, LINK_REGEX } from "./consts.ts";
import { Log } from "./utils.ts";

export const md = MarkdownIt({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre class="hljs"><code>${
        hljs.highlight(str, { language: lang }).value
      }</code></pre>`;
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
}).use(mdFootnote)
  .use(mdInlineComment)
  .use(mdMermaid)
  .use(mdEmoji)
  .use(mdAnchor)
  .use(mdTex, {
    engine: katex,
    delimiters: "dollars",
    macros: { "\\RR": "\\mathbb{R}" },
  })
  .use(mdTableOfContents, {
    includeLevel: [2, 3, 4],
    format: (content: string) => content.replace(/\[\^.*\]/, ""),
  })
  .use(mdCheckbox, {
    disabled: true,
  })
  .use(mdContainer, "TOGGLE", {
    validate(param: string) {
      return param.trim().match(/^TOGGLE\s+(.*)$/);
    },
    render(tokens: any[], idx: number) {
      const content = tokens[idx].info.trim().match(/^TOGGLE\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        return `<details><summary>${
          md.utils.escapeHtml(content[1])
        }</summary>\n`;
      }
      return "</details>\n";
    },
  })
  .use(mdContainer, "NOTE", {
    validate: (param: string) => param.trim() == "NOTE",
  })
  .use(mdContainer, "INFO", {
    validate: (param: string) => param.trim() == "INFO",
  })
  .use(mdExternalLink, {
    externalClassName: "external",
    internalDomains: ["pedia.parksb.xyz"],
  });

/**
 * Insert table of contents right after the first line of the markdown.
 */
export const prependToc = (markdown: string) => {
  const lines = markdown.split("\n");
  if (lines.length === 0) return markdown;
  return [lines[0], "[[toc]]", ...lines.slice(1)].join("\n");
};

/**
 * Append the referred documents to the markdown.
 */
export const appendReferred = (
  markdown: string,
  referred: Reference[],
  dict: DocumentDict,
) => {
  if (referred.length === 0) return markdown;

  const referredList = referred.map(({ document, sentences }) =>
    `- [[${document.filename}]]${
      sentences.map((sentence) => `\n  - > ${sentence}`).join("")
    }`
  ).join("\n");

  return labelInternalLinks(
    `${markdown}\n\n## 이 문서를 인용한 문서\n\n${referredList}`,
    dict,
  );
};

/**
 * Find the sentences that refer to the word.
 */
export const findReferredSentences = (
  markdown: string,
  word: string,
  dict: DocumentDict,
) => {
  return markdown.split(/(?<!\{[}]*)(?<=다\.|[가까]\?\s)(?![}]*\})|\n/)
    .map((sentence) =>
      sentence.trim().replace(/^(-\s|\*\s|\d\.\s|>\s|#+\s)/g, "").trim()
    )
    .filter((sentence) => sentence.includes(`[[${word}]]`))
    .map((sentence) => labelInternalLinks(sentence, dict))
    // .map(sentence => sentence.replace(/\[\[(.+)\]\]\{(.+)\}/g, (_match, _p1, p2) =>
    //   p2.replace(new RegExp(dict[word].title, 'g'), `**${dict[word].title}**`)
    // )) // Enable this block to highlight the word only if it is the title.
    .map((sentence) =>
      sentence.replace(
        new RegExp(`\\[\\[${word}\\]\\]\\{(.+?)\\}`, "g"),
        "<b>$1</b>",
      )
    )
    .filter((sentence) =>
      sentence !== `<b>${dict[word].title}</b>` && sentence.length > 0
    ) ?? [];
};

/**
 * Find the filenames with type of the sub-documents.
 *
 * ```
 * findSubdocs('## 하위문서\n- [[a]]\n- [[b]]{B}')
 * // [{ filename: 'a', type: 'subject' }, { filename: 'b', type: 'subject' }]
 * ```
 */
export const findSubdocs = (markdown: string, type: Document["type"]) => {
  const subdocs: { filename: string; type: Document["type"] }[] = [];
  const subdocSection = /## 하위문서\s*\n+([\s\S]*?)(?=\n##\s|$)/.exec(
    markdown,
  );

  if (!subdocSection) return subdocs;

  let isPublicationSeciton = false;
  for (const line of subdocSection[1].trim().split("\n")) {
    if (line.trim() === "### 문헌") isPublicationSeciton = true;

    const match = line.match(/(-|\*) \[\[(.*?)\]\]/);
    if (match) {
      subdocs.push({
        filename: match[2],
        type: isPublicationSeciton ? "publication" : type,
      });
    }
  }

  return subdocs;
};

/**
 * Label the internal links in the markdown.
 *
 * ```
 * labelInternalLinks('[[a]] [[b]]{B} [[c]]', ..., ...)
 * // '[[a]]{A} [[b]]{B} [[c]]{C}'
 * ```
 */
export const labelInternalLinks = (
  markdown: string,
  dict: DocumentDict,
  parent?: string,
) => {
  let newMarkdown = markdown;

  newMarkdown = newMarkdown.replace(
    /\[\[([^\]]+)\]\](\{[^}]+\})?/g,
    (match, link, label) => {
      try {
        if (!dict[link]) {
          throw new Error(`Unresolved internal link: ${match} in ${parent}.md`);
        }

        if (label) return match; // Do not label the link if it is already labeled.

        return `${match}{${dict[link].title}}`;
      } catch (e: any) {
        Log.warn(e.message);
        if (label) return `[[http-404]]${label}`;
        if (link.startsWith("private/")) {
          return `[[http-404]]{${link.replace(/./g, "*")}}`;
        }
        return `[[http-404]]{${link}}`;
      }
    },
  );

  return newMarkdown;
};

/**
 * Find the documents this markdown references.
 *
 * ```
 * findReferred('[[a]] [[b]]{B} [[c]]')
 * // ['a', 'b', 'c']
 * ```
 */
export const findReferences = (markdown: string) => {
  return [
    ...new Set([
      ...markdown.match(LINK_REGEX)?.map(
        (link) => link.replace(/(\[\[)|(\]\])/g, ""),
      ) || [],
      ...markdown.match(LABELED_LINK_REGEX)?.map(
        (link) => link.replace(/(\[\[)|(\]\])|({(.+?)})/g, ""),
      ) || [],
    ]),
  ];
};

/**
 * Validate the markdown document.
 */
export const validate = (markdown: string) => {
  if (!markdown.startsWith("# ")) {
    throw new Error("The document must start with a header.");
  }
  return true;
};
