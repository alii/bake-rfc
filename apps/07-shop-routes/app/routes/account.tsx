import { Suspense, use } from "react";
import { getCart, type Cart } from "../shop.server.ts";

// No script, so the HTML itself streams. A promise prop on a route with
// `browser = true` would need a way to stream props. That is not designed.
export const browser = false;
export const cache = false; // personal, so never kept

export async function server({ request }: { request: Request }) {
  return {
    user: request.headers.get("x-user") ?? "guest", // in the first bytes
    cart: getCart(request), // a promise, not awaited: streams in
  };
}

function CartList({ cart }: { cart: Promise<Cart> }) {
  return (
    <ul>
      {use(cart).items.map(item => (
        <li key={item.id}>
          {item.name} x {item.quantity}
        </li>
      ))}
    </ul>
  );
}

export default function Account({ user, cart }: { user: string; cart: Promise<Cart> }) {
  return (
    <>
      <h1>Hi {user}</h1>
      <Suspense fallback={<p>Loading your cart...</p>}>
        <CartList cart={cart} />
      </Suspense>
    </>
  );
}
