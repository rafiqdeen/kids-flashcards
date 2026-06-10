export function ProgressTrack({ steps = 3, active = 0 }) {
  return (
    <div className="prog-track" role="progressbar" aria-valuemin="0" aria-valuemax={steps} aria-valuenow={active}>
      {Array.from({ length: steps }).map((_, i) => (
        <span key={i} className={`prog-seg ${i < active ? 'on' : ''}`} />
      ))}
    </div>
  );
}
