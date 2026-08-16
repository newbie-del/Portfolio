/**
 * CONTACT + BUILD LOG DATA
 * ---------------------------------------------------------------------------
 * Every contact fact comes from SITE (which traces to the resume). Nothing is
 * guessed: a channel with a null value never reaches the array, so LinkedIn is
 * absent from the DOM rather than rendered broken.
 *
 * The pipeline states are DERIVED, not authored. A project with a reachable
 * deployment reads SHIPPED; a project with only a public repository reads
 * SOURCE PUBLISHED. The spec's IN PROGRESS / PLANNED states stay unused until
 * the owner supplies them — inventing a build status is exactly what the
 * "never invent content" rule forbids.
 */

import { PROJECTS } from "./projects";
import { SITE } from "./site";

/* ===================================================== CONTACT CHANNELS === */

export interface Channel {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: "mail" | "phone" | "github" | "x" | "map" | "file";
  tone: "violet" | "cyan" | "lime" | "amber" | "rose";
  /** What actually happens when this is used — stated, not implied. */
  note: string;
  /** Copyable channels expose a COPY affordance. */
  copy?: string;
}

const MAYBE: (Channel | null)[] = [
  {
    id: "email",
    label: "EMAIL",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    icon: "mail",
    tone: "violet",
    note: "Opens your mail client. Best for anything with detail.",
    copy: SITE.email,
  },
  {
    id: "phone",
    label: "PHONE",
    value: SITE.phone,
    href: `tel:${SITE.phone.replace(/\s+/g, "")}`,
    icon: "phone",
    tone: "cyan",
    note: "India time, so expect a reply inside working hours.",
    copy: SITE.phone,
  },
  {
    id: "github",
    label: "GITHUB",
    value: SITE.githubHandle,
    href: SITE.github,
    icon: "github",
    tone: "lime",
    note: "Every project on this site links back to its repository.",
  },
  SITE.twitter && SITE.twitterHandle
    ? {
        id: "x",
        label: "X",
        value: SITE.twitterHandle,
        href: SITE.twitter,
        icon: "x",
        tone: "amber",
        note: "Shorter thoughts, build notes, occasional screenshots.",
      }
    : null,
  {
    id: "location",
    label: "LOCATION",
    value: SITE.location,
    href: "https://maps.google.com/?q=Maharashtra,India",
    icon: "map",
    tone: "rose",
    note: "Open to remote work and to relocating for the right team.",
  },
  {
    id: "resume",
    label: "RESUME",
    value: "PDF · ONE PAGE",
    href: SITE.resume,
    icon: "file",
    tone: "cyan",
    note: "The same facts as this site, compressed for a recruiter.",
  },
];

export const CHANNELS: Channel[] = MAYBE.filter((c): c is Channel => c !== null);

/* ========================================================= BUILD PIPELINE === */

/**
 * Only the two states the data can prove. Widening this union means the owner
 * has told us the status — it is not something to derive from a year.
 */
export type BuildState = "SHIPPED" | "SOURCE PUBLISHED";

export interface PipelineRow {
  slug: string;
  index: string;
  name: string;
  category: string;
  date: string;
  state: BuildState;
  /** The evidence the state rests on, shown so the claim is checkable. */
  evidence: string;
  href: string;
}

export const PIPELINE: PipelineRow[] = PROJECTS.map((p) => ({
  slug: p.slug,
  index: p.index,
  name: p.name,
  category: p.category,
  date: p.date,
  state: p.live ? "SHIPPED" : "SOURCE PUBLISHED",
  evidence: p.live
    ? p.live.replace(/^https?:\/\//, "")
    : p.github.replace(/^https?:\/\/(www\.)?/, ""),
  href: `/work/${p.slug}`,
}));

export const SHIPPED_COUNT = PIPELINE.filter((r) => r.state === "SHIPPED").length;
