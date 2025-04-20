import { promises as fs } from 'fs';
import * as path from 'path';

export const WEBSITE_DOMAIN = 'https://pedia.parksb.xyz';
export const MARKDOWN_DIRECTORY_PATH: string = path.join(__dirname, '../../docs');
export const DIST_DIRECTORY_PATH: string = path.join(__dirname, '../../build.tmp');
export const TEMPLATE_DIR_PATH = path.join(__dirname, '../templates');
export const APP_TEMPLATE_FILE = (async () => fs.readFile(path.join(TEMPLATE_DIR_PATH, 'app.ejs')))();
export const DOC_TEMPLATE_FILE = (async () => fs.readFile(path.join(TEMPLATE_DIR_PATH, 'document.ejs')))();
export const SWAP_TEMPLATE_FILE = (async () => fs.readFile(path.join(TEMPLATE_DIR_PATH, 'swap.ejs')))();
export const SITEMAP_PATH = `${DIST_DIRECTORY_PATH}/sitemap.xml`;

export const LINK_REGEX = /\[\[(.+?)\]\]/g;
export const LABELED_LINK_REGEX = /\[\[(.+?)\]\]\{(.+?)\}/g;
