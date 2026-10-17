// Stand-in for a CMS or database.
export interface Post {
  id: string;
  title: string;
  body: string;
}

const posts: Post[] = [
  { id: "1", title: "Hello", body: "First post." },
  { id: "2", title: "Bake", body: "Second post." },
];

export async function listPosts(): Promise<Post[]> {
  return posts;
}

export async function getPost(id: string): Promise<Post | undefined> {
  return posts.find(p => p.id === id);
}
