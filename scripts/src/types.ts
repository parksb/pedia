export interface Document {
  title: string;
  filename: string; // without extension
  html: string;
  markdown: string;
  breadcrumbs: string[]; // without extension
  children: Document[];
  parent?: Document;
  referred: Reference[];
}

export interface SearchIndex {
  title: string;
  filename: string; // without extension
  text: string;
}

export interface Reference {
  document: Document;
  sentences: string[];
}

export type DocumentDict = { [key: string]: Document }
