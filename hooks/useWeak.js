"use client";
import { useState } from "react";

export function useWeak() {
  const [map, setMap] = useState({});
  return {
    list: Object.values(map),
    add: (w) => setMap((m) => ({ ...m, [w.question]: w })),
    remove: (q) => setMap((m) => { const n = { ...m }; delete n[q]; return n; }),
    clear: () => setMap({}),
  };
}
