// ComicBook.jsx — the comic engine: a page graph with panel reveals, branching
// choices, and inline challenges. Drives all four Story Land books. Ported from
// adventure-story.jsx `ComicBook`.
import { useState, useEffect } from 'react';
import { Illu } from '../art/Illu.jsx';
import { Panel } from './Panel.jsx';
import { COMIC_CHALLENGES } from './challenges.jsx';

export function ComicBook({ graph, start, total, label, speak, I, Burst }) {
  const [nid, setNid] = useState(start);
  const [seq, setSeq] = useState([start]);
  const [revealed, setRevealed] = useState(1);
  const [solved, setSolved] = useState(false);
  const [burst, setBurst] = useState(false);
  const page = graph[nid];

  useEffect(() => { setRevealed(1); setSolved(false); if (page.end) setBurst(true); }, [nid]);

  const allShown = revealed >= page.panels.length;
  const needSolve = page.challenge && !solved;
  const canNext = allShown && !needSolve;
  const go = (id) => { setSeq((s) => [...s, id]); setNid(id); };
  const back = () => { if (seq.length > 1) { const ns = seq.slice(0, -1); setSeq(ns); setNid(ns[ns.length - 1]); } };
  const restart = () => { setSeq([start]); setNid(start); setRevealed(1); setSolved(false); };
  const Challenge = page.challenge && COMIC_CHALLENGES[page.challenge];

  return (
    <div className="story-level comic-level" data-screen-label={`Comic: ${label}`}>
      <div className={`comic-page ${page.layout || 'hero'}`}>
        {page.panels.map((p, i) => (
          <Panel key={nid + '-' + i} p={p} idx={i} shown={i < revealed} speak={speak}
            onReveal={() => setRevealed((r) => Math.max(r, i + 1))} />
        ))}
      </div>
      {allShown && Challenge && !solved && (
        <div className="comic-challenge" data-testid="quest-challenge">
          <Challenge speak={speak} I={I} onWin={() => { setSolved(true); setBurst(true); }} />
        </div>
      )}
      <div className="narrate comic-bar">
        <div className="narrate-row">
          <button className="gbtn white round" aria-label="Previous page" disabled={seq.length <= 1}
            onClick={back} style={{ minHeight: 54, width: 54 }}><I n="back" s={24} /></button>
          <span className="story-dots">{[...Array(total)].map((_, i) => <i key={i} className={i === page.dot ? 'on' : ''} />)}</span>
          {page.end ? (
            <button className="gbtn gold" data-testid="story-again" onClick={restart}>Read again</button>
          ) : page.choices && allShown ? (
            <div className="choice-row" data-testid="story-choices">
              {page.choices.map((c) => (
                <button key={c.next} className="choice-card" data-testid={`choice-${c.next}`}
                  onClick={() => { speak(c.label + '!'); go(c.next); }}>
                  <span style={{ color: 'var(--gold)' }}><Illu name={c.icon} size={40} /></span>
                  <b>{c.label}</b>
                </button>
              ))}
            </div>
          ) : (
            <button className="gbtn gold" data-testid="story-next" disabled={!canNext}
              onClick={() => go(page.next)}>
              {!allShown ? 'Tap the panels!' : needSolve ? 'Solve it first!' : 'Next'} <I n="next" s={22} />
            </button>
          )}
        </div>
      </div>
      {burst && <Burst onDone={() => setBurst(false)} />}
    </div>
  );
}
