"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Beat, formatDuration, formatPrice, relatedBeats } from "@/lib/beat-catalog";
import { BeatCard } from "./beat-card";
import { BeatPlayer } from "./beat-player";
import { useCart } from "./cart-provider";

export function BeatDetail({ beat }: { beat: Beat }) {
  const router = useRouter(); const { add } = useCart();
  const buy = (licenseId: string) => { add(beat, licenseId); router.push("/cart"); };
  return <main className="beat-detail"><section className="beat-detail__hero"><Link className="back-link" href="/beats">← VOLTAR AO CATÁLOGO</Link><div className="beat-detail__columns"><div className="beat-detail__cover"><img src={beat.cover} alt={`Capa de ${beat.title}`} /><span>EVILBEAR.JPG / BEAT STORE</span></div><div className="beat-detail__info"><p className="store-kicker">{beat.genre} / {beat.producer}</p><h1>{beat.title}</h1><p className="beat-detail__description">{beat.description}</p><dl><div><dt>BPM</dt><dd>{beat.bpm ?? "—"}</dd></div><div><dt>TONALIDADE</dt><dd>{beat.musicalKey ?? "—"}</dd></div><div><dt>DURAÇÃO</dt><dd>{formatDuration(beat.duration)}</dd></div></dl><div className="beat-card__tags">{beat.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><BeatPlayer title={beat.title} duration={beat.duration} previewUrl={beat.previewUrl} /></div></div></section><section className="licenses"><div><p className="store-kicker">LICENCIE ESTE BEAT</p><h2>ESCOLHA SUA<br /><span>LICENÇA.</span></h2></div><div className="license-grid">{beat.licenses.map((license) => <article className={license.available ? "license-card" : "license-card is-unavailable"} key={license.id}><div className="license-card__top"><div><p>{license.available ? "DISPONÍVEL" : "ESGOTADO"}</p><h3>{license.name}</h3></div><strong>{formatPrice(license.priceCents)}</strong></div><p className="license-card__description">{license.description}</p><ul><li><b>Arquivos</b>{license.files.join(" · ")}</li><li><b>Streams</b>{license.streamLimit}</li><li><b>Distribuição</b>{license.distribution}</li><li><b>Uso comercial</b>{license.commercial ? "Permitido" : "Não permitido"}</li>{license.rights.map((right) => <li key={right}>✓ {right}</li>)}</ul><button disabled={!license.available} onClick={() => buy(license.id)}>{license.available ? "COMPRAR LICENÇA ↗" : "INDISPONÍVEL"}</button></article>)}</div></section><section className="related section-shell"><p className="store-kicker">MAIS DO CATÁLOGO</p><h2>BEATS <span>RELACIONADOS.</span></h2><div className="beat-grid">{relatedBeats(beat).map((item) => <BeatCard key={item.id} beat={item} />)}</div></section></main>;
}
