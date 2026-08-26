import "server-only";

export type IncomingMail = {
  uid: number;
  messageId: string;
  from: { name: string; address: string };
  subject: string;
  body: string;
  date: Date;
  /** Raw header block, used to spot automated mail. */
  headers: Map<string, string>;
};

export type TriageResult =
  | { reply: true }
  | { reply: false; reason: string };

/**
 * Senders that should never receive a reply. Replying to these creates
 * mail loops or bounces, and on a young domain that costs sending
 * reputation — which is far more expensive than a missed draft.
 */
const NO_REPLY_PATTERNS = [
  /^no-?reply@/i,
  /^do-?not-?reply@/i,
  /^bounce/i,
  /^mailer-daemon@/i,
  /^postmaster@/i,
  /^notifications?@/i,
  /^alerts?@/i,
  /^billing@/i,
  /^support@harizx\.com$/i, // our own mailbox
];

/**
 * Headers that mark a message as machine-generated. Replying to these
 * is what starts an infinite auto-responder loop, so RFC 3834 asks
 * responders to check exactly this.
 */
function isAutomated(headers: Map<string, string>): string | null {
  const get = (k: string) => headers.get(k.toLowerCase())?.toLowerCase() ?? "";

  if (get("auto-submitted") && get("auto-submitted") !== "no") {
    return "Auto-Submitted header present";
  }
  if (get("x-auto-response-suppress")) return "X-Auto-Response-Suppress set";
  if (get("precedence").match(/bulk|list|junk/)) return "bulk/list precedence";
  if (get("list-unsubscribe") || get("list-id")) return "mailing list message";
  if (get("x-spam-flag") === "yes") return "flagged as spam";
  if (get("feedback-id")) return "bulk marketing message";

  return null;
}

/**
 * Decides whether a message deserves a drafted reply.
 *
 * Deliberately conservative: when in doubt it skips. A missed draft
 * costs a few seconds of the owner's time; a reply sent into a loop or
 * to a spammer costs domain reputation.
 */
export function triage(mail: IncomingMail): TriageResult {
  const automated = isAutomated(mail.headers);
  if (automated) return { reply: false, reason: automated };

  const address = mail.from.address.toLowerCase();
  if (NO_REPLY_PATTERNS.some((p) => p.test(address))) {
    return { reply: false, reason: `no-reply style sender (${address})` };
  }

  if (!address.includes("@")) {
    return { reply: false, reason: "unparseable sender" };
  }

  // A message with no readable content gives the model nothing to work
  // from, and an invented reply is worse than none.
  if (mail.body.trim().length < 15) {
    return { reply: false, reason: "body too short to answer meaningfully" };
  }

  return { reply: true };
}
