"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy for the navbar's active indicator.
 *
 * Uses IntersectionObserver with a narrow horizontal band near the
 * upper-middle of the viewport, so a section counts as "current" once
 * it has genuinely taken over the screen. Cheap: no scroll listener,
 * no per-frame layout reads.
 *
 * @param hrefs hash links (e.g. "#about") in document order
 * @returns the href of the section currently in view
 */
export function useActiveSection(hrefs: readonly string[]): string {
  const [active, setActive] = useState(hrefs[0] ?? "");

  useEffect(() => {
    const sections = hrefs
      .map((href) => document.querySelector<HTMLElement>(href))
      .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    const visible = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRatio);
          else visible.delete(entry.target);
        });

        // Pick the visible section highest up the document.
        let top: HTMLElement | null = null;
        sections.forEach((section) => {
          if (visible.has(section) && !top) top = section;
        });

        if (top) setActive(`#${(top as HTMLElement).id}`);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [hrefs]);

  return active;
}
