import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "The path so far — education, the first shipped platform, and where things stand today.",
};

export default function JourneyLayout({ children }: { children: ReactNode }) {
  return children;
}
