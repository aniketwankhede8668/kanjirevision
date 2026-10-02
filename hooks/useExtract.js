"use client";
import { prepareImage } from "@/lib/image";
import { extractFromImage } from "@/services/extractApi";
import { useRef, useState } from "react";

export function useExtract() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const ctrl = useRef(null);

  const run = async (file) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus("loading"); setError("");
    try {
      const { image, mime } = await prepareImage(file);
      const items = await extractFromImage(image, mime, c.signal);
      if (c.signal.aborted) return null;
      setStatus("");
      return items;
    } catch (e) {
      if (c.signal.aborted || e.name === "AbortError") return null;
      setStatus("error"); setError(e.message);
      return null;
    }
  };
  return { status, error, run, reset: () => { ctrl.current?.abort(); ctrl.current = null; setStatus(""); setError(""); } };
}
