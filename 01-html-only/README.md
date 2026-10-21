# 01: HTML pages, no config

The smallest app: HTML files in `app/routes/`. No `bake.config.ts`, no server.

```
app/
  routes/
    index.html   -> /
    about.html   -> /about
  main.ts
  styles.css
```

## Commands

| Command                | What it does                |
| ---------------------- | --------------------------- |
| `bun bake`             | Dev server with hot reload. |
| `bun bake build`       | Writes `dist/`.             |
| `bun ./dist/server.js` | Serves the build.           |

`bun ./app/routes/index.html` still works too: it serves that one page with no config, as it does today.

## What `bun bake build` writes

```
dist/
  server.js            # the handler; `bun ./dist/server.js` serves it
  bake.json            # the built files of each entry
  client/
    index.html
    about.html
    main-[hash].js
    styles-[hash].css
```

## How the production server answers

| URL                                     | Answered by                                    |
| --------------------------------------- | ---------------------------------------------- |
| `/`, `/about`                           | Static route: the built HTML, served natively. |
| `/main-[hash].js`, `/styles-[hash].css` | Static route, served natively.                 |
| anything else                           | The framework's 404.                           |

No JavaScript runs per request.
