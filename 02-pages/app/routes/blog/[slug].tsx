// Rendered on each request, because the HTML depends on the URL.
export default function Post({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>;
}
