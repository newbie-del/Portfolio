import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects — AI platforms, full-stack applications and data dashboards, each with a live X-Ray teardown.",
};

export default function WorkLayout({ children }: { children: ReactNode }) {
  return children;
}
