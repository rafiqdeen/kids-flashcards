// StoryLand.jsx — the Story Land hub (shelf of 4 illustrated book covers) and
// the per-book comic host. Ported from adventure-story.jsx `StoryLand`; the
// four book wrappers are inlined onto the shared ComicBook engine.
import { useState, useEffect } from 'react';
import { HeroMascot } from '../art/Mascot.jsx';
import { ComicBook } from '../story/ComicBook.jsx';
import { BookCover } from '../story/BookCover.jsx';
import { SHELF, LOST_STAR, DAY_OUT, QUEST, SUPER_DAY } from '../story/books.js';

const STORIES = {
  book: { graph: LOST_STAR, start: 'p1', total: 5 },
  choose: { graph: DAY_OUT, start: 'start', total: 5 },
  quest: { graph: QUEST, start: 'q1', total: 5 },
  comic: { graph: SUPER_DAY, start: 's1', total: 4 },
};

export function StoryLand({ speak, onExit, I, Burst }) {
  const [story, setStory] = useState(null);
  useEffect(() => { if (!story) { const t = setTimeout(() => speak('Welcome to Story Land! Pick a comic book!'), 400); return () => clearTimeout(t); } }, [story]); // eslint-disable-line react-hooks/exhaustive-deps

  if (story) {
    const cfg = STORIES[story];
    const label = SHELF.find((s) => s.id === story).title;
    return (
      <div className="level story-wrap">
        <div className="level-hud">
          <button className="gbtn white round" aria-label="Back to Story Land" data-testid="story-exit"
            onClick={() => setStory(null)} style={{ minHeight: 50, width: 50 }}><I n="back" s={22} /></button>
          <span className="hud-brand" style={{ fontSize: 22 }}>{label}</span>
          <span style={{ flex: 1 }} />
        </div>
        <ComicBook graph={cfg.graph} start={cfg.start} total={cfg.total} label={label} speak={speak} I={I} Burst={Burst} />
      </div>
    );
  }

  return (
    <div className="level storyland" data-screen-label="Story Land">
      <div className="level-hud">
        <button className="gbtn white round" aria-label="Back to map" data-testid="level-exit"
          onClick={onExit} style={{ minHeight: 50, width: 50 }}><I n="back" s={22} /></button>
        <span className="hud-brand" style={{ fontSize: 22 }}>Story Land 📚</span>
        <span style={{ flex: 1 }} />
      </div>
      <div className="shelf-scene">
        <span className="story-pip gentle" style={{ left: '4%', bottom: '4%' }}><HeroMascot state="cheer" size={92} /></span>
        <div className="book-row">
          {SHELF.map((b, i) => (
            <button key={b.id} className="book-cover" data-testid={`story-${b.id}`}
              style={{ '--b1': b.c1, '--b2': b.c2, animationDelay: `${i * 90}ms` }}
              onClick={() => { setStory(b.id); speak(b.title + '!'); }}>
              <span className="book-spine" aria-hidden="true" />
              <span className="book-art"><BookCover id={b.id} /></span>
              <b>{b.title}</b>
              <small>{b.sub}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
