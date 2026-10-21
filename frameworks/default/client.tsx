// Runs in the browser, only on routes with `browser = true`.
import { load } from "bun:bake/client";
import type { ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";

const { files, props } = JSON.parse(document.getElementById("bake-page")!.textContent!);
const [route, ...layouts] = await Promise.all<any>(files.map((file: string) => load(file)));

let tree: ReactNode = <route.default {...props} />;
for (const layout of layouts.reverse()) tree = <layout.default>{tree}</layout.default>;

hydrateRoot(document.getElementById("root")!, tree);
