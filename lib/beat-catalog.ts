export type License = {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  files: string[];
  rights: string[];
  streamLimit: string;
  distribution: string;
  commercial: boolean;
  available: boolean;
};

export type Beat = {
  id: string;
  slug: string;
  title: string;
  description: string;
  producer: string;
  bpm: number;
  musicalKey: string;
  duration: number;
  genre: string;
  tags: string[];
  cover: string;
  previewUrl?: string;
  published: boolean;
  licenses: License[];
};

const standardLicenses: License[] = [
  { id: "mp3", name: "MP3", priceCents: 4990, description: "Licença digital para lançamentos e conteúdo.", files: ["MP3 320kbps"], rights: ["Uso comercial", "Monetização em redes"], streamLimit: "100 mil streams", distribution: "Até 1 lançamento", commercial: true, available: true },
  { id: "wav", name: "WAV", priceCents: 7990, description: "Áudio sem compressão para seu lançamento final.", files: ["WAV 24-bit", "MP3 320kbps"], rights: ["Uso comercial", "Monetização em redes", "Videoclipe"], streamLimit: "500 mil streams", distribution: "Até 2 lançamentos", commercial: true, available: true },
  { id: "stems", name: "WAV + STEMS", priceCents: 14990, description: "Controle completo da mix com as pistas separadas.", files: ["WAV 24-bit", "MP3 320kbps", "STEMS WAV"], rights: ["Uso comercial", "Monetização em redes", "Videoclipe", "Shows"], streamLimit: "Ilimitado", distribution: "Ilimitada", commercial: true, available: true },
  { id: "exclusive", name: "EXCLUSIVA", priceCents: 49990, description: "Retira o beat do catálogo após a compra confirmada.", files: ["WAV 24-bit", "MP3 320kbps", "STEMS WAV", "Projeto, quando disponível"], rights: ["Uso comercial", "Exploração exclusiva", "Distribuição ilimitada"], streamLimit: "Ilimitado", distribution: "Ilimitada", commercial: true, available: true },
];

const licenseSet = () => standardLicenses.map((license) => ({ ...license, files: [...license.files], rights: [...license.rights] }));

export const beats: Beat[] = [
  { id: "beat_enemies", slug: "enemies", title: "ENEMIES", description: "Drake hard rap / trap beat com textura sombria e bateria cortante.", producer: "EVILBEAR.JPG", bpm: 156, musicalKey: "F# Minor", duration: 168, genre: "Trap", tags: ["trap", "rap", "dark", "drake"], cover: "/site-image.webp", published: true, licenses: licenseSet() },
  { id: "beat_no_signal", slug: "no-signal", title: "NO SIGNAL", description: "Dark trap espacial, feito para barras densas e refrão memorável.", producer: "EVILBEAR.JPG", bpm: 142, musicalKey: "C Minor", duration: 194, genre: "Dark Trap", tags: ["trap", "dark", "space", "melodic"], cover: "/mascot.png", published: true, licenses: licenseSet() },
  { id: "beat_nightmare", slug: "nightmare", title: "NIGHTMARE", description: "Trap cinematográfico com tensão, graves pesados e atmosfera noturna.", producer: "EVILBEAR.JPG", bpm: 138, musicalKey: "D# Minor", duration: 176, genre: "Trap", tags: ["trap", "cinematic", "dark", "night"], cover: "/site-image.webp", published: true, licenses: licenseSet() },
  { id: "beat_red_room", slug: "red-room", title: "RED ROOM", description: "R&B alternativo com baixo quente e espaço para voz íntima.", producer: "EVILBEAR.JPG", bpm: 96, musicalKey: "A Minor", duration: 205, genre: "R&B", tags: ["r&b", "soul", "late-night", "smooth"], cover: "/mascot.png", published: true, licenses: licenseSet() },
  { id: "beat_still_ghost", slug: "still-ghost", title: "STILL GHOST", description: "Drill fria e precisa, com espaço para flows agressivos.", producer: "EVILBEAR.JPG", bpm: 146, musicalKey: "G Minor", duration: 158, genre: "Drill", tags: ["drill", "uk", "dark", "rap"], cover: "/site-image.webp", published: true, licenses: licenseSet() },
  { id: "beat_lost_tape", slug: "lost-tape", title: "LOST TAPE", description: "Boom bap empoeirado com bateria crua e recortes de fita.", producer: "EVILBEAR.JPG", bpm: 88, musicalKey: "E Minor", duration: 191, genre: "Boom Bap", tags: ["boom bap", "lofi", "vinyl", "hip hop"], cover: "/mascot.png", published: true, licenses: licenseSet() },
];

export const beatGenres = ["Todos", "Trap", "Drill", "Pluggnb", "R&B", "Hip Hop", "Boom Bap"] as const;

export function findBeat(slug: string) { return beats.find((beat) => beat.slug === slug && beat.published); }
export function formatDuration(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
export function formatPrice(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
export function getLicense(beat: Beat, licenseId: string) { return beat.licenses.find((license) => license.id === licenseId && license.available); }
export function relatedBeats(beat: Beat) { return beats.filter((candidate) => candidate.id !== beat.id && (candidate.genre === beat.genre || candidate.tags.some((tag) => beat.tags.includes(tag)) || Math.abs(candidate.bpm - beat.bpm) <= 10)).slice(0, 4); }
