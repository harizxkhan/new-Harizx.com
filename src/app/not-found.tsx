import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Branded 404 that routes visitors back into the site. */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col justify-center bg-ink px-6 py-24 text-paper md:px-12">
      <p className="mono-label mb-6 text-signal">404 / NOT FOUND</p>
      <h1 className="display max-w-[14ch] text-[clamp(2.2rem,7vw,5.5rem)]">
        This page doesn&apos;t exist.
      </h1>
      <p className="lead mt-6 max-w-[46ch] text-smoke">
        The link is broken or the page moved. Everything we do lives on the
        home page.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <Link href="/" className="btn-editorial on-dark text-paper">
          <span>Back to home →</span>
        </Link>
        <Link href="/#contact" className="ui-label text-smoke link-sweep">
          Start a project
        </Link>
      </div>
    </main>
  );
}
