/**
 * SITE CONFIG
 * ---------------------------------------------------------------------------
 * Identity, navigation and metrics.
 *
 * Contact facts come from the resume (ABHISHEK-UPDATED1.pdf).
 * Socials are rendered only when non-null, so nothing ships as a broken or
 * guessed link. LinkedIn is intentionally omitted at the owner's request.
 */

export const SITE = {
  handle: "NEWBIE-DEL",
  /** Wordmark as it is set in the reference: lowercase, dot-separated. */
  wordmark: { stem: "newbie", dot: ".", tail: "del" },
  name: "ABHISHEK GHATEKAR",
  role: "Full-Stack Developer",
  roles: ["Full-Stack Developer", "AI Enthusiast", "Problem Solver"],
  tagline: "I build digital systems that create impact.",
  /** Second line under the hero roles in the reference. */
  subtagline: "Turning complex ideas into scalable digital products.",
  location: "Maharashtra, India",
  /** Short form for the telemetry readout, where the row is narrow. */
  locationShort: "India",
  email: "ghatekarabhishek0@gmail.com",
  phone: "+91 8149257184",
  github: "https://github.com/newbie-del",
  githubHandle: "github.com/newbie-del",
  /** Omitted by request — null keeps the row out of the DOM entirely. */
  linkedin: null as string | null,
  linkedinHandle: null as string | null,
  twitter: "https://x.com/AbhishekGhatekr" as string | null,
  twitterHandle: "x.com/AbhishekGhatekr" as string | null,
  version: "1.0.0",
  resume: "/ABHISHEK-GHATEKAR-RESUME.pdf",
} as const;

/**
 * Deploy origin — resolved from the environment, never hard-coded to a domain
 * the owner does not control. `metadataBase`, the sitemap and robots.txt all
 * read it.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real origin when one exists. On Vercel,
 * VERCEL_PROJECT_PRODUCTION_URL is populated automatically, so a deploy
 * resolves correctly with no configuration. Local development falls back to
 * localhost, which is accurate rather than aspirational.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export interface NavItem {
  index: string;
  label: string;
  href: string;
  /** Lowercase sublabel shown under the label in the rail, per the reference. */
  blurb: string;
}

export const NAV: NavItem[] = [
  { index: "01", label: "INDEX", href: "/", blurb: "home" },
  { index: "02", label: "ABOUT", href: "/about", blurb: "my profile" },
  { index: "03", label: "WORK", href: "/work", blurb: "selected projects" },
  { index: "04", label: "STACK", href: "/stack", blurb: "technologies" },
  { index: "05", label: "JOURNEY", href: "/journey", blurb: "my timeline" },
  { index: "06", label: "PLAYGROUND", href: "/playground", blurb: "experiments" },
  { index: "07", label: "CONTACT", href: "/contact", blurb: "get in touch" },
];

/**
 * SYSTEM METRICS — confirmed by the user.
 * PROJECTS 07+ · TECHNOLOGIES 35+ · YEARS CODING 03+ · CUPS OF COFFEE ∞
 * 35 = counted from skills.png. 03+ = Aug 2023 (BE start) -> 2026.
 */
export const METRICS = [
  { label: "PROJECTS", value: 7, suffix: "+" },
  { label: "TECHNOLOGIES", value: 35, suffix: "+" },
  { label: "YEARS CODING", value: 3, suffix: "+" },
  { label: "CUPS OF COFFEE", value: null, suffix: "∞" },
] as const;

/**
 * "CHOOSE YOUR PATH" destinations. Copy and tint both come from the
 * reference, which gives each path its own accent so the four cards read as
 * four destinations rather than one repeated container.
 *
 * Blurbs are held to ~33 characters. That is not a style preference: the
 * reference's card is 136px wide with 15px of padding, leaving a 104px column,
 * and it sets every description on exactly two lines. Above ~35 characters the
 * copy runs to three and the four cards stop sharing a baseline. "&" rather than
 * "and" is the reference's own contraction and buys back two characters where
 * the sentence needs them.
 */
export const PATHS = [
  {
    id: "work",
    title: "MY WORK",
    blurb: "Explore the projects I've built.",
    href: "/work",
    icon: "code",
    tone: "lime",
  },
  {
    id: "build",
    title: "HOW I BUILD",
    blurb: "Tech stack, tools & architecture.",
    href: "/stack",
    icon: "box",
    tone: "violet",
  },
  {
    id: "journey",
    title: "MY JOURNEY",
    blurb: "The path of learning & growing.",
    href: "/journey",
    icon: "chart",
    tone: "azure",
  },
  {
    id: "experiments",
    title: "EXPERIMENTS",
    blurb: "Ideas, prototypes & experiments.",
    href: "/playground",
    icon: "flask",
    tone: "amber",
  },
] as const;
