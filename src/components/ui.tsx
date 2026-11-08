"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { InstituteClient } from "@/client/api";
import type { CurrentUser } from "@/contracts/academic";
import { createPreview, type Dataset } from "@/lib/preview-data";

type Language = "es" | "en";
type Theme = "light" | "dark" | "system";
type UIContextValue = {
  lang: Language; setLang: (value: Language) => void;
  theme: Theme; setTheme: (value: Theme) => void;
  reduced: boolean; setReduced: (value: boolean) => void;
  t: (es: string, en: string) => string;
  api: InstituteClient; user: CurrentUser | null;
  login: (email: string, password: string) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser>;
  previewStore: Dataset; changePreview: (reduce: (current: Dataset) => Dataset) => Dataset;
  previewFiles: Record<string, File>;
};
const UIContext = createContext<UIContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, updateLang] = useState<Language>("es");
  const [theme, updateTheme] = useState<Theme>("system");
  const [reduced, updateReduced] = useState(false);
  const [api] = useState(() => new InstituteClient());
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [previewStore, setPreviewStore] = useState(() => createPreview("teacher", true));
  const previewRef = useRef(previewStore); const [previewFiles] = useState<Record<string, File>>({});
  const changePreview = (reduce: (current: Dataset) => Dataset) => { const next = reduce(previewRef.current); previewRef.current = next; setPreviewStore(next); return next; };
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("itsm.preferences") || "{}");
      if (saved.lang === "es" || saved.lang === "en") updateLang(saved.lang);
      if (["light", "dark", "system"].includes(saved.theme)) updateTheme(saved.theme);
      updateReduced(saved.reduced === true || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch { /* Las preferencias no son necesarias para utilizar la aplicación. */ }
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme; };
    apply(); media.addEventListener("change", apply);
    document.documentElement.lang = lang;
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    return () => media.removeEventListener("change", apply);
  }, [lang, theme, reduced]);
  const persist = (next: { lang: Language; theme: Theme; reduced: boolean }) => {
    try { localStorage.setItem("itsm.preferences", JSON.stringify(next)); } catch { /* Preferencia solo en memoria. */ }
  };
  const setLang = (next: Language) => { updateLang(next); persist({ lang: next, theme, reduced }); };
  const setTheme = (next: Theme) => { updateTheme(next); persist({ lang, theme: next, reduced }); };
  const setReduced = (next: boolean) => { updateReduced(next); persist({ lang, theme, reduced: next }); };
  const login = async (email: string, password: string) => { setUser(null); const me = await api.login(email, password); setUser(me); return me; };
  const logout = async () => { setUser(null); await api.logout(); };
  const refreshUser = async () => { const me = await api.me(); setUser(me); return me; };
  return <UIContext.Provider value={{ lang, setLang, theme, setTheme, reduced, setReduced, t: (es, en) => lang === "es" ? es : en, api, user, login, logout, refreshUser, previewStore, changePreview, previewFiles }}>{children}</UIContext.Provider>;
}
export function useUI() { const context = useContext(UIContext); if (!context) throw new Error("UI context missing"); return context; }

export type IconName = "arrow" | "menu" | "close" | "sun" | "moon" | "monitor" | "user" | "book" | "grid" | "file" | "calendar" | "bell" | "settings" | "logout" | "search" | "check" | "plus" | "download" | "upload" | "shield" | "chevron" | "code" | "network" | "pause" | "play" | "mail";
const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>, menu: <path d="M4 6h16M4 12h16M4 18h16" />, close: <path d="m6 6 12 12M6 18 18 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" /></>,
  moon: <path d="M20 15a8 8 0 0 1-11-11 8 8 0 1 0 11 11Z" />, monitor: <><rect x="3" y="3" width="18" height="13" rx="2" /><path d="M12 16v5m-5 0h10" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>, book: <><path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v16" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  file: <><path d="M14 2H5v20h14V7Zm0 0v5h5M8 12h8m-8 4h6" /></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>, settings: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" /></>,
  logout: <path d="M10 3H4v18h6m3-14 5 5-5 5m-5-5h13" />, search: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6" /></>, check: <path d="m4 12 5 5L20 6" />, plus: <path d="M12 4v16M4 12h16" />,
  download: <path d="M12 2v13m-5-5 5 5 5-5M4 17v5h16v-5" />, upload: <path d="M12 16V3m-5 5 5-5 5 5M4 17v5h16v-5" />,
  shield: <><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z" /><path d="m8 12 3 3 5-6" /></>, chevron: <path d="m9 5 7 7-7 7" />,
  code: <path d="m8 5-7 7 7 7m8-14 7 7-7 7m-2-17-4 20" />, network: <><circle cx="12" cy="4" r="3" /><circle cx="4" cy="19" r="3" /><circle cx="20" cy="19" r="3" /><path d="m10 7-5 9m9-9 5 9M7 19h10" /></>,
  pause: <path d="M8 4v16m8-16v16" />, play: <path d="m7 3 14 9-14 9Z" />, mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 5 10 8L22 5" /></>,
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>; }
export function Logo({ compact = false }: { compact?: boolean }) { return <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="Instituto Tecnológico de San Miguel — inicio"><span className="brand-mark" aria-hidden="true"><i /><i /></span><strong>ITSM</strong>{!compact && <span className="brand-name">Instituto Tecnológico<br />de San Miguel</span>}</Link>; }
export function Preferences({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, theme, setTheme, t } = useUI();
  return <div className={`preferences ${compact ? "preferences-compact" : ""}`}>
    <div className="language-switch" role="group" aria-label={t("Idioma", "Language")}><button aria-pressed={lang === "es"} onClick={() => setLang("es")}>ES</button><span>/</span><button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button></div>
    <label className="theme-select"><Icon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"} size={16} /><span className="sr-only">{t("Tema", "Theme")}</span><select value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="light">{t("Claro", "Light")}</option><option value="dark">{t("Oscuro", "Dark")}</option><option value="system">{t("Sistema", "System")}</option></select><Icon name="chevron" size={14} /></label>
  </div>;
}
export function Message({ children, error = false }: { children: ReactNode; error?: boolean }) { return <div className={`message ${error ? "message-error" : ""}`} role={error ? "alert" : "status"}>{children}</div>; }
export function Empty({ title, description }: { title: string; description: string }) { return <div className="empty-state"><Icon name="book" size={36} /><h3>{title}</h3><p>{description}</p></div>; }
