export default function Example({ word }) {
  if (!word.example) return null;
  return (
    <div className="example">
      <div>{word.example}</div>
      {word.exampleMeaning && (
        <>
          <div><b>Meaning:</b></div>
          <div>{word.exampleMeaning}</div>
        </>
      )}
    </div>
  );
}
