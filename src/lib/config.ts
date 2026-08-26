/**
 * Central site configuration.
 * Rebrand the entire site from this file — components read from here,
 * never hardcode brand details inside components.
 */

export const siteConfig = {
  name: "HarizX",
  /** Typographic wordmark used in the navbar and footer. */
  wordmark: "HARIZX",
  tagline: "Give us the problem. We'll build the system.",
  /** Hero supporting line — what we do, in one breath. */
  intro:
    "AI-powered systems, automation, websites and digital experiences built around real business problems.",
  description:
    "We build AI-powered automation, websites, applications and digital systems that help businesses operate and grow.",
  // Must match the host Vercel serves as primary. harizx.com currently
  // 308-redirects to www, so www is the canonical home — pointing
  // canonical/OG/sitemap at the redirecting host confuses crawlers.
  // If you make the apex primary in Vercel, drop the "www." here too.
  url: "https://www.harizx.com",
  email: "support@harizx.com",
  location: "Operating worldwide",
  // Verified accounts only. Add a channel here once it actually exists —
  // a dead social link costs more trust than a missing one.
  social: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/harizxcom",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/musadiq-khan-bb88102b6",
    },
  ],
  // Order drives the navbar, the mobile menu, and the footer menu.
  // Each href must match a section id on the page.
  nav: [
    { label: "Home", href: "#top" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Start a project", href: "#contact" },
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
