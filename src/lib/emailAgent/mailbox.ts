import "server-only";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { IncomingMail } from "./triage";

/**
 * IMAP keyword stamped on a message once the agent has handled it.
 * Persisting this on the server (rather than in a local database) is
 * what makes the job idempotent: a re-run, a retry, or a second
 * deployment can never draft the same reply twice.
 */
export const HANDLED_FLAG = "$HarizxDrafted";

/** Where drafts are written. Hostinger's webmail uses "INBOX.Drafts". */
const DRAFTS_MAILBOX = process.env.IMAP_DRAFTS_MAILBOX ?? "INBOX.Drafts";

function client(): ImapFlow {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER ?? process.env.SMTP_USER;
  const pass = process.env.IMAP_PASSWORD ?? process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("IMAP_HOST, IMAP_USER and IMAP_PASSWORD must be set");
  }

  return new ImapFlow({
    host,
    port: Number(process.env.IMAP_PORT ?? 993),
    secure: true, // 993 is implicit TLS
    auth: { user, pass },
    logger: false,
    // Serverless functions are short-lived — fail fast.
    socketTimeout: 20_000,
    greetingTimeout: 10_000,
  });
}

/**
 * Fetches recent inbox messages the agent has not handled yet.
 * `limit` keeps a single cron run inside the function timeout.
 */
export async function fetchUnhandled(limit: number): Promise<IncomingMail[]> {
  const imap = client();
  await imap.connect();
  const collected: IncomingMail[] = [];

  try {
    const lock = await imap.getMailboxLock("INBOX");
    try {
      // Only look at recent mail: on first run this avoids drafting
      // replies to an entire historical inbox.
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const uids = await imap.search({ since }, { uid: true });
      if (!uids || uids.length === 0) return [];

      // Newest first, so a backlog never starves today's mail.
      const recent = uids.slice(-limit * 3).reverse();

      for (const uid of recent) {
        if (collected.length >= limit) break;

        const message = await imap.fetchOne(
          String(uid),
          { source: true, flags: true },
          { uid: true }
        );
        if (!message || !message.source) continue;

        // Skip anything already handled, on this run or a previous one.
        const flags = message.flags ?? new Set<string>();
        if (flags.has(HANDLED_FLAG)) continue;

        const parsed = await simpleParser(message.source);
        const from = parsed.from?.value?.[0];
        if (!from?.address) continue;

        const headers = new Map<string, string>();
        parsed.headerLines.forEach(({ key, line }) => {
          headers.set(key.toLowerCase(), line.slice(line.indexOf(":") + 1).trim());
        });

        collected.push({
          uid,
          messageId: parsed.messageId ?? String(uid),
          from: { name: from.name ?? "", address: from.address },
          subject: parsed.subject ?? "",
          body: (parsed.text ?? parsed.html ?? "").toString(),
          date: parsed.date ?? new Date(),
          headers,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await imap.logout().catch(() => {});
  }

  return collected;
}

/**
 * Appends a reply draft to the Drafts mailbox and marks the source
 * message handled. The draft threads correctly via In-Reply-To and
 * References, so it appears in the right conversation.
 */
export async function saveDraft(
  mail: IncomingMail,
  bodyText: string,
  fromAddress: string
): Promise<void> {
  const imap = client();
  await imap.connect();

  try {
    const subject = mail.subject.match(/^re:/i)
      ? mail.subject
      : `Re: ${mail.subject}`;

    const raw = [
      `From: ${fromAddress}`,
      `To: ${mail.from.name ? `"${mail.from.name}" <${mail.from.address}>` : mail.from.address}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${mail.messageId}`,
      `References: ${mail.messageId}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "X-Harizx-Agent: draft",
      "",
      bodyText,
    ].join("\r\n");

    await imap.append(DRAFTS_MAILBOX, Buffer.from(raw, "utf8"), ["\\Draft"]);

    // Mark handled only after the draft is safely stored, so a failure
    // mid-way leaves the message eligible for a retry next run.
    const lock = await imap.getMailboxLock("INBOX");
    try {
      await imap.messageFlagsAdd(String(mail.uid), [HANDLED_FLAG], { uid: true });
    } finally {
      lock.release();
    }
  } finally {
    await imap.logout().catch(() => {});
  }
}
