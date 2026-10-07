import { css } from "hono/css";
import { scopes } from "./scopes.ts";

const { header, sidebar, main, footer, search, documentList } = scopes;
const collapsedHeader = `${sidebar.root}.hidden ~ ${main.root} ${header.root}`;
const hiddenSidebar = `${sidebar.within}.hidden`;

const rules = {
  header: css`
    ${header.root} {
      position: sticky;
      top: 0;
      background-color: var(--header-bg);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-layout);
      line-height: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 40px;
    }

    ${header.root} > div {
      display: flex;
      align-items: center;
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
      margin-right: 8px;
      display: flex;
      align-items: center;
    }

    ${header.root} div.meta a {
      margin-right: 4px;
    }

    ${header.root} .sidebar-toggle {
      padding: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      color: var(--text-secondary);
      transition: color 0.1s;
    }

    ${header.root} .sidebar-toggle:hover {
      color: var(--link);
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
      padding: 0 8px 0 0;
      margin-left: 4px;
      display: flex;
      align-items: center;
    }

    ${header.root} .breadcrumbs a {
      color: var(--link);
    }

    ${header.root} .breadcrumbs li:last-child a {
      color: var(--text);
      font-weight: 500;
    }
  `,

  sidebar: css`
    ${sidebar.root} {
      overflow: scroll;
      flex: 0 0 240px;
      background-color: var(--bg);
      border-right: 1px solid var(--border-layout);
    }

    ${sidebar.root}::-webkit-scrollbar {
      width: 0;
    }
  `,

  documentList: css`
    ${documentList.root} > ul {
      list-style-type: none;
      margin: 0;
      padding: 8px 0;
    }

    ${documentList.root} > ul > li {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0;
      cursor: pointer;
      border-left: 2px solid transparent;
      transition: background-color 0.1s;
    }

    ${documentList.root} > ul > li > a {
      display: block;
      padding: 4px 12px;
      font-size: 15px;
      color: var(--text);
      transition: color 0.1s;
    }

    ${documentList.root} > ul > li:hover {
      background-color: rgba(0, 0, 0, 0.06);
    }

    ${documentList.root} > ul > li:hover > a {
      color: var(--text);
      text-decoration: none;
    }

    ${documentList.root} > ul > li.active {
      border-left-color: var(--link);
      background-color: rgba(3, 102, 214, 0.1);
    }

    ${documentList.root} > ul > li.active > a {
      color: var(--link);
      font-weight: 500;
    }
  `,

  main: css`
    ${main.root} {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: scroll;
    }
  `,

  footer: css`
    ${footer.root} {
      padding: 32px 40px;
    }
  `,

  iconLinks: css`
    ${header.within} a.icon {
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
    }

    ${header.within} a.icon:hover {
      text-decoration: none;
    }

    ${header.within} a.icon.external:after {
      content: none;
    }

    ${header.within} a.icon.external:hover {
      color: var(--link-external);
    }
  `,

  localGraph: css`
    ${sidebar.root} [data-container="local-graph"] {
      position: sticky;
      top: 40px;
      background-color: #ffffffa0;
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-layout);
      z-index: 1;
      height: 200px;
    }
  `,

  search: css`
    ${search.root} {
      display: flex;
      height: 40px;
      font-size: 14px;
      position: sticky;
      top: 0;
      background-color: #ffffffa0;
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-layout);
      z-index: 2;
    }

    ${search.root} > select {
      cursor: pointer;
      width: 40px;
      border: 0;
      padding: 0 8px;
      margin-right: 4px;
      background-color: transparent;
      color: var(--text);
      font-size: 13px;
    }

    ${search.within} input[type="search"] {
      flex: 1;
      width: 100%;
      border: 0;
      padding: 8px 16px;
      outline: none;
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
} satisfies Record<string, ReturnType<typeof css>>;

export const interfaceStyles = css`${Object.values(rules)}`;
