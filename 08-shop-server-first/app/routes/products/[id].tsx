import { notFound } from "bun:bake";
import { Suspense } from "react";
import { AddToCart } from "../../components/add-to-cart.tsx";
import { getCart, getProduct } from "../../shop.ts";

async function CartSummary({ request }: { request: Request }) {
  const cart = await getCart(request);
  return <p>{cart.items.length} items in your cart</p>;
}

export default async function ProductPage({
  params,
  request,
}: {
  params: { id: string };
  request: Request;
}) {
  const product = await getProduct(params.id);
  if (!product) return notFound();
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCart productId={product.id} />
      <Suspense fallback={<p>Loading your cart...</p>}>
        <CartSummary request={request} />
      </Suspense>
    </article>
  );
}
