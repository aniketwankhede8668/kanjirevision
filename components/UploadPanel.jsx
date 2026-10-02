export default function UploadPanel({ count, seconds, onSeconds, aiLoading, extracting, error, onFile, onStart, onPractice, weakCount, onWeak,onExit }) {
  const busy = aiLoading || extracting;
  return (
    <div className="panel noprint">
      <label>Please upload a file or image in one of the supported formats: .pptx, .xlsx, .csv, .png, .jpg, or .webp.
        <input type="file" accept=".pptx,.xlsx,.xls,.csv,image/png,image/jpeg,image/webp" onChange={onFile} disabled={extracting} />
      </label>
      {error && <p className="err">{error}</p>}
      {extracting && (<p>Extracting Japanese vocabulary from the image...</p>)}
      {aiLoading && (<p>⚡ Powering up your Japanese... Get ready to level up! 🚀</p>)}
      {count > 0 && !aiLoading && (<p>{count} words found and arranged in random order.</p>)}

      <label>How many seconds should each slide be displayed in the slideshow?
        <input type="number" min="1" max="120" value={seconds}
          onChange={(e) => onSeconds(Math.max(1, +e.target.value || 1))} />
      </label>
      <button disabled={!count} onClick={onStart}>Start Slideshow</button>

      <div className="marks">
        <button disabled={!count || busy} onClick={() => onPractice("flash")}>Flashcards</button>
        <button disabled={!count || busy} onClick={() => onPractice("quiz")}>Quiz</button>
        <button disabled={!count || busy} onClick={() => onPractice("listen")}>Listening</button>
      </div>
      <button className="ghost" disabled={!weakCount} onClick={onWeak}>Weak Words({weakCount})</button>
    </div>
  );
}
