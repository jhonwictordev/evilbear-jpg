"use client";

import { useMemo, useState } from "react";
import { beatGenres, beats } from "@/lib/beat-catalog";
import { BeatCard } from "./beat-card";

export function BeatsCatalog() { const [query, setQuery] = useState(""); const [genre, setGenre] = useState<(typeof beatGenres)[number]>("Todos"); const visible = useMemo(() => beats.filter((beat) => (genre === "Todos" || beat.genre.toLowerCase().includes(genre.toLowerCase())) && [beat.title, beat.genre, ...beat.tags].join(" ").toLowerCase().includes(query.toLowerCase())), [genre, query]); return <><div className="beat-filters"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar beats..." aria-label="Buscar beats" /></label><div>{beatGenres.map((item) => <button key={item} className={genre === item ? "is-active" : ""} onClick={() => setGenre(item)}>{item}</button>)}</div></div><p className="beat-results">{visible.length} {visible.length === 1 ? "beat encontrado" : "beats encontrados"}</p>{visible.length ? <div className="beat-grid">{visible.map((beat) => <BeatCard key={beat.id} beat={beat} />)}</div> : <div className="beat-empty"><span>×</span><h2>Nenhum beat encontrado.</h2><p>Tente outra busca ou filtro.</p></div>}</>; }
