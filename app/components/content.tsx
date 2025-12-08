import { raw } from "hono/html";
import { Breadcrumb, Document } from "@simpesys/core";
import { Anchor } from "./anchor.tsx";

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
                    <Anchor
                      href={breadcrumb.filename}
                      label={breadcrumb.title}
                      scrollTo
                    />
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
