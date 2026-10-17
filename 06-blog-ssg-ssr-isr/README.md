# 06: A blog with static, per-request and ISR pages

Each page picks how it is rendered by which functions it exports. The names
are copied from the Next.js pages router for now, and will be redesigned later.

```
bake.config.ts             # plugins: [react()]
app/
  posts.ts                 # stand-in for a CMS
  server.ts                # POST /api/revalidate/:id (on-demand ISR)
  pages/
    index.tsx              -> /             static
    blog/[id].tsx          -> /blog/:id     static + paths + ISR
    dashboard.tsx          -> /dashboard    per request
```

## How each page is rendered

| Page | Exports | When its HTML is made |
| --- | --- | --- |
| `index.tsx` | nothing | Once, by `bun bake build`. |
| `blog/[id].tsx` | `getStaticPaths`, `getStaticProps` with `revalidate: 60` | For posts 1 and 2 by `bun bake build`. A later post on its first request (`fallback: "blocking"`). Then again in the background at most every 60 seconds. |
| `dashboard.tsx` | `getServerSideProps` | On every request. |

In dev (`bun bake`), every page is rendered on every request, so edits show up
at once.

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Static route, native. |
| `/blog/1`, `/blog/2` | The page cache. Fresh: served from memory. Older than 60 seconds: served from memory, and rendered again in the background. |
| `/blog/3` (added after the build) | Rendered on this request, then cached. |
| `/blog/99` (no such post) | 404, because `getStaticProps` returned `notFound`. |
| `/dashboard` | Rendered on each request. Without an `x-user` header: redirect to `/`. |
| `POST /api/revalidate/1` | Your route. Calls `revalidate("/blog/1")`, which renders the page now and replaces the cached one. |

## Differences from Next.js

- `getServerSideProps` gets a web `Request`, not Node's `req`/`res`.
- `fallback: true` (render a loading state first) is left out for now. Only
  `false` and `"blocking"`.
- `res.revalidate(path)` is `revalidate(path)` from `bun:bake`, so any code can
  call it, not just API routes.

## What Bake core needs for this

- A production server (`dist/server.js`), which `bun bake build` doesn't make
  today.
- A page cache in that server, with stale-while-revalidate.
- `revalidate(path)` in `bun:bake`.
