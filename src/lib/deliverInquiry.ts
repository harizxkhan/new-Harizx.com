import "server-only";

export type Inquiry = {
  name: string;
  email: string;
  company: string;
  project: string;
  timeline: string;
  details: string;
  receivedAt: string;
};

/**
 * ── INTEGRATION POINT ────────────────────────────────────────────────
 * The single place where a contact inquiry leaves the application.
 * Connect an email provider, CRM, or webhook here; nothing else in the
 * codebase needs to change.
 *
 * Until one is configured, inquiries are logged server-side so no
 * submission is silently lost. The form never reports success unless
 * this resolves — see src/app/api/contact/route.ts.
 *
 * Example (Resend):
 *
 *   const key = process.env.RESEND_API_KEY;
 *   await fetch("https://api.resend.com/emails", {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Bearer ${key}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({
 *       from: "site@harizx.com",
 *       to: process.env.CONTACT_INBOX,
 *       subject: `New inquiry — ${inquiry.name}`,
 *       text: format(inquiry),
 *     }),
 *   });
 *
 * Read credentials from environment variables only. Never commit a key
 * or reference one from client-side code.
 * ─────────────────────────────────────────────────────────────────────
 */
export async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry),
    });
    if (!response.ok) {
      throw new Error(`Webhook responded ${response.status}`);
    }
    return;
  }

  // No delivery configured yet — record it rather than dropping it.
  console.info("[inquiry]", JSON.stringify(inquiry));
}
