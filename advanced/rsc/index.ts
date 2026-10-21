// SKETCH. The framework object for React Server Components. See ADVANCED.md.
import type { Framework } from "bun:bake";
import boundary from "./plugin.ts";

export default {
  name: "rsc-sketch",
  server: "./server.tsx",
  client: "./client.tsx",
  files: "app/routes/**/*.{tsx,ts}",
  conditions: ["react-server"],
  ssr: "./entry.ssr.tsx",
  plugins: [boundary],
  // API routes and server components have no browser copy. The plugin adds live files.
  inClient: () => false,
} satisfies Framework;
