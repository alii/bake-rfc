# Extras

You do not need this page for a first framework. App authors never see it.

Each extra exists because a framework in this repo needs it. The default framework uses
the first four. Only RSC uses the last two, and they are open.

## Server-only exports

Say a page exports data code that must not reach the browser:

```tsx
export async function data() {
  return { user: await db.currentUser() };
}
export default function Page({ user }) { /* ... */ }
```

List the name:

```ts
export default {
  name: "my-framework",
  server: "./server.tsx",
  client: "./client.tsx",
  files: "app/pages/**/*.tsx",
  serverExports: ["data"],
};
```

Bake removes `data` from the browser copy, and anything only `data` uses. An export
you do not list ships. If a kept export still uses a removed one, the build fails.

## Pages that ship no script

```ts
inClient: (file, source) => /export const browser = true/.test(source),
```

Bake calls this with each file in `files`, before it bundles, and again when the file
changes. Return `false` and the file gets no browser copy. `assets(file)` then gives
CSS, plus the hot reload runtime in dev. In production `js` is empty.

## Prerender

Add `prerender` to the server file. It returns URLs.

```ts
export default {
  fetch(request) { /* ... */ },
  prerender: () => ["/", "/about", { url: "/blog/1", private: true }],
};
```

`bun bake build` calls `fetch` for each URL and saves the answer.

- A string is a public file. It is served before `fetch`, until the next deploy.
- A private page is not served. Your `fetch` reads it with `saved("/blog/1")`, and can
  refresh it. The default framework's page cache does this.

For a static host, upload `dist/client/`.

## Plugins

These are Bun plugins. A framework lists its own, and an app can add more.

```ts
plugins: [{
  name: "server-files-stay-on-the-server",
  setup(build) {
    build.onLoad({ filter: /\.server\.ts$/ }, args => {
      if (args.side === "client") throw new Error(`${args.path} is server only.`);
    });
  },
}],
```

A compiler, such as one for `.svelte`, is an `onLoad` too. Two plugins cannot both
handle one file today. See [QUESTIONS.md](QUESTIONS.md).

## Your own command line

A framework with its own CLI calls Bake instead of `bun bake`:

```ts
import { dev, build } from "bun:bake/tool";

const framework = { name: "my-framework", server: import.meta.resolve("./server.ts") };

if (process.argv[2] === "build") await build(framework, { outdir: "dist" });
else await dev(framework, { port: 3000 });
```

It is the same object. Bake still calls the server file.

## Late files (open)

Sometimes a build finds a file that must be in the browser only as it goes. A
`"use client"` file is the usual case. A plugin adds it:

```ts
build.onLoad({ filter: /\.tsx$/ }, async args => {
  const source = await Bun.file(args.path).text();
  if (args.side !== "server" || !source.startsWith('"use client"')) return { contents: source, loader: "tsx" };

  const id = build.bake.addFile(args.path, "client");
  return { loader: "js", contents: `export default { clientFile: ${JSON.stringify(id)} };` };
});
```

The server gets a small stub with a name, not the code. `assets(id)` then gives the
scripts. This is the only way code crosses between copies. Whether Bake can add a file
mid-build is unproved.

## React Server Components (open)

RSC needs three copies of some files: server, browser, and browser code that runs on
the server to make the first HTML. So it adds two fields:

```ts
export default {
  name: "rsc-sketch",
  server: "./server.tsx",
  client: "./client.tsx",
  files: "app/routes/**/*.{tsx,ts}",
  conditions: ["react-server"], // how the server copy resolves packages
  ssr: "./entry.ssr.tsx",       // the third copy's entry. Reach it with ssrEntry().
  plugins: [boundary],          // calls addFile for each live component
};
```

`advanced/rsc` is a sketch of this, with the shop app. It is not complete, and which
Flight runtime it uses is undecided.
