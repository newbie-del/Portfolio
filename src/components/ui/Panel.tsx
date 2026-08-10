"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE, inView } from "@/lib/motion";

/**
 * The structural unit of the reference frame: a thin-bordered dark panel with
 * a monospace label bar and optional corner ticks.
 */
export function Panel({
  label,
  meta,
  children,
  className = "",
  bodyClassName = "",
  delay = 0,
  ticks = true,
  animate = true,
}: {
  label?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  delay?: number;
  ticks?: boolean;
  animate?: boolean;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.slow, ease: EASE.outExpo, delay },
    },
  };

  return (
    <motion.section
      variants={animate ? variants : undefined}
      initial={animate ? "hidden" : undefined}
      whileInView={animate ? "visible" : undefined}
      viewport={inView}
      className={`panel ${ticks ? "corner-ticks" : ""} ${className}`}
    >
      {(label || meta) && (
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-2.5">
          {label && <span className="section-label">{label}</span>}
          {meta && <div className="flex items-center gap-3 text-[9.5px] text-faint">{meta}</div>}
        </header>
      )}
      <div className={bodyClassName || "p-4"}>{children}</div>
    </motion.section>
  );
}

/** Numbered section heading: "03_ WORK / PROJECTS" with a trailing rule. */
export function SectionHeading({
  index,
  title,
  sub,
  className = "",
}: {
  index: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-end gap-4 ${className}`}>
      <div className="min-w-0">
        <div className="section-label mb-2 text-violet">
          {index}_ <span className="text-faint">/</span>{" "}
          <span className="text-muted">{sub ?? "SECTION"}</span>
        </div>
        <h1 className="display text-[clamp(2rem,5.5vw,3.75rem)]">{title}</h1>
      </div>
      <div className="rule mb-3 hidden flex-1 sm:block" />
    </div>
  );
}

/** Small blinking LED — ambient environmental life. */
export function Led({
  tone = "lime",
  delay = 0,
}: {
  tone?: "lime" | "cyan" | "violet" | "amber" | "rose";
  delay?: number;
}) {
  const color = {
    lime: "bg-lime",
    cyan: "bg-cyan",
    violet: "bg-violet",
    amber: "bg-amber",
    rose: "bg-rose",
  }[tone];

  return (
    <span
      className={`inline-block size-[5px] rounded-full ${color}`}
      style={{
        animation: `led-pulse 2.4s var(--ease-mech) infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}
