import { useState } from "react";

export default function Home({ path }: { path: string }) {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>You are at {path}</h1>
      <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
      <a href="/about">About</a>
    </main>
  );
}
