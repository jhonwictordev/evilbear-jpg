import type { Metadata } from "next";
import { BeatsCatalog } from "@/components/beat-store/beats-catalog";
import { StoreNav } from "@/components/beat-store/store-nav";

export const metadata: Metadata = { title: "Beat Store | EVILBEAR.JPG", description: "Encontre beats Trap, Drill, R&B, Hip Hop e Boom Bap para seu próximo projeto.", openGraph: { title: "Beat Store | EVILBEAR.JPG", description: "Encontre o som do seu próximo projeto.", images: ["/og.jpg"] } };
export default function BeatsPage() { return <><StoreNav /><main className="beats-page store-page"><section className="store-page__hero"><p className="store-kicker">EVILBEAR.JPG / CATÁLOGO</p><h1>BEAT <span>STORE.</span></h1><p>Encontre o som do seu próximo projeto.</p></section><BeatsCatalog /></main></>; }
