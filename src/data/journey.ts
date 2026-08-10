/**
 * JOURNEY TIMELINE
 * ---------------------------------------------------------------------------
 * Strictly derived from the resume (ABHISHEK-UPDATED1.pdf), per the user's
 * explicit choice: "Derive strictly from resume dates only."
 *
 * Nothing here is invented. The reference image's 2022-2026 labels are
 * dropped in favour of what is actually provable:
 *   2018-2023 schooling  ·  Aug 2023 BE start  ·  Aug 2025 Connex AI
 *   Apr 2026 FlowForge AI  ·  Jul 2026 Blinkit dashboard
 */

export interface Milestone {
  year: string;
  title: string;
  detail: string;
  tone: "violet" | "cyan" | "lime" | "amber" | "rose";
}

export const MILESTONES: Milestone[] = [
  {
    year: "2018",
    title: "THE FOUNDATION",
    detail:
      "Completed SSC (Class X) with 92% and HSC (Science) with 61% — a base of discipline and quantitative habit that would feed everything after it.",
    tone: "lime",
  },
  {
    year: "2023",
    title: "THE START",
    detail:
      "Enrolled in BE Computer Engineering at Universal College of Engineering, Mumbai University. The formal beginning of the engineering path.",
    tone: "violet",
  },
  {
    year: "2025",
    title: "BUILDING",
    detail:
      "Shipped Connex AI — a full SaaS AI meeting platform with LiveKit and Gemini — proving end-to-end product delivery from auth to billing.",
    tone: "cyan",
  },
  {
    year: "2026",
    title: "SCALING",
    detail:
      "FlowForge AI, ClickFlow AI, ClarityLedger and two data dashboards followed — AI agent platforms, RAG systems and BI pipelines in one year.",
    tone: "amber",
  },
  {
    year: "NOW",
    title: "NEXT",
    detail: "Currently pursuing my degree while shipping real systems. The timeline continues.",
    tone: "rose",
  },
];
