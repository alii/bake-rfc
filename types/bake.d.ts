// Types for the proposed APIs. Nothing here exists in Bun yet, and nothing is decided.

/** Bake's API. It has no routes or pages. */
declare module "bun:bake" {
  export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

  // ---- Build side: runs in the config process ----

  /**
   * A Bun build plugin. Build time only, never bundled into production.
   * Proposed additions: a `graph` filter on `onLoad` and `onResolve`, and an `onTransform` hook.
   */
  export interface Plugin {
    name: string;
    [hook: string]: unknown;
  }

  export interface Config {
    /** The framework. Default: `routes()` from `@bun/routes`. */
    framework?: Framework;
    /** Build plugins. They run after the framework's plugins. */
    plugins?: Plugin[];
    outdir?: string;
    /** Asset URL prefix, for a CDN or a subpath. */
    publicPath?: string;
    minify?: boolean;
    sourcemap?: "none" | "linked" | "external";
  }

  /** Does nothing at runtime. It exists for types and autocomplete. */
  export function defineConfig(config: Config | ((env: { mode: "development" | "production" }) => Config)): Config;

  export type Graph = "client" | "server" | "ssr";

  export interface GraphOptions {
    /** For example `["react-server"]`. */
    conditions?: string[];
    define?: Record<string, string>;
    external?: string[];
  }

  /**
   * A framework: one object and one server file.
   *
   * A small SSR framework, complete. It has not been run. `render` is yours.
   *
   * ```ts
   * // my-ssr/index.ts: runs at build time.
   * import type { Framework } from "bun:bake";
   *
   * export default function mySsr(): Framework {
   *   return {
   *     name: "my-ssr",
   *     server: { entry: import.meta.resolve("./server.ts") },
   *     async entries({ glob }) {
   *       const files = await glob("pages/**\/*.tsx");
   *       return files.map(file => ({
   *         id: file,
   *         server: file,
   *         // To also ship the page to the browser: client: { file, drop: ["load"] }
   *         data: { pathname: file.replace(/^pages|\.tsx$/g, "").replace(/\/index$/, "") || "/" },
   *       }));
   *     },
   *   };
   * }
   *
   * // my-ssr/server.ts: runs in the server graph, in dev and production.
   * import { assets, entries, load, type Entry } from "bun:bake";
   * import { render } from "./render.ts";
   *
   * export default {
   *   async fetch(request: Request) {
   *     const { pathname } = new URL(request.url);
   *     const rows = entries() as readonly Entry<{ pathname: string }>[];
   *     const entry = rows.find(row => row.data?.pathname === pathname);
   *     if (!entry) return new Response("Not found", { status: 404 });
   *     const page = await load(entry.id);
   *     const { js, css } = await assets(entry.id); // in dev, `js` holds the hot reload client
   *     return new Response(render(page, js, css), { headers: { "content-type": "text/html" } });
   *   },
   * };
   * ```
   */
  export interface Framework {
    /** Used in errors. */
    name: string;
    /** Required. `entry` is the server file: its default export is the options `Bun.serve` takes. */
    server: GraphOptions & { entry: string };
    client?: GraphOptions & { reactFastRefresh?: boolean | { include: RegExp } };
    /** Present turns on the third graph. Absent costs nothing. */
    ssr?: GraphOptions;
    plugins?: Plugin[];
    /** Served as is, before `fetch`, in dev and production. */
    publicDir?: string;
    entries?(ctx: EntriesContext): Entry[] | Promise<Entry[]>;
    /** Return `false` to skip the default hot reload action. */
    changed?(change: Change): void | false | Promise<void | false>;
    /** Production only, after link. */
    built?(build: Built): void | Promise<void>;
  }

  /** `drop` removes these exports from this file's copy in this graph. */
  export type GraphFile = string | { file: string; drop?: string[] };

  export interface Entry<Data = unknown> {
    /** Any stable string. Bake never parses it. */
    id: string;
    server?: GraphFile;
    /** May be a `.html` file: see `Assets.html`. */
    client?: GraphFile;
    ssr?: GraphFile;
    /** JSON. Bake stores it and returns it, and never reads it. Stays on the server. */
    data?: Data;
  }

  export interface EntriesContext {
    root: string;
    mode: "development" | "production";
    /** Adding or removing a match re-runs `entries()`. */
    glob(pattern: string): Promise<string[]>;
    /** Parses and runs nothing. An edit re-runs `entries()`. `constants` holds exported literals only. */
    scan(file: string): Promise<{ exports: string[]; constants: Record<string, JSONValue> }>;
    /** A file or folder, for inputs that are not code. */
    watch(path: string): void;
  }

  export interface Change {
    graphs: Graph[];
    files: string[];
    /** Ids this change reaches. */
    entries: string[];
    /** To browsers: `on(topic, ...)` in `bun:bake/client`. */
    send(topic: string, data?: JSONValue): void;
  }

  export interface Built {
    /** The built handler, with no listener. */
    fetch(request: Request): Promise<Response>;
    load(id: string | Ref, graph?: "server" | "ssr"): Promise<any>;
    entries: readonly Entry[];
    assets(ids: string | Ref | (string | Ref)[]): Assets;
    /** Public. Keeps status and headers, and is served natively before `fetch`. */
    publish(pathname: string, body: Response | Blob | string): Promise<void>;
    /** Private. Read at run time with `output()`. */
    write(path: string, body: Response | Blob | string): Promise<void>;
    files: { path: string; graph: Graph; kind: "js" | "css" | "asset" | "sourcemap"; entry?: string }[];
    outDir: string;
    /** Static site: leave out the server output. */
    noServer(): void;
  }

  // ---- Run side: the server and ssr graphs. Same results in dev and production ----

  /** What a `with { graph: "client" }` import gives. No code runs. */
  export interface Ref {
    readonly id: string;
  }

  export interface Assets {
    /** Script URLs, in order. One set for the whole list of ids. */
    js: string[];
    /** Includes CSS imported by server code. */
    css: string[];
    preload: string[];
    /** Client refs these ids reach. */
    refs: Record<string, { js: string[]; css: string[]; exports: string[] }>;
    /** For an entry whose client file is `.html`, with tags in place. */
    html?: string;
  }

  /** `load()` and `assets()` reject with this. In dev it shows the error overlay. */
  export class BakeBuildError extends Error {}

  /** Live in dev. A new array only when rows change. */
  export function entries(): readonly Entry[];
  /** Builds on first use in dev. A table lookup in production. Call it per request. */
  export function load(id: string | Ref, graph?: "server" | "ssr"): Promise<any>;
  /** Pass the whole group at once: a page, its layouts and any boot entry. */
  export function assets(ids: string | Ref | (string | Ref)[]): Promise<Assets>;
  /** A file from `Built.write`. `null` in dev. */
  export function output(path: string): Bun.BunFile | null;
  /** For inputs Bake cannot see, such as a CMS webhook. */
  export function refreshEntries(): Promise<void>;
}

/** Bake's API in the client graph. */
declare module "bun:bake/client" {
  export function load(id: string | import("bun:bake").Ref): Promise<any>;
  export function on(topic: string, listener: (data: import("bun:bake").JSONValue) => void): void;
  export function onUpdate(
    listener: (event: { clientCodeChanged: boolean; files: string[]; preventDefault(): void }) => void,
  ): void;
}

/** For a framework with its own command line. */
declare module "bun:bake/tool" {
  import type { Framework } from "bun:bake";

  export function dev(
    framework: Framework,
    options?: { port?: number },
  ): Promise<{ url: string; close(): Promise<void>; refreshEntries(): Promise<void> }>;
  export function build(framework: Framework, options?: { outdir?: string }): Promise<unknown>;
}

/** Bun's own framework, separate from Bake. An ordinary package on the `bun:bake` API. */
declare module "@bun/routes" {
  export interface Renderer {
    name: string;
  }

  export default function routes(options?: { dir?: string; renderer?: Renderer }): import("bun:bake").Framework;

  // ---- Page functions ----
  // Names copied from the Next.js pages router for now. To be redesigned later.

  type Params = Record<string, string | string[]>;

  /** Which URLs of a `[param]` page to build ahead of time. Runs at build time only. */
  export type GetStaticPaths = () => Promise<{
    paths: { params: Params }[];
    /** `false`: other URLs are 404. `"blocking"`: render other URLs on first request, then cache. */
    fallback: false | "blocking";
  }>;

  /** Data for a page rendered ahead of time. */
  export type GetStaticProps<Props> = (ctx: { params: Params }) => Promise<
    | {
        props: Props;
        /** Seconds. After this, the next request gets the cached page and a new one is rendered in the background. */
        revalidate?: number | false;
      }
    | { notFound: true }
  >;

  /**
   * Data for a page rendered on every request.
   * Differs from Next.js: gets a web `Request`, not Node's `req`/`res`.
   */
  export type GetServerSideProps<Props> = (ctx: { params: Params; request: Request }) => Promise<
    | { props: Props }
    | { notFound: true }
    | { redirect: { destination: string; permanent: boolean } }
  >;

  /** Render this URL again now and replace the cached page (on-demand ISR). */
  export function revalidate(path: string): Promise<void>;

  /** Ends a route with the 404 page. It throws a 404 `Response`, which the framework renders. */
  export function notFound(): never;
}

/** Stand-ins for plugins that would come from npm. */
declare module "@bun/plugin-react" {
  export default function react(): import("@bun/routes").Renderer;
  export function reactServer(): import("@bun/routes").Renderer;
}
declare module "@bun/plugin-tailwind" {
  export default function tailwind(): import("bun:bake").Plugin;
}
