# 08: Hono, with no framework package

Two files of yours. No routes, no React, no browser code.

```
bake.config.ts     # framework: { name: "my-api", server: "./server.ts" }
server.ts          # export default app
```

`bun bake` gives you restarts on edit and the error overlay. `bun bake build` writes
`dist/server.js`, and `bun ./dist/server.js` runs it.

An edit to a Hono sub-router should work too. Bake runs the changed file again, then
each file that imports it, up to `server.ts`. So Hono gets rebuilt with the new
handlers. This is the plan, and today's dev server does not do it.

Compare with `04-hono`: there, Hono sits next to the default framework's routes.
