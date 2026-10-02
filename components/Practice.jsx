import { downloadCsv, downloadXlsx } from "@/lib/export";
import { downloadPdf } from "@/lib/exportPdf";
import { useRef, useState } from "react";
import Choice from "./practice/Choice";
import Flashcard from "./practice/Flashcard";

const TITLE = {
  flash: "Flashcards",
  quiz: "Quiz",
  listen: "Listening",
};

export default function Practice({
  user,
  type,
  words,
  onWeak,
  onKnown,
  onReview,
  onExit,
}) {
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState([]);

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const areaRef = useRef(null);

  const record = (w, ok) => {
    if (ok) {
      setRight((r) => r + 1);
      onKnown(w);
    } else {
      setWrong((x) => [...x, w]);
      onWeak(w);
    }

    setI((n) => n + 1);
  };

  const handlePdf = async () => {
    setPdfBusy(true); setPdfError("");
    try {
      await downloadPdf(areaRef.current, user);
    } catch (e) {
      console.error("PDF error:", e);
      setPdfError("PDF not generated: " + e.message);
    }
    setPdfBusy(false);
  };

  if (i >= words.length) {
    const min = type === "flash" ? 1 : 2;

    return (
      <div>
        <div className="bar noprint">
          <h1>{TITLE[type]} Finished</h1>

          <span>
            <button
              disabled={pdfBusy}
              onClick={handlePdf}
            >
              {pdfBusy ? "PDF is generating..." : "PDF Download"}
            </button>

            <button
              onClick={() => downloadXlsx("Practice", wrong)}
            >
              Excel Download
            </button>

            <button
              onClick={() => downloadCsv("Practice", wrong)}
            >
              CSV Download
            </button>

            <button className="ghost" onClick={onExit}>
              Back
            </button>
          </span>
        </div>

        {pdfError && <p className="err noprint">{pdfError}</p>}

        <div ref={areaRef} className="pdf-area">
          <div className="print-only print-head">
            <h2>{TITLE[type]} - Weak Words</h2>
            <p>Date: {new Date().toLocaleDateString("en-IN")}</p>
          </div>

          <div className="summary">
            <div>
              <b>{right}</b>
              Correct
            </div>

            <div>
              <b>{wrong.length}</b>
              Weak
            </div>

            <div>
              <b>{words.length}</b>
              Total
            </div>
          </div>

          {wrong.length > 0 ? (
            <>
              <h2>Weak Words</h2>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Kanji</th>
                    <th>Reading</th>
                    <th>Meaning</th>
                  </tr>
                </thead>

                <tbody>
                  {wrong.map((w, index) => (
                    <tr key={`${w.question}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="k">{w.question}</td>
                      <td>{w.reading || "-"}</td>
                      <td>{w.meaning || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>Excellent! No weak words.</p>
          )}
        </div>

        <div className="row noprint">
          {wrong.length >= min && (
            <button onClick={() => onReview(wrong)}>
              Weak words Again ({wrong.length})
            </button>
          )}

          <button className="ghost" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const word = words[i];

  return (
    <div>
      <div className="bar">
        <h1>{TITLE[type]}</h1>

        <button className="ghost" onClick={onExit}>
          Stop It
        </button>
      </div>

      {type === "flash" ? (
        <Flashcard
          key={i}
          word={word}
          index={i}
          total={words.length}
          onResult={record}
        />
      ) : (
        <Choice
          key={i}
          type={type}
          word={word}
          pool={words}
          index={i}
          total={words.length}
          onResult={record}
        />
      )}
    </div>
  );
}