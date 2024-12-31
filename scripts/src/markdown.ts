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

import { DocumentDict, Reference } from './types';
import { LABELED_LINK_REGEX, LINK_REGEX } from './consts';

export const md: MarkdownIt = new MarkdownIt({
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

/**
 * Insert a table of contents at the beginning of the markdown.
 */
export const prependToc = (markdown: string) => {
  const match = markdown.match(/^(# .+?)(\n|$)/m);
  if (!match) return markdown;
  const headerIndex = match.index + match[0].length
  return `${markdown.slice(0, headerIndex)}\n[[toc]]\n${markdown.slice(headerIndex)}`;
};

/**
 * Append the referred documents to the markdown.
 */
export const appendReferred = (markdown: string, referred: Reference[], dict: DocumentDict) => {
  if (referred.length === 0) return markdown;

  const referredList = referred.map(({ document, sentences }) =>
    `- [[${document.filename}]]${sentences.map(sentence => `\n  - > ${sentence}`).join('')}`).join('\n');

  return labelInternalLinks(`${markdown}\n\n## 인용된 문서\n\n${referredList}`, dict);
};

/**
 * Find the sentences that refer to the word.
 */
export const findReferredSentences = (markdown: string, word: string, dict: DocumentDict) => {
  return markdown.split(/(?<!\{[}]*)(?<=다\.|[가까]\?\s)(?![}]*\})|\n/)
    .map(sentence => sentence.trim().replace(/^(-\s|\*\s|\d\.\s|>\s|#+\s)/g, '').trim())
    .filter(sentence => sentence.includes(`[[${word}]]`))
    .map(sentence => labelInternalLinks(sentence, dict))
    // .map(sentence => sentence.replace(/\[\[(.+)\]\]\{(.+)\}/g, (_match, _p1, p2) =>
    //   p2.replace(new RegExp(dict[word].title, 'g'), `**${dict[word].title}**`)
    // )) // Enable this block to highlight the word only if it is the title.
    .map(sentence => sentence.replace(/\[\[.+\]\]\{(.+)\}/g, '**$1**'))
    .filter(sentence => sentence !== `**${dict[word].title}**` && sentence.length > 0) ?? [];
};

/**
 * Find the filenames of the sub-documents.
 *
 * ```
 * findSubdocs('## 하위문서\n- [[a]]\n- [[b]]{B}')
 * // ['a', 'b']
 * ```
 */
export const findSubdocs = (markdown: string) => {
  const filenames = []
  const subdocSection = /## 하위문서\s*\n+([\s\S]*?)(?=\n##\s|$)/.exec(markdown);

  if (!subdocSection) return filenames;

  for (const line of subdocSection[1].trim().split('\n')) {
    const match = line.match(/(-|\*) \[\[(.*?)\]\]/);
    if (match) filenames.push(match[2]);
  }

  return filenames;
};

/**
 * Label the internal links in the markdown.
 *
 * ```
 * labelInternalLinks('[[a]] [[b]]{B} [[c]]', ..., ...)
 * // '[[a]]{A} [[b]]{B} [[c]]{C}'
 * ```
 */
export const labelInternalLinks = (markdown: string, dict: DocumentDict, parent?: string) => {
  let newMarkdown = markdown;

  newMarkdown = newMarkdown.replace(/\[\[([^\]]+)\]\](\{[^}]+\})?/g, (match, link, label) => {
    try {
      if (link.startsWith('private/') && !label) {
        console.warn(`Unlabeled private internal link: ${match} in ${parent}.md`);
      }

      if (!dict[link]) {
        throw new Error(`Unresolved internal link: ${match} in ${parent}.md`);
      }

      if (label) return match; // Do not label the link if it is already labeled.

      return `${match}{${dict[link].title}}`;
    } catch (e) {
      console.warn(e.message);
      if (label) return `[[http-404]]${label}`;
      return `[[http-404]]{${link}}`;
    }
  });

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
        (link) => link.replace(/(\[\[)|(\]\])/g, '')) || [],
      ...markdown.match(LABELED_LINK_REGEX)?.map(
        (link) => link.replace(/(\[\[)|(\]\])|({(.+?)})/g, '')) || [],
    ]),
  ];
};

/**
 * Validate the markdown document.
 */
export const validate = (markdown: string) => {
  if (!markdown.startsWith('# ')) throw new Error('The document must start with a header.');
  return true;
};
