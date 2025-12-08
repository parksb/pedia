interface Htmx {
  findAll(selector: string): HTMLElement[];
  find(selector: string): HTMLElement;
  addClass(element: HTMLElement | null, className: string): void;
  removeClass(element: HTMLElement | null, className: string): void;
  toggleClass(selector: string, className: string): void;
}

interface Mermaid {
  run({ querySelector }: { querySelector: string }): void;
}

declare global {
  const htmx: Htmx;
  const mermaid: Mermaid;
}

export {};
