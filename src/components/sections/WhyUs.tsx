"use client";

import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

const PAIRS = [
  { less: "MANUAL WORK", more: "AUTOMATION" },
  { less: "FRICTION", more: "SPEED" },
  { less: "NOISE", more: "RESULTS" },
];

/** Less / More statements, alternating alignment, scroll-animated. */
export default function WhyUs() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;
    el.querySelectorAll("[data-pair]").forEach((pair) => {
      const less = pair.querySelector("[data-less]");
      const more = pair.querySelector("[data-more]");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pair, start: "top 78%" },
      });
      tl.fromTo(less, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }).fromTo(
        more,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        "-=0.55"
      );
    });
  });

  return (
    <section
      ref={scope}
      aria-label="Why work with us"
      className="overflow-hidden bg-ink px-6 py-28 text-paper md:px-12 md:py-40"
    >
      <p className="mono-label mb-16 text-smoke">007 / WHY US</p>
      <div className="flex flex-col gap-16 md:gap-24">
        {PAIRS.map((pair) => (
          <div key={pair.less} data-pair className="grid items-baseline gap-2 md:grid-cols-2">
            <p data-less className="display text-[clamp(1.8rem,4.6vw,4.2rem)] text-smoke">
              LESS
              <br />
              {pair.less}.
            </p>
            <p data-more className="display text-right text-[clamp(1.8rem,4.6vw,4.2rem)]">
              MORE
              <br />
              <span className="text-signal">{pair.more}.</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
