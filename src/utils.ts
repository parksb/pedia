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
