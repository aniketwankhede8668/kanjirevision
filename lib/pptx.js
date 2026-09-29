import JSZip from "jszip";

const NUM = /\s*\d+\s*[\/\uFF0F]\s*\d+\s*$/;

function texts(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.getElementsByTagName("a:p")]
    .map((p) =>
      [...p.getElementsByTagName("a:t")]
        .filter((t) => t.parentNode.nodeName !== "a:fld")
        .map((t) => t.textContent)
        .join("")
        .replace(NUM, "")
    )
    .filter((s) => s.trim() && !/^\d+$/.test(s.trim()))
    .join("\n");
}

export async function parsePptx(file) {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const out = [];
  for (const n of names) {
    const question = texts(await zip.file(n).async("string"));
    let answer = "";
    const rels = zip.file(n.replace("slides/", "slides/_rels/") + ".rels");
    if (rels) {
      const m = (await rels.async("string")).match(/Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/);
      const nf = m && zip.file("ppt/notesSlides/" + m[1]);
      if (nf) answer = texts(await nf.async("string"));
    }
    const [reading = "", ...rest] = answer.replace(/\n/g, " ").split("|");
    if (question) out.push({ question, reading: reading.trim(), meaning: rest.join("|").trim() });
  }
  return out;
}
