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

Every page is a static file, so this can also be hosted without Bun:

```
dist/
  server.js          # optional: serves client/ with Bun
  client/            # upload this folder to any static host
    index.html
    docs/install.html
    app-[hash].css
```

## How the production server answers

All URLs are static routes, served natively. No JavaScript runs per request.
