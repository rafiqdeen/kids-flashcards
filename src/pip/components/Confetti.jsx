import { useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';

const COLORS = ['var(--pop-sun)', 'var(--pop-coral)', 'var(--pop-teal)', 'var(--pop-sky)', 'var(--pop-grass)', 'var(--pop-grape)'];

const makePieces = () =>
  Array.from({ length: 40 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    background: COLORS[i % COLORS.length],
    animationDelay: `${Math.random() * 0.3}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
    borderRadius: i % 3 === 0 ? '50%' : '2px',
  }));

export function Confetti({ show, onDone }) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // randomize once per burst (in the effect, not render) so re-renders
  // mid-fall don't reshuffle pieces
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!show) return;
    // one-shot randomization per burst — must not run during render (purity)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(makePieces());
    const t = setTimeout(() => onDone && onDone(), reduce ? 700 : 1600);
    return () => clearTimeout(t);
  }, [show, reduce, onDone]);
  if (!show) return null;
  if (reduce) {
    return <div className="rm-celebrate"><Icon name="check" size={40} color="#fff" /> Nice!</div>;
  }
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => <span key={i} style={style} />)}
    </div>
  );
}
