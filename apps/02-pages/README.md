# 02: `.tsx` routes

Routes are `.tsx` files. The default framework renders them with React.

```
bake.config.ts              # optional: names the default framework
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

| URL               | Answered by                                                  |
| ----------------- | ------------------------------------------------------------ |
| `/`, `/about`     | Public file. The framework rendered it at build time.        |
| `/blog/:slug`     | The framework's server module, on each request.              |
| client JS and CSS | Public files.                                                |
| anything else     | The framework's 404.                                         |

## Static or per request?

`blog/[slug].tsx` has a URL value and no `paths` export, so it is rendered per
request. A route chooses with its exports: see `06-blog-ssg-ssr-isr`.

These pages set no `browser` export, so they ship no script.
