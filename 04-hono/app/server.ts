import { Hono } from "hono";

const hono = new Hono();

hono.get("/api/hello", c => c.json({ hi: 1 }));
hono.post("/api/echo", async c => c.json(await c.req.json()));
hono.notFound(c => c.text("Not found", 404));

// A Hono app has `.fetch`, so it is a valid default export.
// Pages are not mounted here: Bake serves them natively before Hono runs.
export default hono;
