export interface Document {
  title: string;
  filename: string; // without extension
  html: string;
  markdown: string;
  breadcrumbs: Breadcrumb[];
  children: Document[];
  parent?: Document;
  referred: Reference[];
  type: "subject" | "publication";
}

export interface Breadcrumb {
  filename: string; // without extension
  title: string;
}

export interface Reference {
  document: Document;
  sentences: string[];
}

export type DocumentDict = Record<string, Document>;
