import "server-only";

/**
 * Converts Gemini's server-sent-event stream into a plain text stream.
 *
 * Extracted from the route so it can be tested directly: the failure
 * modes here are subtle — an SSE frame can be split across two network
 * chunks, leaving a half-line of JSON that must be buffered rather than
 * parsed — and they only show up on slow connections, which is exactly
 * when nobody is watching.
 */
export function geminiSseToText(
  source: ReadableStream<Uint8Array>,
  onError: (error: unknown) => void = () => {}
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // The final element may be an incomplete line — hold it back
          // until the rest of it arrives in a later chunk.
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const text = extractText(line);
            if (text) controller.enqueue(encoder.encode(text));
          }
        }

        // Flush any complete frame left in the buffer at end of stream.
        const tail = extractText(buffer);
        if (tail) controller.enqueue(encoder.encode(tail));
      } catch (error) {
        onError(error);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

/** Pulls the text out of one SSE line, or null if there is none. */
function extractText(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;

  try {
    const json = JSON.parse(payload);
    const text = json?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");
    return text || null;
  } catch {
    // Malformed or partial frame — drop it rather than kill the stream.
    return null;
  }
}
