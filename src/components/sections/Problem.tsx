"use client";

import { Fragment } from "react";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

const LINES_A = ["YOUR BUSINESS", "DOESN'T NEED", "MORE TOOLS."];
const LINES_B = ["IT NEEDS", "A BETTER", "SYSTEM."];

/**
 * Editorial problem statement on paper background.
 * Words brighten progressively as the visitor scrolls through.
 */
export default function Problem() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    const words = el.querySelectorAll("[data-word]");
    if (reduced) {
      gsap.set(words, { opacity: 1 });
      return;
    }
    gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          end: "bottom 65%",
          scrub: true,
        },
      }
    );
  });

  const renderLines = (lines: string[], accentLast = false) =>
    lines.map((line, li) => (
      <span key={line} className="block">
        {line.split(" ").map((word, wi) => (
          // The literal space between spans keeps the text readable to
          // screen readers and copy/paste — margins alone would not.
          <Fragment key={`${li}-${wi}`}>
            <span
              data-word
              className={
                accentLast && li === lines.length - 1
                  ? "inline-block text-signal"
                  : "inline-block"
              }
            >
              {word}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    ));

  return (
    <section
      ref={scope}
      aria-label="The problem we solve"
      className="relative bg-paper px-6 py-28 text-ink md:px-12 md:py-40"
    >
      <p className="mono-label mb-12 text-smoke-deep">002 / THE PROBLEM</p>
      <h2 className="display max-w-[13ch] text-[clamp(2.2rem,7vw,6.5rem)]">
        {renderLines(LINES_A)}
      </h2>
      <h2 className="display ml-auto mt-16 max-w-[10ch] text-right text-[clamp(2.2rem,7vw,6.5rem)] md:mt-24">
        {renderLines(LINES_B, true)}
      </h2>
      {/* Off-grid technical detail */}
      <p aria-hidden="true" className="mono-label absolute bottom-10 left-6 text-smoke-deep md:left-12">
        FIX: SYSTEM &gt; TOOLS
      </p>
    </section>
  );
}
