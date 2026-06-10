import { useEffect } from 'react';
import { Icon } from './Icon.jsx';

const COLORS = ['var(--pop-sun)', 'var(--pop-coral)', 'var(--pop-teal)', 'var(--pop-sky)', 'var(--pop-grass)', 'var(--pop-grape)'];

export function Confetti({ show, onDone }) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone && onDone(), reduce ? 700 : 1600);
    return () => clearTimeout(t);
  }, [show, reduce, onDone]);
  if (!show) return null;
  if (reduce) {
    return <div className="rm-celebrate"><Icon name="check" size={40} color="#fff" /> Nice!</div>;
  }
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${Math.random() * 0.3}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: i % 3 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
