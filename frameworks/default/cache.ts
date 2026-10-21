// Runs on the server. The page cache belongs to the framework, not Bake.
// SKETCH: memory only.
type Kept = { html: string; at: number; seconds: number };

const pages = new Map<string, Kept>();
let renderAgain: ((pathname: string) => Promise<string | null>) | undefined;

export function setRenderer(fn: typeof renderAgain) {
  renderAgain = fn;
}

export function keep(pathname: string, html: string, seconds: number) {
  pages.set(pathname, { html, at: Date.now(), seconds });
}

/** A kept page, or undefined. If it is old, render it again in the background. */
export function kept(pathname: string): string | undefined {
  const page = pages.get(pathname);
  if (page && Date.now() - page.at > page.seconds * 1000) void revalidate(pathname).catch(() => {});
  return page?.html;
}

/** Render this URL again now and replace the kept page. */
export async function revalidate(pathname: string): Promise<void> {
  const html = await renderAgain?.(pathname);
  const page = pages.get(pathname);
  if (html != null) keep(pathname, html, page?.seconds ?? 0);
}
