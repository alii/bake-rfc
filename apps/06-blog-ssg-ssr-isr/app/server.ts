// Runs on the server. The default framework loads this file.
import { revalidate } from "default-framework/app";

export default {
  routes: {
    // A CMS webhook calls this after a post changes.
    "/api/revalidate/:id": {
      async POST(req: Bun.BunRequest<"/api/revalidate/:id">) {
        if (req.headers.get("authorization") !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        revalidate(`/blog/${req.params.id}`);
        return Response.json({ revalidated: true });
      },
    },
  },
};
