# Shop: one route shape

**Proposal, not decided.** Compare with `08-shop-server-first`. Nothing here runs.

## The rule

- `server` runs only on the server. What it returns is the props.
- `default` runs on the server, and also in the browser if `browser = true`.
- With `browser = false`, the route ships no script.
- `await` in `server` means wait. A promise that is not awaited streams in later.
- `cache` says how long the finished page is kept. A kept page never sees `request`.
- A file with no default export is an API route.

No directives. Anything only `server` uses never reaches the browser.

## Files

| File | Shows |
| --- | --- |
| `app/routes/about.tsx` | No script at all. |
| `app/routes/index.tsx` | Data, kept for a minute, no script. |
| `app/routes/products/[id].tsx` | Kept page. The cart loads in the browser from its own URL. |
| `app/routes/account.tsx` | Not kept. The orders stream in with `Suspense`. |
| `app/routes/api/cart.ts` | An API route. |

## The limit

A route is fully interactive, or it ships no script. On `products/[id].tsx` the
whole page hydrates, so a small live button means the page's code ships too.
