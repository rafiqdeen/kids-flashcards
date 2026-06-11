import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon.jsx';
import { Illu } from '../art/Illu.jsx';
import { Mascot } from '../components/Mascot.jsx';
import { FlashCard } from '../components/FlashCard.jsx';
import { ProgressTrack } from '../components/ProgressTrack.jsx';
import { StreakBadge } from '../components/StreakBadge.jsx';
import { Confetti } from '../components/Confetti.jsx';
import { announce } from '../speech.js';

// small peek art helper (side peeks + thumb strip)
function peekArt(card, size = 56) {
  if (!card) return null;
  const f = card.front;
  if (f.kind === 'mega') return <span className="peek-mega">{f.text}</span>;
  if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
  return <Illu name={f.name} char={f.char} size={size} />;
}

export function Deck({ cat, cards, onBack, onQuiz, progress, onMaster, mascot, speak, speaking }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [streakMsg, setStreakMsg] = useState(null);
  const [complete, setComplete] = useState(false);
  const learned = progress.learnedSet || new Set();
  const card = cards[idx];
  const total = cards.length;

  const go = useCallback((d) => {
    setIdx((i) => (i + d + total) % total);
    setFlipped(false);
  }, [total]);

  const doFlip = useCallback(() => {
    setFlipped((f) => {
      const nf = !f;
      if (nf) { speak(card.phrase); announce(card.phrase); }
      return nf;
    });
  }, [card, speak]);

  const doSpeak = () => { speak(card.phrase); announce(card.phrase); };

  const master = () => {
    if (learned.has(card.id)) return;
    onMaster(card.id);
    const ns = streak + 1;
    setStreak(ns);
    setCelebrate(true);
    if (ns > 0 && ns % 3 === 0) { setStreakMsg(ns); speak(`${ns} in a row!`); }
    else speak('Learned!');
    announce('Learned!');
    if ((learned.size + 1) >= total) setTimeout(() => setComplete(true), 900);
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName !== 'BUTTON' && e.target.getAttribute?.('role') !== 'button') {
        e.preventDefault();
        doFlip();
      } else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, doFlip, onBack]);

  const prevCard = cards[(idx - 1 + total) % total];
  const nextCard = cards[(idx + 1) % total];
  const isMastered = learned.has(card.id);

  return (
    <div className="screen deck" data-screen-label={`Deck: ${cat.name}`}
      style={{ '--c1': `var(--cat-${cat.color}-1)`, '--c2': `var(--cat-${cat.color}-2)` }}>
      <header className="deck-bar">
        <button className="round-btn" aria-label="Back home" data-testid="deck-back" onClick={onBack}><Icon name="back" size={26} /></button>
        <div className="deck-title">
          <span className="deck-chip"><Illu name={cat.icon.name} char={cat.icon.char} hex={cat.icon.hex} size={28} /></span>
          <b>{cat.name}</b>
          <ProgressTrack steps={3} active={Math.min(3, Math.ceil((learned.size / total) * 3))} />
          <small>{learned.size}/{total} learned</small>
        </div>
        <button className="quiz-btn" data-testid="quiz-start" onClick={onQuiz}><Icon name="star" size={20} /> Quiz</button>
      </header>

      <div className="deck-stage">
        <button className="nav-arrow left" aria-label="Previous card" data-testid="nav-prev" onClick={() => go(-1)}><Icon name="back" size={30} /></button>
        <div className="side-peek left" aria-hidden="true"><span style={{ color: `var(--cat-${cat.color}-1)` }}>{peekArt(prevCard)}</span></div>

        <FlashCard card={card} catColor={cat.color} flipped={flipped} onFlip={doFlip}
          onSpeak={doSpeak} speaking={speaking} mastered={isMastered} />

        <div className="side-peek right" aria-hidden="true"><span style={{ color: `var(--cat-${cat.color}-1)` }}>{peekArt(nextCard)}</span></div>
        <button className="nav-arrow right" aria-label="Next card" data-testid="nav-next" onClick={() => go(1)}><Icon name="next" size={30} /></button>
      </div>

      <div className="deck-foot">
        <span className="deck-pos">{idx + 1} of {total}</span>
        <StreakBadge n={streak} />
        <button data-testid="mastered-button"
          className={`mastered-btn ${isMastered ? 'done' : flipped ? 'ready' : 'wait'}`}
          disabled={!flipped && !isMastered} onClick={master}>
          <Icon name={isMastered ? 'check' : 'star'} size={22} />
          {isMastered ? 'Learned!' : flipped ? 'I know this!' : 'Flip first'}
        </button>
      </div>

      <div className="thumb-strip" role="tablist" aria-label="Cards">
        {cards.map((c, i) => (
          <button key={c.id} className={`thumb ${i === idx ? 'active' : ''} ${learned.has(c.id) ? 'learned' : ''}`}
            onClick={() => { setIdx(i); setFlipped(false); }} aria-label={`Card ${i + 1}`} role="tab" aria-selected={i === idx}>
            <span style={{ color: `var(--cat-${cat.color}-1)` }}>{peekArt(c, 30)}</span>
            {learned.has(c.id) && <span className="thumb-star"><Icon name="star" size={12} color="#fff" /></span>}
          </button>
        ))}
      </div>

      <Confetti show={celebrate} onDone={() => setCelebrate(false)} />
      {streakMsg && (
        <div className="streak-pop" onAnimationEnd={() => setStreakMsg(null)}>
          <Mascot concept={mascot} state="cheer" size={90} /><b>{streakMsg} in a row!</b>
        </div>
      )}
      {complete && (
        <div className="modal-scrim" data-testid="category-complete">
          <div className="trophy-modal">
            <Mascot concept={mascot} state="cheer" size={120} />
            <div className="trophy"><Icon name="star" size={64} color="#fff" /></div>
            <h2>You did it!</h2>
            <p>You learned every {cat.name.toLowerCase()} card!</p>
            <div className="trophy-stars"><Icon name="star" size={28} /><Icon name="star" size={28} /><Icon name="star" size={28} /></div>
            <div className="trophy-actions">
              <button className="pip-cta" onClick={onQuiz}><Icon name="star" size={20} /> Take the quiz</button>
              <button className="pip-cta ghost" onClick={onBack}>Back home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
