// ActivityHub.jsx — "Pip's Playground": the top-level Play room (a sibling of
// Story Land, reached from the World HUD), an ungated library of every game
// curated into kid-readable shelves. Also the target of Settings → quick-play
// (autoGame). Resolves game components from the registry.
import { useState, useRef } from 'react';
import { advSfx } from '../audio.js';
import { Mascot } from '../art/Mascot.jsx';
import { ADV_GAMES, HUB_META, HUB_COLORS, PLAY_SECTIONS } from '../games/registry.jsx';
import { GameCover } from '../games/GameCover.jsx';
import { useInitialFocus } from '../hooks/useSpatialNav.js';
import { useBackHandler } from '../hooks/useBackButton.js';

export function ActivityHub({ cat, speak, onExit, onPaint, onRecord, I, Star, Burst, autoGame, disabledGames = [], dpad = false }) {
  // autoGame is a mount-time route param (quickPlay/autoGame only fires from the
  // World, so the hub mounts fresh) — derive the initial game without an effect.
  const [game, setGame] = useState(() => (autoGame && autoGame !== 'paint' && (ADV_GAMES[autoGame] || {}).C) ? autoGame : null);
  const rootRef = useRef(null);
  useInitialFocus(rootRef, [game]); // shelf: first tile; in-game: the back button (until the game cursor takes over)
  // BACK: out of a game returns to the shelf; from the shelf returns to the map.
  useBackHandler(() => { if (game) setGame(null); else onExit(); });

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

  // Running index across every shelf so the entrance stagger flows top-to-bottom.
  let gi = 0;

  return (
    <div className="level playground" data-screen-label="Playground" ref={rootRef}>
      <div className="level-hud">
        <button className="gbtn white round" data-nav aria-label={game ? 'Back to the playground' : 'Back to map'} data-testid="level-exit"
          onClick={() => game ? setGame(null) : onExit()} style={{ minHeight: 50, width: 50 }}><I n="back" s={22} /></button>
        <span className="hud-brand" style={{ fontSize: 22 }}>{game ? (ADV_GAMES[game].label || HUB_META[game]?.label) : 'Pip’s Playground'}</span>
        <span style={{ flex: 1 }} />
      </div>

      {!game && (
        <div className="hub-scroll" data-testid="activity-hub">
          {/* Carnival banner — the signature that makes Play a real destination */}
          <div className="pg-banner" aria-hidden="true">
            <div className="pg-bunting">{Array.from({ length: 11 }).map((_, i) => <i key={i} />)}</div>
            <span className="pg-mascot"><Mascot concept="pip" state="cheer" size={64} /></span>
            <span className="pg-tagline">Pick a game — every one is open!</span>
          </div>

          {PLAY_SECTIONS.map((sec) => {
            const ids = sec.ids.filter((id) => !disabledGames.includes(id));
            if (!ids.length) return null;
            return (
              <section className="pg-shelf" key={sec.title}>
                <div className="pg-shelf-label"><span className="pg-shelf-emoji" aria-hidden="true">{sec.emoji}</span>{sec.title}</div>
                <div className="hub-grid">
                  {ids.map((id) => {
                    const meta = { ...(ADV_GAMES[id] || {}), ...(HUB_META[id] || {}) };
                    const delay = (gi++) * 55;
                    return (
                      <button key={id} className="hub-tile" style={{ '--hc': HUB_COLORS[id], animationDelay: `${delay}ms` }}
                        data-nav data-nav-default={delay === 0 ? '' : undefined}
                        data-testid={`activity-${id}`} onClick={() => open(id)}>
                        <span className="hub-art"><GameCover id={id} /></span>
                        <span className="hub-label"><b>{meta.label}</b><small>{meta.desc}</small></span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {G && <G cat={cat} speak={speak} onDone={gameDone} I={I} Star={Star} Burst={Burst} dpad={dpad} />}
    </div>
  );
}
