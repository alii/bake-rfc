import { listProducts, type Product } from "../shop.server.ts";

export const browser = false;
export const cache = { revalidate: 60 };

export async function server() {
  return { products: await listProducts() };
}

export default function Home({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          <a href={`/products/${p.id}`}>{p.name}</a>
        </li>
      ))}
    </ul>
  );
}
