"use client";

/**
 * ── AUDIO INTEGRATION POINT ─────────────────────────────────────────
 * The ident's brand sound. Intentionally disabled until a real file
 * exists: pointing at a missing asset would produce a 404 and a
 * console error on every first visit, and the ident must never be a
 * source of noise.
 *
 * To enable:
 *   1. Drop an optimised file at `public/media/harizx-ident.mp3`
 *      (target < 40 KB, mono, ~0.8s). Suggested shape, to sync with
 *      the wordmark reveal at ~1.9s: low sub-bass swell → digital
 *      rise → short impact → clean high tone.
 *   2. Set IDENT_SOUND_SRC to "/media/harizx-ident.mp3".
 *
 * Autoplay policy: browsers block sound before a user gesture on a
 * first visit, so playback is attempted and allowed to fail silently.
 * The ident never waits on audio and never blocks on it.
 * ─────────────────────────────────────────────────────────────────────
 */
const IDENT_SOUND_SRC: string | null = null;

/** How far into the ident the sound should start, in seconds. */
const SOUND_OFFSET_MS = 1600;

/**
 * Schedules the brand sound. Returns a cleanup that cancels playback
 * if the ident is skipped or unmounted first.
 */
export function playIdentSound(): () => void {
  if (!IDENT_SOUND_SRC) return () => {};

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  let audio: HTMLAudioElement | null = null;

  const timer = window.setTimeout(() => {
    try {
      audio = new Audio(IDENT_SOUND_SRC);
      audio.volume = 0.5;
      // Rejected by autoplay policy on a cold visit — that is expected
      // and must stay silent rather than surfacing as an error.
      void audio.play().catch(() => {});
    } catch {
      /* Audio unsupported; the ident continues unaffected. */
    }
  }, SOUND_OFFSET_MS);

  return () => {
    window.clearTimeout(timer);
    if (audio) {
      audio.pause();
      audio = null;
    }
  };
}
