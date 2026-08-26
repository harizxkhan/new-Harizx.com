"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/config";

/**
 * Route-level error boundary. Shows a branded recovery screen instead
 * of a stack trace, and gives the visitor a way forward.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col justify-center bg-ink px-6 py-24 text-paper md:px-12">
      <p className="mono-label mb-6 text-signal">ERROR / SYSTEM INTERRUPTED</p>
      <h1 className="display max-w-[16ch] text-[clamp(2.2rem,7vw,5.5rem)]">
        Something broke on our end.
      </h1>
      <p className="lead mt-6 max-w-[46ch] text-smoke">
        That&apos;s our fault, not yours. Try again — and if it keeps
        happening, email us and we&apos;ll sort it out.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={reset}
          className="btn-editorial on-dark text-paper"
        >
          <span>Try again →</span>
        </button>
        <a
          href={`mailto:${siteConfig.email}`}
          className="ui-label text-smoke link-sweep"
        >
          {siteConfig.email}
        </a>
      </div>
    </main>
  );
}
