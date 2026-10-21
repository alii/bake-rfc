// Types for the proposed APIs. Nothing here exists in Bun yet.

declare module "bun:bake" {
  /** A Vite/Rollup-style build plugin. Build time only, never bundled into production. */
  export interface Plugin {
    name: string;
    [hook: string]: unknown;
  }

  export interface Config {
    /** Build plugins, for example a page renderer (React) or CSS (Tailwind). */
    plugins?: Plugin[];
  }

  /** Does nothing at runtime. It exists for types and autocomplete. */
  export function defineConfig(config: Config | ((env: { mode: "development" | "production" }) => Config)): Config;

  // ---- Page functions of the default pages router ----
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

  /** Proposal: ends a route with the 404 page. */
  export function notFound(): never;
}

/** Stand-ins for plugins that would come from npm. */
declare module "@bun/plugin-react" {
  export default function react(): import("bun:bake").Plugin;
}
declare module "@bun/plugin-tailwind" {
  export default function tailwind(): import("bun:bake").Plugin;
}
