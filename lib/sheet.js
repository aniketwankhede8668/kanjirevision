const norm = (v) => String(v ?? "").trim().toLowerCase();
const KANJI = ["kanji", "question", "word", "漢字"];
const READING = ["reading", "yomi", "hiragana", "読み"];
const MEANING = ["meaning", "answer", "imi", "意味"];

function rowsToSlides(rows) {
  const h = rows.findIndex((r) => r.some((c) => KANJI.includes(norm(c))));
  let col = { k: 0, r: 1, m: 2 };
  let start = 0;
  if (h >= 0) {
    const hdr = rows[h].map(norm);
    const find = (list) => hdr.findIndex((c) => list.includes(c));
    col = { k: find(KANJI), r: find(READING), m: find(MEANING) };
    start = h + 1;
  }
  const get = (r, i) => (i >= 0 ? String(r[i] ?? "").trim() : "");
  return rows
    .slice(start)
    .map((r) => ({ question: get(r, col.k), reading: get(r, col.r), meaning: get(r, col.m) }))
    .filter((x) => x.question);
}

export async function parseSheet(file) {
  const XLSX = await import("xlsx");
  const wb = file.name.toLowerCase().endsWith(".csv")
    ? XLSX.read(await file.text(), { type: "string" })
    : XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
  return rowsToSlides(rows);
}
