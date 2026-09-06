"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { FormEvent, ReactNode, useEffect, useState } from "react";

const projects = [
  { number: "01", name: "Scarlet Ritual", category: "Cover Art / Design", year: "2026", className: "project--wide project--ritual" },
  { number: "02", name: "Nocturnal Form", category: "Illustration", year: "2026", className: "project--tall project--form" },
  { number: "03", name: "Red Signal", category: "Music Visualizer", year: "2025", className: "project--tall project--signal" },
  { number: "04", name: "After Midnight", category: "Video Editing", year: "2025", className: "project--wide project--midnight" },
];

const services = [
  { number: "01", title: "Beatmaking", detail: "Production · Arrangement · Sound design" },
  { number: "02", title: "Graphic Design", detail: "Cover art · Campaigns · Visual identity" },
  { number: "03", title: "Illustration", detail: "Characters · Editorial · Merch artwork" },
  { number: "04", title: "Video Editing", detail: "Visualizers · Reels · Music videos" },
];

const navItems = ["Work", "Services", "About", "Contact"];

function Arrow({ down = false }: { down?: boolean }) {
  return <span aria-hidden="true">{down ? "↓" : "↗"}</span>;
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 42 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={"site-header " + (scrolled ? "site-header--scrolled" : "")}>
      <a className="brand" href="#home" aria-label="EVILBEAR.JPG — início" data-cursor="link">
        <img src="/evilbear-logo.webp" width="1800" height="370" alt="" aria-hidden="true" />
      </a>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <a href="#home" data-cursor="link">Home</a>
        {navItems.map((item) => (
          <a key={item} href={"#" + item.toLowerCase()} data-cursor="link">{item}</a>
        ))}
      </nav>
      <a className="button button--compact header-cta" href="#contact" data-cursor="link">
        Start a project <Arrow />
      </a>
      <button
        className={"menu-button " + (open ? "menu-button--open" : "")}
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>
      <motion.nav
        className="mobile-nav"
        aria-label="Navegação mobile"
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { opacity: 1, visibility: "visible", y: 0 },
          closed: { opacity: 0, visibility: "hidden", y: -16 },
        }}
        transition={{ duration: 0.25 }}
      >
        <a href="#home" onClick={() => setOpen(false)}>Home</a>
        {navItems.map((item, index) => (
          <a key={item} href={"#" + item.toLowerCase()} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span>{item}
          </a>
        ))}
      </motion.nav>
    </header>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="hero section-shell" id="home">
      <div className="hero-orbit hero-orbit--one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--two" aria-hidden="true" />
      <motion.div
        className="hero-art"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src="/site-image.webp" width="1672" height="941" fetchPriority="high" alt="Urso vermelho da EVILBEAR.JPG produzindo música em um estúdio iluminado por neon" />
        <div className="hero-art__fade" />
      </motion.div>
      <div className="hero-content">
        <motion.p
          className="eyebrow"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Independent creative identity <span>Brazil — Worldwide</span>
        </motion.p>
        <h1 className="hero-title" aria-label="EVILBEAR.JPG">
          <motion.img
            className="hero-logo"
            src="/evilbear-logo.webp"
            width="1800"
            height="370"
            alt="EVILBEAR.JPG"
            initial={reduceMotion ? false : { opacity: 0, y: 80, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.95, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          />
        </h1>
        <motion.div
          className="hero-bottom"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.6 }}
        >
          <div>
            <p className="hero-disciplines">Beatmaker · Designer · Illustrator · Video editor</p>
            <p className="hero-tagline">Creating sounds &amp; visuals.</p>
          </div>
          <div className="hero-actions">
            <a className="button button--primary" href="#work" data-cursor="link">View my work <Arrow down /></a>
            <a className="button button--ghost" href="#contact" data-cursor="link">Start a project <Arrow /></a>
          </div>
        </motion.div>
      </div>
      <div className="scroll-note" aria-hidden="true"><span>Scroll to enter</span><i /></div>
    </section>
  );
}

function Marquee() {
  const phrase = "BEATMAKER ✦ DESIGNER ✦ ILLUSTRATOR ✦ VIDEO EDITOR ✦ EVILBEAR.JPG ✦";
  return (
    <div className="marquee" aria-label={phrase}>
      <div className="marquee__track"><span>{phrase}</span><span aria-hidden="true">{phrase}</span></div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className={"project " + project.className}
      data-cursor="view"
      initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.85, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#contact" aria-label={"Ver projeto " + project.name}>
        <div className="project__visual">
          <img src="/site-image.webp" width="1672" height="941" loading="lazy" alt="" aria-hidden="true" />
          <span className="project__number">{project.number}</span>
          <span className="project__mark">EB</span>
          <div className="project__noise" />
        </div>
        <div className="project__meta">
          <div><p>{project.name}</p><span>{project.category}</span></div>
          <span>{project.year}</span>
        </div>
      </a>
    </motion.article>
  );
}

function Work() {
  return (
    <section className="work section-shell" id="work">
      <div className="section-heading">
        <Reveal>
          <p className="section-kicker">01 / Selected archive</p>
          <h2>Selected<br /><span>Work</span></h2>
        </Reveal>
        <Reveal className="section-heading__aside" delay={0.1}>
          <p>Sound and image built with intention. A selection of identities, covers, illustrations and moving worlds.</p>
          <div className="work-links">
            <a
              className="work-link work-link--youtube"
              href="https://www.youtube.com/@EVILBEARJPG"
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              aria-label="Listen to EVILBEAR.JPG beats on the official YouTube channel (opens in a new tab)"
            >
              <span className="work-link__icon" aria-hidden="true">▶</span>
              <span className="work-link__copy">
                <small>Listen to the beats</small>
                <strong>YouTube</strong>
              </span>
              <Arrow />
            </a>
            <a
              className="work-link work-link--instagram"
              href="https://www.instagram.com/evilbear.jpg/"
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              aria-label="Contact EVILBEAR.JPG on Instagram (opens in a new tab)"
            >
              <span className="work-link__icon" aria-hidden="true">IG</span>
              <span className="work-link__copy">
                <small>Contact &amp; projects</small>
                <strong>Instagram</strong>
              </span>
              <Arrow />
            </a>
          </div>
          <span className="section-years">2025 — 2026</span>
        </Reveal>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} />)}
      </div>
    </section>
  );
}

function Services() {
  const [active, setActive] = useState(0);
  return (
    <section className="services section-shell" id="services">
      <div className="services-intro">
        <Reveal><p className="section-kicker">02 / Capabilities</p><h2>What I do</h2></Reveal>
        <Reveal className="services-preview" delay={0.1}>
          <img src="/site-image.webp" width="1672" height="941" loading="lazy" alt="" aria-hidden="true" />
          <span>0{active + 1}</span>
        </Reveal>
      </div>
      <div className="service-list">
        {services.map((service, index) => (
          <motion.a
            href="#contact"
            className={active === index ? "service service--active" : "service"}
            key={service.title}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            data-cursor="link"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: index * 0.05 }}
          >
            <span className="service__number">{service.number}</span>
            <span className="service__title">{service.title}</span>
            <span className="service__detail">{service.detail}</span>
            <Arrow />
          </motion.a>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about section-shell" id="about">
      <div className="about-title">
        <Reveal><p className="section-kicker">03 / Behind the identity</p><h2>About<br /><span>Evilbear</span></h2></Reveal>
      </div>
      <Reveal className="about-portrait" delay={0.05}>
        <img src="/site-image.webp" width="1672" height="941" loading="lazy" alt="Urso vermelho da EVILBEAR.JPG no estúdio de produção musical" />
        <span>Est. in the shadows</span>
      </Reveal>
      <Reveal className="about-copy" delay={0.12}>
        <p className="about-lead">EVILBEAR.JPG is a multidisciplinary creative identity focused on music, design, illustration and audiovisual experiences.</p>
        <p>Each project is treated as a complete universe — where sound, image and attitude speak the same language. Made in Brazil, connected worldwide.</p>
        <dl>
          <div><dt>Based in</dt><dd>Brazil</dd></div>
          <div><dt>Focus</dt><dd>Music &amp; visuals</dd></div>
          <div><dt>Available</dt><dd><i /> Freelance</dd></div>
        </dl>
      </Reveal>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="manifesto section-shell" aria-label="Manifesto">
      <Reveal><p>I don&apos;t just make visuals.</p><h2>I build <span className="chrome-text">worlds.</span></h2></Reveal>
      <div className="manifesto-stamp" aria-hidden="true"><span>Sound</span><i>×</i><span>Visual</span><i>×</i><span>Identity</span></div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };
  return (
    <section className="contact section-shell" id="contact">
      <Reveal><p className="section-kicker">04 / Contact</p><h2>Let&apos;s create<br /><span className="chrome-text">something evil.</span></h2></Reveal>
      <div className="contact-grid">
        <Reveal className="contact-left" delay={0.08}>
          <p>Have a cover, track, identity or visual world in mind? Send the signal.</p>
          <a className="contact-email" href="mailto:hello@evilbear.jpg" data-cursor="link">hello@evilbear.jpg <Arrow /></a>
          <div className="social-links">
            <a href="https://www.instagram.com/evilbear.jpg/" target="_blank" rel="noreferrer" data-cursor="link">Instagram <Arrow /></a>
            <a href="https://www.behance.net/" target="_blank" rel="noreferrer" data-cursor="link">Behance <Arrow /></a>
          </div>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={0.14}>
          <form className="contact-form" onSubmit={submit}>
            <label><span>Name</span><input name="name" type="text" autoComplete="name" required placeholder="Your name" /></label>
            <label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@email.com" /></label>
            <label>
              <span>Project type</span>
              <select name="projectType" defaultValue="" required>
                <option value="" disabled>Select a service</option>
                <option>Beatmaking</option><option>Graphic design</option><option>Illustration</option><option>Video editing</option><option>Multidisciplinary project</option>
              </select>
            </label>
            <label><span>Message</span><textarea name="message" required rows={4} placeholder="Tell me about your world." /></label>
            <button className="button button--primary button--submit" type="submit" data-cursor="link">
              {sent ? "Signal received" : "Send message"} <Arrow />
            </button>
            {sent && <p className="form-status" role="status">Thanks — your project is on the radar.</p>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer section-shell">
      <a className="footer-brand" href="#home" data-cursor="link" aria-label="Voltar ao início">
        <img src="/evilbear-logo.webp" width="1800" height="370" alt="EVILBEAR.JPG" />
      </a>
      <div className="footer-bottom">
        <p>Beatmaker / Designer / Illustrator / Video editor</p>
        <div>
          <a href="https://www.instagram.com/evilbear.jpg/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.behance.net/" target="_blank" rel="noreferrer">Behance</a>
        </div>
        <p>© {new Date().getFullYear()} EVILBEAR.JPG</p>
      </div>
    </footer>
  );
}

function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 36, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 500, damping: 36, mass: 0.2 });
  const [mode, setMode] = useState("default");

  useEffect(() => {
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target as HTMLElement;
      const cursorTarget = target.closest("[data-cursor]")?.getAttribute("data-cursor");
      setMode(cursorTarget || "default");
      document.documentElement.style.setProperty("--mouse-x", event.clientX + "px");
      document.documentElement.style.setProperty("--mouse-y", event.clientY + "px");
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div className={"custom-cursor custom-cursor--" + mode} style={{ x: springX, y: springY }} aria-hidden="true">
      {mode === "view" && <span>View</span>}
    </motion.div>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      <div className="mouse-glow" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <main id="main">
        <Hero /><Marquee /><Work /><Services /><About /><Manifesto /><Contact />
      </main>
      <Footer />
    </>
  );
}
