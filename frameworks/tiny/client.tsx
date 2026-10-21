// Runs in the browser. Makes the server's HTML interactive.
import { load } from "bun:bake/client";
import { hydrateRoot } from "react-dom/client";

const { file, props } = JSON.parse(document.getElementById("page")!.textContent!);
const { default: Page } = await load(file);

hydrateRoot(document.getElementById("root")!, <Page {...props} />);
