"use client";
import { fetchAnswers } from "@/services/answersApi";
import { useRef, useState } from "react";

export function useAnswers(setSlides) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const ctrl = useRef(null);

  const enrich = async (data) => {
    const need = [...new Set(data.filter((s) => !s.reading || !s.meaning).map((s) => s.question))];
    if (!need.length) return;
    ctrl.current?.abort(); 
    const c = new AbortController();
    ctrl.current = c;
    setStatus("loading"); setError("");
    try {
      const items = await fetchAnswers(need, c.signal);
      if (c.signal.aborted) return;
      setSlides((prev) => prev.map((s) => {
        const a = items[s.question];
        return a ? { ...s, reading: s.reading || a.reading, meaning: s.meaning || a.meaning } : s;
      }));
      setStatus("");
    } catch (e) {
      if (c.signal.aborted || e.name === "AbortError") return; 
      setStatus("error"); setError(e.message);
    }
  };

  return { status, error, enrich, reset: () => { ctrl.current?.abort(); ctrl.current = null; setStatus(""); setError(""); } };
}
