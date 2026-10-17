import { defineConfig } from "bun:bake";
import tailwind from "@bun/plugin-tailwind";

export default defineConfig({
  plugins: [tailwind()],
});
