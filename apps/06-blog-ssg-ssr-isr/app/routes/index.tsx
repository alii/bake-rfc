// No data and no URL values: rendered once at build time, served as a public file.
export default function Home() {
  return (
    <main>
      <h1>My blog</h1>
      <a href="/blog/1">First post</a>
    </main>
  );
}
