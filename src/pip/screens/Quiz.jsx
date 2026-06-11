import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon.jsx';
import { Illu } from '../art/Illu.jsx';
import { Mascot } from '../components/Mascot.jsx';
import { SpeakButton } from '../components/SpeakButton.jsx';
import { QuizOption } from '../components/QuizOption.jsx';
import { announce } from '../speech.js';

function artFor(card, size = 64) {
  const f = card.front;
  if (f.kind === 'mega') return <span className="opt-mega">{f.text}</span>;
  if (f.kind === 'swatch') return <Illu name="swatch" hex={f.hex} size={size} />;
  return <Illu name={f.name} char={f.char} size={size} />;
}

// ~10 questions capped by pool; one attempt each. difficulty 'easy' = 1
// distractor (2 choices), 'normal' = 3 distractors (4 choices).
function buildQuiz(cards, difficulty, n = 10) {
  const optCount = difficulty === 'easy' ? 2 : 4;
  const pool = cards.length >= optCount ? cards : cards.concat(cards, cards).slice(0, optCount);
  const qs = [];
  for (let i = 0; i < Math.min(n, Math.max(4, cards.length * 2)); i++) {
    const target = cards[i % cards.length];
    const others = pool.filter((c) => c.id !== target.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, optCount - 1);
    const opts = [...shuffled, target].sort(() => Math.random() - 0.5);
    qs.push({ target, options: opts });
  }
  return qs;
}

export function Quiz({ cat, cards, onBack, onAgain, onRewards, mascot, speak, difficulty = 'normal' }) {
  // one-shot shuffle per mount — randomness must not re-run on re-render
  const [quiz] = useState(() => buildQuiz(cards, difficulty));
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
  }, [qi, done, q, speak]);

  const pick = (i) => {
    if (picked !== null) return;
    const opt = q.options[i];
    const correct = opt.id === q.target.id;
    setPicked({ i, correct });
    if (correct) {
      setScore((s) => s + 1);
      speak('Yes!');
      announce('Yes!');
    } else {
      speak('Try again. This is the ' + q.target.word);
      announce('This is the ' + q.target.word);
      setMistakes((m) => [...m, { q: q.target, chose: opt }]);
    }
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
            <h3>Let&apos;s look again</h3>
            <div className="mistake-list">
              {/* row is a role=button div hosting the inner speak <button> —
                  never nest real buttons (double-activation) */}
              {mistakes.map((m, i) => (
                <div key={i} className="mistake-row" role="button" tabIndex={0}
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
