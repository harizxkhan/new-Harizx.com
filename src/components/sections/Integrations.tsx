"use client";

import { integrations } from "@/lib/data";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

/**
 * Integrations band, sitting directly under the hero where a trust
 * signal belongs.
 *
 * Wordmarks are set in the site's own typeface rather than reproduced
 * brand artwork — it keeps the strip editorial instead of a generic
 * logo wall, and avoids presenting third-party logos in a way that
 * could imply endorsement.
 *
 * The heading states plainly that these are platforms we build on, not
 * customers. Read the note above `integrations` in lib/data.ts before
 * changing that wording.
 */
export default function Integrations() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;
    gsap.fromTo(
      el.querySelectorAll("[data-integration]"),
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });

  return (
    <section
      ref={scope}
      aria-label="Platforms we build on"
      className="border-b border-paper/10 bg-ink px-6 py-14 text-paper md:px-12 md:py-16"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-14">
        <div className="max-w-[26ch] shrink-0">
          <p className="mono-label text-signal">BUILT ON / CONNECTED TO</p>
          <p className="lead mt-2 text-sm text-smoke">
            The platforms we build on and automate across — not a client
            list.
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-8 gap-y-5 md:gap-x-12">
          {integrations.map((item) => (
            <li key={item.name} data-integration>
              <span
                className="display block text-[clamp(1.05rem,2.1vw,1.6rem)] text-paper/55 transition-colors duration-300 hover:text-paper"
                title={item.use}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
