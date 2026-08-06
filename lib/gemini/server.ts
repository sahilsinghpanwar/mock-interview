/**
 * Gemini server-side utilities — uses @google/generative-ai SDK.
 *
 * Strategy:
 *  - Try each model in preferred order
 *  - 429 (quota exceeded) → retry with exponential backoff on same model, then try next
 *  - 404 (model not available) → skip to next model immediately
 *  - Other errors → fail fast
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const PREFERRED_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.5-flash",
] as const;

const MAX_ATTEMPTS_PER_MODEL = 2;
const RETRY_WAIT_MS = 8_000; // 8s between retries on same model

// ---------------------------------------------------------------------------

export async function geminiGenerateText(
  apiKey: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of PREFERRED_MODELS) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        if (!text) throw new Error(`[Gemini] ${modelName} returned empty response`);

        console.log(`[Gemini] ✓ Success with model: ${modelName}`);
        return text;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message;

        // 404 — model not available for this API key, skip immediately
        if (msg.includes("404") || msg.includes("not found")) {
          console.warn(`[Gemini] ${modelName} not available, trying next…`);
          break;
        }

        // 429 — quota exceeded, wait and retry
        if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
          const waitMs = RETRY_WAIT_MS * Math.pow(2, attempt);
          console.warn(
            `[Gemini] ${modelName} quota exceeded (attempt ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL}). ` +
              `Waiting ${waitMs / 1000}s…`
          );
          await sleep(waitMs);
          continue;
        }

        // Any other error — fail fast, no point retrying
        console.error(`[Gemini] ${modelName} failed with unrecoverable error:`, msg);
        throw lastError;
      }
    }
  }

  throw new Error(
    "[Gemini] All models quota exceeded or unavailable. " +
      "Please wait a few minutes or upgrade your Gemini API plan at https://ai.google.dev/"
  );
}

// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
