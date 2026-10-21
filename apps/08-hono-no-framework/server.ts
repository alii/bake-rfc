import { Hono } from "hono";

const app = new Hono();

app.get("/", c => c.text("hello"));
app.get("/api/hello", c => c.json({ hi: 1 }));

// A Hono app has `.fetch`, so Bake can send requests to it.
export default app;
