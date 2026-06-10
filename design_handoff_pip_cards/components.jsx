// components.jsx — primitives: Icon, useSpeech, SpeakButton, Caption, FlashCard,
// CategoryTile, QuizOption, ProgressTrack, StreakBadge, Confetti, Chest, Sticker.
(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  // ---------- Icon (filled Material-ish, inline) ----------
  const PATHS = {
    sound: 'M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3v2a7 7 0 010 14v2a9 9 0 000-18z',
    mute: 'M3 10v4h4l5 5V5L7 10H3zm16.5 2l2.5 2.5-1.4 1.4L18 17.4l-2.6 2.6-1.4-1.4L16.6 16 14 13.4l1.4-1.4L18 14.6 20.6 12 18 9.4 19.4 8 22 10.6z',
    back: 'M15.5 4l1.8 1.8L11 12l6.3 6.2L15.5 20l-8-8z',
    next: 'M8.5 4L6.7 5.8 13 12l-6.3 6.2L8.5 20l8-8z',
    star: 'M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z',
    flame: 'M13 2C13 6 8 7 8 12a4 4 0 008 0c0-2-1-3-1-3 3 2 4 4 4 7a7 7 0 11-14 0C5 9 13 8 13 2z',
    check: 'M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.4z',
    close: 'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
    play: 'M8 5v14l11-7z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    tag: 'M21 11.5L12.5 3H4v8.5L12.5 20zM7 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
    info: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2zm0-8h-2V7h2z',
    lock: 'M12 2a4 4 0 00-4 4v2H6v12h12V8h-2V6a4 4 0 00-4-4zm2 6h-4V6a2 2 0 014 0z',
    gift: 'M20 7h-2.2A3 3 0 0012 3.4 3 3 0 006.2 7H4v4h1v9h14v-9h1zm-6 0a1 1 0 110-2 1 1 0 010 2zm-4-2a1 1 0 110 2 1 1 0 010-2zm1 15H7v-9h6zm6 0h-4v-9h4z',
    sparkle: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z',
    palette: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.24-1.16-.62-1.58-.37-.41-.6-.96-.6-1.42 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM6.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3.5 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
    brush: 'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a1 1 0 00-1.41 0L9 12l2.83 2.83 8.88-8.79a1 1 0 000-1.41z',
    eraser: 'M16.24 3.56l4.2 4.2a2 2 0 010 2.83l-8 8a3 3 0 01-2.12.88H7l-3.76-3.76a2 2 0 010-2.83L13.4 3.56a2 2 0 012.84 0zM8 18l-3-3 5.5-5.5 3 3L8 18z',
    undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62A7.45 7.45 0 0112.5 11c3.04 0 5.64 1.97 6.55 4.71L21 15.06A9.01 9.01 0 0012.5 8z',
    trash: 'M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zm-4 2h14v2H5V6z',
  };
  function Icon({ name, size = 26, color = 'currentColor' }) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ display: 'block' }}>
        <path d={PATHS[name] || PATHS.info} />
      </svg>
    );
  }

  // ---------- Speech (Web Speech API) ----------
  function useSpeech(muted) {
    const [speaking, setSpeaking] = useState(false);
    const [available, setAvailable] = useState(true);
    useEffect(() => {
      const ok = typeof window !== 'undefined' && 'speechSynthesis' in window;
      setAvailable(ok);
    }, []);
    const speak = useCallback((text, opts = {}) => {
      if (muted || !('speechSynthesis' in window) || !text) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = opts.rate ?? 0.7; u.pitch = opts.pitch ?? 1.3;
        const vs = window.speechSynthesis.getVoices();
        const v = vs.find(x => /en-IN/i.test(x.lang)) || vs.find(x => /en/i.test(x.lang));
        if (v) u.voice = v;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch (e) { /* no-op */ }
    }, [muted]);
    return { speak, speaking, available };
  }
  // Caption bus — broadcast spoken text so a global caption can show it
  function useCaption() {
    const [cap, setCap] = useState('');
    useEffect(() => {
      const h = (e) => { setCap(e.detail); clearTimeout(h._t); h._t = setTimeout(() => setCap(''), 2600); };
      window.addEventListener('pip-caption', h);
      return () => window.removeEventListener('pip-caption', h);
    }, []);
    return cap;
  }
  const announce = (text) => window.dispatchEvent(new CustomEvent('pip-caption', { detail: text }));

  // ---------- SpeakButton ----------
  function SpeakButton({ onSpeak, speaking, disabled, size = 'lg', label = 'Hear it again' }) {
    const dim = size === 'lg' ? 84 : 60;
    return (
      <button
        data-testid="speak-button"
        className={`pip-btn speak ${speaking ? 'is-playing' : ''}`}
        aria-label={label} disabled={disabled}
        onClick={(e) => { e.stopPropagation(); if (!disabled) onSpeak(); }}
        style={{ width: dim, height: dim }}>
        <span className="speak-waves" aria-hidden="true"><i></i><i></i><i></i></span>
        <Icon name={disabled ? 'mute' : 'sound'} size={size === 'lg' ? 36 : 26} />
      </button>
    );
  }

  // ---------- Caption (global) ----------
  function CaptionBar() {
    const cap = useCaption();
    if (!cap) return null;
    return <div className="pip-caption" role="status" aria-live="polite"><Icon name="sound" size={18} />{cap}</div>;
  }

  // ---------- FlashCard ----------
  function CardFront({ card, catColor }) {
    const f = card.front;
    if (f.kind === 'mega')
      return <div className="card-mega" style={{ color: `var(--cat-${catColor}-1)` }}>{f.text}</div>;
    if (f.kind === 'swatch')
      return <div style={{ color: f.hex }}><Illu name="swatch" hex={f.hex} size={150} /></div>;
    if (f.kind === 'shape')
      return <div style={{ color: `var(--cat-${catColor}-1)` }}><Illu name={f.name} size={150} /></div>;
    return <div style={{ color: `var(--cat-${catColor}-1)` }}><Illu name={f.name} size={170} /></div>;
  }
  function CardBack({ card, catColor, onSpeak, speaking }) {
    const backIllu = card.illu || (card.front.kind === 'illu' ? card.front.name : null);
    return (
      <div className="card-back-inner">
        <div className="card-back-visual" style={{ color: `var(--cat-${catColor}-1)` }}>
          {backIllu ? <Illu name={backIllu} size={120} />
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
  function FlashCard({ card, catColor, flipped, onFlip, onSpeak, speaking, mastered }) {
    return (
      <div className="flashcard-wrap">
        <div
          data-testid="flashcard"
          role="button" tabIndex="0"
          className={`flashcard ${flipped ? 'flipped' : ''} ${mastered ? 'mastered' : ''}`}
          style={{ '--card-color': `var(--cat-${catColor}-1)`, '--card-color-2': `var(--cat-${catColor}-2)` }}
          aria-label={flipped ? `${card.word}. Tap to flip back.` : 'Card. Tap to flip and reveal.'}
          onClick={onFlip} data-flip>
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

  // ---------- CategoryTile ----------
  function CategoryTile({ cat, progress = 0, done = false, onSelect }) {
    const pct = Math.round(progress * 100);
    return (
      <button
        data-testid={`category-tile-${cat.id}`}
        className="cat-tile" onClick={() => onSelect(cat)}
        style={{ '--c1': `var(--cat-${cat.color}-1)`, '--c2': `var(--cat-${cat.color}-2)` }}
        aria-label={`${cat.name}. ${cat.count} cards. ${done ? 'Completed' : pct > 0 ? pct + ' percent done' : 'Start learning'}`}>
        <span className="cat-icon"><Illu name={cat.icon.name} char={cat.icon.char} hex={cat.icon.hex} size={62} /></span>
        <span className="cat-name">{cat.name}</span>
        <span className="cat-foot">
          {done
            ? <span className="cat-stars"><Icon name="star" size={18} /><Icon name="star" size={18} /><Icon name="star" size={18} /></span>
            : pct > 0
              ? <span className="cat-ring" style={{ '--p': pct }}><b>{pct}%</b></span>
              : <span className="cat-start">{cat.count} cards</span>}
        </span>
      </button>
    );
  }

  // ---------- QuizOption ----------
  function QuizOption({ option, index, state, onPick }) {
    // state: 'idle'|'correct'|'wrong'|'reveal'|'disabled'
    const cls = `quiz-opt ${state}`;
    const aria = state === 'correct' ? 'Correct' : state === 'wrong' ? 'Try again' : state === 'reveal' ? 'This was the answer' : undefined;
    return (
      <button data-testid={`quiz-option-${index}`} className={cls} onClick={() => onPick(index)}
        disabled={state === 'disabled' || state === 'correct' || state === 'reveal'} aria-label={`${option.label}${aria ? '. ' + aria : ''}`}>
        <span className="quiz-opt-art">{option.render}</span>
        <span className="quiz-opt-label">{option.label}</span>
        {state === 'correct' && <span className="quiz-mark ok"><Icon name="check" size={26} color="#fff" /></span>}
        {state === 'wrong' && <span className="quiz-mark no"><Icon name="close" size={26} color="#fff" /></span>}
        {state === 'reveal' && <span className="quiz-mark rev"><Icon name="check" size={22} color="#fff" /></span>}
      </button>
    );
  }

  // ---------- ProgressTrack (3-step) ----------
  function ProgressTrack({ steps = 3, active = 0 }) {
    return (
      <div className="prog-track" role="progressbar" aria-valuemin="0" aria-valuemax={steps} aria-valuenow={active}>
        {Array.from({ length: steps }).map((_, i) => (
          <span key={i} className={`prog-seg ${i < active ? 'on' : ''}`} />
        ))}
      </div>
    );
  }

  // ---------- StreakBadge ----------
  function StreakBadge({ n }) {
    return (
      <div className={`streak-badge ${n > 0 ? 'lit' : ''}`} aria-label={`${n} in a row`}>
        <Icon name="flame" size={22} /><b>{n}</b>
      </div>
    );
  }

  // ---------- Confetti / celebration ----------
  function Confetti({ show, onDone }) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    useEffect(() => {
      if (!show) return;
      const t = setTimeout(() => onDone && onDone(), reduce ? 700 : 1600);
      return () => clearTimeout(t);
    }, [show]);
    if (!show) return null;
    if (reduce) return <div className="rm-celebrate"><Icon name="check" size={40} color="#fff" /> Nice!</div>;
    const colors = ['var(--pop-sun)', 'var(--pop-coral)', 'var(--pop-teal)', 'var(--pop-sky)', 'var(--pop-grass)', 'var(--pop-grape)'];
    return (
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} style={{
            left: `${Math.random() * 100}%`, background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.3}s`, transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: i % 3 === 0 ? '50%' : '2px',
          }} />
        ))}
      </div>
    );
  }

  Object.assign(window, {
    Icon, useSpeech, useCaption, announce, SpeakButton, CaptionBar,
    FlashCard, CategoryTile, QuizOption, ProgressTrack, StreakBadge, Confetti,
  });
})();
