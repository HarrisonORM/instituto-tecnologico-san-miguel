"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { InstituteClient, MfaFactor } from "@/client/api";
import { verificationCopy, type VerificationIntent } from "@/lib/sensitive-actions";

export function VerificationDialog({ intent, returnFocus, api, lang, onCancel, onVerified }: {
  intent: VerificationIntent; api: InstituteClient; lang: "es" | "en";
  returnFocus: HTMLElement | null;
  onCancel: () => void; onVerified: (id: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const active = useRef(true); const callbacks = useRef({ onCancel, onVerified });
  const [factors, setFactors] = useState<MfaFactor[]>([]); const [selected, setSelected] = useState("");
  const [enrollment, setEnrollment] = useState<{ id: string; totp: { qr_code: string; secret: string } } | null>(null);
  const [loading, setLoading] = useState(true); const [working, setWorking] = useState(false); const [error, setError] = useState(""); const [help, setHelp] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const t = (es: string, en: string) => lang === "es" ? es : en;
  const copy = verificationCopy(intent, lang === "en");
  useEffect(() => { callbacks.current = { onCancel, onVerified }; }, [onCancel, onVerified]);
  useEffect(() => {
    active.current = true;
    const opener = returnFocus;
    const modal = dialog.current;
    modal?.showModal();
    const cancel = () => callbacks.current.onCancel();
    window.addEventListener("popstate", cancel);
    void api.listMfa().then(items => {
      if (!active.current) return;
      const available = items.filter(item => !item.factor_type || item.factor_type === "totp");
      setFactors(available); setSelected(available.find(item => item.status === "verified")?.id ?? available[0]?.id ?? "");
    }).catch(() => { if (active.current) { setUnavailable(true); setError(lang === "es" ? "No se pudo consultar tu autenticador. Cancela e inténtalo de nuevo." : "Your authenticator could not be loaded. Cancel and try again."); } })
      .finally(() => { if (active.current) setLoading(false); });
    return () => {
      active.current = false; window.removeEventListener("popstate", cancel);
      modal?.close();
      window.setTimeout(() => { if (opener?.isConnected && !document.querySelector("dialog[open]")) opener.focus(); }, 0);
    };
  }, [api, intent.id, lang, returnFocus]);
  useEffect(() => { if (!loading && !enrollment && factors.some(item => item.status === "verified")) codeInput.current?.focus(); }, [loading, enrollment, factors]);
  async function enroll() {
    setWorking(true); setError("");
    try {
      const factor = await api.enrollMfa();
      if (!active.current) return;
      setEnrollment(factor); setSelected(factor.id);
      setFactors(current => [...current, { id: factor.id, status: "unverified", factor_type: "totp" }]);
    } catch { if (active.current) setError(t("No se pudo iniciar la configuración. Si ya guardaste un autenticador pendiente, selecciónalo para completarlo.", "Setup could not be started. If you saved a pending authenticator, select it to complete setup.")); }
    finally { if (active.current) setWorking(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (working || !selected) return;
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    if (!/^[0-9]{6}$/.test(code)) return;
    setWorking(true); setError("");
    try {
      const challenge = await api.challengeMfa(selected);
      if (!active.current) return;
      await api.verifyMfa(selected, challenge.id, code);
      if (active.current) callbacks.current.onVerified(intent.id);
    } catch { if (active.current) setError(t("El código no se pudo verificar. Usa el código actual de tu aplicación e inténtalo de nuevo.", "The code could not be verified. Use your app’s current code and try again.")); }
    finally { if (active.current) setWorking(false); }
  }
  return <dialog ref={dialog} className="verification-dialog" aria-labelledby="verification-title" aria-describedby="verification-description" onCancel={event => { event.preventDefault(); onCancel(); }}>
    <div className="verification-content">
      <h2 id="verification-title">{copy.title}</h2><p id="verification-description">{copy.description}</p>
      {intent.target && <div className="verification-target"><strong>{t("Vas a modificar", "You are updating")}</strong><span>{intent.target}</span></div>}
      {loading ? <p role="status">{t("Consultando tu autenticador…", "Loading your authenticator…")}</p> : unavailable ? null : <>
        {!factors.length && <p>{t("Primero configura una aplicación autenticadora. Después podrás confirmar esta operación con su código.", "Set up an authenticator app first. You can then confirm this action with its code.")}</p>}
        {!factors.some(item => item.status === "verified") && !enrollment && <button type="button" className="button button-secondary" disabled={working} onClick={() => void enroll()}>{t("Configurar autenticador", "Set up authenticator")}</button>}
        {enrollment && <div className="verification-setup"><p>{t("Escanea este QR desde tu aplicación autenticadora. Guarda el acceso antes de continuar.", "Scan this QR with your authenticator app. Save access before continuing.")}</p><Image src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(enrollment.totp.qr_code)}`} unoptimized width={180} height={180} alt={t("QR privado de configuración", "Private setup QR")} /><label>{t("Clave manual privada", "Private manual key")}<input value={enrollment.totp.secret} readOnly /></label></div>}
        {factors.length > 0 && <form onSubmit={verify}>
          <label>{t("Aplicación autenticadora", "Authenticator app")}<select value={selected} onChange={event => setSelected(event.target.value)} required disabled={working}>{factors.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendly_name ?? `${t("Mi autenticador", "My authenticator")} ${index + 1}`}{factor.status !== "verified" ? t(" · Pendiente", " · Pending") : ""}</option>)}</select></label>
          <label>{t("Código de seis dígitos", "Six-digit code")}<input ref={codeInput} name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required disabled={working} /></label>
          <p className="verification-note">{t("Introduce el código de tu aplicación. No lo compartas con otras personas.", "Enter your authenticator app’s code. Do not share it with anyone.")}</p>
          <button className="button button-primary" disabled={working}>{working ? t("Verificando…", "Verifying…") : copy.confirm}</button>
        </form>}
      </>}
      {error && <div className="message message-error" role="alert">{error}</div>}
      {help && <p role="status">{t("Si perdiste el autenticador, necesitarás una recuperación asistida. Contacta con el personal autorizado antes de continuar.", "If you lost your authenticator, you need assisted recovery. Contact authorized staff before continuing.")}</p>}
      <div className="verification-footer"><button type="button" className="small-link" onClick={() => setHelp(!help)}>{t("No tengo acceso al autenticador", "I cannot access my authenticator")}</button><button type="button" className="button button-secondary" onClick={onCancel}>{t("Cancelar", "Cancel")}</button></div>
    </div>
  </dialog>;
}
