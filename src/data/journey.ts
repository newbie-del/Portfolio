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
