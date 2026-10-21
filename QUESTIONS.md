# Open questions

Everything here is on paper. Nothing was built or run. There is no speed number of any
kind. No framework team was asked.

## Decisions for the owner

### 1. What does "Next could sit on Bake" mean?

| Claim | What it means | State |
| --- | --- | --- |
| Deployment | Next runs on Bun. | Possible without Bake, through Next's adapter API. |
| Compile-level port | Next uses Bake as its bundler. | Needs Vercel. Next's list of bundlers is closed. |
| Reimplementation | Rewrite Next's surface on Bake, as vinext does on Vite. | Very large. |

Suggestion: deployment is the claim. Compile-level Next is not an acceptance test.

### 2. What does "one production build" mean?

It does not exist today. RSC builds under one command, client pages under another.

This design wants one command, one output, and one bundling pass. `files` and `inClient`
are known before bundling, so the pass needs no second round. Two things go beyond it:
`prerender` runs built code, and `addFile` adds files mid-pass.

### 3. Is Bun-only server output acceptable in v1?

It removes most of Astro's and SvelteKit's hosting: Vercel, Netlify, Cloudflare.

Suggestion: yes for v1. `dist/server.js` needs only Bun. Bake writes no host adapters.

### 4. Must speed be proved first?

Astro and SvelteKit already run on Bun through Vite. So the reasons to move are speed,
the overlay and one toolchain. Nobody has a number, and Vite 8 is native too.

Suggestion: yes. Time a real SvelteKit app and a real Astro site, on Vite and through
`Bun.build`, before any API work. Agree the margin first. If it fails, drop those two
as goals and build for our own framework.

### 5. How does code cross between copies?

Open. ADVANCED.md uses one plugin call, `build.bake.addFile`, and a plain name. Only RSC
needs it. App authors and normal framework authors never see it. It has no compile-time
magic and no false type. It is not known to work.

### Also open

- **Which route shape** for the default framework: `apps/07-shop-routes`, or the server
  first shop in `advanced/rsc/app`.
- **Which Flight runtime** for RSC.
- **Vite plugins.** Suggestion: none in v1, and a thin adapter later. They are not
  drop-in.
- **Where the default framework lives,** and whether it should use React when an app
  has only `.html` routes.

## Port status

"Fits" means the API has a form for it. It does not mean the form works. These come from
reading docs and source. No port was tried.

| Target | Status | Main obstacles |
| --- | --- | --- |
| Next.js pages router | With work, as a fork only | Needs Next's agreement. Its server uses Node `req` and `res`. Edge runtime. `webpack()` config cannot be honoured. |
| Next.js App Router | Not claimed | All of the above, and everything open under RSC. Server actions. `/_next/` is hard-coded. |
| Astro | With work, for static and Bun-hosted sites, as a breaking major | Vite objects are public Astro API, and renderers use them. Hosted adapters are lost. Several islands on one page in dev. It already runs on Bun. |
| SvelteKit | With work, as a second backend the Svelte team must agree to | Remote functions run the built server to make client stubs. Relative `base`. Service worker. It already runs on Bun. |
| Default framework | Fits, if the Bake work below lands | See below. |
| Hono | Fits | Needs server reload. |
| RSC | Sketch only | Late files, a third copy, Flight. |

"With work" does not mean worth doing. Only our own framework is something Bun can ship
alone.

These extras were cut, because no framework here needs them. Astro, SvelteKit or Next
may bring them back: `publicDir`, `define` per side, a hook on file changes, messages
to the browser, entries with data, and an output manifest for adapters.

## The work Bake must do

The API is small. The work under it is not. These come from reading Bun's source, not
from a run.

| Gap | What depends on it |
| --- | --- |
| **The dev server is built around routes.** Server code has no bundle without a router. | Everything. Must be proved first. |
| **Server reload.** Only the changed module runs again today. A Hono sub-router keeps old handlers. | Hono, and any server file with static imports. |
| **One production build.** See decision 2. | `bun bake build`. |
| **A self-contained `server.js`.** `bun:bake` must compile to a table in the bundle. | `bun ./dist/server.js`. |
| **Removing exports,** and imports that only they used, before the walk reaches those imports. | `serverExports`. |
| **More browser code in dev.** Dev has one script per bundle and no code splitting, and cannot load more later. | `assets([...])` works by asking once. Client routers and islands do not. |
| **Plugins cannot chain.** `onLoad` stops at the first result. A framework's compiler and an app's plugin cannot both handle one file. | The RSC sketch and any compiler plus Tailwind need it. |
| **Crossing is broken** for a file in two copies, and is lost through `onResolve`. | `addFile`, RSC. |
| **CSS from server code** is lost in production builds today. | `assets().css` on no-script pages. |

## Where the simple shape broke down

Found while writing the code here.

1. **The three-field object is not enough for pages.** The first example has `name`,
   `server` and `client`. Any framework with app pages also needs `files`. Without it, a
   server file cannot reach the app's code in a self-contained build.
2. **The default framework is not simple.** It uses four extras: `serverExports`,
   `inClient`, `prerender` and a plugin. Its server file is about 180 lines. Only tiny
   and Hono stay on the first screen.
3. **One glob could not say what ships.** The first try built every file for the browser.
   That fails: a no-script page may import `*.server.ts`, and API routes and
   `app/server.ts` have no browser form. So `inClient` exists. It tests the source with
   a regex, so `export const browser = true` must be written just so. Layouts always get
   a browser copy, so a layout cannot import a server-only file, even in an app with no
   scripts.
4. **A plain object does not know where it lives.** `./server.ts` works only because Bake
   imports the object by name. So `framework: myFramework({ ... })` cannot work with
   relative paths, and there is no way to pass options. `dev()` and `build()` need
   absolute paths. No framework here needs options, so none exist. A real one will. The
   hard part is getting options into the server file.
5. **Tiny has no data loading.** Data needs `serverExports`. Without it, data code ships
   to the browser. So a tiny page gets only `path`. Tiny is complete for hydration and
   hot reload, and is not a useful framework.
6. **`load` in the browser needs a table.** It takes a file name. If the file is on the
   page, the scripts provide it. For anything else, it needs a table of names to URLs,
   and hashes make that a cycle. The likely answer is a fixed-name, unhashed file. It
   also shows source paths to the browser.
7. **`.html` files are a special case.** Apps 01 and 05 need built HTML, so `Assets` has
   `html`. An `.html` file brings its own scripts, so `client` must not be added to it.
8. **Prerender needed a private kind.** Public files cannot be refreshed, so kept pages
   need `{ private: true }` and `saved`. That is one more function, for one feature of
   the default framework.
9. **`routes` and `websocket` are forwarded by hand.** The default framework matches the
   app's `routes` in JS and forwards `websocket`, because the app file can change. So
   `/health` is not a native route there. `server.reload()` may let Bake reload the
   server file's own `routes`, but this was not checked for `websocket`.
10. **All scripts are `type="module"`.** Tiny relies on that for its top-level `await`.
    Check that the dev runtime can load this way.
11. **The rule against `*.server.ts` depends on order.** The plugin throws when browser
    code reaches the file. A route may import one for its `server` export. So exports
    must be removed before Bake follows imports. Otherwise every such route fails.
12. **RSC is not simple.** It needs `addFile`, `conditions`, `ssr` and `ssrEntry`. Its
    plugin parses exports by hand and does not follow `export *`. Flight is synchronous, so
    a client file first reached by a lazy import during render is missing. Its `onLoad`
    claims every `.tsx` file, which blocks other plugins until they can chain.
13. **`load` returns `any`.** A plain name carries no type. Frameworks cast it.

## Smaller open points

- **Build options.** `outdir`, `publicPath`, minify and sourcemaps have no field, because
  no app here sets them. A CDN needs `publicPath`.
- **Module identity in dev.** A file in `files` that the server file also imports
  directly: one instance or two? It should be one.
- **Prerender state.** It runs in its own process, so module state does not reach the
  running server.
- **Prerender paths.** `/about` should become `client/about/index.html`, or similar.
- **Fast Refresh.** Bake turns it on when browser code imports React. A framework that
  wants it off has no field yet.
- **A client router** that wants no reload after a server edit has no hook.
- **A page with no data export.** The default framework's rule: no `server` and no URL
  value means prerendered. A URL value with no `paths` means per request.
- **Server-only files.** The default framework uses the name `*.server.ts`. It catches
  nothing else.
- **Streaming props.** A promise prop works only with no script. See
  `apps/07-shop-routes/app/routes/account.tsx`.
