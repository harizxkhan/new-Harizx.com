"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
}

/** Signature easing curves for the site's motion language. */
export const EASE = {
  out: "power3.out",
  inOut: "power4.inOut",
  expo: "expo.out",
} as const;

export { gsap, ScrollTrigger };
