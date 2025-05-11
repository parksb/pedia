import { Context, Hono } from "hono";
import { serveStatic } from "hono/deno";
import { System } from "./system.ts";

const system = await new System().init();
const app = new Hono();

const documentResponse = (id: string, c: Context, swap = false) => {
  let document = system.getDocument(id, swap);

  if (!document) {
    c.status(404);
    document = system.getDocument("http-404", swap)!;
  }

  return c.html(document);
};

app.use("/assets/*", serveStatic({ root: "./" }));

app.get("/swap/private/:id", (c) => {
  const id = `private/${c.req.param("id")}`;
  return documentResponse(id, c, true);
});

app.get("/search", (c) => {
  const query = c.req.query("q");
  return c.html(system.getList(query));
});

app.get("/swap/:id", (c) => {
  const id = c.req.param("id");
  return documentResponse(id, c, true);
});

app.get("/private/:id", (c) => {
  const id = `private/${c.req.param("id")}`;
  return documentResponse(id, c);
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  return documentResponse(id, c);
});

app.get("/", (c) => {
  return documentResponse("simonpedia", c);
});

Deno.serve(app.fetch);
