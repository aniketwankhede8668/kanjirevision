import { parseList, promptFor } from "./prompt";
import { withRetry } from "./retry";

export const GEMINI_MODELS = [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"].filter(Boolean);

async function askModel(model, words, key, signal) {
  return withRetry(`Gemini ${model}`, async () => {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptFor(words, false) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
      }),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, message: data?.error?.message || `Gemini error (${res.status})` };
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "[]";
    return { ok: true, value: parseList(text) };
  }, signal);
}

export async function askGemini(words, key, signal) {
  let last;
  for (const model of GEMINI_MODELS) {
    try { return await askModel(model, words, key, signal); }
    catch (e) {
      if (signal?.aborted) throw e;
      last = e; console.log(`Gemini ${model} fail , try next...`); }
  }
  throw last;
}
