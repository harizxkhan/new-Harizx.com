"use client";

import { gsap, EASE } from "@/lib/gsap";

/**
 * Wraps each word of a heading in a masked span so it can be revealed
 * individually. Runs once per element (guarded by a data flag) and
 * preserves the original text for reduced-motion / no-JS readers.
 */
function splitIntoWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === "true") {
    return Array.from(el.querySelectorAll<HTMLElement>("[data-word-inner]"));
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent?.trim()) textNodes.push(node as Text);
  }

  const inners: HTMLElement[] = [];
  textNodes.forEach((textNode) => {
    const frag = document.createDocumentFragment();
    // Keep whitespace so line breaks and spacing survive the split.
    textNode.textContent!.split(/(\s+)/).forEach((chunk) => {
      if (!chunk) return;
      if (!chunk.trim()) {
        frag.appendChild(document.createTextNode(chunk));
        return;
      }
      const mask = document.createElement("span");
      mask.style.display = "inline-block";
      mask.style.overflow = "hidden";
      mask.style.verticalAlign = "top";
      const inner = document.createElement("span");
      inner.dataset.wordInner = "";
      inner.style.display = "inline-block";
      inner.textContent = chunk;
      mask.appendChild(inner);
      frag.appendChild(mask);
      inners.push(inner);
    });
    textNode.parentNode?.replaceChild(frag, textNode);
  });

  el.dataset.split = "true";
  return inners;
}

/**
 * Editorial headline reveal: words rise out of their mask while
 * tracking settles from loose to tight. Deliberately restrained —
 * no bounce, no glitch.
 */
export function revealHeadline(
  el: HTMLElement,
  options: { trigger?: Element; start?: string; delay?: number } = {}
) {
  const words = splitIntoWords(el);
  if (!words.length) return;

  gsap.set(el, { letterSpacing: "0.02em" });

  const tl = gsap.timeline({
    delay: options.delay ?? 0,
    scrollTrigger: options.trigger
      ? { trigger: options.trigger, start: options.start ?? "top 78%" }
      : undefined,
  });

  tl.fromTo(
    words,
    { yPercent: 108, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.055,
      ease: EASE.expo,
    }
  ).to(el, { letterSpacing: "-0.03em", duration: 1.1, ease: EASE.out }, 0);
}
