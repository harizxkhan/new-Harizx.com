"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { siteConfig } from "@/lib/config";
import { gsap } from "@/lib/gsap";
import { markSiteReady } from "@/lib/ready";
import { playIdentSound } from "@/lib/identSound";

/**
 * HARIZX cinematic opening ident.
 *
 * Sequence: black → red core ignites → light rays emit → an abstract
 * H/X mark draws itself → camera pushes through it → wordmark →
 * tagline → dissolve straight into the hero.
 *
 * Built from SVG geometry and GSAP transforms only — no video, no
 * canvas, no extra dependency. The real page renders underneath the
 * whole time, so the ident delays nothing but the first look at it.
 *
 * It is an enhancement, never a dependency: any failure, a repeat
 * visit, or a reduced-motion preference reveals the site immediately.
 */

/** Ray count is fixed so server and client markup always agree. */
const RAY_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

const PARTICLES = [
  { cx: -58, cy: -34, r: 1.4 },
  { cx: 47, cy: -52, r: 1 },
  { cx: -38, cy: 55, r: 1.2 },
  { cx: 62, cy: 38, r: 1 },
  { cx: -70, cy: 8, r: 0.9 },
  { cx: 30, cy: 68, r: 1.1 },
];

/**
 * Layout effect on the client, plain effect on the server. Lets the
 * repeat-visit check run before the browser paints, so a returning
 * visitor never sees a frame of the overlay.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function BrandIdent() {
  const [active, setActive] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const finishedRef = useRef(false);

  /** Ends the ident exactly once, however it was reached. */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem("harizx-ident", "1");
    } catch {
      /* Private mode: the ident simply plays again next load. */
    }
    stopSoundRef.current?.();
    stopSoundRef.current = null;
    timelineRef.current?.kill();
    setActive(false);
    markSiteReady();
  }, []);

  useIsomorphicLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("harizx-ident") === "1";
    } catch {
      /* Storage blocked — treat as a first visit. */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Repeat visit or reduced motion: straight to the site, no frame
    // of overlay, no animation to unwind.
    if (seen || reduced) {
      finishedRef.current = true;
      setActive(false);
      markSiteReady();
      return;
    }

    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    stopSoundRef.current = playIdentSound();

    // Review aid, development only: `?ident=hold` starts the sequence
    // paused so each beat can be scrubbed via `window.__ident`.
    const held =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).get("ident") === "hold";

    // Failsafe: if the timeline never reports completion — a thrown
    // error, a suspended tab, a browser that throttles rAF — reveal the
    // site anyway. The ident must never be able to trap a visitor
    // behind a black overlay.
    const watchdog = held ? 0 : window.setTimeout(finish, 6000);

    let ctx: gsap.Context | null = null;
    try {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ onComplete: finish });
        timelineRef.current = tl;

        if (process.env.NODE_ENV === "development") {
          (window as unknown as { __ident?: gsap.core.Timeline }).__ident = tl;
          if (held) tl.pause(0);
        }

        gsap.set("[data-ident-mark] [data-draw]", {
          strokeDasharray: 1,
          strokeDashoffset: 1,
        });
        gsap.set("[data-ident-ray]", { scaleY: 0, transformOrigin: "0px 0px" });
        gsap.set("[data-ident-particle]", { opacity: 0 });
        gsap.set("[data-ident-core]", { scale: 0, transformOrigin: "center" });
        gsap.set("[data-ident-wordmark], [data-ident-tagline]", {
          opacity: 0,
          y: 14,
        });
        gsap.set("[data-ident-glow]", { opacity: 0, scale: 0.6 });

        // Phones animate half the rays; the rest stay dark. Fewer moving
        // parts without changing the markup between server and client.
        const rays = gsap.utils.toArray<SVGLineElement>("[data-ident-ray]");
        const activeRays = mobile ? rays.filter((_, i) => i % 2 === 0) : rays;

        // 0.00–0.30 — the system powers on.
        tl.to("[data-ident-core]", {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        // 0.30–0.90 — light emits outward, particles settle in.
        tl.to(
          activeRays,
          {
            scaleY: 1,
            duration: 0.55,
            stagger: { each: 0.022, from: "random" },
            ease: "power3.out",
          },
          0.3
        ).to(
          "[data-ident-particle]",
          { opacity: 0.7, duration: 0.4, stagger: 0.04, ease: "none" },
          0.45
        );

        // 0.90–1.40 — the mark draws itself from that light.
        tl.to(
          "[data-ident-mark] [data-draw]",
          {
            strokeDashoffset: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.inOut",
          },
          0.9
        ).to(activeRays, { opacity: 0.25, duration: 0.4, ease: "none" }, 1.0);

        // 1.40–1.90 — camera push: through the mark, not at it.
        tl.to(
          "[data-ident-stage]",
          {
            scale: mobile ? 5 : 9,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
          },
          1.4
        );
        if (!mobile) {
          // Depth cue. Desktop only — animated blur is costly on phones.
          tl.fromTo(
            "[data-ident-stage]",
            { filter: "blur(0px)" },
            { filter: "blur(7px)", duration: 0.5, ease: "power2.in" },
            1.4
          );
        }

        // 1.90–2.25 — brand reveal out of the darkness.
        tl.to(
          "[data-ident-glow]",
          { opacity: 0.5, scale: 1, duration: 0.5, ease: "power2.out" },
          1.9
        ).to(
          "[data-ident-wordmark]",
          { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
          1.92
        );

        // 2.25–2.60 — the tagline lands.
        tl.to(
          "[data-ident-tagline]",
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
          2.25
        );

        // 2.60–3.00 — dissolve into the hero waiting underneath.
        tl.to(
          "[data-ident-wordmark], [data-ident-tagline]",
          { opacity: 0, scale: 0.96, duration: 0.32, ease: "power2.in" },
          2.6
        )
          .to("[data-ident-glow]", { opacity: 0, duration: 0.3 }, 2.6)
          .to(root, { opacity: 0, duration: 0.32, ease: "power2.inOut" }, 2.68);

        // Mobile keeps the same beats, compressed to ~1.9s.
        if (mobile) tl.timeScale(1.55);
      }, root);
    } catch (error) {
      // Animation failed to build — show the site rather than the ident.
      console.error("[ident] sequence failed, revealing site:", error);
      window.clearTimeout(watchdog);
      finish();
      return;
    }

    return () => {
      window.clearTimeout(watchdog);
      ctx?.revert();
      stopSoundRef.current?.();
      stopSoundRef.current = null;
    };
  }, [finish]);

  // Escape skips, matching the mobile menu's behaviour. Scrolling is
  // held while the ident covers the page, so a visitor cannot end up
  // somewhere unexpected in a page they could not see.
  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, finish]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      // Decorative as a whole; the skip control below stays reachable.
      role="presentation"
      className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden bg-ink"
    >
      {/* Static grain — no animation, so it cannot flicker. */}
      <div className="ident-grain" aria-hidden="true" />

      {/* Stage: rays, particles, and the mark that forms from them */}
      <div
        data-ident-stage
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center will-change-transform"
      >
        <svg
          viewBox="-100 -100 200 200"
          className="h-[min(62vmin,420px)] w-[min(62vmin,420px)]"
          fill="none"
        >
          {/* Light rays emitting from the core */}
          <g>
            {RAY_ANGLES.map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <line
                  data-ident-ray
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-88"
                  stroke="var(--signal)"
                  strokeWidth="0.6"
                  strokeOpacity="0.55"
                />
              </g>
            ))}
          </g>

          {PARTICLES.map((p) => (
            <circle
              key={`${p.cx}-${p.cy}`}
              data-ident-particle
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="var(--paper)"
            />
          ))}

          {/*
            The HARIZX mark: two upright stems (H) crossed by two
            diagonals (X), meeting at a single red core. Plain geometry,
            so it draws cleanly at any size.
          */}
          <g data-ident-mark>
            <path
              data-draw
              pathLength={1}
              d="M -46 -60 L -46 60"
              stroke="var(--paper)"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <path
              data-draw
              pathLength={1}
              d="M 46 -60 L 46 60"
              stroke="var(--paper)"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <path
              data-draw
              pathLength={1}
              d="M -46 -60 L 46 60"
              stroke="var(--signal)"
              strokeWidth="2.4"
              strokeLinecap="square"
            />
            <path
              data-draw
              pathLength={1}
              d="M 46 -60 L -46 60"
              stroke="var(--signal)"
              strokeWidth="2.4"
              strokeLinecap="square"
            />
          </g>

          <circle data-ident-core cx="0" cy="0" r="3.4" fill="var(--signal)" />
        </svg>
      </div>

      {/* Brand reveal */}
      <div className="relative flex flex-col items-center px-6">
        <div
          data-ident-glow
          aria-hidden="true"
          className="pointer-events-none absolute h-[220px] w-[min(78vw,520px)] rounded-full bg-signal/25 blur-[70px]"
        />
        <p
          data-ident-wordmark
          className="display relative text-[clamp(2.6rem,11vw,6.5rem)] text-paper"
        >
          {siteConfig.wordmark}
        </p>
        <p
          data-ident-tagline
          className="mono-label relative mt-4 text-center text-smoke"
        >
          AI / AUTOMATION / WEB / APPS / SYSTEMS
        </p>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-xs font-medium uppercase tracking-[0.14em] text-smoke transition-colors duration-200 hover:text-paper focus-visible:text-paper"
      >
        Skip →
      </button>
    </div>
  );
}
