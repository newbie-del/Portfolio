"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Box, Code2, FlaskConical, LineChart } from "lucide-react";
import { SITE, PATHS } from "@/data/site";
import { PROJECTS } from "@/data/projects";
import { BEAT, DUR, EASE, powerOn, screenOn, stagger, wipeIn } from "@/lib/motion";

/* 3D loads only in the browser, after the shell paints. The placeholder holds
   the same ground the scene resolves to, so the handover is a fade, not a flash. */
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div aria-hidden className="absolute inset-0 bg-abyss" />,
});

const PATH_ICONS = {
  code: Code2,
  box: Box,
  chart: LineChart,
  flask: FlaskConical,
} as const;

/** Per-path accent. One tone per destination, so four cards read as four places. */
/* The border is `hover:`, not `group-hover:`. The card element is itself the
   group, and group-hover compiles to a descendant selector — an element is not
   its own descendant, so the tint silently never fired. The wash, icon and arrow
   below are real children, so those stay group-hover.

   `accent` is the raw custom property because it goes into a gradient, which
   Tailwind's colour utilities cannot express. */
const TONE = {
  lime: {
    text: "text-lime",
    border: "hover:border-lime/40",
    wash: "bg-lime/[0.05]",
    accent: "var(--color-lime)",
  },
  violet: {
    text: "text-violet",
    border: "hover:border-violet/40",
    wash: "bg-violet/[0.05]",
    accent: "var(--color-violet)",
  },
  azure: {
    text: "text-azure",
    border: "hover:border-azure/40",
    wash: "bg-azure/[0.05]",
    accent: "var(--color-azure)",
  },
  amber: {
    text: "text-amber",
    border: "hover:border-amber/40",
    wash: "bg-amber/[0.05]",
    accent: "var(--color-amber)",
  },
} as const;

/* The page's own load, narrated. Every step is a real thing a Next.js app does
   on first paint — nothing here claims an achievement. */
const BOOT_STEPS = [
  ["init", "portfolio.system"],
  ["load", "site.config"],
  ["mount", "route.manifest"],
  ["compile", "components..."],
  ["render", "world.interface"],
  ["hydrate", "client.island"],
  ["build", "success"],
] as const;

export default function IndexPage() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* ------------------------------------------------- LIVE ENVIRONMENT */}
      <HeroScene />

      {/* Grade. Two gradients, not a flat scrim: one darkens the left so the
          headline holds contrast against the window, one grounds the bottom so
          the panels sit on something. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(96deg,rgb(6 6 9/0.94) 0%,rgb(6 6 9/0.82) 26%,rgb(6 6 9/0.28) 52%,transparent 74%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[46%]"
        style={{ background: "linear-gradient(0deg,rgb(6 6 9/0.96),transparent)" }}
      />

      {/* ------------------------------------------------------- FOREGROUND */}
      {/* The vertical rhythm here is measured, not centred, and that distinction
          is the whole fix. The previous build put the hero in a `flex-1
          items-center` row, which floated the copy into the middle of the frame
          and pushed the instrument row past the fold. The reference does the
          opposite: the copy hangs from the top (headline cap at y=189 on a 1024
          frame), the instruments are pinned to the bottom (row at y=692..968),
          and the 183px of nothing between them is deliberate — it is the window
          onto the desk, and it is the only place the 3D scene is unobstructed.

          So: top-anchored blocks with measured margins, `mt-auto` on the panel
          row, and the slack collects in the middle where the reference wants it. */}
      <div className="relative z-20 flex min-h-[100dvh] flex-col px-5 pb-6 pt-8 sm:px-8 lg:px-10">
        <header className="flex justify-end">
          <Clock />
        </header>

        <BootReadout />
        <Headline />

        {/* Corner chrome, not part of the column. Absolute because it must not
            participate in the rhythm above — in the reference it is tucked into
            the top-right corner at 192x203, clear of the headline entirely. */}
        <Terminal />

        <PanelRow />

        {/* Last thing to arrive, and the only thing still moving once the
            entrance is over. The caret is the page saying it is done. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base, delay: BEAT.panels + 0.62 }}
          className="mt-5 flex items-center gap-2"
        >
          <span className="t-log text-faint">&gt;_ ready</span>
          <span className="caret" />
        </motion.div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  BOOT READOUT — the reference's progress bar, tracking the real page load   */
/* ========================================================================== */

function BootReadout() {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(reduce ? 100 : 0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // 1.1s to fill, easeOutExpo: commits fast, settles precisely.
      const t = Math.min(1, (now - start) / 1100);
      setPct(Math.round((t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.base }}
      className="mt-[26px] min-w-0"
    >
      <div className="t-panel-label">
        <span className="text-ghost">//</span> SYSTEM_BOOT
      </div>
      {/* Leading is tightened off the body default. At 1.7 this three-line block
          runs 67px tall and lands the progress bar 14px below where the
          reference puts it, which then displaces everything under it. */}
      <div className="t-log mt-1 leading-[1.4] text-faint">Initializing portfolio...</div>
      <div className="mt-2 flex items-center gap-3">
        <div className="relative h-px w-[min(240px,42vw)] bg-hairline-lit">
          <div
            className="absolute inset-y-0 left-0 bg-lime"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="t-log text-lime">{pct}%</span>
      </div>
    </motion.div>
  );
}

/* ========================================================================== */
/*  CLOCK — the visitor's real local time                                      */
/* ========================================================================== */

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
      {/* Reserve the width so the row does not jump when the time arrives.
          12-hour with the meridiem, as the reference sets it. en-US rather than
          en-GB purely for the format — the value is the visitor's own clock. */}
      <span className="t-num text-[10.5px] tracking-[0.1em] text-muted">
        {now
          ? now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
          : "--:--:-- --"}
      </span>
      <span className="text-ghost">•</span>
      <span className="t-meta text-[10.5px] text-faint">
        {now
          ? now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : "—"}
      </span>
      <span
        className="ml-1 inline-block size-[5px] rounded-full bg-lime"
        style={{ animation: "led-pulse 2.4s var(--ease-in-out) infinite" }}
      />
    </div>
  );
}

/* ========================================================================== */
/*  HEADLINE                                                                   */
/* ========================================================================== */

function Headline() {
  return (
    /* No max-width on this wrapper. `max-w-[46ch]` was here and it was the
       bug: `ch` resolves against the element's OWN font, and this div inherits
       the 15px body sans, so 46ch measured 377px rather than the ~1100px it was
       meant to allow. Three lines of a 45.8px display face cannot survive a
       377px column, so they broke into six — and six lines is what shoved the
       instrument row off the bottom of the viewport.

       The measure is now controlled where it belongs: the h1 lines cannot wrap
       at all (they are one authored sentence, three deliberate breaks), and the
       prose under them carries its own 66ch cap from `.t-body-sm`. */
    <div className="mt-10 min-w-0">
      {/* The lines write themselves left to right — see `wipeIn`. The clip means
          each line has a leading edge you can follow, which a fade does not, and
          that edge is what makes three lines read as one sentence being set
          rather than three blocks appearing. */}
      <motion.h1
        variants={stagger(BEAT.headline, BEAT.headlineStep)}
        initial="hidden"
        animate="visible"
        className="t-display"
      >
        {/* `whitespace-nowrap` per line, not on the h1: the break points are
            content decisions ("I BUILD_" / the lime claim / the consequence) and
            reflow must never be allowed to renegotiate them. */}
        <motion.span variants={wipeIn} className="block whitespace-nowrap">
          I BUILD<span className="text-lime">_</span>
        </motion.span>
        <motion.span variants={wipeIn} className="block whitespace-nowrap text-lime">
          DIGITAL SYSTEMS
        </motion.span>
        <motion.span variants={wipeIn} className="block whitespace-nowrap">
          THAT CREATE IMPACT.
        </motion.span>
      </motion.h1>

      {/* Roles stay in the technical register — they are a spec line. The
          sentence under them is prose, so it is set in the sans. That switch is
          the whole point of having two faces. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.out, delay: BEAT.roles }}
        className="mt-7"
      >
        <p className="t-meta text-primary-text">
          {SITE.roles.map((role, i) => (
            <span key={role}>
              {i > 0 && <span className="mx-2 text-ghost">•</span>}
              {role}
            </span>
          ))}
        </p>
        <p className="t-body-sm mt-2">{SITE.subtagline}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.out, delay: BEAT.cta }}
        className="mt-8"
      >
        <Link
          href="/work"
          className="cmd group hover:border-lime/50 hover:bg-lime/[0.04]"
        >
          <span className="text-lime">&gt;</span>
          ENTER MY WORLD
          <ArrowRight className="size-3.5 text-muted transition-transform duration-[--dur-base] ease-[--ease-out] group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </div>
  );
}

/* ========================================================================== */
/*  TERMINAL — dot-matrix wordmark over real git output                        */
/* ========================================================================== */

/** 5x7 bitmaps. Rendered as a dot matrix, which is how the reference sets it. */
const GLYPHS: Record<string, string[]> = {
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
};

function DotWordmark() {
  const cells = useMemo(() => {
    const letters = ["d", "e", "L"];
    const out: { x: number; y: number; on: boolean; i: number }[] = [];
    let ox = 0;
    letters.forEach((ch) => {
      const g = GLYPHS[ch];
      g.forEach((row, y) =>
        [...row].forEach((bit, x) => {
          out.push({ x: ox + x, y, on: bit === "1", i: out.length });
        }),
      );
      ox += 6;
    });
    return out;
  }, []);

  return (
    <div
      aria-label="del"
      role="img"
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: "repeat(17, 1fr)" }}
    >
      {cells
        .slice()
        .sort((a, b) => a.y * 17 + a.x - (b.y * 17 + b.x))
        .map((c) => (
          <span
            key={`${c.x}-${c.y}`}
            className="aspect-square"
            style={{
              background: c.on ? "var(--color-bright)" : "var(--color-hairline)",
              opacity: c.on ? 0.92 : 1,
            }}
          />
        ))}
    </div>
  );
}

function Terminal() {
  return (
    /* Measured at 192x203 in the top-right corner of the reference (x 1315..1507,
       y 90..293) — small, tucked, and clear of the headline. It was a 268px
       panel floating beside the hero copy, which made it a second column and
       gave the composition two competing focal points.

       Absolutely positioned so it contributes nothing to the page's vertical
       rhythm. `right-5/8/10` mirrors the container's own padding, because
       absolute offsets resolve against the padding EDGE, not the content box. */
    <motion.aside
      variants={screenOn}
      initial="hidden"
      animate="visible"
      className="panel absolute right-5 top-[90px] hidden w-[192px] sm:right-8 lg:right-10 xl:block"
    >
      <header className="panel-head">
        <span className="t-panel-label">TERMINAL</span>
        <span className="t-log ml-auto text-[9px] text-ghost">~/portfolio</span>
      </header>
      <div className="panel-rule" />

      <div className="px-4 py-4">
        <DotWordmark />
      </div>
      <div className="panel-rule" />

      {/* Real `git status` output, trimmed to what is true and stable. The
          "nothing to commit, working tree clean" line was here and it is dropped
          on purpose: it asserts a build state I cannot verify at render time, and
          the standing rule is that nothing on this site claims something
          unverified. The branch is true; the prompt is decoration. */}
      <div className="space-y-px px-4 py-3">
        <p className="t-log text-[9px] text-bright">$ git status</p>
        <p className="t-log text-[9px] text-faint">On branch main</p>
        <p className="t-log text-[9px] text-faint">Your branch is up to date</p>
        <p className="t-log mt-1.5 text-[9px] text-muted">
          del@portfolio:~$ <span className="caret" />
        </p>
      </div>
    </motion.aside>
  );
}

/* ========================================================================== */
/*  BOTTOM PANEL ROW                                                           */
/* ========================================================================== */

/** Panel header label. `//` sits dimmer than the words, as it does in the
 *  reference — it is a comment marker, not part of the title. */
function PanelLabel({ children }: { children: string }) {
  return (
    <span className="t-panel-label">
      <span className="text-ghost">//</span> {children}
    </span>
  );
}

function PanelRow() {
  return (
    <motion.div
      variants={stagger(BEAT.panels, BEAT.panelStep)}
      initial="hidden"
      animate="visible"
      /* Measured off the reference's 1536px frame: the three panels span
         622 / 333 / 295 with 8px between them. That is 2fr : 1.07fr : 0.95fr,
         not the 2fr_1fr_1fr I had — and the 23px the log panel was short is
         exactly what forced its targets to truncate.

         `mt-auto` is load-bearing: it pins the row to the bottom of the frame
         (reference y 692..968 on a 1024 viewport) and lets the slack collect
         above, in the gap where the desk shows through. */
      className="mt-auto grid gap-2 xl:grid-cols-[2fr_1.07fr_0.95fr]"
    >
      <ChoosePath />
      <BuildLog />
      <CurrentFocus />
    </motion.div>
  );
}

function ChoosePath() {
  return (
    <motion.section variants={powerOn} className="panel">
      <header className="panel-head">
        <PanelLabel>CHOOSE YOUR PATH</PanelLabel>
      </header>
      <div className="panel-rule" />
      {/* Four across, which is the reference composition and non-negotiable.
          It fits because the titles are untracked (see .t-card-title): at
          1366px each card gets 82px of content and "EXPERIMENTS" needs 82px.
          The earlier 2x2 fallback existed only to absorb tracking I had added
          myself. Two across below sm, where four genuinely cannot fit.

          17px inset and 13px between, measured: the reference's card pitch is
          149.3px on a 136.3px card, and 149.3 - 136.3 = 13. At gap-2 with 13px
          padding the cards ran wide and the row lost its rhythm. */}
      <div className="grid grid-cols-2 gap-[13px] p-[17px] sm:grid-cols-4">
        {PATHS.map((p, i) => (
          <PathCard key={p.id} path={p} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

function PathCard({ path, index }: { path: (typeof PATHS)[number]; index: number }) {
  const Icon = PATH_ICONS[path.icon];
  const tone = TONE[path.tone];
  const reduce = useReducedMotion();

  return (
    <Link
      href={path.href}
      /* min-height is measured, not padded to: the reference card is 193px tall
         while this content is naturally 154px, and the extra 39px is air the
         reference puts between the description and the arrow. Expressing it as a
         height with `justify-between` is what pins the arrow to the bottom edge;
         padding it out would just move the arrow up with the text. */
      className={`group relative flex min-h-[193px] flex-col justify-between overflow-hidden rounded-[3px] border p-[15px] transition-colors duration-[--dur-base] ease-[--ease-out] ${tone.border}`}
    >
      {/* Accent seam on the top edge only, fading out to the right. This is how
          the reference tells the four cards apart — a full coloured border would
          make each one a labelled box and the row would stop reading as one
          instrument.

          It DRAWS, left to right, after the panel has landed, and the four are
          offset 75ms apart so they read as a sequence rather than a flash. This
          is the row's whole entrance flourish, which is why nothing else in the
          panels moves on load.

          Two nested spans on purpose: the outer one owns the scaleX draw, the
          inner one owns the hover opacity. On one element the load animation and
          the hover transition would both be driving opacity and fight. */}
      <motion.span
        aria-hidden
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.95,
          ease: EASE.cine,
          delay: BEAT.panels + 0.36 + index * 0.075,
        }}
        style={{ transformOrigin: "left" }}
        className="pointer-events-none absolute -inset-x-px -top-px h-px"
      >
        <span
          className="block size-full opacity-45 transition-opacity duration-[--dur-base] ease-[--ease-out] group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg,${tone.accent},transparent 62%)` }}
        />
      </motion.span>
      {/* Hover wash. One surface change, no glow stack. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[--dur-base] ease-[--ease-out] group-hover:opacity-100 ${tone.wash}`}
      />
      <div className="relative">
        <Icon
          className={`mb-7 size-[22px] ${tone.text} transition-transform duration-[--dur-base] ease-[--ease-out] group-hover:-translate-y-0.5`}
          strokeWidth={1.5}
        />
        <h3 className="t-card-title mb-[7px]">{path.title}</h3>
        {/* Sans, at 11px. The reference sets this in mono and I am deliberately
            not following it: these are sentences, and four monospace paragraphs
            stacked in a row is precisely the "everything is a terminal" register
            the rebuild was called to get out of. The mono still owns the title
            above and the prompt below, so the card keeps both voices. */}
        <p className="t-card-body">{path.blurb}</p>
      </div>
      {/* The reference gives the primary path a shell prompt and the other three
          an arrow. Static, not a blinking caret: four cards pulsing at once
          would be motion without a reason. */}
      <span
        className={`relative inline-flex items-center ${tone.text} transition-transform duration-[--dur-base] ease-[--ease-out] group-hover:translate-x-1`}
      >
        {path.id === "work" ? (
          <span className="t-log text-[12px] leading-none text-current">&gt;_</span>
        ) : (
          <ArrowRight className="size-3.5" strokeWidth={1.75} />
        )}
      </span>
    </Link>
  );
}

function BuildLog() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? BOOT_STEPS.length : 0);
  const [t0] = useState(() => new Date());

  useEffect(() => {
    if (reduce) return;
    // ~150ms between rows: fast enough to feel like a build, slow enough to read.
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= BOOT_STEPS.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 150);
    return () => clearInterval(id);
  }, [reduce]);

  const stamp = (i: number) => {
    const d = new Date(t0.getTime() + i * 1000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const done = shown >= BOOT_STEPS.length;

  return (
    <motion.section variants={powerOn} className="panel flex flex-col">
      {/* One string, not a label plus a badge. The reference writes the live
          state into the title as a parenthetical — a separate pill on the right
          turned this header into a status bar it never was. */}
      <header className="panel-head">
        <PanelLabel>{`BUILD LOG ${done ? "(LIVE)" : "(RUNNING)"}`}</PanelLabel>
      </header>
      <div className="panel-rule" />

      {/* Four fixed columns, sized from the panel's real inner width rather than
          from an assumed one. That assumption is what broke this: I had the panel
          at 341px when 2fr_1fr_1fr on a 1256px content box actually yields 310,
          which left 79px for a target needing 101 — hence the ellipsis on every
          row. At the corrected 333px the arithmetic closes:

            inner   333 - 32 gutters              = 301
            columns 50 + 44 + 101 + 25            = 220
            gaps    3 x 21                        =  63
                                                    283  <= 301

          Fixed rather than auto so nothing shifts as rows land, and no `truncate`
          anywhere: if a row cannot fit, that is a layout bug to fix, not a
          string to hide. */}
      <ol className="flex-1 space-y-[6px] px-4 py-[14px]">
        {BOOT_STEPS.slice(0, shown).map(([verb, target], i) => (
          <motion.li
            key={verb}
            initial={reduce ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DUR.fast, ease: EASE.out }}
            className="t-log flex items-baseline gap-x-[21px] whitespace-nowrap"
          >
            <span className="w-[50px] shrink-0 text-muted">{stamp(i)}</span>
            <span className="w-[44px] shrink-0 text-primary-text">{verb}</span>
            <span className="flex-1 text-faint">{target}</span>
            {/* Desaturated, not the brand lime. Seven saturated [OK]s stacked in
                a column pulled the eye away from the headline. */}
            <span className="shrink-0 text-lime/45">[OK]</span>
          </motion.li>
        ))}
      </ol>

      <div className="panel-rule" />
      <footer className="px-4 py-4">
        <span className="t-log text-faint">
          &gt;{" "}
          <span className={done ? "text-lime" : "text-ghost"}>
            {done ? "system.ready" : "building..."}
          </span>
        </span>
      </footer>
    </motion.section>
  );
}

/* Descriptors, compressed from each project's own tagline so the row fits on one
   line. Nothing new is asserted — each is a shortening of the string already in
   the project record, kept beside it here so the compression is auditable:

     connex-ai      "AI-Powered Video Communication Platform"
     flowforge-ai   "Workflow Automation Platform"
     save-and-grow  "Finance Intelligence & Expense Tracker"

   The panel's text column is 246px, which is 39 monospace characters. The full
   taglines run 43-52 and wrapped every bullet to two lines, turning a three-item
   list into a six-line block the reference does not have. */
const FOCUS_SHORT: Record<string, string> = {
  "connex-ai": "AI video platform",
  "flowforge-ai": "Workflow automation",
  "save-and-grow": "Finance intelligence",
};

function CurrentFocus() {
  // Drawn from the real project record, so this list cannot drift from the work.
  const focus = useMemo(
    () =>
      (["connex-ai", "flowforge-ai", "save-and-grow"] as const)
        .map((slug) => PROJECTS.find((p) => p.slug === slug))
        .filter((p): p is (typeof PROJECTS)[number] => Boolean(p)),
    [],
  );
  /* Three distinct tints, matching the reference. The previous list repeated
     lime at positions one and three, which read as a category rather than as
     three separate things. */
  const tones = ["text-violet", "text-azure", "text-amber"] as const;

  return (
    <motion.section variants={powerOn} className="panel flex flex-col">
      <header className="panel-head">
        <PanelLabel>CURRENT FOCUS</PanelLabel>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-[2px] border border-lime/25 px-1.5 py-0.5">
          <span
            className="inline-block size-[4px] rounded-full bg-lime"
            style={{ animation: "led-pulse 2.4s var(--ease-in-out) infinite" }}
          />
          <span className="t-log text-[9px] tracking-[0.1em] text-lime">ACTIVE</span>
        </span>
      </header>
      <div className="panel-rule" />

      <div className="flex-1 px-4 py-[14px]">
        {/* Sans, like the card blurbs. This is a sentence, and the reason to have
            two faces is so a sentence and a readout can look different. The mono
            picks up again on the bullets below, which are label pairs. */}
        <p className="t-card-body text-bright">
          Building AI-powered systems that solve real problems.
        </p>

        <ul className="mt-[14px] space-y-[7px]">
          {focus.map((p, i) => (
            <li
              key={p.slug}
              className="t-log flex items-baseline gap-2 whitespace-nowrap leading-[1.6]"
            >
              <span className={`${tones[i]} shrink-0 leading-none`}>•</span>
              <span>
                <span className={tones[i]}>{p.name}</span>
                <span className="text-ghost"> — </span>
                <span className="text-muted">{FOCUS_SHORT[p.slug] ?? p.tagline}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-rule" />
      <footer className="px-4 py-4">
        <Link
          href="/work"
          className="group inline-flex w-full items-center gap-2 text-lime transition-colors duration-[--dur-fast] ease-[--ease-out] hover:text-lime-soft"
        >
          <span className="t-log">&gt; view details</span>
          <ArrowRight className="ml-auto size-3 transition-transform duration-[--dur-base] ease-[--ease-out] group-hover:translate-x-1" />
        </Link>
      </footer>
    </motion.section>
  );
}
