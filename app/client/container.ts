export interface ContainerHandler {
  init(el: HTMLElement): Promise<void> | void;
  destroy(): void;
}

type ContainerFactory = () => ContainerHandler;

const registry = new Map<string, ContainerFactory>();
const active = new Map<HTMLElement, ContainerHandler>();

const scriptPromises = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  let p = scriptPromises.get(src);
  if (p) return p;
  p = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = reject;
    document.head.appendChild(el);
  });
  scriptPromises.set(src, p);
  return p;
}

export function registerContainer(
  type: string,
  factory: ContainerFactory,
): void {
  registry.set(type, factory);
}

export function initContainers(): void {
  for (const [el, handler] of active) {
    if (!document.contains(el)) {
      handler.destroy();
      active.delete(el);
    }
  }
  for (const [type, factory] of registry) {
    for (
      const el of document.querySelectorAll<HTMLElement>(
        `[data-container="${type}"]`,
      )
    ) {
      if (!active.has(el)) {
        const handler = factory();
        handler.init(el);
        active.set(el, handler);
      }
    }
  }
}
