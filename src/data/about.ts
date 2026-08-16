/**
 * ABOUT CONTENT
 * ---------------------------------------------------------------------------
 * Every line here traces back to the resume (ABHISHEK-UPDATED1.pdf) or to
 * project-description.txt. Nothing is invented — no fabricated employers,
 * awards, years, or claims. Where the resume is silent, this file is silent.
 */

/** Output of the `cat about_me.txt` command — the professional summary, in voice. */
export const ABOUT_FILE: string[] = [
  "Computer Engineering student building AI-powered applications,",
  "full-stack web platforms, and data analytics solutions.",
  "",
  "I work in Python, SQL, JavaScript/TypeScript, React, Next.js and",
  "PostgreSQL, with a focus on designing scalable SaaS applications",
  "and integrating Large Language Models.",
  "",
  "I like solving real-world problems through software engineering,",
  "AI and data — and taking products end to end, from idea to",
  "deployment.",
];

/** The four-word thesis. Descriptions are honest framings of resume content. */
export interface Principle {
  word: string;
  index: string;
  detail: string;
  tone: "violet" | "cyan" | "lime" | "amber";
}

export const PRINCIPLES: Principle[] = [
  {
    word: "CODE",
    index: "01",
    detail:
      "Python, TypeScript, SQL. The languages are a means — the point is a system that runs in production and survives contact with real users.",
    tone: "violet",
  },
  {
    word: "THINK",
    index: "02",
    detail:
      "Architecture before implementation. Event-driven workflows, encrypted credential storage and usage limits are decisions, not afterthoughts.",
    tone: "cyan",
  },
  {
    word: "BUILD",
    index: "03",
    detail:
      "AI agent platforms, RAG systems, workflow engines, BI pipelines. Shipped end to end — auth, billing, monitoring and deployment included.",
    tone: "lime",
  },
  {
    word: "REPEAT",
    index: "04",
    detail:
      "Each project raises the floor for the next. Connex AI taught the SaaS spine; FlowForge AI pushed it into orchestration at scale.",
    tone: "amber",
  },
];

/** Cursor-reactive technical tags. Drawn from the resume's skills section. */
export const TAGS: string[] = [
  "PYTHON",
  "TYPESCRIPT",
  "NEXT.JS",
  "REACT",
  "NODE.JS",
  "POSTGRESQL",
  "SQL",
  "PRISMA",
  "DRIZZLE ORM",
  "tRPC",
  "LLM INTEGRATION",
  "OPENAI",
  "GOOGLE GEMINI",
  "RAG",
  "NLP",
  "PROMPT ENGINEERING",
  "AGENTIC AI",
  "REST APIs",
  "OAUTH",
  "POWER BI",
  "EXCEL",
  "AZURE",
  "GIT",
  "LINUX",
];

export interface EducationEntry {
  title: string;
  org: string;
  period: string;
  facts: string[];
}

export const EDUCATION: EducationEntry[] = [
  {
    title: "BE, COMPUTER ENGINEERING",
    org: "Universal College of Engineering — Mumbai University",
    period: "AUG 2023 — PRESENT",
    facts: ["CGPA 7.00 / 10.00"],
  },
  {
    title: "SECONDARY & HIGHER SECONDARY",
    org: "Maharashtra State Board",
    period: "2018 — 2023",
    facts: ["SSC (Class X) — 92%", "HSC (Science) — 61%"],
  },
];

export const CERTIFICATIONS: { org: string; name: string }[] = [
  { org: "AWS", name: "Mastering AI on AWS — training toward AI Practitioner" },
  { org: "NASSCOM", name: "Cyber Security" },
  { org: "IIT BOMBAY", name: "Cybersecurity Workshop" },
  { org: "IIT BOMBAY", name: "BSE Equity Research Workshop" },
  { org: "GOOGLE", name: "Assets, Threats, and Vulnerabilities" },
];

/** Attended Techfest, IIT Bombay — workshops, showcases, industry networking. */
export const ACTIVITY =
  "Attended Techfest, IIT Bombay — technical workshops, technology showcases and industry networking sessions.";

export const ABOUT_STATS = [
  { label: "PROJECTS SHIPPED", value: 7, suffix: "" },
  { label: "TECHNOLOGIES", value: 35, suffix: "+" },
  { label: "CERTIFICATIONS", value: 5, suffix: "" },
  { label: "YEARS CODING", value: 3, suffix: "+" },
] as const;
