import { useState } from "react";

// Uses `useState`, so it is live. It is the only code on the page that ships.
export function AddToCart({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  async function add() {
    await fetch("/api/cart", { method: "POST", body: JSON.stringify({ productId }) });
    setAdded(true);
  }

  return <button onClick={add}>{added ? "Added" : "Add to cart"}</button>;
}
