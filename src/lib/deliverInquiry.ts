import "server-only";
import { siteConfig } from "@/lib/config";

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
 * ── INQUIRY DELIVERY ────────────────────────────────────────────────
 * The single place a contact inquiry leaves the application.
 *
 * Three modes, chosen by which environment variables are set:
 *
 *   1. RESEND_API_KEY set  → emailed via Resend
 *   2. CONTACT_WEBHOOK_URL → POSTed as JSON (Slack, Zapier, a CRM…)
 *   3. neither             → logged server-side
 *
 * In every mode a failure throws, so the API route returns 500 and the
 * visitor sees a real error. The form must never claim success for a
 * message that went nowhere.
 *
 * Secrets are read from the environment only. This module is marked
 * server-only, so importing it from a client component is a build
 * error rather than a leaked key.
 * ─────────────────────────────────────────────────────────────────────
 */
export async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (resendKey) {
    await sendViaResend(inquiry, resendKey);
    return;
  }

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

  // Nothing configured — record it rather than dropping it silently.
  console.info("[inquiry]", JSON.stringify(inquiry));
}

/**
 * `CONTACT_FROM` must be an address on a domain verified in Resend.
 * Using a subdomain (send.harizx.com) keeps Resend's DNS records away
 * from the root domain's existing Hostinger mail setup.
 */
function sendViaResend(inquiry: Inquiry, apiKey: string): Promise<void> {
  const from = process.env.CONTACT_FROM ?? `HarizX Site <site@send.${bareDomain()}>`;
  const to = process.env.CONTACT_INBOX ?? siteConfig.email;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      // So a reply from the inbox goes straight back to the enquirer.
      reply_to: inquiry.email,
      subject: `New inquiry — ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ""}`,
      text: formatInquiry(inquiry),
    }),
  }).then(async (response) => {
    if (!response.ok) {
      // Resend returns a JSON error body; surface it in server logs
      // only — the visitor gets a generic message from the route.
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`);
    }
  });
}

function bareDomain(): string {
  try {
    return new URL(siteConfig.url).hostname.replace(/^www\./, "");
  } catch {
    return "harizx.com";
  }
}

function formatInquiry(inquiry: Inquiry): string {
  return [
    `Name:      ${inquiry.name}`,
    `Email:     ${inquiry.email}`,
    `Company:   ${inquiry.company || "—"}`,
    `Timeline:  ${inquiry.timeline || "—"}`,
    "",
    "Wants to build:",
    inquiry.project,
    "",
    "Additional details:",
    inquiry.details || "—",
    "",
    `Received:  ${inquiry.receivedAt}`,
    `Source:    ${siteConfig.url}`,
  ].join("\n");
}
