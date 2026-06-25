// Dock.jsx — the persistent bottom navigation: three equal top-level
// destinations (Adventure · Play · Stories) with the current one highlighted.
// Rendered once in App (over every route) so it's always reachable. Sub-screens
// (a game, lesson, comic) still keep their own in-screen Back button.
import { I } from '../art/icons.jsx';

const TABS = [
  { key: 'adventure', label: 'Adventure', icon: 'map', testid: 'open-adventure' },
  { key: 'play', label: 'Play', icon: 'games', testid: 'open-play' },
  { key: 'stories', label: 'Stories', icon: 'book', testid: 'open-story' },
];

export function Dock({ active, onNavigate, inert = false }) {
  return (
    // `inert` (set while a modal/scrim is open) takes the dock out of the tab order
    // and pointer flow so assistive-tech/keyboard users can't reach it behind a scrim.
    <nav className="dock" aria-label="Go to" data-testid="dock" inert={inert ? '' : undefined}
      aria-hidden={inert ? 'true' : undefined}>
      <div className="dock-bar">
        {TABS.map((t) => (
          <button key={t.key} className={`dock-tab${active === t.key ? ' active' : ''}`}
            data-nav data-testid={t.testid} aria-current={active === t.key ? 'page' : undefined}
            aria-label={t.label} onClick={() => onNavigate(t.key)}>
            <span className="dock-ico"><I n={t.icon} s={26} /></span>
            <span className="dock-label">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
