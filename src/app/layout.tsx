import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Rail } from "@/components/layout/Rail";
import { PageShell, TransitionCurtain } from "@/components/layout/Shell";
import { SITE, SITE_URL } from "@/data/site";

/**
 * TYPE PAIRING
 * ---------------------------------------------------------------------------
 * IBM Plex Sans and IBM Plex Mono are one superfamily, drawn together at Bold
 * Monday. They share proportions and vertical metrics, so prose and telemetry
 * sit on the same grid without sounding like the same voice.
 *
 * The mono carries the terminal identity the reference is built on. The sans
 * exists because the previous build had no body-copy face at all, and setting
 * every paragraph in monospace is what made it read as generated.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.handle}`,
  },
  description:
    "Full-Stack Developer, AI Enthusiast and Problem Solver. I build digital systems that create impact.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description: "I build digital systems that create impact.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-lime focus:bg-panel focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <TransitionCurtain />
        <Rail />
        <PageShell>
          <div id="content">{children}</div>
        </PageShell>
      </body>
    </html>
  );
}
