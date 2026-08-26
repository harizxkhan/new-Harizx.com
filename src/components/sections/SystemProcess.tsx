"use client";

import { processSteps } from "@/lib/data";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealHeadline } from "@/lib/animations";

/**
 * "From idea to system" — the engineering process.
 * Desktop: pinned section, stages travel horizontally as you scroll,
 * connected by a progress line. Mobile / reduced motion: vertical list.
 */
export default function SystemProcess() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    const heading = el.querySelector<HTMLElement>("[data-reveal-headline]");
    if (heading) revealHeadline(heading, { trigger: heading, start: "top 85%" });

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const track = el.querySelector<HTMLElement>("[data-process-track]");
      const progress = el.querySelector<HTMLElement>("[data-process-progress]");
      if (!track) return;

      const distance = () => track.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { x: () => -distance(), ease: "none" });
      if (progress) {
        tl.to(progress, { scaleX: 1, ease: "none" }, 0);
      }
    });

    mm.add("(max-width: 767px)", () => {
      el.querySelectorAll("[data-process-step]").forEach((step) => {
        gsap.fromTo(
          step,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            scrollTrigger: { trigger: step, start: "top 88%" },
          }
        );
      });
    });
  });

  return (
    <section
      ref={scope}
      aria-label="Our process"
      className="relative overflow-hidden bg-bone text-ink"
    >
      <div className="px-6 pt-28 md:px-12 md:pt-32">
        <p className="mono-label mb-6 text-smoke-deep">004 / THE SYSTEM</p>
        <h2 data-reveal-headline className="display text-[clamp(2.5rem,7.5vw,7rem)]">
          FROM IDEA
          <br />
          TO <span className="text-signal">SYSTEM.</span>
        </h2>
      </div>

      {/* Progress line (desktop) */}
      <div aria-hidden="true" className="relative mx-6 mt-14 hidden h-px bg-ink/20 md:mx-12 md:block">
        <div
          data-process-progress
          className="absolute inset-0 origin-left scale-x-0 bg-signal"
        />
      </div>

      <div
        data-process-track
        className="flex flex-col gap-12 px-6 py-16 md:flex-row md:flex-nowrap md:gap-0 md:px-12 md:py-20"
      >
        {processSteps.map((step, i) => (
          <article
            key={step.index}
            data-process-step
            className="relative shrink-0 md:w-[34vw] md:min-w-[320px] md:pr-16"
          >
            <span
              aria-hidden="true"
              className="display block text-[clamp(3.5rem,9vw,8rem)] leading-none text-ink/10"
            >
              {step.index}
            </span>
            <h3 className="display -mt-5 text-[clamp(1.7rem,3.2vw,2.8rem)] uppercase md:-mt-8">
              {step.title}
              {i === processSteps.length - 1 && <span className="text-signal">.</span>}
            </h3>
            <p className="lead mt-4 max-w-[34ch] text-[0.9375rem] text-ink/70">
              {step.detail}
            </p>
            <span
              aria-hidden="true"
              className="absolute right-8 top-1/2 hidden text-signal-deep md:block"
            >
              →
            </span>
          </article>
        ))}
        {/* End cap so the last card isn't glued to the edge */}
        <div aria-hidden="true" className="hidden shrink-0 md:block md:w-[12vw]" />
      </div>
    </section>
  );
}
