# RSC sketch

**A sketch, not a design.** `plugin.ts` and `server.tsx` show that the extras in
[ADVANCED.md](../../ADVANCED.md) reach far enough to try this. Nothing here runs.
`flight-placeholder` is not a real package.

`app/` is the shop, written server first:

- A component runs only on the server, and can be `async`.
- A component that uses browser features (`useState`, `onClick`) is live. It also runs
  in the browser, and only its props cross.
- There are no directives. A plugin works out the boundary.

| Compared with `apps/07-shop-routes` | |
| --- | --- |
| Better | A live part can sit inside server content, and only that part ships. |
| Worse | It is React only. |
| Worse | You cannot tell where a file runs without seeing what it uses. |
| Worse | One `useState` moves a file and its imports to the browser. |
| Worse | A kept page with a personal part needs a rule for which part is shared. There is none. |

Known problems:

- The boundary rule is unsound. The plugin reads one file at a time, so it cannot see a
  custom hook from another file.
- `notFound()` can come too late in a streamed page. Here it runs before any stream,
  but the rule is not stated.
