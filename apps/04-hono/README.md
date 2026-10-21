# 04: Routes plus a Hono backend

The same as 03, with Hono as the backend. Hono only sees requests that are not
routes or public files.

For Hono with no routes and no framework at all, see `08-hono-no-framework`.

```
bake.config.ts       # optional: names the default framework
package.json         # hono
app/
  server.ts          # export default hono
  routes/
    index.tsx        -> /
```

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Public file (prerendered page), served by Bake. |
| client JS and CSS | Public files. |
| `/api/hello`, `/api/echo` | Hono. |
| anything else | Hono's `notFound`. |

## Why Hono fits

A Hono app has `.fetch(request)`, which returns a `Response`. This has not been run.
