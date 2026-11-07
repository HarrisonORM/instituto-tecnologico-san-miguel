"use client";
import Link from "next/link";
import { Logo, useUI } from "@/components/ui";
export default function NotFound() { const { t } = useUI(); return <main className="private-gate"><Logo compact /><h1>{t("Este camino no está aquí.", "This path isn't here.")}</h1><p>{t("La página que buscas no existe o cambió de dirección.", "The page you're looking for does not exist or has moved.")}</p><Link className="button button-primary" href="/">{t("Volver al instituto", "Back to the institute")}</Link></main>; }
