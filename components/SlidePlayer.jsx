export default function SlidePlayer({ slide, index, total, seconds, paused, onTogglePause, onMark }) {
  return (
    <div className="noprint">
      <div className="stage" aria-live="polite">
        <div className="kanji">{slide.question}</div>
        {!paused && <div key={index} className="timer" style={{ animationDuration: seconds + "s" }} />}
      </div>
      <div className="marks">
        <button className="btn-maru" onClick={() => onMark("maru")}>〇</button>
        <button className="btn-batsu" onClick={() => onMark("batsu")}>☓</button>
        <button className="btn-skip" onClick={() => onMark("skip")}>Not Attend</button>
      </div>
      <div className="meta">
        <span>{index + 1} / {total} &middot; Time is up = Not Attend</span>
        <button className="ghost" onClick={onTogglePause}>{paused ? "Resume" : "Pause"}</button>
      </div>
    </div>
  );
}
