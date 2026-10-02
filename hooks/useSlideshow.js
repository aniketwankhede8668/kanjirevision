"use client";
import { useEffect, useState } from "react";

export function useSlideshow(total) {
  const [idx, setIdx] = useState(-1);
  const [seconds, setSeconds] = useState(5);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (idx < 0 || idx >= total || paused) return;
    const t = setTimeout(() => setIdx((i) => i + 1), seconds * 1000);
    return () => clearTimeout(t);
  }, [idx, paused, total, seconds]);

  return {
    idx, seconds, paused, setSeconds,
    playing: idx >= 0 && idx < total,
    done: total > 0 && idx >= total,
    start: () => setIdx(0),
    next: () => setIdx((i) => i + 1),
    restart: () => { setPaused(false); setIdx(0); },
    togglePause: () => setPaused((p) => !p),
    reset: () => { setIdx(-1); setPaused(false); },
  };
}
