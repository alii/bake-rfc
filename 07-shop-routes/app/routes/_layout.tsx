import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav>
        <a href="/">Shop</a> <a href="/about">About</a> <a href="/account">Account</a>
      </nav>
      <main>{children}</main>
    </>
  );
}
