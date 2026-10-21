// Rendered on every request, because the HTML depends on who is asking.
export const cache = false;

export async function server({ request }: { request: Request }) {
  const user = request.headers.get("x-user");
  if (!user) return Response.redirect("/", 302);
  return { user };
}

export default function Dashboard({ user }: { user: string }) {
  return <h1>Hi {user}</h1>;
}
