import { NextResponse } from "next/server";
import { systemPrompt, LIMITS, type ChatTurn } from "@/lib/chat/prompt";
import { geminiSseToText } from "@/lib/chat/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Public chat endpoint — a far larger abuse surface than the contact
 * form, because every call costs model quota. Anyone can hit it, so the
 * limits below are the only thing between a bored visitor and an
 * exhausted daily allowance.
 *
 * NOTE: this counter lives in the memory of one serverless instance.
 * Vercel may run several, so the real ceiling is (instances × limit).
 * It raises the cost of casual abuse but will not stop a determined
 * flood — move to a shared store (Upstash/Vercel KV) if that happens.
 * The per-request caps in LIMITS are enforced unconditionally and do
 * not depend on this.
 */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function sweep() {
  const now = Date.now();
  hits.forEach((entry, ip) => {
    if (now > entry.resetAt) hits.delete(ip);
  });
}

function parseTurns(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value)) return null;

  const turns: ChatTurn[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const { role, content } = raw as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed) continue;
    turns.push({ role, content: trimmed.slice(0, LIMITS.message) });
  }
  return turns;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured right now." },
      { status: 503 }
    );
  }

  sweep();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "That's a lot of questions. Try again in a few minutes, or email us." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const turns = parseTurns(body.messages);
  if (!turns || turns.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }
  if (turns[turns.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Keep only recent turns — bounds the token cost of a long session.
  const recent = turns.slice(-LIMITS.history);
  const model = process.env.CHAT_MODEL ?? "gemini-2.0-flash";

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt() }] },
          contents: recent.map((turn) => ({
            // Gemini calls the assistant role "model".
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.content }],
          })),
          generationConfig: {
            maxOutputTokens: LIMITS.outputTokens,
            temperature: 0.5,
          },
        }),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error("[chat] upstream error", upstream.status, detail.slice(0, 300));
      return NextResponse.json(
        { error: "Couldn't reach the assistant. Please email us instead." },
        { status: 502 }
      );
    }

    // Re-stream Gemini's SSE as plain text. Parsing lives in
    // lib/chat/stream.ts so it can be tested on its own.
    const stream = geminiSseToText(upstream.body, (error) =>
      console.error("[chat] stream failed:", error)
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[chat] request failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please email us instead." },
      { status: 500 }
    );
  }
}
