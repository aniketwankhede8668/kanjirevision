import { downloadCsv, downloadXlsx } from "@/lib/export";
import { downloadPdf } from "@/lib/exportPdf";
import { useRef, useState } from "react";

const LABEL = { maru: "〇", batsu: "☓", skip: "ー" };

export default function AnswersTable({ user, slides, status, error, onRetry, onRestart }) {
  const areaRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const st = (s) => s.mark || "skip";
  const total = slides.length;
  const maru = slides.filter((s) => st(s) === "maru").length;
  const batsu = slides.filter((s) => st(s) === "batsu").length;
  const skip = total - maru - batsu;
  const percent = total ? Math.round((maru / total) * 100) : 0;
  const loading = status === "loading";

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

  return (
    <div>
      <div className="bar noprint">
        <h1>Answers</h1>
        <span>
          <button disabled={loading || pdfBusy} onClick={handlePdf}>{pdfBusy ? "PDF is generating..." : "PDF download"}</button>
          <button disabled={loading} onClick={() => downloadXlsx(user, slides)}>Excel Download</button>
          <button disabled={loading} onClick={() => downloadCsv(user, slides)}>CSV Download</button>
          <button className="ghost" onClick={onRestart}>Re-Test</button>
        </span>
      </div>

      {loading && <p className="noprint">AI is processing the input and generating its meaning...</p>}
      {status === "error" && (
        <p className="err noprint">{error} <button className="ghost" onClick={onRetry}>Try Again</button></p>
      )}
      {pdfError && <p className="err noprint">{pdfError}</p>}

      <div ref={areaRef} className="pdf-area">
        <div className="print-only print-head">
          <h2>Kanji Answers</h2>
          <p>Name: <b>{user}</b> &nbsp;|&nbsp; Date: {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <div className="summary">
          <div><b>{maru}</b>Correct</div>
          <div><b>{batsu}</b>wrong</div>
          <div><b>{skip}</b>Not Attend</div>
          <div><b>{total}</b>Total</div>
          <div><b>{percent}%</b>Score</div>
        </div>

        <table>
          <thead><tr><th>#</th><th>Kanji</th><th>Reading</th><th>Meaning</th><th>Status</th></tr></thead>
          <tbody>
            {slides.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td><td className="k">{s.question}</td>
                <td>{s.reading || "-"}</td><td>{s.meaning || "-"}</td>
                <td>{LABEL[st(s)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
