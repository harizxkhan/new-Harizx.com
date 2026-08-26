"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";
import { useActiveSection } from "@/hooks/useActiveSection";
import { gsap, EASE } from "@/lib/gsap";

const NAV_HREFS = siteConfig.nav.map((item) => item.href);

function ArrowRight() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Floating glass pill navigation.
 *
 * Desktop: centered capsule — wordmark left, links centre, CTA right.
 * It tightens and darkens once the user scrolls past the hero.
 * Mobile: the same capsule reduced to wordmark + menu button, opening
 * a full-screen overlay with numbered items and the CTA last.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(NAV_HREFS);

  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Condense the pill after the first stretch of scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Overlay entrance: background, then items, then CTA.
  useEffect(() => {
    if (!open || !overlayRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scope = overlayRef.current;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-menu-item], [data-menu-cta]", { opacity: 1, yPercent: 0 });
        return;
      }
      const tl = gsap.timeline();
      tl.fromTo(
        scope,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      )
        .fromTo(
          "[data-menu-item]",
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: EASE.expo },
          "-=0.1"
        )
        .fromTo(
          "[data-menu-cta]",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: EASE.out },
          "-=0.25"
        );
    }, scope);

    return () => ctx.revert();
  }, [open]);

  // Escape closes, scroll locks, focus returns to the trigger.
  useEffect(() => {
    if (!open) return;
    // Captured now so cleanup restores focus to the same button.
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-5 z-[100] px-4 md:top-6">
        <nav
          aria-label="Main navigation"
          className="pointer-events-auto relative mx-auto flex w-full max-w-[1050px] justify-center"
        >
          <div
            data-scrolled={scrolled}
            className="nav-pill relative w-full justify-between md:w-auto"
          >
            {/* Wordmark */}
            <a
              href="#top"
              className="display shrink-0 px-4 text-[0.9375rem] tracking-tight text-paper"
              aria-label={`${siteConfig.name} — back to top`}
            >
              {siteConfig.wordmark}
            </a>

            {/* Links (desktop) */}
            <ul className="hidden items-center lg:flex">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="nav-link block"
                    aria-current={active === item.href ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA (desktop) */}
            <a
              href={siteConfig.cta.href}
              data-cursor="go"
              className="nav-cta ml-2 hidden shrink-0 lg:inline-flex"
            >
              {siteConfig.cta.label}
              <ArrowRight />
            </a>

            {/* Menu trigger (tablet + mobile) */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              className="nav-burger lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
            >
              <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
                <path
                  d="M0 1h16M0 6h16M0 11h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          id="mobile-menu"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[140] flex flex-col justify-between bg-ink px-6 py-7"
        >
          <div className="flex items-center justify-between">
            <span className="display text-[0.9375rem] tracking-tight text-smoke">
              {siteConfig.wordmark}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="nav-burger"
              aria-label="Close menu"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            {siteConfig.nav.map((item, i) => (
              <div key={item.href} className="overflow-hidden">
                <a
                  data-menu-item
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.href ? "true" : undefined}
                  className="display flex items-baseline gap-4 pb-1 text-[clamp(2.4rem,11vw,4.5rem)] text-paper transition-colors hover:text-signal aria-[current=true]:text-signal"
                >
                  <span className="mono-label text-signal">0{i + 1}</span>
                  {item.label}
                </a>
              </div>
            ))}
          </nav>

          <a
            data-menu-cta
            href={siteConfig.cta.href}
            onClick={() => setOpen(false)}
            className="nav-cta h-14 w-full justify-center text-[0.9375rem]"
          >
            {siteConfig.cta.label}
            <ArrowRight />
          </a>
        </div>
      )}
    </>
  );
}
