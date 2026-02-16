import { initContainers } from "./container.ts";
import { pathname, scrollToActive, select, toggleSidebar } from "./dom.ts";

/**
 * Initialize the app on DOMContentLoaded
 */
function onDOMContentLoaded(): void {
  if (self.innerWidth < 800) toggleSidebar();
  (htmx.find("#search > input") as HTMLInputElement).value = "";
  scrollToActive();
  initContainers();
}

/**
 * Handle htmx:afterSwap event
 */
function onAfterSwap(event: Event): void {
  if ((event as CustomEvent).detail.target.id === "list") return;

  document.title = htmx.find("article > h1").textContent || "";
  mermaid.run({ querySelector: "article div.mermaid" });
  select(pathname());
  initContainers();
}

/**
 * Handle htmx:historyRestore event
 */
function onHistoryRestore(): void {
  select(pathname());
  scrollToActive();
  initContainers();
}

/**
 * Register all event listeners
 */
export function registerEvents(): void {
  document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
  document.body.addEventListener("htmx:afterSwap", onAfterSwap);
  document.body.addEventListener("htmx:historyRestore", onHistoryRestore);
}
