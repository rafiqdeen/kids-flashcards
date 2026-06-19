// set1.jsx — Bubble Pop, Memory Match, Tracing, Color Sort (Feed the Monsters).
// Ported verbatim from adventure-activities.jsx (window globals -> imports).
import { useState, useEffect, useRef } from 'react';
import { Illu } from '../art/Illu.jsx';
import { advGamePool, cardArt, shuffle } from './util.jsx';
import { StarsModal } from './StarsModal.jsx';

/* ============ 1. BUBBLE POP ============ */
export function BubblePop({ cat, speak, onDone, I, Star, Burst }) {
  const cards = advGamePool(cat.id, 6, true);
  const ROUNDS = 8;
  const [round, setRound] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [misses, setMisses] = useState(0);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const target = cards[round % cards.length];

  const spawn = (r) => {
    const t = cards[r % cards.length];
    const others = shuffle(cards.filter((c) => c.id !== t.id)).slice(0, 4);
    setBubbles(shuffle([t, ...others]).map((c, i) => ({
      card: c, k: r + '-' + i, left: 8 + i * 18 + Math.random() * 6,
      dur: 7 + Math.random() * 4, delay: Math.random() * 1.4, popped: false, wob: false,
    })));
  };
  useEffect(() => { spawn(0); }, []);
  useEffect(() => { const t = setTimeout(() => speak(`Pop the ${target.word}!`), 500); return () => clearTimeout(t); }, [round]);

  const tap = (b) => {
    if (b.popped || end) return;
    if (b.card.id === target.id) {
      setBubbles((bs) => bs.map((x) => x.k === b.k ? { ...x, popped: true } : x));
      speak('Pop! Yes!');
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = misses === 0 ? 3 : misses <= 3 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('bubble', stars);
        } else { setRound(round + 1); spawn(round + 1); }
      }, 650);
    } else {
      setMisses((m) => m + 1);
      setBubbles((bs) => bs.map((x) => x.k === b.k ? { ...x, wob: true } : x));
      speak(`That's the ${b.card.word}. Find the ${target.word}!`);
      setTimeout(() => setBubbles((bs) => bs.map((x) => x.k === b.k ? { ...x, wob: false } : x)), 600);
    }
  };

  return (
    <div className="game-area bubblepop" data-screen-label="Bubble Pop">
      <button className="qprompt game-ask" onClick={() => speak(`Pop the ${target.word}!`)}>
        <I n="sound" s={22} /> Pop the <b>{target.word}</b>
      </button>
      <div className="bub-sky">
        {bubbles.map((b) => (
          <button key={b.k} className={`bub ${b.popped ? 'popped' : ''} ${b.wob ? 'wob' : ''}`}
            style={{ left: `${b.left}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            aria-label={b.card.word} onClick={() => tap(b)}>
            <span className="bub-skin" />
            <span className="bub-art" style={{ color: 'var(--zc)' }}>{cardArt(b.card, 52)}</span>
            {b.popped && <span className="bub-burst">{[...Array(6)].map((_, i) => <i key={i} style={{ '--a': `${i * 60}deg` }} />)}</span>}
          </button>
        ))}
      </div>
      <div className="game-round">{Math.min(round + 1, ROUNDS)} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <StarsModal stars={end.stars} title="Pop-tastic!" sub="You popped them all!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); setMisses(0); spawn(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 2. MEMORY MATCH ============ */
export function MemoryMatch({ cat, speak, onDone, I, Star, Burst }) {
  const build = () => shuffle(advGamePool(cat.id, 6, true).flatMap((c) => [{ c, k: c.id + 'a' }, { c, k: c.id + 'b' }]));
  const [tiles, setTiles] = useState(build);
  const [up, setUp] = useState([]);       // keys currently face-up (unmatched)
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const lock = useRef(false);

  const flip = (t) => {
    if (lock.current || up.includes(t.k) || matched.includes(t.k) || end) return;
    const nu = [...up, t.k];
    setUp(nu);
    speak(t.c.word);
    if (nu.length === 2) {
      lock.current = true; setMoves((m) => m + 1);
      const [a, b] = nu.map((k) => tiles.find((x) => x.k === k));
      setTimeout(() => {
        if (a.c.id === b.c.id) {
          const nm = [...matched, a.k, b.k];
          setMatched(nm); setUp([]); speak('A match!');
          if (nm.length === tiles.length) {
            const stars = moves + 1 <= 9 ? 3 : moves + 1 <= 13 ? 2 : 1;
            setBurst(true); setEnd({ stars }); onDone('memory', stars);
          }
        } else setUp([]);
        lock.current = false;
      }, 900);
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Memory Match">
      <div className="game-ask hud-pill">Find the pairs! · {moves} flips</div>
      <div className="mem-grid">
        {tiles.map((t) => {
          const face = up.includes(t.k) || matched.includes(t.k);
          return (
            <button key={t.k} className={`mcard ${face ? 'face' : ''} ${matched.includes(t.k) ? 'won' : ''}`}
              aria-label={face ? t.c.word : 'Hidden card'} onClick={() => flip(t)}>
              <span className="mcard-3d">
                <span className="mface mback"><I n="star" s={30} /></span>
                <span className="mface mfront" style={{ color: 'var(--zc)' }}>{cardArt(t.c, 56)}</span>
              </span>
            </button>
          );
        })}
      </div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <StarsModal stars={end.stars} title="Super memory!" sub={`All pairs in ${moves} flips!`} I={I} Star={Star}
        onAgain={() => { setTiles(build()); setUp([]); setMatched([]); setMoves(0); setEnd(null); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 3. TRACING (3-glyph course per zone) ============ */
const TRACE_LIB = {
  C: { d: 'M 72 30 Q 50 12 32 30 Q 18 46 32 66 Q 50 84 72 66', say: 'C!', label: 'C' },
  L: { d: 'M 30 25 L 30 75 L 70 75', say: 'Big letter L!', label: 'L' },
  V: { d: 'M 28 24 L 50 78 L 72 24', say: 'V!', label: 'V' },
  one: { d: 'M 40 32 L 54 20 L 54 80', say: 'One!', label: '1' },
  three: { d: 'M 32 26 Q 52 14 62 30 Q 68 42 50 48 Q 72 52 64 70 Q 54 84 32 72', say: 'Three!', label: '3' },
  seven: { d: 'M 30 24 L 70 24 L 46 78', say: 'Seven!', label: '7' },
  circle: { d: 'M 50 18 Q 80 30 72 60 Q 62 84 38 80 Q 16 72 22 44 Q 28 22 50 18', say: 'A circle!', label: 'O' },
  square: { d: 'M 30 30 L 70 30 L 70 70 L 30 70 L 30 32', say: 'A square!', label: '□' },
  zig: { d: 'M 22 70 L 38 32 L 54 70 L 70 32', say: 'Zig zag!', label: 'Z' },
  wave: { d: 'M 22 60 Q 32 30 42 60 Q 52 86 62 56 Q 70 32 80 56', say: 'A wavy wave!', label: '~' },
  hill: { d: 'M 28 70 Q 50 20 72 70', say: 'Up the hill and down!', label: '⌒' },
};
const TRACE_SETS = {
  animals: ['C', 'hill', 'zig'],
  alphabet: ['C', 'L', 'V'],
  numbers: ['one', 'three', 'seven'],
  fruits: ['circle', 'hill', 'wave'],
  shapes: ['circle', 'square', 'zig'],
  colors: ['wave', 'zig', 'circle'],
  body: ['circle', 'wave', 'hill'],
};
export function Tracing({ cat, speak, onDone, I, Star, Burst }) {
  const set = (TRACE_SETS[cat.id] || TRACE_SETS.shapes).map((k) => TRACE_LIB[k]);
  const [g, setG] = useState(0);
  const tr = set[g];
  const svgRef = useRef(null), pathRef = useRef(null), ptsRef = useRef([]), idxRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [total, setTotal] = useState(40);
  const [len, setLen] = useState(0);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const dragging = useRef(false);

  useEffect(() => {
    const p = pathRef.current; const L = p.getTotalLength(); setLen(L);
    const N = 40; const pts = [];
    for (let i = 0; i <= N; i++) pts.push(p.getPointAtLength((i / N) * L));
    ptsRef.current = pts; setTotal(N);
    idxRef.current = 0; setIdx(0);
    const t = setTimeout(() => speak(g === 0 ? `Trace it with your finger! ${tr.say}` : `Now this one! ${tr.say}`), 400);
    return () => clearTimeout(t);
  }, [g]);

  const toSvg = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (100 / r.width), y: (e.clientY - r.top) * (100 / r.height) };
  };
  const advance = (e) => {
    const p = toSvg(e); const pts = ptsRef.current;
    let i = idxRef.current;
    while (i < total && pts[i] && Math.hypot(pts[i].x - p.x, pts[i].y - p.y) < 11) i++;
    if (i !== idxRef.current) {
      idxRef.current = i; setIdx(i);
      if (i >= total && !end) {
        if (g + 1 < set.length) {
          speak(`${tr.say} Wonderful!`);
          setTimeout(() => setG(g + 1), 900);
        } else {
          speak(tr.say); setBurst(true);
          setTimeout(() => { setEnd({ stars: 3 }); onDone('trace', 3); }, 800);
        }
      }
    }
  };
  const down = (e) => { e.preventDefault(); dragging.current = true; advance(e); };
  const move = (e) => { if (dragging.current) { e.preventDefault(); advance(e); } };
  const stop = () => { dragging.current = false; };
  const next = ptsRef.current[Math.min(idx, total)] || { x: 0, y: 0 };

  return (
    <div className="game-area gctr" data-screen-label="Tracing">
      <div className="game-ask hud-pill">Trace the <b style={{ color: 'var(--zc)', margin: '0 4px' }}>{tr.label}</b>!</div>
      <div className={`trace-paper ${idx >= total ? 'donebounce' : ''}`}>
        <svg ref={svgRef} viewBox="0 0 100 100" style={{ touchAction: 'none', width: '100%', height: '100%' }}
          onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerLeave={stop}>
          <path d={tr.d} fill="none" stroke="#e3d7c5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <path d={tr.d} fill="none" stroke="#cbbda6" strokeWidth="2.5" strokeDasharray="0.5 6" strokeLinecap="round" />
          <path ref={pathRef} d={tr.d} fill="none" stroke="var(--zc)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={len} strokeDashoffset={len * (1 - idx / total)} style={{ transition: 'stroke-dashoffset .12s linear' }} />
          {idx < total && <circle className="trace-dot" cx={next.x} cy={next.y} r="6" fill="#fff" stroke="var(--zc)" strokeWidth="3" />}
        </svg>
      </div>
      <div className="game-round">{g + 1} / {set.length}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <StarsModal stars={3} title="Beautiful tracing!" sub="Three perfect strokes!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setIdx(0); idxRef.current = 0; setG(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 4. COLOR SORT (feed the monsters) ============ */
const SORT_COLORS = [
  { id: 'red', hex: '#ef4444', name: 'Red' },
  { id: 'yellow', hex: '#fbbf24', name: 'Yellow' },
  { id: 'blue', hex: '#3b82f6', name: 'Blue' },
];
export function ColorSort({ speak, onDone, I, Star, Burst }) {
  const build = () => shuffle(SORT_COLORS.flatMap((c) => [
    { col: c, k: c.id + '1' }, { col: c, k: c.id + '2' }, { col: c, k: c.id + '3' },
  ]));
  const [items, setItems] = useState(build);
  const [fed, setFed] = useState([]);
  const [drag, setDrag] = useState(null); // {k, x, y}
  const [chomp, setChomp] = useState(null);
  const [shake, setShake] = useState(null);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => { setTimeout(() => speak('Feed the hungry monsters their favorite colors!'), 500); }, []);

  const down = (e, it) => { e.preventDefault(); setDrag({ k: it.k, x: e.clientX, y: e.clientY }); };
  const move = (e) => { if (drag) setDrag((d) => ({ ...d, x: e.clientX, y: e.clientY })); };
  const up = (e) => {
    if (!drag) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const m = el && el.closest('[data-monster]');
    const it = items.find((x) => x.k === drag.k);
    setDrag(null);
    if (m && it) {
      const mid = m.getAttribute('data-monster');
      if (mid === it.col.id) {
        const nf = [...fed, it.k];
        setFed(nf); setChomp(mid); speak(`Yum! ${it.col.name}!`);
        setTimeout(() => setChomp(null), 600);
        if (nf.length === items.length) {
          setBurst(true);
          setTimeout(() => { setEnd({ stars: 3 }); onDone('sort', 3); }, 700);
        }
      } else {
        setShake(mid); speak(`No no — I only eat ${SORT_COLORS.find((c) => c.id === mid).name.toLowerCase()}!`);
        setTimeout(() => setShake(null), 500);
      }
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Color Sort" onPointerMove={move} onPointerUp={up}>
      <div className="game-ask hud-pill">Feed the monsters!</div>
      <div className="monster-row">
        {SORT_COLORS.map((c) => (
          <div key={c.id} className={`monster ${chomp === c.id ? 'chomp' : ''} ${shake === c.id ? 'shakex' : ''}`}
            data-monster={c.id} style={{ '--mc': c.hex }} aria-label={`${c.name} monster`}>
            <span className="m-eye l" /><span className="m-eye r" />
            <span className="m-mouth" />
          </div>
        ))}
      </div>
      <div className="sort-tray">
        {items.map((it) => fed.includes(it.k) ? null : (
          <button key={it.k} className="sort-item" style={{ color: it.col.hex, visibility: drag && drag.k === it.k ? 'hidden' : 'visible' }}
            aria-label={it.col.name} onPointerDown={(e) => down(e, it)}>
            <Illu name="swatch" hex={it.col.hex} size={52} />
          </button>
        ))}
      </div>
      {drag && (() => { const it = items.find((x) => x.k === drag.k); return (
        <span className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <Illu name="swatch" hex={it.col.hex} size={56} />
        </span>); })()}
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <StarsModal stars={3} title="All fed!" sub="The monsters are full and happy!" I={I} Star={Star}
        onAgain={() => { setItems(build()); setFed([]); setEnd(null); }} onBack={() => onDone('__back')} />}
    </div>
  );
}
