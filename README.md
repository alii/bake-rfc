# Bake design mock

A mock of the proposed Bake design. Nothing here runs yet: `bun bake` and
`bun:bake` don't exist. The types are in `types/bake.d.ts`, so the examples
type-check in an editor.

## Three layers

1. **Bake (in Bun):** a dev server and a production builder for apps made of
   routes. It knows routes, bundling, hot reload, the production server, and the
   plugin API. It does not know where page files live or how a page becomes HTML.
2. **Plugins:** a *router* gives Bake the routes; a *renderer* (for example
   React) turns a page into HTML. Plus normal build plugins, like Tailwind.
3. **Defaults:** with no router in `bake.config.ts`, Bake uses its built-in
   pages router, modelled on the Next.js pages folder. Everything under "The
   rules" below is that default router. A framework can replace it.

## The rules

1. **Bake always starts the server.** You never call `Bun.serve` yourself.
2. **Pages live in `app/pages/`** (default router). The file path is the URL.
   - `.html` pages need nothing else.
   - `.tsx` pages need a renderer plugin, for example React.
   - `_layout.tsx` wraps the pages in its folder. `[slug]` is a URL value.
   - A page picks how it is rendered by its exports: nothing (static),
     `getStaticPaths` + `getStaticProps` (static, with ISR via `revalidate`), or
     `getServerSideProps` (per request). Names copied from Next.js for now; to
     be redesigned later.
3. **Your backend lives in `app/server.ts`** (optional). Its default export is
   the shape Bun already runs (`export default { fetch }`), and it may also
   have `routes` and `websocket`. A Hono app fits.
4. **Build plugins live in `bake.config.ts`** (optional). It is read at build
   time only and is never bundled into production.

## Commands

| Command | What it does |
| --- | --- |
| `bun bake` | Dev server with hot reload. |
| `bun bake build` | Production build into `dist/`. |
| `bun ./dist/server.js` | Runs the production build. |
| `bun ./index.html` | Unchanged: serves one HTML file, no config. |

Dev and prod are different commands. No `development` flag, no `app` option on
`Bun.serve`.

## How a request is answered

The server Bake starts is, in effect:

```ts
Bun.serve({
  routes: { ...pageRoutes, ...server.routes },
  fetch: server.fetch,
  websocket: server.websocket,
});
```

1. **Routes first.** Bake's pages and assets, and your `routes`.
   - Prerendered pages and assets are static `Response` objects, served
     natively with no JavaScript per request.
   - Pages that render per request are route handlers.
2. **Then your `fetch`**, for every URL that no route matched.
3. **Then Bake's 404**, if there is no `app/server.ts`.

A page and one of your routes can't own the same URL; Bake reports it as an
error.

In dev, the hot-reload WebSocket (`/_bun/hmr`) is registered on the server
separately from your `websocket` handler, as the dev server already does today
(`src/runtime/bake/dev_server/lifecycle.rs`), so the two don't clash.

## How `bun bake build` makes `dist/server.js`

1. Build the pages: client files, prerendered HTML, per-request render code.
2. Bundle `app/server.ts` (if it exists) together with a generated route table
   that lists the outputs of step 1, for example
   `"/": new Response(await Bun.file("./client/index.html").bytes())`.
3. `dist/server.js` starts `Bun.serve` as above. Nothing is generated at runtime.

## Cases

| Folder | Shows |
| --- | --- |
| `01-html-only` | HTML pages, no config, no server. |
| `02-pages` | `.tsx` pages with a React plugin, a layout and a `[slug]` page. |
| `03-pages-and-server` | Pages plus an `app/server.ts` with `routes`, `fetch` and `websocket`. |
| `04-hono` | Pages plus a Hono backend. |
| `05-static-site-tailwind` | HTML pages plus a Tailwind plugin, hostable anywhere. |
| `06-blog-ssg-ssr-isr` | Static, per-request and ISR pages, plus on-demand `revalidate`. |

## Proposal: routes

**Not decided.** The cases above show today's mock. These two show the same shop
in the two candidate designs for the next version, with files in `app/routes/`:

| Folder | Shows |
| --- | --- |
| `07-shop-routes` | One route shape: `server` and `default`, with no directives. A route is interactive or ships no script. |
| `08-shop-server-first` | Server by default with no directives. The bundler finds the live parts. |

Both keep the data in a plain server-only file, and both use web standards for API
routes. All names are placeholders.

## Open questions

- **The page function names** (`getStaticProps` and so on) are copied from
  Next.js as a placeholder. Redesign them later.
- **Where the page cache lives** for ISR: memory only, or disk, or shared
  between server instances.
- **The `app/` folder name.** Next.js uses `app/` for its own router, which
  could confuse people moving from Next.js.
- **The React guess.** Today, configless Bake turns on React Fast Refresh when
  `react` is installed (`Framework::auto`). In this design that belongs in the
  React plugin.
