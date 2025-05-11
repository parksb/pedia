function pathname() {
	const { pathname } = window.location;
	return pathname ? pathname.replace(/^\//, "").replace(/\.html$/, "") : null;
}

function select(key) {
	htmx
		.findAll("aside > ul > li")
		.forEach((el) => htmx.removeClass(el, "active"));
	htmx.addClass(htmx.find(`aside > ul > li[data-key="${key}"]`), "active");
	return true;
}

function scrollToActive() {
	htmx.find("aside > ul > li.active").scrollIntoView({ block: "center" });
	return true;
}

function toggleSidebar() {
	htmx.toggleClass("aside", "hidden");
	return true;
}

document.addEventListener("DOMContentLoaded", () => {
	if (window.innerWidth < 800) toggleSidebar();
	htmx.find("aside > input").value = "";
	select(pathname());
	scrollToActive();
});

document.body.addEventListener("htmx:afterSwap", () => {
	mermaid.run({ querySelector: "article div.mermaid" });
});

document.body.addEventListener("htmx:historyRestore", () => {
	select(pathname());
	scrollToActive();
});
