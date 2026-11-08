"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon, Logo, Message, Preferences, useUI } from "./ui";
import { roleNames } from "@/lib/content";
import { ClientApiError } from "@/client/api";
import type { Role } from "@/contracts/academic";

export function AuthScreen({ recovery = false, profile = "" }: { recovery?: boolean; profile?: string }) {
  const { t, lang, login, api } = useUI(); const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setError(""); setBusy(true);
    try {
      if (recovery) { await api.recover(String(data.get("email")).trim()); setSent(true); }
      else { await login(String(data.get("email")).trim(), String(data.get("password"))); router.push("/campus"); }
    } catch (e) { setError(lang === "es" && e instanceof Error ? e.message : "Access could not be completed. Check your details or try again later."); } finally { setBusy(false); }
  }
  return <main className="auth-page"><aside className="auth-aside"><Logo /><div><h1>{t("Tu aprendizaje,\nsiempre contigo.", "Your learning,\nalways with you.")}</h1><p>{t("Un espacio para conectar con tus materias, tus proyectos y tu comunidad.", "A space to connect with your courses, projects and community.")}</p><div className="auth-illustration"><Image src="/media/campus.webp" fill sizes="50vw" alt={t("Campus ilustrativo", "Illustrative campus")} /></div></div></aside><section className="auth-main"><Preferences /><div className="auth-form-wrap"><h2>{recovery ? t("Recupera tu acceso", "Recover your access") : t("Bienvenido al campus", "Welcome to the campus")}</h2><p>{recovery ? t("Te enviaremos las instrucciones al correo registrado, si la cuenta permite recuperación.", "We will send instructions to your registered email if the account is eligible for recovery.") : profile === "docente" ? t("Ingresa con tu cuenta institucional de docente.", "Sign in with your institutional teacher account.") : t("Ingresa con el correo asignado por la institución.", "Sign in with your institution-issued email address.")}</p>
    {sent ? <><Message>{t("Si tu cuenta permite recuperación, recibirás un correo con los siguientes pasos. Revisa también la carpeta de correo no deseado.", "If your account is eligible for recovery, you will receive an email with the next steps. Check your spam folder too.")}</Message><Link className="text-link" href="/acceso">{t("Volver al acceso", "Back to sign in")}<Icon name="arrow" /></Link></> : <form onSubmit={submit}><label>{t("Correo electrónico", "Email address")}<input type="email" name="email" required autoComplete="username" maxLength={254} placeholder="nombre@ejemplo.com" /></label>{!recovery && <label>{t("Contraseña", "Password")}<span className="password-input"><input type={showPassword ? "text" : "password"} name="password" required autoComplete="current-password" maxLength={1024} /><button type="button" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? t("Ocultar", "Hide") : t("Mostrar", "Show")}</button></span></label>}{!recovery && <div className="auth-meta"><span>{t("Acceso privado", "Private access")}</span><Link href="/olvide-contrasena">{t("Olvidé mi contraseña", "Forgot my password")}</Link></div>}{error && <Message error>{error}</Message>}<button className="button button-primary" disabled={busy}>{busy ? t("Un momento…", "One moment…") : recovery ? t("Enviar instrucciones", "Send instructions") : t("Ingresar al campus", "Sign in to campus")}<Icon name="arrow" /></button></form>}
    <div className="auth-preview"><strong>{t("Conoce la experiencia", "Discover the experience")}</strong><p>{t("Explora cada perfil con una cuenta de ejemplo. La vista previa no concede acceso a información institucional.", "Explore each role with a sample account. Preview does not grant access to institutional information.")}</p><div className="preview-roles">{(Object.keys(roleNames) as Role[]).map(role => <Link key={role} href={`/vista-previa?rol=${role}`}>{roleNames[role][lang]}</Link>)}</div></div><Link className="text-link" href="/">{t("Volver al instituto", "Back to the institute")}<Icon name="arrow" /></Link></div></section></main>;
}

export function ConfirmAccess() {
  const { t, lang, api, refreshUser } = useUI(); const router = useRouter();
  const token = useRef<{ hash: string; type: "invite" | "recovery" | "email" } | null>(null);
  const session = useRef<{ access: string; refresh: string } | null>(null); const verified = useRef(false);
  const [valid, setValid] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search); const hash = params.get("token_hash"); const type = params.get("type");
    if (hash && (type === "invite" || type === "recovery" || type === "email")) { token.current = { hash, type }; setValid(true); }
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const access = fragment.get("access_token"); const refresh = fragment.get("refresh_token");
    if (access && refresh) { session.current = { access, refresh }; setValid(true); }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const password = String(data.get("password"));
    if (password !== data.get("confirm")) { setError(t("Las contraseñas no coinciden.", "Passwords do not match.")); return; }
    if (!token.current && !session.current && !verified.current) return; setBusy(true); setError("");
    try {
      if (!verified.current) { if (session.current) await api.acceptSession(session.current.access, session.current.refresh); else if (token.current) await api.verify(token.current.hash, token.current.type); verified.current = true; token.current = null; session.current = null; }
      await api.changePassword(password); await refreshUser(); router.replace("/campus");
    }
    catch (e) { if (!(e instanceof ClientApiError && e.status === 499)) setError(lang === "es" && e instanceof Error ? e.message : "The link could not be verified. Request a new link and try again."); }
    finally { setBusy(false); }
  }
  return <main className="reading-page"><Logo /><div className="auth-form-wrap" style={{ marginTop: 60 }}><Preferences /><h1>{t("Crea tu contraseña", "Create your password")}</h1><p>{t("Activa tu cuenta o completa la recuperación con el enlace recibido.", "Activate your account or complete recovery using the link you received.")}</p>{valid ? <form onSubmit={submit}><label>{t("Nueva contraseña", "New password")}<input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label><label>{t("Repite la contraseña", "Repeat password")}<input name="confirm" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>{error && <Message error>{error}</Message>}<button disabled={busy} className="button button-primary">{busy ? t("Verificando…", "Verifying…") : t("Guardar y continuar", "Save and continue")}</button></form> : <Message error>{t("Este enlace no contiene una verificación válida. Solicita un nuevo correo de recuperación.", "This link does not contain valid verification. Request a new recovery email.")}</Message>}<Link className="text-link" href="/olvide-contrasena">{t("Solicitar otro enlace", "Request another link")}<Icon name="arrow" /></Link></div></main>;
}
