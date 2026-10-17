# 02: Pages rendered by a plugin

Pages are `.tsx` files. A `.tsx` page needs something to turn it into HTML, so
this app has a `bake.config.ts` that adds the React plugin. That is the only
thing the config file is for: build plugins.

```
bake.config.ts              # plugins: [react()]
app/
  pages/
    index.tsx               -> /
    about.tsx               -> /about
    blog/
      _layout.tsx           # wraps every page in blog/
      [slug].tsx            -> /blog/:slug
```

## Commands

`bun bake`, `bun bake build`, `bun ./dist/server.js`, as in 01.

## How the production server answers

| URL               | Answered by                                                 |
| ----------------- | ----------------------------------------------------------- |
| `/`, `/about`     | Static route. The plugin rendered the HTML at build time.   |
| `/blog/:slug`     | Route handler. The plugin renders the HTML on each request. |
| client JS and CSS | Static routes.                                              |
| anything else     | Bake's built-in 404.                                        |

## Static or per request?

`blog/[slug].tsx` exports no data function, so here it is rendered per request.
A page chooses with its exports: see `06-blog-ssg-ssr-isr`.
