# 05: A static site with Tailwind

HTML pages plus one plugin. This replaces `[serve.static] plugins` in
`bunfig.toml`, which can only name a plugin, not pass it options.

```
bake.config.ts       # plugins: [tailwind()]
app/
  app.css            # @import "tailwindcss"
  routes/
    index.html       -> /
    docs/
      install.html   -> /docs/install
```

## Output

Every page is a public file. The layout is a placeholder.

```
dist/
  server.js          # only used by `bun ./dist/server.js`
  client/            # upload this folder to any static host
    index.html
    docs/install.html
    app-[hash].css
```

## How the production server answers

All URLs are public files. No JavaScript runs per request.
