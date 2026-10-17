import { revalidate } from "bun:bake";

export default {
  routes: {
    // On-demand ISR: a CMS webhook calls this after a post changes.
    "/api/revalidate/:id": {
      async POST(req: Bun.BunRequest<"/api/revalidate/:id">) {
        if (req.headers.get("authorization") !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        await revalidate(`/blog/${req.params.id}`);
        return Response.json({ revalidated: true });
      },
    },
  },
};
