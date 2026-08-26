"use client";

import { useEffect, useRef } from "react";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Lazy, muted, looping background video.
 *
 * Deliberately conservative about when it loads at all — the asset is
 * multi-megabyte and purely decorative, so it is skipped entirely on
 * small screens, on data-saver connections, on slow networks, and for
 * reduced-motion users. When skipped, the artwork layered behind it
 * remains as the visual, so nothing appears broken.
 *
 * When it does load, it starts only near the viewport and pauses the
 * moment it leaves, so it never burns cycles off-screen.
 */
export default function VideoLoop({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;

    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    const frugal =
      connection?.saveData === true ||
      (connection?.effectiveType != null &&
        ["slow-2g", "2g", "3g"].includes(connection.effectiveType));

    if (reduced || small || frugal) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          // Autoplay can still be refused; the artwork behind covers it.
          void video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
}
