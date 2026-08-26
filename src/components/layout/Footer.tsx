import { siteConfig } from "@/lib/config";
import { services, integrations } from "@/lib/data";

/** Footer: a closing CTA, the link columns, and a giant wordmark. */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink px-6 pb-8 pt-20 text-paper md:px-12">
      {/* Last chance to convert before the page runs out */}
      <div className="flex flex-col gap-6 border-b border-paper/15 pb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mono-label mb-4 text-signal">STILL READING?</p>
          <p className="display max-w-[16ch] text-[clamp(1.6rem,4vw,3.2rem)]">
            Tell us the problem. We&apos;ll design the system.
          </p>
        </div>
        <a
          href={siteConfig.cta.href}
          data-cursor="go"
          className="btn-editorial on-dark shrink-0 self-start text-paper md:self-auto"
        >
          <span>Start a project →</span>
        </a>
      </div>

      <div className="grid gap-12 border-b border-paper/15 py-16 md:grid-cols-4">
        <div>
          <p className="mono-label mb-4 text-smoke">BRAND</p>
          <p className="display text-2xl">{siteConfig.wordmark}</p>
          <p className="lead mt-4 max-w-[26ch] text-sm text-smoke">
            {siteConfig.tagline}
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="mono-label mb-4 text-smoke">MENU</p>
          <ul className="space-y-2.5">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm font-medium text-paper link-sweep">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mono-label mb-4 text-smoke">SERVICES</p>
          <ul className="space-y-2.5">
            {services.map((service) => (
              <li key={service.id}>
                <a href="#services" className="text-sm font-medium text-paper link-sweep">
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mono-label mb-4 text-smoke">CONTACT</p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-sm font-medium text-paper link-sweep"
          >
            {siteConfig.email}
          </a>
          <p className="mt-4 text-sm text-smoke">{siteConfig.location}</p>
          <ul className="mt-6 space-y-2.5">
            {siteConfig.social.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-paper link-sweep"
                >
                  {social.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/*
        Same platforms as the band under the hero, and labelled the same
        way on purpose: tools we work with, not customers. See the note
        above `integrations` in lib/data.ts before rewording this.
      */}
      <div className="flex flex-col gap-5 border-b border-paper/15 py-10 md:flex-row md:items-center md:gap-12">
        <p className="mono-label shrink-0 text-smoke">BUILT ON / CONNECTED TO</p>
        <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
          {integrations.map((item) => (
            <li
              key={item.name}
              className="text-sm font-medium text-paper/45 transition-colors duration-300 hover:text-paper/80"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      <p
        aria-hidden="true"
        className="display mt-16 text-center text-[clamp(2.2rem,9vw,8rem)] text-paper/90"
      >
        BUILT FOR
        <br />
        WHAT&apos;S <span className="text-signal">NEXT.</span>
      </p>

      <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-6 md:flex-row md:items-center">
        <p className="text-xs text-smoke">
          © {year} {siteConfig.name}. All rights reserved. Third-party names
          and marks are the property of their respective owners.
        </p>
        <p className="mono-label text-smoke">SYSTEM_ONLINE / {year}</p>
      </div>
    </footer>
  );
}
