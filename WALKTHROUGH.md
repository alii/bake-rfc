# Walkthrough

What happens, step by step, using `apps/00-tiny` on `frameworks/tiny`. None of this
has been run. Steps that today's Bun cannot do are listed in
[QUESTIONS.md](QUESTIONS.md).

## Start: `bun bake`

1. Bake reads `bake.config.ts`. It says `framework: "tiny-framework"`.
2. Bake imports that package and gets the plain object.
3. Bake lists `files`: `app/pages/index.tsx` and `app/pages/about.tsx`.
4. Bake starts listening. It builds nothing yet.

## One request: `GET /`

1. The request reaches Bake. It is not `/_bun/*` and not a public file.
2. Bake builds `frameworks/tiny/server.tsx`, because this is the first use.
3. Bake calls its `fetch(request)`. Now we are in the framework.
4. `files()` gives the two pages. The framework finds that `/` means
   `app/pages/index.tsx`.
5. `load(file)` makes Bake build the server copy, and returns the module.
6. `assets(file)` makes Bake build the browser copy, with `client.tsx`. It returns
   script and CSS URLs: the shared client code and the page's own code. One script
   holds the hot reload runtime.
7. The framework renders the page to HTML. It adds the scripts, and a JSON block that
   names the file and its props.
8. It returns a `Response`. Bake sends it.

In the browser:

9. The browser fetches all the scripts at the same time. The page's script registers
   the page, and does not run it yet.
10. `client.tsx` reads the JSON block and calls `load(file)`. The page is on this HTML,
    so there is no extra request. Then it calls `hydrateRoot`.
11. The button works.

## One edit

**You edit `app/pages/index.tsx`.**

- Browser: Bake sends the new module, and React Fast Refresh updates the button. The
  count stays.
- Server: Bake forgets the server copy. The next `load(file)` gets the new one.

**You edit `frameworks/tiny/server.tsx`, or anything it imports.** Bake runs the
changed files again, up to the server file. It stops at `load`, so pages do not run
again. The next request reaches the new `fetch`. Browsers reload.

**You add `app/pages/contact.tsx`.** It matches `files`, so the next `files()` lists
it. No table goes stale.

**You make an error.** Bake shows the overlay in the browser.

## One build: `bun bake build`

1. Bake reads the object and lists `files`.
2. One bundling pass builds the server file with the server copies, and `client.tsx`
   with the browser copies.
3. Bake writes to a temporary folder:

   ```
   server.js       the framework's server file, the pages and a table of files
   client/         scripts, CSS and public pages
   ```

   `files`, `load` and `assets` are built into `server.js`, and read that table.

4. If the server file has `prerender`, Bake runs the built `server.js` in a new process.
   It calls `prerender()`, then `fetch` for each URL, and saves the answers. Tiny has
   none, so it skips this.
5. Bake moves the folder to `dist/`. A failed build keeps the old `dist/`.

## Production: `bun ./dist/server.js`

1. Bun sees a default export with `fetch`, as it does for any file, and serves it.
2. `GET /main-abc123.js`: a file in `client/`. No framework code runs.
3. `GET /`: `fetch(request)`, the same code as in dev. `load` and `assets` are now table
   lookups.
4. There is no bundler, no watcher, no `bake.config.ts` and no framework package.

## The same request on the default framework

The default framework does more in its `fetch`, and Bake does the same as above.

1. `GET /products/mug` in `apps/07-shop-routes`.
2. It checks your `app/server.ts`, if you have one.
3. It matches `app/routes/products/[id].tsx`, so `id` is `mug`.
4. It calls `route.server({ params })`, which reads `shop.server.ts`.
5. `browser = true`, so it asks `assets` for the route and its layouts, and hydrates.

The browser copy has no `server` export, because the framework listed it in
`serverExports`. So `shop.server.ts` is not reached.

`GET /about` there is a public file. `prerender` listed it, so no JavaScript runs.
