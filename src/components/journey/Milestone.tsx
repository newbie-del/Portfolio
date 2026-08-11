"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Milestone as MilestoneData } from "@/data/journey";
import { DUR, EASE } from "@/lib/motion";

const TONE_BORDER: Record<MilestoneData["tone"], string> = {
  violet: "group-hover:border-violet/40",
  cyan: "group-hover:border-cyan/40",
  lime: "group-hover:border-lime/40",
  amber: "group-hover:border-amber/40",
  rose: "group-hover:border-rose/40",
};

const TONE_TEXT: Record<MilestoneData["tone"], string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  rose: "text-rose",
};

const TONE_BG: Record<MilestoneData["tone"], string> = {
  violet: "bg-violet",
  cyan: "bg-cyan",
  lime: "bg-lime",
  amber: "bg-amber",
  rose: "bg-rose",
};

/**
 * One timeline entry.
 *
 * Scroll drives two things and nothing else: the card settles from a small
 * offset as it enters, and the year plate scales up as the row crosses the
 * viewport centre. Both are derived from the element's own scroll progress, so
 * scrubbing backwards reverses them exactly — no one-way "revealed" flag.
 */
export function Milestone({
  data,
  index,
  total,
}: {
  data: MilestoneData;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 40%"],
  });

  // 0 -> 1 as the row travels through the lower half of the viewport.
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0.35, 1]);
  const nodeScale = useTransform(scrollYProgress, [0, 0.5], [0.55, 1]);
  const lineScale = useTransform(scrollYProgress, [0.05, 0.65], [0, 1]);

  const last = index === total - 1;

  return (
    <motion.li
      ref={ref}
      style={reduce ? undefined : { opacity }}
      className="group relative grid grid-cols-[38px_minmax(0,1fr)] gap-4 pb-10 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-7 lg:pb-14"
    >
      {/* ------------------------------------------------------------- SPINE */}
      <div className="relative flex justify-center sm:justify-end sm:pr-0">
        {/* the year, right-aligned against the spine on wider screens */}
        <motion.span
          style={reduce ? undefined : { scale: nodeScale }}
          className={`absolute -top-1 hidden origin-right font-display text-[13px] font-bold tabular-nums tracking-[0.08em] sm:right-8 sm:block ${TONE_TEXT[data.tone]}`}
        >
          {data.year}
        </motion.span>

        {/* node marker */}
        <div className="relative z-10 mt-0.5 flex size-[38px] shrink-0 items-center justify-center sm:size-auto">
          <motion.span
            style={reduce ? undefined : { scale: nodeScale }}
            className={`block size-2.5 rotate-45 border ${TONE_BORDER[data.tone]} border-hairline-lit bg-void transition-colors duration-500`}
          >
            <span className={`absolute inset-[3px] ${TONE_BG[data.tone]} opacity-80`} />
          </motion.span>
        </div>

        {/* connector to the next node — grows with scroll */}
        {!last && (
          <motion.span
            aria-hidden
            style={reduce ? { scaleY: 1 } : { scaleY: lineScale }}
            className="absolute left-1/2 top-6 h-[calc(100%-1rem)] w-px origin-top -translate-x-1/2 bg-gradient-to-b from-hairline-lit to-hairline sm:left-auto sm:right-[calc(50%-0.5px)] sm:translate-x-0"
          />
        )}
      </div>

      {/* -------------------------------------------------------------- CARD */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 22 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: DUR.slow, ease: EASE.outExpo }}
        className={`panel corner-ticks min-w-0 border-hairline p-4 transition-colors duration-500 sm:p-5 ${TONE_BORDER[data.tone]}`}
      >
        <div className="mb-2 flex items-center gap-2.5">
          <span className="font-display text-[10px] font-bold tabular-nums text-ghost">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={`text-[9px] tracking-[0.2em] sm:hidden ${TONE_TEXT[data.tone]}`}>
            {data.year}
          </span>
          <div className="rule flex-1" />
        </div>

        <h2 className="font-display text-[clamp(1.05rem,2.6vw,1.5rem)] font-bold leading-tight tracking-[0.04em] text-bright transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
          {data.title}
        </h2>

        <p className="mt-2.5 max-w-[62ch] text-[11.5px] leading-relaxed text-muted">
          {data.detail}
        </p>
      </motion.div>
    </motion.li>
  );
}
