import "./containers/graph.ts";
import { pathname, scrollToActive, select, toggleSidebar } from "./dom.ts";
import { registerEvents } from "./events.ts";

declare global {
  interface Window {
    pathname: typeof pathname;
    select: typeof select;
    scrollToActive: typeof scrollToActive;
    toggleSidebar: typeof toggleSidebar;
  }
}

self.pathname = pathname;
self.select = select;
self.scrollToActive = scrollToActive;
self.toggleSidebar = toggleSidebar;

registerEvents();
