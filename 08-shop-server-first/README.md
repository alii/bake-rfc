# Shop: server first, no directives

**Proposal, not decided.** Compare with `07-shop-routes`. Nothing here runs.

## The rule

- A component runs only on the server, and can be `async`.
- A component that uses browser features (`useState`, `onClick`) is live: it also
  runs in the browser. Only its props cross.
- There are no directives. The bundler works out the boundary.

## Files

| File | Shows |
| --- | --- |
| `app/routes/about.tsx` | No script at all, with no extra line. |
| `app/routes/products/[id].tsx` | Server content with a live button inside it. The personal part streams. |
| `app/components/add-to-cart.tsx` | Live, because it uses `useState`. |
| `app/routes/api/cart.ts` | An API route. |

## Compared with 07

Better: a live part can sit inside server content, and only that part ships.

Worse: it needs React's server component machinery, so it is React only. You
cannot tell where a file runs without seeing what it uses. Adding one `useState`
moves a file and its imports to the browser. A kept page that also has a personal
part needs a way to know which part is shared, and that is not designed here.
