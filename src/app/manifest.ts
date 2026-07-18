import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Project X Tuning",
    short_name: "Project X",
    description:
      "Curated intake systems, exhaust, aero, and tuning packages.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0c28ff",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
