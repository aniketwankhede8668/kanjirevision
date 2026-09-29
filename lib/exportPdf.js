import { safeName } from "./export";

export async function downloadPdf(element, user) {
  const html2pdf = (await import("html2pdf.js")).default;
  await html2pdf()
    .set({
      margin: 10,
      filename: `Kanji Answers - ${safeName(user)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        backgroundColor: "#ffffff",
        onclone: (doc) => doc.querySelectorAll(".print-only").forEach((e) => (e.style.display = "block")),
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ["tr"] },
    })
    .from(element)
    .save();
}
