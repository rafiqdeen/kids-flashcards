// Burst.jsx — confetti burst. Honors prefers-reduced-motion (renders nothing).
// Particle positions use Math.random, so they're generated in an effect (not
// during render) and held in state. Ported from adventure-app.jsx.
import { useState, useEffect } from 'react';

const COLS = ['#ffc83d', '#ff4b4b', '#58cc02', '#1cb0f6', '#a560e8', '#ff9600'];

export function Burst({ onDone }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [bits, setBits] = useState([]);
  useEffect(() => {
    if (!reduce) {
      setBits(Array.from({ length: 30 }).map((_, i) => {
        const a = (i / 30) * Math.PI * 2, r = 140 + Math.random() * 190;
        return { bg: COLS[i % 6], dx: `${Math.cos(a) * r}px`, dy: `${Math.sin(a) * r - 80}px`, rot: `${Math.random() * 600}deg` };
      }));
    }
    const t = setTimeout(onDone, reduce ? 300 : 1250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (reduce) return null;
  return (
    <div className="burst2" aria-hidden="true">
      {bits.map((b, i) => <i key={i} style={{ background: b.bg, '--dx': b.dx, '--dy': b.dy, '--rot': b.rot }} />)}
    </div>
  );
}
