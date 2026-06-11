import { Icon } from '../components/Icon.jsx';
import { Illu } from '../art/Illu.jsx';
import { Mascot } from '../components/Mascot.jsx';
import { CategoryTile } from '../components/CategoryTile.jsx';
import { announce } from '../speech.js';
import { CATEGORIES } from '../data/categories.js';

export function Home({ onOpenCategory, onParent, theme, onToggleTheme, progress, lastCategory, mascot, speak, muted, onToggleMute }) {
  const last = lastCategory ? CATEGORIES.find((c) => c.id === lastCategory) : null;
  return (
    <div className="screen home" data-screen-label="Home">
      <header className="home-bar">
        <span className="wordmark"><span className="wm-pip">Pip</span><span className="wm-bang">!</span></span>
        <div className="home-bar-actions">
          <button className="round-btn" aria-label={muted ? 'Turn voice on' : 'Turn voice off'} onClick={onToggleMute} aria-pressed={muted}>
            <Icon name={muted ? 'mute' : 'sound'} size={24} />
          </button>
          <button className="round-btn" aria-label="Switch light or dark" onClick={onToggleTheme}>
            <Icon name={theme === 'dark' ? 'sparkle' : 'star'} size={24} />
          </button>
          <button className="round-btn grown" aria-label="For grown-ups" data-testid="parent-entry" onClick={onParent}>
            <Icon name="lock" size={22} />
          </button>
        </div>
      </header>

      <div className="ambient" aria-hidden="true"><i /><i /><i /></div>

      <div className="home-hero">
        <div className="home-hero-mascot"><Mascot concept={mascot} state="idle" size={132} /></div>
        <div className="home-hero-text">
          <h1>Hi there! What do you want to learn?</h1>
          <button className="pip-cta lg" onClick={() => { speak('Tap a picture to hear it'); announce('Tap a picture to hear it'); }}>
            <Icon name="play" size={22} /> Tap to hear
          </button>
        </div>
      </div>

      {last && (
        <button className="continue-card" onClick={() => onOpenCategory(last)} data-testid="continue-card"
          style={{ '--c1': `var(--cat-${last.color}-1)`, '--c2': `var(--cat-${last.color}-2)` }}>
          <span className="continue-icon"><Illu name={last.icon.name} char={last.icon.char} hex={last.icon.hex} size={52} /></span>
          <span className="continue-text"><small>Keep going</small><b>{last.name}</b></span>
          <Icon name="next" size={30} />
        </button>
      )}

      <h2 className="shelf-title">All the things</h2>
      <div className="cat-grid">
        {CATEGORIES.map((cat) => (
          <CategoryTile key={cat.id} cat={cat} progress={(progress[cat.id]?.learned || 0) / cat.count}
            done={(progress[cat.id]?.learned || 0) >= cat.count} onSelect={onOpenCategory} />
        ))}
      </div>
      <div className="home-foot"><Mascot concept={mascot} state="idle" size={40} /> Made for little learners</div>
    </div>
  );
}
