export const promptFor = (words, asObject) =>
  "You are a Japanese teacher. For each Japanese word below give its hiragana reading and its meaning in English. " +
  "Reply ONLY with valid JSON. Do not include markdown, code fences, explanations, or any text outside the JSON. " +
  "Keep the exact same order as the input words. " +
  (asObject
    ? '{"items":[{"word":"...","reading":"hiragana","meaning":"English"}]}'
    : '[{"word":"...","reading":"hiragana","meaning":"English"}]') +
  ".\nWords:\n" +
  words.map((w, i) => `${i + 1}. ${w}`).join("\n");


export function parseList(text) {
  if (!text || typeof text !== "string") {
    throw new Error("AI returned an empty response.");
  }

  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid JSON received from Gemini:");
    console.error(text);

    throw new Error(
      `AI returned invalid JSON: ${error.message}`
    );
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed?.items;

  if (!Array.isArray(list)) {
    throw new Error("AI returned an invalid response format.");
  }

  return list;
}