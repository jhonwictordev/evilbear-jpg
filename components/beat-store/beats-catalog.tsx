"use client";

import { useMemo, useState } from "react";
import { beatGenres, beats } from "@/lib/beat-catalog";
import { BeatCard } from "./beat-card";

type StoreLanguage = "pt" | "en";

export function BeatsCatalog({ language = "pt" }: { language?: StoreLanguage }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<(typeof beatGenres)[number]>("Todos");
  const visible = useMemo(() => beats.filter((beat) => (genre === "Todos" || beat.genre.toLowerCase().includes(genre.toLowerCase())) && [beat.title, beat.genre, ...beat.tags].join(" ").toLowerCase().includes(query.toLowerCase())), [genre, query]);
  const text = language === "pt"
    ? { search: "Buscar beats...", results: "beats encontrados", result: "beat encontrado", emptyTitle: "Nenhum beat encontrado.", emptyText: "Tente outra busca ou filtro.", all: "Todos" }
    : { search: "Search beats...", results: "beats found", result: "beat found", emptyTitle: "No beats found.", emptyText: "Try another search or filter.", all: "All" };

  return <><div className="beat-filters"><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} aria-label={text.search} /></label><div>{beatGenres.map((item) => <button key={item} className={genre === item ? "is-active" : ""} onClick={() => setGenre(item)}>{item === "Todos" ? text.all : item}</button>)}</div></div><p className="beat-results">{visible.length} {visible.length === 1 ? text.result : text.results}</p>{visible.length ? <div className="beat-grid">{visible.map((beat) => <BeatCard key={beat.id} beat={beat} />)}</div> : <div className="beat-empty"><span>×</span><h2>{text.emptyTitle}</h2><p>{text.emptyText}</p></div>}</>;
}
