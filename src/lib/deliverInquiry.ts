import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
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
 * Modes, in priority order, chosen by which environment variables are
 * present:
 *
 *   1. SMTP_HOST + SMTP_USER + SMTP_PASSWORD → Hostinger SMTP
 *   2. RESEND_API_KEY                        → Resend HTTP API
 *   3. CONTACT_WEBHOOK_URL                   → JSON POST (Slack/CRM)
 *   4. none of the above                     → server-side log
 *
 * Every mode throws on failure, so the route returns 500 and the
 * visitor sees a real error. The form never reports success for a
 * message that was not delivered.
 *
 * SECURITY: this module is marked `server-only`, so importing it from
 * a client component is a build error rather than a leaked password.
 * Credentials are read from process.env at request time and are never
 * interpolated into anything returned to the browser. No value here is
 * prefixed NEXT_PUBLIC_, so none is inlined into the client bundle.
 * ─────────────────────────────────────────────────────────────────────
 */
export async function deliverInquiry(inquiry: Inquiry): Promise<void> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    await sendViaSmtp(inquiry);
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    await sendViaResend(inquiry, resendKey);
    return;
  }

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

  // Nothing configured — record it rather than dropping it silently.
  console.info("[inquiry]", JSON.stringify(inquiry));
}

/* ------------------------------------------------------------------ */
/*  SMTP (Hostinger)                                                   */
/* ------------------------------------------------------------------ */

/**
 * Transporter is created once per warm serverless instance and reused.
 * Rebuilding it on every request would open a fresh TLS handshake to
 * Hostinger each time, which is slow and looks like abuse.
 */
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT ?? 587);

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 starts plaintext and upgrades via
    // STARTTLS, which `requireTLS` makes mandatory rather than optional.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Serverless functions are short-lived; fail fast rather than
    // holding the request open until the platform kills it.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

async function sendViaSmtp(inquiry: Inquiry): Promise<void> {
  const mailbox = process.env.SMTP_USER!;
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.email;

  try {
    await getTransporter().sendMail({
      /*
       * From must be the authenticated mailbox. Putting the visitor's
       * address here would be spoofing: Hostinger would reject it, and
       * anything that slipped through would fail SPF/DMARC and land in
       * spam. Their name is kept in the display name instead, and
       * replyTo is what makes a reply reach them.
       */
      from: { name: `${inquiry.name} via ${siteConfig.name}`, address: mailbox },
      to,
      replyTo: { name: inquiry.name, address: inquiry.email },
      subject: buildSubject(inquiry),
      text: formatInquiry(inquiry),
      html: formatInquiryHtml(inquiry),
    });
  } catch (error) {
    // Re-thrown with context for the server log. The route catches this
    // and returns a generic message — the visitor never sees host names,
    // usernames, or any part of the credential.
    const reason = error instanceof Error ? error.message : String(error);
    cachedTransporter = null; // force a clean reconnect next attempt
    throw new Error(`SMTP send failed: ${reason}`);
  }
}

/* ------------------------------------------------------------------ */
/*  Resend (kept as an alternative transport)                          */
/* ------------------------------------------------------------------ */

function sendViaResend(inquiry: Inquiry, apiKey: string): Promise<void> {
  const from = process.env.CONTACT_FROM ?? `${siteConfig.name} Site <site@send.${bareDomain()}>`;
  const to = process.env.CONTACT_TO_EMAIL ?? process.env.CONTACT_INBOX ?? siteConfig.email;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: buildSubject(inquiry),
      text: formatInquiry(inquiry),
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

function bareDomain(): string {
  try {
    return new URL(siteConfig.url).hostname.replace(/^www\./, "");
  } catch {
    return "harizx.com";
  }
}

function buildSubject(inquiry: Inquiry): string {
  const company = inquiry.company ? ` (${inquiry.company})` : "";
  return `New inquiry — ${inquiry.name}${company}`;
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
    "",
    "Reply directly to this email to reach them.",
  ].join("\n");
}

/** Escapes user input before it goes anywhere near an HTML email body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInquiryHtml(inquiry: Inquiry): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 16px 6px 0;color:#777;font:500 13px/1.5 system-ui,sans-serif;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:6px 0;color:#050505;font:400 14px/1.6 system-ui,sans-serif">${esc(value) || "—"}</td>
    </tr>`;

  const block = (label: string, value: string) =>
    `<p style="margin:20px 0 6px;color:#777;font:500 13px/1.5 system-ui,sans-serif">${label}</p>
     <p style="margin:0;color:#050505;font:400 15px/1.65 system-ui,sans-serif;white-space:pre-wrap">${esc(value) || "—"}</p>`;

  return `<div style="max-width:560px;margin:0 auto;padding:28px;background:#f5f5f0">
    <p style="margin:0 0 4px;color:#ff2a1a;font:600 11px/1.4 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase">New inquiry</p>
    <h1 style="margin:0 0 22px;color:#050505;font:700 22px/1.25 system-ui,sans-serif">${esc(inquiry.name)}</h1>
    <table style="border-collapse:collapse;width:100%">
      ${row("Email", inquiry.email)}
      ${row("Company", inquiry.company)}
      ${row("Timeline", inquiry.timeline)}
    </table>
    ${block("Wants to build", inquiry.project)}
    ${block("Additional details", inquiry.details)}
    <p style="margin:26px 0 0;padding-top:14px;border-top:1px solid #ddd;color:#777;font:400 12px/1.6 system-ui,sans-serif">
      Received ${esc(inquiry.receivedAt)} via <a href="${siteConfig.url}" style="color:#050505">${esc(siteConfig.url)}</a>.<br>
      Reply directly to this email to reach ${esc(inquiry.name)}.
    </p>
  </div>`;
}
