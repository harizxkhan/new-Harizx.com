import { NextResponse } from "next/server";
import { deliverInquiry, type Inquiry } from "@/lib/deliverInquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Max inquiries accepted from one IP per window. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

/**
 * In-memory rate limiter. Adequate for a single instance; swap for a
 * shared store (Upstash, Redis) if this is ever deployed to more than
 * one node, since each instance keeps its own counter.
 */
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

/** Drop expired buckets so the map cannot grow without bound. */
function sweep() {
  const now = Date.now();
  hits.forEach((entry, ip) => {
    if (now > entry.resetAt) hits.delete(ip);
  });
}

const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * Contact endpoint.
 *
 * Validates and sanitises every field server-side — client validation
 * is treated as a convenience, never as a trust boundary. Delivery is
 * isolated in `deliverInquiry` so an email provider or CRM can be
 * connected in one place without touching this handler.
 */
export async function POST(request: Request) {
  try {
    sweep();

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "We couldn't read that request. Please try again." },
        { status: 400 }
      );
    }

    // Honeypot: real users never fill this hidden field. Report success
    // so bots learn nothing from the response.
    if (str(body.website) !== "") {
      return NextResponse.json({ ok: true });
    }

    const name = str(body.name);
    const email = str(body.email);
    const project = str(body.project);

    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: "Please tell us your name." },
        { status: 400 }
      );
    }
    if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!project || project.length > 5000) {
      return NextResponse.json(
        { error: "Please tell us what you want to build." },
        { status: 400 }
      );
    }

    // Rate limit only requests that survive validation. A visitor
    // correcting a typo several times should never be locked out;
    // malformed floods are already rejected cheaply above.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const inquiry: Inquiry = {
      name: name.slice(0, 200),
      email,
      company: str(body.company).slice(0, 300),
      project: project.slice(0, 5000),
      timeline: str(body.timeline).slice(0, 50),
      details: str(body.details).slice(0, 5000),
      receivedAt: new Date().toISOString(),
    };

    await deliverInquiry(inquiry);

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Log server-side; never leak internals to the client.
    console.error("[contact] delivery failed:", error);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please email us instead." },
      { status: 500 }
    );
  }
}
