export default function UploadPanel({ count, seconds, onSeconds, aiLoading, error, onFile, onStart }) {
  return (
    <div className="panel noprint">
      <label>Upload a PPT (.pptx)
        <input type="file" accept=".pptx" onChange={onFile} />
      </label>
      {error && <p className="err">{error}</p>}
      {count > 0 && <p>{count} Slides found and shuffled into a random order.</p>}
      {aiLoading && <p>Generating readings and meanings with AI...</p>}
      <label>Slide duration (seconds)
        <input type="number" min="1" max="120" value={seconds}
          onChange={(e) => onSeconds(Math.max(1, +e.target.value || 1))} />
      </label>
      <button disabled={!count} onClick={onStart}>Start Slides</button>
    </div>
  );
}
