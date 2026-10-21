# 01: HTML pages, no config

The smallest app: HTML files in `app/routes/`. No `bake.config.ts`, no server.
With no config, Bake runs the default framework.

```
app/
  routes/
    index.html   -> /
    about.html   -> /about
  main.ts
  styles.css
```

## Commands

| Command          | What it does                |
| ---------------- | --------------------------- |
| `bun bake`       | Dev server with hot reload. |
| `bun bake build` | Writes `dist/`.             |
| `bun ./dist/server.js` | Runs the build. |

`bun ./app/routes/index.html` still works too: it serves that one page with no
config, as it does today.

## What `bun bake build` writes

The folder layout is a placeholder.

```
dist/
  server.js            # the default framework and a table of files
  client/
    index.html
    about.html
    main-[hash].js
    styles-[hash].css
```

## How the production server answers

| URL                                     | Answered by                  |
| --------------------------------------- | ---------------------------- |
| `/`, `/about`                           | Public file, served by Bake. |
| `/main-[hash].js`, `/styles-[hash].css` | Public file, served by Bake. |
| anything else                           | The default framework's 404. |

No JavaScript runs per request for a public file.

## Built HTML

The default framework gets each built page from `assets(file).html`.
