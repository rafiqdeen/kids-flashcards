// ChestLevel.jsx — the reward moment that completes a zone. Tap the chest ->
// a sticker pops with confetti, gets recorded, the next zone unlocks. Reward
// rotates by zone index. Ported from adventure-app.jsx.
import { useState, useRef } from 'react';
import { HeroMascot } from '../art/Mascot.jsx';
import { Illu } from '../art/Illu.jsx';
import { I } from '../art/icons.jsx';
import { Burst } from '../components/Burst.jsx';
import { ZONE_THEMES } from '../data/categories.js';
import { advSfx } from '../audio.js';
import { useInitialFocus } from '../hooks/useSpatialNav.js';
import { useBackHandler } from '../hooks/useBackButton.js';

export function ChestLevel({ cat, zone, onExit, onComplete, speak }) {
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const rootRef = useRef(null);
  useInitialFocus(rootRef); // land on the chest
  useBackHandler(onExit);
  const th = ZONE_THEMES[zone];
  const reward = ['star', 'apple', 'sun', 'rainbow', 'bee', 'fish'][zone % 6];
  const doOpen = () => {
    if (open) return;
    setOpen(true); setBurst(true); speak('Treasure! You found a sticker!');
    advSfx('chest');
    setTimeout(() => onComplete(reward), 1700);
  };
  return (
    <div className="level" data-screen-label={`Treasure: ${cat.name}`} ref={rootRef}
      style={{ background: `linear-gradient(180deg, ${th.sky[0]}, ${th.sky[1]} 75%, ${th.ground})` }}>
      <div className="level-hud">
        <button className="gbtn white round" data-nav aria-label="Back to map" data-testid="level-exit" onClick={onExit} style={{ minHeight: 50, width: 50 }}><I n="close" s={22} /></button>
      </div>
      <div className="level-stage" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <HeroMascot state={open ? 'cheer' : 'encourage'} size={110} />
        <button className={`chestg ${open ? 'open' : ''}`} data-nav data-nav-default="" data-testid="reward-chest" aria-label="Open the treasure chest" onClick={doOpen}>
          {open && <span className="chest-reward-pop" style={{ color: '#fff' }}><Illu name={reward} size={76} /></span>}
          <span className="glow" />
          <span className="lid" /><span className="latch" /><span className="box" />
        </button>
        {!open && <span className="hud-pill">Tap to open!</span>}
      </div>
      {burst && <Burst onDone={() => setBurst(false)} />}
    </div>
  );
}
