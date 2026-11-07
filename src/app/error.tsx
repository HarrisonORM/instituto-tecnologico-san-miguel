"use client";
import Link from "next/link";
import { useUI } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) { const { t } = useUI(); return <main className="private-gate"><h1>{t("No pudimos abrir esta página.", "We couldn't open this page.")}</h1><p>{t("Puedes volver a intentarlo. Si el problema continúa, regresa al inicio.", "You can try again. If the problem continues, return to the home page.")}</p><div className="inline-actions"><button className="button button-primary" onClick={reset}>{t("Reintentar", "Try again")}</button><Link className="button button-secondary" href="/">{t("Ir al inicio", "Go home")}</Link></div></main>; }
