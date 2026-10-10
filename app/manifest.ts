import type { MetadataRoute } from "next";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ironline";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — Train. Track. Transform.`,
    short_name: APP_NAME,
    description: "The gym platform members actually want to open.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121016",
    theme_color: "#121016",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
