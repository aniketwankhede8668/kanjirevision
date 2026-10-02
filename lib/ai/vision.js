import { GEMINI_MODELS } from "./gemini";
import { parseList } from "./prompt";
import { withRetry } from "./retry";

const CHUNK = 20;

const WORDS_PROMPT =
  "This image has Japanese study material. List the vocabulary items a learner should memorize, as COMPLETE words exactly as a textbook label shows them.\n" +
  "INCLUDE: nouns (kanji, hiragana or katakana), every labelled object with an arrow, katakana loanwords (like ワイングラス, エアコン), " +
  "and verbs/adjectives from sentences in DICTIONARY form (like 飲む, 冷える).\n" +
  "KEEP COMPOUNDS WHOLE: write 電子レンジ (not 電子 and レンジ separately), ガスレンジ, コーヒーカップ, ワイングラス, 窓ガラス, 残り物, 湯飲み.\n" +
  "DO NOT INCLUDE: particles (は が を に で と も の か よ ね へ や), verb endings or auxiliaries (て た だ ない ます ました ましょう てる), " +
  "conjunctions (なら けど), prefixes or suffixes alone (お 第 目), any single hiragana or katakana character, word fragments, numbers, " +
  "page headings like 第1週, and all English/Korean/Chinese text.\n" +
  "If a label has furigana, write the word without furigana. If a label has two words separated by '/', list them separately. " +
  "Check the image region by region; there may be 40 or more items. Reply ONLY with a JSON array of strings.";

const STOP = new Set([
  "は","が","を","に","で","と","も","の","か","よ","ね","へ","や","て","た","だ","から","まで","より","けど","けれど","なら","でも","ない",
  "てる","ている","でいる","ます","ました","ません","ましょ","ましょう","です","でした","だった","お","ご","第","目",
]);

const isJunk = (w) => /^[\u3040-\u30FF]$/.test(w) || /^[\d０-９]+$/.test(w) || STOP.has(w);

const detailPrompt = (words) =>
  "You are a Japanese teacher. For each word below give: word (unchanged), reading (hiragana), meaning (exactly: short English meaning), " +
  "example (one short natural Japanese sentence using the word, written with furigana like a beginner textbook: " +
  "put the hiragana reading in full-width brackets right after EVERY kanji word and put a space before and after that bracketed word; " +
  "leave kana-only parts unchanged. Style: エアコンをつけて 部屋（へや） を 涼（すず） しくします。), " +
  "example_meaning (English translation of that sentence), level (best JLPT estimate: N5, N4, N3, N2 or N1). " +
  'Reply ONLY with a JSON array, same order: [{"word":"","reading":"","meaning":"english / हिंदी","example":"","example_meaning":"","level":""}].\nWords:\n' +
  words.map((w, i) => `${i + 1}. ${w}`).join("\n");

async function callGemini(parts, key, signal, label) {
  let last;
  for (const model of GEMINI_MODELS) {
    try {
      return await withRetry(`${label} ${model}`, async () => {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 16384 },
          }),
          signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, status: res.status, message: data?.error?.message || `Gemini error (${res.status})` };
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "[]";
        return { ok: true, value: parseList(text) };
      }, signal);
    } catch (e) {
      if (signal?.aborted) throw e;
      last = e;
      console.log(`${label} ${model} fail hua, agla try kar rahe hain...`);
    }
  }
  throw last;
}

export async function extractVocab(base64, mime, key, signal) {

  const raw = await callGemini([{ inlineData: { mimeType: mime, data: base64 } }, { text: WORDS_PROMPT }], key, signal, "Vision words");
  const words = [...new Set(raw.map((w) => String(typeof w === "string" ? w : w?.word || "").trim()).filter((w) => w && !isJunk(w)))].slice(0, 300);
  console.log(`Image me ${words.length} words mile. Detail bana rahe hain...`);

  const chunks = [];
  for (let i = 0; i < words.length; i += CHUNK) chunks.push(words.slice(i, i + CHUNK));
  const results = await Promise.all(
    chunks.map(async (part) => {
      try {
        const ret = await callGemini([{ text: detailPrompt(part) }], key, signal, "Vision detail");
        const byWord = new Map(ret.map((o) => [String(o?.word || "").trim(), o]));
        return part.map((w) => ({ ...(byWord.get(w) || {}), word: w }));
      } catch (e) {
        if (signal?.aborted) throw e;
        console.error("Detail group fail hua:", e.message);
        return part.map((w) => ({ word: w }));
      }
    })
  );
  return results.flat();
}