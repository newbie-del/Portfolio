"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Network, X } from "lucide-react";
import { SKILLS, TECH_COUNT, findTech } from "@/data/skills";
import { PROJECTS } from "@/data/projects";
import { EcosystemGraph } from "@/components/stack/EcosystemGraph";
import { ADJACENCY, TONE_TEXT } from "@/components/stack/graph-layout";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { CountUp } from "@/components/ui/primitives";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
};

/**
 * 04_STACK — TECHNICAL ECOSYSTEM
 * ---------------------------------------------------------------------------
 * Hovering a technology highlights the technologies it is used alongside and
 * the projects that actually use it. Both relationships come from skills.ts,
 * where every `projects` entry is a real slug — so the graph cannot claim a
 * project used something it did not.
 *
 * Two views of one dataset: the radial graph is the spatial read (pointer
 * only, aria-hidden), the category grid is the accessible read (real buttons,
 * keyboard focus drives the same highlight). Neither is decorative duplication
 * — the grid is the source of truth for interaction.
 */
export default function StackPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const focus = hovered ?? pinned;
  const tech = focus ? findTech(focus) : undefined;
  const near = focus ? ADJACENCY.get(focus) : undefined;

  const linkedProjects = useMemo(
    () => (tech ? PROJECTS.filter((p) => tech.projects.includes(p.slug)) : []),
    [tech],
  );

  /** Technologies proven in shipped work, vs. tooling with no project link. */
  const appliedCount = useMemo(
    () => SKILLS.flatMap((c) => c.items).filter((t) => t.projects.length > 0).length,
    [],
  );

  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================= HEADER */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <SectionHeading index="04" sub="STACK" title="TECHNICAL ECOSYSTEM" />

        <motion.div
          variants={stagger(0.05, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end"
        >
          <motion.p variants={rise} className="max-w-[64ch] text-[12px] leading-relaxed text-muted">
            Not a list of logos. Select any technology to see what it connects to and which
            projects it actually shipped in — the links come from the builds themselves.
          </motion.p>

          <motion.dl
            variants={rise}
            className="panel grid grid-cols-3 divide-x divide-hairline text-center"
          >
            <Stat k="TECH" v={TECH_COUNT} />
            <Stat k="APPLIED" v={appliedCount} tone="text-lime" />
            <Stat k="DOMAINS" v={SKILLS.length} tone="text-cyan" />
          </motion.dl>
        </motion.div>
      </section>

      {/* ============================================================== GRAPH */}
      <section className="mt-10 px-5 sm:px-8 lg:mt-14 lg:px-12">
        <div className="panel corner-ticks overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3">
            <span className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-ghost">
              <Led tone="cyan" />
              RELATIONSHIP MAP
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-[8.5px] tracking-[0.18em] text-ghost">
              <Network className="size-2.5" />
              {focus ? focus.toUpperCase() : "SELECT A NODE"}
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* graph is pointer-driven; hidden below lg where it cannot be used */}
            <div className="relative hidden aspect-square border-hairline lg:block lg:border-r">
              <span aria-hidden className="grid-backdrop absolute inset-0 opacity-30" />
              <div className="absolute inset-0 p-3">
                <EcosystemGraph focus={focus} onFocus={setHovered} onSelect={setPinned} />
              </div>
            </div>

            {/* ------------------------------------------------------- READOUT */}
            <div className="flex flex-col">
              <AnimatePresence mode="wait" initial={false}>
                {tech ? (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: DUR.base, ease: EASE.outExpo }}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-bold tracking-[0.04em] text-bright">
                          {tech.name}
                        </h2>
                        <p className="mt-1 text-[8.5px] tracking-[0.2em] text-faint">
                          {SKILLS.find((c) => c.items.some((t) => t.name === tech.name))?.label}
                        </p>
                      </div>
                      {pinned && (
                        <button
                          onClick={() => setPinned(null)}
                          aria-label="Clear selection"
                          className="shrink-0 border border-hairline p-1 text-faint transition-colors hover:border-hairline-hot hover:text-bright"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {!!near?.size && (
                      <div className="mt-4">
                        <p className="mb-2 text-[8.5px] tracking-[0.2em] text-ghost">
                          USED ALONGSIDE
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[...near].map((n) => (
                            <button
                              key={n}
                              onClick={() => setPinned(n)}
                              onPointerEnter={() => setHovered(n)}
                              onPointerLeave={() => setHovered(null)}
                              className="chip transition-colors duration-300 hover:border-cyan/40 hover:text-cyan"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="mb-2 flex items-center gap-2 text-[8.5px] tracking-[0.2em] text-ghost">
                        SHIPPED IN
                        <span className="tabular-nums text-faint">
                          {String(linkedProjects.length).padStart(2, "0")}
                        </span>
                      </p>

                      {linkedProjects.length ? (
                        <ul className="space-y-1.5">
                          {linkedProjects.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/work/${p.slug}`}
                                className="group flex items-center gap-2.5 border border-hairline px-3 py-2 transition-colors duration-300 hover:border-hairline-hot"
                              >
                                <span className="font-display text-[9px] font-bold tabular-nums text-ghost">
                                  {p.index}
                                </span>
                                <span className="truncate text-[10px] tracking-[0.08em] text-muted transition-colors duration-300 group-hover:text-bright">
                                  {p.name}
                                </span>
                                <ArrowUpRight className="ml-auto size-3 shrink-0 text-ghost transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="border border-hairline px-3 py-2.5 text-[10px] leading-relaxed text-faint">
                          Part of the toolchain rather than a project dependency — used while
                          building, not shipped inside one.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast }}
                    className="flex flex-1 flex-col justify-center gap-2 p-6"
                  >
                    <p className="text-[10.5px] leading-relaxed text-faint">
                      Every node is a technology. Every line is a pairing I have actually used
                      together.
                    </p>
                    <p className="text-[9px] tracking-[0.18em] text-ghost">
                      HOVER THE MAP OR PICK FROM THE INDEX BELOW
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== INDEX */}
      <section className="mt-12 px-5 sm:px-8 lg:mt-16 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-label">FULL INDEX</span>
          <div className="rule flex-1" />
          <span className="text-[9px] tabular-nums tracking-[0.2em] text-ghost">
            {TECH_COUNT} ENTRIES
          </span>
        </div>

        <motion.div
          variants={stagger(0.02, 0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SKILLS.map((cat) => (
            <motion.div key={cat.id} variants={rise} className="panel p-4">
              <div className="mb-3 flex items-center gap-2">
                <Led tone={cat.tone} />
                <span className={`text-[9px] tracking-[0.2em] ${TONE_TEXT[cat.tone]}`}>
                  {cat.label}
                </span>
                <span className="ml-auto text-[8.5px] tabular-nums text-ghost">
                  {String(cat.items.length).padStart(2, "0")}
                </span>
              </div>

              <ul className="flex flex-wrap gap-1.5">
                {cat.items.map((t) => {
                  const on = focus === t.name;
                  const linked = !!near?.has(t.name);
                  return (
                    <li key={t.name}>
                      <button
                        onPointerEnter={() => setHovered(t.name)}
                        onPointerLeave={() => setHovered(null)}
                        onFocus={() => setHovered(t.name)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setPinned((c) => (c === t.name ? null : t.name))}
                        aria-pressed={pinned === t.name}
                        className={`chip transition-colors duration-300 ${
                          on
                            ? "border-bright/40 text-bright"
                            : linked
                              ? "border-cyan/40 text-cyan"
                              : "hover:border-hairline-hot hover:text-muted"
                        }`}
                      >
                        {t.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

function Stat({ k, v, tone = "text-bright" }: { k: string; v: number; tone?: string }) {
  return (
    <div className="px-3 py-3">
      <dd className={`font-display text-lg font-bold tabular-nums ${tone}`}>
        <CountUp value={v} />
      </dd>
      <dt className="mt-0.5 text-[8px] tracking-[0.2em] text-faint">{k}</dt>
    </div>
  );
}
