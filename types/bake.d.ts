// The whole proposed API. Names are placeholders. Nothing here exists yet.

declare module "bun:bake" {
  import type { BunPlugin, PluginBuilder } from "bun";

  /** A framework. `./` paths are relative to the file that exports this object. */
  export interface Framework {
    /** Used in error messages. */
    name: string;
    /** Bake sends requests to this file's default export. See `ServerFile`. */
    server: string;
    /** Runs in the browser, on every page that gets scripts. */
    client?: string;
    /** Globs, from the project root. App files that `load` and `assets` can name. */
    files?: string | string[];
    plugins?: Plugin[];

    // Extras. See ADVANCED.md.

    /** Export names to remove from the browser copy of each file in `files`. */
    serverExports?: string[];
    /** Should this file get a browser copy? Default: yes. */
    inClient?(file: string, source: string): boolean;
    /** Package export conditions for server code, such as "react-server". OPEN. */
    conditions?: string[];
    /** A third copy: browser code built to run on the server. Needed for RSC. OPEN. */
    ssr?: string;
  }

  /** bake.config.ts. Optional. */
  export interface Config {
    /** A package name, or an object. Default: the default framework. */
    framework?: string | Framework;
    /** Run after the framework's plugins. */
    plugins?: Plugin[];
  }

  /** The default export of the framework's server file. */
  export interface ServerFile {
    fetch(request: Request, server: Bun.Server<any>): Response | undefined | Promise<Response | undefined>;
    /** As in `Bun.serve`. */
    routes?: Bun.Serve.Routes<any, string>;
    /** As in `Bun.serve`. */
    websocket?: Bun.WebSocketHandler<any>;
    /** Extra. Called once by `bun bake build`. Bake fetches each URL and saves the answer. */
    prerender?(): Prerender[] | Promise<Prerender[]>;
  }

  /** A string is a public file, served before `fetch`. Private ones are read with `saved`. */
  export type Prerender = string | { url: string; private: true };

  /** Paths from the project root, such as "app/pages/about.tsx". Live in dev. */
  export function files(): readonly string[];

  /** The server copy of a file from `files()`. Call it per request, so that edits apply. */
  export function load(file: string): Promise<any>;

  /**
   * What a page must link, so the browser fetches it all at the same time. Includes
   * `client` if the files named have a browser copy.
   */
  export function assets(file: string | string[]): Promise<Assets>;

  export interface Assets {
    /** Script URLs in order, all `type="module"`. In dev, includes the hot reload runtime. */
    js: string[];
    /** Stylesheet URLs in order. */
    css: string[];
    /** Set for an .html file: the built page, with its tags in place. */
    html?: string;
  }

  /** Extra. A private page from `prerender`, or null. Always null in dev. */
  export function saved(url: string): Promise<string | null>;

  /** Extra, OPEN. The module of the framework's `ssr` file. */
  export function ssrEntry(): Promise<any>;

  export type Plugin = Omit<BunPlugin, "setup"> & {
    setup(build: PluginBuilder & { bake: BakeBuild }): void | Promise<void>;
  };

  /** Extra, OPEN. The only way code crosses from one copy to another. */
  export interface BakeBuild {
    /** Add a file to the build while it runs. Returns the name for `assets` and `load`. */
    addFile(file: string, to: "client" | "ssr"): string;
  }
}

declare module "bun" {
  /** Bun passes this today. Its types do not list it yet. */
  interface OnLoadArgs {
    side: "client" | "server";
  }
}

declare module "bun:bake/client" {
  /** The browser copy of a file. Takes the same name as on the server. */
  /** A file listed by `assets` on this page needs no extra request. Others are fetched. */
  export function load(file: string): Promise<any>;
}

/** Extra: for a framework with its own command line. */
declare module "bun:bake/tool" {
  import type { Framework } from "bun:bake";

  /** With an object, use absolute paths: `import.meta.resolve("./server.ts")`. */
  export function dev(
    framework: string | Framework,
    options?: { port?: number },
  ): Promise<{ url: URL; close(): Promise<void> }>;
  export function build(framework: string | Framework, options?: { outdir?: string }): Promise<void>;
}
