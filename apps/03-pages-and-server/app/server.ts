// Runs on the server. The default framework loads this file.
// You never call Bun.serve.
export default {
  // Matched first, by the default framework.
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
