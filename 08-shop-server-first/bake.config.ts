import { defineConfig } from "bun:bake";
import routes from "@bun/routes";
import { reactServer } from "@bun/plugin-react";

// Build time only. `bun bake build` never bundles this file into dist/server.js.
export default defineConfig({
  framework: routes({ renderer: reactServer() }),
});
