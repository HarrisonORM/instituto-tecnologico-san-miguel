"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon, Logo, Preferences, useUI, Message } from "./ui";
import { programs } from "@/lib/content";

export function PublicHeader() {
  const { t } = useUI(); const [open, setOpen] = useState(false);
  return <><a className="skip-link" href="#main">{t("Ir al contenido", "Skip to content")}</a><header className="public-header"><Logo /><nav id="public-navigation" className={open ? "public-nav is-open" : "public-nav"} aria-label={t("Navegación principal", "Main navigation")}>
    {[["/#nosotros", t("Instituto", "Institute")], ["/#programas", t("Programas", "Programs")], ["/#historia", t("Historia", "History")], ["/#contacto", t("Contacto", "Contact")]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
  </nav><div className="public-access"><Link href="/acceso?perfil=estudiante"><Icon name="user" size={16} />{t("Estudiantes", "Students")}</Link><Link href="/acceso?perfil=docente"><Icon name="book" size={16} />{t("Docentes", "Teachers")}</Link></div><Preferences compact /><button className="icon-button menu-toggle" aria-label={t("Abrir navegación", "Open navigation")} aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></button></header></>;
}
export function PublicFooter() {
  const { t } = useUI(); return <footer className="public-footer"><div className="footer-main"><Logo /><p>{t("Un lugar para aprender, crear y conectar.", "A place to learn, create and connect.")}</p><Link href="/vista-previa">{t("Explorar los paneles de muestra", "Explore sample dashboards")}<Icon name="arrow" /></Link></div><div className="footer-bottom"><span>Instituto Tecnológico de San Miguel</span><Link href="/privacidad">{t("Privacidad y uso de datos", "Privacy and data use")}</Link></div></footer>;
}
export function Landing() {
  const { lang, t, reduced, setReduced } = useUI();
  const [selected, setSelected] = useState(0); const [purpose, setPurpose] = useState<"mission" | "vision">("mission");
  const hero = useRef<HTMLElement>(null); const program = programs[selected];
  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    let inView = true;
    const sync = () => { element.dataset.photoPlaying = String(!reduced && inView && document.visibilityState !== "hidden"); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
    observer?.observe(element);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [reduced]);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const move = () => { if (frame) return; frame = requestAnimationFrame(() => { hero.current?.style.setProperty("--photo-offset", `${Math.min(window.scrollY * .1, 45)}px`); frame = 0; }); };
    window.addEventListener("scroll", move, { passive: true });
    return () => { window.removeEventListener("scroll", move); cancelAnimationFrame(frame); hero.current?.style.setProperty("--photo-offset", "0px"); };
  }, [reduced]);
  return <><PublicHeader /><main id="main">
    <section className="hero" ref={hero} aria-labelledby="hero-title"><div className="hero-photo"><Image src="/media/campus.webp" fill priority sizes="100vw" alt={t("Patio universitario ilustrativo, rodeado de vegetación y arquitectura contemporánea", "Illustrative university courtyard with planting and contemporary architecture")} /></div>
      <div className="hero-title-field"><div className="hero-title-content"><h1 id="hero-title">{t("Aprender.", "Learn.")}<br />{t("Crear.", "Create.")}<br />{t("Conectar.", "Connect.")}</h1><p>{t("Formación tecnológica para desarrollar soluciones, comunicar e impulsar un mundo más conectado.", "Technology education to build solutions, communicate and shape a more connected world.")}</p></div></div>
      <div className="program-explorer"><h2>{t("Nuestros programas", "Our programs")}</h2><label className="program-picks"><span>{t("¿Qué quieres estudiar?", "What would you like to study?")}</span><select aria-label={t("Elegir programa", "Choose a program")} value={program.slug} onChange={event => setSelected(programs.findIndex(p => p.slug === event.target.value))}>{programs.map(p => <option key={p.slug} value={p.slug}>{p.name[lang]}</option>)}</select></label><div className="selected-program" aria-live="polite"><h3>{program.name[lang]}</h3><p>{program.summary[lang]}</p></div><Link className="button button-primary" href={`/programas/${program.slug}`}>{t("Explorar programa", "Explore program")}<Icon name="arrow" /></Link></div>
      <button className="motion-control" onClick={() => setReduced(!reduced)} aria-pressed={reduced}><Icon name={reduced ? "play" : "pause"} size={16} />{reduced ? t("Activar movimiento", "Enable motion") : t("Pausar movimiento", "Pause motion")}</button>
    </section>
    <section id="nosotros" className="about-intro section-anchor"><h2>{t("Sobre", "About")}<br />{" "}{t("nosotros", "us")}</h2><p>{t("Somos el Instituto Tecnológico de San Miguel. Un proyecto educativo donde la curiosidad se convierte en ideas y las ideas encuentran un espacio para crecer. La tecnología nos conecta; el aprendizaje nos mueve.", "We are Instituto Tecnológico de San Miguel. An educational project where curiosity becomes ideas and ideas find room to grow. Technology connects us; learning moves us forward.")}</p></section>
    <section className="about-story section-shell"><div className="about-image"><Image src="/media/community.webp" fill sizes="(max-width: 760px) 100vw, 55vw" alt={t("Estudiantes colaborando en un patio, escena ilustrativa", "Students collaborating in a courtyard, illustrative scene")} /></div><div className="about-story-copy"><h2>{t("El futuro se construye aprendiendo.", "The future is built through learning.")}</h2><p>{t("Aprender significa preguntar, experimentar y volver a intentar. Proponemos un recorrido que une fundamentos, práctica y colaboración para acercarte al mundo de la tecnología.", "Learning means asking, experimenting and trying again. Our proposed journey connects foundations, practice and collaboration to bring you closer to technology.")}</p><Link className="text-link" href="#programas">{t("Encuentra tu camino", "Find your path")}<Icon name="arrow" /></Link></div></section>
    <section id="programas" className="program-section section-anchor"><div className="section-heading"><h2>{t("Encuentra tu camino.\nAmplía tus posibilidades.", "Find your path.\nExpand your possibilities.")}</h2><p>{t("Explora nuestra oferta académica y descubre dónde quieres empezar.", "Explore our academic programs and discover where you want to begin.")}</p></div><div className="program-grid">{programs.map(p => <Link key={p.slug} className="program-feature" href={`/programas/${p.slug}`}><Image src={p.image} fill sizes="(max-width: 760px) 100vw, 50vw" alt={p.name[lang]} /><div className="program-feature-copy"><Icon name={p.icon} size={30} /><h3>{p.name[lang]}</h3><p>{p.summary[lang]}</p><span>{t("Conocer programa", "Discover program")}<Icon name="arrow" /></span></div></Link>)}</div></section>
    <section id="historia" className="history-section section-shell section-anchor"><div><h2>{t("Una historia que\nseguimos escribiendo.", "A story we're\nstill writing.")}</h2><p>{t("Nuestra historia reúne una idea compartida, el valor de aprender haciendo y la mirada puesta en lo que viene.", "Our story brings together a shared idea, the value of learning by doing and a focus on what comes next.")}</p></div><ol className="history-line">{[
      [t("Una idea compartida", "A shared idea"), t("Acercar el conocimiento tecnológico a personas con ganas de crear.", "Bring technology knowledge closer to people who want to create.")],
      [t("Aprender haciendo", "Learning by doing"), t("Conectar los fundamentos con proyectos, preguntas y trabajo en equipo.", "Connect foundations with projects, questions and teamwork.")],
      [t("Mirar hacia adelante", "Looking ahead"), t("Construir una comunidad que siga aprendiendo y compartiendo.", "Build a community that keeps learning and sharing.")],
    ].map(([title, copy]) => <li key={title}><span className="history-dot" /><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>
    <section className="purpose-section"><div className="purpose-tabs" role="group" aria-label={t("Propósito institucional", "Institutional purpose")}><button aria-pressed={purpose === "mission"} onClick={() => setPurpose("mission")}>{t("Nuestra misión", "Our mission")}</button><button aria-pressed={purpose === "vision"} onClick={() => setPurpose("vision")}>{t("Nuestra visión", "Our vision")}</button></div><div aria-live="polite"><h2>{purpose === "mission" ? t("Conocimiento que se convierte en posibilidades.", "Knowledge that becomes possibility.") : t("Una comunidad conectada por el aprendizaje.", "A community connected through learning.")}</h2><p>{purpose === "mission" ? t("Promover el aprendizaje tecnológico con pensamiento crítico, colaboración y sentido de responsabilidad, en un entorno que invite a experimentar y crear.", "Promote technology learning through critical thinking, collaboration and responsibility, in an environment that invites experimentation and creation.") : t("Imaginar una educación cercana, práctica y abierta a nuevas preguntas, donde cada persona encuentre herramientas para seguir creciendo.", "Imagine an accessible, practical education open to new questions, where every person finds tools to keep growing.")}</p></div></section>
    <section className="faq-section section-shell"><h2>{t("Antes de dar\nel siguiente paso.", "Before taking\nthe next step.")}</h2><div className="faq-list">{[
      [t("¿Qué programas puedo explorar?", "Which programs can I explore?"), t("Desarrollo de Software, Redes y Telecomunicaciones, Auxiliar Contable, Auxiliar Administrativo y Mantenimiento y Reparación de Equipos Biomédicos. Cada programa tiene una página con sus áreas de aprendizaje.", "Software Development, Networks and Telecommunications, Accounting Assistant, Administrative Assistant, and Biomedical Equipment Maintenance and Repair. Each program has its own page with learning areas.")],
      [t("¿Cómo ingreso al campus?", "How do I access the campus?"), t("Las cuentas institucionales las crea personal autorizado. Puedes recorrer los paneles desde la vista previa sin una cuenta real.", "Institutional accounts are created by authorized staff. You can explore sample dashboards in the preview without a real account.")],
      [t("¿Dónde consulto los precios?", "Where can I find fees?"), t("Los precios, la duración y las modalidades se informarán en cada programa cuando estén definidos. Por ahora puedes solicitar información; este sitio no acepta pagos.", "Fees, duration and study formats will be listed for each program once defined. You can request information; this site does not accept payments.")],
    ].map(([question, answer]) => <details key={question}><summary>{question}<Icon name="plus" size={18} /></summary><p>{answer}</p></details>)}</div></section>
    <section id="contacto" className="contact-section section-anchor"><div className="contact-copy"><h2>{t("Tu próximo paso\nempieza con\nuna pregunta.", "Your next step\nstarts with\na question.")}</h2><p>{t("Cuéntanos qué programa te interesa y qué te gustaría conocer.", "Tell us which program interests you and what you would like to know.")}</p><span><Icon name="mail" />{t("Hablemos de tus posibilidades", "Let's talk about possibilities")}</span></div><ContactForm selected={program.slug} /></section>
  </main><PublicFooter /></>;
}

export function ContactForm({ selected = "software" }: { selected?: string }) {
  const { t, lang } = useUI(); const [busy, setBusy] = useState(false); const [result, setResult] = useState<{ error: boolean; text: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); setBusy(true); setResult(null);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error(t("La recepción de solicitudes no está disponible por ahora. Tus datos siguen en el formulario para que puedas intentarlo después.", "Requests cannot be received right now. Your information remains in the form so you can try again later."));
      setResult({ error: false, text: t("Solicitud recibida. Puedes seguir explorando nuestros programas.", "Request received. You can continue exploring our programs.") }); form.reset();
    } catch (error) { setResult({ error: true, text: error instanceof Error ? error.message : t("No se pudo enviar.", "Unable to send.") }); } finally { setBusy(false); }
  }
  return <form className="contact-form" onSubmit={submit}><div className="form-two"><label>{t("Tu nombre", "Your name")}<input name="name" autoComplete="name" required maxLength={120} placeholder={t("Tu nombre", "Your name")} /></label><label>{t("Correo electrónico", "Email address")}<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="nombre@example.com" /></label></div><label>{t("Programa de interés", "Program of interest")}<select name="program" key={selected} defaultValue={selected}>{programs.map(p => <option key={p.slug} value={p.slug}>{p.name[lang]}</option>)}</select></label><label>{t("¿Qué te gustaría saber?", "What would you like to know?")}<textarea name="message" required minLength={10} maxLength={2000} rows={4} placeholder={t("Escribe tu pregunta…", "Write your question…")} /></label><input type="hidden" name="website" value="" /><label className="checkbox-label"><input type="checkbox" name="consent" value="yes" required />{t("Autorizo el tratamiento de mis datos para gestionar esta solicitud, según la política de privacidad.", "I consent to the use of my information to handle this request, as described in the privacy policy.")}</label>{result && <Message error={result.error}>{result.text}</Message>}<button className="button button-primary" disabled={busy}>{busy ? t("Enviando…", "Sending…") : t("Enviar mi pregunta", "Send my question")}<Icon name="arrow" /></button><Link className="small-link" href="/privacidad">{t("Cómo se utilizan los datos", "How your data is used")}</Link></form>;
}

export function ProgramPage({ slug }: { slug: string }) {
  const { lang, t } = useUI(); const p = programs.find(item => item.slug === slug)!;
  return <><PublicHeader /><main id="main"><section className="program-detail-hero"><div><Link className="text-link" href="/#programas">{t("Todos los programas", "All programs")}</Link><h1>{p.name[lang]}</h1><p>{p.description[lang]}</p><Link className="button button-primary" href="/#contacto">{t("Solicitar información", "Request information")}<Icon name="arrow" /></Link></div><div className="program-detail-photo"><Image src={p.image} fill priority sizes="(max-width: 760px) 100vw, 50vw" alt={p.name[lang]} /></div></section><section className="section-shell program-topics"><h2>{t("Un recorrido\npor descubrir.", "A learning journey\nto discover.")}</h2><div><p>{t("Áreas ilustrativas de aprendizaje. El plan de estudios, la duración, modalidad y los precios definitivos aún no están definidos.", "Illustrative learning areas. The final curriculum, duration, study format and fees have not yet been defined.")}</p><ul>{p.topics[lang].map(topic => <li key={topic}><Icon name="check" />{topic}</li>)}</ul></div></section></main><PublicFooter /></>;
}
