import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Instituto Tecnológico de San Miguel", short_name: "ITSM", description: "Campus académico ficticio de portafolio.", start_url: "/", scope: "/", display: "standalone", background_color: "#f7fbf9", theme_color: "#48b292", lang: "es", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
