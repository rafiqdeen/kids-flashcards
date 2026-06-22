// set3.jsx — Peek-a-Boo, Magic Cube (3D), Picture Pieces (jigsaw), Egg Surprise.
// Ported verbatim from adventure-activities3.jsx (window globals -> imports).
import { useState, useEffect, useRef, useMemo } from 'react';
import { advGamePool, cardArt, shuffle, SPEEDS } from './util.jsx';
import { SpeedPills } from './SpeedPills.jsx';
import { StarsModal as AdvStarsModal } from './StarsModal.jsx';
import { advSfx } from '../audio.js';

/* ============ 9. PEEK-A-BOO (whack-a-mole pops) ============ */
export function PeekABoo({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const GOAL = 6;
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(pool[0]);
  const [up, setUp] = useState({});       // hole -> {card, k, leaving, caught}
  const [spd, setSpd] = useState(1);     // index into SPEEDS (default Normal)
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);
  const stateRef = useRef({});
  stateRef.current = { up, target, end };
  const mul = SPEEDS[spd].mul;
  const mulRef = useRef(mul); mulRef.current = mul;

  useEffect(() => { const t = setTimeout(() => speak(`Find the ${pool[0].word}!`), 500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (end) return;
    const iv = setInterval(() => {
      const s = stateRef.current;
      if (s.end) return;
      const empty = [0, 1, 2, 3].filter((h) => !s.up[h]);
      if (!empty.length) return;
      const hole = empty[Math.floor(Math.random() * empty.length)];
      const card = Math.random() < 0.45 ? s.target : pool[Math.floor(Math.random() * pool.length)];
      const k = Date.now() + '-' + hole;
      setUp((u) => ({ ...u, [hole]: { card, k } }));
      setTimeout(() => setUp((u) => (u[hole] && u[hole].k === k && !u[hole].caught ? { ...u, [hole]: { ...u[hole], leaving: true } } : u)), 1500 / mulRef.current);
      setTimeout(() => setUp((u) => (u[hole] && u[hole].k === k && !u[hole].caught ? { ...u, [hole]: null } : u)), 1800 / mulRef.current);
    }, 850 / mul);
    return () => clearInterval(iv);
  }, [end, spd]);

  const tap = (h) => {
    const o = up[h];
    if (!o || o.leaving || o.caught || end) return;
    if (o.card.word === target.word) {
      advSfx('pop');
      const ns = score + 1; setScore(ns);
      setUp((u) => ({ ...u, [h]: { ...o, caught: true } }));
      setTimeout(() => setUp((u) => ({ ...u, [h]: null })), 560);
      if (ns >= GOAL) {
        speak('You found them all!'); setBurst(true);
        const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
        setTimeout(() => { setEnd({ stars }); onDone('peek', stars); }, 800);
      } else {
        const nt = pool[Math.floor(Math.random() * pool.length)];
        setTarget(nt);
        speak(`Find the ${nt.word}!`);
      }
    } else {
      advSfx('no');
      wrongs.current += 1;
      speak(`Hee hee! I'm the ${o.card.word}!`);
      setUp((u) => ({ ...u, [h]: { ...o, leaving: true } }));
      setTimeout(() => setUp((u) => ({ ...u, [h]: null })), 300);
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Peek-a-Boo">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Tap the <b>{target.word}</b>!
      </button>
      <SpeedPills value={spd} onChange={setSpd} />
      <div className="peek-field">
        {[0, 1, 2, 3].map((h) => (
          <div key={h} className="peek-hole">
            <span className="hole-shadow" aria-hidden="true" />
            {up[h] && (
              <button className={`peek-pop ${up[h].leaving ? 'leaving' : ''} ${up[h].caught ? 'caught' : ''}`}
                aria-label={up[h].card.word} onClick={() => tap(h)}>
                <span style={{ color: 'var(--zc)' }}>{cardArt(up[h].card, 60)}</span>
              </button>
            )}
            <span className="hole-grass" aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="game-round">{score} / {GOAL}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Peek-a-boo champ!" sub="Nobody can hide from you!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setScore(0); wrongs.current = 0; setUp({}); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 10. MAGIC CUBE (3D spin puzzle) ============ */
export function MagicCube({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const ROUNDS = 5;
  const [faces, setFaces] = useState(() => shuffle(pool));
  const [rotY, setRotY] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => pool[Math.floor(Math.random() * 4)]);
  const [winFx, setWinFx] = useState(false);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 760px)').matches);
  const wrongs = useRef(0);
  const CUBE = wide ? 280 : 230, tz = CUBE / 2, artSize = Math.round(CUBE * 0.4);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const m = window.matchMedia('(min-width: 760px)');
    const h = () => setWide(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  useEffect(() => { const t = setTimeout(() => speak(`Find the ${target.word}!`), 500); return () => clearTimeout(t); }, [round]);

  const frontIdx = ((Math.round(-rotY / 90) % 4) + 4) % 4;
  const turn = (d) => { if (end || winFx) return; advSfx('tap'); setRotY((r) => r + d * 90); };
  const tapCube = () => {
    if (end || winFx) return;
    const f = faces[frontIdx];
    if (f.word === target.word) {
      advSfx('yes');
      speak(`Yes! ${f.word}!`); setWinFx(true);
      setTimeout(() => {
        setWinFx(false);
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('cube', stars);
        } else {
          const nf = shuffle(pool); setFaces(nf);
          setTarget(nf[Math.floor(Math.random() * 4)]);
          setRound(round + 1);
        }
      }, 1000);
    } else {
      advSfx('no');
      wrongs.current += 1;
      speak(`That's the ${f.word}. Keep turning! Find the ${target.word}!`);
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Magic Cube">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Spin to the <b>{target.word}</b>, then tap it!
      </button>
      <div className="cube-stage">
        <button className="gbtn white round cube-turn" aria-label="Turn left" onClick={() => turn(-1)}><I n="back" s={26} /></button>
        <div className="cube-holder">
          <div className={`cube-scene ${winFx ? 'win' : ''}`} style={{ width: CUBE, height: CUBE }}>
            <div className="cube" style={{ transform: `rotateX(-13deg) rotateY(${rotY}deg)` }}
              role="button" tabIndex={0} aria-label={`Cube showing ${faces[frontIdx].word}. Tap if it is the ${target.word}.`}
              onClick={tapCube} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapCube(); } }}>
              {faces.map((c, i) => (
                <span key={c.word} className="cube-face" style={{ transform: `rotateY(${i * 90}deg) translateZ(${tz}px)` }}>
                  <span style={{ color: 'var(--zc)' }}>{cardArt(c, artSize)}</span>
                  <b>{c.word}</b>
                </span>
              ))}
              <span className="cube-face cap top" style={{ transform: `rotateX(90deg) translateZ(${tz}px)` }} aria-hidden="true"><span className="cube-spark">✨</span></span>
              <span className="cube-face cap bot" style={{ transform: `rotateX(-90deg) translateZ(${tz}px)` }} aria-hidden="true" />
            </div>
          </div>
          <span className="cube-shadow" aria-hidden="true" />
        </div>
        <button className="gbtn white round cube-turn" aria-label="Turn right" onClick={() => turn(1)}><I n="next" s={26} /></button>
      </div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Cube wizard!" sub="You spun your way to victory!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; setRotY(0); const nf = shuffle(pool); setFaces(nf); setTarget(nf[0]); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 11. PICTURE PIECES — real interlocking jigsaw (tap-to-place) ============
   Pieces are genuine puzzle shapes (complementary semicircular tab/blank knobs) built
   as CSS clip-path: path() over the full card art, with a white edge stroke for depth.
   True 2D grid + Easy/Medium/Hard piece-count selector, a faint picture guide + Peek,
   a scatter tray, snap-on-correct, and progress. Tap a piece, then tap its spot (the
   app is tap-only for ages 2-6 — no drag). */
const JIG_LEVELS = [
  { key: 'easy', label: 'Easy', n: 2 },
  { key: 'med', label: 'Medium', n: 3 },
  { key: 'hard', label: 'Hard', n: 4 },
];
const JIG_KNOB = 0.2;    // knob radius as a fraction of the cell (board size is responsive)

// one outline edge (clockwise), as a flat side or a semicircular tab(+1)/blank(-1) knob.
function jigEdge(fx, fy, tx, ty, knob, kr, dir) {
  if (!knob) return `L ${tx} ${ty} `;
  const sweep = knob > 0 ? 0 : 1;            // tab curves outward (left of travel), blank inward
  let s, e;
  if (dir === 'h+') { const m = (fx + tx) / 2; s = [m - kr, fy]; e = [m + kr, fy]; }
  else if (dir === 'h-') { const m = (fx + tx) / 2; s = [m + kr, fy]; e = [m - kr, fy]; }
  else if (dir === 'v+') { const m = (fy + ty) / 2; s = [fx, m - kr]; e = [fx, m + kr]; }
  else { const m = (fy + ty) / 2; s = [fx, m + kr]; e = [fx, m - kr]; }
  return `L ${s[0]} ${s[1]} A ${kr} ${kr} 0 0 ${sweep} ${e[0]} ${e[1]} L ${tx} ${ty} `;
}
function jigPath(edges, cell, kr) {
  const a = kr, b = kr + cell;             // piece box has a kr margin so knobs can protrude
  let d = `M ${a} ${a} `;
  d += jigEdge(a, a, b, a, edges.top, kr, 'h+');
  d += jigEdge(b, a, b, b, edges.right, kr, 'v+');
  d += jigEdge(b, b, a, b, edges.bottom, kr, 'h-');
  d += jigEdge(a, b, a, a, edges.left, kr, 'v-');
  return d + 'Z';
}
function buildPuzzle(n) {
  // interior edges get a random tab/blank; neighbours share the complementary side
  const vert = Array.from({ length: n }, () => Array.from({ length: n - 1 }, () => (Math.random() < 0.5 ? 1 : -1)));
  const horiz = Array.from({ length: n - 1 }, () => Array.from({ length: n }, () => (Math.random() < 0.5 ? 1 : -1)));
  const pieces = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) pieces.push({
    idx: r * n + c, r, c,
    edges: {
      top: r === 0 ? 0 : -horiz[r - 1][c],
      right: c === n - 1 ? 0 : vert[r][c],
      bottom: r === n - 1 ? 0 : horiz[r][c],
      left: c === 0 ? 0 : -vert[r][c - 1],
    },
  });
  return pieces;
}

export function JigsawPuzzle({ cat, speak, onDone, I, Star, Burst }) {
  // Picture is shuffled once per game (not on every re-render). Level + picture live
  // here; the board is keyed by `${lvl}-${pic}` so it REMOUNTS with fresh per-puzzle
  // state on any change — placed/tray can never lag the grid (no stale-index crash).
  const pics = useMemo(() => advGamePool(cat.id, 3, true).slice(0, 3), [cat.id]);
  const [lvl, setLvl] = useState(0);
  const [pic, setPic] = useState(0);
  // Wide screens get a "puzzle table" layout: a bigger assembly board on the LEFT,
  // the piece tray on the RIGHT (they stack on phones). Board size follows the screen.
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 760px)').matches);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const m = window.matchMedia('(min-width: 760px)');
    const h = () => setWide(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return (
    <JigBoard key={`${lvl}-${pic}`} boardSize={wide ? 380 : 300} wide={wide} card={pics[pic] || pics[0]} picCount={pics.length} pic={pic} lvl={lvl}
      onLevel={setLvl} onNextPic={() => setPic((p) => p + 1)} onAgain={() => setPic((p) => (p + 1) % pics.length)}
      speak={speak} onDone={onDone} I={I} Star={Star} Burst={Burst} />
  );
}

function JigBoard({ boardSize, wide, card, picCount, pic, lvl, onLevel, onNextPic, onAgain, speak, onDone, I, Star, Burst }) {
  const n = JIG_LEVELS[lvl].n;
  const cell = boardSize / n, kr = Math.round(cell * JIG_KNOB), box = cell + 2 * kr;
  const trayScale = Math.min(1, (wide ? 78 : 88) / box);   // pieces a touch smaller in the side tray
  const pieces = useMemo(() => buildPuzzle(n), [n]);
  const [placed, setPlaced] = useState([]);
  const [tray] = useState(() => shuffle(pieces.map((p) => p.idx)));
  const [sel, setSel] = useState(null);
  const [wrong, setWrong] = useState(null);
  const [peek, setPeek] = useState(false);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  useEffect(() => {                                   // once per mount (key remounts on pic/level change)
    const t = setTimeout(() => speak(`Find the ${card.word}!`), 400);
    return () => clearTimeout(t);
  }, []);

  const art = (p) => (
    <>
      <span className="jig-art" style={{ width: box, height: box, clipPath: `path('${jigPath(p.edges, cell, kr)}')` }}>
        <span className="jig-img" style={{ width: boardSize, height: boardSize, color: 'var(--zc)',
          transform: `translate(${kr - p.c * cell}px, ${kr - p.r * cell}px)` }}>{cardArt(card, boardSize)}</span>
      </span>
      <svg className="jig-edge" width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <path d={jigPath(p.edges, cell, kr)} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </>
  );

  const doPeek = () => { setPeek(true); setTimeout(() => setPeek(false), 1100); };
  const pick = (idx) => { advSfx('tap'); setSel((s) => (s === idx ? null : idx)); };
  const place = (slot) => {
    if (sel === null || placed.includes(slot)) return;
    if (slot === sel) {
      advSfx('yes');
      const np = [...placed, sel]; setPlaced(np); setSel(null); speak('Click! Perfect!');
      if (np.length === pieces.length) {
        if (pic + 1 < picCount) { speak(`It's the ${card.word}!`); setTimeout(onNextPic, 1100); }
        else {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 3 ? 2 : 1;
          setBurst(true); setTimeout(() => { setEnd({ stars }); onDone('jigsaw', stars); }, 800);
        }
      }
    } else { advSfx('no'); wrongs.current += 1; setWrong(slot); setTimeout(() => setWrong(null), 460); speak('Almost! Try another spot!'); }
  };

  return (
    <div className="game-area jig-game" data-screen-label="Picture Pieces">
      <div className="jig-top">
        <button className="qprompt game-ask" onClick={() => speak(`Find the ${card.word}!`)}>
          <I n="sound" s={22} /> Build the <b>{card.word}</b>!
        </button>
        <button className="gbtn white round jig-peek" aria-label="Peek at the picture" onClick={doPeek} style={{ minHeight: 50, width: 50 }}><I n="eye" s={22} /></button>
      </div>
      <div className="jig-levels" role="tablist" aria-label="How many pieces">
        {JIG_LEVELS.map((L, i) => (
          <button key={L.key} className={`jig-lvl ${lvl === i ? 'on' : ''}`} role="tab" aria-selected={lvl === i}
            onClick={() => { if (i !== lvl) { advSfx('tap'); onLevel(i); } }}>
            <b>{L.label}</b><small>{L.n * L.n} pieces</small>
          </button>
        ))}
      </div>
      <div className="jig-stage">
        <div className={`jig-board ${peek ? 'peek' : ''}`} style={{ width: boardSize, height: boardSize, gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          <span className="jig-guide" style={{ color: 'var(--zc)' }} aria-hidden="true">{cardArt(card, boardSize)}</span>
          {pieces.map((p) => {
            const filled = placed.includes(p.idx);
            return (
              <div key={p.idx} className={`jig-slot ${filled ? 'filled' : ''} ${wrong === p.idx ? 'wrong' : ''} ${sel !== null && !filled ? 'targetable' : ''}`}
                style={{ gridColumn: p.c + 1, gridRow: p.r + 1 }} data-jigslot={p.idx}
                role={filled ? undefined : 'button'} tabIndex={filled ? -1 : 0} aria-label={filled ? 'Placed piece' : 'Empty spot — tap to place'}
                onClick={() => place(p.idx)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(p.idx); } }}>
                {filled && <span className="jig-fit" style={{ left: -kr, top: -kr, width: box, height: box }}>{art(p)}</span>}
              </div>
            );
          })}
        </div>
        <div className="jig-tray-panel" style={{ '--tray-h': `${boardSize}px` }}>
          <div className="jig-tray">
            {tray.filter((idx) => !placed.includes(idx) && idx < pieces.length).map((idx) => (
              <button key={idx} className={`jig-piece ${sel === idx ? 'sel' : ''}`} aria-label="Puzzle piece" aria-pressed={sel === idx}
                style={{ width: box * trayScale, height: box * trayScale }} onClick={() => pick(idx)}>
                <span className="jig-pc-in" style={{ width: box, height: box, transform: `scale(${trayScale})` }}>{art(pieces[idx])}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="jig-progress">
        <span className="jig-bar"><i style={{ width: `${(placed.length / pieces.length) * 100}%` }} /></span>
        <b>{placed.length}/{pieces.length}</b>
      </div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Puzzle master!" sub="You built every picture!" I={I} Star={Star}
        onAgain={() => { advSfx('tap'); onAgain(); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 12. EGG SURPRISE (tap to hatch) ============ */
const CRACKS = [
  'M 40 30 l 8 9 l -6 8',
  'M 40 30 l 8 9 l -6 8 M 62 36 l -7 10 l 8 9 M 30 52 l 10 6',
];
export function EggSurprise({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true).slice(0, 4);
  const [taps, setTaps] = useState({});
  const [wob, setWob] = useState(null);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => { const t = setTimeout(() => speak('Tap the eggs to hatch your friends!'), 500); return () => clearTimeout(t); }, []);

  const hatched = (w) => (taps[w] || 0) >= 3;
  const tap = (c) => {
    if (end || hatched(c.word)) return;
    const nt = (taps[c.word] || 0) + 1;
    setTaps((s) => ({ ...s, [c.word]: nt }));
    setWob(c.word); setTimeout(() => setWob(null), 420);
    if (nt === 1) { advSfx('tap'); speak('Tap tap!'); }
    else if (nt === 2) { advSfx('tap'); speak("It's cracking!"); }
    else {
      advSfx('yes');
      speak(`${c.word}! Hello little ${c.word}!`);
      const allDone = pool.every((p) => (p.word === c.word ? 3 : (taps[p.word] || 0)) >= 3);
      if (allDone) { setBurst(true); setTimeout(() => { setEnd({ stars: 3 }); onDone('egg', 3); }, 1000); }
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Egg Surprise">
      <div className="game-ask hud-pill">Tap tap tap… who's inside?</div>
      <div className="egg-row">
        {pool.map((c) => {
          const t = taps[c.word] || 0;
          return (
            <button key={c.word} className={`egg ${wob === c.word ? 'wob' : ''}`}
              aria-label={t >= 3 ? c.word : 'Mystery egg'} onClick={() => tap(c)}>
              {t < 3 ? (
                <>
                  <span className="egg-shell" />
                  {t > 0 && (
                    <svg className="egg-crack" viewBox="0 0 100 134" aria-hidden="true">
                      <path d={CRACKS[Math.min(t, 2) - 1]} fill="none" stroke="#c9b18c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </>
              ) : (
                <>
                  <span className="egg-half l" aria-hidden="true" />
                  <span className="egg-half r" aria-hidden="true" />
                  <span className="egg-friend">
                    <span style={{ color: 'var(--zc)' }}>{cardArt(c, 76)}</span>
                    <b className="egg-word">{c.word}</b>
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className="game-round">{pool.filter((p) => hatched(p.word)).length} / {pool.length}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={3} title="All hatched!" sub="Hello new friends!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setTaps({}); }} onBack={() => onDone('__back')} />}
    </div>
  );
}
