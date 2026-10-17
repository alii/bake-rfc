import type { GetStaticPaths, GetStaticProps } from "bun:bake";
import { getPost, listPosts, type Post } from "../../posts.ts";

// Build time: which posts to render ahead of time.
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await listPosts();
  return {
    paths: posts.map(p => ({ params: { id: p.id } })),
    // A post added after the build is rendered on its first request, then cached.
    fallback: "blocking",
  };
};

// Build time, and again in the background at most every 60 seconds (ISR).
export const getStaticProps: GetStaticProps<{ post: Post }> = async ({ params }) => {
  const post = await getPost(String(params.id));
  if (!post) return { notFound: true };
  return { props: { post }, revalidate: 60 };
};

export default function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
