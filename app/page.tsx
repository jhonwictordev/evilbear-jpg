"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FormEvent, ReactNode, useEffect, useState } from "react";

type Language = "pt" | "en";

const socials = {
  youtube: "https://www.youtube.com/@EVILBEARJPG",
  instagram: "https://www.instagram.com/evilbear.jpg/",
  visualizer: "https://www.behance.net/gallery/171434971/Visualizer",
  covers: "https://www.behance.net/gallery/158804245/Artist-cover",
};

const copy = {
  pt: {
    nav: ["Trabalhos", "Serviços", "Sobre", "Contato"],
    start: "Iniciar projeto",
    menu: "Abrir menu",
    close: "Fechar menu",
    heroEyebrow: "Identidade criativa independente · Brasil — Mundo",
    heroTitle: "EVILBEAR.JPG",
    heroRole: "Beatmaker · Designer · Ilustrador · Editor de vídeo",
    heroText: "Criando sons e visuais que ficam na memória.",
    work: "Ver trabalhos",
    scroll: "Role para entrar",
    selected: "01 / Arquivo selecionado",
    selectedTitle: "Trabalhos selecionados",
    selectedText: "Som e imagem feitos com intenção. Uma seleção de identidades, capas, ilustrações e mundos em movimento.",
    beatTitle: "Ouça os beats",
    beatText: "Acesse o canal do YouTube e escute os lançamentos.",
    instaTitle: "Instagram",
    instaText: "Contato, bastidores e novidades em @evilbear.jpg.",
    behanceEyebrow: "02 / Portfólio Behance",
    behanceTitle: "Capas & animações",
    behanceText: "Projetos prontos para ver em detalhe no Behance.",
    cards: [
      { number: "01", title: "Capas de artistas", type: "ARTIST COVER", text: "Capas que traduzem som, atmosfera e personalidade visual.", link: "Ver capas" },
      { number: "02", title: "Visualizers", type: "VISUALIZER", text: "Animações e visualizers criados para ampliar cada lançamento.", link: "Ver animações" },
    ],
    servicesEyebrow: "03 / Serviços",
    servicesTitle: "Do conceito ao impacto.",
    services: [
      ["01", "Produção musical", "Beats, direção sonora e faixas que carregam uma identidade própria."],
      ["02", "Identidade visual", "Sistemas visuais que tornam artistas, marcas e projetos inesquecíveis."],
      ["03", "Capas & ilustração", "Arte com textura, presença e intenção para cada lançamento."],
      ["04", "Motion & edição", "Visualizers, vídeos e movimento feitos para prender a atenção."],
    ],
    aboutEyebrow: "04 / Sobre",
    aboutTitle: "Som, imagem e presença.",
    aboutText: "EVILBEAR.JPG é o universo criativo de Jhon Wictor: uma linguagem construída entre beats, design, ilustração e imagem em movimento. Cada trabalho nasce para ter peso, textura e uma assinatura que não passa despercebida.",
    aboutFact: "Disponível para projetos selecionados no Brasil e no mundo.",
    manifesto: "A estética é o som antes de ser ouvido.",
    contactEyebrow: "05 / Contato",
    contactTitle: "Vamos criar algo que fique.",
    contactText: "Tem uma ideia, lançamento ou projeto? Conte o essencial e vamos conversar.",
    form: { name: "Seu nome", email: "Seu e-mail", service: "Qual serviço você procura?", message: "Conte sobre o projeto", send: "Enviar mensagem", sent: "Mensagem preparada. Obrigado pelo contato.", options: ["Produção musical", "Identidade visual", "Capas & ilustração", "Motion & edição", "Outro"] },
    contactSocial: "Ou fale pelo Instagram",
    footer: "Todos os direitos reservados.",
    language: "English",
  },
  en: {
    nav: ["Work", "Services", "About", "Contact"],
    start: "Start a project",
    menu: "Open menu",
    close: "Close menu",
    heroEyebrow: "Independent creative identity · Brazil — Worldwide",
    heroTitle: "EVILBEAR.JPG",
    heroRole: "Beatmaker · Designer · Illustrator · Video editor",
    heroText: "Creating sounds and visuals that stay with you.",
    work: "View work",
    scroll: "Scroll to enter",
    selected: "01 / Selected archive",
    selectedTitle: "Selected work",
    selectedText: "Sound and image built with intention. A selection of identities, covers, illustrations and moving worlds.",
    beatTitle: "Listen to the beats",
    beatText: "Visit the YouTube channel and hear the latest releases.",
    instaTitle: "Instagram",
    instaText: "Contact, behind the scenes and updates at @evilbear.jpg.",
    behanceEyebrow: "02 / Behance portfolio",
    behanceTitle: "Covers & animation",
    behanceText: "Finished projects ready to explore in detail on Behance.",
    cards: [
      { number: "01", title: "Artist covers", type: "ARTIST COVER", text: "Covers that translate sound, atmosphere and visual personality.", link: "View covers" },
      { number: "02", title: "Visualizers", type: "VISUALIZER", text: "Animation and visualizers made to expand every release.", link: "View animations" },
    ],
    servicesEyebrow: "03 / Services",
    servicesTitle: "From concept to impact.",
    services: [
      ["01", "Music production", "Beats, sound direction and tracks with their own identity."],
      ["02", "Visual identity", "Visual systems that make artists, brands and projects unforgettable."],
      ["03", "Covers & illustration", "Artwork with texture, presence and intention for every release."],
      ["04", "Motion & editing", "Visualizers, videos and motion designed to hold attention."],
    ],
    aboutEyebrow: "04 / About",
    aboutTitle: "Sound, image and presence.",
    aboutText: "EVILBEAR.JPG is Jhon Wictor's creative universe: a language built between beats, design, illustration and moving image. Every project is made to carry weight, texture and a signature that cannot be ignored.",
    aboutFact: "Available for selected projects in Brazil and worldwide.",
    manifesto: "Aesthetics are sound before they are heard.",
    contactEyebrow: "05 / Contact",
    contactTitle: "Let's make something that lasts.",
    contactText: "Have an idea, release or project? Share the essentials and let's talk.",
    form: { name: "Your name", email: "Your email", service: "What do you need?", message: "Tell me about the project", send: "Send message", sent: "Message ready. Thanks for getting in touch.", options: ["Music production", "Visual identity", "Covers & illustration", "Motion & editing", "Other"] },
    contactSocial: "Or reach out on Instagram",
    footer: "All rights reserved.",
    language: "Português",
  },
} as const;

const projectLabels = {
  pt: [["01", "Identidades", "Design"], ["02", "Capas", "Arte"], ["03", "Visualizers", "Motion"], ["04", "Sons", "Beats"]],
  en: [["01", "Identities", "Design"], ["02", "Covers", "Artwork"], ["03", "Visualizers", "Motion"], ["04", "Sounds", "Beats"]],
} as const;

function Arrow() { return <span aria-hidden="true">↗</span>; }

function LanguageSwitch({ language, onChange, compact = false }: { language: Language; onChange: (value: Language) => void; compact?: boolean }) {
  return <div className={compact ? "language-switch language-switch--mobile" : "language-switch"} aria-label="Language selector">
    <button className={language === "pt" ? "is-active" : ""} onClick={() => onChange("pt")} aria-pressed={language === "pt"}>PT</button>
    <span>/</span>
    <button className={language === "en" ? "is-active" : ""} onClick={() => onChange("en")} aria-pressed={language === "en"}>EN</button>
  </div>;
}

function Navbar({ t, language, setLanguage }: { t: typeof copy.pt; language: Language; setLanguage: (value: Language) => void }) {
  const [open, setOpen] = useState(false);
  const ids = ["work", "services", "about", "contact"];
  const go = (id: string) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  return <header className="site-header">
    <button className="brand" onClick={() => go("home")} aria-label="EVILBEAR.JPG home">EVILBEAR.JPG</button>
    <nav className="desktop-nav" aria-label="Navegação principal">{t.nav.map((label, i) => <button key={ids[i]} onClick={() => go(ids[i])}>{label}</button>)}</nav>
    <div className="header-actions"><LanguageSwitch language={language} onChange={setLanguage} /><button className="header-cta" onClick={() => go("contact")}>{t.start} <Arrow /></button></div>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t.close : t.menu}>{open ? "×" : "☰"}</button>
    {open && <div className="mobile-nav">{t.nav.map((label, i) => <button key={ids[i]} onClick={() => go(ids[i])}>{label}</button>)}<LanguageSwitch language={language} onChange={setLanguage} compact /><button className="header-cta" onClick={() => go("contact")}>{t.start} <Arrow /></button></div>}
  </header>;
}

function Hero({ t }: { t: typeof copy.pt }) { return <section className="hero section-shell" id="home"><div className="hero-copy"><p className="eyebrow"><i />{t.heroEyebrow}</p><h1>{t.heroTitle}</h1><p className="hero-role">{t.heroRole}</p><p className="hero-text">{t.heroText}</p><div className="hero-actions"><a className="button button--primary" href="#work">{t.work} <span>↓</span></a><a className="button" href="#contact">{t.start} <Arrow /></a></div></div><div className="hero-art"><img src="/site-image.webp" alt="EVILBEAR.JPG visual identity" /></div><span className="scroll-note">{t.scroll}</span></section>; }

function Work({ t, language }: { t: typeof copy.pt; language: Language }) { return <section className="work section-shell" id="work"><h2 className="section-title">{t.selectedTitle}</h2><p className="section-intro">{t.selectedText}</p><div className="project-grid">{projectLabels[language].map(([number, title, type]) => <article className="project-card" key={number}><span>{number}</span><div><p>{type}</p><h3>{title}</h3></div><img src="/site-image.webp" alt="" /></article>)}</div></section>; }

function Behance({ t }: { t: typeof copy.pt }) { return <section className="behance section-shell" id="behance"><p className="eyebrow"><i />{t.behanceEyebrow}</p><h2 className="section-title">{t.behanceTitle}</h2><p className="section-intro">{t.behanceText}</p><div className="behance-grid">{t.cards.map((card, index) => <a key={card.number} className={`behance-card behance-card--${index === 0 ? "covers" : "visualizer"}`} href={index === 0 ? socials.covers : socials.visualizer} target="_blank" rel="noreferrer"><div className="behance-card__visual"><img src="/site-image.webp" alt="" /><span>{index === 0 ? "COVERS" : "FX"}</span></div><div className="behance-card__body"><p>{card.number} / {card.type}</p><h3>{card.title}</h3><span>{card.text}</span><strong>{card.link} <Arrow /></strong></div></a>)}</div></section>; }

function Services({ t }: { t: typeof copy.pt }) { return <section className="services-section section-shell" id="services"><p className="eyebrow"><i />{t.servicesEyebrow}</p><h2 className="section-title">{t.servicesTitle}</h2><div className="services">{t.services.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>; }

function About({ t }: { t: typeof copy.pt }) { return <><section className="about section-shell" id="about"><p className="eyebrow"><i />{t.aboutEyebrow}</p><div><h2 className="section-title">{t.aboutTitle}</h2><p>{t.aboutText}</p><small>{t.aboutFact}</small></div></section><section className="manifesto"><p>{t.manifesto}</p></section></>; }

function Contact({ t }: { t: typeof copy.pt }) { const [sent, setSent] = useState(false); const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); }; return <section className="contact section-shell" id="contact"><p className="eyebrow"><i />{t.contactEyebrow}</p><div className="contact-grid"><div><h2 className="section-title">{t.contactTitle}</h2><p>{t.contactText}</p><a className="contact-social" href={socials.instagram} target="_blank" rel="noreferrer">{t.contactSocial} <Arrow /></a></div><form onSubmit={submit}><input required placeholder={t.form.name} aria-label={t.form.name} /><input required type="email" placeholder={t.form.email} aria-label={t.form.email} /><select required defaultValue="" aria-label={t.form.service}><option value="" disabled>{t.form.service}</option>{t.form.options.map(option => <option key={option}>{option}</option>)}</select><textarea required placeholder={t.form.message} aria-label={t.form.message} rows={4} /><button className="button button--primary" type="submit">{t.form.send} <Arrow /></button>{sent && <p className="form-message">{t.form.sent}</p>}</form></div></section>; }

function Footer({ t }: { t: typeof copy.pt }) { return <footer className="footer section-shell"><span>EVILBEAR.JPG</span><p>© 2026 {t.footer}</p><div><a href={socials.youtube} target="_blank" rel="noreferrer">YouTube</a><a href={socials.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={socials.covers} target="_blank" rel="noreferrer">Behance</a></div></footer>; }

function CustomCursor() { const reduced = useReducedMotion(); const x = useMotionValue(-100); const y = useMotionValue(-100); const sx = useSpring(x, { stiffness: 400, damping: 28 }); const sy = useSpring(y, { stiffness: 400, damping: 28 }); useEffect(() => { if (reduced) return; const move = (event: PointerEvent) => { x.set(event.clientX); y.set(event.clientY); }; window.addEventListener("pointermove", move); return () => window.removeEventListener("pointermove", move); }, [reduced, x, y]); if (reduced) return null; return <motion.div className="cursor" style={{ x: sx, y: sy }} aria-hidden="true" />; }

export default function Home() { const [language, setLanguage] = useState<Language>("pt"); const t = copy[language]; useEffect(() => { document.documentElement.lang = language === "pt" ? "pt-BR" : "en"; }, [language]); return <main><CustomCursor /><Navbar t={t} language={language} setLanguage={setLanguage} /><Hero t={t} /><Work t={t} language={language} /><Behance t={t} /><Services t={t} /><About t={t} /><Contact t={t} /><Footer t={t} /></main>; }
