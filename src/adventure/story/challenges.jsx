// challenges.jsx — interactive challenge widgets rendered inside the comic
// engine (Rainbow Mountain). Ported from adventure-story2.jsx. Exports the
// COMIC_CHALLENGES map (keyed by the page's `challenge` id).
import { useState } from 'react';

const NUMS = ['', 'one', 'two', 'three', 'four', 'five'];

export function StonesChallenge({ speak, onWin }) {
  const [next, setNext] = useState(1);
  const [order] = useState([3, 1, 5, 2, 4]);
  const [wig, setWig] = useState(null);
  const tap = (n) => {
    if (n === next) {
      speak(NUMS[n].charAt(0).toUpperCase() + NUMS[n].slice(1) + '!');
      if (n === 5) setTimeout(onWin, 800);
      setNext(n + 1);
    } else { setWig(n); speak(`Find number ${NUMS[next]}!`); setTimeout(() => setWig(null), 500); }
  };
  return (
    <>
      <div className="comic-task">Tap the stones: 1, 2, 3, 4, 5!</div>
      <div className="stones-row">
        {order.map((n) => (
          <button key={n} className={`stone ${n < next ? 'stepped' : ''} ${wig === n ? 'wig' : ''}`}
            aria-label={`Stone ${n}`} disabled={n < next} onClick={() => tap(n)}><b>{n}</b></button>
        ))}
      </div>
    </>
  );
}

export function ColorBridgeChallenge({ speak, onWin }) {
  const ORDER = ['Red', 'Yellow', 'Green', 'Blue'];
  const HEX = { Red: '#ef4444', Yellow: '#fbbf24', Green: '#22c55e', Blue: '#3b82f6' };
  const [next, setNext] = useState(0);
  const [planks] = useState(['Yellow', 'Blue', 'Red', 'Green']);
  const [wig, setWig] = useState(null);
  const tap = (c) => {
    if (c === ORDER[next]) {
      speak(c + '!');
      if (next + 1 >= ORDER.length) setTimeout(onWin, 800);
      setNext(next + 1);
    } else { setWig(c); speak(`Find ${ORDER[next].toLowerCase()} first!`); setTimeout(() => setWig(null), 500); }
  };
  return (
    <>
      <div className="comic-task">Fix the bridge: red, yellow, green, blue!</div>
      <div className="stones-row">
        {planks.map((c) => (
          <button key={c} className={`plank ${ORDER.indexOf(c) < next ? 'stepped' : ''} ${wig === c ? 'wig' : ''}`}
            style={{ '--pc': HEX[c] }} aria-label={c + ' plank'} disabled={ORDER.indexOf(c) < next} onClick={() => tap(c)} />
        ))}
      </div>
    </>
  );
}

export function ChestChallenge({ speak, onWin, I }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="comic-task">Tap the treasure box!</div>
      <button className={`quest-chest static ${open ? 'open' : ''}`} data-testid="quest-chest" aria-label="Treasure chest"
        onClick={() => { if (!open) { setOpen(true); speak('Treasure! Wow!'); setTimeout(onWin, 700); } }}>
        <span className="qc-lid" />
        <span className="qc-body"><I n="gift" s={40} /></span>
        {open && <span className="qc-glow" aria-hidden="true" />}
      </button>
    </>
  );
}

export const COMIC_CHALLENGES = { stones: StonesChallenge, bridge: ColorBridgeChallenge, chest: ChestChallenge };
