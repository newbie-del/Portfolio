/**
 * PROJECT DATA — SINGLE SOURCE OF TRUTH
 * ---------------------------------------------------------------------------
 * Every field traces back to a file the user supplied:
 *   - descriptions + GitHub URLs -> DASH-THUMBNAIL/project-description.txt
 *   - thumbnails                 -> DASH-THUMBNAIL/*.png (used as-is)
 *   - metrics                    -> DASH-THUMBNAIL/ABHISHEK-UPDATED1.pdf (resume)
 *   - dates                      -> the resume for Connex AI, FlowForge and
 *     Blinkit; supplied directly by the owner for the other four.
 *
 * Per spec: DO NOT invent project information. DO NOT remove projects.
 * DO NOT replace the thumbnails. There are 7 projects, not 3.
 */

export type Category = "AI" | "FULL-STACK" | "DATA";

/** One layer of the X-Ray teardown. Order = spatial stacking, top to bottom. */
export interface XRayLayer {
  id: string;
  label: string;
  sublabel: string;
  /** Accent used for this layer's plane, edges and connection lines. */
  tone: "violet" | "cyan" | "lime" | "amber" | "rose";
  /** Nodes that live on this plane and can be hovered individually. */
  nodes: string[];
  /** What this layer does — revealed when the layer is clicked. */
  detail: string;
}

export interface Project {
  slug: string;
  index: string;
  name: string;
  tagline: string;
  category: Category;
  /** Month + year the project was built, supplied by the owner. */
  date: string;
  /** Verbatim from project-description.txt. */
  description: string;
  problem: string;
  solution: string;
  features: string[];
  stack: string[];
  /** Short chips shown on the archive card. */
  chips: string[];
  thumbnail: string;
  github: string;
  live: string | null;
  xray: XRayLayer[];
}

export const PROJECTS: Project[] = [
  /* ---------------------------------------------------------------- 01 --- */
  {
    slug: "connex-ai",
    index: "01",
    name: "CONNEX AI",
    tagline: "AI-Powered Video Communication Platform",
    category: "AI",
    date: "AUG 2025",
    description:
      "Connex AI is a SaaS AI meeting and video calling platform that enables users to have real-time voice and video conversations with custom AI agents. It combines LiveKit Agents and Gemini Live to provide low-latency AI voice interactions with real-time participant management and speaker-attributed transcripts, while an event-driven workflow powered by Inngest automatically processes transcripts, identifies speakers, generates AI summaries, and creates post-meeting artifacts. The platform also provides secure meeting recordings, transcriptions, summaries, and an AI chat section where users can ask questions and discuss topics related to their meetings. Built with Better Auth and Polar, it includes OAuth authentication, subscription billing, usage limits, and premium access, combining real-time communication, AI agents, and automated meeting intelligence into a single platform.",
    problem:
      "Meetings generate enormous value but almost none of it is captured. Notes are partial, action items evaporate, and nobody rewatches an hour-long recording to find one decision.",
    solution:
      "A meeting platform where a custom AI agent joins the call itself — speaking and listening in real time — then an event-driven pipeline turns the raw transcript into attributed, searchable, summarised intelligence you can interrogate afterwards.",
    features: [
      "Real-time voice + video conversation with custom AI agents",
      "Low-latency voice assistant via LiveKit Agents and Gemini Live",
      "Speaker-attributed transcripts with real-time participant management",
      "Event-driven post-meeting pipeline: summaries, artifacts, speaker ID",
      "Secure recordings, transcriptions and per-meeting AI chat",
      "OAuth auth, subscription billing, usage limits and premium tiers",
    ],
    stack: [
      "Next.js 15",
      "React",
      "TypeScript",
      "tRPC",
      "Drizzle ORM",
      "PostgreSQL",
      "LiveKit",
      "Gemini Live",
      "Inngest",
      "Better Auth",
      "Polar",
    ],
    chips: ["NEXT.JS", "LIVEKIT", "GEMINI", "TYPESCRIPT"],
    thumbnail: "/projects/connex-ai.png",
    github: "https://github.com/newbie-del/ConnexAI",
    live: "https://connex-ai-wine.vercel.app",
    xray: [
      {
        id: "frontend",
        label: "FRONTEND",
        sublabel: "Next.js / Tailwind",
        tone: "violet",
        nodes: ["Call UI", "Transcript View", "Meeting Chat", "Dashboard"],
        detail:
          "The Next.js 15 client renders the live call surface, the speaker-attributed transcript stream and the post-meeting chat, communicating with the server over typed tRPC procedures.",
      },
      {
        id: "ai",
        label: "AI LAYER",
        sublabel: "Gemini Live / Agents",
        tone: "cyan",
        nodes: ["Gemini Live", "Agent Runtime", "Summariser", "Speaker ID"],
        detail:
          "Custom AI agents run against Gemini Live for sub-second voice turnaround, while background jobs perform speaker identification and generate meeting summaries.",
      },
      {
        id: "comms",
        label: "COMMUNICATION",
        sublabel: "LiveKit",
        tone: "lime",
        nodes: ["WebRTC Rooms", "Audio Track", "Participants", "Recording"],
        detail:
          "LiveKit Agents handle the realtime transport — room lifecycle, participant state and audio tracks — and produce the recordings the pipeline later consumes.",
      },
      {
        id: "backend",
        label: "BACKEND",
        sublabel: "Node.js / tRPC",
        tone: "amber",
        nodes: ["tRPC Router", "Inngest Workers", "Better Auth", "Polar"],
        detail:
          "An event-driven Inngest workflow orchestrates transcript processing after each call. Better Auth handles OAuth, and Polar enforces subscriptions and usage limits.",
      },
      {
        id: "data",
        label: "DATABASE",
        sublabel: "PostgreSQL / Drizzle",
        tone: "rose",
        nodes: ["Meetings", "Transcripts", "Agents", "Subscriptions"],
        detail:
          "PostgreSQL accessed through Drizzle ORM stores meetings, transcripts, agent configurations and billing state with fully typed queries.",
      },
    ],
  },

  /* ---------------------------------------------------------------- 02 --- */
  {
    slug: "flowforge-ai",
    index: "02",
    name: "FLOWFORGE AI",
    tagline: "Workflow Automation Platform",
    category: "AI",
    date: "APR 2026",
    description:
      "FlowForge AI is a SaaS AI workflow automation platform that enables users to visually build, connect, and execute multi-step workflows through a drag-and-drop canvas. The platform supports webhook triggers, Google Forms integrations, and event-driven workflow execution, allowing users to automate repetitive processes and connect different services. It integrates AI models including OpenAI, Claude, and Gemini to power intelligent workflow steps such as content generation, data processing, decision-making, and task automation. The system is built with secure authentication, workflow persistence, database management, monitoring, and usage controls, combining visual workflow automation with AI capabilities to make complex business processes easier to design, manage, and execute.",
    problem:
      "Automation platforms force a choice: rigid no-code builders that break on anything unusual, or writing glue scripts by hand for every integration.",
    solution:
      "A drag-and-drop canvas with 24+ composable nodes where AI models are first-class steps — plus an AI builder that turns a natural-language prompt into a validated, executable workflow.",
    features: [
      "Drag-and-drop canvas with asynchronous execution and execution history",
      "24+ workflow nodes: AI models, HTTP APIs, Google Workspace, Slack, Stripe, Discord, Telegram, browser automation and code",
      "AI workflow builder converting natural language into validated workflows",
      "Webhook triggers, Google Forms integration, event-driven execution",
      "Encrypted credential storage and secure authentication",
      "Subscription management and production monitoring",
    ],
    stack: [
      "Next.js 15",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "React Flow",
      "Inngest",
      "Better Auth",
      "Polar",
      "Sentry",
    ],
    chips: ["NEXT.JS", "PRISMA", "AI", "WEBHOOKS"],
    thumbnail: "/projects/flowforge-ai.png",
    github: "https://github.com/newbie-del/FlowForge",
    live: null,
    xray: [
      {
        id: "ui",
        label: "UI / CANVAS",
        sublabel: "React Flow",
        tone: "violet",
        nodes: ["Node Editor", "Edge Router", "Inspector", "Run History"],
        detail:
          "React Flow powers the drag-and-drop canvas — node placement, edge routing and live execution state overlaid directly onto the graph.",
      },
      {
        id: "workflow",
        label: "WORKFLOW",
        sublabel: "24+ Nodes",
        tone: "cyan",
        nodes: ["AI Nodes", "HTTP Nodes", "Logic Nodes", "Code Nodes"],
        detail:
          "Each node is a typed, composable unit. The AI builder validates a generated graph against these node schemas before it is ever allowed to execute.",
      },
      {
        id: "execution",
        label: "EXECUTION",
        sublabel: "Inngest / Queue",
        tone: "lime",
        nodes: ["Runtime", "Queue", "Scheduler", "Retries"],
        detail:
          "Inngest executes workflows asynchronously with durable retries, so a long-running multi-step automation survives failures and restarts.",
      },
      {
        id: "integration",
        label: "INTEGRATION",
        sublabel: "OpenAI / Gemini / Webhooks",
        tone: "amber",
        nodes: ["OpenAI", "Claude", "Gemini", "Google Workspace", "Slack", "Stripe"],
        detail:
          "Outbound integrations run through encrypted credential storage; inbound webhooks and Google Forms submissions act as workflow triggers.",
      },
      {
        id: "infra",
        label: "INFRASTRUCTURE",
        sublabel: "Prisma / Sentry",
        tone: "rose",
        nodes: ["PostgreSQL", "Prisma", "Sentry", "Polar"],
        detail:
          "Workflow definitions and run history persist in PostgreSQL via Prisma. Sentry provides production monitoring and Polar handles subscription limits.",
      },
    ],
  },

  /* ---------------------------------------------------------------- 03 --- */
  {
    slug: "clickflow-ai",
    index: "03",
    name: "CLICKFLOW AI",
    tagline: "AI Browser Automation Platform",
    category: "AI",
    date: "DEC 2026",
    description:
      "ClickFlow AI is an AI-powered browser automation and workflow platform built using Next.js, React, TypeScript, Tailwind CSS, React Flow, Playwright, Drizzle ORM, PostgreSQL/Neon, and AI models including OpenAI, Claude, and Gemini. The platform allows users to describe tasks in natural language and enables autonomous AI agents to plan and execute actions directly on real websites, while also providing a visual workflow builder for creating reusable automations. It supports features such as real-time workflow execution, browser session recording and replay, collaboration, authentication, organizations, billing, and human approval for sensitive actions, combining AI-driven browser automation with visual workflows to automate repetitive tasks such as research, form filling, price comparison, and other web-based processes.",
    problem:
      "Most of the repetitive work on the web has no API — research, form filling, price comparison. Traditional scrapers shatter the moment a layout changes.",
    solution:
      "Autonomous agents that read a live page, plan their next action and execute it through Playwright — with session recording, replay, and a human approval gate before anything sensitive happens.",
    features: [
      "Natural-language task description executed by autonomous agents",
      "Agents plan and act directly on real websites via Playwright",
      "Visual workflow builder for reusable automations",
      "Real-time execution with browser session recording and replay",
      "Human approval required for sensitive actions",
      "Organizations, collaboration, authentication and billing",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "React Flow",
      "Playwright",
      "Drizzle ORM",
      "PostgreSQL / Neon",
      "OpenAI",
      "Claude",
      "Gemini",
    ],
    chips: ["PLAYWRIGHT", "REACT FLOW", "AGENTS", "NEON"],
    thumbnail: "/projects/clickflow-ai.png",
    github: "https://github.com/newbie-del/Clickflow-AI",
    live: null,
    xray: [
      {
        id: "ui",
        label: "UI / BUILDER",
        sublabel: "React Flow / Tailwind",
        tone: "violet",
        nodes: ["Flow Builder", "Session Replay", "Approval Queue", "Org Console"],
        detail:
          "The builder composes reusable automations while the replay viewer plays back recorded browser sessions frame by frame for auditing.",
      },
      {
        id: "agent",
        label: "AGENT LAYER",
        sublabel: "OpenAI / Claude / Gemini",
        tone: "cyan",
        nodes: ["Planner", "Action Selector", "DOM Reader", "Validator"],
        detail:
          "The agent loop reads page state, plans the next action and validates it. Sensitive steps are held for explicit human approval before dispatch.",
      },
      {
        id: "browser",
        label: "BROWSER",
        sublabel: "Playwright",
        tone: "lime",
        nodes: ["Headless Chrome", "Session Recorder", "Selector Engine", "Screenshots"],
        detail:
          "Playwright drives real browser sessions — clicking, typing and navigating — while recording every step for replay and debugging.",
      },
      {
        id: "backend",
        label: "BACKEND",
        sublabel: "Node.js / API Routes",
        tone: "amber",
        nodes: ["Run Orchestrator", "Auth", "Organizations", "Billing"],
        detail:
          "Orchestrates concurrent automation runs, enforces per-organization permissions and meters usage against billing.",
      },
      {
        id: "data",
        label: "DATABASE",
        sublabel: "PostgreSQL / Neon",
        tone: "rose",
        nodes: ["Workflows", "Sessions", "Recordings", "Members"],
        detail:
          "Neon-hosted PostgreSQL accessed via Drizzle stores workflow definitions, run sessions and recorded browser artifacts.",
      },
    ],
  },

  /* ---------------------------------------------------------------- 04 --- */
  {
    slug: "clarityledger",
    index: "04",
    name: "CLARITYLEDGER",
    tagline: "Agentic Financial Intelligence",
    category: "AI",
    date: "JUL 2026",
    description:
      "ClarityLedger is an agentic financial-intelligence platform that answers plain-English questions about public companies by retrieving evidence from real SEC EDGAR filings and responding with citations, flagging where management's words disagree with the reported numbers. It ingests any US company's filings with polite rate-limiting and on-disk caching, and offers three retrieval strategies behind one interface — BM25 keyword, local semantic vector search, and hybrid reciprocal-rank fusion — with swappable LLM providers (Claude, OpenAI, Ollama) powering grounded, cited answers. A LangGraph agent layer decomposes compound questions across specialist nodes and runs a reconciliation step that performs a \"says-vs-numbers\" contradiction check, backed by an evaluation harness (Hit@k/MRR). The system is built with a FastAPI backend featuring bcrypt-hashed SQLite auth and stateless JWTs, plus a Next.js web UI with signup, company picker, and cited source cards — combining retrieval-augmented generation, hybrid search, and multi-agent orchestration into a verifiable analyst that runs fully locally and free, making evidence-backed financial analysis easy to get and trust.",
    problem:
      "An LLM asked about a public company will answer fluently and sometimes wrongly. In financial analysis a confident hallucination is worse than no answer at all.",
    solution:
      "Every answer is grounded in retrieved SEC EDGAR text and returned with citations — plus a reconciliation agent that explicitly flags where management's narrative contradicts the reported numbers.",
    features: [
      "Plain-English questions answered from real SEC EDGAR filings",
      "Every answer returned with citations to source documents",
      "\"Says-vs-numbers\" contradiction check via a reconciliation agent",
      "Three retrieval strategies: BM25, local semantic vectors, hybrid RRF",
      "Swappable LLM providers — Claude, OpenAI, Ollama",
      "LangGraph agents decompose compound questions across specialist nodes",
      "Evaluation harness measuring Hit@k and MRR",
      "Runs fully locally and free",
    ],
    stack: [
      "Python",
      "FastAPI",
      "LangGraph",
      "Next.js",
      "SQLite",
      "JWT",
      "BM25",
      "Vector Search",
      "Claude",
      "OpenAI",
      "Ollama",
    ],
    chips: ["LANGGRAPH", "RAG", "FASTAPI", "PYTHON"],
    thumbnail: "/projects/clarityledger.png",
    github: "https://github.com/newbie-del/ClarityLedger",
    live: null,
    xray: [
      {
        id: "ui",
        label: "WEB UI",
        sublabel: "Next.js",
        tone: "violet",
        nodes: ["Company Picker", "Answer View", "Source Cards", "Signup"],
        detail:
          "The Next.js UI presents answers alongside cited source cards, so every claim can be traced back to the filing text it came from.",
      },
      {
        id: "agents",
        label: "AGENT LAYER",
        sublabel: "LangGraph",
        tone: "cyan",
        nodes: ["Decomposer", "Specialist Nodes", "Reconciler", "Synthesiser"],
        detail:
          "LangGraph decomposes compound questions across specialist nodes, then a reconciliation step runs the says-vs-numbers contradiction check.",
      },
      {
        id: "retrieval",
        label: "RETRIEVAL",
        sublabel: "BM25 / Vector / RRF",
        tone: "lime",
        nodes: ["BM25 Keyword", "Semantic Vectors", "Hybrid RRF", "Eval Harness"],
        detail:
          "Three retrieval strategies sit behind one interface. The evaluation harness scores them with Hit@k and MRR so the choice is measured, not assumed.",
      },
      {
        id: "api",
        label: "BACKEND",
        sublabel: "FastAPI",
        tone: "amber",
        nodes: ["FastAPI", "bcrypt Auth", "Stateless JWT", "LLM Router"],
        detail:
          "FastAPI serves the retrieval and agent pipeline with bcrypt-hashed auth and stateless JWTs, routing to whichever LLM provider is configured.",
      },
      {
        id: "ingest",
        label: "INGESTION",
        sublabel: "SEC EDGAR / SQLite",
        tone: "rose",
        nodes: ["EDGAR Client", "Rate Limiter", "Disk Cache", "SQLite"],
        detail:
          "Filings are ingested from SEC EDGAR with polite rate-limiting and on-disk caching, so repeat analysis never re-hits the source.",
      },
    ],
  },

  /* ---------------------------------------------------------------- 05 --- */
  {
    slug: "save-and-grow",
    index: "05",
    name: "SAVE & GROW",
    tagline: "Finance Intelligence & Expense Tracker",
    category: "FULL-STACK",
    date: "NOV 2024",
    description:
      "Save & Grow is a personal finance and investment tracking platform built using Next.js, React, Tailwind CSS, Drizzle ORM, and Neon PostgreSQL to help users manage income, expenses, and budgets in one place. The application provides an interactive dashboard for tracking financial activity, analyzing spending patterns, and getting AI-powered financial insights and investment suggestions based on user data, making money management simpler, more organized, and more actionable.",
    problem:
      "Budgeting apps record what you spent but rarely tell you anything useful about it. The data goes in; the insight never comes out.",
    solution:
      "An interactive dashboard that unifies income, expenses and budgets, then layers AI analysis over the user's own data to surface spending patterns and investment suggestions.",
    features: [
      "Unified income, expense and budget management",
      "Interactive dashboard for tracking financial activity",
      "Spending pattern analysis",
      "AI-powered financial insights based on user data",
      "Investment suggestions derived from real activity",
    ],
    stack: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "Drizzle ORM",
      "Neon PostgreSQL",
    ],
    chips: ["NEXT.JS", "CHART.JS", "DRIZZLE", "POSTGRES"],
    thumbnail: "/projects/save-and-grow.png",
    github: "https://github.com/newbie-del/save-grow",
    live: null,
    xray: [
      {
        id: "ui",
        label: "DASHBOARD",
        sublabel: "Next.js / Tailwind",
        tone: "violet",
        nodes: ["Overview", "Charts", "Budget Editor", "Transactions"],
        detail:
          "The interactive dashboard visualises financial activity — balances, category breakdowns and budget progress — in a single view.",
      },
      {
        id: "insight",
        label: "AI INSIGHTS",
        sublabel: "Analysis Engine",
        tone: "cyan",
        nodes: ["Pattern Analysis", "Insight Generator", "Suggestions"],
        detail:
          "Spending is analysed for recurring patterns, and AI generates financial insights and investment suggestions grounded in the user's own data.",
      },
      {
        id: "api",
        label: "BACKEND",
        sublabel: "API Routes",
        tone: "lime",
        nodes: ["Transactions API", "Budgets API", "Auth"],
        detail:
          "Server routes handle transaction ingestion, budget rules and authenticated access to each user's financial records.",
      },
      {
        id: "data",
        label: "DATABASE",
        sublabel: "Neon PostgreSQL",
        tone: "amber",
        nodes: ["Accounts", "Transactions", "Budgets", "Categories"],
        detail:
          "Neon-hosted PostgreSQL accessed through Drizzle ORM persists accounts, categorised transactions and budget definitions.",
      },
    ],
  },

  /* ---------------------------------------------------------------- 06 --- */
  {
    slug: "blinkit-sales-dashboard",
    index: "06",
    name: "BLINKIT DASHBOARD",
    tagline: "Sales Analytics & Business Intelligence",
    category: "DATA",
    date: "JUL 2026",
    description:
      "Blinkit Sales Dashboard is a data analytics and business intelligence project built using Power BI, Microsoft Excel, Power Query, and DAX to analyze and visualize Blinkit's sales performance. The dashboard provides interactive KPI cards, charts, and business insights to track total sales, average sales, outlet performance, item distribution, outlet size, location-based performance, and sales trends, enabling users to quickly identify patterns and make data-driven decisions.",
    problem:
      "Raw grocery retail data spread across outlets and product categories hides the two things management actually needs: where revenue concentrates, and why.",
    solution:
      "An end-to-end analytics pipeline — cleaning inconsistent records in MySQL and Excel, then surfacing outlet, category and location performance through an executive dashboard.",
    features: [
      "Analysed 8,523 grocery sales records worth ₹2.6 Cr",
      "Coverage across 10 outlets, 16 product categories and 1,392 products",
      "Identified a 13.3% sales uplift linked to shelf visibility",
      "Surfaced a 10.9× revenue gap between outlet formats",
      "Executive dashboard: 10 PivotTables, 9 interactive charts, 6 slicers",
      "Data cleaning and quality validation across inconsistent records",
    ],
    stack: [
      "Power BI",
      "Microsoft Excel",
      "Power Query",
      "DAX",
      "MySQL",
      "SQL",
      "PivotTables",
      "Window Functions",
    ],
    chips: ["POWER BI", "DAX", "MYSQL", "EXCEL"],
    thumbnail: "/projects/blinkit-dashboard.png",
    github: "https://github.com/newbie-del/blinkit-Sales-Dashboard",
    live: null,
    xray: [
      {
        id: "viz",
        label: "VISUALISATION",
        sublabel: "Power BI",
        tone: "violet",
        nodes: ["KPI Cards", "Trend Charts", "Slicers", "Outlet Matrix"],
        detail:
          "The executive dashboard layer: 10 PivotTables, 9 interactive charts and 6 slicers driving cross-filtering across every view.",
      },
      {
        id: "model",
        label: "DATA MODEL",
        sublabel: "DAX",
        tone: "cyan",
        nodes: ["Measures", "Calculated Columns", "Relationships"],
        detail:
          "DAX measures compute total and average sales, outlet performance and the visibility uplift metric across the modelled relationships.",
      },
      {
        id: "transform",
        label: "TRANSFORM",
        sublabel: "Power Query / SQL",
        tone: "lime",
        nodes: ["Cleaning", "Validation", "Window Functions", "Joins"],
        detail:
          "Power Query and SQL clean inconsistent records and validate data quality before anything reaches the model.",
      },
      {
        id: "source",
        label: "SOURCE",
        sublabel: "MySQL / Excel",
        tone: "amber",
        nodes: ["8,523 Records", "10 Outlets", "16 Categories", "1,392 Products"],
        detail:
          "The raw grocery sales dataset — 8,523 records worth ₹2.6 Cr spanning 10 outlets, 16 categories and 1,392 individual products.",
      },
    ],
  },


  /* ---------------------------------------------------------------- 07 --- */
{
  slug: "mortgage-credit-risk-analytics",
  index: "07",
  name: "MORTGAGE CREDIT RISK ANALYTICS",
  tagline: "Mortgage Credit Risk & Portfolio Analytics",
  category: "DATA",
  date: "SEP 2026",
  description:
    "Mortgage Credit Risk Analytics is an end-to-end data analysis project built on 12.26 million 2024 HMDA mortgage application records. The project takes raw loan-level data through profiling, data-quality validation, Python-based processing, MySQL analysis, risk segmentation, and an interactive Power BI reporting layer. It examines mortgage application outcomes from a credit-risk and underwriting perspective, analyzing denial rates across loan purpose, debt-to-income ratio, loan-to-value, geography, demographics, loan type, occupancy, lien status, pricing, and denial reasons. The final dashboard turns large-scale loan data into interactive risk insights, allowing users to explore portfolio concentration, risk drivers, demographic differences, product-level patterns, and detailed loan-purpose segments.",
  problem:
    "Mortgage datasets contain millions of records and dozens of variables, making it difficult to identify meaningful credit-risk patterns, compare portfolio segments, and separate high-risk concentration from high-volume exposure.",
  solution:
    "A complete analytics pipeline that processes 12.26M HMDA applications through Python, MySQL and Power BI — combining data-quality validation, risk segmentation, SQL analysis, DAX-driven reporting and interactive drill-through views.",
  features: [
    "Analysis of 12.26M+ 2024 HMDA mortgage application records",
    "Python-based profiling, transformation, chunked processing and validation",
    "MySQL analysis covering DTI, LTV, loan purpose, denial reasons, geography and product risk",
    "Seven-page Power BI dashboard with executive KPIs, risk drivers and portfolio concentration",
    "Demographic and fair-lending descriptive analysis with standardized comparisons",
    "Interactive loan-purpose drill-through with DTI, denial reasons, loan-type mix and KPIs",
    "Data-quality reconciliation across Python, SQL and Power BI outputs",
    "Excel-based data-quality logs and HMDA codebook documentation",
  ],
  stack: [
    "Python",
    "Pandas",
    "MySQL 8.0",
    "Power BI",
    "DAX",
    "Microsoft Excel",
    "HMDA",
    "SQL",
  ],
  chips: ["PYTHON", "MYSQL", "POWER BI", "HMDA"],
  thumbnail: "/projects/mortgage-credit-risk-analytics.png",
  github:
    "https://github.com/newbie-del/mortgage-credit-risk-analytics",
  live: null,
  xray: [
    {
      id: "source",
      label: "DATA SOURCE",
      sublabel: "2024 HMDA / 12.26M Records",
      tone: "violet",
      nodes: [
        "Loan Applications",
        "Applicant Data",
        "Property Data",
        "Loan Attributes",
      ],
      detail:
        "The project starts with the 2024 Dynamic National Loan-Level Dataset containing 12,260,627 mortgage application records and 99 columns from the official HMDA data source.",
    },
    {
      id: "processing",
      label: "PROCESSING",
      sublabel: "Python / Pandas",
      tone: "cyan",
      nodes: [
        "Profiling",
        "Data Quality",
        "Transformation",
        "Chunk Processing",
      ],
      detail:
        "Python is used to inspect the raw dataset, identify missing and extreme values, derive analytical fields, process the large file in 100,000-row chunks and validate the transformed output before database analysis.",
    },
    {
      id: "database",
      label: "ANALYTICS",
      sublabel: "MySQL 8.0 / SQL",
      tone: "lime",
      nodes: [
        "KPIs",
        "DTI / LTV",
        "Denial Analysis",
        "Risk Segmentation",
      ],
      detail:
        "MySQL stores the analytical dataset and powers queries for portfolio KPIs, denial rates, loan-purpose risk, DTI and LTV segmentation, geographic differences, product characteristics, pricing and risk-factor interactions.",
    },
    {
      id: "dashboard",
      label: "REPORTING",
      sublabel: "Power BI / DAX",
      tone: "amber",
      nodes: [
        "Executive Overview",
        "Risk Drivers",
        "Demographics",
        "Product Risk",
        "Deep Dive",
      ],
      detail:
        "Power BI transforms the SQL analysis into a seven-page interactive report using DAX measures, slicers, segmentation, drill-through pages and executive-focused visual reporting.",
    },
    {
      id: "validation",
      label: "VALIDATION",
      sublabel: "Python / SQL / Excel",
      tone: "rose",
      nodes: [
        "Row Reconciliation",
        "Missing Values",
        "Category Checks",
        "KPI Validation",
      ],
      detail:
        "Results are cross-checked across Python, MySQL and Power BI using row-count reconciliation, denominator checks, category validation, LTV quality checks and KPI reconciliation, with Excel used for supporting data-quality and codebook documentation.",
    },
  ],
},


  /* ---------------------------------------------------------------- 08 --- */
  {
    slug: "hr-analytics-dashboard",
    index: "08",
    name: "HR ANALYTICS",
    tagline: "Workforce Intelligence Dashboard",
    category: "DATA",
    date: "AUG 2026",
    description:
      "HR Analytics Dashboard is a business intelligence project built using Python, SQL, and Excel to analyze workforce data and visualize key HR metrics in a clean executive dashboard format. It helps track total employees, attrition rate, average salary, average age, tenure, satisfaction, department-wise trends, job roles, gender split, salary bands, education levels, and promotion status, making it easier to understand employee patterns and support data-driven HR decisions.",
    problem:
      "HR teams sit on years of workforce data but usually only see it once a quarter, flattened into a slide that answers no follow-up questions.",
    solution:
      "A clean executive dashboard that reduces workforce data to the metrics that drive decisions — attrition, tenure, satisfaction and pay distribution — sliceable by department and role.",
    features: [
      "Headcount, attrition rate, average salary, average age and tenure",
      "Satisfaction tracking and department-wise trend analysis",
      "Job role, gender split and education level breakdowns",
      "Salary band distribution and promotion status",
      "Clean executive dashboard format for decision support",
    ],
    stack: ["Python", "SQL", "Microsoft Excel", "Pandas", "Business Statistics"],
    chips: ["PYTHON", "SQL", "EXCEL", "ANALYTICS"],
    thumbnail: "/projects/hr-analytics.png",
    github: "https://github.com/newbie-del/HR-Analytics-Dashboard",
    live: null,
    xray: [
      {
        id: "viz",
        label: "DASHBOARD",
        sublabel: "Excel",
        tone: "violet",
        nodes: ["KPI Row", "Department View", "Salary Bands", "Attrition"],
        detail:
          "The executive layer surfaces headcount, attrition, average salary, age, tenure and satisfaction as a single readable board.",
      },
      {
        id: "analysis",
        label: "ANALYSIS",
        sublabel: "Python / Pandas",
        tone: "cyan",
        nodes: ["Aggregation", "Segmentation", "Trend Analysis", "Statistics"],
        detail:
          "Python and Pandas aggregate workforce data by department, role, gender, education and promotion status.",
      },
      {
        id: "query",
        label: "QUERY",
        sublabel: "SQL",
        tone: "lime",
        nodes: ["Joins", "Group By", "Filters", "Derived Metrics"],
        detail:
          "SQL joins and aggregations derive the metric set — attrition rate, tenure and salary bands — from the underlying employee tables.",
      },
      {
        id: "source",
        label: "SOURCE",
        sublabel: "Employee Data",
        tone: "amber",
        nodes: ["Employees", "Compensation", "Reviews", "Departments"],
        detail:
          "The workforce dataset covering employee records, compensation, review outcomes and departmental structure.",
      },
    ],
  },


  /* ---------------------------------------------------------------- 09 --- */
{
  slug: "ecommerce-data-analytics",
  index: "09",
  name: "E-COMMERCE DATA ANALYTICS",
  tagline: "Retail Sales & Profitability Analytics",
  category: "DATA",
  date: "AUG 2026",
  description:
    "E-Commerce Data Analytics is an end-to-end retail analytics project built on the Global Superstore dataset, covering 51,290 order lines across 147 countries. The project takes raw transactional data through data-quality auditing, customer and order identity resolution, feature engineering, RFM segmentation, cohort analysis, SQL business analysis, and an interactive Power BI reporting layer. It focuses on understanding whether revenue growth is creating real business value by examining profitability, discounting, products, customers, returns, fulfilment, geography, and portfolio concentration. The final analytical system combines Python, SQL and Power BI to turn raw retail transactions into actionable insights around margin leakage, customer value, product performance and operational efficiency.",
  problem:
    "Strong revenue growth can hide margin leakage, unprofitable products, excessive discounting, customer concentration and operational issues. A retail business needs to understand where revenue creates profit and where volume is being purchased at the expense of margin.",
  solution:
    "A complete retail analytics pipeline that cleans and validates transactional data, engineers commercial metrics, segments customers with RFM and cohort analysis, answers business questions through SQL, and exposes the results through a four-page Power BI reporting model.",
  features: [
    "End-to-end analysis of 51,290 order lines across 147 countries",
    "Python data-quality audit, customer identity resolution and feature engineering",
    "SQL analysis for sales growth, profitability, products, customers and operations",
    "RFM customer segmentation and cohort retention analysis",
    "Discount-band and product-quadrant analysis to identify margin leakage",
    "Four-page Power BI project with executive, product, customer and operations reporting",
    "Returns analysis with market-coverage-aware calculations",
    "Automated verification with 178 checks and zero reported failures",
  ],
  stack: [
    "Python",
    "Pandas",
    "NumPy",
    "SciPy",
    "SQLite",
    "ANSI SQL",
    "Power BI",
    "DAX",
    "Jupyter",
    "Excel",
  ],
  chips: ["PYTHON", "SQL", "POWER BI", "RFM"],
  thumbnail: "/projects/ecommerce-data-analytics.png",
  github:
    "https://github.com/newbie-del/ecommerce-data-analytics",
  live: null,
  xray: [
    {
      id: "source",
      label: "DATA SOURCE",
      sublabel: "Global Superstore",
      tone: "violet",
      nodes: [
        "Orders",
        "Returns",
        "People",
        "51K+ Order Lines",
      ],
      detail:
        "The project starts with the Global Superstore workbook containing 51,290 order lines, returns data and regional manager information covering 147 countries, 7 markets and 13 regions.",
    },
    {
      id: "processing",
      label: "PROCESSING",
      sublabel: "Python / Pandas",
      tone: "cyan",
      nodes: [
        "Data Audit",
        "Identity Resolution",
        "Feature Engineering",
        "RFM / Cohorts",
      ],
      detail:
        "Python profiles the raw workbook, validates keys and dates, resolves customer and order identities, engineers commercial and operational metrics, and builds RFM and cohort datasets without dropping transactional rows.",
    },
    {
      id: "database",
      label: "ANALYTICS",
      sublabel: "ANSI SQL / SQLite",
      tone: "lime",
      nodes: [
        "Sales KPIs",
        "Product Analysis",
        "Customer Analysis",
        "Operations",
      ],
      detail:
        "The SQL layer answers business questions around revenue growth, profit margins, discounting, product performance, customer value, returns, fulfilment and portfolio concentration using CTEs, aggregations and window functions.",
    },
    {
      id: "dashboard",
      label: "REPORTING",
      sublabel: "Power BI / DAX",
      tone: "amber",
      nodes: [
        "Executive Overview",
        "Product Performance",
        "Customer Insights",
        "Operations",
      ],
      detail:
        "The Power BI project uses a star-schema model and DAX measures to turn the analytical datasets into interactive reporting focused on executive KPIs, profitability, customers, products and operational performance.",
    },
    {
      id: "validation",
      label: "VALIDATION",
      sublabel: "178 Checks / 0 Failures",
      tone: "rose",
      nodes: [
        "Reconciliation",
        "SQL Verification",
        "KPI Checks",
        "Data Quality",
      ],
      detail:
        "Published metrics and analytical claims are independently verified through automated assertions, including Python-versus-SQL reconciliation, key checks, financial totals and Power BI model inputs before the results are published.",
    },
  ],
},
];

export const CATEGORIES = ["ALL", "AI", "FULL-STACK", "DATA"] as const;
export type CategoryFilter = (typeof CATEGORIES)[number];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/** Adjacent projects for prev/next navigation on detail pages. */
export function getProjectNeighbours(slug: string) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: i > 0 ? PROJECTS[i - 1] : PROJECTS[PROJECTS.length - 1],
    next: i < PROJECTS.length - 1 ? PROJECTS[i + 1] : PROJECTS[0],
  };
}


