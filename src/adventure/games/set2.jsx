// set2.jsx — Counting Train, Shadow Puzzle, Pip Says, Calm Corner.
// Ported verbatim from adventure-activities2.jsx (Mascot+BuddyContext -> HeroMascot).
import { useState, useEffect, useRef } from 'react';
import { Illu } from '../art/Illu.jsx';
import { HeroMascot } from '../art/Mascot.jsx';
import { advGamePool, cardArt, shuffle, pickCards, NUM_WORDS } from './util.jsx';
import { StarsModal as AdvStarsModal } from './StarsModal.jsx';
import { CARDS } from '../data/cards.js';

/* ============ 5. COUNTING TRAIN ============ */
export function CountingTrain({ cat, speak, onDone, I, Star, Burst }) {
  const item = (CARDS[cat.id] || CARDS.fruits).find((c) => c.front.kind === 'illu') || CARDS.fruits[0];
  const illuName = item.front.name;
  const [round, setRound] = useState(0);       // goals 2,3,4,5,6
  const goal = round + 2;
  const TRAIN_ROUNDS = 5;
  const [loaded, setLoaded] = useState(0);
  const [hopping, setHopping] = useState([]);
  const [depart, setDepart] = useState(false);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => { const t = setTimeout(() => speak(`Load ${goal} ${item.word.toLowerCase()}s on the train!`), 600); return () => clearTimeout(t); }, [round]);

  const tap = (i) => {
    if (depart || end || hopping.includes(i) || loaded >= goal) return;
    const n = loaded + 1;
    setHopping((h) => [...h, i]); setLoaded(n);
    speak(NUM_WORDS[n] + '!');
    if (n === goal) {
      setTimeout(() => {
        setDepart(true); speak('All aboard! Choo choo!');
        setTimeout(() => {
          if (round + 1 >= TRAIN_ROUNDS) { setBurst(true); setEnd({ stars: 3 }); onDone('train', 3); }
          else { setRound(round + 1); setLoaded(0); setHopping([]); setDepart(false); }
        }, 1400);
      }, 600);
    }
  };

  return (
    <div className="game-area" data-screen-label="Counting Train">
      <button className="qprompt game-ask" onClick={() => speak(`Load ${goal} ${item.word.toLowerCase()}s!`)}>
        <I n="sound" s={22} /> Load <b>{goal}</b> {item.word.toLowerCase()}s!
      </button>
      <div className={`train ${depart ? 'depart' : ''}`} aria-hidden="true">
        <span className="train-engine">
          <span className="t-cab" /><span className="t-chimney" />
          <span className="t-puff p1" /><span className="t-puff p2" />
          <span className="t-wheel w1" /><span className="t-wheel w2" />
        </span>
        <span className="train-wagon">
          <span className="wagon-load">
            {[...Array(loaded)].map((_, i) => <span key={i} className="wagon-item" style={{ color: 'var(--zc)' }}><Illu name={illuName} size={30} /></span>)}
          </span>
          <span className="t-wheel w1" /><span className="t-wheel w2" />
        </span>
      </div>
      <div className="count-tray">
        {[...Array(7)].map((_, i) => (
          <button key={round + '-' + i} className={`count-item ${hopping.includes(i) ? 'hop' : ''}`}
            aria-label={item.word} disabled={hopping.includes(i)} onClick={() => tap(i)}>
            <span style={{ color: 'var(--zc)' }}><Illu name={illuName} size={48} /></span>
          </button>
        ))}
      </div>
      <div className="game-round">{round + 1} / {TRAIN_ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={3} title="Choo choo!" sub="You counted every load!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); setLoaded(0); setHopping([]); setDepart(false); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 6. SHADOW PUZZLE (2 rounds) ============ */
export function ShadowPuzzle({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 6, true);
  const totalRounds = pool.length >= 6 ? 2 : 1;
  const [rnd, setRnd] = useState(0);
  const safe = pool.slice(rnd * 3, rnd * 3 + 3);
  const [placed, setPlaced] = useState([]);
  const [tray, setTray] = useState(() => shuffle(pool.slice(0, 3)));
  const [drag, setDrag] = useState(null);
  const [wig, setWig] = useState(null);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => { setTimeout(() => speak('Match each friend to its shadow!'), 500); }, []);
  useEffect(() => {
    setTray(shuffle(pool.slice(rnd * 3, rnd * 3 + 3))); setPlaced([]);
    if (rnd > 0) speak('Round two! New shadows!');
  }, [rnd]);

  const down = (e, c) => { e.preventDefault(); setDrag({ id: c.id, x: e.clientX, y: e.clientY }); };
  const move = (e) => { if (drag) setDrag((d) => ({ ...d, x: e.clientX, y: e.clientY })); };
  const up = (e) => {
    if (!drag) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el && el.closest('[data-shadow]');
    const id = drag.id; setDrag(null);
    if (slot) {
      if (slot.getAttribute('data-shadow') === id) {
        const np = [...placed, id];
        setPlaced(np); setWig(id); speak('Perfect fit!');
        setTimeout(() => setWig(null), 600);
        if (np.length === safe.length) {
          if (rnd + 1 < totalRounds) setTimeout(() => setRnd(rnd + 1), 900);
          else { setBurst(true); setTimeout(() => { setEnd({ stars: 3 }); onDone('shadow', 3); }, 700); }
        }
      } else speak('Hmm, try another shadow!');
    }
  };

  return (
    <div className="game-area" data-screen-label="Shadow Puzzle" onPointerMove={move} onPointerUp={up}>
      <div className="game-ask hud-pill">Match the shadows!</div>
      <div className="shadow-row">
        {safe.map((c) => (
          <div key={c.id} className={`shadow-slot ${placed.includes(c.id) ? 'filled' : ''} ${wig === c.id ? 'wiggle' : ''}`} data-shadow={c.id}
            aria-label={placed.includes(c.id) ? c.word : 'Mystery shadow'}>
            <span className="shadow-art" style={{ color: 'var(--zc)' }}>{cardArt(c, 72)}</span>
          </div>
        ))}
      </div>
      <div className="sort-tray">
        {tray.map((c) => placed.includes(c.id) ? null : (
          <button key={c.id} className="sort-item" aria-label={c.word}
            style={{ visibility: drag && drag.id === c.id ? 'hidden' : 'visible', color: 'var(--zc)' }}
            onPointerDown={(e) => down(e, c)}>{cardArt(c, 56)}</button>
        ))}
      </div>
      {drag && (() => { const c = safe.find((x) => x.id === drag.id); return (
        <span className="drag-ghost" style={{ left: drag.x, top: drag.y, color: 'var(--zc)' }}>{cardArt(c, 60)}</span>); })()}
      <div className="game-round">{rnd + 1} / {totalRounds}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={3} title="Shadow master!" sub="Every friend found its shadow!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setPlaced([]); setTray(shuffle(pool.slice(0, 3))); setRnd(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 7. PIP SAYS ============ */
export function PipSays({ cat, speak, onDone, I, Star, Burst }) {
  const cards = pickCards(cat.id, 3);
  const SAYS_ROUNDS = 4;
  const [round, setRound] = useState(0);       // seq length 2,3,4,5
  const [seq, setSeq] = useState([]);
  const [lit, setLit] = useState(null);
  const [phase, setPhase] = useState('watch'); // watch | play | dance
  const [pos, setPos] = useState(0);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const timers = useRef([]);

  const playSeq = (s) => {
    setPhase('watch'); setPos(0);
    timers.current.forEach(clearTimeout); timers.current = [];
    s.forEach((ci, i) => {
      timers.current.push(setTimeout(() => {
        setLit(ci); speak(cards[ci].word);
        timers.current.push(setTimeout(() => setLit(null), 600));
        if (i === s.length - 1) timers.current.push(setTimeout(() => { setPhase('play'); speak('Your turn!'); }, 900));
      }, 600 + i * 950));
    });
  };
  const startRound = (r) => {
    const s = [...Array(r + 2)].map(() => Math.floor(Math.random() * cards.length));
    setSeq(s); playSeq(s);
  };
  useEffect(() => { startRound(0); return () => timers.current.forEach(clearTimeout); }, []);

  const tap = (ci) => {
    if (phase !== 'play' || end) return;
    setLit(ci); setTimeout(() => setLit(null), 350);
    if (ci === seq[pos]) {
      speak(cards[ci].word);
      if (pos + 1 >= seq.length) {
        if (round + 1 >= SAYS_ROUNDS) {
          setPhase('dance'); setBurst(true); speak('Dance party!');
          setTimeout(() => { setEnd({ stars: 3 }); onDone('pipsays', 3); }, 1400);
        } else {
          speak('Yes! Listen again!');
          const nr = round + 1; setRound(nr);
          setTimeout(() => startRound(nr), 900);
        }
      } else setPos(pos + 1);
    } else {
      speak("Oops! Listen again!");
      setTimeout(() => playSeq(seq), 800);
    }
  };

  return (
    <div className="game-area" data-screen-label="Pip Says">
      <div className={`pipsays-mascot ${phase === 'dance' ? 'dance' : ''}`}>
        <HeroMascot state={phase === 'watch' ? 'point' : phase === 'dance' ? 'cheer' : 'idle'} size={86} />
      </div>
      <div className="game-ask hud-pill">{phase === 'watch' ? 'Watch and listen…' : phase === 'play' ? 'Your turn! Repeat it!' : 'Dance party!'}</div>
      <div className="says-row">
        {cards.map((c, i) => (
          <button key={c.id} className={`says-card ${lit === i ? 'lit' : ''} ${phase === 'dance' ? 'bop' : ''}`}
            style={{ animationDelay: `${i * .12}s` }} aria-label={c.word}
            disabled={phase !== 'play'} onClick={() => tap(i)}>
            <span style={{ color: 'var(--zc)' }}>{cardArt(c, 64)}</span>
            <b>{c.word}</b>
          </button>
        ))}
      </div>
      <div className="game-round">{round + 1} / {SAYS_ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={3} title="Amazing ears!" sub="You remembered every sound!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); setPhase('watch'); startRound(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 8. CALM CORNER ============ */
export function CalmCorner({ speak }) {
  const [flies, setFlies] = useState(() => [...Array(10)].map((_, i) => ({
    k: i, left: 6 + Math.random() * 88, top: 10 + Math.random() * 70,
    dur: 9 + Math.random() * 8, delay: Math.random() * -12, glow: false,
  })));
  const [breath, setBreath] = useState('in');
  useEffect(() => {
    const iv = setInterval(() => setBreath((b) => b === 'in' ? 'out' : 'in'), 4000);
    setTimeout(() => speak('Welcome to the calm corner. Breathe with the flower.'), 600);
    return () => clearInterval(iv);
  }, []);
  const tapFly = (k) => {
    setFlies((fs) => fs.map((f) => f.k === k ? { ...f, glow: true } : f));
    setTimeout(() => setFlies((fs) => fs.map((f) => f.k === k ? { ...f, glow: false } : f)), 900);
  };
  return (
    <div className="game-area calm" data-screen-label="Calm Corner">
      <span className="calm-moon" aria-hidden="true" />
      {flies.map((f) => (
        <button key={f.k} className={`firefly ${f.glow ? 'glow' : ''}`} aria-label="Firefly"
          style={{ left: `${f.left}%`, top: `${f.top}%`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}
          onClick={() => tapFly(f.k)} />
      ))}
      <div className={`breath-flower ${breath}`} aria-hidden="true">
        {[...Array(6)].map((_, i) => <span key={i} className="petal" style={{ '--r': `${i * 60}deg` }} />)}
        <span className="flower-heart" />
      </div>
      <div className="breath-label" role="status">{breath === 'in' ? 'Breathe in…' : 'Breathe out…'}</div>
    </div>
  );
}
