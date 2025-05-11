import * as path from "node:path";

export const WEBSITE_DOMAIN = "https://pedia.parksb.xyz";

export const MARKDOWN_DIRECTORY_PATH: string = path.join(
	import.meta.dirname!,
	"../../docs",
);

export const ASSETS_DIR_PATH = path.join(import.meta.dirname!, "../assets");

export const LINK_REGEX = /\[\[(.+?)\]\]/g;

export const LABELED_LINK_REGEX = /\[\[(.+?)\]\]\{(.+?)\}/g;
