import type MarkdownIt from "markdown-it";
import { type DirectiveDefinition, directivePlugin } from "./directive.ts";

type Attributes = Readonly<Record<string, string>>;
type Output = Parameters<DirectiveDefinition["emit"]>[1];

const bibliographyDirective: DirectiveDefinition = {
  attributes: [
    "title",
    "author",
    "translator",
    "journal",
    "publisher",
    "year",
    "date",
    "pages",
  ],
  positional: ["title"],
  required: ["title"],
  validate: validateBibliography,
  emit: emitBibliography,
};

export function bibliographyPlugin(md: MarkdownIt): void {
  md.use(directivePlugin, { bib: bibliographyDirective });
}

function validateBibliography(attributes: Attributes): boolean {
  const hasYear = Object.hasOwn(attributes, "year");
  const hasDate = Object.hasOwn(attributes, "date");

  if (hasYear && hasDate) {
    return false;
  }

  for (const names of [attributes.author, attributes.translator]) {
    if (names && parseNames(names) === null) {
      return false;
    }
  }

  return true;
}

function emitBibliography(
  attributes: Attributes,
  output: Output,
): void {
  emitAuthors(output, attributes.author);
  emitTitle(output, attributes.title);
  emitTranslators(output, attributes.translator);
  emitPublicationDetails(output, attributes);
}

function emitAuthors(output: Output, author: string | undefined): void {
  if (!author) {
    return;
  }

  const authors = parseNames(author);

  if (authors) {
    output.text(`${authors.join(", ")}, `);
  }
}

function emitTitle(output: Output, title: string): void {
  output.open("cite", { class: "bibliography" });
  output.text(`『${title}』`);
  output.close("cite");
}

function emitTranslators(output: Output, translator: string | undefined): void {
  if (!translator) {
    return;
  }

  const translators = parseNames(translator);

  if (translators) {
    output.text(`, ${translators.join(", ")} 역`);
  }
}

function emitPublicationDetails(
  output: Output,
  attributes: Attributes,
): void {
  emitJournal(output, attributes.journal);
  emitPublisher(output, attributes.publisher);
  emitPublicationDate(output, attributes.year ?? attributes.date);
  emitPages(output, attributes.pages);
}

function emitJournal(output: Output, journal: string | undefined): void {
  if (journal) {
    output.text(`, ${journal}`);
  }
}

function emitPublisher(output: Output, publisher: string | undefined): void {
  if (!publisher) {
    return;
  }

  output.text(", ");
  output.open("em");
  output.text(publisher);
  output.close("em");
}

function emitPublicationDate(output: Output, date: string | undefined): void {
  if (date) {
    output.text(`, ${date}`);
  }
}

function emitPages(output: Output, pages: string | undefined): void {
  if (!pages) {
    return;
  }

  output.text(`, p. ${pages}`);
}

function parseNames(value: string): string[] | null {
  const names = splitNames(value);

  if (!names) {
    return null;
  }

  const contributors = names.map(removeNameBraces);
  const hasEmptyName = contributors.some((name) => !name.trim());

  if (hasEmptyName) {
    return null;
  }

  return contributors;
}

function splitNames(value: string): string[] | null {
  const names: string[] = [];
  let nameStart = 0;
  let depth = 0;

  for (let position = 0; position < value.length; position += 1) {
    depth = updateBraceDepth(depth, value[position]);

    if (depth < 0) {
      return null;
    }

    if (depth > 0 || value[position] !== ",") {
      continue;
    }

    names.push(value.slice(nameStart, position).trim());
    nameStart = position + 1;
  }

  if (depth !== 0) {
    return null;
  }

  names.push(value.slice(nameStart).trim());

  return names;
}

function removeNameBraces(name: string): string {
  if (!name.startsWith("{")) {
    return name;
  }

  if (findClosingBrace(name) !== name.length - 1) {
    return name;
  }

  return name.slice(1, -1).trim();
}

function findClosingBrace(value: string): number | null {
  let depth = 0;

  for (let position = 0; position < value.length; position += 1) {
    depth = updateBraceDepth(depth, value[position]);

    if (depth === 0) {
      return position;
    }
  }

  return null;
}

function updateBraceDepth(depth: number, character: string): number {
  if (character === "{") {
    return depth + 1;
  }

  if (character === "}") {
    return depth - 1;
  }

  return depth;
}
