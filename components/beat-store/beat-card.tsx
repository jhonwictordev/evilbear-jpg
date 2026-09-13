"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Beat, formatDuration, formatPrice } from "@/lib/beat-catalog";
import { useCart } from "./cart-provider";
import { BeatPlayer } from "./beat-player";

export function BeatCard({ beat }: { beat: Beat }) {
  const router = useRouter(); const { add } = useCart(); const defaultLicense = beat.licenses.find((license) => license.available)!;
  const buy = () => { add(beat, defaultLicense.id); router.push("/cart"); };
  return <article className="beat-card"><Link className="beat-card__cover" href={`/beats/${beat.slug}`}><img src={beat.cover} alt={`Capa do beat ${beat.title}`} /><span>{beat.genre}</span></Link><div className="beat-card__body"><div className="beat-card__title"><div><p>{beat.producer}</p><h2>{beat.title}</h2></div><span>{formatPrice(defaultLicense.priceCents)}+</span></div><BeatPlayer title={beat.title} duration={beat.duration} previewUrl={beat.previewUrl} compact /><dl><div><dt>BPM</dt><dd>{beat.bpm ?? "—"}</dd></div><div><dt>TOM</dt><dd>{beat.musicalKey ?? "—"}</dd></div><div><dt>DURAÇÃO</dt><dd>{formatDuration(beat.duration)}</dd></div></dl><div className="beat-card__tags">{beat.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="beat-card__actions"><Link href={`/beats/${beat.slug}`}>LICENÇAS</Link><button onClick={buy}>COMPRAR <span>↗</span></button></div></div></article>;
}
