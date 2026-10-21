// What app code imports, as "rsc-sketch/app".

/** Ends a route with the 404 page. Must run before the page starts to stream. */
export function notFound(): never {
  throw new Response("Not found", { status: 404 });
}
