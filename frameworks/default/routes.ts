// Pure helpers for the default framework's server file.

/** "app/routes/blog/[id].tsx" to "/blog/[id]". */
export function pathnameOf(file: string): string {
  return file.replace(/^app\/routes/, "").replace(/(\/index)?\.(tsx|ts|html)$/, "") || "/";
}

export const isLayout = (file: string) => file.endsWith("/_layout.tsx");
export const isRoute = (file: string) => file.startsWith("app/routes/") && !isLayout(file);

/** The layouts that wrap a route, outermost first. */
export function layoutsOf(file: string, layouts: string[]): string[] {
  return layouts
    .filter(layout => file.startsWith(layout.replace(/_layout\.tsx$/, "")))
    .sort((a, b) => a.length - b.length);
}

/** Fills the `[param]` parts of a pathname. */
export function fill(pathname: string, params: Record<string, string>): string {
  return pathname.replace(/\[(\w+)\]/g, (_, name) => params[name]!);
}

/** Matches a URL against "/blog/[id]". Returns the params, or null. */
export function match(pathname: string, url: string): Record<string, string> | null {
  const pattern = new URLPattern({ pathname: pathname.replace(/\[(\w+)\]/g, ":$1") });
  const hit = pattern.exec({ pathname: url });
  return hit ? (hit.pathname.groups as Record<string, string>) : null;
}
