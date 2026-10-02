import { NextResponse } from "next/server";
import { extractVocab } from "@/lib/ai/vision";

const MIMES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    return NextResponse.json({ error: "To extract vocabulary from images, a valid GEMINI_API_KEY must be configured in the .env.local environment file." }, { status: 500 });
  try {
    const { image, mime } = await req.json();
    if (typeof image !== "string" || !MIMES.includes(mime) || image.length > 6_000_000)
      return NextResponse.json({ error: "The uploaded image is invalid, unsupported, or exceeds the maximum allowed file size. Supported formats are PNG, JPG, and WebP." }, { status: 400 });
    const list = await extractVocab(image, mime, key, req.signal);
    const seen = new Set();
    const items = list
      .map((o) => ({
        question: String(o?.word || "").trim().slice(0, 60),
        reading: String(o?.reading || "").trim(),
        meaning: String(o?.meaning || "").trim(),
        example: String(o?.example || "").trim(),
        exampleMeaning: String(o?.example_meaning || "").trim(),
        level: String(o?.level || "").trim(),
      }))
      .filter((x) => x.question && !seen.has(x.question) && seen.add(x.question))
      .slice(0, 300);
    return NextResponse.json({ items });
  } catch (e) {
    if (req.signal.aborted) {
      console.log("Image extraction was cancelled before completion.");
      return new Response(null, { status: 499 });
    }
    console.error("Extract route error:", e);
    return NextResponse.json({ error: e?.message || "Unable to extract vocabulary from the uploaded image." }, { status: 502 });
  }
}
