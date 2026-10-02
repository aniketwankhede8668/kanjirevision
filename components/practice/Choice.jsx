import { shuffle } from "@/lib/shuffle";
import { canSpeak, speak } from "@/lib/speech";
import { useEffect, useMemo, useState } from "react";
import Example from "./Example";

export default function Choice({ type, word, pool, index, total, onResult }) {
  const listen = type === "listen";
  const [picked, setPicked] = useState(null);

  const options = useMemo(() => {
    const label = (w) => (listen ? w.question : w.meaning);
    const others = pool.filter((p) => p.question !== word.question && label(p) !== label(word));
    const unique = [...new Map(others.map((o) => [label(o), o])).values()];
    return shuffle([word, ...shuffle(unique).slice(0, 3)]).map((w) => ({ label: label(w), ok: w.question === word.question }));
  }, [word, pool, listen]);

  useEffect(() => { if (listen) speak(word.reading || word.question); }, [listen, word]);

  const answered = picked !== null;
  const ok = answered && options[picked].ok;
  return (
    <div>
      <div className="stage">
        {listen
          ? <button className="speak" aria-label="Listsen Again" onClick={() => speak(word.reading || word.question)}>🔊</button>
          : <div className="kanji">{word.question}</div>}
      </div>
      {listen && !canSpeak() && <p className="err">Audio playback is not supported in this browser.</p>}
      <div className="opts">
        {options.map((o, i) => (
          <button key={i} disabled={answered}
            className={"opt" + (answered ? (o.ok ? " good" : picked === i ? " bad" : "") : "")}
            onClick={() => setPicked(i)}>
            {answered ? (o.ok ? "✓ " : picked === i ? "✗ " : "") : ""}{o.label}
          </button>
        ))}
      </div>
      {answered && (
        <div className="feedback">
          <b>{ok ? "Sahi!" : "Galat"}</b>
          <span>{word.question} &middot; {word.reading || "-"} &middot; {word.meaning || "-"} {word.level && <span className="badge">{word.level}</span>}</span>
          <Example word={word} />
          <div className="row"><button onClick={() => onResult(word, ok)}>Next</button></div>
        </div>
      )}
      <div className="meta"><span>{index + 1} / {total}</span></div>
    </div>
  );
}
