"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const LABELS: Record<string, string> = {
  view: "VIEW",
  go: "GO",
  explore: "EXPLORE",
};

/**
 * Custom cursor (fine pointers only). Elements opt in via
 * `data-cursor="view" | "go" | "explore"`. Purely decorative —
 * hidden from assistive tech and inert to pointer events.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<string>("");

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    if (!dot) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setVariant(target?.dataset.cursor ?? "");
    };

    gsap.set(dot, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={dotRef} className="cursor-dot" data-variant={variant} aria-hidden="true">
      <span>{LABELS[variant] ?? ""}</span>
    </div>
  );
}
