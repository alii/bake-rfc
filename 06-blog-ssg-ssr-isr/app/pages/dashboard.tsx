import type { GetServerSideProps } from "bun:bake";

// Rendered on every request, because the HTML depends on who is asking.
export const getServerSideProps: GetServerSideProps<{ user: string }> = async ({ request }) => {
  const user = request.headers.get("x-user");
  if (!user) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { user } };
};

export default function Dashboard({ user }: { user: string }) {
  return <h1>Hi {user}</h1>;
}
