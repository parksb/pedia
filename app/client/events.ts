import { initContainers } from "./container.ts";
import { pathname, scrollToActive, select, toggleSidebar } from "./dom.ts";

let sidebarFrame: number | null = null;

function syncSidebar(): void {
  if (sidebarFrame !== null) return;
  sidebarFrame = requestAnimationFrame(() => {
    sidebarFrame = null;
    const header = document.querySelector("header");
    const scroll = document.querySelector<HTMLElement>("[data-sidebar-scroll]");
    if (!header || !scroll) return;

    const offset = `${Math.max(0, header.getBoundingClientRect().top)}px`;
    if (
      document.body.style.getPropertyValue("--navigation-offset") !== offset
    ) {
      document.body.style.setProperty("--navigation-offset", offset);
    }
    scroll.toggleAttribute(
      "data-scroll-end",
      Math.ceil(scroll.scrollTop + scroll.clientHeight) >= scroll.scrollHeight,
    );
  });
}

/**
 * Initialize the app on DOMContentLoaded
 */
function onDOMContentLoaded(): void {
  if (self.innerWidth < 800) toggleSidebar();
  (htmx.find("#search > input") as HTMLInputElement).value = "";
  scrollToActive();
  initContainers();
  const scroll = document.querySelector("[data-sidebar-scroll]");
  scroll?.addEventListener(
    "scroll",
    syncSidebar,
    { passive: true },
  );
  if (scroll) new ResizeObserver(syncSidebar).observe(scroll);
  syncSidebar();
}

/**
 * Handle htmx:afterSwap event
 */
function onAfterSwap(event: Event): void {
  syncSidebar();
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
  syncSidebar();
}

/**
 * Register all event listeners
 */
export function registerEvents(): void {
  document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
  document.body.addEventListener("htmx:afterSwap", onAfterSwap);
  document.body.addEventListener("htmx:historyRestore", onHistoryRestore);
  self.addEventListener("scroll", syncSidebar, { passive: true });
  self.addEventListener("resize", syncSidebar);
}
