import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveVibe, themeAttr } from "@/lib/theme";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ironline";

export const metadata: Metadata = {
  title: `${APP_NAME} — Gym Management`,
  description: "Train. Track. Transform. The gym platform members actually want to open.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#121016",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve the visual vibe server-side so there's zero flash of the wrong
  // theme — logged-out pages (landing, login, signup) get the default Ember
  // look; signed-in users get their own (gender-derived, override-able) vibe.
  const user = await getCurrentUser();
  const vibe = resolveVibe(user?.gender ?? null, user?.themeOverride ?? null);

  return (
    <html lang="en" data-theme={themeAttr(vibe)}>
      <body>
        {children}
        <script
          // Registers the service worker for installability + offline shell.
          // Kept inline + tiny so it never blocks first paint.
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
