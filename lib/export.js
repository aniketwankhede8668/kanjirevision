const LABEL = { maru: "〇", batsu: "☓", skip: "ー" };

function buildRows(user, slides) {
  const st = (s) => s.mark || "skip";
  const total = slides.length;
  const maru = slides.filter((s) => st(s) === "maru").length;
  const batsu = slides.filter((s) => st(s) === "batsu").length;
  return [
    ["Name", user],
    ["Date", new Date().toLocaleDateString("en-IN")],
    ["Correct", maru],
    ["Wrong", batsu],
    ["Not Attend", total - maru - batsu],
    ["Total", total],
    ["Score %", total ? Math.round((maru / total) * 100) : 0],
    [],
    ["#", "Kanji", "Reading", "Meaning", "Status"],
    ...slides.map((s, i) => [i + 1, s.question, s.reading, s.meaning, LABEL[st(s)]]),
  ];
}

export const safeName = (n) => n.replace(/[\\/:*?"<>|]/g, "").trim() || "user";

function save(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function downloadCsv(user, slides) {
  const cell = (v) => {
    let t = String(v ?? "");
    if (typeof v === "string" && /^[=+\-@]/.test(t)) t = "'" + t;
    return `"${t.replace(/"/g, '""')}"`;
  };
  const csv = buildRows(user, slides).map((r) => r.map(cell).join(",")).join("\r\n");
  save(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `Kanji Result - ${safeName(user)}.csv`);
}

export async function downloadXlsx(user, slides) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(buildRows(user, slides));
  ws["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 40 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Result");
  XLSX.writeFile(wb, `Kanji Result - ${safeName(user)}.xlsx`);
}
