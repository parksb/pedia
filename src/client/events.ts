import { pathname, scrollToActive, select, toggleSidebar } from "./dom.ts";

/**
 * Initialize the app on DOMContentLoaded
 */
function onDOMContentLoaded(): void {
  if (self.innerWidth < 800) toggleSidebar();
  (htmx.find("#search > input") as HTMLInputElement).value = "";
  scrollToActive();
}

/**
 * Handle htmx:afterSwap event
 */
function onAfterSwap(): void {
  document.title = htmx.find("article > h1").textContent || "";
  mermaid.run({ querySelector: "article div.mermaid" });
  select(pathname());
}

/**
 * Handle htmx:historyRestore event
 */
function onHistoryRestore(): void {
  select(pathname());
  scrollToActive();
}

/**
 * Register all event listeners
 */
export function registerEvents(): void {
  document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
  document.body.addEventListener("htmx:afterSwap", onAfterSwap);
  document.body.addEventListener("htmx:historyRestore", onHistoryRestore);
}
