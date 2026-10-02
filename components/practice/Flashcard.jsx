import { speak } from "@/lib/speech";
import { useState } from "react";
import Example from "./Example";

export default function Flashcard({ word, index, total, onResult }) {
  const [flip, setFlip] = useState(false);
  return (
    <div>
      <div className="stage card" role="button" tabIndex={0} onClick={() => setFlip((f) => !f)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlip((f) => !f)}>
        {!flip ? (
          <div className="kanji">{word.question}</div>
        ) : (
          <div className="back">
            <div className="big">{word.reading || "-"}</div>
            <div>{word.meaning || "-"}</div>
            <Example word={word} />
          </div>
        )}
      </div>
      <div className="meta">
        <span>{index + 1} / {total} &middot; Click the card = flip</span>
        <button className="ghost" onClick={() => speak(word.reading || word.question)}>🔊 Listsen</button>
      </div>
      <div className="marks">
        <button className="btn-batsu" onClick={() => onResult(word, false)}>Weak (Didn't remember)</button>
        <button className="btn-skip" onClick={() => setFlip((f) => !f)}>Flip</button>
        <button className="btn-maru" onClick={() => onResult(word, true)}>Know It</button>
      </div>
    </div>
  );
}
