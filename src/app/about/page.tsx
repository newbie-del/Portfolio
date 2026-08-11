"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, MapPin } from "lucide-react";
import { SITE } from "@/data/site";
import {
  ABOUT_FILE,
  ABOUT_STATS,
  ACTIVITY,
  CERTIFICATIONS,
  EDUCATION,
  PRINCIPLES,
  TAGS,
} from "@/data/about";
import { CountUp, useIsMobile, useMounted } from "@/components/ui/primitives";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { DUR, EASE, inView, separate, stagger } from "@/lib/motion";

const PortraitCanvas = dynamic(() => import("@/components/three/PortraitCanvas"), {
  ssr: false,
});

const TONE_TEXT = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
} as const;

const TONE_BORDER = {
  violet: "border-violet/40",
  cyan: "border-cyan/40",
  lime: "border-lime/40",
  amber: "border-amber/40",
} as const;

export default function AboutPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* ================================================== HEADER + PORTRAIT */}
      <section className="border-b border-hairline px-5 pt-12 sm:px-8 lg:px-12 lg:pt-20">
        <SectionHeading index="02" sub="ABOUT" title="WHO IS BEHIND THIS" className="mb-12" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
          {/* ------------------------------------------------ cat about_me.txt */}
          <div className="min-w-0">
            <TerminalFile />

            <motion.div
              variants={stagger(0.1, 0.05)}
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              className="mt-8 flex flex-wrap gap-2"
            >
              {TAGS.map((t, i) => (
                <ReactiveTag key={t} label={t} index={i} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 0.2 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a href={SITE.resume} download className="cmd group">
                <span className="text-violet">&gt;</span>
                DOWNLOAD RESUME
                <Download className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5" />
              </a>
              <Link href="/work" className="cmd group">
                <span className="text-violet">&gt;</span>
                SEE THE WORK
                <ArrowRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* ------------------------------------------------------- portrait */}
          <PortraitPanel />
        </div>

        {/* -------------------------------------------------------- stat row */}
        <motion.dl
          variants={stagger(0.05, 0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-14 grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-4"
        >
          {ABOUT_STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={separate}
              className="bg-abyss px-4 py-5 sm:px-5 sm:py-6"
            >
              <dt className="mb-2 text-[9px] tracking-[0.18em] text-faint">{s.label}</dt>
              <dd className="font-display text-[26px] font-bold tabular-nums leading-none text-bright sm:text-[32px]">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </section>

      {/* ======================================= CODE. THINK. BUILD. REPEAT. */}
      <section className="border-b border-hairline px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-3">
          <span className="section-label text-violet">— OPERATING PRINCIPLES</span>
        </div>

        <div className="grid gap-px border border-hairline bg-hairline lg:grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <PrincipleCell key={p.word} principle={p} index={i} />
          ))}
        </div>
      </section>

      {/* ============================================ EDUCATION + CERTIFICATES */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* education */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Led tone="cyan" />
              <span className="section-label">EDUCATION</span>
              <div className="rule flex-1" />
            </div>

            <motion.ol
              variants={stagger(0.05, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              className="space-y-px"
            >
              {EDUCATION.map((e) => (
                <motion.li
                  key={e.title}
                  variants={separate}
                  className="group relative border border-hairline p-5 transition-colors duration-300 hover:border-hairline-hot"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-px scale-y-0 bg-cyan/70 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
                    style={{ transformOrigin: "top" }}
                  />
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-[13px] font-bold tracking-[0.1em] text-bright">
                      {e.title}
                    </h3>
                    <span className="text-[9px] tracking-[0.16em] text-faint">{e.period}</span>
                  </div>
                  <p className="mb-3 text-[10.5px] leading-relaxed text-muted">{e.org}</p>
                  <ul className="flex flex-wrap gap-2">
                    {e.facts.map((f) => (
                      <li key={f} className="chip">
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </motion.ol>

            <p className="mt-6 border-l border-hairline-lit pl-4 text-[10.5px] leading-relaxed text-muted">
              {ACTIVITY}
            </p>
          </div>

          {/* certifications */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <Led tone="amber" />
              <span className="section-label">CERTIFICATIONS</span>
              <div className="rule flex-1" />
            </div>

            <motion.ul
              variants={stagger(0.05, 0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              className="divide-y divide-hairline border-y border-hairline"
            >
              {CERTIFICATIONS.map((c, i) => (
                <motion.li
                  key={c.name}
                  variants={separate}
                  className="group flex items-baseline gap-4 py-3.5 transition-colors duration-300"
                >
                  <span className="w-6 shrink-0 text-[9px] tabular-nums text-ghost transition-colors duration-300 group-hover:text-amber">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-[86px] shrink-0 text-[9px] tracking-[0.16em] text-faint">
                    {c.org}
                  </span>
                  <span className="text-[10.5px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-primary-text">
                    {c.name}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-6 flex items-center gap-2 text-[9.5px] text-faint">
              <MapPin className="size-3" />
              {SITE.location.toUpperCase()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TERMINAL: cat about_me.txt                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A real command with real output. Lines print in sequence — the file
 * "reads out" rather than fading in as a block.
 */
function TerminalFile() {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [revealed, setRevealed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!mounted || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(ABOUT_FILE.length);
      return;
    }
    // Lines land quickly — this is a file being read, not a dramatic monologue.
    const id = setInterval(() => {
      setRevealed((n) => {
        if (n >= ABOUT_FILE.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 95);
    return () => clearInterval(id);
  }, [started]);

  const done = revealed >= ABOUT_FILE.length;

  return (
    <div ref={ref} className="panel corner-ticks">
      <header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="section-label">SESSION</span>
        <div className="flex items-center gap-3 text-[9.5px] text-faint">
          <Led tone="lime" />
          <span>{SITE.handle}@dev</span>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <div className="mb-4 text-[10.5px] text-lime">
          <span className="text-faint">root@newbie-del:~$</span> cat about_me.txt
        </div>

        <div className="space-y-[3px] text-[11px] leading-[1.75] text-primary-text sm:text-[12px]">
          {ABOUT_FILE.slice(0, revealed).map((line, i) =>
            line === "" ? (
              <div key={i} className="h-2.5" aria-hidden />
            ) : (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.fast, ease: EASE.mech }}
              >
                {line}
              </motion.p>
            ),
          )}
          {/* Screen-reader users get the full text immediately, not a drip-feed. */}
          <p className="sr-only">{ABOUT_FILE.join(" ")}</p>
        </div>

        <div className="mt-4 text-[10.5px] text-faint">
          <span>root@newbie-del:~$</span>
          {done && <i className="caret ml-2 align-middle" />}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PORTRAIT PANEL                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The portrait as a point cloud on desktop; a graded photo on mobile, where
 * sampling tens of thousands of particles is not a good trade.
 */
function PortraitPanel() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"cloud" | "photo">("cloud");
  const active = isMobile ? "photo" : mode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 0.1 }}
      className="panel corner-ticks relative"
    >
      <header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="section-label">SUBJECT</span>
        {!isMobile && (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "cloud" ? "photo" : "cloud"))}
            className="text-[9px] tracking-[0.16em] text-faint transition-colors duration-300 hover:text-violet"
            aria-pressed={mode === "cloud"}
          >
            {mode === "cloud" ? "[ POINT CLOUD ]" : "[ PHOTOGRAPH ]"}
          </button>
        )}
      </header>

      <div className="relative aspect-[3/4] w-full overflow-hidden bg-void sm:aspect-[4/5] lg:aspect-[3/4]">
        {active === "cloud" ? (
          <PortraitCanvas />
        ) : (
          <>
            <Image
              src="/portrait.jpg"
              alt={`Portrait of ${SITE.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover object-top"
              style={{ filter: "grayscale(0.35) contrast(1.06) brightness(0.92)" }}
              priority={false}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 40%, rgb(5 5 6 / 0.75) 100%), radial-gradient(70% 60% at 50% 35%, transparent 40%, rgb(5 5 6 / 0.5) 100%)",
              }}
            />
          </>
        )}
        <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-50" />
      </div>

      <footer className="flex items-center justify-between border-t border-hairline px-4 py-2.5 text-[9px] tracking-[0.16em] text-faint">
        <span className="text-primary-text">{SITE.name}</span>
        <span>{SITE.role.toUpperCase()}</span>
      </footer>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* REACTIVE TAG                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Tags lean toward the cursor when it comes near — a small magnetic field,
 * spring-damped. No hover-scale pop.
 */
function ReactiveTag({ label, index }: { label: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 });
  const [near, setNear] = useState(false);
  const borderColor = useTransform(
    x,
    [-6, 0, 6],
    ["var(--color-hairline-lit)", "var(--color-hairline)", "var(--color-hairline-lit)"],
  );

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const R = 110;
      if (dist < R) {
        const pull = (1 - dist / R) * 7;
        mx.set((dx / (dist || 1)) * pull);
        my.set((dy / (dist || 1)) * pull);
        setNear(true);
      } else if (mx.get() !== 0 || my.get() !== 0) {
        mx.set(0);
        my.set(0);
        setNear(false);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <motion.li
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.base, ease: EASE.outExpo, delay: index * 0.012 },
        },
      }}
      style={{ x, y, borderColor }}
      className={`chip list-none ${near ? "text-primary-text" : ""}`}
    >
      {label}
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/* PRINCIPLE CELL                                                              */
/* -------------------------------------------------------------------------- */

/** Each word resolves on its own beat, then explains itself on hover/focus. */
function PrincipleCell({
  principle,
  index,
}: {
  principle: (typeof PRINCIPLES)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: index * 0.11 }}
      tabIndex={0}
      className={`group relative bg-abyss p-6 outline-none transition-colors duration-500 focus-visible:border-violet lg:p-7 ${TONE_BORDER[principle.tone]} border-transparent`}
    >
      {/* top edge lights on hover — mechanical, directional */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
          {
            violet: "bg-violet",
            cyan: "bg-cyan",
            lime: "bg-lime",
            amber: "bg-amber",
          }[principle.tone]
        }`}
        style={{ transformOrigin: "left" }}
      />

      <span className="mb-6 block text-[9px] tabular-nums tracking-[0.2em] text-ghost">
        {principle.index}
      </span>

      <h3
        className={`display mb-4 text-[clamp(1.5rem,3.4vw,2.1rem)] transition-colors duration-500 ${TONE_TEXT[principle.tone]}`}
      >
        {principle.word}
        <span className="text-ghost">.</span>
      </h3>

      <p className="text-[10.5px] leading-relaxed text-muted transition-colors duration-500 group-hover:text-primary-text group-focus-visible:text-primary-text">
        {principle.detail}
      </p>
    </motion.article>
  );
}
