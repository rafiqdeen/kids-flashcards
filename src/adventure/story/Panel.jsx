// Panel.jsx — one comic panel: gradient art, props (tappable), cast (mascots),
// burst word, caption, speech/thought bubble. Optional `fx` (camera Ken-Burns) and
// per-element `depth` (parallax) drive the motion comic; panels without them render
// exactly as before. `data-fx` tags the beat-able elements for the choreographer.
import { useContext, useEffect, useRef } from 'react';
import { Mascot } from '../art/Mascot.jsx';
import { BuddyContext } from '../art/buddy.js';
import { Illu } from '../art/Illu.jsx';
import { prefersCalm } from '../motion.js';

const ORIGIN = { left: 'left center', right: 'right center', top: 'center top', bottom: 'center bottom', center: 'center' };
const BEAT_SEL = (el) => el === 'bubble' ? '[data-fx="bubble"]' : el === 'burst' ? '[data-fx="burst"]'
  : el && el.cast != null ? `[data-fx="cast-${el.cast}"]` : el && el.prop != null ? `[data-fx="prop-${el.prop}"]` : null;

export function Panel({ p, idx, shown, onReveal, speak, autoplay, onNarrated }) {
  const buddy = useContext(BuddyContext);
  const ref = useRef(null);
  useEffect(() => {
    if (!shown) return;
    const text = [p.caption, p.bubble && (p.bubble.say || p.bubble.text)].filter(Boolean).join(' ');
    const beats = (p.fx && p.fx.beats) || [];
    const timers = [];
    // Fire timed pops (full tier only) and, when autoplaying, reveal the next
    // panel when narration ends — with a safety fallback so it can't soft-lock.
    const onStart = ({ duration }) => {
      if (!prefersCalm() && duration) {
        beats.forEach((bt) => {
          const sel = BEAT_SEL(bt.el); if (!sel) return;
          const cls = bt.fx === 'bob' ? 'fx-bob' : 'fx-pop';
          timers.push(setTimeout(() => {
            const el = ref.current && ref.current.querySelector(sel); if (!el) return;
            el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); // restart the one-shot
            timers.push(setTimeout(() => el.classList.remove(cls), 700));
          }, Math.max(0, bt.at * duration * 1000)));
        });
      }
      if (autoplay && onNarrated) timers.push(setTimeout(() => onNarrated(idx), (duration || 8) * 1000 + 3000)); // fallback
    };
    // On autoplay, advance after a short dwell once narration ends — gives a child
    // a beat to tap the panel's props/bubble before the next panel reveals.
    const opts = (beats.length || autoplay) ? { onStart, onDone: () => { if (autoplay && onNarrated) timers.push(setTimeout(() => onNarrated(idx), 900)); } } : undefined;
    const t = setTimeout(() => {
      if (text) speak(text, opts);
      else if (autoplay && onNarrated) timers.push(setTimeout(() => onNarrated(idx), 1500)); // textless panel: brief beat
    }, 350);
    timers.push(t);
    return () => timers.forEach(clearTimeout);
  }, [shown]);
  if (!shown) {
    return (
      <button className="comic-panel hidden" data-testid={`panel-${idx}`} aria-label="Tap to reveal the next panel" onClick={onReveal}>
        <span className="panel-tap">Tap!</span>
      </button>
    );
  }
  const cam = p.fx && p.fx.cam;
  const camStyle = cam ? {
    '--cam-s': cam.from?.[0] ?? 1.08,
    '--cam-x': `${cam.from?.[1] ?? 0}%`,
    '--cam-y': `${cam.from?.[2] ?? 0}%`,
    // Cap the entrance so it settles within a panel's natural dwell (narration is
    // ~2-4s); otherwise a 9-11s pan never finishes and the camBreathe loop (which
    // starts after the entrance) never plays during normal reading.
    '--cam-dur': `${Math.min(cam.dur ?? 10, 5.5)}s`,
    '--cam-origin': ORIGIN[cam.origin] || 'center',
  } : null;

  const scene = (
    <>
      <span className="panel-ground" style={{ background: p.ground || 'transparent' }} aria-hidden="true" />
      <span className="panel-dots" aria-hidden="true" />
      {(p.props || []).map((pr, i) => {
        // anchor by top:y% by default; `b` (bottom %) pins the prop's BOTTOM to the
        // ground; `wide` (%) scales the art to a fraction of the panel width.
        const style = pr.b != null ? { left: `${pr.x}%`, bottom: `${pr.b}%` } : { left: `${pr.x}%`, top: `${pr.y}%` };
        if (pr.wide) style.width = `${pr.wide}%`;
        const dep = cam && pr.depth && !pr.wide ? pr.depth : 0; // wide background props skip parallax
        return (
          <button key={i} className={`sprop ${pr.anim || ''} ${pr.wide ? 'wideprop' : ''}`} style={style}
            data-fx={`prop-${i}`} aria-label={pr.illu} onClick={() => speak(pr.say || pr.illu + '!')}>
            <span className={dep ? 'pdepth par' : ''} style={dep ? { color: pr.color || '#fff', '--depth': dep } : { color: pr.color || '#fff' }}>
              <Illu name={pr.illu} size={pr.size} />
            </span>
          </button>
        );
      })}
      {(p.cast || []).map((c, i) => {
        const dep = cam && c.depth ? c.depth : 0;
        const m = <Mascot concept={c.concept || buddy} state={c.state} size={c.size} flip={c.flip} />;
        return (
          <span key={i} className={`comic-cast ${c.anim || ''}`} style={{ left: `${c.x}%`, bottom: `${c.y}%` }} data-fx={`cast-${i}`}>
            {dep ? <span className="pdepth par" style={{ '--depth': dep }}>{m}</span> : m}
          </span>
        );
      })}
      {p.burst && (
        <span className="burst-word" data-fx="burst" style={{ left: `${p.burst.x}%`, top: `${p.burst.y}%`, '--bw': p.burst.color }}>
          {p.burst.text}
        </span>
      )}
    </>
  );

  return (
    <div className="comic-panel revealed" data-testid={`panel-${idx}`} ref={ref}>
      <div className="panel-art" style={{ background: `linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})` }}>
        {p.caption && <span className="panel-caption">{p.caption}</span>}
        {cam ? <div className="panel-cam cam" style={camStyle}>{scene}</div> : scene}
      </div>
      {p.bubble && (
        <button className={`bubble ${p.bubble.type || 'speech'} tail-${p.bubble.tail || 'left'} ${p.bubble.who === 'right' ? 'from-right' : ''}`}
          data-fx="bubble" onClick={() => speak(p.bubble.say || p.bubble.text)} aria-label={'Speech: ' + p.bubble.text}>
          {p.bubble.text}
        </button>
      )}
    </div>
  );
}
