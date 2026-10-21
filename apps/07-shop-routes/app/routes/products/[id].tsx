import { notFound } from "default-framework/app";
import { CartBadge } from "../../components/cart-badge.tsx";
import { getProduct, type Product } from "../../shop.server.ts";

export const browser = true;
export const cache = { revalidate: 3600 };

// Shared by every visitor, so it gets no `request`.
export async function server({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();
  return { product };
}

export default function ProductPage({ product }: { product: Product }) {
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <CartBadge productId={product.id} />
    </article>
  );
}
