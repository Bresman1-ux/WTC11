import "server-only";
import { GoogleGenAI, ApiError } from "@google/genai";
import { MAX_ANSWER_CHARACTERS, MAX_OUTPUT_TOKENS } from "./prompt";

// Documented server-side default; override with GEMINI_MODEL if needed.
const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 20_000;

export type GeminiError = "configuration" | "timeout" | "rate_limited" | "unavailable" | "provider_error";

export type GeminiOutcome = { ok: true; answer: string } | { ok: false; error: GeminiError };

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

/** Calls Gemini with a bounded timeout and output size. Never logs the API key or raw prompt. */
export async function askGemini(systemInstruction: string, contents: string): Promise<GeminiOutcome> {
  const ai = getClient();
  if (!ai) {
    return { ok: false, error: "configuration" };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.3,
        abortSignal: controller.signal,
      },
    });

    const text = response.text;
    if (!text) {
      return { ok: false, error: "provider_error" };
    }

    const answer = text.length > MAX_ANSWER_CHARACTERS ? `${text.slice(0, MAX_ANSWER_CHARACTERS)}…` : text;
    return { ok: true, answer };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "timeout" };
    }
    if (err instanceof ApiError) {
      if (err.status === 429) return { ok: false, error: "rate_limited" };
      if (err.status === 401 || err.status === 403) return { ok: false, error: "configuration" };
      if (err.status >= 500) return { ok: false, error: "unavailable" };
    }
    return { ok: false, error: "provider_error" };
  } finally {
    clearTimeout(timeoutHandle);
  }
}
