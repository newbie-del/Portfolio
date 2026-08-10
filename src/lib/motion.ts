/**
 * MOTION TOKENS
 * ---------------------------------------------------------------------------
 * A single motion system used across the whole site, per the spec:
 * "Use a consistent motion system across the website."
 *
 * Motion should feel: technical, cinematic, mechanical, controlled,
 * slightly futuristic, physically believable.
 * Avoid: excessive bouncing, cartoon animation, random floating,
 * constant rotation, excessive particles, excessive blur, flashy transitions.
 */

import type { Transition, Variants } from "framer-motion";

/* --- EASINGS --------------------------------------------------------------- */
export const EASE = {
  /** Primary UI easing — decisive arrival, no overshoot. */
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  /** Symmetric, mechanical. For panels that open and close. */
  inOutQuint: [0.83, 0, 0.17, 1],
  mech: [0.4, 0, 0.2, 1],
} as const;

/* --- DURATIONS (seconds) --------------------------------------------------- */
export const DUR = {
  instant: 0.12,
  fast: 0.22,
  base: 0.4,
  slow: 0.7,
  /** Page transitions: 400–900ms depending on complexity, per spec. */
  transition: 0.62,
} as const;

/* --- SPRINGS ---------------------------------------------------------------
 * Spring-based motion where appropriate, with real inertia — never wobbly.
 */
export const SPRING = {
  /** Cursor-follow / parallax. Heavy damping = weighty, not floaty. */
  drift: { type: "spring", stiffness: 90, damping: 26, mass: 1.1 },
  /** Hover state changes on cards and chips. */
  snap: { type: "spring", stiffness: 340, damping: 32, mass: 0.7 },
  /** Layer separation in X-Ray mode — mechanical, settles firmly. */
  mechanical: { type: "spring", stiffness: 160, damping: 24, mass: 1 },
} satisfies Record<string, Transition>;

/* --- SHARED VARIANTS ------------------------------------------------------- */

/** Panels rise and resolve. Subtle — this is not a "fade-in everything" site. */
export const panelIn: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE.outExpo, delay: i * 0.06 },
  }),
};

/** Staggered container for lists of panels/cards. */
export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

/** Headline words animate independently, per the ABOUT spec. */
export const wordIn: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(6px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DUR.slow, ease: EASE.outExpo, delay: 0.08 + i * 0.075 },
  }),
};

/** Mechanical separation — used for reveals that should feel like hardware. */
export const separate: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: DUR.base, ease: EASE.mech, delay: i * 0.04 },
  }),
};

/** Standard viewport trigger — fires once, slightly before full visibility. */
export const inView = { once: true, margin: "-12% 0px -12% 0px" } as const;
