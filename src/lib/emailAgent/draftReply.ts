import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { siteConfig } from "@/lib/config";
import { services } from "@/lib/data";
import type { IncomingMail } from "./triage";

/** Sonnet balances draft quality against cron latency and cost. */
const MODEL = process.env.AGENT_MODEL ?? "claude-sonnet-5";

/** Hard cap so one enormous email cannot blow up the token bill. */
const MAX_BODY_CHARS = 6000;

/**
 * The agent writes as the owner, but it is explicitly forbidden from
 * committing to anything commercial. Every draft is reviewed before
 * sending, so the useful failure mode is "too cautious", never
 * "promised a price we can't honour".
 */
function systemPrompt(): string {
  return `You draft email replies on behalf of ${siteConfig.name}, an AI automation and digital systems agency (${siteConfig.url}).

WHAT THE BUSINESS DOES
${services.map((s) => `- ${s.title}: ${s.description}`).join("\n")}

YOUR JOB
Write the body of a reply that the owner will read and send. Write as the business ("we"), in first person plural.

HARD RULES — these exist because the owner is liable for what you write:
- NEVER quote a price, rate, discount, or budget figure.
- NEVER commit to a deadline, delivery date, or turnaround time.
- NEVER agree to scope, guarantee an outcome, or promise a result.
- NEVER invent clients, case studies, team size, credentials, or past work. The agency is new and has no published client work.
- NEVER claim something was already done, sent, or fixed.
- If the sender asks about price, timeline, or scope, acknowledge the question and say the owner will follow up with specifics. Do not estimate.
- If the email is hostile, legal, financial, or a complaint, write only a brief neutral acknowledgement and note that a human will respond.
- If you cannot tell what they want, ask one clarifying question.

STYLE
- Match the brand: direct, confident, concise. No corporate filler, no "I hope this email finds you well", no exclamation marks.
- 40-120 words. Shorter is better.
- Plain text. No markdown, no headers, no bullet lists unless the sender used them.
- Do not include a subject line, a greeting line with a placeholder name you are unsure of, or a signature block — those are added automatically.
- Write only the body text. Nothing else.`;
}

export type DraftOutcome =
  | { ok: true; body: string }
  | { ok: false; reason: string };

export async function draftReply(mail: IncomingMail): Promise<DraftOutcome> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "ANTHROPIC_API_KEY is not set" };
  }

  const client = new Anthropic({ apiKey });
  const body = mail.body.slice(0, MAX_BODY_CHARS);

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt(),
      messages: [
        {
          role: "user",
          content: `Draft a reply to this email.

From: ${mail.from.name || "(no name)"} <${mail.from.address}>
Subject: ${mail.subject || "(no subject)"}
Received: ${mail.date.toISOString()}

--- message ---
${body}
--- end ---

Write only the reply body.`,
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) return { ok: false, reason: "model returned no text" };

    return { ok: true, body: text };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `Anthropic API: ${reason}` };
  }
}

/**
 * Wraps the model's body with a greeting, signature, and a banner
 * marking it as unsent AI output — so a draft can never be mistaken
 * for something already sent, and never goes out unreviewed by accident.
 */
export function assembleDraft(mail: IncomingMail, body: string): string {
  const firstName = (mail.from.name || "").trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  return [
    "— — — DRAFTED BY AI · REVIEW BEFORE SENDING — — —",
    "",
    greeting,
    "",
    body,
    "",
    "Best,",
    siteConfig.name,
    siteConfig.url.replace(/^https?:\/\//, ""),
    "",
    "",
    "---------- original message ----------",
    `From: ${mail.from.name} <${mail.from.address}>`,
    `Date: ${mail.date.toISOString()}`,
    `Subject: ${mail.subject}`,
    "",
    mail.body.slice(0, 2000),
  ].join("\n");
}
