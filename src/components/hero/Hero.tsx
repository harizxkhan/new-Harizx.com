"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/config";
import { gsap, EASE } from "@/lib/gsap";
import { useGsap } from "@/hooks/useGsap";
import { onSiteReady } from "@/lib/ready";

/**
 * Full-viewport hero (100svh, so iOS URL-bar changes don't clip it):
 * oversized stacked typography, an abstract "system" SVG
 * entering from off-frame, technical metadata, and subtle mouse parallax.
 */
export default function Hero() {
  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    /*
     * Resolved to real elements up front, on purpose. The intro is
     * deferred until the ident signals ready, and by the time that
     * callback fires GSAP has already exited this context — so a
     * string selector inside it would resolve against nothing and the
     * hero would stay hidden. Element references have no such
     * dependency on when they are used.
     */
    const lines = el.querySelectorAll("[data-hero-line]");
    const type = el.querySelector("[data-hero-type]");
    const visual = el.querySelector("[data-hero-visual]");
    const meta = el.querySelectorAll("[data-hero-meta]");
    const cta = el.querySelector("[data-hero-cta]");

    gsap.set(lines, { yPercent: 110 });
    gsap.set(meta, { opacity: 0, y: 12 });
    gsap.set(visual, { xPercent: 40, opacity: 0, rotate: 20 });
    gsap.set(cta, { opacity: 0, y: 20 });

    // Tracking settles from loose to tight as the lines rise — the
    // detail that makes the reveal read as editorial rather than generic.
    gsap.set(type, { letterSpacing: "0.01em" });

    const off = onSiteReady(() => {
      const tl = gsap.timeline();
      tl.to(lines, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: EASE.expo,
      })
        .to(type, { letterSpacing: "-0.03em", duration: 1.4, ease: EASE.out }, 0)
        .to(
          visual,
          { xPercent: 0, opacity: 1, rotate: 0, duration: 1.4, ease: EASE.expo },
          "-=0.8"
        )
        .to(meta, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.9")
        .to(cta, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");
    });

    // Slow continuous rotation of the system graphic.
    gsap.to("[data-hero-orbit]", {
      rotate: 360,
      duration: 60,
      repeat: -1,
      ease: "none",
    });

    // Hero recedes as you scroll away — the next section slides over it.
    gsap.to("[data-hero-inner]", {
      yPercent: -12,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return off;
  });

  // Subtle mouse parallax (fine pointers only).
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const visual = el.querySelector("[data-hero-visual]");
    const type = el.querySelector("[data-hero-type]");
    if (!visual || !type) return;

    const vx = gsap.quickTo(visual, "x", { duration: 0.8, ease: "power3.out" });
    const vy = gsap.quickTo(visual, "y", { duration: 0.8, ease: "power3.out" });
    const tx = gsap.quickTo(type, "x", { duration: 1.2, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      vx(nx * -30);
      vy(ny * -20);
      tx(nx * 10);
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => el.removeEventListener("mousemove", onMove);
  }, [scope]);

  return (
    <section
      ref={scope}
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink px-6 pb-8 pt-32 md:px-12 md:pt-36"
    >
      <div data-hero-inner className="flex flex-1 flex-col justify-between">
        {/* Top metadata row */}
        <div className="flex items-start justify-between">
          <p data-hero-meta className="mono-label text-smoke">
            SYS_001 — DIGITAL SYSTEMS STUDIO
          </p>
          <p data-hero-meta className="mono-label hidden text-smoke md:block">
            EST. 2026 / {siteConfig.location.toUpperCase()}
          </p>
        </div>

        {/* Abstract rotating system graphic */}
        <div
          data-hero-visual
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10%] top-1/2 w-[70vw] max-w-[720px] -translate-y-1/2 opacity-80 md:right-[-4%] md:w-[44vw]"
        >
          <svg viewBox="0 0 600 600" className="w-full" fill="none">
            <g data-hero-orbit style={{ transformOrigin: "300px 300px" }}>
              <circle cx="300" cy="300" r="280" stroke="var(--paper)" strokeOpacity="0.15" />
              <circle cx="300" cy="300" r="210" stroke="var(--paper)" strokeOpacity="0.25" strokeDasharray="4 10" />
              <circle cx="300" cy="300" r="140" stroke="var(--paper)" strokeOpacity="0.35" />
              <circle cx="300" cy="20" r="6" fill="var(--signal)" />
              <circle cx="510" cy="300" r="4" fill="var(--paper)" />
              <circle cx="160" cy="300" r="4" fill="var(--paper)" />
              <path d="M300 160 L440 300 L300 440 L160 300 Z" stroke="var(--paper)" strokeOpacity="0.4" />
              <line x1="300" y1="20" x2="300" y2="580" stroke="var(--paper)" strokeOpacity="0.1" />
              <line x1="20" y1="300" x2="580" y2="300" stroke="var(--paper)" strokeOpacity="0.1" />
            </g>
            <circle cx="300" cy="300" r="10" fill="var(--signal)" />
          </svg>
        </div>

        {/* Giant typography */}
        <h1 data-hero-type className="display relative z-10 mt-6 text-[clamp(3.9rem,10.5vw,10rem)] text-paper">
          <span className="block overflow-hidden">
            <span data-hero-line className="block">WE BUILD</span>
          </span>
          <span className="block overflow-hidden">
            <span data-hero-line className="block pl-[6vw] text-bone">WHAT</span>
          </span>
          <span className="block overflow-hidden">
            <span data-hero-line className="block pl-[12vw]">OTHERS</span>
          </span>
          <span className="block overflow-hidden">
            <span data-hero-line className="block text-signal">CAN&apos;T.</span>
          </span>
        </h1>

        {/* Bottom row: tagline + CTAs */}
        <div className="relative z-10 mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-hero-meta className="max-w-[46ch]">
            <p className="mono-label text-smoke">
              AI AUTOMATION / WEB / APPS / CONTENT / MARKETING
            </p>
            <p className="lead mt-3 text-paper/85">{siteConfig.intro}</p>
          </div>
          <div data-hero-cta className="flex flex-wrap items-center gap-5">
            <a href="#contact" data-cursor="go" className="btn-editorial on-dark text-paper">
              <span>Start a project →</span>
            </a>
            <a
              href="#work"
              data-cursor="view"
              className="ui-label group inline-flex items-center gap-2 self-center text-smoke transition-colors duration-300 hover:text-paper"
            >
              Explore our work
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Red accent line at the very bottom */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-full bg-signal" />
    </section>
  );
}
