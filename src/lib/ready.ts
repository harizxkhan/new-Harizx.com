"use client";

/** Tiny pub/sub so the hero intro waits for the preloader to finish. */
let ready = false;
const listeners = new Set<() => void>();

export function markSiteReady() {
  ready = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onSiteReady(cb: () => void): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}
