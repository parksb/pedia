import { Context, Hono } from "hono";
import { logger } from 'hono/logger'
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

app.use(logger())

app.use("/robots.txt", serveStatic({ root: "./public" }));

app.use("/googleb1e5dbcc1d32e7b1.html", serveStatic({ root: "./public" }));

app.use("/assets/*", serveStatic({ root: "./" }));

app.use("/images/*", serveStatic({ root: "./docs/" }));

app.use("/private/images/*", serveStatic({ root: "./docs/" }));

app.get("/sitemap.xml", (c) => {
  c.header("Content-Type", "application/xml");
  return c.body(system.getSitemap());
});

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

app.get("/health", (c) => {
  return c.text("ok");
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  return documentResponse(id, c);
});

app.get("/", (c) => {
  return documentResponse("simonpedia", c);
});

Deno.serve(app.fetch);
