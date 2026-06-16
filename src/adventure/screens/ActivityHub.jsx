// ActivityHub.jsx — the per-zone "Playground": a featured grid of the land's
// signature games + an Anytime grid (Paint, Calm). Resolves game components
// from the registry. Ported from adventure-activities2.jsx `ActivityHub`.
import { useState } from 'react';
import { advSfx } from '../audio.js';
import { ADV_GAMES, HUB_META, HUB_COLORS, ZONE_GAMES, ANYTIME } from '../games/registry.jsx';
import { GameCover } from '../games/GameCover.jsx';

export function ActivityHub({ cat, theme, speak, onExit, onPaint, onRecord, I, Star, Burst, autoGame, disabledGames = [] }) {
  // autoGame is a mount-time route param (quickPlay/autoGame only fires from the
  // World, so the hub mounts fresh) — derive the initial game without an effect.
  const [game, setGame] = useState(() => (autoGame && autoGame !== 'paint' && (ADV_GAMES[autoGame] || {}).C) ? autoGame : null);

  const open = (id) => {
    if (id === 'paint') { onPaint(); return; }
    advSfx('tap');
    setGame(id);
    const meta = ADV_GAMES[id] || {};
    speak(`${(meta.label || HUB_META[id]?.label || id)}!`);
  };
  const gameDone = (id, stars) => {
    if (id === '__back') { setGame(null); return; }
    if (stars) { onRecord(id, stars); advSfx('win'); }
  };

  const G = game && (ADV_GAMES[game] || {}).C;
  return (
    <div className="level" data-screen-label={`Activities: ${cat.name}`}
      style={{ background: `linear-gradient(180deg, ${theme.sky[0]}, ${theme.sky[1]} 75%, ${theme.ground})`, '--zc': `var(--cat-${cat.color}-1)` }}>
      <div className="level-hud">
        <button className="gbtn white round" aria-label={game ? 'Back to activities' : 'Back to map'} data-testid="level-exit"
          onClick={() => game ? setGame(null) : onExit()} style={{ minHeight: 50, width: 50 }}><I n="back" s={22} /></button>
        <span className="hud-brand" style={{ fontSize: 22 }}>{game ? (ADV_GAMES[game].label || HUB_META[game]?.label) : `${cat.name} Playground`}</span>
        <span style={{ flex: 1 }} />
      </div>

      {!game && (
        <div className="hub-scroll" data-testid="activity-hub">
          <div className="hub-sect">{cat.name} games</div>
          <div className="hub-grid featured">
            {(ZONE_GAMES[cat.id] || ['bubble', 'memory']).filter((id) => !disabledGames.includes(id)).map((id, i) => {
              const meta = { ...(ADV_GAMES[id] || {}), ...(HUB_META[id] || {}) };
              return (
                <button key={id} className="hub-tile big" style={{ '--hc': HUB_COLORS[id], animationDelay: `${i * 70}ms` }}
                  data-testid={`activity-${id}`} onClick={() => open(id)}>
                  <span className="hub-art"><GameCover id={id} /></span>
                  <span className="hub-label"><b>{meta.label}</b><small>{meta.desc}</small></span>
                </button>
              );
            })}
          </div>
          <div className="hub-sect">Anytime favorites</div>
          <div className="hub-grid">
            {ANYTIME.filter((id) => !disabledGames.includes(id)).map((id, i) => {
              const meta = { ...(ADV_GAMES[id] || {}), ...(HUB_META[id] || {}) };
              return (
                <button key={id} className="hub-tile" style={{ '--hc': HUB_COLORS[id], animationDelay: `${200 + i * 70}ms` }}
                  data-testid={`activity-${id}`} onClick={() => open(id)}>
                  <span className="hub-art"><GameCover id={id} /></span>
                  <span className="hub-label"><b>{meta.label}</b><small>{meta.desc}</small></span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {G && <G cat={cat} speak={speak} onDone={gameDone} I={I} Star={Star} Burst={Burst} />}
    </div>
  );
}
