export async function readFile(path: string | URL) {
  const decoder = new TextDecoder("utf-8");
  const file = await Deno.readFile(path);
  return decoder.decode(file);
}
