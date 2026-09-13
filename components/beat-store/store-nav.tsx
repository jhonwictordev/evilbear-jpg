"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function StoreNav() {
  const { count } = useCart();
  return <header className="store-nav"><Link className="store-nav__brand" href="/"><img src="/evilbear-logo.webp" alt="EVILBEAR.JPG" /></Link><nav><Link href="/">Início</Link><Link href="/beats">Beats</Link><Link href="/#services">Serviços</Link><Link href="/#contact">Contato</Link></nav><Link className="store-nav__cart" href="/cart" aria-label={`Carrinho com ${count} itens`}>CARRINHO <span>{count}</span></Link></header>;
}
