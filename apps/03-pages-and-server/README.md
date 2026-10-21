# 03: Routes plus your own backend

Add `app/server.ts` to handle what `app/routes/` doesn't: an API, webhooks, a
custom 404. This file is a feature of the default framework, not of Bake.

```
bake.config.ts       # optional: names the default framework
app/
  server.ts          # your backend: routes, fetch, websocket
  routes/
    index.tsx        -> /
```

You never call `Bun.serve`. Bake does.

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Public file (prerendered page), served by Bake. |
| client JS and CSS | Public files. |
| `/health`, `/api/hello` | Your `routes`, matched by the default framework. |
| `/chat` | Your `fetch`, which upgrades it to your `websocket`. |
| anything else | Your `fetch` (your 404). |

Your `routes` are not native Bun routes here. The file hot reloads, and
`Bun.serve` takes its routes at start, so the framework matches them itself.

## Rule

A file in `app/routes/` and one of your `routes` should not own the same URL. In
the sketch, yours wins, and nothing reports it.
