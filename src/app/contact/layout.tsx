import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Direct lines — email, phone, GitHub and X. Open to remote work and to relocating for the right team.",
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
