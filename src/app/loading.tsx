"use client";
import { useUI } from "@/components/ui";
export default function Loading() { const { t } = useUI(); return <main className="reading-page" aria-busy="true" aria-label={t("Cargando página", "Loading page")}><div className="skeleton" /><div className="skeleton" /></main>; }
