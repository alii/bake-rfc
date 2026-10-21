# 06: A blog with static, per-request and kept pages

Each page picks how it is rendered by what it exports. It uses the route shape
from `07-shop-routes`. That shape is a candidate.

```
bake.config.ts             # optional: names the default framework
app/
  posts.ts                 # stand-in for a CMS
  server.ts                # POST /api/revalidate/:id
  routes/
    index.tsx              -> /             static
    blog/[id].tsx          -> /blog/:id     kept, refreshed in the background
    dashboard.tsx          -> /dashboard    per request
```

## How each page is rendered

| Page | Exports | When its HTML is made |
| --- | --- | --- |
| `index.tsx` | nothing | Once, by `bun bake build`. A public file. |
| `blog/[id].tsx` | `paths`, `server`, `cache = { revalidate: 60 }` | Posts 1 and 2 by `bun bake build`, saved as private files. A later post on its first request. Then again in the background at most every 60 seconds. |
| `dashboard.tsx` | `server`, `cache = false` | On every request. |

In dev (`bun bake`), every page is rendered on every request.

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Public file, served by Bake. |
| `/blog/1`, `/blog/2` | The framework's page cache. Older than 60 seconds: the old page now, and a new one in the background. |
| `/blog/3` (added after the build) | Rendered on this request, then kept. |
| `/blog/99` (no such post) | 404, from `notFound()`. |
| `/dashboard` | Rendered on each request. Without an `x-user` header: a redirect to `/`. |
| `POST /api/revalidate/1` | Your route. Calls `revalidate("/blog/1")`. |

## Why the blog posts are not public files

Public files are served before `fetch`. They can never be refreshed. So a page
that can be refreshed must stay private and go through the framework's cache.

The page cache lives in `frameworks/default/cache.ts`. Bake has no idea it exists.
