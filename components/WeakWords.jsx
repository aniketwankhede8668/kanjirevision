import { downloadCsv } from "@/lib/export";

export default function WeakWords({ user, list, onRemove, onClear, onPractice, onBack }) {
  const ok2 = list.filter((w) => w.meaning).length >= 2;
  return (
    <div>
      <div className="bar">
        <h1>Weak Words ({list.length})</h1>
        <span>
          <button disabled={!list.length} onClick={() => onPractice("flash", list)}>Flashcards</button>
          <button disabled={!ok2} onClick={() => onPractice("quiz", list)}>Quiz</button>
          <button disabled={!ok2} onClick={() => onPractice("listen", list)}>Listening</button>
          <button className="ghost" disabled={!list.length} onClick={() => downloadCsv(user, list.map((w) => ({ ...w, mark: "batsu" })))}>CSV</button>
          <button className="ghost" disabled={!list.length} onClick={onClear}>Remember</button>
          <button className="ghost" onClick={onBack}>Wapas</button>
        </span>
      </div>
      {list.length === 0 ? <p>No weak words available yet..</p> : (
        <table>
          <thead><tr><th>Kanji</th><th>Reading</th><th>Meaning</th><th>Level</th><th></th></tr></thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.question}>
                <td className="k">{w.question}</td><td>{w.reading || "-"}</td><td>{w.meaning || "-"}</td><td>{w.level || "-"}</td>
                <td><button className="ghost" onClick={() => onRemove(w.question)}>Mark as Known</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
