"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { CATEGORIES, PROJECTS, type CategoryFilter } from "@/data/projects";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

/**
 * 03_WORK — THE ARCHIVE
 * ---------------------------------------------------------------------------
 * All seven projects, filterable by category. The filter is a real query over
 * the data (never a hidden-but-mounted trick), so the DOM reflects what the
 * user asked for and the count readout stays honest.
 *
 * Motion: cards enter on a stagger the first time they scroll into view, and
 * re-key on filter change so AnimatePresence can cross-fade the set. Layout
 * animation carries surviving cards to their new positions instead of jumping.
 */
export default function WorkPage() {
  const [filter, setFilter] = useState<CategoryFilter>("ALL");

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: PROJECTS.length };
    for (const p of PROJECTS) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, []);

  const shown = useMemo(
    () => (filter === "ALL" ? PROJECTS : PROJECTS.filter((p) => p.category === filter)),
    [filter],
  );

  const liveCount = useMemo(() => PROJECTS.filter((p) => p.live).length, []);

  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================= HEADER */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <SectionHeading index="03" sub="WORK" title="SELECTED PROJECTS" />

        <motion.div
          variants={stagger(0.05, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end"
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
            }}
            className="max-w-[62ch] text-[12px] leading-relaxed text-muted"
          >
            Seven builds, each solving a problem I actually ran into. Open any one to see the
            teardown — the architecture, the decisions and the layers underneath.
          </motion.p>

          {/* readout — the archive described in numbers */}
          <motion.dl
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
            }}
            className="panel grid grid-cols-3 divide-x divide-hairline text-center"
          >
            <Stat k="TOTAL" v={String(PROJECTS.length).padStart(2, "0")} />
            <Stat k="DOMAINS" v={String(CATEGORIES.length - 1).padStart(2, "0")} />
            <Stat k="LIVE" v={String(liveCount).padStart(2, "0")} tone="text-lime" />
          </motion.dl>
        </motion.div>
      </section>

      {/* ========================================================= FILTER BAR */}
      <section className="sticky top-0 z-30 mt-10 border-y border-hairline bg-abyss/85 backdrop-blur-xl lg:mt-14">
        <div className="flex items-center gap-4 overflow-x-auto px-5 py-3 sm:px-8 lg:px-12">
          <span className="flex shrink-0 items-center gap-2 text-[9px] tracking-[0.2em] text-ghost">
            <Led tone="violet" />
            FILTER
          </span>

          <div role="tablist" aria-label="Filter projects by category" className="flex gap-1.5">
            {CATEGORIES.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(c)}
                  className={`relative shrink-0 border px-3 py-1.5 text-[9px] tracking-[0.2em] transition-colors duration-300 ${
                    active
                      ? "border-violet/50 text-bright"
                      : "border-hairline text-faint hover:border-hairline-hot hover:text-muted"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="work-filter-fill"
                      aria-hidden
                      className="absolute inset-0 -z-10 bg-violet/12"
                      transition={{ duration: DUR.base, ease: EASE.outExpo }}
                    />
                  )}
                  {c}
                  <span className={`ml-1.5 tabular-nums ${active ? "text-violet" : "text-ghost"}`}>
                    {counts[c] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <span
            aria-live="polite"
            className="ml-auto hidden shrink-0 text-[9px] tracking-[0.2em] text-ghost sm:block"
          >
            {String(shown.length).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}{" "}
            SHOWN
          </span>
        </div>
      </section>

      {/* ============================================================ ARCHIVE */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={filter}
            variants={stagger(0.02, 0.08)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: DUR.fast } }}
            className="grid gap-4 lg:gap-5"
          >
            {shown.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="mt-10 flex items-center gap-2 text-[9.5px] tracking-[0.18em] text-ghost">
          <Radio className="size-3 text-lime" />
          LIVE DEMOS ARE MARKED. THE REST SHIP AS SOURCE — OPEN A TEARDOWN FOR THE REPO.
        </p>
      </section>
    </div>
  );
}

function Stat({ k, v, tone = "text-bright" }: { k: string; v: string; tone?: string }) {
  return (
    <div className="px-3 py-3">
      <dd className={`font-display text-lg font-bold tabular-nums ${tone}`}>{v}</dd>
      <dt className="mt-0.5 text-[8px] tracking-[0.2em] text-faint">{k}</dt>
    </div>
  );
}
