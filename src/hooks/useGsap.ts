"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scoped GSAP setup with automatic cleanup.
 * The callback receives the scope element; all selectors inside
 * gsap.context are scoped to it. Reduced-motion users get a
 * `reduced` flag so animations can be skipped or simplified.
 */
export function useGsap<T extends HTMLElement>(
  callback: (scope: T, reduced: boolean) => void,
  deps: unknown[] = []
) {
  const scopeRef = useRef<T>(null);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => callback(scope, reduced), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
