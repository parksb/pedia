import { raw } from "hono/html";
import { Breadcrumb, Document } from "@simpesys/core";
import { Anchor } from "./anchor.tsx";
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
    <div>
      <header role="navigation">
        <div>
          <div class="sidebar-toggle" hx-on:click="toggleSidebar()">
            <SidebarCloseIcon />
            <SidebarOpenIcon />
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
            <GitHubIcon size={18} />
          </a>
          <a
            class="icon external"
            href={`https://raw.githubusercontent.com/parksb/pedia/master/docs/${document.filename}.md`}
            target="_blank"
          >
            <CodeFileIcon size={17} />
          </a>
        </div>
      </header>
      <article>{raw(document.html)}</article>
    </div>
  );
}
