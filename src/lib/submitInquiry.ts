/**
 * Contact form submission — isolated so backend/email delivery can be
 * wired in one place. Posts to /api/contact, which currently validates
 * and logs the inquiry server-side. Connect your email service or CRM
 * inside src/app/api/contact/route.ts.
 */

export type InquiryPayload = {
  name: string;
  email: string;
  company: string;
  project: string;
  timeline: string;
  details: string;
  /** Honeypot — must stay empty; bots that fill it are dropped. */
  website: string;
};

export async function submitInquiry(payload: InquiryPayload): Promise<void> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
}
