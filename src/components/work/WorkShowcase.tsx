"use client";

import { useState } from "react";
import { projects, type Project } from "@/lib/data";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealHeadline } from "@/lib/animations";
import VideoLoop from "@/components/ui/VideoLoop";

/** Abstract art-directed composition per project — no stock photos. */
function ProjectCanvas({ project }: { project: Project }) {
  const base =
    project.tone === "dark"
      ? "bg-ink text-paper"
      : project.tone === "light"
        ? "bg-bone text-ink"
        : "bg-signal text-paper";
  return (
    <div
      aria-hidden="true"
      data-project-canvas
      className={`relative aspect-[16/10] w-full overflow-hidden ${base}`}
    >
      {/* Layered geometry, unique per tone */}
      <div className="absolute inset-0 opacity-90">
        {project.tone === "dark" && (
          <svg viewBox="0 0 800 500" className="h-full w-full" fill="none" preserveAspectRatio="xMidYMid slice">
            <circle cx="600" cy="120" r="180" stroke="var(--paper)" strokeOpacity="0.3" />
            <circle cx="600" cy="120" r="120" stroke="var(--signal)" strokeWidth="2" />
            <line x1="0" y1="400" x2="800" y2="180" stroke="var(--paper)" strokeOpacity="0.4" />
            <rect x="80" y="300" width="220" height="140" stroke="var(--paper)" strokeOpacity="0.5" />
            <rect x="120" y="340" width="220" height="140" fill="var(--signal)" fillOpacity="0.9" />
          </svg>
        )}
        {project.tone === "light" && (
          <svg viewBox="0 0 800 500" className="h-full w-full" fill="none" preserveAspectRatio="xMidYMid slice">
            <rect x="60" y="60" width="300" height="380" fill="var(--ink)" />
            <rect x="300" y="140" width="360" height="8" fill="var(--signal)" />
            <rect x="300" y="180" width="280" height="8" fill="var(--ink)" />
            <rect x="300" y="220" width="320" height="8" fill="var(--ink)" />
            <circle cx="640" cy="380" r="70" stroke="var(--ink)" strokeWidth="2" />
            <circle cx="640" cy="380" r="8" fill="var(--signal)" />
          </svg>
        )}
        {project.tone === "red" && (
          <svg viewBox="0 0 800 500" className="h-full w-full" fill="none" preserveAspectRatio="xMidYMid slice">
            <rect x="100" y="80" width="600" height="340" stroke="var(--paper)" strokeWidth="2" />
            <path d="M100 420 L400 80 L700 420" stroke="var(--paper)" strokeOpacity="0.7" />
            <circle cx="400" cy="80" r="10" fill="var(--paper)" />
            <rect x="330" y="330" width="140" height="90" fill="var(--ink)" />
          </svg>
        )}
      </div>
      {project.video && (
        <VideoLoop
          src={project.video}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span className="display absolute bottom-4 right-6 text-[clamp(3rem,8vw,6rem)] opacity-20">
        {project.index}
      </span>
    </div>
  );
}

/**
 * Editorial work showcase. Each project occupies most of the viewport,
 * alternating alignment. Demo builds are labelled as such rather than
 * presented as client work. Click expands details inline.
 */
export default function WorkShowcase() {
  const [openId, setOpenId] = useState<string | null>(null);

  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    const heading = el.querySelector<HTMLElement>("[data-reveal-headline]");
    if (heading) revealHeadline(heading, { trigger: heading });

    el.querySelectorAll("[data-project]").forEach((item) => {
      const canvas = item.querySelector("[data-project-canvas]");
      gsap.fromTo(
        item,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 85%" },
        }
      );
      if (canvas) {
        gsap.fromTo(
          canvas,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    });
  });

  return (
    <section
      ref={scope}
      id="work"
      aria-label="Selected work"
      className="bg-ink px-6 py-28 text-paper md:px-12 md:py-40"
    >
      <div className="mb-16 md:mb-28">
        <p className="mono-label mb-6 text-smoke">005 / WORK</p>
        <h2 data-reveal-headline className="display text-[clamp(2.5rem,7.5vw,7rem)]">
          SELECTED
          <br />
          <span className="pl-[10vw]">WORK</span>
          <span className="text-signal">.</span>
        </h2>
        <div className="mt-8 max-w-[54ch]">
          <p className="mono-label mb-3 text-signal">DEMO BUILDS</p>
          <p className="lead text-smoke">
            These are systems we built in-house to prove the approach — not
            client work. Client case studies go up here as engagements close.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-24 md:gap-40">
        {projects.map((project, i) => {
          const open = openId === project.id;
          const alignRight = i % 2 === 1;
          return (
            <article
              key={project.id}
              data-project
              className={`w-full md:w-[72%] ${alignRight ? "md:ml-auto" : ""}`}
            >
              <button
                type="button"
                data-cursor="view"
                aria-expanded={open}
                aria-controls={`project-detail-${project.id}`}
                onClick={() => setOpenId(open ? null : project.id)}
                className="group block w-full text-left"
              >
                <div className="overflow-hidden">
                  <div className="transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-[1.03]">
                    <ProjectCanvas project={project} />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display text-[clamp(1.5rem,3.5vw,2.9rem)] transition-transform duration-500 group-hover:translate-x-3">
                    {project.title}
                  </h3>
                  <div className="mono-label flex flex-wrap items-center gap-x-4 gap-y-2 text-smoke">
                    {project.demo && (
                      <span className="border border-signal px-2 py-1 text-signal">
                        DEMO
                      </span>
                    )}
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>
                </div>

                <p className="lead mt-3 max-w-[58ch] text-sm text-smoke">
                  {project.description}
                </p>

                <span
                  aria-hidden="true"
                  className="ui-label mt-4 inline-flex items-center gap-2 text-paper/70 transition-colors duration-300 group-hover:text-signal"
                >
                  {open ? "Close project" : "View project"}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>

              <div
                id={`project-detail-${project.id}`}
                className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 py-5">
                    <ul className="flex flex-wrap gap-3">
                      <li className="mono-label border border-paper/25 px-3 py-2 text-smoke">
                        {project.status}
                      </li>
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border border-paper/25 px-3 py-1.5 text-sm font-medium text-paper/80"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <a href="#contact" data-cursor="go" className="ui-label text-signal link-sweep">
                      Build something like this →
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
