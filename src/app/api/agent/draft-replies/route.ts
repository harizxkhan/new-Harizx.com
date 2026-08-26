import { NextResponse } from "next/server";
import { fetchUnhandled, saveDraft } from "@/lib/emailAgent/mailbox";
import { triage } from "@/lib/emailAgent/triage";
import { draftReply, assembleDraft } from "@/lib/emailAgent/draftReply";

// IMAP is a raw TCP client, so this cannot run on the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Messages handled per run — keeps one invocation inside the timeout. */
const BATCH_SIZE = Number(process.env.AGENT_BATCH_SIZE ?? 5);

/**
 * Email agent: reads recent unhandled mail, decides what deserves a
 * reply, drafts one with Claude, and stores it in the Drafts folder
 * for review.
 *
 * It never sends. Drafting is the whole job — a human presses send.
 *
 * Triggered by Vercel Cron (see vercel.json) or any external scheduler.
 * Protected by CRON_SECRET so the endpoint cannot be driven by a
 * stranger, which would otherwise let anyone burn API credits.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const started = Date.now();
  const summary = { scanned: 0, drafted: 0, skipped: 0, failed: 0 };
  const details: Array<Record<string, string>> = [];

  try {
    const mails = await fetchUnhandled(BATCH_SIZE);
    summary.scanned = mails.length;

    const fromAddress = process.env.SMTP_USER ?? process.env.IMAP_USER ?? "";

    for (const mail of mails) {
      const decision = triage(mail);

      if (!decision.reply) {
        summary.skipped += 1;
        details.push({ from: mail.from.address, action: "skipped", why: decision.reason });
        continue;
      }

      const draft = await draftReply(mail);
      if (!draft.ok) {
        summary.failed += 1;
        details.push({ from: mail.from.address, action: "failed", why: draft.reason });
        continue;
      }

      await saveDraft(mail, assembleDraft(mail, draft.body), fromAddress);
      summary.drafted += 1;
      details.push({ from: mail.from.address, action: "drafted", subject: mail.subject });
    }

    return NextResponse.json({
      ok: true,
      ...summary,
      ms: Date.now() - started,
      details,
    });
  } catch (error) {
    // Logged in full server-side; the response stays generic because
    // this endpoint touches mailbox credentials.
    console.error("[agent] run failed:", error);
    return NextResponse.json(
      { ok: false, error: "Agent run failed. See server logs.", ...summary },
      { status: 500 }
    );
  }
}
