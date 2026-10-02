export async function extractFromImage(image, mime, signal) {
  const r = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mime }),
    signal,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Extract error");
  return j.items;
}
