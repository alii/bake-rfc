// SKETCH. Runs in the browser. Reads the Flight data that the server inlined.
import { createFromReadableStream } from "flight-placeholder/client";
import { use } from "react";
import { hydrateRoot } from "react-dom/client";

declare const __flight: ReadableStream;

const tree = createFromReadableStream(__flight);
const Root = () => use(tree);
hydrateRoot(document, <Root />);
