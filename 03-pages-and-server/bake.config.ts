import { defineConfig } from "bun:bake";
import react from "@bun/plugin-react";

// Build time only. `bun bake build` never bundles this file into dist/server.js.
export default defineConfig({
  plugins: [react()],
});
