export const promptFor = (words, asObject) =>
  "You are a Japanese teacher. For each Japanese word below give its hiragana reading and its meaning " +
  "in English. Reply ONLY with JSON, same order, " +
  (asObject
    ? '{"items":[{"word":"...","reading":"hiragana","meaning":"English"}]}'
    : 'a JSON array of {"word":"...","reading":"hiragana","meaning":"English"}') +
  ".\nWords:\n" +
  words.map((w, i) => `${i + 1}. ${w}`).join("\n");

export function parseList(text) {
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  const list = Array.isArray(parsed) ? parsed : parsed?.items;
  if (!Array.isArray(list)) throw new Error("AI returned an invalid response format.");
  return list;
}
