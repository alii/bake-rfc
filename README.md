# Bake RFC

Status: proposal, open for review. Nothing here is decided and nothing runs.
`bun bake` and `bun:bake` don't exist yet, and all names are placeholders. The
proposed types are in `types/bake.d.ts`.

Bake today is a dev server built around one idea of routes and pages. This RFC
proposes making it a neutral backend that frameworks sit on. The goal: if
Next.js could sit on top of Bake, and so could Astro or SvelteKit, then the API
is good. On paper it does not meet that goal yet: see
["Does this meet the bar?"](#does-this-meet-the-bar).

## Two layers

1. **Bake (in Bun)** is a backend for frameworks. It owns bundling, three module
   graphs (client, server, ssr), the dev server, hot reload, the one production
   build and the plugin API. It does not know routes, pages, data, caching or
   how anything becomes HTML.
2. **A framework** owns everything a request touches: routes, data, rendering,
   responses, 404 pages and caching. A framework is one object and one server
   file, using only Bake's public API.

Part 1 of this README is Bake. Part 2 is `@bun/routes`, a separate React-style
framework that Bun would offer on top of Bake. It is one user of the API, with
no private hooks.

The test for what belongs where: if a feature needs the word "route" or "page"
in Bake's types, it belongs in a framework.

# Part 1: Bake

## What a framework gives Bake

| Question | Answer |
| --- | --- |
| What are the routes? | The framework's own data. Bake never reads it. |
| Which exports are server-only? | A list of names per file, `drop`. |
| What are the entry points? | One server file, and a list of entries. |
| Does it want React Server Components (RSC)? | It turns on the `ssr` graph and adds a plugin. |
| How does it answer requests? | `export default { fetch }`, in dev and production. |
| How does it prerender? | A loop in its `built` hook. |
| How does it hook hot reload? | `changed`, `onUpdate`, `import.meta.hot`. |
| How do app authors configure it? | `framework: shop({ ... })` in `bake.config.ts`. |

The framework object runs at build time. The server file runs in the server
graph, in dev and in production. A module imported by both gets two instances.

Code crosses graphs only through an import attribute, usually written by a
plugin: `import ref from "./x.tsx" with { graph: "client" }`. There are no
directives in Bake. A React framework may honour `"use client"` in its own plugin.

Plugins are Bun plugins, with two additions: a `graph` filter, and an
`onTransform` hook so a framework's compiler and an app's plugin can both handle
one file.

The smallest framework:

```ts
export default () => ({ name: "hono", server: { entry: "./src/index.ts" } });
```

The full types are in `types/bake.d.ts`, with a small SSR framework as an example.

## Config and commands

Bake always starts the server. You never call `Bun.serve` yourself. This is true
of every framework.

`bake.config.ts` is optional. It names the framework and build plugins. It is
read at build time only and is never bundled into production.

| Command | What it does |
| --- | --- |
| `bun bake` | Dev server with hot reload. |
| `bun bake build` | Production build into `dist/`. |
| `bun bake info` | Prints the framework's graphs, entries and plugin filters as JSON. |
| `bun ./dist/server.js` | Runs the production build. |
| `bun ./index.html` | Unchanged: serves one HTML file, no config. |

Dev and prod are different commands. No `development` flag, no `app` option on
`Bun.serve`.

A framework with its own command line calls `dev()` and `build()` from
`bun:bake/tool` instead, with the same framework object.

## How a request is answered

For any framework, the server Bake starts is, in effect:

```ts
Bun.serve({
  routes: { ...bakeAssetsAndPublicFiles, ...server.routes },
  fetch: server.fetch,
  websocket: server.websocket,
});
```

Bake keeps only `/_bun/*`, published files and the public folder. Every other
request goes to the framework's server file, including 404s.

In dev, the hot-reload WebSocket (`/_bun/hmr`) is registered on the server
separately from your `websocket` handler, as the dev server already does today,
so the two don't clash.

## How `bun bake build` makes `dist/`

1. Ask the framework for its entries, and build all graphs in one pass.
2. Write `dist/server.js`, a handler file that does not listen, the client files,
   and `dist/bake.json`, which lists the built files of each entry.
3. Call the framework's `built` hook, which prerenders and publishes files.

`bun ./dist/server.js` serves the handler, as Bun does for any file that
default-exports `fetch`. An adapter can import it instead.

## Does this meet the bar?

Not yet. On paper the API fits the two shops in Part 2, a Hono app, a static
site generator and a Svelte-style framework. For the three frameworks that set
the bar, it fits only with real work:

| Framework | On paper | What is missing |
| --- | --- | --- |
| SvelteKit | Closest. Possible with a port. | A port of its Vite plugin. A browser module loader for its client router. A way to build its service worker. |
| Astro | Plausible with a port. | A port of its compiler and integrations. `?url`, `import.meta.glob` and query-suffix modules. Several islands sharing one runtime in dev. |
| Next.js pages router | Possible as a large port. | Its server is built on Node's `req` and `res`. `next/font`, `next/image` and its transforms. A way to build middleware. |
| Next.js App Router | Shape only. We don't claim it. | Server actions, which Bun's bundler does not support today. More layers than three graphs. A client that patches `__webpack_require__`. |

This comes from reading their docs and Next's source. No port has been tried.
Nothing in Bake's API is known to block them, and each one is a large piece of
work.

## Open questions for Bake

- **Dev without routes.** The dev server is built around routes today, below the
  part this API replaces. Removing them means rewriting a core part of it. This
  must be proved before the API is frozen.
- **One production pass with late client entries.** Also unproved, including RSC
  in production.
- **Isolated outputs**, such as a service worker or edge middleware. Three graphs
  do not cover them.
- **Vite plugins.** Astro and SvelteKit rely on them. Whether Bake offers a
  compatibility layer is open.
- **Server targets beyond Bun**, such as Node or Workers output.
- **The type of a client import.** TypeScript will type a `with { graph: "client" }`
  binding as the module's default export, which is wrong. This is why the form is
  meant for generated code.

# Part 2: `@bun/routes`

Everything below is one framework, not Bake. It is an ordinary package on the
API above, and it takes a renderer such as React. With no `framework` in
`bake.config.ts`, Bake uses it. That is the only place Bake names it.

## The rules of `@bun/routes`

1. **Routes live in `app/routes/`.** The file path is the URL.
   - `.html` routes need nothing else.
   - `.tsx` routes need a renderer, for example `routes({ renderer: react() })`.
   - `_layout.tsx` wraps the routes in its folder. `[slug]` is a URL value.
   - A route picks how it is rendered by its exports: nothing (static),
     `getStaticPaths` + `getStaticProps` (static, re-rendered in the background via
     `revalidate`, known as ISR), or
     `getServerSideProps` (per request). Names copied from Next.js for now; to
     be redesigned later. The route shape is not decided: see "Proposal: routes".
2. **Your backend lives in `app/server.ts`** (optional). Its default export is
   the shape Bun already runs (`export default { fetch }`), and it may also
   have `routes` and `websocket`. A Hono app fits.

## How `@bun/routes` answers

`@bun/routes` answers in this order: your `app/server.ts` routes and its own
route table, your `fetch`, then its 404 page. A route and one of your `routes`
can't own the same URL; it reports that as an error.

## Cases

| Folder | Shows |
| --- | --- |
| `01-html-only` | HTML routes, no config, no server. |
| `02-pages` | `.tsx` routes with a React renderer, a layout and a `[slug]` route. |
| `03-pages-and-server` | Routes plus an `app/server.ts` with `routes`, `fetch` and `websocket`. |
| `04-hono` | Routes plus a Hono backend. |
| `05-static-site-tailwind` | HTML routes plus a Tailwind plugin, hostable anywhere. |
| `06-blog-ssg-ssr-isr` | Static, per-request and ISR routes, plus on-demand `revalidate`. |

Cases 01 to 06 show `@bun/routes`. Their page function names are placeholders.

## Proposal: routes

**Not decided.** These two show the same shop in the two candidate route shapes
for `@bun/routes`. Both are ordinary frameworks on the same API.

| Folder | Shows |
| --- | --- |
| `07-shop-routes` | One route shape: `server` and `default`, with no directives. A route is interactive or ships no script. |
| `08-shop-server-first` | Server by default with no directives. A framework plugin finds the live parts. |

Both keep the data in a plain server-only file, and both use web standards for API
routes.

## Open questions for `@bun/routes`

- **The page function names** (`getStaticProps` and so on) are copied from
  Next.js as a placeholder. Redesign them later.
- **Where `@bun/routes` keeps its page cache** for ISR: memory only, or disk, or
  shared between server instances.
- **The `app/` folder name.** Next.js uses `app/` for its own router, which
  could confuse people moving from Next.js.
- **The React guess.** Whether `@bun/routes` should pick the React renderer when
  `react` is installed.
