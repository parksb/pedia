import { Style } from "hono/css";
import { globalStyles } from "../styles/index.ts";
import { scopes } from "../styles/scopes.ts";
import { WEBSITE_DOMAIN } from "../consts.ts";
import { Document } from "@simpesys/core";
import { Content } from "./content.tsx";
import { List } from "./list.tsx";

interface Props {
  documents: Document[];
  document: Document;
  js: string;
}

export function App({ documents, document, js }: Props) {
  return (
    "<!DOCTYPE html>" +
    (
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <title>{document.title}</title>

          <link
            rel="canonical"
            href={`${WEBSITE_DOMAIN}/${document.filename}`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="icon" href="/favicon.ico?v=2" sizes="16x16 32x32 48x48" />
          <link
            rel="icon"
            type="image/svg+xml"
            href="/assets/favicon.svg"
            sizes="any"
          />

          <meta name="fediverse:creator" content="@parksb@silicon.moe" />
          <meta property="og:title" content={document.title} />
          <meta
            property="og:url"
            content={`${WEBSITE_DOMAIN}/${document.filename}`}
          />
          <meta
            property="og:image"
            content="https://og-image.parksb.vercel.app/api/simonpedia"
          />

          <link rel="prefetch" href="https://unpkg.com/htmx.org@2.0.4" />
          <link
            rel="prefetch"
            href="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
          />

          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
          />
          <Style>{globalStyles}</Style>
        </head>
        <body>
          <aside class={scopes.sidebar.className}>
            <div id="search" class={scopes.search.className}>
              <input
                type="search"
                name="q"
                placeholder="Search..."
                hx-get="/search"
                hx-trigger="keyup changed delay:200ms"
                hx-target="#list"
                hx-swap="innerHTML"
              />
              <select
                name="o"
                hx-get="/search"
                hx-target="#list"
                hx-swap="innerHTML"
              >
                <option value="c" title="Newest">C</option>
                <option value="u" title="Recently updated">U</option>
                <option value="b" title="BFS">B</option>
              </select>
            </div>
            <div data-container="local-graph"></div>
            <div id="list" class={scopes.documentList.className}>
              <List documents={documents} document={document} />
            </div>
          </aside>
          <main class={scopes.main.className}>
            <section id="main" hx-history-elt>
              <Content document={document} />
            </section>
            <footer class={scopes.footer.className}>
              <small>© 박성범</small>
            </footer>
          </main>
          <script src="https://unpkg.com/htmx.org@2.0.4"></script>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">
          </script>
          <script dangerouslySetInnerHTML={{ __html: js }}></script>
        </body>
      </html>
    )
  );
}
