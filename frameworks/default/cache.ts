// Runs on the server. The page cache belongs to the framework, not Bake.
// SKETCH: memory only.
export type Kept = { html: string | null; at: number; seconds: number };

const pages = new Map<string, Kept>();

export const kept = (pathname: string) => pages.get(pathname);

export const isOld = (page: Kept) => Date.now() - page.at > page.seconds * 1000;

export function keep(pathname: string, html: string, seconds: number) {
  pages.set(pathname, { html, at: Date.now(), seconds });
}

/** The next visitor to this URL gets a fresh render. */
export function revalidate(pathname: string) {
  pages.set(pathname, { html: null, at: 0, seconds: 0 });
}
