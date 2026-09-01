"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/config";

type Turn = { role: "user" | "assistant"; content: string };

const OPENER =
  "Ask me what we build, or describe the problem you're trying to solve.";

const SUGGESTIONS = [
  "What can you automate for me?",
  "Can you build a custom app?",
  "How do we start?",
];

/**
 * Floating chat panel.
 *
 * Deliberately mirrors the navbar's glass-pill language rather than
 * introducing a second visual system. Streams the reply so the panel
 * fills progressively instead of sitting blank.
 *
 * Never rendered until mounted client-side, so it cannot affect the
 * server-rendered page or the opening ident.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the newest message in view as the reply streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes; cancel any in-flight request on unmount.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;

      setError("");
      setDraft("");
      const next: Turn[] = [...turns, { role: "user", content: message }];
      setTurns(next);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Couldn't get a reply.");
        }

        // Append an empty assistant turn, then fill it as chunks land.
        setTurns((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setTurns((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: last.content + chunk };
            }
            return copy;
          });
        }

        // A stream that produced nothing would leave an empty bubble.
        setTurns((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content.trim()) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        // Drop the empty assistant bubble if one was added.
        setTurns((prev) => {
          const last = prev[prev.length - 1];
          return last?.role === "assistant" && !last.content ? prev.slice(0, -1) : prev;
        });
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, turns]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close chat" : "Ask a question"}
        className="chat-launcher"
      >
        {open ? (
          <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2 3.5h12v7.5H6.5L3.5 13.5V11H2z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span>Ask</span>
          </>
        )}
      </button>

      {open && (
        <div
          id="chat-panel"
          role="dialog"
          aria-label={`Chat with ${siteConfig.name}`}
          className="chat-panel"
        >
          <header className="chat-head">
            <span className="display text-[0.8125rem] tracking-tight text-paper">
              {siteConfig.wordmark}
            </span>
            <span className="mono-label text-smoke">ASSISTANT</span>
          </header>

          <div ref={scrollRef} className="chat-scroll">
            <p className="chat-opener">{OPENER}</p>

            {turns.map((turn, i) => (
              <div
                key={i}
                className={turn.role === "user" ? "chat-msg-user" : "chat-msg-bot"}
              >
                {turn.content}
                {busy &&
                  turn.role === "assistant" &&
                  i === turns.length - 1 &&
                  !turn.content && <span className="chat-dots" aria-label="Thinking" />}
              </div>
            ))}

            {busy && turns[turns.length - 1]?.role === "user" && (
              <div className="chat-msg-bot">
                <span className="chat-dots" aria-label="Thinking" />
              </div>
            )}

            {error && (
              <p role="alert" className="chat-error">
                {error}{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
            )}

            {turns.length === 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="chat-form">
            <label htmlFor="chat-input" className="sr-only">
              Your message
            </label>
            <input
              ref={inputRef}
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe your problem…"
              maxLength={1500}
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
              →
            </button>
          </form>

          <p className="chat-foot">
            AI assistant — it can be wrong, and it can&apos;t quote prices.
          </p>
        </div>
      )}
    </>
  );
}
