// set5.jsx — motion/depth games: Block Stacker, Tunnel Runner, Card Fountain,
// Balloon Float. Ported verbatim from adventure-activities5.jsx.
import { useState, useEffect, useRef } from 'react';
import { HeroMascot } from '../art/Mascot.jsx';
import { advGamePool, cardArt, shuffle, NUM_WORDS, SPEEDS } from './util.jsx';
import { SpeedPills } from './SpeedPills.jsx';
import { StarsModal as AdvStarsModal } from './StarsModal.jsx';
import { advSfx } from '../audio.js';

const BLOCK_COLORS = ['#ff4b4b', '#ffc83d', '#58cc02', '#1cb0f6', '#a560e8', '#ff9600'];

/* ============ 17. BLOCK STACKER (3D tower) ============ */
export function BlockStacker({ speak, onDone, I, Star, Burst }) {
  const GOAL = 6;
  const [blocks, setBlocks] = useState([]);
  const [dropping, setDropping] = useState(false);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => { const t = setTimeout(() => speak('Build a big tower! Tap the drop button!'), 500); return () => clearTimeout(t); }, []);

  const drop = () => {
    if (dropping || end || blocks.length >= GOAL) return;
    setDropping(true);
    const n = blocks.length + 1;
    setBlocks((b) => [...b, { k: n, c: BLOCK_COLORS[(n - 1) % BLOCK_COLORS.length], off: (Math.random() - .5) * 14 }]);
    advSfx('tap');
    speak(NUM_WORDS[n] + '!');
    setTimeout(() => {
      setDropping(false);
      if (n >= GOAL) {
        speak(`${NUM_WORDS[GOAL]} blocks! What a tower!`); setBurst(true);
        setTimeout(() => { setEnd({ stars: 3 }); onDone('stack', 3); }, 1000);
      }
    }, 650);
  };

  return (
    <div className="game-area" data-screen-label="Block Stacker">
      <div className="game-ask hud-pill">Stack {GOAL} blocks! · {blocks.length} so far</div>
      <div className="stack-scene">
        <div className={`tower ${blocks.length >= 4 ? 'sway' : ''}`}>
          {blocks.map((b, i) => (
            <span key={b.k} className="blk" style={{ '--bc': b.c, bottom: i * 46, marginLeft: b.off }}>
              <span className="blk-top" /><span className="blk-side" />
              <b>{i + 1}</b>
            </span>
          ))}
        </div>
        <span className="stack-ground" aria-hidden="true" />
      </div>
      <button className="gbtn gold" style={{ marginBottom: 6 }} disabled={dropping || blocks.length >= GOAL} onClick={drop} data-testid="stack-drop">
        <I n="cube" s={24} /> Drop a block!
      </button>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={3} title="Tower of six!" sub="You counted every block!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setBlocks([]); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 18. TUNNEL RUNNER (fly-at-you tapping) ============ */
export function TunnelRunner({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const GOAL = 7;
  const [items, setItems] = useState([]);
  const [target] = useState(pool[0]); // target is fixed for the whole run
  const [score, setScore] = useState(0);
  const [spd, setSpd] = useState(1);
  const mul = SPEEDS[spd].mul;
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);
  const stateRef = useRef({}); stateRef.current = { end, target };

  useEffect(() => { const t = setTimeout(() => speak(`Find the ${pool[0].word}!`), 500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (end) return;
    const iv = setInterval(() => {
      const s = stateRef.current; if (s.end) return;
      setItems((arr) => {
        if (arr.length >= 4) return arr;
        const card = Math.random() < 0.5 ? s.target : pool[Math.floor(Math.random() * pool.length)];
        const k = Date.now() + Math.random();
        setTimeout(() => setItems((a) => a.filter((x) => x.k !== k)), 4300 / mul);
        return [...arr, { k, card, x: 14 + Math.random() * 72, y: 22 + Math.random() * 46 }];
      });
    }, 1100 / mul);
    return () => clearInterval(iv);
  }, [end, spd]);

  const tap = (it) => {
    if (end || it.hit) return;
    if (it.card.word === target.word) {
      const ns = score + 1; setScore(ns);
      setItems((a) => a.map((x) => x.k === it.k ? { ...x, hit: true } : x));
      setTimeout(() => setItems((a) => a.filter((x) => x.k !== it.k)), 450);
      advSfx('yes');
      speak(ns >= GOAL ? 'You caught them all!' : 'Got it!');
      if (ns >= GOAL) {
        const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
        setBurst(true); setTimeout(() => { setEnd({ stars }); onDone('tunnel', stars); }, 800);
      }
    } else { wrongs.current += 1; advSfx('no'); speak(`That's the ${it.card.word}!`); }
  };

  return (
    <div className="game-area tunnel" data-screen-label="Tunnel Runner">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Tap every <b>{target.word}</b>!
      </button>
      <SpeedPills value={spd} onChange={setSpd} />
      <div className="tunnel-scene">
        {[0, 1, 2, 3].map((i) => <span key={i} className="tunnel-ring" style={{ animationDelay: `${i * 1}s` }} aria-hidden="true" />)}
        {items.map((it) => (
          <button key={it.k} className={`tunnel-item ${it.hit ? 'hit' : ''}`} style={{ left: `${it.x}%`, top: `${it.y}%`, animationDuration: `${(4.2 / mul).toFixed(1)}s` }}
            aria-label={it.card.word} onClick={() => tap(it)}>
            <span style={{ color: 'var(--zc)' }}>{cardArt(it.card, 54)}</span>
          </button>
        ))}
      </div>
      <div className="game-round">{score} / {GOAL}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Super speedy!" sub="Nothing gets past you!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setScore(0); wrongs.current = 0; setItems([]); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 19. CARD FOUNTAIN (3D orbit ring) ============ */
export function CardFountain({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 6, true);
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(pool[0]);
  const [caught, setCaught] = useState([]);
  const [spd, setSpd] = useState(1);
  const mul = SPEEDS[spd].mul;
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  useEffect(() => { const t = setTimeout(() => speak(`Find the ${target.word}!`), 500); return () => clearTimeout(t); }, [round]);

  const tap = (c) => {
    if (end || caught.includes(c.word)) return;
    if (c.word === target.word) {
      setCaught((g) => [...g, c.word]); advSfx('yes'); speak(`${c.word}! Got it!`);
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('fountain', stars);
        } else {
          const left = pool.filter((p) => !caught.includes(p.word) && p.word !== c.word);
          setTarget(left[Math.floor(Math.random() * left.length)]);
          setRound(round + 1);
        }
      }, 700);
    } else { wrongs.current += 1; advSfx('no'); speak(`That's the ${c.word}. Find the ${target.word}!`); }
  };

  return (
    <div className="game-area" data-screen-label="Card Fountain">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Tap the <b>{target.word}</b> as it dances by!
      </button>
      <SpeedPills value={spd} onChange={setSpd} />
      <div className="fountain-scene">
        <span className="fountain-pip"><HeroMascot state="cheer" size={84} /></span>
        <div className="fountain-ring" style={{ animationDuration: `${(14 / mul).toFixed(1)}s` }}>
          {pool.map((c, i) => (
            <button key={c.word} className={`fountain-card ${caught.includes(c.word) ? 'gone' : ''}`}
              style={{ '--fa': `${i * 60}deg` }} aria-label={c.word} onClick={() => tap(c)}>
              <span style={{ color: 'var(--zc)' }}>{cardArt(c, 50)}</span>
              <b>{c.word}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Fountain catcher!" sub="You caught the dancing cards!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; setCaught([]); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 20. BALLOON FLOAT (depth-layer popping) ============ */
const BALLOON_HUES = ['#ff4b4b', '#ffc83d', '#58cc02', '#1cb0f6', '#a560e8'];
export function BalloonFloat({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 5, true);
  const ROUNDS = 6;
  const [round, setRound] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [target, setTarget] = useState(pool[0]);
  const [spd, setSpd] = useState(1);
  const mul = SPEEDS[spd].mul;
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  const spawn = (r) => {
    const t = pool[r % pool.length];
    setTarget(t);
    const others = shuffle(pool.filter((c) => c.word !== t.word)).slice(0, 4);
    setBalloons(shuffle([t, ...others]).map((c, i) => ({
      card: c, k: r + '-' + i, left: 6 + i * 18 + Math.random() * 5,
      depth: i % 3,                       // 0 near, 1 mid, 2 far
      hue: BALLOON_HUES[i % 5],
      dur: 9 + (i % 3) * 4 + Math.random() * 3, delay: Math.random() * 2,
      popped: false,
    })));
  };
  useEffect(() => { spawn(0); }, []);
  useEffect(() => { const t = setTimeout(() => speak(`Find the ${target.word}!`), 600); return () => clearTimeout(t); }, [round]);

  const tap = (b) => {
    if (b.popped || end) return;
    if (b.card.word === target.word) {
      setBalloons((bs) => bs.map((x) => x.k === b.k ? { ...x, popped: true } : x));
      advSfx('pop');
      speak('Pop!');
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('balloon', stars);
        } else { setRound(round + 1); spawn(round + 1); }
      }, 650);
    } else { wrongs.current += 1; advSfx('no'); speak(`That's the ${b.card.word}!`); }
  };

  return (
    <div className="game-area" data-screen-label="Balloon Float">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Pop the <b>{target.word}</b> balloon!
      </button>
      <SpeedPills value={spd} onChange={setSpd} />
      <div className="bub-sky">
        {balloons.map((b) => (
          <button key={b.k} className={`balloon d${b.depth} ${b.popped ? 'popped' : ''}`}
            style={{ left: `${b.left}%`, animationDuration: `${(b.dur / mul).toFixed(2)}s`, animationDelay: `${b.delay}s`, '--bh': b.hue }}
            aria-label={b.card.word} onClick={() => tap(b)}>
            <span className="balloon-skin">
              <span className="balloon-art" style={{ color: '#fff' }}>{cardArt(b.card, 44)}</span>
            </span>
            <span className="balloon-string" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="game-round">{Math.min(round + 1, ROUNDS)} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Balloon popper!" sub="Pop pop pop — all gone!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; spawn(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}
