import { parseList, promptFor } from "./prompt";
import { withRetry } from "./retry";

export const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
].filter(Boolean);


async function askModel(model, words, key, signal) {
  return withRetry(`Gemini ${model}`, async () => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptFor(words, false),
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
        signal,
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(
        data?.error?.message ||
        `Gemini error (${res.status})`
      );

      error.status = res.status;

      throw error;
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      throw new Error(`Gemini ${model} returned an empty response.`);
    }

    console.log(`Gemini ${model} response received`);

    const value = parseList(text);

    return {
      ok: true,
      value,
    };
  }, signal);
}


export async function askGemini(words, key, signal) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      const result = await askModel(
        model,
        words,
        key,
        signal
      );
      console.log(`Gemini ${model} succeeded`);
      return result;
    } catch (e) {
      if (signal?.aborted) {
        throw e;
      }

      lastError = e;

      console.error(
        `Gemini ${model} failed:`,
        e?.status || "",
        e?.message || e
      );

      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}