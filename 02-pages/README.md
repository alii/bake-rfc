# 02: `.tsx` routes with a React renderer

Routes are `.tsx` files. A `.tsx` route needs something to turn it into HTML, so
this app has a `bake.config.ts` that picks the React renderer.

```
bake.config.ts              # framework: routes({ renderer: react() })
app/
  routes/
    index.tsx               -> /
    about.tsx               -> /about
    blog/
      _layout.tsx           # wraps every route in blog/
      [slug].tsx            -> /blog/:slug
```

## Commands

`bun bake`, `bun bake build`, `bun ./dist/server.js`, as in 01.

## How the production server answers

| URL               | Answered by                                                    |
| ----------------- | -------------------------------------------------------------- |
| `/`, `/about`     | Static route. The framework rendered the HTML at build time.   |
| `/blog/:slug`     | Route handler. The framework renders the HTML on each request. |
| client JS and CSS | Static routes.                                                 |
| anything else     | The framework's 404.                                           |

## Static or per request?

`blog/[slug].tsx` exports no data function, so here it is rendered per request.
A route chooses with its exports: see `06-blog-ssg-ssr-isr`.
