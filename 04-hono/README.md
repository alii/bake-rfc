# 04: Routes plus a Hono backend

The same as 03, with Hono as the backend. Hono only sees requests that are not
routes or assets, so prerendered pages are still served natively.

```
bake.config.ts       # framework: routes({ renderer: react() })
package.json         # hono
app/
  server.ts          # export default hono
  routes/
    index.tsx        -> /
```

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Static route (prerendered page), native. |
| client JS and CSS | Static routes, native. |
| `/api/hello`, `/api/echo` | Hono. |
| anything else | Hono's `notFound`. |

## Why Hono fits

A Hono app has `.fetch(request)`, which returns a `Response`, so it should be a
valid default export. This has not been run.
