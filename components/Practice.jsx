import { useState } from "react";
import Choice from "./practice/Choice";
import Flashcard from "./practice/Flashcard";

const TITLE = { flash: "Flashcards", quiz: "Quiz", listen: "Listening" };

export default function Practice({ type, words, onWeak, onKnown, onReview, onExit }) {
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState([]);

  const record = (w, ok) => {
    if (ok) { setRight((r) => r + 1); onKnown(w); }
    else { setWrong((x) => [...x, w]); onWeak(w); }
    setI((n) => n + 1);
  };

  if (i >= words.length) {
    const min = type === "flash" ? 1 : 2;
    return (
      <div className="panel">
        <h1>{TITLE[type]} Finished</h1>
        <div className="summary">
          <div><b>{right}</b>Correct</div>
          <div><b>{wrong.length}</b>Weak</div>
          <div><b>{words.length}</b>Total</div>
        </div>
        {wrong.length > 0 && (
          <p>Weak words: {wrong.map((w) => w.question).join("?")}</p>
        )}
        <div className="row">
          {wrong.length >= min && <button onClick={() => onReview(wrong)}>Weak words Again ({wrong.length})</button>}
          <button className="ghost" onClick={onExit}>Back</button>
        </div>
      </div>
    );
  }
  const word = words[i];
  return (
    <div>
      <div className="bar"><h1>{TITLE[type]}</h1><button className="ghost" onClick={onExit}>Stop It</button></div>
      {type === "flash"
        ? <Flashcard key={i} word={word} index={i} total={words.length} onResult={record} />
        : <Choice key={i} type={type} word={word} pool={words} index={i} total={words.length} onResult={record} />}
    </div>
  );
}
