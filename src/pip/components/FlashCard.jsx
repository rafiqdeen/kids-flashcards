import { Icon } from './Icon.jsx';
import { Illu } from '../art/Illu.jsx';
import { SpeakButton } from './SpeakButton.jsx';

function CardFront({ card, catColor }) {
  const f = card.front;
  if (f.kind === 'mega')
    return <div className="card-mega" style={{ color: `var(--cat-${catColor}-1)` }}>{f.text}</div>;
  if (f.kind === 'swatch')
    return <div style={{ color: f.hex }}><Illu name="swatch" hex={f.hex} size={150} /></div>;
  if (f.kind === 'shape')
    return <div style={{ color: `var(--cat-${catColor}-1)` }}><Illu name={f.name} size={150} /></div>;
  return <div style={{ color: `var(--cat-${catColor}-1)` }}><Illu name={f.name} char={f.char} size={170} /></div>;
}

function CardBack({ card, catColor, onSpeak, speaking }) {
  const backIllu = card.illu || (card.front.kind === 'illu' ? card.front.name : null);
  return (
    <div className="card-back-inner">
      <div className="card-back-visual" style={{ color: `var(--cat-${catColor}-1)` }}>
        {backIllu ? <Illu name={backIllu} char={card.front.char} size={120} />
          : card.front.kind === 'emoji' ? <Illu name="emoji" char={card.front.char} size={120} />
            : card.front.kind === 'swatch' ? <Illu name="swatch" hex={card.front.hex} size={110} />
              : card.front.kind === 'shape' ? <Illu name={card.front.name} size={110} />
                : <div className="card-mega sm">{card.front.text}</div>}
      </div>
      <div className="card-word">{card.word}</div>
      {card.badge && (
        <div className="card-badge"><Icon name={card.badge.icon} size={18} />{card.badge.label}</div>
      )}
      <SpeakButton onSpeak={onSpeak} speaking={speaking} />
    </div>
  );
}

// Card root is a role="button" div, NOT a <button> — the SpeakButton lives
// inside it; nested buttons are invalid DOM and double-fire on Enter.
export function FlashCard({ card, catColor, flipped, onFlip, onSpeak, speaking, mastered }) {
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };
  // 3D hit-testing can mis-target taps on the rotated back face to the card
  // root (GPU-less rendering, some mobile browsers). Route by geometry: a tap
  // inside the speak button's rect speaks instead of flipping.
  const onCardClick = (e) => {
    if (flipped && e.clientX !== undefined) {
      const sb = e.currentTarget.querySelector('[data-testid="speak-button"]');
      const r = sb && sb.getBoundingClientRect();
      if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        onSpeak();
        return;
      }
    }
    onFlip();
  };
  return (
    <div className="flashcard-wrap">
      <div
        data-testid="flashcard"
        role="button"
        tabIndex={0}
        className={`flashcard ${flipped ? 'flipped' : ''} ${mastered ? 'mastered' : ''}`}
        style={{ '--card-color': `var(--cat-${catColor}-1)`, '--card-color-2': `var(--cat-${catColor}-2)` }}
        aria-label={flipped ? `${card.word}. Tap to flip back.` : 'Card. Tap to flip and reveal.'}
        onClick={onCardClick}
        onKeyDown={onKeyDown}
        data-flip
      >
        <span className="flashcard-3d">
          <span className="face front">
            <CardFront card={card} catColor={catColor} />
            <span className="flip-hint">tap to flip</span>
          </span>
          <span className="face back" data-testid="flashcard-flip">
            <CardBack card={card} catColor={catColor} onSpeak={onSpeak} speaking={speaking} />
          </span>
        </span>
        {mastered && <span className="mastered-ribbon"><Icon name="star" size={18} /> Learned!</span>}
      </div>
    </div>
  );
}
