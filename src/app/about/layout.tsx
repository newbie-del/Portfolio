import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Per-segment metadata. The pages themselves are client components (they own
 * canvas and scroll state), so the title/description live in a server layout
 * alongside them rather than in the page file.
 */
export const metadata: Metadata = {
  title: "About",
  description:
    "Who is behind this. Background, principles and the way I approach building software.",
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
