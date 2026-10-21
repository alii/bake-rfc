# 00: The tiny framework

Two pages on `frameworks/tiny`. The button works, because the page hydrates.

```
bake.config.ts       # framework: "tiny-framework"
app/pages/
  index.tsx          -> /
  about.tsx          -> /about
```

| Command | What it does |
| --- | --- |
| `bun bake` | Dev server with hot reload. |
| `bun bake build` | Writes `dist/`. |
| `bun ./dist/server.js` | Runs the build. |

The tiny framework has no data loading. A page gets only `path`. To add data, see
[server-only exports](../../ADVANCED.md#server-only-exports).
