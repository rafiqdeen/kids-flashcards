// SpeedPills.jsx — a shared 🐢/🐰/⚡ speed control for games whose targets move or
// are auto-timed (Bubble Pop, Balloon Float, Tunnel Runner, Peek-a-Boo, Pip Says,
// Mystery Boxes, Card Fountain). `value` is an index into SPEEDS (games/util.jsx);
// the game applies SPEEDS[value].mul as `duration / mul` (higher mul = faster).
// Lets a child who needs more time slow the moving pieces down.
import { SPEEDS } from './util.jsx';
import { advSfx } from '../audio.js';

export function SpeedPills({ value, onChange, disabled }) {
  return (
    <div className="speed-ctl" role="group" aria-label="Speed">
      {SPEEDS.map((s, i) => (
        <button key={s.key} type="button" className={`speed-btn ${value === i ? 'on' : ''}`}
          data-nav aria-pressed={value === i} disabled={disabled} aria-label={`${s.label} speed`}
          onClick={() => { advSfx('tap'); onChange(i); }}>
          <span className="speed-emoji" aria-hidden="true">{s.emoji}</span>{s.label}
        </button>
      ))}
    </div>
  );
}
