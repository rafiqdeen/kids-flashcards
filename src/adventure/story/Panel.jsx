// Panel.jsx — one comic panel: gradient art, props (tappable), cast (mascots),
// burst word, caption, speech/thought bubble. Ported from adventure-story.jsx.
import { useContext, useEffect } from 'react';
import { Mascot } from '../art/Mascot.jsx';
import { BuddyContext } from '../art/buddy.js';
import { Illu } from '../art/Illu.jsx';

export function Panel({ p, idx, shown, onReveal, speak }) {
  const buddy = useContext(BuddyContext);
  useEffect(() => {
    if (shown) {
      const text = [p.caption, p.bubble && (p.bubble.say || p.bubble.text)].filter(Boolean).join(' ');
      if (text) { const t = setTimeout(() => speak(text), 350); return () => clearTimeout(t); }
    }
  }, [shown]);
  if (!shown) {
    return (
      <button className="comic-panel hidden" data-testid={`panel-${idx}`} aria-label="Tap to reveal the next panel" onClick={onReveal}>
        <span className="panel-tap">Tap!</span>
      </button>
    );
  }
  return (
    <div className="comic-panel revealed" data-testid={`panel-${idx}`}>
      <div className="panel-art" style={{ background: `linear-gradient(180deg, ${p.bg[0]}, ${p.bg[1]})` }}>
        <span className="panel-ground" style={{ background: p.ground || 'transparent' }} aria-hidden="true" />
        <span className="panel-dots" aria-hidden="true" />
        {p.caption && <span className="panel-caption">{p.caption}</span>}
        {(p.props || []).map((pr, i) => {
          // anchor by top:y% by default; `b` (bottom %) pins the prop's BOTTOM to
          // the ground so px art stays grounded at any panel height; `wide` (%)
          // scales the art to a fraction of the panel width (sky-spanning props).
          const style = pr.b != null ? { left: `${pr.x}%`, bottom: `${pr.b}%` } : { left: `${pr.x}%`, top: `${pr.y}%` };
          if (pr.wide) style.width = `${pr.wide}%`;
          return (
            <button key={i} className={`sprop ${pr.anim || ''} ${pr.wide ? 'wideprop' : ''}`} style={style}
              aria-label={pr.illu} onClick={() => speak(pr.say || pr.illu + '!')}>
              <span style={{ color: pr.color || '#fff' }}><Illu name={pr.illu} size={pr.size} /></span>
            </button>
          );
        })}
        {(p.cast || []).map((c, i) => (
          <span key={i} className={`comic-cast ${c.anim || ''}`} style={{ left: `${c.x}%`, bottom: `${c.y}%` }}>
            <Mascot concept={c.concept || buddy} state={c.state} size={c.size} flip={c.flip} />
          </span>
        ))}
        {p.burst && (
          <span className="burst-word" style={{ left: `${p.burst.x}%`, top: `${p.burst.y}%`, '--bw': p.burst.color }}>
            {p.burst.text}
          </span>
        )}
      </div>
      {p.bubble && (
        <button className={`bubble ${p.bubble.type || 'speech'} tail-${p.bubble.tail || 'left'} ${p.bubble.who === 'right' ? 'from-right' : ''}`}
          onClick={() => speak(p.bubble.say || p.bubble.text)} aria-label={'Speech: ' + p.bubble.text}>
          {p.bubble.text}
        </button>
      )}
    </div>
  );
}
