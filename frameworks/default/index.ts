// The default framework, as Bake sees it. Bake uses it when an app names no framework.
import type { Framework } from "bun:bake";

export default {
  name: "default-framework",
  server: "./server.tsx",
  client: "./client.tsx",
  files: ["app/routes/**/*.{tsx,ts,html}", "app/server.ts"],

  // The extras it needs. See ADVANCED.md.

  // Removed from the browser copy of a route. So is anything only they use.
  serverExports: ["server", "cache", "paths", "browser"],

  // Which files get a browser copy. Other routes ship no script.
  inClient(file, source) {
    if (file.endsWith(".html") || file.endsWith("/_layout.tsx")) return true;
    return /export const browser = true/.test(source);
  },

  plugins: [
    {
      name: "server-files-stay-on-the-server",
      setup(build) {
        build.onLoad({ filter: /\.server\.tsx?$/ }, args => {
          if (args.side === "client") throw new Error(`${args.path} is server only, and browser code imports it.`);
          return undefined; // on the server, load it as usual
        });
      },
    },
  ],
} satisfies Framework;
