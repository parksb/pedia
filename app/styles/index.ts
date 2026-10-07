import { css } from "hono/css";
import { defaultStyles } from "./global.ts";
import { documentStyles } from "./document.ts";
import { interfaceStyles } from "./interface.ts";

const stylesheetSections = [defaultStyles, documentStyles, interfaceStyles];

export const globalStyles = css`${stylesheetSections}`;
