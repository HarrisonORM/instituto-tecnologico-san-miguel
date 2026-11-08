import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { Providers } from "@/components/ui";
import { PublicOfflineSupport } from "@/components/service-worker";

const manrope = localFont({ src: "../../public/fonts/manrope.ttf", display: "swap", variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Instituto Tecnológico de San Miguel",
  description: "Programas de formación y campus académico del Instituto Tecnológico de San Miguel.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script id="itsm-appearance" dangerouslySetInnerHTML={{ __html: "try{var p=JSON.parse(localStorage.getItem('itsm.preferences')||'{}');var d=p.theme==='dark'||((!p.theme||p.theme==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';if(p.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='reduced'}catch(e){}" }} /></head>
      <body className={manrope.variable}><Providers><PublicOfflineSupport />{children}</Providers></body>
    </html>
  );
}
