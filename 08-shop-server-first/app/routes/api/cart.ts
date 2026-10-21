import { addToCart } from "../../shop.ts";

export async function POST(request: Request) {
  const { productId } = await request.json();
  return Response.json(await addToCart(request, productId));
}
