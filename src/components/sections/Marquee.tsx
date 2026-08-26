"use client";

import { useGsap } from "@/hooks/useGsap";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const WORDS = ["AI", "AUTOMATION", "WEB", "APPS", "CONTENT", "SYSTEMS", "MARKETING"];

/**
 * Velocity-reactive typographic marquee. Scroll direction flips the
 * travel direction; scroll speed momentarily accelerates it.
 */
export default function Marquee() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;
    const track = el.querySelector<HTMLElement>(".marquee-track");
    if (!track) return;

    const loop = gsap.to(track, {
      xPercent: -50,
      duration: 28,
      repeat: -1,
      ease: "none",
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const boost = gsap.utils.clamp(-4, 4, velocity / 400);
        gsap.to(loop, {
          timeScale: boost === 0 ? 1 : boost,
          duration: 0.4,
          overwrite: true,
          onComplete: () => {
            gsap.to(loop, { timeScale: velocity < 0 ? -1 : 1, duration: 1.2 });
          },
        });
      },
    });
  });

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {WORDS.map((word, i) => (
        <span key={`${key}-${i}`} className="flex items-center">
          <span className="display px-6 text-[clamp(2.4rem,6vw,5.5rem)] text-ink">{word}</span>
          <span className="h-3 w-3 rounded-full bg-signal" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <section
      ref={scope}
      aria-label="What we work on"
      className="overflow-hidden border-y border-ink/15 bg-paper py-6"
    >
      <div className="marquee-track">{row("a")}{row("b")}</div>
    </section>
  );
}
