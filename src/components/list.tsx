import { Document } from "../types.ts";
import { Anchor } from "./anchor.tsx";

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
          <Anchor href={x.filename} label={x.title} />
        </li>
      ))}
    </ul>
  );
}
