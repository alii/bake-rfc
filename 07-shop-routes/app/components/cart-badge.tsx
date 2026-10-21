import { useEffect, useState } from "react";

type Cart = { items: { quantity: number }[] };

// Runs in the browser, so the page can be kept and still show this visitor's cart.
export function CartBadge({ productId }: { productId: string }) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    fetch("/api/cart").then(r => r.json()).then(setCart);
  }, []);

  async function add() {
    const response = await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId }) });
    setCart(await response.json());
  }

  const count = cart?.items.reduce((total, item) => total + item.quantity, 0);
  return <button onClick={add}>Add to cart ({count ?? "..."})</button>;
}
