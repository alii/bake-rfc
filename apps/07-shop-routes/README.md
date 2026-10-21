# Shop: one route shape

**Candidate, not decided.** Compare with `advanced/rsc`. Nothing here runs.

`frameworks/default/` implements this shape. It belongs to the default framework.
Bake sees only files and the export names to remove.

## The rule

- `server` runs only on the server. What it returns is the props.
- `default` runs on the server, and also in the browser if `browser = true`.
- With no `browser`, or `browser = false`, the route ships no script.
- `cache` says how long the finished page is kept. A kept page never sees `request`.
- A file with no default export is an API route.
- `*.server.ts` files are server only. The build fails if browser code imports one.

No directives. Anything only `server` uses never reaches the browser.

`notFound()` from `default-framework/app` ends the route with the 404 page. `server`
may also return a plain `Response`, which is sent as is.

## Files

| File | Shows |
| --- | --- |
| `app/routes/about.tsx` | No script at all. |
| `app/routes/index.tsx` | Data, kept for a minute, no script. |
| `app/routes/products/[id].tsx` | Kept page. The cart loads in the browser from its own URL. |
| `app/routes/account.tsx` | Not kept. The cart streams in with `Suspense`. |
| `app/routes/api/cart.ts` | An API route. |
| `app/shop.server.ts` | Server-only data. |

## The limit

A route is fully interactive, or it ships no script. On `products/[id].tsx` the
whole page hydrates, so a small live button means the page's code ships too.
