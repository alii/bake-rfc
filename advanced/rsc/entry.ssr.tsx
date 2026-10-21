// SKETCH. The third copy: client code, built to run on the server.
// Turns the Flight stream into the first HTML.
import { load, type Assets } from "bun:bake";
import { createFromReadableStream } from "flight-placeholder/ssr";
import { use } from "react";
import { renderToReadableStream } from "react-dom/server";

export async function render(flight: ReadableStream, ids: string[], found: Assets[]) {
  const [forHtml, forBrowser] = flight.tee();

  // Flight needs client modules synchronously, so load them all first. In this copy,
  // `load` gives the ssr copy of a file.
  const modules = new Map(await Promise.all(ids.map(async id => [id, await load(id)] as const)));
  const tree = createFromReadableStream(forHtml, { manifest: { require: (id: string) => modules.get(id) } });
  const Root = () => use(tree);

  const css = [...new Set(found.flatMap(f => f.css))];
  const js = [...new Set(found.flatMap(f => f.js))];
  const html = await renderToReadableStream(
    <html>
      <head>
        {css.map(href => <link key={href} rel="stylesheet" href={href} />)}
      </head>
      <body>
        <Root />
      </body>
    </html>,
    { bootstrapModules: js },
  );

  // A real framework interleaves `forBrowser` into the HTML as inline script chunks,
  // and client.tsx reads them.
  void forBrowser;
  return html;
}
