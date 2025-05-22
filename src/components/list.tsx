import { Document } from "../types.ts";

interface Props {
  documents: Document[];
  document?: Document;
}

export function List({ documents, document }: Props) {
  return (
    <ul>
      {documents.map((x: Document) => (
        <li
          data-key={x.filename}
          class={x.filename === document?.filename ? "active" : ""}
        >
          <a
            title={x.title}
            href={`/${x.filename}`}
            hx-push-url={`/${x.filename}`}
            hx-get={`/swap/${x.filename}`}
            hx-target="#main"
            hx-swap="show:top"
          >
            {x.type === "publication" ? `『${x.title}』` : x.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
