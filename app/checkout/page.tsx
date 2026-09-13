import type { Metadata } from "next";
import { CheckoutPage } from "@/components/beat-store/checkout-page";
import { StoreNav } from "@/components/beat-store/store-nav";
export const metadata: Metadata = { title: "Checkout | EVILBEAR.JPG" };
export default function Page() { return <><StoreNav /><CheckoutPage /></>; }
