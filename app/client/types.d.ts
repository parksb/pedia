interface Htmx {
  findAll(selector: string): HTMLElement[];
  find(selector: string): HTMLElement;
  addClass(element: HTMLElement | null, className: string): void;
  removeClass(element: HTMLElement | null, className: string): void;
  toggleClass(selector: string, className: string): void;
  ajax(
    method: string,
    url: string,
    options?: { target?: string; swap?: string },
  ): void;
  process(element: HTMLElement): void;
}

interface Mermaid {
  run({ querySelector }: { querySelector: string }): void;
}

declare global {
  const htmx: Htmx;
  const mermaid: Mermaid;
  // deno-lint-ignore no-explicit-any
  const d3: any;
}

export {};
