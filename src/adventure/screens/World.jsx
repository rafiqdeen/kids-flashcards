// World.jsx — the journey-map hub. Fixed HUD (brand, profile card, Stories +
// Play FABs, star count, mute, settings) + a vertical stack of 20 themed zones,
// each a winding path of 3 nodes (learn -> quiz -> chest). Free play lives in its
// own top-level room (Pip's Playground, the Play FAB), a sibling of Story Land —
// it used to be a 4th per-zone node. Unlock rule: zone N opens once the previous
// zone's quiz is cleared (adv[prevCat].quizStars > 0); zone 0 always.
import { useRef } from 'react';
import { Mascot, HeroMascot } from '../art/Mascot.jsx';
import { Illu } from '../art/Illu.jsx';
import { I, Star } from '../art/icons.jsx';
import { CATEGORIES, ZONE_THEMES, ZONE_CATS } from '../data/categories.js';
import { useInitialFocus } from '../hooks/useSpatialNav.js';

const TRAIL_H = 380;
const NODE_POS = [{ x: 26, y: 18 }, { x: 72, y: 50 }, { x: 30, y: 84 }];
const NODE_IDS = ['learn', 'quiz', 'chest'];

export function World({ adv, onPlay, muted, setMuted, onSettings, profile, buddy, onProfiles, focusZone }) {
  const totalStars = Object.values(adv).reduce((s, z) => s + (z.learnStars || 0) + (z.quizStars || 0), 0);
  const rootRef = useRef(null);
  useInitialFocus(rootRef); // land on the data-nav-default node (the zone we left / first playable)
  // Which node should the D-pad land on: the playable node of the zone we last left, else
  // zone 0's playable node. (Mirrors the per-zone state logic below.)
  const zoneCurrentIdx = (zi) => {
    const catId = ZONE_CATS[zi]; const z = adv[catId] || {};
    const prevDone = zi === 0 || ((adv[ZONE_CATS[zi - 1]] || {}).quizStars > 0);
    if (!prevDone) return -1;
    if (!((z.learnStars || 0) > 0)) return 0;
    if (!((z.quizStars || 0) > 0)) return 1;
    return z.chest ? 0 : 2;
  };
  const fZi = focusZone ? ZONE_CATS.indexOf(focusZone) : -1;
  const defZi = (fZi >= 0 && zoneCurrentIdx(fZi) >= 0) ? fZi : 0;
  const defKey = `${ZONE_CATS[defZi]}-${NODE_IDS[Math.max(0, zoneCurrentIdx(defZi))]}`;
  return (
    <div className="world" data-screen-label="World map" ref={rootRef}>
      <div className="world-hud">
        <div className="hud-left">
          <span className="hud-brand">Pip<em>!</em><span className="hb-x"> Adventure</span></span>
          <button className="hud-profile" data-nav data-testid="open-profiles" aria-label={`${profile ? profile.name : 'Player'} — switch profile`} onClick={onProfiles}>
            <span className="hud-profile-av"><Mascot concept={buddy || (profile && profile.buddy) || 'pip'} state="idle" size={40} /></span>
            <span className="hud-profile-name">{profile && profile.name ? profile.name : 'Player'}</span>
          </button>
        </div>
        <div className="hud-right">
          <div className="hud-utils">
            <span className="hud-pill" data-testid="star-count"><span className="ico"><Star s={22} /></span>{totalStars}</span>
            <button className="gbtn white round" data-nav aria-label={muted ? 'Turn voice on' : 'Turn voice off'} aria-pressed={muted}
              data-testid="mute-toggle" onClick={() => setMuted((m) => !m)} style={{ minHeight: 48, width: 48 }}>
              <I n={muted ? 'mute' : 'sound'} s={22} />
            </button>
            <button className="gbtn white round" data-nav aria-label="Settings for grown-ups"
              data-testid="open-settings" onClick={onSettings} style={{ minHeight: 48, width: 48 }}>
              <I n="gear" s={22} />
            </button>
          </div>
        </div>
      </div>

      {ZONE_CATS.map((catId, zi) => {
        const cat = CATEGORIES.find((c) => c.id === catId);
        const th = ZONE_THEMES[zi];
        const z = adv[catId] || {};
        const prevDone = zi === 0 || ((adv[ZONE_CATS[zi - 1]] || {}).quizStars > 0);
        const learnDone = (z.learnStars || 0) > 0;
        const quizDone = (z.quizStars || 0) > 0;
        // node states
        const learnState = !prevDone ? 'locked' : learnDone ? 'done' : 'current';
        const quizState = !learnDone ? 'locked' : quizDone ? 'done' : 'current';
        const chestState = !quizDone ? 'locked' : z.chest ? 'done' : 'current';
        const states = [learnState, quizState, chestState];
        const currentIdx = states.indexOf('current');
        return (
          <section key={catId} className="zone" data-screen-label={`Zone: ${cat.name}`}
            style={{ background: `linear-gradient(180deg, ${th.sky[0]}, ${th.sky[1]} 70%, ${th.ground})` }}>
            <div className="scenery" aria-hidden="true">
              <span className="cloud" style={{ top: '12%', animationDelay: `${zi * -13}s` }} />
              <span className="cloud" style={{ top: '30%', animationDelay: `${zi * -13 - 18}s`, transform: 'scale(.7)' }} />
              <span className="hill" style={{ width: '70vw', height: '34vw', background: th.ground, bottom: '-22vw', left: '-18vw', opacity: .8 }} />
              <span className="hill" style={{ width: '60vw', height: '30vw', background: th.ground, bottom: '-20vw', right: '-14vw', opacity: .6 }} />
            </div>

            <div className="zone-title">
              <span className="zicon" style={{ color: '#fff' }}>
                <Illu name={cat.icon.name} char={cat.icon.char} hex={cat.icon.hex} size={30} />
              </span>
              {cat.name} · {th.name}
            </div>

            <div className={`trail${currentIdx === 0 ? ' trail-hero-top' : ''}`} style={{ height: TRAIL_H }}>
              <svg className="rope" viewBox={`0 0 420 ${TRAIL_H}`} preserveAspectRatio="none" aria-hidden="true">
                <path d={`M ${NODE_POS[0].x * 4.2} ${NODE_POS[0].y * TRAIL_H / 100} Q 400 ${(NODE_POS[0].y + 16) * TRAIL_H / 100} ${NODE_POS[1].x * 4.2} ${NODE_POS[1].y * TRAIL_H / 100} Q 20 ${(NODE_POS[1].y + 16) * TRAIL_H / 100} ${NODE_POS[2].x * 4.2} ${NODE_POS[2].y * TRAIL_H / 100}`} />
              </svg>
              {[
                { id: 'learn', label: 'Learn', icon: 'book', color: 'var(--grass)', deep: 'var(--grass-deep)', state: learnState, stars: z.learnStars || 0 },
                { id: 'quiz', label: 'Quiz', icon: 'flag', color: 'var(--purple)', deep: 'var(--purple-deep)', state: quizState, stars: z.quizStars || 0 },
                { id: 'chest', label: 'Treasure', icon: 'gift', color: 'var(--gold)', deep: 'var(--gold-deep)', state: chestState, stars: 0 },
              ].map((node, ni) => (
                <button key={node.id}
                  className={`node ${node.state}`}
                  style={{ left: `${NODE_POS[ni].x}%`, top: `${NODE_POS[ni].y}%` }}
                  data-testid={`node-${catId}-${node.id}`}
                  data-nav data-nav-default={`${catId}-${node.id}` === defKey ? '' : undefined}
                  disabled={node.state === 'locked'}
                  aria-label={`${cat.name} ${node.label}. ${node.state === 'locked' ? 'Locked.' : node.state === 'done' ? 'Done!' : 'Ready to play!'}`}
                  onClick={() => onPlay(cat, node.id, zi)}>
                  {node.state === 'done' && node.stars > 0 && (
                    <span className="node-stars">{[1, 2, 3].map((k) => <Star key={k} s={20} on={k <= node.stars} />)}</span>
                  )}
                  <span className="node-btn" style={{ '--nb': node.color, '--nb-deep': node.deep }}>
                    <I n={node.state === 'locked' ? 'lock' : node.state === 'done' && node.id !== 'chest' ? 'check' : node.icon} s={36} />
                  </span>
                  <span className="node-label">{node.label}</span>
                  {currentIdx === ni && (
                    <span className="node-mascot" style={{ left: '50%', top: -6 }}>
                      <HeroMascot state="idle" size={64} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {!prevDone && <div className="zone-fence"><I n="lock" s={18} /> Finish {CATEGORIES.find((c) => c.id === ZONE_CATS[zi - 1]).name} to unlock</div>}
          </section>
        );
      })}
      <section style={{ padding: '40px 0 70px', textAlign: 'center', background: '#c62828', color: '#fff', fontWeight: 600, fontSize: 18 }}>
        You explored every land! More coming soon… 🏔️
      </section>
    </div>
  );
}
