# Bake RFC

Status: a proposal. Nothing here runs. `bun bake` and `bun:bake` do not exist yet, and
all names are placeholders.

A framework is one plain object that names a few files:

```ts
export default { name: "my-framework", server: "./server.ts", client: "./client.ts" };
```

```ts
// server.ts
export default {
  fetch(request) {
    /* routes, data, HTML */
  },
};
```

Bake runs the dev server and the build. It sends requests to the framework's server
file. That is the design.

## Who writes what

```
  app author            framework author             Bake (in Bun)
  ----------            ----------------             -------------
  bake.config.ts        the object                   dev server, hot reload,
  app code              server file                  error overlay, the build,
                        client file                  /_bun/* and public files
                        (plugins)


     browser                           Bake                        framework
        |                               |                              |
        |---- GET /about -------------->|                              |
        |                               |---- fetch(request) --------->|  server file
        |                               |                              |  finds the page
        |                               |<--- files, load, assets -----|  asks what it needs
        |                               |---- answers ---------------->|
        |                               |<--- Response ----------------|  renders HTML
        |<--- HTML ---------------------|                              |
        |                                                              |
        |   client file runs, and hydrates the page
```

Bake calls the framework's server file and plugins. Bake has no idea what a route is.

| You are | You see |
| --- | --- |
| An app author | `bake.config.ts` and your app code. Nothing else. |
| A framework author | This page. Maybe [ADVANCED.md](ADVANCED.md). |
| A Bun engineer | [WALKTHROUGH.md](WALKTHROUGH.md) and [QUESTIONS.md](QUESTIONS.md). |

## An app

```ts
// bake.config.ts. Optional: with no config, Bake uses the default framework.
export default { framework: "my-framework" };
```

| Command | What it does |
| --- | --- |
| `bun bake` | Dev server with hot reload. |
| `bun bake build` | Writes `dist/`. |
| `bun ./dist/server.js` | Runs the build. It needs nothing but `dist/` and Bun. |

## A framework with pages

Your server file needs to reach the app's pages. So add one field, `files`:

```ts
export default {
  name: "tiny-framework",
  server: "./server.tsx",
  client: "./client.tsx",
  files: "app/pages/**/*.tsx", // the app's files
};
```

Bake builds each file twice: a copy for the server and a copy for the browser. Your
server file can then ask three things:

```ts
import { files, load, assets } from "bun:bake";

files();                  // ["app/pages/index.tsx", "app/pages/about.tsx"]
await load(file);         // that file's module
await assets(file);       // { js: [...], css: [...] }: what the page must link
```

Your client file asks one:

```ts
import { load } from "bun:bake/client";

await load(file);         // the same file, in the browser
```

Put `assets(file).js` in your HTML and you get hydration and hot reload. In dev, those
scripts include the hot reload runtime. Bake turns on React Fast Refresh when browser
code imports React.

`frameworks/tiny` is this, whole: three files and a `package.json`.

## That is the normal API

Everything else is optional. [ADVANCED.md](ADVANCED.md) has one small example of each:

| Extra | For |
| --- | --- |
| `serverExports` | Removing server-only exports from browser code. |
| `inClient` | Pages that ship no script. |
| `prerender` | Pages made at build time. |
| `plugins` | Compilers, and rules about files. |
| `dev()` and `build()` | A framework with its own command line. |
| Late files, more copies | React Server Components. Open. |

## What is here

| Path | What it is |
| --- | --- |
| [WALKTHROUGH.md](WALKTHROUGH.md) | One request, one edit, one build, in plain steps. |
| `frameworks/tiny` | The smallest complete framework. Read it next. |
| `frameworks/default` | The default framework: what you get with no config. |
| `apps/00-tiny` | An app on the tiny framework. |
| `apps/01` to `apps/07` | Apps on the default framework. |
| `apps/08-hono-no-framework` | Hono, with no framework package. |
| [ADVANCED.md](ADVANCED.md), `advanced/rsc` | The extras, and an RSC sketch. |
| `types/bake.d.ts` | The whole API. |
| [QUESTIONS.md](QUESTIONS.md) | What is open, and honest status for Next.js, Astro and SvelteKit. |

## Does this meet the bar?

The goal: Next.js, Astro or SvelteKit could sit on Bake. Not yet. Only our own
framework is something Bun can ship alone. See [QUESTIONS.md](QUESTIONS.md).
