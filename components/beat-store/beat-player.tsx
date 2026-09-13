"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatDuration } from "@/lib/beat-catalog";

const bars = [18, 34, 52, 28, 64, 38, 74, 44, 26, 57, 78, 45, 34, 62, 30, 72, 52, 24, 68, 38, 82, 48, 26, 58, 32, 74, 42, 62, 25, 57, 72, 38, 63, 30, 54, 76, 44, 26, 61, 35, 70, 48, 29, 64, 40, 79, 52, 31, 58, 36, 68, 43, 24, 56, 32, 73, 47, 28, 65, 38];

export function BeatPlayer({ title, duration, previewUrl, compact = false }: { title: string; duration: number; previewUrl?: string; compact?: boolean }) {
  const id = useId(); const audio = useRef<HTMLAudioElement | null>(null); const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0); const [notice, setNotice] = useState("");
  useEffect(() => { const stop = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) { audio.current?.pause(); setPlaying(false); } }; window.addEventListener("evb:beat-play", stop); return () => window.removeEventListener("evb:beat-play", stop); }, [id]);
  useEffect(() => { const element = audio.current; if (!element) return; const tick = () => setProgress(element.duration ? element.currentTime / element.duration : 0); element.addEventListener("timeupdate", tick); element.addEventListener("ended", () => setPlaying(false)); return () => element.removeEventListener("timeupdate", tick); }, []);
  const toggle = async () => { if (!previewUrl) { setNotice("Prévia em preparação — adicione o MP3 de demonstração no catálogo."); return; } if (playing) { audio.current?.pause(); setPlaying(false); return; } window.dispatchEvent(new CustomEvent("evb:beat-play", { detail: id })); try { await audio.current?.play(); setPlaying(true); setNotice(""); } catch { setNotice("Não foi possível reproduzir a prévia."); } };
  const seek = (event: React.MouseEvent<HTMLButtonElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const next = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)); if (audio.current?.duration) audio.current.currentTime = audio.current.duration * next; setProgress(next); };
  return <div className={compact ? "beat-player beat-player--compact" : "beat-player"}><audio ref={audio} src={previewUrl} preload="metadata" /><button className="beat-player__toggle" onClick={toggle} aria-label={playing ? `Pausar ${title}` : `Tocar ${title}`}>{playing ? "Ⅱ" : "▶"}</button><button className="beat-player__wave" onClick={seek} aria-label="Avançar na prévia">{bars.map((height, index) => <i key={index} style={{ height: `${height}%`, opacity: index / bars.length <= progress ? 1 : .45 }} />)}</button><span className="beat-player__time">{formatDuration(Math.floor(duration * progress))} / {formatDuration(duration)}</span>{notice && <small>{notice}</small>}</div>;
}
