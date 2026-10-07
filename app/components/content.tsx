import { raw } from "hono/html";
import { Breadcrumb, Document } from "@simpesys/core";
import { Anchor } from "./anchor.tsx";
import { scopes } from "../styles/scopes.ts";
import {
  CodeFileIcon,
  GitHubIcon,
  SidebarCloseIcon,
  SidebarOpenIcon,
} from "./icons.tsx";

interface Props {
  document: Document;
}

export function Content({ document }: Props) {
  return (
    <>
      <header class={scopes.header.className} role="navigation">
        <div id="search" class={scopes.search.className} hx-preserve="true">
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
        <div data-document-navigation="">
          <div>
            <div class="sidebar-toggle" hx-on:click="toggleSidebar()">
              <SidebarCloseIcon size={16} />
              <SidebarOpenIcon size={16} />
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
              class="icon external"
              href={`https://github.com/parksb/pedia/commits/master/docs/${document.filename}.md`}
              target="_blank"
            >
              <GitHubIcon size={15} />
            </a>
            <a
              class="icon external"
              href={`https://raw.githubusercontent.com/parksb/pedia/master/docs/${document.filename}.md`}
              target="_blank"
            >
              <CodeFileIcon size={14} />
            </a>
          </div>
        </div>
      </header>
      <article
        class={scopes.document.className}
        data-document={document.filename}
      >
        {raw(document.html)}
      </article>
    </>
  );
}
