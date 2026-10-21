import { addToCart, getCart } from "../../shop.ts";

// No default export, so this is an API route.
export async function GET(request: Request) {
  return Response.json(await getCart(request), { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const { productId } = await request.json();
  return Response.json(await addToCart(request, productId));
}
