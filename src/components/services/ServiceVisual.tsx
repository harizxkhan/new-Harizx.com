"use client";

import type { Service } from "@/lib/data";

/**
 * Abstract CSS/SVG visual per service — no stock imagery.
 * Purely decorative; hidden from assistive tech.
 */
export default function ServiceVisual({ type }: { type: Service["visual"] }) {
  return (
    <div aria-hidden="true" className="h-40 w-full max-w-[280px] md:h-48">
      {type === "network" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <line x1="40" y1="40" x2="140" y2="95" stroke="var(--smoke)" />
          <line x1="240" y1="30" x2="140" y2="95" stroke="var(--smoke)" />
          <line x1="60" y1="160" x2="140" y2="95" stroke="var(--smoke)" />
          <line x1="230" y1="150" x2="140" y2="95" stroke="var(--signal)" strokeWidth="2" />
          <circle cx="40" cy="40" r="8" fill="var(--paper)" />
          <circle cx="240" cy="30" r="6" fill="var(--paper)" />
          <circle cx="60" cy="160" r="6" fill="var(--paper)" />
          <circle cx="230" cy="150" r="8" fill="var(--signal)" />
          <circle cx="140" cy="95" r="14" stroke="var(--paper)" strokeWidth="2" />
        </svg>
      )}
      {type === "browser" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <rect x="20" y="20" width="240" height="150" stroke="var(--paper)" />
          <line x1="20" y1="48" x2="260" y2="48" stroke="var(--paper)" />
          <circle cx="36" cy="34" r="4" fill="var(--signal)" />
          <circle cx="52" cy="34" r="4" fill="var(--smoke)" />
          <rect x="40" y="70" width="120" height="14" fill="var(--paper)" />
          <rect x="40" y="96" width="200" height="6" fill="var(--smoke)" />
          <rect x="40" y="112" width="160" height="6" fill="var(--smoke)" />
          <rect x="40" y="136" width="70" height="20" fill="var(--signal)" />
        </svg>
      )}
      {type === "panels" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <rect x="30" y="40" width="130" height="120" stroke="var(--smoke)" />
          <rect x="70" y="25" width="130" height="120" stroke="var(--paper)" />
          <rect x="110" y="55" width="130" height="120" fill="var(--ink)" stroke="var(--signal)" strokeWidth="2" />
          <rect x="126" y="75" width="60" height="8" fill="var(--paper)" />
          <rect x="126" y="95" width="98" height="5" fill="var(--smoke)" />
          <rect x="126" y="110" width="80" height="5" fill="var(--smoke)" />
        </svg>
      )}
      {type === "frames" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <rect x="20" y="30" width="80" height="130" stroke="var(--smoke)" />
          <rect x="110" y="30" width="80" height="130" stroke="var(--paper)" />
          <rect x="200" y="30" width="60" height="130" fill="var(--signal)" />
          <path d="M130 120 L150 80 L170 120 Z" fill="var(--paper)" />
          <circle cx="60" cy="80" r="18" stroke="var(--paper)" />
        </svg>
      )}
      {type === "metrics" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <rect x="30" y="120" width="30" height="50" fill="var(--smoke)" />
          <rect x="75" y="90" width="30" height="80" fill="var(--paper)" />
          <rect x="120" y="60" width="30" height="110" fill="var(--paper)" />
          <rect x="165" y="30" width="30" height="140" fill="var(--signal)" />
          <path d="M30 100 L90 70 L150 45 L230 20" stroke="var(--paper)" strokeDasharray="4 6" />
          <circle cx="230" cy="20" r="5" fill="var(--signal)" />
        </svg>
      )}
      {type === "blueprint" && (
        <svg viewBox="0 0 280 190" className="h-full w-full" fill="none">
          <rect x="20" y="20" width="240" height="150" stroke="var(--smoke)" strokeDasharray="3 6" />
          <circle cx="90" cy="95" r="40" stroke="var(--paper)" />
          <rect x="170" y="55" width="80" height="80" stroke="var(--paper)" />
          <line x1="130" y1="95" x2="170" y2="95" stroke="var(--signal)" strokeWidth="2" />
          <circle cx="90" cy="95" r="4" fill="var(--signal)" />
          <circle cx="210" cy="95" r="4" fill="var(--signal)" />
        </svg>
      )}
    </div>
  );
}
