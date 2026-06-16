// set3.jsx — Peek-a-Boo, Magic Cube (3D), Picture Pieces (jigsaw), Egg Surprise.
// Ported verbatim from adventure-activities3.jsx (window globals -> imports).
import { useState, useEffect, useRef } from 'react';
import { advGamePool, cardArt, shuffle } from './util.jsx';
import { StarsModal as AdvStarsModal } from './StarsModal.jsx';

/* ============ 9. PEEK-A-BOO (whack-a-mole pops) ============ */
export function PeekABoo({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const GOAL = 6;
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(pool[0]);
  const [up, setUp] = useState({});       // hole -> {card, k, leaving, caught}
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);
  const stateRef = useRef({});
  stateRef.current = { up, target, end };

  useEffect(() => { const t = setTimeout(() => speak(`Peek-a-boo! Tap the ${pool[0].word} when you see it!`), 500); return () => clearTimeout(t); }, []);

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
      setTimeout(() => setUp((u) => (u[hole] && u[hole].k === k && !u[hole].caught ? { ...u, [hole]: { ...u[hole], leaving: true } } : u)), 1500);
      setTimeout(() => setUp((u) => (u[hole] && u[hole].k === k && !u[hole].caught ? { ...u, [hole]: null } : u)), 1800);
    }, 850);
    return () => clearInterval(iv);
  }, [end]);

  const tap = (h) => {
    const o = up[h];
    if (!o || o.leaving || o.caught || end) return;
    if (o.card.word === target.word) {
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
        speak(`Got you! Now find the ${nt.word}!`);
      }
    } else {
      wrongs.current += 1;
      speak(`Hee hee! I'm the ${o.card.word}!`);
      setUp((u) => ({ ...u, [h]: { ...o, leaving: true } }));
      setTimeout(() => setUp((u) => ({ ...u, [h]: null })), 300);
    }
  };

  return (
    <div className="game-area" data-screen-label="Peek-a-Boo">
      <button className="qprompt game-ask" onClick={() => speak(`Tap the ${target.word}!`)}>
        <I n="sound" s={22} /> Tap the <b>{target.word}</b>!
      </button>
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
  const wrongs = useRef(0);

  useEffect(() => { const t = setTimeout(() => speak(`Turn the cube! Find the ${target.word}!`), 500); return () => clearTimeout(t); }, [round]);

  const frontIdx = ((Math.round(-rotY / 90) % 4) + 4) % 4;
  const turn = (d) => { if (end || winFx) return; setRotY((r) => r + d * 90); };
  const tapCube = () => {
    if (end || winFx) return;
    const f = faces[frontIdx];
    if (f.word === target.word) {
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
      wrongs.current += 1;
      speak(`That's the ${f.word}. Keep turning! Find the ${target.word}!`);
    }
  };

  return (
    <div className="game-area" data-screen-label="Magic Cube">
      <button className="qprompt game-ask" onClick={() => speak(`Find the ${target.word}!`)}>
        <I n="sound" s={22} /> Spin to the <b>{target.word}</b>, then tap it!
      </button>
      <div className="cube-stage">
        <button className="gbtn white round cube-turn" aria-label="Turn left" onClick={() => turn(-1)}><I n="back" s={26} /></button>
        <div className={`cube-scene ${winFx ? 'win' : ''}`}>
          <div className="cube" style={{ transform: `rotateX(-12deg) rotateY(${rotY}deg)` }}
            role="button" tabIndex={0} aria-label={`Cube showing ${faces[frontIdx].word}. Tap if it is the ${target.word}.`}
            onClick={tapCube} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapCube(); } }}>
            {faces.map((c, i) => (
              <span key={c.word} className="cube-face" style={{ transform: `rotateY(${i * 90}deg) translateZ(112px)` }}>
                <span style={{ color: 'var(--zc)' }}>{cardArt(c, 88)}</span>
                <b>{c.word}</b>
              </span>
            ))}
            <span className="cube-face cap" style={{ transform: 'rotateX(90deg) translateZ(112px)' }} />
            <span className="cube-face cap" style={{ transform: 'rotateX(-90deg) translateZ(112px)' }} />
          </div>
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

/* ============ 11. PICTURE PIECES (jigsaw, 3D snap) ============ */
const JIG_W = 240, JIG_SLICE = 80;
export function JigsawPuzzle({ cat, speak, onDone, I, Star, Burst }) {
  const pics = advGamePool(cat.id, 2, true).slice(0, 2);
  const [pic, setPic] = useState(0);
  const card = pics[pic] || pics[0];
  const [placed, setPlaced] = useState([]);
  const [tray, setTray] = useState(() => shuffle([0, 1, 2]));
  const [drag, setDrag] = useState(null);   // {i, x, y}
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  useEffect(() => {
    setTray(shuffle([0, 1, 2])); setPlaced([]);
    const t = setTimeout(() => speak(pic === 0 ? `Put the ${card.word} back together!` : `Next picture! Build the ${card.word}!`), 400);
    return () => clearTimeout(t);
  }, [pic]);

  const slice = (i, ghost) => (
    <span className="jig-clip" style={ghost ? { boxShadow: '0 14px 22px rgba(0,0,0,.3)' } : null}>
      <span style={{ position: 'absolute', left: 0, top: -i * JIG_SLICE, color: 'var(--zc)' }}>
        {cardArt(card, JIG_W)}
      </span>
    </span>
  );

  const down = (e, i) => { e.preventDefault(); setDrag({ i, x: e.clientX, y: e.clientY }); };
  const move = (e) => { if (drag) setDrag((d) => ({ ...d, x: e.clientX, y: e.clientY })); };
  const up = (e) => {
    if (!drag) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el && el.closest('[data-jigslot]');
    const i = drag.i; setDrag(null);
    if (slot) {
      if (parseInt(slot.getAttribute('data-jigslot'), 10) === i) {
        const np = [...placed, i];
        setPlaced(np); speak('Click! Perfect!');
        if (np.length === 3) {
          if (pic + 1 < pics.length) { speak(`It's the ${card.word}! One more!`); setTimeout(() => setPic(pic + 1), 1100); }
          else {
            const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
            setBurst(true); setTimeout(() => { setEnd({ stars }); onDone('jigsaw', stars); }, 800);
          }
        }
      } else { wrongs.current += 1; speak('Almost! Try another spot!'); }
    }
  };

  return (
    <div className="game-area" data-screen-label="Picture Pieces" onPointerMove={move} onPointerUp={up}>
      <div className="game-ask hud-pill">Build the picture!</div>
      <div className="jig-wrap">
        <div className="jig-board">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`jig-slot ${placed.includes(i) ? 'filled' : ''}`} data-jigslot={i}
              aria-label={placed.includes(i) ? 'Placed piece' : `Empty slot ${i + 1}`}>
              {placed.includes(i) && slice(i)}
            </div>
          ))}
        </div>
        <div className="jig-tray">
          {tray.map((i) => placed.includes(i) ? null : (
            <button key={i} className="jig-piece" aria-label={`Puzzle piece ${i + 1}`}
              style={{ visibility: drag && drag.i === i ? 'hidden' : 'visible' }}
              onPointerDown={(e) => down(e, i)}>{slice(i)}</button>
          ))}
        </div>
      </div>
      {drag && <span className="drag-ghost" style={{ left: drag.x, top: drag.y }}>{slice(drag.i, true)}</span>}
      <div className="game-round">{pic + 1} / {pics.length}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Puzzle master!" sub="You built every picture!" I={I} Star={Star}
        onAgain={() => { setEnd(null); wrongs.current = 0; setPlaced([]); setTray(shuffle([0, 1, 2])); setPic(0); }} onBack={() => onDone('__back')} />}
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
    if (nt === 1) speak('Tap tap!');
    else if (nt === 2) speak("It's cracking!");
    else {
      speak(`${c.word}! Hello little ${c.word}!`);
      const allDone = pool.every((p) => (p.word === c.word ? 3 : (taps[p.word] || 0)) >= 3);
      if (allDone) { setBurst(true); setTimeout(() => { setEnd({ stars: 3 }); onDone('egg', 3); }, 1000); }
    }
  };

  return (
    <div className="game-area" data-screen-label="Egg Surprise">
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
