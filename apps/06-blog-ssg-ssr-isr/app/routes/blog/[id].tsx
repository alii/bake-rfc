import { notFound } from "default-framework/app";
import { getPost, listPosts, type Post } from "../../posts.ts";

// Kept for 60 seconds, then refreshed in the background.
export const cache = { revalidate: 60 };

// Build time: which posts to render ahead of time.
// A post added after the build is rendered on its first request, then kept.
export async function paths() {
  return (await listPosts()).map(p => ({ id: p.id }));
}

export async function server({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  if (!post) return notFound();
  return { post };
}

export default function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
