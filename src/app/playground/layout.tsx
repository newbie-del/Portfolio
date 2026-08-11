import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Live experiments — flow fields, flocking, cellular automata, gravity wells and more, running on this page.",
};

export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return children;
}
