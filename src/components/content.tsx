import { raw } from "hono/html";
import { Breadcrumb, Document } from "../types.ts";

interface Props {
  document: Document;
}

export function Content({ document }: Props) {
  return (
    <div>
      <header role="navigation">
        <div>
          <div class="sidebar-toggle" hx-on:click="toggleSidebar()">
            #
          </div>
          <div class="breadcrumbs">
            <small>
              <ul>
                {document.breadcrumbs.map((breadcrumb: Breadcrumb) => (
                  <li>
                    <a
                      href={`/${breadcrumb.filename}`}
                      hx-get={`/swap/${breadcrumb.filename}`}
                      hx-swap="show:top"
                      hx-target="#main"
                      hx-push-url={`/${breadcrumb.filename}`}
                      hx-on:click={`select("${breadcrumb.filename}") && scrollToActive()`}
                    >
                      {breadcrumb.title}
                    </a>
                  </li>
                ))}
              </ul>
            </small>
          </div>
        </div>
        <div class="meta">
          <a
            class="external"
            href={`https://github.com/parksb/pedia/commits/master/docs/${document.filename}.md`}
          >
            @
          </a>
          <a
            class="external"
            href={`https://raw.githubusercontent.com/parksb/pedia/master/docs/${document.filename}.md`}
          >
            M
          </a>
        </div>
      </header>
      <article>{raw(document.html)}</article>
    </div>
  );
}
