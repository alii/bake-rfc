# 04: Pages plus a Hono backend

The same as 03, with Hono as the backend. Hono only sees requests that are not
pages or assets, so pages keep the native fast path.

```
bake.config.ts       # plugins: [react()]
package.json         # hono
app/
  server.ts          # export default hono
  pages/
    index.tsx        -> /
```

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Static route (prerendered page), native. |
| client JS and CSS | Static routes, native. |
| `/api/hello`, `/api/echo` | Hono. |
| anything else | Hono's `notFound`. |

## Checked

Hono 4.7.2: a Hono app has `.fetch(request)`, which returns a `Response`, so
it is a valid default export.
