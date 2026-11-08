import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/components/ui";
import { PublicOfflineSupport } from "@/components/service-worker";
import { appearanceScript } from "@/lib/motion";

const manrope = localFont({ src: "../../public/fonts/manrope.ttf", display: "swap", variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Instituto Tecnológico de San Miguel",
  description: "Programas de formación y campus académico del Instituto Tecnológico de San Miguel.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script id="itsm-appearance" dangerouslySetInnerHTML={{ __html: appearanceScript }} /></head>
      <body className={manrope.variable}><Providers><PublicOfflineSupport />{children}</Providers></body>
    </html>
  );
}
