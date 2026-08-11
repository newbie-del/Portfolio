import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import {
  PageShell,
  StatusBar,
  TransitionCurtain,
  CursorGlow,
} from "@/components/layout/Shell";
import { SITE, SITE_URL } from "@/data/site";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${space.variable}`}>
      <body className="antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-violet focus:bg-panel focus:px-4 focus:py-2 focus:text-xs"
        >
          Skip to content
        </a>
        <CursorGlow />
        <TransitionCurtain />
        <Nav />
        <PageShell>
          <div id="content">{children}</div>
        </PageShell>
        <StatusBar />
      </body>
    </html>
  );
}
