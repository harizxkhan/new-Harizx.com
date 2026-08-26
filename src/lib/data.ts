/** Data-driven content for services, process, and work showcase. */

export type Service = {
  id: string;
  index: string;
  title: string;
  headline: string;
  description: string;
  items: string[];
  /** Conversion copy for this service's inline CTA. */
  ctaLabel: string;
  visual: "network" | "browser" | "panels" | "frames" | "metrics" | "blueprint";
};

export const services: Service[] = [
  {
    id: "ai-automation",
    index: "01",
    title: "AI Automation",
    headline: "Stop doing it manually.",
    description:
      "Intelligent workflows that eliminate repetitive work and run your operations while you sleep.",
    items: [
      "Lead qualification",
      "Customer support",
      "Appointment systems",
      "CRM automation",
      "Email automation",
      "AI agents",
    ],
    ctaLabel: "Automate a workflow",
    visual: "network",
  },
  {
    id: "websites",
    index: "02",
    title: "Websites",
    headline: "Built around business goals.",
    description:
      "High-performance websites engineered to convert — not to sit there looking pretty.",
    items: [
      "Corporate websites",
      "Landing pages",
      "E-commerce",
      "Portfolio sites",
      "Marketing sites",
      "Experimental web",
    ],
    ctaLabel: "Brief us on a website",
    visual: "browser",
  },
  {
    id: "apps",
    index: "03",
    title: "Web & Mobile Apps",
    headline: "Custom digital products.",
    description:
      "From SaaS platforms to internal tools — software shaped exactly to how your business runs.",
    items: [
      "SaaS platforms",
      "Dashboards",
      "Customer portals",
      "Booking systems",
      "Marketplaces",
      "Mobile applications",
    ],
    ctaLabel: "Scope an app",
    visual: "panels",
  },
  {
    id: "ai-content",
    index: "04",
    title: "AI Content",
    headline: "Ideas at machine speed.",
    description:
      "High-quality digital content produced with AI pipelines — controlled, branded, relentless.",
    items: [
      "AI-generated video",
      "Social media content",
      "Product visuals",
      "Advertising creatives",
      "Image generation",
      "Branded content",
    ],
    ctaLabel: "Plan a content system",
    visual: "frames",
  },
  {
    id: "marketing",
    index: "05",
    title: "Digital Marketing",
    headline: "Attention into customers.",
    description:
      "Strategy, campaigns, and optimization loops that turn traffic into revenue.",
    items: [
      "Social media strategy",
      "Paid advertising",
      "Content strategy",
      "Lead generation",
      "SEO",
      "Conversion optimization",
    ],
    ctaLabel: "Build a growth engine",
    visual: "metrics",
  },
  {
    id: "ai-consulting",
    index: "06",
    title: "AI Consulting",
    headline: "Find the real leverage.",
    description:
      "We identify where AI creates actual business value — then design the system to capture it.",
    items: ["Discover", "Design", "Build", "Automate", "Optimize"],
    ctaLabel: "Book a consultation",
    visual: "blueprint",
  },
];

export type ProcessStep = { index: string; title: string; detail: string };

export const processSteps: ProcessStep[] = [
  { index: "01", title: "Discover", detail: "We map the problem, the bottlenecks, and the opportunity." },
  { index: "02", title: "Strategize", detail: "We design the system on paper before a line of code exists." },
  { index: "03", title: "Design", detail: "Interfaces, flows, and experiences — engineered, not decorated." },
  { index: "04", title: "Build", detail: "Production-grade engineering. Shipped in tight, visible iterations." },
  { index: "05", title: "Launch", detail: "Deployed, monitored, measured from day one." },
  { index: "06", title: "Optimize", detail: "The system learns. We tune it until the numbers move." },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  category: string;
  /** One-line summary of what the system does. */
  description: string;
  year: string;
  /** Shown as the project's status chip. */
  status: string;
  /** True for demo builds rather than delivered client work. */
  demo: boolean;
  tags: string[];
  tone: "dark" | "light" | "red";
  /** Optional looping background video (AI-generated in-house). */
  video?: string;
};

/**
 * DEMO builds — internal systems we've built to prove the approach,
 * not delivered client work. Every entry is labelled as such in the UI.
 * Replace with real case studies as engagements complete; set
 * `demo: false` and update `status` when you do.
 */
export const projects: Project[] = [
  {
    id: "project-01",
    index: "P.01",
    title: "AI Automation System",
    category: "Automation / AI Agents",
    description:
      "An agent pipeline that qualifies inbound leads, drafts replies, and books meetings without a human touching the queue.",
    year: "2026",
    status: "Internal build",
    demo: true,
    tags: ["Workflow design", "AI agents", "Integrations"],
    tone: "dark",
  },
  {
    id: "project-02",
    index: "P.02",
    title: "E-Commerce Experience",
    category: "Web / Commerce",
    description:
      "A headless storefront concept built for speed — product data, motion, and checkout tuned around conversion, not decoration.",
    year: "2026",
    status: "Internal build",
    demo: true,
    tags: ["Next.js", "Headless commerce", "Motion design"],
    tone: "light",
  },
  {
    id: "project-03",
    index: "P.03",
    title: "AI Content Engine",
    category: "Content / Pipelines",
    description:
      "A generation pipeline that turns one brief into a week of on-brand video, stills, and copy, with review gates built in.",
    year: "2026",
    status: "Internal build",
    demo: true,
    tags: ["Generation pipeline", "Brand system", "Distribution"],
    tone: "red",
    video: "/media/system-loop.mp4",
  },
  {
    id: "project-04",
    index: "P.04",
    title: "Custom Web Platform",
    category: "Product / SaaS",
    description:
      "A multi-tenant dashboard skeleton — auth, roles, billing hooks, and an API layer ready to carry a real product.",
    year: "2026",
    status: "Internal build",
    demo: true,
    tags: ["Platform architecture", "Dashboards", "APIs"],
    tone: "dark",
  },
];

/**
 * Platforms we build on and automate across.
 *
 * IMPORTANT — these are tools, not clients and not partners. The UI
 * labels them as such deliberately. Do not relabel this strip as
 * "Trusted by", "Our clients", or "Partners" unless HarizX actually
 * holds those relationships and can substantiate them: naming real
 * companies as customers when they are not is a false claim, and these
 * are all trademarks of their respective owners.
 *
 * Remove any entry the team does not genuinely work with.
 */
export type Integration = { name: string; use: string };

export const integrations: Integration[] = [
  { name: "Google", use: "Workspace & Analytics" },
  { name: "Monday", use: "Work management" },
  { name: "Vercel", use: "Deployment" },
  { name: "Notion", use: "Docs & databases" },
  { name: "Stripe", use: "Payments" },
  { name: "Slack", use: "Notifications" },
  { name: "HubSpot", use: "CRM" },
  { name: "Zapier", use: "Workflow glue" },
];

export const technologies = [
  "AI",
  "AUTOMATION",
  "APIS",
  "WEB",
  "MOBILE",
  "CLOUD",
  "DATA",
  "ANALYTICS",
];

export const timelineOptions = [
  "ASAP",
  "Within 1 month",
  "1–3 months",
  "3+ months",
  "Not sure yet",
];
