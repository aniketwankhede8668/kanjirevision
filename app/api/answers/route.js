import { NextResponse } from "next/server";
import { generateAnswers } from "@/lib/ai";

export async function POST(req) {
  try {
    const { words } = await req.json();
    if (!Array.isArray(words) || words.length === 0 || words.length > 300)
      return NextResponse.json({ error: "Invalid words list." }, { status: 400 });
    const items = await generateAnswers(words.map((w) => String(w).slice(0, 60)), req.signal);
    return NextResponse.json({ items });
  } catch (e) {
    if (req.signal.aborted) {
      console.log("Request cancelled (logout or tab closed). AI generation stopped.");
      return new Response(null, { status: 499 });
    }
    console.error("Answers route error:", e);
    return NextResponse.json({ error: e?.message || "AI could not generate a response. Please try again." }, { status: e?.status || 502 });
  }
}
