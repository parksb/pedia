/**
 * Get the current pathname, returning "simonpedia" for root or the cleaned pathname
 */
export function pathname(): string {
  const { pathname } = self.location;
  if (pathname === "/") return "simonpedia";
  return pathname ? pathname.replace(/^\//, "").replace(/\.html$/, "") : "";
}

/**
 * Mark a list item as active by its key
 */
export function select(key: string): boolean {
  htmx
    .findAll("#list > ul > li")
    .forEach((el) => htmx.removeClass(el, "active"));
  htmx.addClass(htmx.find(`#list > ul > li[data-key="${key}"]`), "active");
  return true;
}

/**
 * Scroll the active list item into view
 */
export function scrollToActive(): boolean {
  const active = htmx.find("#list > ul > li.active");
  const container = active?.closest<HTMLElement>("[data-sidebar-scroll]");
  if (!container || !container.clientHeight) return true;

  container.scrollTop += active.getBoundingClientRect().top -
    container.getBoundingClientRect().top -
    (container.clientHeight - active.offsetHeight) / 2;
  return true;
}

/**
 * Toggle the sidebar visibility
 */
export function toggleSidebar(): boolean {
  htmx.toggleClass("aside", "hidden");
  return true;
}
