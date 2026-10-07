import { css } from "hono/css";
import { scopes } from "./scopes.ts";

const { header, sidebar, main, footer, search, documentList } = scopes;
const collapsedHeader = `${sidebar.root}.hidden ~ ${main.root} ${header.root}`;
const collapsedSearch = `${collapsedHeader} ${search.root}`;
const documentNavigation = `${header.root} > [data-document-navigation]`;
const headerFade = `${header.root}::after`;
const contentSlot = `${main.root} > #main`;
const hiddenSidebar = `${sidebar.within}.hidden`;
const sidebarScroll = `${sidebar.root} > [data-sidebar-scroll]`;
const sidebarScrollbar = `${sidebarScroll}::-webkit-scrollbar`;
const sidebarScrollEnd = `${sidebarScroll}[data-scroll-end]`;
const revealedSidebarScroll =
  `${sidebarScroll}:has(${documentList.root} > ul > li > a:is(:hover, :focus-visible))`;
const revealedTitles =
  `${documentList.root} > ul > li > a:is(:hover, :focus-visible)`;

const rules = {
  header: css`
    ${header.root} {
      position: sticky;
      top: 0;
      z-index: 3;
      background-color: var(--bg);
      line-height: 1;
      display: grid;
      grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
      column-gap: var(--column-gap);
      width: calc(100% + var(--sidebar-width) + var(--column-gap));
      margin-left: calc(-1 * (var(--sidebar-width) + var(--column-gap)));
      height: var(--navigation-height);
      flex-shrink: 0;
    }

    ${headerFade} {
      content: '';
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      height: 16px;
      background: linear-gradient(to bottom, var(--bg), transparent);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      mask-image: linear-gradient(to bottom, #000, transparent);
      pointer-events: none;
    }

    ${documentNavigation} ,
      ${documentNavigation} > div {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    ${documentNavigation} {
      justify-content: space-between;
      gap: 16px;
    }

    ${collapsedHeader} {
      grid-template-columns: minmax(0, 1fr);
      width: 100%;
      margin-left: 0;
    }

    ${collapsedSearch} {
      display: none;
    }

    ${header.root} ul {
      display: inline;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    ${header.root} ul > li {
      display: inline;
      line-height: inherit;
    }

    ${header.root} ul > li:not(:last-child):after {
      content: '/';
      margin: 0 6px;
      color: var(--text-secondary);
    }

    ${header.root} div.meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    ${header.root} .sidebar-toggle {
      padding: 8px 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    ${header.root} .sidebar-toggle:hover {
      color: var(--text);
    }

    ${header.root} .sidebar-toggle > svg:last-child {
      display: none;
    }

    ${collapsedHeader} .sidebar-toggle > svg:first-child {
      display: none;
    }

    ${collapsedHeader} .sidebar-toggle > svg:last-child {
      display: inline;
    }

    ${header.root} .breadcrumbs {
      margin-left: 16px;
      min-width: 0;
      line-height: 1.6;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    ${header.root} .breadcrumbs a {
      color: var(--text-secondary);
      text-decoration: none;
    }

    ${header.root} .breadcrumbs a:hover {
      text-decoration: underline;
    }

    ${header.root} .breadcrumbs li:last-child a {
      color: var(--text);
      font-weight: 500;
    }
  `,

  sidebar: css`
    ${sidebar.root} {
      --title-width: var(--sidebar-width);
      --sidebar-fade: 16px;
      position: sticky;
      z-index: 2;
      top: var(--navigation-height);
      margin-top: var(--navigation-height);
      margin-bottom: calc(var(--navigation-offset, var(--page-top)) -
        var(--page-top));
      height: calc(100dvh - var(--navigation-height) - var(--page-top) -
        var(--navigation-offset, var(--page-top)));
      min-height: 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      flex: 0 0 var(--sidebar-width);
    }

    ${sidebarScroll} {
      --sidebar-bottom-fade: var(--sidebar-fade);
      flex: 1;
      min-height: 0;
      width: 100%;
      box-sizing: border-box;
      padding: var(--sidebar-fade) 0 0;
      margin-top: calc(-1 * var(--sidebar-fade));
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scrollbar-width: none;
      mask-image: linear-gradient(to bottom, transparent, #000 var(--sidebar-fade),
        #000 calc(100% - var(--sidebar-bottom-fade)), transparent);
    }

    ${sidebarScrollEnd} {
      --sidebar-bottom-fade: 0px;
    }

    ${sidebarScrollbar} {
      display: none;
      width: 0;
      height: 0;
    }

    ${revealedSidebarScroll} {
      width: max-content;
      max-width: min(800px, calc(100vw - 96px));
    }
  `,

  documentList: css`
    ${documentList.root} > ul {
      width: max-content;
      min-width: 100%;
      list-style-type: none;
      margin: 0;
      padding: var(--document-gap) 0 0;
    }

    ${documentList.root} > ul > li {
      padding: 0;
      cursor: pointer;
    }

    ${documentList.root} > ul > li > a {
      display: block;
      width: var(--title-width);
      box-sizing: border-box;
      height: var(--sidebar-row-height);
      padding: 2px 0;
      font-size: 15px;
      color: var(--text-secondary);
      text-decoration: none;
      overflow: hidden;
      white-space: nowrap;
      mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);
      transition: background-color .15s;
    }

    ${revealedTitles} {
      width: max-content;
      min-width: var(--title-width);
      overflow: visible;
      mask-image: none;
      background-color: rgb(255 255 255 / .88);
      border-radius: 4px;
    }

    ${documentList.root} > ul > li:hover > a {
      color: var(--text);
      text-decoration: none;
    }

    ${documentList.root} > ul > li.active > a {
      color: var(--text);
      font-weight: 500;
    }
  `,

  main: css`
    ${main.root} {
      display: flex;
      flex: 1 1 640px;
      flex-direction: column;
      min-width: 0;
      max-width: 640px;
      min-height: calc(100dvh - 2 * var(--page-top));
    }

    ${contentSlot} {
      display: contents;
    }
  `,

  footer: css`
    ${footer.root} {
      display: flex;
      align-items: center;
      min-height: var(--sidebar-row-height);
      line-height: 24px;
      margin-top: auto;
      padding-top: 32px;
    }
  `,

  iconLinks: css`
    ${header.within} a.icon {
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      text-decoration: none;
    }

    ${header.within} a.icon:hover {
      text-decoration: none;
    }

    ${header.within} a.icon.external:after {
      content: none;
    }

    ${header.within} a.icon.external:hover {
      color: var(--text);
    }
  `,

  search: css`
    ${search.root} {
      display: flex;
      height: var(--navigation-height);
      width: 100%;
      min-width: 0;
      font-size: 14px;
      flex-shrink: 0;
      border: 0;
    }

    ${search.root} > select {
      cursor: pointer;
      width: 40px;
      border: 0;
      outline: none;
      box-shadow: none;
      padding: 0;
      margin-right: 4px;
      background-color: transparent;
      color: var(--text);
      font-size: 13px;
    }

    ${search.within} input[type="search"] {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: none;
      box-shadow: none;
      padding: 0;
      color: var(--text);
      background-color: transparent;
      font-family: inherit;
      font-size: 14px;
    }

    ${search.within} input[type="search"]::placeholder {
      color: var(--text-secondary);
    }
  `,

  visibility: css`
    ${hiddenSidebar} {
      display: none;
    }
  `,

  responsive: css`
    @media (max-width: 799px) {
      body {
        --page-top: 24px;
        --sidebar-width: clamp(96px, 28vw, 140px);
        --column-gap: 16px;
        padding: var(--page-top);
      }

      ${revealedSidebarScroll} {
        max-width: 100%;
      }

      ${main.root} {
        width: 100%;
      }
    }

    @media (hover: none) {
      ${documentList.root} > ul > li > a {
        width: max-content;
        min-width: var(--title-width);
        mask-image: none;
      }
    }
  `,
} satisfies Record<string, ReturnType<typeof css>>;

export const interfaceStyles = css`${Object.values(rules)}`;
