// Runs on the server, in dev and in dist/server.js. Bake calls `fetch`.
import { assets, files, load } from "bun:bake";
import { renderToString } from "react-dom/server";

// "app/pages/blog/index.tsx" becomes "/blog".
const urlOf = (file: string) => file.replace(/^app\/pages|(\/index)?\.tsx$/g, "") || "/";

export default {
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    const file = files().find(f => urlOf(f) === path);
    if (!file) return new Response("Not found", { status: 404 });

    const { default: Page } = await load(file);
    const { js, css } = await assets(file); // in dev, js includes the hot reload runtime
    const props = { path };

    // Escape "<" so that page data cannot close the script tag.
    const page = JSON.stringify({ file, props }).replace(/</g, "\\u003c");
    const html = `<!doctype html>
${css.map(href => `<link rel="stylesheet" href="${href}">`).join("\n")}
<div id="root">${renderToString(<Page {...props} />)}</div>
<script id="page" type="application/json">${page}</script>
${js.map(src => `<script type="module" src="${src}"></script>`).join("\n")}`;

    return new Response(html, { headers: { "content-type": "text/html" } });
  },
};
