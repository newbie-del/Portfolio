/**
 * MOTION TOKENS
 * ---------------------------------------------------------------------------
 * One motion system for the whole site.
 *
 * Two rules govern every value here:
 *   - Never ease-in on an entrance. It delays the first frame, which is
 *     exactly the frame the eye is watching, so it reads as lag.
 *   - Interface feedback stays under 300ms. Only narrative reveals, where
 *     the motion is explaining a sequence, are allowed to run longer.
 */

import type { Transition, Variants } from "framer-motion";

/* --- EASINGS --------------------------------------------------------------- */
/** Mirrors the CSS custom properties in globals.css so JS and CSS agree. */
export const EASE = {
  /** Primary. Decisive arrival, no overshoot. */
  out: [0.23, 1, 0.32, 1],
  outSoft: [0.25, 1, 0.5, 1],
  /** Symmetric. For things that travel across the screen and settle. */
  inOut: [0.77, 0, 0.175, 1],
  /**
   * Establishing moves and type reveals. Covers most of the distance early,
   * then spends the last third of the time on the last tenth of the distance.
   * That tail is the whole difference between a transition that reads as
   * *weighted* and one that reads as merely fast — it is what film camera
   * moves do and what UI easings almost never do.
   *
   * Reserved for reveals over 700ms. On a 200ms hover it just reads as lag.
   */
  cine: [0.16, 1, 0.3, 1],

  /** @deprecated use `out` — kept for the routes not yet rebuilt. */
  outExpo: [0.23, 1, 0.32, 1],
  /** @deprecated use `out` — kept for the routes not yet rebuilt. */
  mech: [0.4, 0, 0.2, 1],
} as const;

/**
 * Smootherstep. Zero velocity at BOTH ends, unlike every easing above.
 *
 * Needed because the camera rig drives position per-frame inside useFrame
 * rather than through a transition, so it cannot use a bezier — and because a
 * camera that begins moving at full speed reads as a cut, not a move. Starting
 * from rest is what gives the establishing shot mass.
 */
export const smootherstep = (t: number) => {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/* --- THE ENTRANCE ----------------------------------------------------------
 * One authored timeline for the homepage load, in seconds from first paint.
 *
 * This exists as a table because the alternative — a delay literal inside each
 * component — is how an entrance stops being a sequence and becomes four
 * independent animations that happen to overlap. Read top to bottom, this is
 * the shot list: the room opens, the claim writes itself, the workstation comes
 * up, the instruments come online.
 */
export const BEAT = {
  /** Boot readout and its progress bar. First thing to speak. */
  boot: 0.08,
  /** Headline line one. Late enough that the bar is already filling. */
  headline: 0.3,
  headlineStep: 0.09,
  /** Roles and the sentence under them. */
  roles: 0.74,
  cta: 0.9,
  /** The terminal switches on. */
  terminal: 1.04,
  /** The instrument row comes up, one panel at a time. */
  panels: 1.2,
  panelStep: 0.09,

  /**
   * Camera establishing push-in. Measured from Canvas mount, not first paint,
   * because the scene is a dynamic import and mounts late by design.
   *
   * 2.8s is long for UI and correct for a camera: it is still settling as the
   * panels land, which is what binds the HTML entrance and the 3D entrance into
   * one gesture instead of two.
   */
  camera: { hold: 0.16, travel: 2.8 },
} as const;

/* --- THE ROOM WAKING UP ----------------------------------------------------
 * The 3D counterpart to BEAT, in seconds from Canvas mount.
 *
 * The scene does not fade in. It BOOTS: at t=0 the only light in the room is a
 * rainy city through the window, so the desk is a silhouette. Then the lamp
 * warms, four panels come up one at a time, the keyboard backlight sweeps
 * across, and the machine spins its fans. By the time the camera finishes its
 * push-in the room is fully lit — which means the lighting change IS the
 * establishing move, not a decoration on top of it.
 *
 * Every number here is an ordering decision, not a taste one. The lamp leads
 * because a person reaches for the lamp before the machine. The keyboard is
 * last of the peripherals because it is the thing you touch once everything
 * else is already awake.
 */
export const WAKE = {
  /** City is already outside; it just resolves out of black. */
  city: { at: 0.0, dur: 1.1 },
  /** Incandescent, so it ramps slowly and overshoots slightly. */
  lamp: { at: 0.42, dur: 1.15 },
  /**
   * The four panels, in the order a person would have opened them: the big
   * editor first because that is the one being worked in, then the instruments
   * left to right.
   */
  screens: [
    /* editor  */ 0.86,
    /* graph   */ 1.08,
    /* logs    */ 1.24,
    /* map     */ 1.4,
  ],
  laptop: 1.62,
  /** Per-key sweep across 15 columns. */
  keyboard: { at: 1.78, dur: 0.62 },
  /** Fans have inertia: they take over a second to reach speed. */
  fans: { at: 1.96, dur: 1.6 },
  clock: 2.18,
  /** How long one panel takes to come up, including the backlight overshoot. */
  panel: 0.56,
} as const;

/** 0→1 ramp with a hard floor and ceiling. The 3D rig's equivalent of a delay. */
export const ramp = (t: number, at: number, dur: number) =>
  t <= at ? 0 : t >= at + dur ? 1 : (t - at) / dur;


/* --- DURATIONS (seconds) --------------------------------------------------- */
export const DUR = {
  press: 0.14,
  fast: 0.18,
  base: 0.26,
  /** Narrative reveals only. */
  slow: 0.52,
  transition: 0.44,

  /** @deprecated use `press` — kept for the routes not yet rebuilt. */
  instant: 0.12,
} as const;

/* --- SPRINGS ---------------------------------------------------------------
 * Apple's duration/bounce form: easier to reason about than raw physics.
 * Bounce stays low; this world is mechanical, not playful.
 */
export const SPRING = {
  /** Pointer-driven parallax. Heavy, so it trails with weight. */
  drift: { type: "spring", stiffness: 90, damping: 26, mass: 1.1 },
  /** Hover and selection changes. */
  snap: { type: "spring", stiffness: 340, damping: 32, mass: 0.7 },
} satisfies Record<string, Transition>;

/* --- SHARED VARIANTS ------------------------------------------------------- */

/**
 * Panels resolve upward. Small travel: 10px reads as arrival, 40px reads as
 * a slide show.
 */
export const panelIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE.out, delay: i * 0.05 },
  }),
};

/** Staggered container. 30-80ms between children; longer feels sluggish. */
export const stagger = (delayChildren = 0, staggerChildren = 0.055): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

/**
 * Headline lines resolve individually. The blur is doing real work: it masks
 * the moment two type states overlap, so the line reads as one object
 * sharpening rather than two copies crossfading.
 */
export const lineIn: Variants = {
  hidden: { opacity: 0, y: "0.34em", filter: "blur(5px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DUR.slow, ease: EASE.out, delay: 0.06 + i * 0.085 },
  }),
};

/** Rows separating from an edge. Used for lists that should feel mechanical. */
export const separate: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: DUR.base, ease: EASE.out, delay: i * 0.035 },
  }),
};

/* ============================================================================
   THE HOMEPAGE ENTRANCE
   ---------------------------------------------------------------------------
   Four gestures, each shaped to what it is entering. That is the point: the
   previous entrance applied one fade-and-rise to everything, which is why it
   read as competent and not as authored. A headline and an instrument panel do
   not arrive the same way.
   ========================================================================= */

/**
 * Headline lines WRITE themselves. A clip wipe travels left to right while the
 * line simultaneously sharpens out of blur and rises the last third of an em.
 *
 * The three are deliberately desynchronised: opacity and blur finish inside the
 * wipe's first half, so by the time the right edge of the wipe arrives the type
 * is already fully resolved. Run them on the same curve and it reads as a
 * gradient sliding across a word; stagger them and it reads as type being set.
 *
 * The bottom inset stays negative throughout so a comma or a lowercase
 * descender is never shaved by a pixel.
 */
export const wipeIn: Variants = {
  hidden: {
    opacity: 0,
    y: "0.3em",
    filter: "blur(7px)",
    clipPath: "inset(-0.1em 100% -0.16em 0)",
  },
  visible: (i: number = 0) => {
    const at = i * BEAT.headlineStep;
    return {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      clipPath: "inset(-0.1em -0.03em -0.16em 0)",
      transition: {
        delay: at,
        clipPath: { duration: 0.94, ease: EASE.cine, delay: at },
        y: { duration: 0.86, ease: EASE.cine, delay: at },
        opacity: { duration: 0.34, ease: EASE.out, delay: at },
        filter: { duration: 0.5, ease: EASE.out, delay: at },
      },
    };
  },
};

/**
 * Instruments come online. The panel arrives on the cine curve — slower and
 * with more travel than `panelIn`, because at this size a 12px rise is
 * invisible — and the accent seam on its top edge draws separately, after the
 * panel has already landed. Sequence matters: the box exists, THEN it powers up.
 */
export const powerOn: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.74, ease: EASE.cine, delay: i * BEAT.panelStep },
  }),
};

/** The seam that draws across a panel's top edge once it has landed. */
export const seamDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: (i: number = 0) => {
    const at = 0.2 + i * BEAT.panelStep;
    return {
      scaleX: 1,
      opacity: 1,
      transition: {
        scaleX: { duration: 1.05, ease: EASE.cine, delay: at },
        opacity: { duration: 0.18, delay: at },
      },
    };
  },
};

/**
 * A screen switching on. The overexposed first frame is the whole effect: a CRT
 * or an LCD backlight overshoots before it settles, and reproducing that is
 * what separates "the panel faded in" from "the monitor came on". Kept to 1.7x
 * because on a near-black surface the flash lands on the text, not the fill,
 * and any more of it looks like a bug.
 */
export const screenOn: Variants = {
  hidden: { opacity: 0, scale: 0.988, filter: "brightness(1.7) blur(2.5px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1) blur(0px)",
    /* The delay lives in the variant, not on a `transition` prop: a variant's
       own transition replaces that prop rather than merging with it, so a delay
       passed alongside would be silently dropped. */
    transition: {
      duration: 0.66,
      ease: EASE.out,
      delay: BEAT.terminal,
      filter: { duration: 0.42, ease: EASE.out, delay: BEAT.terminal },
    },
  },
};

/** Standard viewport trigger. Fires once, slightly before full visibility. */
export const inView = { once: true, margin: "-10% 0px -10% 0px" } as const;

/* ============================================================================
   DEPRECATED ALIASES
   ---------------------------------------------------------------------------
   The six routes that have not been rebuilt yet still import these names.
   Delete each one as its page moves to the tokens above.
   ========================================================================= */

/** @deprecated use `EASE.out` */
export const EASE_OUT_EXPO = EASE.out;

/** @deprecated use `lineIn` */
export const wordIn = lineIn;
