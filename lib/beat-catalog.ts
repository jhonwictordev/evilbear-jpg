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
  bpm: number | null;
  musicalKey: string | null;
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
  { id: "beat_bloco_13", slug: "bloco-13", title: "BLOCO 13", description: "Drill de pressão, com bateria intensa e espaço para flows cortantes.", producer: "EVILBEAR.JPG", bpm: 144, musicalKey: null, duration: 180, genre: "Drill", tags: ["drill", "dark", "rap", "pressure"], cover: "/images/beats/bloco-13.jpg", previewUrl: "/audio/previews/bloco-13.mp3", published: true, licenses: licenseSet() },
  { id: "beat_corte_seco", slug: "corte-seco", title: "CORTE SECO", description: "Boom bap cru e direto, feito para barras com presença.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 160, genre: "Boom Bap", tags: ["boom bap", "raw", "rap", "classic"], cover: "/images/beats/corte-seco.jpg", previewUrl: "/audio/previews/corte-seco.mp3", published: true, licenses: licenseSet() },
  { id: "beat_eco_do_abismo", slug: "eco-do-abismo", title: "ECO DO ABISMO", description: "Boom bap sombrio, com textura profunda e atmosfera densa.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 155, genre: "Boom Bap", tags: ["boom bap", "dark", "texture", "underground"], cover: "/images/beats/eco-do-abismo.jpg", previewUrl: "/audio/previews/eco-do-abismo.mp3", published: true, licenses: licenseSet() },
  { id: "beat_fita_vermelha", slug: "fita-vermelha", title: "FITA VERMELHA", description: "Boom bap de fita, com recortes quentes e bateria marcante.", producer: "EVILBEAR.JPG", bpm: 89, musicalKey: null, duration: 179, genre: "Boom Bap", tags: ["boom bap", "tape", "vinyl", "rap"], cover: "/images/beats/fita-vermelha.jpg", previewUrl: "/audio/previews/fita-vermelha.mp3", published: true, licenses: licenseSet() },
  { id: "beat_flash_vermelho", slug: "flash-vermelho", title: "FLASH VERMELHO", description: "Boom bap de impacto, com energia rápida e cortes secos.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 157, genre: "Boom Bap", tags: ["boom bap", "red", "impact", "rap"], cover: "/images/beats/flash-vermelho.jpg", previewUrl: "/audio/previews/flash-vermelho.mp3", published: true, licenses: licenseSet() },
  { id: "beat_midnight_estate", slug: "midnight-estate", title: "MIDNIGHT ESTATE", description: "Boom bap noturno, elegante e cheio de espaço para voz.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 251, genre: "Boom Bap", tags: ["boom bap", "night", "cinematic", "smooth"], cover: "/images/beats/midnight-estate.jpg", previewUrl: "/audio/previews/midnight-estate.mp3", published: true, licenses: licenseSet() },
  { id: "beat_neon_funeral", slug: "neon-funeral", title: "NEON FUNERAL", description: "Dark trap acelerado, com tensão, ruído e energia de madrugada.", producer: "EVILBEAR.JPG", bpm: 172, musicalKey: null, duration: 146, genre: "Dark Trap", tags: ["dark trap", "neon", "aggressive", "night"], cover: "/images/beats/neon-funeral.jpg", previewUrl: "/audio/previews/neon-funeral.mp3", published: true, licenses: licenseSet() },
  { id: "beat_profit_mode", slug: "profit-mode", title: "PROFIT MODE", description: "Drill focada, com presença fria e graves para barras ambiciosas.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 139, genre: "Drill", tags: ["drill", "dark", "money", "rap"], cover: "/images/beats/profit-mode.jpg", previewUrl: "/audio/previews/profit-mode.mp3", published: true, licenses: licenseSet() },
  { id: "beat_purple_static", slug: "purple-static", title: "PURPLE STATIC", description: "Pluggnb etéreo, com brilho digital e melodia para vozes leves.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 160, genre: "Pluggnb", tags: ["pluggnb", "purple", "melodic", "digital"], cover: "/images/beats/purple-static.jpg", previewUrl: "/audio/previews/purple-static.mp3", published: true, licenses: licenseSet() },
  { id: "beat_replay_da_madrugada", slug: "replay-da-madrugada", title: "REPLAY DA MADRUGADA", description: "Boom bap de madrugada, feito para repetir e escrever sem pressa.", producer: "EVILBEAR.JPG", bpm: null, musicalKey: null, duration: 145, genre: "Boom Bap", tags: ["boom bap", "late night", "replay", "rap"], cover: "/images/beats/replay-da-madrugada.jpg", previewUrl: "/audio/previews/replay-da-madrugada.mp3", published: true, licenses: licenseSet() },
];

export const beatGenres = ["Todos", "Trap", "Drill", "Pluggnb", "Boom Bap"] as const;

export function findBeat(slug: string) { return beats.find((beat) => beat.slug === slug && beat.published); }
export function formatDuration(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
export function formatPrice(cents: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
export function getLicense(beat: Beat, licenseId: string) { return beat.licenses.find((license) => license.id === licenseId && license.available); }
export function relatedBeats(beat: Beat) { return beats.filter((candidate) => candidate.id !== beat.id && (candidate.genre === beat.genre || candidate.tags.some((tag) => beat.tags.includes(tag)) || (candidate.bpm !== null && beat.bpm !== null && Math.abs(candidate.bpm - beat.bpm) <= 10))).slice(0, 4); }
