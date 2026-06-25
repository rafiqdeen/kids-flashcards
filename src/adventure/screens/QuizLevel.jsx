// QuizLevel.jsx — "Find the <word>!" Tap to repeat via TTS. Correct ->
// celebrate; wrong -> wiggle + reveal. Score -> stars: >=99%->3, >=66%->2,
// >0->1, else 0. Ported from adventure-app.jsx.
//
// Deviation from the prototype (logged in IMPLEMENTATION_NOTES): the prototype's
// final tally falls through to 1 star even for 0 correct; the README and the
// brief's functional test both specify ">0 -> 1" (so 0 correct -> 0), which
// also matches this file's own on-screen `starsNow` meter. We use that.
import { useState, useEffect, useRef } from 'react';
import { HeroMascot } from '../art/Mascot.jsx';
import { I, Star } from '../art/icons.jsx';
import { art } from '../art/cardArt.jsx';
import { ZONE_THEMES } from '../data/categories.js';
import { CARDS } from '../data/cards.js';
import { ADV_SET, advSfx } from '../audio.js';
import { useInitialFocus } from '../hooks/useSpatialNav.js';
import { useBackHandler } from '../hooks/useBackButton.js';

export function QuizLevel({ cat, zone, onExit, onComplete, speak }) {
  const cards = (CARDS[cat.id] || []).slice(0, 6);
  const [quiz] = useState(() => {
    const nOpts = (ADV_SET && ADV_SET.difficulty === 'easy') ? 2 : 4;
    const pool = cards.length >= 4 ? cards : [...cards, ...cards, ...cards].slice(0, 4);
    return cards.slice(0, 6).map((target) => ({
      target,
      options: [...pool.filter((c) => c.id !== target.id)].sort(() => Math.random() - .5).slice(0, nOpts - 1).concat(target).sort(() => Math.random() - .5),
    }));
  });
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const th = ZONE_THEMES[zone];
  const q = quiz[qi];
  const rootRef = useRef(null);
  useInitialFocus(rootRef, [qi]); // land on (and re-land on) the first option each question
  useBackHandler(onExit);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => speak(`Find the ${q.target.word}!`), 450); return () => clearTimeout(t); }, [qi]);

  const pick = (i) => {
    if (picked) return;
    const ok = q.options[i].id === q.target.id;
    setPicked({ i, ok });
    if (ok) { setScore((s) => s + 1); speak('Yes!'); advSfx('yes'); } else { speak(`This is the ${q.target.word}`); advSfx('no'); }
    setTimeout(() => {
      if (qi + 1 >= quiz.length) {
        const fin = score + (ok ? 1 : 0);
        const stars = fin >= quiz.length ? 3 : fin >= quiz.length * 0.66 ? 2 : fin > 0 ? 1 : 0;
        onComplete(stars, fin, quiz.length);
      } else { setQi(qi + 1); setPicked(null); }
    }, ok ? 850 : 1500);
  };

  const starsNow = score >= quiz.length * 0.99 ? 3 : score >= quiz.length * 0.66 ? 2 : score > 0 ? 1 : 0;
  return (
    <div className="level" data-screen-label={`Quiz: ${cat.name}`} ref={rootRef}
      style={{ background: `linear-gradient(180deg, ${th.sky[0]}, ${th.sky[1]} 75%, ${th.ground})`, '--zc': `var(--cat-${cat.color}-1)` }}>
      <div className="level-hud">
        <button className="gbtn white round" data-nav aria-label="Back to map" data-testid="level-exit" onClick={onExit} style={{ minHeight: 50, width: 50 }}><I n="close" s={22} /></button>
        <div className="level-bar"><i style={{ width: `${(qi / quiz.length) * 100}%` }} /></div>
        <span className="starmeter" aria-label={`${score} correct`}>
          {[1, 2, 3].map((k) => <span key={k} className={k <= starsNow ? 'pop' : 'dim'}><Star s={26} on={k <= starsNow} /></span>)}
        </span>
      </div>
      <div className="qwrap">
        <HeroMascot state="point" size={76} />
        <button className="qprompt" data-nav onClick={() => speak(`Find the ${q.target.word}!`)}>
          <I n="sound" s={24} /> Find the <b>{q.target.word}</b>
        </button>
        <div className="qgrid2">
          {q.options.map((opt, i) => {
            let cls = '';
            if (picked) {
              if (i === picked.i) cls = picked.ok ? 'correct' : 'wrong';
              else if (!picked.ok && opt.id === q.target.id) cls = 'reveal';
              else cls = 'faded';
            }
            return (
              <button key={opt.id + i} className={`qcard ${cls}`} data-testid={`quiz-option-${i}`}
                data-nav data-nav-default={i === 0 ? '' : undefined}
                disabled={!!picked} onClick={() => pick(i)}>
                <span className="qa">{art(opt, 72)}</span>
                {opt.word}
                {cls === 'correct' && <span className="qmark2 ok"><I n="check" s={22} /></span>}
                {cls === 'wrong' && <span className="qmark2 no"><I n="close" s={22} /></span>}
                {cls === 'reveal' && <span className="qmark2 rv"><I n="check" s={20} /></span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
