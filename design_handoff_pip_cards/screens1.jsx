// screens1.jsx — Onboarding, Home, Deck (learn).
(function () {
  const { useState, useEffect, useRef } = React;

  // =================== ONBOARDING ===================
  function Onboarding({ onDone, mascot, speak }) {
    const [step, setStep] = useState(0);
    const [avatar, setAvatar] = useState(null);
    const [demoFlipped, setDemoFlipped] = useState(false);

    useEffect(() => {
      const lines = [
        "Hi! I'm Pip. Tap a friend to be your buddy!",
        "How big are you?",
        "Watch! Tap the card to flip it.",
      ];
      const t = setTimeout(() => { speak(lines[step]); announce(lines[step]); }, 350);
      return () => clearTimeout(t);
    }, [step]);

    return (
      <div className="screen onboard" data-screen-label="Onboarding">
        <div className="onboard-mascot"><Mascot concept={mascot} state={step === 2 ? 'point' : 'cheer'} size={150} /></div>

        {step === 0 && (<>
          <h1 className="onboard-h">Pick a buddy!</h1>
          <div className="avatar-grid">
            {AVATARS.map(a => (
              <button key={a.id} className={`avatar-card ${avatar === a.id ? 'sel' : ''}`}
                onClick={() => { setAvatar(a.id); speak(a.name); announce(a.name); }}
                aria-label={a.name} aria-pressed={avatar === a.id}>
                <Illu name={a.illu} size={84} />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
          <button className="pip-cta" disabled={!avatar} onClick={() => setStep(1)}>Next</button>
        </>)}

        {step === 1 && (<>
          <h1 className="onboard-h">How big are you?</h1>
          <div className="age-grid">
            {[{ k: 'little', l: 'Little', s: 56 }, { k: 'middle', l: 'Bigger', s: 78 }, { k: 'big', l: 'Big kid', s: 100 }].map(t => (
              <button key={t.k} className="age-card" onClick={() => setStep(2)} aria-label={t.l}>
                <Mascot concept={mascot} state="idle" size={t.s} />
                <span>{t.l}</span>
              </button>
            ))}
          </div>
        </>)}

        {step === 2 && (<>
          <h1 className="onboard-h">Tap the card!</h1>
          <button className={`demo-card ${demoFlipped ? 'flipped' : ''}`}
            onClick={() => { setDemoFlipped(true); speak('A is for Apple.'); announce('A is for Apple.'); }}
            aria-label="Demo card, tap to flip">
            <span className="demo-3d">
              <span className="demo-face f"><span className="card-mega" style={{ color: 'var(--cat-alphabet-1)' }}>A</span></span>
              <span className="demo-face b"><Illu name="apple" size={96} /><b>Apple</b></span>
            </span>
            {!demoFlipped && <span className="tap-ring" aria-hidden="true" />}
          </button>
          <button className="pip-cta" onClick={onDone}>{demoFlipped ? "Let's play!" : 'Skip'}</button>
        </>)}

        <div className="onboard-dots">{[0, 1, 2].map(i => <span key={i} className={i === step ? 'on' : ''} />)}</div>
        {step < 2 && <button className="onboard-skip" onClick={onDone}>Skip</button>}
      </div>
    );
  }

  // =================== HOME ===================
  function Home({ onOpenCategory, onParent, theme, onToggletheme, progress, lastCategory, mascot, speak, muted, onToggleMute }) {
    const last = lastCategory ? CATEGORIES.find(c => c.id === lastCategory) : null;
    return (
      <div className="screen home" data-screen-label="Home">
        <header className="home-bar">
          <span className="wordmark"><span className="wm-pip">Pip</span><span className="wm-bang">!</span></span>
          <div className="home-bar-actions">
            <button className="round-btn" aria-label={muted ? 'Turn voice on' : 'Turn voice off'} onClick={onToggleMute} aria-pressed={muted}>
              <Icon name={muted ? 'mute' : 'sound'} size={24} />
            </button>
            <button className="round-btn" aria-label="Switch light or dark" onClick={onToggletheme}>
              <Icon name={theme === 'dark' ? 'sparkle' : 'star'} size={24} />
            </button>
            <button className="round-btn grown" aria-label="For grown-ups" data-testid="parent-entry" onClick={onParent}>
              <Icon name="lock" size={22} />
            </button>
          </div>
        </header>

        <div className="ambient" aria-hidden="true"><i /><i /><i /></div>

        <div className="home-hero">
          <div className="home-hero-mascot" data-testid="mascot"><Mascot concept={mascot} state="idle" size={132} /></div>
          <div className="home-hero-text">
            <h1>Hi there! What do you want to learn?</h1>
            <button className="pip-cta lg" onClick={() => { speak('Tap a picture to hear it'); announce('Tap a picture to hear it'); }}>
              <Icon name="play" size={22} /> Tap to hear
            </button>
          </div>
        </div>

        {last && (
          <button className="continue-card" onClick={() => onOpenCategory(last)} data-testid="continue-card"
            style={{ '--c1': `var(--cat-${last.color}-1)`, '--c2': `var(--cat-${last.color}-2)` }}>
            <span className="continue-icon"><Illu name={last.icon.name} char={last.icon.char} hex={last.icon.hex} size={52} /></span>
            <span className="continue-text"><small>Keep going</small><b>{last.name}</b></span>
            <Icon name="next" size={30} />
          </button>
        )}

        <h2 className="shelf-title">All the things</h2>
        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <CategoryTile key={cat.id} cat={cat} progress={(progress[cat.id]?.learned || 0) / cat.count}
              done={(progress[cat.id]?.learned || 0) >= cat.count} onSelect={onOpenCategory} />
          ))}
        </div>
        <div className="home-foot"><Mascot concept={mascot} state="idle" size={40} /> Made for little learners</div>
      </div>
    );
  }

  // =================== DECK (LEARN) ===================
  function Deck({ cat, cards, onBack, onQuiz, progress, onMaster, mascot, speak, speaking, muted }) {
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [streak, setStreak] = useState(0);
    const [celebrate, setCelebrate] = useState(false);
    const [streakMsg, setStreakMsg] = useState(null);
    const [complete, setComplete] = useState(false);
    const learned = progress.learnedSet || new Set();
    const card = cards[idx];
    const total = cards.length;

    const go = (d) => {
      const n = (idx + d + total) % total;
      setIdx(n); setFlipped(false);
    };
    const doFlip = () => {
      const nf = !flipped; setFlipped(nf);
      if (nf) { speak(card.phrase); announce(card.phrase); }
    };
    const doSpeak = () => { speak(card.phrase); announce(card.phrase); };
    const master = () => {
      if (learned.has(card.id)) return;
      onMaster(card.id);
      const ns = streak + 1; setStreak(ns);
      setCelebrate(true);
      if (ns > 0 && ns % 3 === 0) { setStreakMsg(ns); speak(`${ns} in a row!`); }
      speak('Learned!');
      if ((learned.size + 1) >= total) setTimeout(() => setComplete(true), 900);
    };

    // keyboard
    useEffect(() => {
      const h = (e) => {
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doFlip(); }
        else if (e.key === 'Escape') onBack();
      };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, [idx, flipped]);

    useEffect(() => { const t = setTimeout(() => { if (!flipped) { /* land hint */ } }, 400); return () => clearTimeout(t); }, []);

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
              onClick={() => { setIdx(i); setFlipped(false); }} aria-label={`Card ${i + 1}`} aria-selected={i === idx}>
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

  // small peek art helper
  function peekArt(card, size = 56) {
    if (!card) return null;
    const f = card.front;
    if (f.kind === 'mega') return <span className="peek-mega">{f.text}</span>;
    if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
    if (f.kind === 'shape') return <Illu name={f.name} size={size} />;
    return <Illu name={f.name} size={size} />;
  }

  Object.assign(window, { Onboarding, Home, Deck });
})();
