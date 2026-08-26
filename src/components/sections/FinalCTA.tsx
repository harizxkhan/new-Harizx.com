"use client";

import { useGsap } from "@/hooks/useGsap";
import { gsap, EASE } from "@/lib/gsap";

/**
 * Enormous closing CTA — black field, white type, a red element
 * sweeping across as the section pins into view.
 */
export default function FinalCTA() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    gsap.fromTo(
      "[data-cta-line]",
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1,
        stagger: 0.1,
        ease: EASE.expo,
        scrollTrigger: { trigger: el, start: "top 65%" },
      }
    );

    // Red band sweeps across behind the type on scroll.
    gsap.fromTo(
      "[data-cta-sweep]",
      { xPercent: -110 },
      {
        xPercent: 110,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });

  return (
    <section
      ref={scope}
      aria-label="Start a project"
      className="relative overflow-hidden bg-ink px-6 py-32 text-paper md:px-12 md:py-48"
    >
      <div
        data-cta-sweep
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-[22vh] w-full -translate-y-1/2 bg-signal opacity-90"
      />
      <div className="relative z-10">
        <p className="mono-label mb-10 text-smoke">009 / NEXT STEP</p>
        <h2 className="display text-[clamp(2.2rem,8vw,7.5rem)]">
          <span className="block overflow-hidden">
            <span data-cta-line className="block">HAVE A PROBLEM</span>
          </span>
          <span className="block overflow-hidden">
            <span data-cta-line className="block pl-[6vw]">WORTH</span>
          </span>
          <span className="block overflow-hidden">
            <span data-cta-line className="block">SOLVING?</span>
          </span>
        </h2>
        <div className="mt-14 flex flex-wrap items-center gap-8">
          <a href="#contact" data-cursor="go" className="btn-editorial on-dark text-paper">
            <span>Start a project →</span>
          </a>
          <p className="lead max-w-[30ch] font-medium text-smoke">
            You have the idea. We have the tools.
          </p>
        </div>
      </div>
    </section>
  );
}
