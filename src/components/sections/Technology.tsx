"use client";

import { technologies } from "@/lib/data";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

/**
 * Capabilities as moving technical elements — not fake partner logos.
 * Two rows drift in opposite directions on scroll.
 */
export default function Technology() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;
    gsap.fromTo(
      "[data-tech-row='a']",
      { x: 60 },
      {
        x: -60,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
    gsap.fromTo(
      "[data-tech-row='b']",
      { x: -60 },
      {
        x: 60,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });

  const half = Math.ceil(technologies.length / 2);

  return (
    <section
      ref={scope}
      aria-label="Our capabilities"
      className="overflow-hidden border-y border-ink/15 bg-bone px-6 py-20 text-ink md:px-12 md:py-28"
    >
      <p className="mono-label mb-10 text-smoke-deep">008 / STACK</p>
      <ul data-tech-row="a" className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {technologies.slice(0, half).map((tech) => (
          <li key={tech} className="flex items-center gap-8">
            <span className="display text-[clamp(1.7rem,4vw,3.6rem)]">{tech}</span>
            <span aria-hidden="true" className="h-2 w-2 bg-signal" />
          </li>
        ))}
      </ul>
      <ul data-tech-row="b" className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 md:justify-end">
        {technologies.slice(half).map((tech) => (
          <li key={tech} className="flex items-center gap-8">
            <span className="display text-[clamp(1.7rem,4vw,3.6rem)] text-ink/40">{tech}</span>
            <span aria-hidden="true" className="h-2 w-2 bg-ink" />
          </li>
        ))}
      </ul>
      <div className="mt-12 max-w-[50ch]">
        <p className="mono-label mb-3 text-ink">BUILT FOR RESULTS</p>
        <p className="lead text-smoke-deep">
          We only list what we actually work with — no badge wall, no fake
          partnerships.
        </p>
      </div>
    </section>
  );
}
