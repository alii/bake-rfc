# 03: Routes plus your own backend

Add `app/server.ts` to handle what routes in `app/routes/` don't: an API, webhooks, a custom 404.

```
bake.config.ts       # framework: routes({ renderer: react() })
app/
  server.ts          # your backend: routes, fetch, websocket
  routes/
    index.tsx        -> /
```

## What `bun bake` and `dist/server.js` do

They start the server with the framework's routes plus your `routes`, then your
`fetch` for everything else. You never call `Bun.serve`.

## How the production server answers

| URL | Answered by |
| --- | --- |
| `/` | Static route (prerendered page), native. |
| client JS and CSS | Static routes, native. |
| `/health` | Your static route (a `Response`), native. |
| `/api/hello` | Your route handler. |
| `/chat` | Your `fetch`, which upgrades it to your `websocket`. |
| anything else | Your `fetch` (your 404). |

## Rule

A file in `app/routes/` and one of your `routes` can't own the same URL.
`@bun/routes` reports the clash as an error instead of picking one.
