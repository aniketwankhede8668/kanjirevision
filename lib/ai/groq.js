import { parseList, promptFor } from "./prompt";
import { withRetry } from "./retry";

const MODEL = process.env.GROQ_MODE;

export function askGroq(words, key, signal) {
  return withRetry("Groq", async () => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: promptFor(words, true) }],
      }),
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, message: data?.error?.message || `Groq error (${res.status})` };
    return { ok: true, value: parseList(data.choices?.[0]?.message?.content || "{}") };
  }, signal);
}
