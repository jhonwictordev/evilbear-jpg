import type { Metadata } from "next";
import { CartPage } from "@/components/beat-store/cart-page";
import { StoreNav } from "@/components/beat-store/store-nav";
export const metadata: Metadata = { title: "Carrinho | EVILBEAR.JPG" };
export default function Page() { return <><StoreNav /><CartPage /></>; }
