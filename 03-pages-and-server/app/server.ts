// Your backend. The default export is the shape Bun already runs
// (`export default { fetch }`), plus optional `routes` and `websocket`.
// You never call Bun.serve: `bun bake` and `dist/server.js` start the server.
export default {
  // Matched natively, next to Bake's page routes.
  routes: {
    "/api/hello": () => Response.json({ hi: 1 }),
    "/health": new Response("ok"),
  },

  // Only for URLs that no page and no route matched.
  fetch(req: Request, server: Bun.Server<undefined>) {
    if (new URL(req.url).pathname === "/chat" && server.upgrade(req)) return;
    return new Response("Not found", { status: 404 });
  },

  websocket: {
    message(ws: Bun.ServerWebSocket<undefined>, msg: string | Buffer) {
      ws.send(msg);
    },
  },
};
