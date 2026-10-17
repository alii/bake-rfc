# 01: HTML pages, no config

The smallest app: HTML files in `app/pages/`. No `bake.config.ts`, no server.

```
app/
  pages/
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

`bun ./app/pages/index.html` still works too: it serves that one page with no config, as it does today.

## What `bun bake build` writes

```
dist/
  server.js            # starts Bun.serve with the route table below
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
| anything else                           | Bake's built-in 404.                           |

No JavaScript runs per request.
