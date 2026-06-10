// screens2.jsx — Quiz + results, Rewards, Parent gate + settings, Mascot sheet.
(function () {
  const { useState, useEffect, useRef } = React;

  function artFor(card, size = 64) {
    const f = card.front;
    if (f.kind === 'mega') return <span className="opt-mega">{f.text}</span>;
    if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
    if (f.kind === 'shape') return <Illu name={f.name} size={size} />;
    return <Illu name={f.name} size={size} />;
  }

  function buildQuiz(cards, n = 10) {
    const pool = cards.length >= 4 ? cards : cards.concat(cards, cards).slice(0, 4);
    const qs = [];
    for (let i = 0; i < Math.min(n, Math.max(4, cards.length * 2)); i++) {
      const target = cards[i % cards.length];
      const others = pool.filter(c => c.id !== target.id);
      const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [...shuffled, target].sort(() => Math.random() - 0.5);
      qs.push({ target, options: opts });
    }
    return qs;
  }

  // =================== QUIZ ===================
  function Quiz({ cat, cards, onBack, onAgain, onRewards, mascot, speak, muted }) {
    const [quiz] = useState(() => buildQuiz(cards));
    const [qi, setQi] = useState(0);
    const [picked, setPicked] = useState(null);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState([]);
    const [done, setDone] = useState(false);
    const q = quiz[qi];

    useEffect(() => {
      if (done || !q) return;
      const t = setTimeout(() => { speak(`Find the ${q.target.word}!`); announce(`Find the ${q.target.word}`); }, 400);
      return () => clearTimeout(t);
    }, [qi, done]);

    const pick = (i) => {
      if (picked !== null) return;
      const opt = q.options[i];
      const correct = opt.id === q.target.id;
      setPicked({ i, correct });
      if (correct) { setScore(s => s + 1); speak('Yes!'); }
      else { speak('Try again. This is the ' + q.target.word); setMistakes(m => [...m, { q: q.target, chose: opt }]); }
      setTimeout(() => {
        if (qi + 1 >= quiz.length) setDone(true);
        else { setQi(qi + 1); setPicked(null); }
      }, correct ? 850 : 1500);
    };

    if (done) {
      const pct = Math.round((score / quiz.length) * 100);
      const great = pct >= 70;
      return (
        <div className="screen quiz-result" data-testid="quiz-result" data-screen-label="Quiz results"
          style={{ '--c1': `var(--cat-${cat.color}-1)`, '--c2': `var(--cat-${cat.color}-2)` }}>
          <Mascot concept={mascot} state={great ? 'cheer' : 'encourage'} size={140} />
          <div className="result-score"><b>{score}</b><span>of {quiz.length}</span></div>
          <h1>{great ? 'Amazing!' : 'Good try!'}</h1>
          <p>{great ? "You're a superstar!" : "Let's practice a little more — you've got this!"}</p>
          {mistakes.length > 0 && (
            <div className="mistake-review">
              <h3>Let's look again</h3>
              <div className="mistake-list">
                {mistakes.map((m, i) => (
                  <div key={i} className="mistake-row" role="button" tabIndex="0"
                    onClick={() => { speak(m.q.phrase); announce(m.q.phrase); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speak(m.q.phrase); announce(m.q.phrase); } }}>
                    <span className="mr-art" style={{ color: `var(--cat-${cat.color}-1)` }}>{artFor(m.q, 44)}</span>
                    <b>{m.q.word}</b>
                    <SpeakButton onSpeak={() => { speak(m.q.phrase); announce(m.q.phrase); }} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="result-actions">
            <button className="pip-cta" onClick={onAgain}>Try again</button>
            <button className="pip-cta ghost" onClick={onBack}>Back to cards</button>
            <button className="result-treasure" onClick={onRewards}><Icon name="gift" size={22} /> See my stickers</button>
          </div>
        </div>
      );
    }

    return (
      <div className="screen quiz" data-screen-label={`Quiz: ${cat.name}`}
        style={{ '--c1': `var(--cat-${cat.color}-1)`, '--c2': `var(--cat-${cat.color}-2)` }}>
        <header className="deck-bar">
          <button className="round-btn" aria-label="Back" onClick={onBack}><Icon name="back" size={26} /></button>
          <div className="quiz-progress"><span className="quiz-bar"><i style={{ width: `${(qi / quiz.length) * 100}%` }} /></span><small>{qi + 1} of {quiz.length}</small></div>
          <div className="quiz-score-chip"><Icon name="star" size={18} />{score}</div>
        </header>

        <div className="quiz-prompt">
          <Mascot concept={mascot} state="point" size={84} />
          <button className="quiz-ask" onClick={() => { speak(`Find the ${q.target.word}!`); announce(`Find the ${q.target.word}`); }}>
            <Icon name="sound" size={26} /> Find the <b>{q.target.word}</b>
          </button>
        </div>

        <div className="quiz-grid">
          {q.options.map((opt, i) => {
            let state = 'idle';
            if (picked) {
              if (i === picked.i) state = picked.correct ? 'correct' : 'wrong';
              else if (!picked.correct && opt.id === q.target.id) state = 'reveal';
              else state = 'disabled';
            }
            return <QuizOption key={opt.id + i} index={i} state={state} onPick={pick}
              option={{ label: opt.word, render: <span style={{ color: `var(--cat-${cat.color}-1)` }}>{artFor(opt, 64)}</span> }} />;
          })}
        </div>
      </div>
    );
  }

  // =================== REWARDS ===================
  const STICKERS = ['cat', 'apple', 'sun', 'star', 'frog', 'fish', 'banana', 'rainbow', 'bee'];
  function Rewards({ onBack, earned, onOpenChest, gallery = [], onPaint, mascot, speak }) {
    const [chestState, setChestState] = useState('closed'); // closed|opening|reveal
    const [reward, setReward] = useState(null);
    const open = () => {
      if (chestState !== 'closed') return;
      setChestState('opening'); speak('Surprise!');
      setTimeout(() => {
        const pick = STICKERS[Math.floor(Math.random() * STICKERS.length)];
        setReward(pick); setChestState('reveal'); onOpenChest(pick); announce('You got a sticker!');
      }, 900);
    };
    return (
      <div className="screen rewards" data-screen-label="Rewards">
        <header className="deck-bar">
          <button className="round-btn" aria-label="Back home" onClick={onBack}><Icon name="back" size={26} /></button>
          <div className="deck-title"><b>My Treasures</b></div>
          <span style={{ width: 48 }} />
        </header>

        <div className="chest-zone">
          <button className={`chest ${chestState}`} onClick={open} aria-label="Open surprise chest" data-testid="reward-chest">
            <span className="chest-lid"><Icon name="gift" size={70} color="#fff" /></span>
            {chestState === 'reveal' && reward && (
              <span className="chest-reward"><Illu name={reward} size={88} /></span>
            )}
            {chestState !== 'reveal' && <span className="chest-label">Tap to open!</span>}
          </button>
          {chestState === 'reveal' && <button className="pip-cta" onClick={() => { setChestState('closed'); setReward(null); }}>Yay! Keep going</button>}
        </div>

        <h2 className="shelf-title">My art</h2>
        {gallery.length > 0 ? (
          <div className="art-gallery" data-testid="art-gallery">
            {gallery.map(a => (
              <div key={a.id} className="art-frame">
                <img src={a.data} alt={`My ${a.label} painting`} />
                <small>{a.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <button className="art-empty" onClick={onPaint}>
            <Icon name="palette" size={26} />
            <span>Paint a picture and it will live here!</span>
          </button>
        )}

        <h2 className="shelf-title">Sticker book</h2>
        <div className="sticker-album">
          {STICKERS.map(s => {
            const has = earned.includes(s);
            return (
              <div key={s} className={`sticker-slot ${has ? 'has' : ''}`} aria-label={has ? `Sticker ${s}` : 'Empty slot'}>
                {has ? <Illu name={s} size={56} /> : <Icon name="lock" size={26} color="var(--ink-3)" />}
              </div>
            );
          })}
        </div>

        <h2 className="shelf-title">Badges</h2>
        <div className="badge-shelf">
          {[{ id: 'first', l: 'First card', on: earned.length > 0 }, { id: 'streak', l: '3 in a row', on: earned.length >= 2 }, { id: 'cat', l: 'Finished a set', on: false }].map(b => (
            <div key={b.id} className={`badge ${b.on ? 'on' : ''}`}>
              <span className="badge-medal"><Icon name="star" size={30} color={b.on ? '#fff' : 'var(--ink-3)'} /></span>
              <small>{b.l}</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =================== PARENT GATE + SETTINGS ===================
  function Parent({ onBack, settings, onSetting, mascot }) {
    const [gate, setGate] = useState(true);
    const [a] = useState(() => 2 + Math.floor(Math.random() * 6));
    const [b] = useState(() => 3 + Math.floor(Math.random() * 6));
    const [val, setVal] = useState('');
    const [err, setErr] = useState(false);

    if (gate) {
      const press = (d) => {
        if (d === 'del') { setVal(v => v.slice(0, -1)); setErr(false); return; }
        const nv = (val + d).slice(0, 2);
        setVal(nv);
        if (parseInt(nv, 10) === a + b) setTimeout(() => setGate(false), 250);
        else if (nv.length >= String(a + b).length) setErr(true);
      };
      return (
        <div className="screen parent-gate" data-testid="parental-gate" data-screen-label="Parental gate">
          <button className="round-btn floaty" aria-label="Back" onClick={onBack}><Icon name="close" size={26} /></button>
          <Icon name="lock" size={40} color="var(--ink-2)" />
          <h1>For grown-ups</h1>
          <p>Solve this to continue.</p>
          <div className={`gate-problem ${err ? 'err' : ''}`}>{a} + {b} = <b>{val || '?'}</b></div>
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0].map(k => (
              <button key={k} className="key" onClick={() => press(k === 'del' ? 'del' : k)}>{k === 'del' ? '⌫' : k}</button>
            ))}
          </div>
        </div>
      );
    }

    const Toggle = ({ name, label, desc }) => (
      <div className="set-row">
        <div className="set-text"><b>{label}</b>{desc && <small>{desc}</small>}</div>
        <button data-testid={`settings-toggle-${name}`} className={`switch ${settings[name] ? 'on' : ''}`}
          role="switch" aria-checked={!!settings[name]} aria-label={label} onClick={() => onSetting(name, !settings[name])}>
          <span className="knob" />
        </button>
      </div>
    );

    return (
      <div className="screen parent-dash" data-screen-label="Parent dashboard">
        <header className="deck-bar">
          <button className="round-btn" aria-label="Back home" onClick={onBack}><Icon name="back" size={26} /></button>
          <div className="deck-title"><b>For grown-ups</b></div>
          <span style={{ width: 48 }} />
        </header>

        <div className="dash-card">
          <h3>This week</h3>
          <div className="dash-stats">
            <div><b>24</b><small>cards learned</small></div>
            <div><b>3</b><small>sets started</small></div>
            <div><b>12m</b><small>play time</small></div>
          </div>
        </div>

        <h2 className="shelf-title">Settings</h2>
        <div className="set-list">
          <Toggle name="sound" label="Sound effects" desc="Taps, flips, wins" />
          <Toggle name="music" label="Background music" />
          <Toggle name="voice" label="Spoken words" desc="Pip reads aloud" />
          <Toggle name="motion" label="Big animations" desc="Off = calmer, less motion" />
          <div className="set-row">
            <div className="set-text"><b>Voice language</b><small>Pip's accent</small></div>
            <select className="set-select" data-testid="settings-toggle-language" value={settings.language}
              onChange={e => onSetting('language', e.target.value)}>
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Español (soon)</option>
            </select>
          </div>
          <div className="set-row">
            <div className="set-text"><b>Difficulty</b><small>Quiz options</small></div>
            <select className="set-select" value={settings.difficulty} onChange={e => onSetting('difficulty', e.target.value)}>
              <option value="easy">Easy (2 choices)</option>
              <option value="normal">Normal (4 choices)</option>
            </select>
          </div>
          <Toggle name="limit" label="Screen-time reminder" desc="Gentle nudge after 20 min" />
        </div>

        <div className="dash-actions">
          <button className="pip-cta ghost sm">Export data</button>
          <button className="pip-cta ghost sm">Import data</button>
        </div>
        <p className="privacy">No login. No ads. Everything stays on this device.</p>
      </div>
    );
  }

  // =================== MASCOT SHEET ===================
  const BUDDY_LABELS = { pip: 'Pip (bird)', fox: 'Fox', owl: 'Owl', bear: 'Bear', bunny: 'Bunny', monster: 'Monster' };
  function MascotSheet({ concept, onPick, onBack }) {
    const states = ['idle', 'cheer', 'encourage', 'point', 'sleep'];
    return (
      <div className="screen mascot-sheet" data-screen-label="Mascot sheet">
        <header className="deck-bar">
          <button className="round-btn" aria-label="Back home" data-testid="mascot-back" onClick={onBack}><Icon name="back" size={26} /></button>
          <div className="deck-title"><b>Buddies</b></div>
          <span style={{ width: 48 }} />
        </header>
        <h1 className="onboard-h">Meet the buddies</h1>
        <div className="concept-row">
          {window.MASCOT_CONCEPTS.map(c => (
            <button key={c} className={`concept-pick ${concept === c ? 'sel' : ''}`} onClick={() => onPick(c)}>
              <Mascot concept={c} state="cheer" size={76} />
              <span>{BUDDY_LABELS[c]}</span>
            </button>
          ))}
        </div>
        <h2 className="shelf-title">{concept} — all moods</h2>
        <div className="state-row">
          {states.map(s => (
            <div key={s} className="state-cell"><Mascot concept={concept} state={s} size={92} /><small>{s}</small></div>
          ))}
        </div>
      </div>
    );
  }

  Object.assign(window, { Quiz, Rewards, Parent, MascotSheet });
})();
