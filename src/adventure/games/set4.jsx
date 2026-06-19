// set4.jsx — 3D games: Mystery Boxes, Prize Wheel, Magic Doors, Unfold the Cube.
// Ported verbatim from adventure-activities4.jsx (window globals -> imports).
import { useState, useEffect, useRef } from 'react';
import { advGamePool, cardArt, shuffle } from './util.jsx';
import { StarsModal as AdvStarsModal } from './StarsModal.jsx';

/* ============ 13. MYSTERY BOXES (3D shell game) ============ */
export function MysteryBoxes({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const ROUNDS = 4;
  const [round, setRound] = useState(0);
  const [friend, setFriend] = useState(pool[0]);
  const [hider, setHider] = useState(1);           // which box hides it
  const [slots, setSlots] = useState([0, 1, 2]);   // box i renders at slot[i]
  const [phase, setPhase] = useState('show');      // show|shuffle|guess|reveal
  const [open, setOpen] = useState([true, true, true]);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);
  const timers = useRef([]);

  const startRound = (r) => {
    const f = pool[r % pool.length]; const h = Math.floor(Math.random() * 3);
    setFriend(f); setHider(h); setSlots([0, 1, 2]); setPhase('show');
    setOpen([true, true, true]);
    timers.current.push(setTimeout(() => speak(`Watch! The ${f.word} hides in a box!`), 400));
    timers.current.push(setTimeout(() => { setOpen([false, false, false]); setPhase('shuffle'); }, 1900));
    // 3 swaps
    [0, 1, 2].forEach((i) => timers.current.push(setTimeout(() => {
      setSlots((s) => {
        const ns = [...s];
        const a = Math.floor(Math.random() * 3); let b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
        [ns[a], ns[b]] = [ns[b], ns[a]];
        return ns;
      });
    }, 2400 + i * 650)));
    timers.current.push(setTimeout(() => { setPhase('guess'); speak(`Where is the ${f.word}?`); }, 4500));
  };
  useEffect(() => { startRound(0); return () => timers.current.forEach(clearTimeout); }, []);

  const pick = (i) => {
    if (phase !== 'guess' || end) return;
    setOpen((o) => o.map((x, j) => j === i ? true : x));
    if (i === hider) {
      setPhase('reveal'); speak(`There you are, ${friend.word}!`);
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('boxes', stars);
        } else { setRound(round + 1); startRound(round + 1); }
      }, 1300);
    } else {
      wrongs.current += 1; speak('Empty! Try another box!');
      setTimeout(() => setOpen((o) => o.map((x, j) => j === i ? false : x)), 900);
    }
  };

  return (
    <div className="game-area gctr" data-screen-label="Mystery Boxes">
      <div className="game-ask hud-pill">{phase === 'guess' ? `Where is the ${friend.word}?` : phase === 'shuffle' ? 'Watch them dance!' : 'Watch closely…'}</div>
      <div className="boxes-stage">
        {[0, 1, 2].map((i) => (
          <button key={i} className={`mbox ${open[i] ? 'open' : ''}`}
            style={{ transform: `translateX(${(slots[i] - 1) * 130}px)` }}
            aria-label={`Box ${i + 1}`} disabled={phase !== 'guess'} onClick={() => pick(i)}>
            <span className="mbox-lid" />
            <span className="mbox-body" />
            {open[i] && i === hider && (
              <span className="mbox-friend" style={{ color: 'var(--zc)' }}>{cardArt(friend, 56)}</span>
            )}
          </button>
        ))}
      </div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Found every time!" sub="Sharp eyes!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; startRound(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 14. PRIZE WHEEL (3D carousel with swipe) ============ */
export function PrizeWheel({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 6, true);
  const ROUNDS = 4;
  const STEP = 60;
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => pool[Math.floor(Math.random() * 6)]);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);
  const drag = useRef(null);

  useEffect(() => { const t = setTimeout(() => speak(`Spin the wheel! Stop on the ${target.word}!`), 500); return () => clearTimeout(t); }, [round]);

  const frontIdx = ((Math.round(-rot / STEP) % 6) + 6) % 6;
  const down = (e) => { if (end) return; e.preventDefault(); drag.current = { x: e.clientX, r: rot, t: performance.now(), v: 0 }; setSpinning(false); };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const nr = d.r + (e.clientX - d.x) * 0.45;
    d.v = (e.clientX - d.x) / Math.max(1, performance.now() - d.t);
    setRot(nr);
  };
  const up = () => {
    const d = drag.current; if (!d) return; drag.current = null;
    const fling = Math.max(-3, Math.min(3, d.v)) * 360;
    const landed = Math.round((rot + fling) / STEP) * STEP;
    setSpinning(true); setRot(landed);
    setTimeout(() => {
      setSpinning(false);
      const fi = ((Math.round(-landed / STEP) % 6) + 6) % 6;
      const f = pool[fi];
      if (f.word === target.word) {
        speak(`Yes! You landed on the ${f.word}!`);
        setTimeout(() => {
          if (round + 1 >= ROUNDS) {
            const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
            setBurst(true); setEnd({ stars }); onDone('wheel', stars);
          } else { setRound(round + 1); setTarget(pool[Math.floor(Math.random() * 6)]); }
        }, 900);
      } else { wrongs.current += 1; speak(`That's the ${f.word}. Spin again! Find the ${target.word}!`); }
    }, 1300);
  };

  return (
    <div className="game-area gctr" data-screen-label="Prize Wheel" onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      <button className="qprompt game-ask" onClick={() => speak(`Stop on the ${target.word}!`)}>
        <I n="sound" s={22} /> Spin to the <b>{target.word}</b>!
      </button>
      <div className="wheel-scene" onPointerDown={down} style={{ touchAction: 'none' }}>
        <span className="wheel-pin" aria-hidden="true" />
        <div className={`wheel-ring ${spinning ? 'easing' : ''}`} style={{ transform: `rotateY(${rot}deg)` }}
          role="img" aria-label={`Wheel showing ${pool[frontIdx].word} in front`}>
          {pool.map((c, i) => (
            <span key={c.word} className="wheel-card" style={{ transform: `rotateY(${i * STEP}deg) translateZ(190px)` }}>
              <span style={{ color: 'var(--zc)' }}>{cardArt(c, 64)}</span>
              <b>{c.word}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="hud-pill" style={{ fontSize: 15 }}>Swipe the wheel to spin!</div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Wheel champion!" sub="What a spin!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; setRot(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 15. MAGIC DOORS (3D hide & seek) ============ */
export function MagicDoors({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 4, true);
  const ROUNDS = 4;
  const [round, setRound] = useState(0);
  const [friend, setFriend] = useState(pool[0]);
  const [hider, setHider] = useState(0);
  const [opened, setOpened] = useState([]);
  const [solved, setSolved] = useState(false);
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  const startRound = (r) => {
    const f = pool[r % pool.length];
    setFriend(f); setHider(Math.floor(Math.random() * 3)); setOpened([]); setSolved(false);
    setTimeout(() => speak(`Knock knock! The ${f.word} is hiding behind a door. Which one?`), 400);
  };
  useEffect(() => { startRound(0); }, []);

  const pick = (i) => {
    if (end || solved || opened.includes(i)) return;
    setOpened((o) => [...o, i]);
    if (i === hider) {
      setSolved(true); speak(`Surprise! The ${friend.word}!`);
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('doors', stars);
        } else { setRound(round + 1); startRound(round + 1); }
      }, 1400);
    } else { wrongs.current += 1; speak('Nobody here! Try another door!'); }
  };

  return (
    <div className="game-area gctr" data-screen-label="Magic Doors">
      <button className="qprompt game-ask" onClick={() => speak(`Where is the ${friend.word}?`)}>
        <I n="sound" s={22} /> Find the <b>{friend.word}</b>!
      </button>
      <div className="hall">
        {[0, 1, 2].map((i) => (
          <button key={i} className={`doorway ${opened.includes(i) ? 'open' : ''}`}
            aria-label={opened.includes(i) ? (i === hider ? friend.word : 'Empty room') : `Door ${i + 1}`}
            onClick={() => pick(i)}>
            <span className="door-room">
              {opened.includes(i) && (i === hider
                ? <span className="door-friend" style={{ color: 'var(--zc)' }}>{cardArt(friend, 58)}</span>
                : <span className="door-empty">?</span>)}
            </span>
            <span className="door-panel"><span className="door-knob" /></span>
          </button>
        ))}
      </div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Door detective!" sub="Knock knock — found them all!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; startRound(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}

/* ============ 16. UNFOLD THE CUBE (origami reveal) ============ */
export function UnfoldCube({ cat, speak, onDone, I, Star, Burst }) {
  const pool = advGamePool(cat.id, 6, true);
  const ROUNDS = 2;
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState(pool[0]);
  const [choices, setChoices] = useState(pool.slice(0, 3));
  const [unfolded, setUnfolded] = useState(0);   // 0..4 panels open
  const [end, setEnd] = useState(null);
  const [burst, setBurst] = useState(false);
  const wrongs = useRef(0);

  const startRound = (r) => {
    const a = pool[r === 0 ? 0 : 3];
    setAnswer(a);
    setChoices(shuffle([a, ...shuffle(pool.filter((c) => c.word !== a.word)).slice(0, 2)]));
    setUnfolded(0);
    setTimeout(() => speak('Unfold the magic paper! What is hiding inside?'), 400);
  };
  useEffect(() => { startRound(0); }, []);

  const unfold = () => {
    if (end || unfolded >= 4) return;
    setUnfolded((u) => u + 1);
    speak(unfolded + 1 >= 4 ? 'All open! What is it?' : 'Oooh! Peek!');
  };
  const guess = (c) => {
    if (end) return;
    if (c.word === answer.word) {
      speak(`Yes! It's a ${answer.word}!`);
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          const stars = wrongs.current === 0 ? 3 : wrongs.current <= 2 ? 2 : 1;
          setBurst(true); setEnd({ stars }); onDone('unfold', stars);
        } else { setRound(round + 1); startRound(round + 1); }
      }, 900);
    } else { wrongs.current += 1; speak('Keep peeking! Unfold more!'); }
  };

  return (
    <div className="game-area gctr" data-screen-label="Unfold the Cube">
      <div className="game-ask hud-pill">Tap the paper to unfold it!</div>
      <button className="fold-scene" onClick={unfold} aria-label={`Folded picture, ${unfolded} of 4 panels open. Tap to unfold.`}>
        <span className="fold-pic" style={{ color: 'var(--zc)' }}>{cardArt(answer, 150)}</span>
        <span className={`fold-flap top ${unfolded >= 1 ? 'open' : ''}`} />
        <span className={`fold-flap right ${unfolded >= 2 ? 'open' : ''}`} />
        <span className={`fold-flap bottom ${unfolded >= 3 ? 'open' : ''}`} />
        <span className={`fold-flap left ${unfolded >= 4 ? 'open' : ''}`} />
      </button>
      <div className="says-row" style={{ paddingTop: 0 }}>
        {choices.map((c) => (
          <button key={c.word} className="says-card" style={{ width: 110, padding: '12px 8px 10px' }}
            aria-label={c.word} onClick={() => guess(c)}><b>{c.word}</b></button>
        ))}
      </div>
      <div className="game-round">{round + 1} / {ROUNDS}</div>
      {burst && <Burst onDone={() => setBurst(false)} />}
      {end && <AdvStarsModal stars={end.stars} title="Magic eyes!" sub="You guessed the hidden pictures!" I={I} Star={Star}
        onAgain={() => { setEnd(null); setRound(0); wrongs.current = 0; startRound(0); }} onBack={() => onDone('__back')} />}
    </div>
  );
}
