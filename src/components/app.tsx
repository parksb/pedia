import { Document } from "../types.ts";
import { Content } from "./content.tsx";
import { List } from "./list.tsx";

interface Props {
  documents: Document[];
  document: Document;
}

export function App({ documents, document }: Props) {
  return (
    "<!DOCTYPE html>" +
    (
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <title>{document.title}</title>

          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <meta name="theme-color" content="#ffffff" />
          <meta property="og:title" content="Simonpedia" />
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
            href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"
          />
          <link rel="stylesheet" href="/assets/index.css" />
        </head>
        <body>
          <aside>
            <input
              type="search"
              name="q"
              placeholder="🔍"
              hx-get="/search"
              hx-trigger="keyup changed delay:200ms"
              hx-target="#list"
              hx-swap="innerHTML"
            />
            <div id="list">
              <List documents={documents} document={document} />
            </div>
          </aside>
          <main>
            <section id="main" hx-history-elt>
              <Content document={document} />
            </section>
            <footer>
              <small>© 박성범</small>
            </footer>
          </main>
          <script src="https://unpkg.com/htmx.org@2.0.4"></script>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">
          </script>
          <script src="/assets/index.js"></script>
        </body>
      </html>
    )
  );
}
