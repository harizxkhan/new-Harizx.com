"use client";

import { useState, type FormEvent } from "react";
import { timelineOptions } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { submitInquiry, type InquiryPayload } from "@/lib/submitInquiry";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealHeadline } from "@/lib/animations";

type Status = "idle" | "sending" | "success" | "error";

const EMPTY: InquiryPayload = {
  name: "",
  email: "",
  company: "",
  project: "",
  timeline: "",
  details: "",
  website: "",
};

const inputClass =
  "w-full border-b border-ink/25 bg-transparent py-4 text-lg text-ink placeholder:text-smoke-deep/80 focus:border-signal-deep focus:outline-none transition-colors";

/** Tiny mono index + Inter label — the form's two-tier label hierarchy. */
function FieldLabel({
  htmlFor,
  index,
  children,
  required,
}: {
  htmlFor?: string;
  index: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  const content = (
    <>
      <span className="mono-label mr-3 text-signal-deep">{index}</span>
      <span className="text-sm font-medium text-ink">
        {children}
        {required && <span aria-hidden="true" className="ml-1 text-signal-deep">*</span>}
      </span>
    </>
  );
  return htmlFor ? (
    <label htmlFor={htmlFor} className="flex items-baseline">
      {content}
    </label>
  ) : (
    <span className="flex items-baseline">{content}</span>
  );
}

/**
 * Premium contact form on paper. Fields animate into view, validate
 * client-side, and post to the isolated submitInquiry helper.
 */
export default function ContactForm() {
  const [form, setForm] = useState<InquiryPayload>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryPayload, string>>>({});
  const [serverError, setServerError] = useState("");

  const scope = useGsap<HTMLElement>((el, reduced) => {
    if (reduced) return;

    const heading = el.querySelector<HTMLElement>("[data-reveal-headline]");
    if (heading) revealHeadline(heading, { trigger: heading });

    gsap.fromTo(
      el.querySelectorAll("[data-field]"),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 75%" },
      }
    );
  });

  const set = (key: keyof InquiryPayload) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Your name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.project.trim()) next.project = "Tell us what you want to build.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setServerError("");
    try {
      await submitInquiry(form);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <section
        id="contact"
        aria-label="Contact"
        className="flex min-h-[70vh] flex-col items-start justify-center bg-paper px-6 py-28 text-ink md:px-12"
      >
        <p className="mono-label mb-6 text-signal-deep">TRANSMISSION RECEIVED</p>
        <h2 className="display text-[clamp(2.4rem,6.5vw,5.8rem)]">
          Got it.
          <br />
          We&apos;ll be in touch<span className="text-signal">.</span>
        </h2>
        <p className="lead mt-8 max-w-[44ch] text-ink/70">
          Your brief is in the system. Expect a reply at{" "}
          <span className="font-medium text-ink">{form.email}</span> shortly.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={scope}
      id="contact"
      aria-label="Contact"
      className="bg-paper px-6 py-28 text-ink md:px-12 md:py-40"
    >
      <div className="mb-16">
        <p className="mono-label mb-6 text-smoke-deep">010 / CONTACT</p>
        <h2
          data-reveal-headline
          className="display max-w-[14ch] text-[clamp(2.4rem,6.5vw,5.8rem)]"
        >
          Tell us what you&apos;re <span className="text-signal">building.</span>
        </h2>
        <p className="lead mt-6 max-w-[46ch] text-smoke-deep">
          A few details are enough — we&apos;ll come back with questions,
          options, and a way forward.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-x-16 gap-y-12 md:grid-cols-2"
      >
        <div data-field>
          <FieldLabel htmlFor="cf-name" index="01" required>
            Name
          </FieldLabel>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p id="cf-name-error" role="alert" className="mt-2.5 text-sm text-signal-deep">
              {errors.name}
            </p>
          )}
        </div>

        <div data-field>
          <FieldLabel htmlFor="cf-email" index="02" required>
            Email
          </FieldLabel>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            className={inputClass}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p id="cf-email-error" role="alert" className="mt-2.5 text-sm text-signal-deep">
              {errors.email}
            </p>
          )}
        </div>

        <div data-field>
          <FieldLabel htmlFor="cf-company" index="03">
            Company / Project name
          </FieldLabel>
          <input
            id="cf-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => set("company")(e.target.value)}
            className={inputClass}
            placeholder="Where should we look you up?"
          />
        </div>

        <div data-field>
          <FieldLabel htmlFor="cf-project" index="04" required>
            What do you want to build?
          </FieldLabel>
          <input
            id="cf-project"
            name="project"
            type="text"
            required
            value={form.project}
            onChange={(e) => set("project")(e.target.value)}
            aria-invalid={!!errors.project}
            aria-describedby={errors.project ? "cf-project-error" : undefined}
            className={inputClass}
            placeholder="Website / app / automation / content system…"
          />
          {errors.project && (
            <p id="cf-project-error" role="alert" className="mt-2.5 text-sm text-signal-deep">
              {errors.project}
            </p>
          )}
        </div>

        <fieldset data-field>
          <legend>
            <FieldLabel index="05">Timeline</FieldLabel>
          </legend>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {timelineOptions.map((option) => (
              <label
                key={option}
                className={`cursor-pointer border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  form.timeline === option
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/25 text-ink/80 hover:border-ink hover:text-ink"
                }`}
              >
                <input
                  type="radio"
                  name="timeline"
                  value={option}
                  checked={form.timeline === option}
                  onChange={() => set("timeline")(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div data-field className="md:col-span-2">
          <FieldLabel htmlFor="cf-details" index="06">
            Additional details
          </FieldLabel>
          <textarea
            id="cf-details"
            name="details"
            rows={4}
            value={form.details}
            onChange={(e) => set("details")(e.target.value)}
            className={inputClass}
            placeholder="Context, links, constraints — anything that helps us understand the problem."
          />
        </div>

        {/* Honeypot spam trap — hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="cf-website">Website</label>
          <input
            id="cf-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set("website")(e.target.value)}
          />
        </div>

        <div data-field className="md:col-span-2">
          {status === "error" && (
            <p
              role="alert"
              className="mb-5 border border-signal px-4 py-3 text-sm font-medium text-signal-deep"
            >
              {serverError}
            </p>
          )}
          <button
            type="submit"
            data-cursor="go"
            disabled={status === "sending"}
            className="btn-editorial on-light w-full justify-center text-ink disabled:opacity-50 md:w-auto"
          >
            <span>{status === "sending" ? "Sending…" : "Let's build it →"}</span>
          </button>
          <p className="mt-6 text-sm text-smoke-deep">
            Prefer email?{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-ink link-sweep"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </form>
    </section>
  );
}
