// LearnLevel.jsx — flip-card deck for a category. Tap to flip (front = art,
// back = word + speak). Mascot narrates; TTS speaks the phrase. Marking every
// card "known" completes the deck and awards 3 stars. Ported from
// adventure-app.jsx. Keyboard: ←/→ navigate, space/enter flips, Esc exits.
import { useState, useEffect } from 'react';
import { I } from '../art/icons.jsx';
import { art, backArt } from '../art/cardArt.jsx';
import { Burst } from '../components/Burst.jsx';
import { ZONE_THEMES } from '../data/categories.js';
import { CARDS } from '../data/cards.js';

export function LearnLevel({ cat, zone, pid, onExit, onComplete, speak, speaking }) {
  // show the FULL deck for every category (no cap). Mastered cards persist per
  // profile+zone (pip-adv-learn-<pid>-<cat>) so a big deck (e.g. 46 animals) is
  // learnable across sessions instead of demanding it all in one sitting — and
  // the kid resumes at the first card they haven't learned yet.
  const cards = CARDS[cat.id] || [];
  const lkey = `pip-adv-learn-${pid}-${cat.id}`;
  const loadKnown = () => { try { return new Set(JSON.parse(localStorage.getItem(lkey)) || []); } catch { return new Set(); } };
  const [idx, setIdx] = useState(() => { const k = loadKnown(); const i = cards.findIndex((c) => !k.has(c.id)); return i < 0 ? 0 : i; });
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(loadKnown);
  const [burst, setBurst] = useState(false);
  const card = cards[idx];
  const th = ZONE_THEMES[zone];

  const flip = () => { const nf = !flipped; setFlipped(nf); if (nf) speak(card.phrase); };
  const go = (d) => { setIdx((i) => (i + d + cards.length) % cards.length); setFlipped(false); };
  const know = () => {
    if (known.has(card.id)) return;
    const next = new Set(known); next.add(card.id); setKnown(next); setBurst(true);
    try { localStorage.setItem(lkey, JSON.stringify([...next])); } catch { /* private mode */ }
    speak('Learned!');
    if (next.size >= cards.length) setTimeout(() => onComplete(3), 800);
    else setTimeout(() => go(1), 700);
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if ((e.key === ' ' || e.key === 'Enter') && e.target === document.body) { e.preventDefault(); flip(); }
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, flipped, known]);

  return (
    <div className="level" data-screen-label={`Learn: ${cat.name}`}
      style={{ background: `linear-gradient(180deg, ${th.sky[0]}, ${th.sky[1]} 75%, ${th.ground})`, '--zc': `var(--cat-${cat.color}-1)` }}>
      <div className="level-hud">
        <button className="gbtn white round" aria-label="Back to map" data-testid="level-exit" onClick={onExit} style={{ minHeight: 50, width: 50 }}><I n="close" s={22} /></button>
        <div className="level-bar"><i style={{ width: `${(known.size / cards.length) * 100}%` }} /></div>
        <span className="hud-pill" style={{ height: 44, fontSize: 16 }}>{known.size}/{cards.length}</span>
      </div>
      <div className="level-stage">
        <span className="arrowg l"><button className="gbtn white round" aria-label="Previous card" data-testid="nav-prev" onClick={() => go(-1)}><I n="back" /></button></span>
        <button key={card.id} className={`acard ${flipped ? 'flipped' : ''}`} data-testid="flashcard"
          aria-label={flipped ? `${card.word}. Tap to flip back.` : 'Card. Tap to reveal.'} onClick={flip}>
          <span className="acard-3d">
            <span className="aface front"><span className="frame" />{art(card, 180)}<span className="ahint">tap the card!</span></span>
            <span className="aface back" data-testid="flashcard-flip">
              <span className="frame" />
              <span style={{ color: `var(--cat-${cat.color}-1)` }}>{backArt(card, 110)}</span>
              <span className="aword">{card.word}</span>
              {card.badge && <span className="abadge">{card.badge.label}</span>}
            </span>
          </span>
        </button>
        <span className="arrowg r"><button className="gbtn white round" aria-label="Next card" data-testid="nav-next" onClick={() => go(1)}><I n="next" /></button></span>
      </div>
      <div className="level-foot">
        <button className={`speakg ${speaking ? 'playing' : ''}`} aria-label="Hear it" data-testid="speak-button"
          onClick={() => speak(card.phrase)}>
          <span className="ring" /><span className="ring" /><I n="sound" s={32} />
        </button>
        <button className="gbtn" data-testid="mastered-button" disabled={!flipped && !known.has(card.id)} onClick={know}>
          <I n={known.has(card.id) ? 'check' : 'star'} s={22} />
          {known.has(card.id) ? 'Got it!' : flipped ? 'I know this!' : 'Flip the card first'}
        </button>
      </div>
      {burst && <Burst onDone={() => setBurst(false)} />}
    </div>
  );
}
