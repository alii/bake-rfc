// Runs on the server, in dev and in dist/server.js. Bake calls `fetch` and `prerender`.
// Routing, data, rendering, caching and 404s all live in this file.
import { assets, files, load, saved, type Assets, type Prerender } from "bun:bake";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { keep, kept, setRenderer } from "./cache.ts";
import { fill, isLayout, isRoute, layoutsOf, match, pathnameOf } from "./routes.ts";

const BACKEND = "app/server.ts";
const html = (body: BodyInit) => new Response(body, { headers: { "content-type": "text/html" } });

function findRoute(url: string) {
  for (const file of files().filter(isRoute)) {
    const params = match(pathnameOf(file), url);
    if (params) return { file, params };
  }
  return null;
}

// The app's own backend, if it has one. Loaded per request, so an edit takes effect.
async function backend(): Promise<any> {
  return files().includes(BACKEND) ? (await load(BACKEND)).default : {};
}

// Matched here, because the app's `routes` change when the file is edited.
async function backendRoute(app: any, request: Request, url: string, server: unknown) {
  for (const [path, handler] of Object.entries<any>(app.routes ?? {})) {
    const hit = new URLPattern({ pathname: path }).exec({ pathname: url });
    if (!hit) continue;
    if (handler instanceof Response) return handler.clone();
    const fn = typeof handler === "function" ? handler : handler[request.method];
    if (fn) return fn(Object.assign(request, { params: hit.pathname.groups }), server);
  }
  return null;
}

async function renderRoute(file: string, params: Record<string, string>, request: Request): Promise<Response> {
  if (file.endsWith(".html")) return html((await assets(file)).html!);

  const route = await load(file);

  // A file with no default export is an API route.
  if (!route.default) {
    const handler = route[request.method];
    return handler ? handler(request, { params }) : new Response("Method not allowed", { status: 405 });
  }

  // A kept page is shared by every visitor, so it gets no `request`.
  const shared = route.cache !== undefined && route.cache !== false;
  const data = route.server ? await route.server(shared ? { params } : { params, request }) : {};
  if (data instanceof Response) return data;
  const props = { ...data, params };

  const layouts = layoutsOf(file, files().filter(isLayout));
  const loaded = await Promise.all(layouts.map(layout => load(layout)));

  // Without `browser`, this file has no browser copy, so this gives only CSS and,
  // in dev, the hot reload runtime.
  const found = await assets(route.browser ? [file, ...layouts] : file);

  let tree: ReactNode = <route.default {...props} />;
  for (const layout of loaded.reverse()) tree = <layout.default>{tree}</layout.default>;

  const page = route.browser ? { files: [file, ...layouts], props } : null;
  return html(await renderToReadableStream(<Document assets={found} page={page}>{tree}</Document>));
}

function Document({ assets, page, children }: { assets: Assets; page: unknown; children: ReactNode }) {
  return (
    <html>
      <head>
        {assets.css.map(href => <link key={href} rel="stylesheet" href={href} />)}
      </head>
      <body>
        <div id="root">{children}</div>
        {page ? (
          <script
            id="bake-page"
            type="application/json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(page).replace(/</g, "\\u003c") }}
          />
        ) : null}
        {assets.js.map(src => <script key={src} type="module" src={src} />)}
      </body>
    </html>
  );
}

// Used by `revalidate(path)` and when a kept page goes stale.
setRenderer(async pathname => {
  const hit = findRoute(pathname);
  if (!hit) return null;
  const res = await renderRoute(hit.file, hit.params, new Request(new URL(pathname, "http://revalidate")));
  return res.ok ? res.text() : null;
});

async function pageOrCache(hit: { file: string; params: Record<string, string> }, request: Request, url: string) {
  const dev = process.env.NODE_ENV !== "production";
  if (dev || request.method !== "GET" || hit.file.endsWith(".html")) return renderRoute(hit.file, hit.params, request);

  const seconds = (await load(hit.file)).cache?.revalidate;
  if (!seconds) return renderRoute(hit.file, hit.params, request);

  // Memory first, then the copy the build saved, then render on this request.
  const page = kept(url) ?? (await saved(url));
  if (page != null) {
    if (kept(url) == null) keep(url, page, seconds);
    return html(page);
  }
  const res = await renderRoute(hit.file, hit.params, request);
  if (!res.ok) return res;
  const body = await res.text();
  keep(url, body, seconds);
  return html(body);
}

// `Bun.serve` wants `websocket` at start, and the backend can change. So forward.
const socket = async () => (await backend()).websocket;

export default {
  async fetch(request: Request, server: unknown): Promise<Response> {
    const url = new URL(request.url).pathname;
    const app = await backend();

    // 1. The app's own `routes`.
    const own = await backendRoute(app, request, url, server);
    if (own) return own;

    // 2. Route files.
    const hit = findRoute(url);
    if (hit) {
      try {
        return await pageOrCache(hit, request, url);
      } catch (thrown) {
        if (thrown instanceof Response) return thrown; // notFound()
        throw thrown;
      }
    }

    // 3. The app's `fetch`, then the 404.
    return (await app.fetch?.(request, server)) ?? new Response("Not found", { status: 404 });
  },

  websocket: {
    open: async (ws: any) => (await socket())?.open?.(ws),
    message: async (ws: any, data: any) => (await socket())?.message?.(ws, data),
    close: async (ws: any, code: number, reason: string) => (await socket())?.close?.(ws, code, reason),
  },

  // Bake calls this once, on the built server, during `bun bake build`.
  async prerender() {
    const pages: Prerender[] = [];

    for (const file of files().filter(isRoute)) {
      if (file.endsWith(".ts")) continue; // API route
      const pathname = pathnameOf(file);
      if (file.endsWith(".html")) {
        pages.push(pathname);
        continue;
      }

      const route = await load(file);
      const dynamic = pathname.includes("[");
      if (route.cache === false) continue;
      if (dynamic && !route.paths) continue;
      if (!dynamic && route.server && route.cache === undefined) continue;

      for (const params of dynamic ? await route.paths() : [{}]) {
        const url = fill(pathname, params);
        // A page that can go stale stays private, so that `fetch` can refresh it.
        pages.push(route.cache?.revalidate ? { url, private: true } : url);
      }
    }
    return pages;
  },
};
