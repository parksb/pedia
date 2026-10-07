export const scopes = {
  document: defineScope("article", "document-body"),
  header: defineScope("header", "page-header"),
  sidebar: defineScope("aside", "page-sidebar"),
  main: defineScope("main", "page-main"),
  footer: defineScope("footer", "page-footer"),
  search: defineScope("#search", "document-search"),
  documentList: defineScope("#list", "document-list"),
} as const;

function defineScope<const ClassName extends string>(
  element: string,
  className: ClassName,
) {
  const classSelector = `.${className}`;

  const withinSelector = element.startsWith("#")
    ? `${element}${classSelector}`
    : classSelector;

  return {
    className,
    root: `${element}:where(${classSelector})`,
    within: `:where(${withinSelector})`,
  } as const;
}
