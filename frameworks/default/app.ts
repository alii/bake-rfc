// What app code imports, as "default-framework/app". Runs on the server.
export { revalidate } from "./cache.ts";

/** Ends a route with the 404 page. */
export function notFound(): never {
  throw new Response("Not found", { status: 404 });
}

/** What a route file may export. The shape is a candidate: see apps/07-shop-routes. */
export interface Route<Props = any> {
  /** Runs only on the server. What it returns is the props. May return a `Response`. */
  server?(ctx: { params: Record<string, string>; request: Request }): Promise<Props | Response>;
  /** The page. Runs on the server, and in the browser if `browser` is true. */
  default?(props: Props): unknown;
  /** Write it as `export const browser = true`. Default false: the route ships no script. */
  browser?: boolean;
  /** How long the finished page is kept. A kept page never sees `request`. */
  cache?: false | "forever" | { revalidate: number };
  /** Which URLs of a `[param]` route to render at build time. */
  paths?(): Promise<Record<string, string>[]>;
}
