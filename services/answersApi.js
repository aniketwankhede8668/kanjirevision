export async function fetchAnswers(words, signal) {
  const r = await fetch("/api/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ words }),
    signal,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "AI error");
  return j.items;
}
