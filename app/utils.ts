import { Document } from "@simpesys/core";

export async function readFile(path: string | URL) {
  const decoder = new TextDecoder("utf-8");
  const file = await Deno.readFile(path);
  return decoder.decode(file);
}

export class Log {
  static info(message: string) {
    console.info(`[INFO] ${message}`);
  }

  static error(message: string) {
    console.error(`%c[ERROR] ${message}`, "color: red");
  }

  static warn(message: string) {
    console.warn(`%c[WARN] ${message}`, "color: yellow");
  }
}

export function sortBy(
  a: Document,
  b: Document,
  key: "createdAt" | "updatedAt",
) {
  const aDate = a[key]?.toString();
  const bDate = b[key]?.toString();
  if (aDate === undefined && bDate === undefined) {
    return -1;
  } else if (aDate === undefined) {
    return 1;
  } else if (bDate === undefined) {
    return -1;
  } else {
    return bDate.localeCompare(aDate);
  }
}
