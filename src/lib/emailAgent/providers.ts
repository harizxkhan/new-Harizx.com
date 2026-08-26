import "server-only";

/**
 * Model providers for the email agent.
 *
 * The agent picks whichever provider has a key configured, so the
 * business can start on a free tier and move to a paid one later by
 * changing an environment variable — no code change.
 *
 * PRIVACY NOTE: free tiers are generally free because the provider
 * trains on the data you send. Inquiry emails contain customer names,
 * company details and project descriptions. Google's free Gemini tier
 * states that it uses submitted data to improve their products; paid
 * Anthropic and Gemini tiers do not. Choose accordingly — this is a
 * business decision, not a technical one.
 */

export type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

export type Provider = {
  name: string;
  /** True when this provider has credentials configured. */
  available: () => boolean;
  generate: (system: string, user: string) => Promise<GenerateResult>;
};

const MAX_OUTPUT_TOKENS = 600;

/* ------------------------------------------------------------------ */
/*  Google Gemini — free tier                                          */
/* ------------------------------------------------------------------ */

const gemini: Provider = {
  name: "gemini",
  available: () => Boolean(process.env.GEMINI_API_KEY),

  async generate(system, user) {
    const key = process.env.GEMINI_API_KEY!;
    const model = process.env.AGENT_MODEL ?? "gemini-2.0-flash";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Header rather than query string, so the key never lands
            // in a URL that might be logged by a proxy.
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: {
              maxOutputTokens: MAX_OUTPUT_TOKENS,
              temperature: 0.4,
            },
          }),
        }
      );

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        return {
          ok: false,
          reason: `Gemini ${response.status}: ${detail.slice(0, 200)}`,
        };
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: string;
        }>;
      };

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("").trim();

      if (!text) {
        // Safety filters return a candidate with no text — surface the
        // reason rather than silently producing an empty draft.
        return {
          ok: false,
          reason: `Gemini returned no text (${candidate?.finishReason ?? "unknown"})`,
        };
      }

      return { ok: true, text };
    } catch (error) {
      return {
        ok: false,
        reason: `Gemini request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

/* ------------------------------------------------------------------ */
/*  Anthropic — paid, not used for training                            */
/* ------------------------------------------------------------------ */

const anthropic: Provider = {
  name: "anthropic",
  available: () => Boolean(process.env.ANTHROPIC_API_KEY),

  async generate(system, user) {
    const key = process.env.ANTHROPIC_API_KEY!;
    const model = process.env.AGENT_MODEL ?? "claude-sonnet-5";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        return {
          ok: false,
          reason: `Anthropic ${response.status}: ${detail.slice(0, 200)}`,
        };
      }

      const data = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };

      const text = (data.content ?? [])
        .filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("")
        .trim();

      if (!text) return { ok: false, reason: "Anthropic returned no text" };

      return { ok: true, text };
    } catch (error) {
      return {
        ok: false,
        reason: `Anthropic request failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

/* ------------------------------------------------------------------ */

const PROVIDERS: Provider[] = [gemini, anthropic];

/**
 * Returns the configured provider. `AGENT_PROVIDER` forces a specific
 * one; otherwise the first with credentials wins, so adding a key is
 * all it takes to switch.
 */
export function selectProvider(): Provider | null {
  const forced = process.env.AGENT_PROVIDER?.toLowerCase();

  if (forced) {
    const match = PROVIDERS.find((p) => p.name === forced);
    return match?.available() ? match : null;
  }

  return PROVIDERS.find((p) => p.available()) ?? null;
}
