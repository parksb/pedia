function pathname() {
  const { pathname } = window.location;
  if (pathname === "/") return "simonpedia";
  return pathname ? pathname.replace(/^\//, "").replace(/\.html$/, "") : null;
}

function select(key) {
  htmx
    .findAll("#list > ul > li")
    .forEach((el) => htmx.removeClass(el, "active"));
  htmx.addClass(htmx.find(`#list > ul > li[data-key="${key}"]`), "active");
  return true;
}

function scrollToActive() {
  htmx.find("#list > ul > li.active").scrollIntoView({ block: "center" });
  return true;
}

function toggleSidebar() {
  htmx.toggleClass("aside", "hidden");
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 800) toggleSidebar();
  htmx.find("#search > input").value = "";
  scrollToActive();
});

document.body.addEventListener("htmx:afterSwap", () => {
  document.title = htmx.find('article > h1').textContent;
  mermaid.run({ querySelector: "article div.mermaid" });
  select(pathname());
});

document.body.addEventListener("htmx:historyRestore", () => {
  select(pathname());
  scrollToActive();
});
