/**
 * TECHNICAL ECOSYSTEM
 * ---------------------------------------------------------------------------
 * Source: DASH-THUMBNAIL/skills.png — used INSTEAD of the resume's skills
 * section, per explicit user instruction.
 *
 * 8 categories, 35 technologies. `projects` links each technology to the
 * project slugs that use it, which drives the STACK page's relationship
 * highlighting ("Hover Next.js -> Connex AI -> FlowForge AI -> ...").
 */

export type Tone = "violet" | "cyan" | "lime" | "amber" | "rose";

export interface Tech {
  name: string;
  /** Project slugs where this technology was actually used. */
  projects: string[];
  /** Sibling technologies commonly used alongside it. */
  related?: string[];
}

export interface SkillCategory {
  id: string;
  label: string;
  tone: Tone;
  items: Tech[];
}

export const SKILLS: SkillCategory[] = [
  {
    id: "languages",
    label: "PROGRAMMING LANGUAGES",
    tone: "cyan",
    items: [
      {
        name: "Python",
        projects: ["clarityledger", "hr-analytics-dashboard"],
        related: ["FastAPI", "SQL"],
      },
      {
        name: "TypeScript",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai", "save-and-grow"],
        related: ["Next.js", "React", "Node.js"],
      },
      {
        name: "JavaScript",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai", "save-and-grow"],
        related: ["React", "Node.js"],
      },
      {
        name: "SQL",
        projects: ["blinkit-sales-dashboard", "hr-analytics-dashboard", "save-and-grow"],
        related: ["PostgreSQL", "MySQL"],
      },
    ],
  },
  {
    id: "web",
    label: "WEB & BACKEND",
    tone: "violet",
    items: [
      {
        name: "Next.js",
        projects: [
          "connex-ai",
          "flowforge-ai",
          "clickflow-ai",
          "clarityledger",
          "save-and-grow",
        ],
        related: ["React", "TypeScript", "Tailwind CSS"],
      },
      {
        name: "React",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai", "save-and-grow"],
        related: ["Next.js", "TypeScript"],
      },
      {
        name: "Node.js",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai"],
        related: ["REST API", "TypeScript"],
      },
      {
        name: "REST API",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai", "clarityledger"],
        related: ["Node.js"],
      },
      {
        name: "Tailwind CSS",
        projects: ["connex-ai", "clickflow-ai", "save-and-grow"],
        related: ["Next.js", "React"],
      },
    ],
  },
  {
    id: "ai",
    label: "AI / ML",
    tone: "lime",
    items: [
      {
        name: "OpenAI",
        projects: ["flowforge-ai", "clickflow-ai", "clarityledger"],
        related: ["Prompt Engineering", "Agentic AI"],
      },
      {
        name: "Google Gemini",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai"],
        related: ["Prompt Engineering"],
      },
      {
        name: "LangGraph",
        projects: ["clarityledger"],
        related: ["RAG", "Agentic AI", "Python"],
      },
      {
        name: "NLP",
        projects: ["connex-ai", "clarityledger"],
        related: ["RAG"],
      },
      {
        name: "RAG",
        projects: ["clarityledger"],
        related: ["LangGraph", "NLP"],
      },
      {
        name: "Prompt Engineering",
        projects: ["flowforge-ai", "clickflow-ai", "clarityledger", "save-and-grow"],
        related: ["OpenAI", "Google Gemini"],
      },
      {
        name: "Agentic AI",
        projects: ["clickflow-ai", "clarityledger", "connex-ai"],
        related: ["LangGraph", "OpenAI"],
      },
    ],
  },
  {
    id: "data",
    label: "DATABASES & ORM",
    tone: "amber",
    items: [
      {
        name: "PostgreSQL",
        projects: ["connex-ai", "flowforge-ai", "clickflow-ai", "save-and-grow"],
        related: ["Drizzle ORM", "Prisma", "Neon"],
      },
      {
        name: "MySQL",
        projects: ["blinkit-sales-dashboard"],
        related: ["SQL"],
      },
      {
        name: "Neon",
        projects: ["clickflow-ai", "save-and-grow"],
        related: ["PostgreSQL", "Drizzle ORM"],
      },
      {
        name: "Drizzle ORM",
        projects: ["connex-ai", "clickflow-ai", "save-and-grow"],
        related: ["PostgreSQL", "Neon"],
      },
      {
        name: "Prisma",
        projects: ["flowforge-ai"],
        related: ["PostgreSQL"],
      },
    ],
  },
  {
    id: "cloud",
    label: "DATA & CLOUD",
    tone: "cyan",
    items: [
      {
        name: "Excel",
        projects: ["blinkit-sales-dashboard", "hr-analytics-dashboard"],
        related: ["Power BI", "SQL"],
      },
      {
        name: "Power BI",
        projects: ["blinkit-sales-dashboard"],
        related: ["Excel", "SQL"],
      },
      { name: "Vercel", projects: [], related: ["Next.js"] },
      { name: "Azure", projects: [], related: [] },
    ],
  },
  {
    id: "tools",
    label: "DEVELOPMENT TOOLS",
    tone: "violet",
    items: [
      { name: "Git", projects: [], related: ["GitHub"] },
      { name: "GitHub", projects: [], related: ["Git"] },
      { name: "VS Code", projects: [], related: [] },
      { name: "Linux", projects: [], related: ["Kali Linux"] },
      { name: "Sentry", projects: ["flowforge-ai"], related: [] },
    ],
  },
  {
    id: "security",
    label: "CYBERSECURITY",
    tone: "rose",
    items: [
      { name: "Wireshark", projects: [], related: ["Nmap"] },
      { name: "Metasploit", projects: [], related: ["Kali Linux"] },
      { name: "Burp Suite", projects: [], related: ["Nmap"] },
      { name: "Nmap", projects: [], related: ["Wireshark", "Kali Linux"] },
      { name: "Kali Linux", projects: [], related: ["Linux", "Metasploit"] },
    ],
  },
];

/** Flat list — used for counts and lookups. */
export const ALL_TECH = SKILLS.flatMap((c) => c.items);

export const TECH_COUNT = ALL_TECH.length;

export function findTech(name: string): Tech | undefined {
  return ALL_TECH.find((t) => t.name === name);
}
