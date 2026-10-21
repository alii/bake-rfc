// SKETCH. Runs on the server, with the "react-server" condition.
// Flight wiring is simplified. No actions and no client navigation.
import { assets, files, load, ssrEntry } from "bun:bake";
import { renderToReadableStream } from "flight-placeholder/server";
import { reached } from "./stub.ts";

function findRoute(url: string) {
  for (const file of files()) {
    const pathname = file.replace(/^app\/routes|(\/index)?\.tsx?$/g, "").replace(/\[(\w+)\]/g, ":$1") || "/";
    const hit = new URLPattern({ pathname }).exec({ pathname: url });
    if (hit) return { file, params: hit.pathname.groups };
  }
}

export default {
  async fetch(request: Request) {
    const hit = findRoute(new URL(request.url).pathname);
    if (!hit) return new Response("Not found", { status: 404 });

    const page = await load(hit.file);
    if (!page.default) return page[request.method](request); // API route

    try {
      // An async page runs here, so await it first. notFound() must throw before streaming.
      const tree = await page.default({ params: hit.params, request });

      // Flight asks for scripts synchronously, so look them all up first. A client file
      // first reached by a lazy import during render is missing. See QUESTIONS.md.
      const ids = [...reached];
      const found = await Promise.all(ids.map(id => assets(id)));
      const scripts = new Map(ids.map((id, i) => [id, found[i]!]));
      const manifest = new Proxy({}, {
        get(_, key: string) {
          const at = key.lastIndexOf("#");
          const id = key.slice(0, at);
          return { id, name: key.slice(at + 1), chunks: scripts.get(id)?.js ?? [] };
        },
      });

      const flight = renderToReadableStream(tree, manifest);
      const { render } = await ssrEntry();
      return new Response(await render(flight, ids, found), { headers: { "content-type": "text/html" } });
    } catch (thrown) {
      if (thrown instanceof Response) return thrown;
      throw thrown;
    }
  },
};
