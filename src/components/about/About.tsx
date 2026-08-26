"use client";

import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

/** Editorial about section on paper — short, confident copy. */
export default function About() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;
    gsap.fromTo(
      el.querySelectorAll("[data-about-reveal]"),
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 70%" },
      }
    );
    // Red bar draws across as the section enters.
    gsap.fromTo(
      "[data-about-bar]",
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: true },
      }
    );
  });

  return (
    <section
      ref={scope}
      id="about"
      aria-label="About us"
      className="bg-paper px-6 py-28 text-ink md:px-12 md:py-40"
    >
      <p className="mono-label mb-12 text-smoke-deep">006 / ABOUT</p>
      <div className="grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
        <h2 data-about-reveal className="display text-[clamp(2.1rem,5.8vw,5.2rem)]">
          WE DON&apos;T
          <br />
          JUST BUILD
          <br />
          WEBSITES.
          <span
            data-about-bar
            aria-hidden="true"
            className="my-6 block h-[6px] w-full origin-left bg-signal md:my-8"
          />
          WE BUILD
          <br />
          <span className="text-signal">SYSTEMS.</span>
        </h2>
        <div data-about-reveal className="self-end">
          <p className="lead max-w-[44ch] text-base text-ink/80 md:text-lg">
            We combine AI, design, engineering, automation, and digital strategy
            to create systems that help businesses operate, communicate, and grow.
          </p>
          <p className="display-light mt-8 text-lg leading-snug text-ink">
            No decks. No jargon. Working systems.
          </p>
        </div>
      </div>
    </section>
  );
}
