"use client";

import { useState } from "react";
import { services } from "@/lib/data";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealHeadline } from "@/lib/animations";
import ServiceVisual from "./ServiceVisual";

/**
 * Services as a sequence of expanding editorial rows.
 * Desktop: hover opens a row. Mobile / keyboard: tap or Enter toggles.
 * Expansion uses the CSS grid 0fr→1fr technique (no layout thrash).
 */
export default function Services() {
  const [openId, setOpenId] = useState<string | null>(null);

  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    const heading = el.querySelector<HTMLElement>("[data-reveal-headline]");
    if (heading) revealHeadline(heading, { trigger: heading });

    // Rows slide up as they enter the viewport.
    el.querySelectorAll("[data-service-row]").forEach((row) => {
      gsap.fromTo(
        row,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%" },
        }
      );
    });
  });

  const isFine = () =>
    typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  return (
    <section
      ref={scope}
      id="services"
      aria-label="What we build"
      className="bg-ink px-6 py-28 text-paper md:px-12 md:py-40"
    >
      <div className="mb-16 flex items-end justify-between md:mb-24">
        <div>
          <p className="mono-label mb-6 text-smoke">003 / SERVICES</p>
          <h2 data-reveal-headline className="display text-[clamp(2.5rem,7.5vw,7rem)]">
            WHAT WE <span className="text-signal">BUILD</span>
          </h2>
        </div>
        <p className="lead hidden max-w-[26ch] text-right text-smoke md:block">
          Six systems. One goal: make your business move faster.
        </p>
      </div>

      <ul className="border-t border-paper/15">
        {services.map((service) => {
          const open = openId === service.id;
          return (
            <li
              key={service.id}
              data-service-row
              className={`border-b border-paper/15 transition-colors duration-500 ${
                open ? "bg-paper text-ink" : "bg-transparent"
              }`}
              onMouseEnter={() => isFine() && setOpenId(service.id)}
              onMouseLeave={() => isFine() && setOpenId(null)}
            >
              <button
                type="button"
                data-cursor="explore"
                aria-expanded={open}
                aria-controls={`service-panel-${service.id}`}
                onClick={() => setOpenId(open ? null : service.id)}
                className="flex w-full items-baseline gap-5 px-2 py-7 text-left md:gap-10 md:py-9"
              >
                <span
                  className={`mono-label transition-transform duration-500 ${
                    open ? "translate-x-2 text-signal" : "text-smoke"
                  }`}
                >
                  {service.index}
                </span>
                <span
                  className={`display flex-1 text-[clamp(1.7rem,4.5vw,3.8rem)] uppercase transition-transform duration-500 ${
                    open ? "translate-x-3" : ""
                  }`}
                >
                  {service.title}
                </span>
                <span className="mono-label hidden text-smoke sm:block">
                  {open ? "− CLOSE" : "+ OPEN"}
                </span>
              </button>

              <div
                id={`service-panel-${service.id}`}
                className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-8 px-2 pb-10 pt-2 md:grid-cols-[1fr_1fr_auto] md:gap-12 md:pl-[7.5rem]">
                    <div>
                      <p className="display-light mb-3 text-[clamp(1.2rem,2.2vw,1.7rem)] text-signal">
                        {service.headline}
                      </p>
                      <p className="lead max-w-[40ch] text-[0.9375rem] text-current/80">
                        {service.description}
                      </p>
                    </div>
                    <div>
                      <ul className="grid grid-cols-2 content-start gap-x-6 gap-y-2.5 text-sm font-medium">
                        {service.items.map((item) => (
                          <li key={item} className="flex items-center gap-2.5">
                            <span aria-hidden="true" className="h-1 w-1 bg-signal" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <a
                        href="#contact"
                        data-cursor="go"
                        className="ui-label group mt-7 inline-flex items-center gap-2 text-signal transition-opacity duration-300 hover:opacity-70"
                      >
                        {service.ctaLabel}
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </a>
                    </div>
                    <ServiceVisual type={service.visual} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
