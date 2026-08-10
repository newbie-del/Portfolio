"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Code2, Terminal, Activity, FlaskConical, Mouse } from "lucide-react";
import { SITE, METRICS, PATHS } from "@/data/site";
import { CountUp, Typewriter } from "@/components/ui/primitives";
import { Led } from "@/components/ui/Panel";
import { DUR, EASE, inView, stagger, wordIn } from "@/lib/motion";

// 3D is loaded only in the browser, after the shell paints.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const PATH_ICONS = {
  code: Code2,
  terminal: Terminal,
  chart: Activity,
  flask: FlaskConical,
} as const;

export default function IndexPage() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      {/* ==================================================== HERO ENVIRONMENT */}
      <section className="relative h-[calc(100dvh-3.5rem)] min-h-[560px] w-full overflow-hidden border-b border-hairline lg:h-dvh">
        {/* Live 3D workspace — the reference's hero image, made real */}
        <HeroScene />

        {/* Cinematic grade over the render */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 25%, rgb(0 0 0 / 0.55) 72%, rgb(0 0 0 / 0.9) 100%)",
          }}
        />
        <div aria-hidden className="scanlines pointer-events-none absolute inset-0 z-10 opacity-60" />

        {/* ---------------------------------------------- HERO CONTENT */}
        <div className="relative z-20 flex h-full flex-col justify-between px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          {/* top: boot readout (mobile only — desktop has it in the rail) */}
          <div className="lg:hidden">
            <div className="text-[9.5px] text-lime">&gt; SYSTEM_BOOT</div>
          </div>

          {/* middle: the headline */}
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.base, delay: 0.15 }}
              className="mb-5 flex items-center gap-2 text-[9.5px] tracking-[0.22em] text-muted"
            >
              <Led tone="lime" />
              <Typewriter
                text="INITIALIZING EXPERIENCE..."
                speed={26}
                delay={300}
                onDone={() => setBootDone(true)}
              />
            </motion.div>

            <motion.h1
              variants={stagger(0.55, 0.075)}
              initial="hidden"
              animate="visible"
              className="display text-[clamp(2.1rem,7.5vw,5.25rem)]"
            >
              <motion.span variants={wordIn} custom={0} className="block">
                I BUILD<span className="text-violet">_</span>
              </motion.span>
              <motion.span variants={wordIn} custom={1} className="block text-violet">
                DIGITAL SYSTEMS
              </motion.span>
              <motion.span variants={wordIn} custom={2} className="block">
                THAT CREATE IMPACT.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 0.95 }}
              className="mt-6 text-[10.5px] tracking-[0.2em] text-muted"
            >
              {SITE.roles.join("  •  ")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 1.1 }}
              className="mt-8"
            >
              <Link href="/work" className="cmd group">
                <span className="text-violet">&gt;</span>
                ENTER MY WORLD
                <ArrowRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* bottom: scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: DUR.slow }}
            className="flex items-center justify-between"
          >
            <span className="text-[9px] tracking-[0.22em] text-ghost">
              {SITE.location.toUpperCase()}
            </span>
            <span className="flex items-center gap-2 text-[9px] tracking-[0.22em] text-muted">
              SCROLL TO EXPLORE
              <Mouse
                className="size-3 text-faint"
                style={{ animation: "drift 2.6s var(--ease-mech) infinite" }}
              />
            </span>
          </motion.div>
        </div>

        {/* ---------------------------------------- SYSTEM METRICS PANEL */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 1.25 }}
          className="panel corner-ticks absolute right-5 top-20 z-20 hidden w-[210px] xl:block"
        >
          <header className="border-b border-hairline px-3 py-2">
            <span className="section-label text-lime">SYSTEM METRICS</span>
          </header>
          <dl className="divide-y divide-hairline">
            {METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between px-3 py-2">
                <dt className="text-[9px] tracking-[0.14em] text-faint">{m.label}</dt>
                <dd className="font-display text-[13px] font-bold tabular-nums text-bright">
                  <CountUp value={m.value} suffix={m.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      </section>

      {/* ================================================ CHOOSE YOUR PATH */}
      <section className="relative border-b border-hairline px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-3 text-center">
            <span className="section-label">02_ CHOOSE YOUR PATH</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: DUR.slow, ease: EASE.outExpo }}
            className="display mb-3 text-center text-[clamp(1.5rem,4vw,2.75rem)]"
          >
            WHERE DO YOU WANT TO GO?
          </motion.h2>
          <p className="mb-12 text-center text-[11px] text-muted">
            Every path reveals a different part of the builder.
          </p>

          <motion.div
            variants={stagger(0.1, 0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PATHS.map((p) => (
              <PathCard key={p.id} path={p} />
            ))}
          </motion.div>

          <div className="mt-10 text-center text-[9.5px] text-faint">
            root@newbie-del:~$ choose --path <span className="caret align-middle" />
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function PathCard({ path }: { path: (typeof PATHS)[number] }) {
  const Icon = PATH_ICONS[path.icon];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
      }}
    >
      <Link
        href={path.href}
        className="panel corner-ticks group relative block h-full overflow-hidden p-5 transition-colors duration-300 hover:border-hairline-hot"
      >
        {/* Hover wash — the "surrounding visual transforms" response */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet/[0.09] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-violet to-transparent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
        />

        <Icon className="mb-8 size-6 text-violet transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:text-cyan" />

        <h3 className="mb-1.5 font-display text-[13px] font-bold tracking-[0.12em] text-bright">
          {path.title}
        </h3>
        <p className="mb-6 text-[10.5px] leading-relaxed text-muted">{path.blurb}</p>

        <span className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-violet">
          ENTER
          <ArrowRight className="size-2.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}
