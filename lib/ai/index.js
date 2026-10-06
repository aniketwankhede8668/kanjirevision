import { askGemini } from "./gemini";

const CHUNK = 40;

function getProviders(signal) {
  const list = [];
  if (process.env.GEMINI_API_KEY) list.push({ name: "Gemini", ask: (w) => askGemini(w, process.env.GEMINI_API_KEY, signal) });
  return list;
}

export async function generateAnswers(words, signal) {
  const providers = getProviders(signal);
  if (!providers.length)
    throw Object.assign(new Error("No API key is configured. Please add GEMINI_API_KEY"), { status: 500 });

  const items = {};
  for (let i = 0; i < words.length; i += CHUNK) {
    if (signal?.aborted) throw new Error("Cancelled");
    const part = words.slice(i, i + CHUNK);
    console.log(`Processing words ${i + 1}-${i + part.length} / ${words.length}`);
    let out, last;
    for (const p of providers) {
      try { out = await p.ask(part); break; }
      catch (e) {
        if (signal?.aborted) throw e;
        last = e; console.error(`${p.name} fail hua:`, e.message);
      }
    }
    if (!out) throw last;
    out.forEach((o, j) => {
      if (part[j]) items[part[j]] = { reading: String(o?.reading || ""), meaning: String(o?.meaning || "") };
    });
  }
  return items;
}
