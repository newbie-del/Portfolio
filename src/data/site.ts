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
  name: "ABHISHEK GHATEKAR",
  role: "Full-Stack Developer",
  roles: ["Full-Stack Developer", "AI Enthusiast", "Problem Solver"],
  tagline: "I build digital systems that create impact.",
  location: "Maharashtra, India",
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
 * Deploy origin — the one place the production domain is written.
 * `metadataBase`, the sitemap and robots.txt all read it, so a domain change is
 * a one-line edit. Verify this matches the real deployment before launch.
 */
export const SITE_URL = "https://newbie-del.dev";

export interface NavItem {
  index: string;
  label: string;
  href: string;
  blurb: string;
}

export const NAV: NavItem[] = [
  { index: "01", label: "INDEX", href: "/", blurb: "System entry point" },
  { index: "02", label: "ABOUT", href: "/about", blurb: "Who is behind this" },
  { index: "03", label: "WORK", href: "/work", blurb: "Selected projects" },
  { index: "04", label: "STACK", href: "/stack", blurb: "Technical ecosystem" },
  { index: "05", label: "JOURNEY", href: "/journey", blurb: "The path so far" },
  { index: "06", label: "PLAYGROUND", href: "/playground", blurb: "Experiments" },
  { index: "07", label: "CONTACT", href: "/contact", blurb: "Let's build" },
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

/** "CHOOSE YOUR PATH" destinations on the index page. */
export const PATHS = [
  {
    id: "work",
    title: "MY WORK",
    blurb: "See the things I have built.",
    href: "/work",
    icon: "code",
  },
  {
    id: "build",
    title: "HOW I BUILD",
    blurb: "Explore my process & stack.",
    href: "/stack",
    icon: "terminal",
  },
  {
    id: "journey",
    title: "MY JOURNEY",
    blurb: "Walk through my timeline.",
    href: "/journey",
    icon: "chart",
  },
  {
    id: "experiments",
    title: "EXPERIMENTS",
    blurb: "Play with my creative side.",
    href: "/playground",
    icon: "flask",
  },
] as const;
