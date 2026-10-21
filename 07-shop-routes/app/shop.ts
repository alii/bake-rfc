// Stands in for a real database. Server only: the build fails if browser code imports it.
export type Product = { id: string; name: string; price: number; description: string };
export type Cart = { items: { id: string; name: string; quantity: number }[] };

const products: Product[] = [
  { id: "mug", name: "Mug", price: 12, description: "Holds coffee." },
  { id: "shirt", name: "Shirt", price: 25, description: "Holds you." },
];
const carts = new Map<string, Cart>();

export const listProducts = async () => products;
export const getProduct = async (id: string) => products.find(p => p.id === id);

export function cartId(request: Request) {
  return request.headers.get("cookie")?.match(/cart=([^;]+)/)?.[1] ?? "anonymous";
}

export async function getCart(request: Request): Promise<Cart> {
  return carts.get(cartId(request)) ?? { items: [] };
}

export async function addToCart(request: Request, productId: string) {
  const cart = await getCart(request);
  const product = await getProduct(productId);
  if (!product) return cart;
  const item = cart.items.find(i => i.id === productId);
  if (item) item.quantity++;
  else cart.items.push({ id: product.id, name: product.name, quantity: 1 });
  carts.set(cartId(request), cart);
  return cart;
}
