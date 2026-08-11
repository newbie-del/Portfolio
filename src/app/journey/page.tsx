"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, GraduationCap, ScrollText } from "lucide-react";
import { MILESTONES } from "@/data/journey";
import { CERTIFICATIONS, EDUCATION } from "@/data/about";
import { Milestone } from "@/components/journey/Milestone";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
};

/**
 * 05_JOURNEY — SCROLL-DRIVEN TIMELINE
 * ---------------------------------------------------------------------------
 * Every date here is provable from the resume. The reference image's
 * 2022-2026 labels were dropped deliberately: 2018 schooling, Aug 2023 BE
 * start, 2025 Connex AI, 2026 the rest. Nothing is invented to fill the gap.
 *
 * Scroll is the only driver — a progress spine tracks the section, and each
 * milestone derives its own state from its position. Nothing loops, and the
 * page is completely static at rest.
 */
export default function JourneyPage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 60%"],
  });

  // Springed so the readout has weight instead of tracking the wheel 1:1.
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  const pct = useTransform(progress, (v) => `${Math.round(v * 100)}%`);

  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================= HEADER */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <SectionHeading index="05" sub="JOURNEY" title="THE PATH SO FAR" />

        <motion.div
          variants={stagger(0.05, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end"
        >
          <motion.p variants={rise} className="max-w-[62ch] text-[12px] leading-relaxed text-muted">
            Five markers, all verifiable — schooling, the start of the engineering degree, the
            first shipped platform, the year the rest followed, and where things stand today.
          </motion.p>

          <motion.div variants={rise} className="panel px-4 py-3">
            <div className="flex items-center justify-between text-[8.5px] tracking-[0.2em] text-ghost">
              <span className="flex items-center gap-2">
                <Led tone="violet" />
                TIMELINE
              </span>
              <motion.span className="tabular-nums text-faint">
                {reduce ? "100%" : pct}
              </motion.span>
            </div>
            <div className="mt-2.5 h-px w-full bg-hairline">
              <motion.div
                style={reduce ? { scaleX: 1 } : { scaleX: progress }}
                className="h-full origin-left bg-gradient-to-r from-violet to-cyan"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =========================================================== TIMELINE */}
      <section ref={trackRef} className="mt-12 px-5 sm:px-8 lg:mt-16 lg:px-12">
        <ol className="relative">
          {MILESTONES.map((m, i) => (
            <Milestone key={m.year + m.title} data={m} index={i} total={MILESTONES.length} />
          ))}
        </ol>
      </section>

      {/* ====================================================== CREDENTIALS */}
      <section className="mt-6 px-5 sm:px-8 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-label">ON RECORD</span>
          <div className="rule flex-1" />
        </div>

        <motion.div
          variants={stagger(0.04, 0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* ------------------------------------------------------ EDUCATION */}
          <motion.div variants={rise} className="panel corner-ticks p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[9px] tracking-[0.2em] text-cyan">
              <GraduationCap className="size-3" />
              EDUCATION
            </div>

            <ul className="space-y-3">
              {EDUCATION.map((e) => (
                <li key={e.title} className="border-l border-hairline-lit pl-3">
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <h3 className="text-[11.5px] tracking-[0.06em] text-bright">{e.title}</h3>
                    <span className="text-[9px] tabular-nums text-faint">{e.period}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted">{e.org}</p>
                  {!!e.facts.length && (
                    <ul className="mt-1 space-y-0.5">
                      {e.facts.map((f) => (
                        <li
                          key={f}
                          className="text-[9.5px] tabular-nums tracking-[0.1em] text-lime"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* -------------------------------------------------- CERTIFICATIONS */}
          <motion.div variants={rise} className="panel corner-ticks p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[9px] tracking-[0.2em] text-amber">
              <ScrollText className="size-3" />
              CERTIFICATIONS
              <span className="ml-auto tabular-nums text-ghost">
                {String(CERTIFICATIONS.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="space-y-2">
              {CERTIFICATIONS.map((c, i) => (
                <li
                  key={c.name}
                  className="flex items-baseline gap-2.5 border-b border-hairline pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-display text-[9px] font-bold tabular-nums text-ghost">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] leading-snug text-muted">{c.name}</p>
                    <p className="mt-0.5 text-[8.5px] tracking-[0.16em] text-faint">{c.org}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================ CTA */}
      <section className="mt-10 px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel flex flex-wrap items-center justify-between gap-4 p-5"
        >
          <p className="text-[11.5px] leading-relaxed text-muted">
            The timeline is the summary. The builds are the evidence.
          </p>
          <Link href="/work" className="cmd group">
            SEE THE WORK
            <ArrowUpRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
