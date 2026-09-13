import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeatDetail } from "@/components/beat-store/beat-detail";
import { StoreNav } from "@/components/beat-store/store-nav";
import { findBeat } from "@/lib/beat-catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const beat = findBeat((await params).slug); if (!beat) return { title: "Beat não encontrado | EVILBEAR.JPG" }; return { title: `${beat.title} — ${beat.genre} Beat | EVILBEAR.JPG`, description: `Ouça e licencie ${beat.title}, beat ${beat.genre} produzido por EVILBEAR.JPG.`, openGraph: { title: `${beat.title} | EVILBEAR.JPG`, description: beat.description, images: [beat.cover] } }; }
export default async function BeatPage({ params }: { params: Promise<{ slug: string }> }) { const beat = findBeat((await params).slug); if (!beat) notFound(); return <><StoreNav /><BeatDetail beat={beat} /></>; }
