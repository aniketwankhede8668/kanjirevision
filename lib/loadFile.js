import { parsePptx } from "./pptx";
import { parseSheet } from "./sheet";

export async function loadFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pptx")) return parsePptx(file);
  if (/\.(xlsx|xls|csv)$/.test(name)) return parseSheet(file);
  throw new Error("Sirf .pptx, .xlsx ya .csv file chalegi");
}
