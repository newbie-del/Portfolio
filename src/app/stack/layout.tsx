import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Stack",
  description:
    "The technical ecosystem — languages, frameworks, tools and the systems they wire together.",
};

export default function StackLayout({ children }: { children: ReactNode }) {
  return children;
}
