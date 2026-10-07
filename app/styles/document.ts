import { css, rawCssString } from "hono/css";
import { scopes } from "./scopes.ts";
import { externalLinkIcons } from "./external-links.ts";

const { document: article } = scopes;
const homeTitle = rawCssString(
  `${article.root}[data-document="simonpedia"] > h1::before`,
);

const rules = {
  layout: css`
    ${article.root} {
      margin-top: var(--document-gap);
    }

    ${article.root} [id] {
      scroll-margin-top: calc(var(--navigation-height) + var(--document-gap));
    }
  `,

  typography: css`
    ${article.within} h1,
      ${article.within} h2,
      ${article.within} h3,
      ${article.within} h4,
      ${article.within} h5,
      ${article.within} h6 {
      margin: 16px 0 0 0;
      font-weight: 800;
      line-height: 1.15;
    }
    ${article.within} h1 {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: -0.04em;
    }
    ${article.within} h2 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-top: 32px;
    }
    ${article.within} h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin-top: 24px;
    }
    ${article.within} b,
      ${article.within} strong {
      font-weight: 600;
    }
    ${article.within} hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 32px 0 0 0;
    }
    ${article.within} p {
      margin: 16px 0 0 0;
    }
    ${article.within} code {
      font-family: 'Consolas', 'Monaco', 'Ubuntu Mono', 'Andale Mono', monospace;
    }
  `,

  images: css`
    ${article.within} img {
      box-sizing: initial;
      max-width: 100%;
      max-height: 600px;
      display: block;
      border: 1px solid var(--border-secondary);
      margin: 16px 0 0 0;
    }
    ${article.within} img + em {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  `,

  lists: css`
    ${article.within} ol,
      ${article.within} ul {
      padding-left: 24px;
      margin: 16px 0 0 0;
    }
    ${article.within} ul > li,
      ${article.within} ol > li {
      line-height: 1.6;
    }
    ${article.within} ol ol,
      ${article.within} ol ul,
      ${article.within} ul ol,
      ${article.within} ul ul {
      margin-top: 0;
    }
  `,

  inlineCode: css`
    ${article.within} li > code,
      ${article.within} p > code {
      padding: 2px 6px;
      margin: 0;
      font-size: 15px;
      background-color: var(--code-bg);
    }
  `,

  callouts: css`
    ${article.within} blockquote {
      margin: 16px 0 0 0;
      padding: 0 20px;
      color: var(--text-secondary);
      border-left: 2px solid var(--border);
    }
    ${article.within} .INFO {
      margin: 16px 0 0 0;
      padding: 0 16px;
      color: var(--text-secondary);
      border-left: 2px solid var(--block-info-border);
    }
    ${article.within} .NOTE {
      padding: 12px 16px;
      background-color: var(--block-note-bg);
      color: var(--block-note-text);
      margin: 16px 0 0 0;
      border-left: 2px solid var(--block-note-border);
    }
    ${article.within} .NOTE > p:first-child {
      margin: 0;
    }
    ${article.within} blockquote a,
      ${article.within} .NOTE a {
      color: var(--link-secondary);
    }
    ${article.within} blockquote a.external,
      ${article.within} .NOTE a.external {
      color: var(--link-external-secondary);
    }
  `,

  codeBlocks: css`
    ${article.within} pre.shiki {
      overflow-x: auto;
      font-size: 14px;
      line-height: 1.5;
      padding: 12px 16px;
      margin: 16px 0 0 0;
    }
  `,

  math: css`
    ${article.within} .katex-display {
      background-color: var(--code-bg);
      padding: 12px 16px;
      overflow: auto;
      margin: 16px 0 0 0;
    }
    ${article.within} .katex {
      font-size: 1em!important;
    }
    ${article.within} eq {
      display: inline-block;
    }
    ${article.within} eqn {
      display: block;
    }
    ${article.within} section.eqno {
      display: flex;
      flex-direction: row;
      align-content: space-between;
      align-items: center;
    }
    ${article.within} section.eqno > eqn {
      width: 100%;
      margin-left: 3em;
    }
    ${article.within} section.eqno > span {
      width: 3em;
      text-align: right;
    }
  `,

  diagrams: css`
    ${article.within} div.mermaid {
      margin: 16px 0 0 0;
    }
    ${article.within} [data-container="global-graph"] {
      --graph-subject: #6682a6;
      --graph-publication: #7b956a;
      --graph-idea: #b08a62;
      width: 100%;
      aspect-ratio: 1 / 1;
      border: 1px solid var(--border-secondary);
      margin: 16px 0 0 0;
    }
    ${article.within} [data-container="global-graph"] svg {
      width: 100%;
      height: 100%;
    }
  `,

  tableOfContents: css`
    ${article.within} .table-of-contents {
      border-left: 1px solid var(--border);
      font-size: 15px;
      line-height: 1.6;
      margin: 24px 0 32px 0;
    }
    ${article.within} .table-of-contents ul {
      list-style-type: none;
      counter-reset: item;
      margin: 0;
      padding-left: 16px;
    }
    ${article.within} .table-of-contents ul li:before {
      content: counters(item, ".") ". ";
      counter-increment: item;
      color: var(--text-secondary);
      font-feature-settings: "tnum";
    }
  `,

  footnotes: css`
    ${article.within} .footnotes > .footnotes-list {
      padding: 0;
      counter-reset: list;
      font-size: 13px;
    }
    ${article.within} .footnotes > .footnotes-list > .footnote-item {
      list-style-position: inherit;
      list-style: none;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    ${article.within} .footnotes > .footnotes-list > .footnote-item:before {
      content: "[" counter(list) "] ";
      counter-increment: list;
      color: var(--text-secondary);
      font-feature-settings: "tnum";
    }
    ${article.within} .footnotes > .footnotes-list > .footnote-item > p {
      display: inline;
    }
  `,

  tables: css`
    ${article.within} table {
      border-collapse: collapse;
      border-spacing: 0;
      margin: 16px 0 0 0;
      font-size: 15px;
    }
    ${article.within} table th {
      font-weight: 600;
    }
    ${article.within} table th,
      ${article.within} table td {
      padding: 8px 16px;
      border: 1px solid var(--border);
    }
    ${article.within} table th {
      background-color: var(--code-bg);
    }
    ${article.within} table tr {
      background-color: #ffffff;
    }
    ${article.within} table tr:hover {
      background-color: var(--code-bg);
    }
  `,

  branding: css`
    ${homeTitle} {
      content: '';
      display: inline-block;
      background: url('/assets/logo.svg') center / contain no-repeat;
    }
    ${homeTitle} {
      width: 2rem;
      height: 2rem;
      vertical-align: -0.2rem;
    }
  `,

  externalLinkMarker: css`
    ${article.root} a.external:before {
      background-color: var(--link-external);
      vertical-align: middle;
      width: .8rem;
      height: .8rem;
      margin: 0 .2rem .2rem;
      display: inline-block;
    }
  `,

  flowSpacing: css`
    ${article.root} > *:first-child,
      ${article.within} li > *:first-child {
      margin-top: 0;
    }
    ${article.within} li div.NOTE,
      ${article.within} li blockquote p,
      ${article.within} li pre.shiki {
      margin: 0;
    }
  `,

  externalLinkIcons,
} satisfies Record<string, ReturnType<typeof css>>;

export const documentStyles = css`${Object.values(rules)}`;
