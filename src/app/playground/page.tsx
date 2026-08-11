"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { EXPERIMENTS, type Experiment } from "@/data/playground";
import {
  Boids,
  FlowField,
  GameOfLife,
  GravityWells,
  Pathfinder,
  TextDissolve,
  type ExperimentProps,
} from "@/components/playground/experiments";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

const VIEWS: Record<string, ComponentType<ExperimentProps>> = {
  flow: FlowField,
  boids: Boids,
  life: GameOfLife,
  gravity: GravityWells,
  dissolve: TextDissolve,
  path: Pathfinder,
};

const TONE_TEXT: Record<Experiment["tone"], string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  rose: "text-rose",
};

const TONE_BORDER: Record<Experiment["tone"], string> = {
  violet: "border-violet/40",
  cyan: "border-cyan/40",
  lime: "border-lime/40",
  amber: "border-amber/40",
  rose: "border-rose/40",
};

const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
};

/**
 * 06_PLAYGROUND — SIX LIVE SIMULATIONS
 * ---------------------------------------------------------------------------
 * Only the selected experiment is mounted, and its `running` flag gates the
 * animation frame entirely, so the page never pays for six loops. RESET bumps
 * `resetKey`, which re-inits deterministic state — every experiment seeds from
 * a fixed PRNG, so a reset looks identical every time.
 *
 * Under `prefers-reduced-motion` nothing starts on its own: the stage mounts
 * paused and the visitor opts in with RUN.
 */
export default function PlaygroundPage() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(EXPERIMENTS[0].id);
  const [running, setRunning] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const active = EXPERIMENTS.find((e) => e.id === activeId) ?? EXPERIMENTS[0];
  const View = VIEWS[active.id];
  const live = running && !reduce;

  function select(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setResetKey((k) => k + 1);
  }

  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================= HEADER */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <SectionHeading index="06" sub="PLAYGROUND" title="LIVE EXPERIMENTS" />

        <motion.div
          variants={stagger(0.05, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end"
        >
          <motion.p variants={rise} className="max-w-[62ch] text-[12px] leading-relaxed text-muted">
            Six simulations, each running in your browser right now — not recordings, and not
            past work. They exist on this page. Pick one, interact with it, reset it.
          </motion.p>

          <motion.div variants={rise} className="panel px-4 py-3">
            <div className="flex items-center justify-between text-[8.5px] tracking-[0.2em] text-ghost">
              <span className="flex items-center gap-2">
                <Led tone={live ? "lime" : "amber"} />
                {live ? "SIMULATING" : "PAUSED"}
              </span>
              <span className="tabular-nums text-faint">
                {active.index} / {String(EXPERIMENTS.length).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-2.5 text-[9.5px] leading-relaxed text-faint">
              One loop at a time. The other five are unmounted.
            </p>
          </motion.div>
        </motion.div>
      </section>
      {/* ============================================================== STAGE */}
      <section className="mt-8 grid gap-4 px-5 sm:px-8 lg:mt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12">
        {/* ---------------------------------------------------------- SELECTOR */}
        <motion.ul
          variants={stagger(0.03, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:content-start"
        >
          {EXPERIMENTS.map((e) => {
            const on = e.id === active.id;
            return (
              <motion.li key={e.id} variants={rise}>
                <button
                  type="button"
                  onClick={() => select(e.id)}
                  aria-pressed={on}
                  className={`group relative w-full border p-3 text-left transition-colors duration-300 ${
                    on
                      ? `bg-panel ${TONE_BORDER[e.tone]}`
                      : "border-hairline hover:border-hairline-lit"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-display text-[9px] font-bold tabular-nums ${
                        on ? TONE_TEXT[e.tone] : "text-ghost"
                      }`}
                    >
                      {e.index}
                    </span>
                    <span
                      className={`text-[9.5px] tracking-[0.14em] ${
                        on ? "text-bright" : "text-muted group-hover:text-bright"
                      }`}
                    >
                      {e.name}
                    </span>
                  </div>
                  {on && (
                    <motion.span
                      layoutId="pg-active"
                      transition={{ duration: DUR.base, ease: EASE.outExpo }}
                      className={`absolute inset-y-0 left-0 w-px ${TONE_TEXT[e.tone].replace("text-", "bg-")}`}
                    />
                  )}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* ------------------------------------------------------------ CANVAS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel corner-ticks min-w-0 overflow-hidden"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className={`section-label ${TONE_TEXT[active.tone]}`}>{active.name}</span>
              <span className="truncate text-[9px] tracking-[0.14em] text-ghost">
                {active.technique}
              </span>
            </span>

            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="cmd"
                aria-label={running ? "Pause simulation" : "Run simulation"}
              >
                {running ? <Pause className="size-3" /> : <Play className="size-3" />}
                {running ? "PAUSE" : "RUN"}
              </button>
              <button
                type="button"
                onClick={() => setResetKey((k) => k + 1)}
                className="cmd"
                aria-label="Reset simulation"
              >
                <RotateCcw className="size-3" />
                RESET
              </button>
            </span>
          </header>

          <div className="relative h-[clamp(320px,54vh,560px)] w-full bg-abyss">
            <View running={live} resetKey={resetKey} />

            {!live && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-void/60">
                <p className="text-[10px] tracking-[0.18em] text-faint">
                  {reduce && !running ? "PAUSED — REDUCED MOTION" : "PAUSED"}
                </p>
              </div>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-2.5">
            <p className="text-[10.5px] leading-relaxed text-muted">{active.blurb}</p>
            <p className={`text-[9px] tracking-[0.14em] ${TONE_TEXT[active.tone]}`}>
              {active.interaction}
            </p>
          </footer>
        </motion.div>
      </section>

      {/* ============================================================== DETAIL */}
      <section className="mt-4 px-5 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DUR.base, ease: EASE.outExpo }}
            className="panel flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3"
          >
            <span className="text-[8.5px] tracking-[0.2em] text-ghost">COMPUTED</span>
            <span className="text-[10.5px] text-muted">{active.technique}</span>
            <span className="ml-auto text-[8.5px] tracking-[0.2em] text-faint">
              CANVAS 2D · DETERMINISTIC SEED
            </span>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ================================================================= CTA */}
      <section className="mt-10 px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel flex flex-wrap items-center justify-between gap-4 p-5"
        >
          <p className="text-[11.5px] leading-relaxed text-muted">
            Experiments are where the technique gets tested. The projects are where it ships.
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
