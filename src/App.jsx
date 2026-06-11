import { useState, useCallback } from 'react';
import { useSettings } from './hooks/useSettings';
import { useViewport } from './hooks/useViewport';
import { useSpeech, announce } from './pip/speech.js';
import { useProgress } from './pip/hooks/useProgress.js';
import { useDaily } from './pip/hooks/useDaily.js';
import { Icon } from './pip/components/Icon.jsx';
import { CaptionBar } from './pip/components/CaptionBar.jsx';
import { DailyGoalRing } from './pip/components/DailyGoalRing.jsx';
import { KeyHelp } from './pip/components/KeyHelp.jsx';
import { Home } from './pip/screens/Home.jsx';
import { Deck } from './pip/screens/Deck.jsx';
import { ComingSoon } from './pip/screens/ComingSoon.jsx';
import { Lab } from './pip/Lab.jsx';
import { CATEGORIES } from './pip/data/categories.js';
import { CARDS } from './pip/data/cards.js';

function App() {
  const { settings, setSetting } = useSettings();
  const device = useViewport();
  const [route, setRoute] = useState('home');
  const [activeCat, setActiveCat] = useState(null);
  const [muted, setMuted] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const { progress, masterCard } = useProgress();
  const { dailyCount, bumpDaily } = useDaily();

  // Speech is gated by BOTH the kid mute toggle and the parent voice setting.
  const { speak, speaking } = useSpeech(muted || !settings.voice, settings.language);

  const openCategory = useCallback((cat) => {
    setActiveCat(cat);
    setRoute('deck');
    speak(cat.name);
    announce(cat.name);
  }, [speak]);

  const onMaster = useCallback((cardId) => {
    if (activeCat) {
      masterCard(activeCat.id, cardId);
      bumpDaily();
    }
  }, [activeCat, masterCard, bumpDaily]);

  if (window.location.search.includes('pip-lab')) {
    return <Lab />;
  }

  const learnedArr = activeCat ? (progress[activeCat.id] || []) : [];
  const deckProgress = { learnedSet: new Set(learnedArr) };
  const progressMap = {};
  Object.keys(progress).forEach((k) => { progressMap[k] = { learned: progress[k].length }; });
  const lastCategory = Object.keys(progress).slice(-1)[0] || null;

  const toggleTheme = () => setSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');

  let screen;
  if (route === 'home') {
    screen = <Home mascot={settings.mascot} speak={speak} muted={muted} onToggleMute={() => setMuted((m) => !m)}
      theme={settings.theme} onToggleTheme={toggleTheme}
      progress={progressMap} lastCategory={lastCategory}
      onOpenCategory={openCategory} onParent={() => setRoute('parent')} />;
  } else if (route === 'deck' && activeCat) {
    screen = <Deck cat={activeCat} cards={CARDS[activeCat.id] || []} mascot={settings.mascot}
      speak={speak} speaking={speaking} progress={deckProgress}
      onMaster={onMaster} onBack={() => setRoute('home')} onQuiz={() => setRoute('quiz')} />;
  } else if (route === 'quiz' && activeCat) {
    screen = <ComingSoon title="Quiz" mascot={settings.mascot} onBack={() => setRoute('deck')} />;
  } else if (route === 'rewards') {
    screen = <ComingSoon title="Treasures" mascot={settings.mascot} onBack={() => setRoute('home')} />;
  } else if (route === 'paint') {
    screen = <ComingSoon title="Paint" mascot={settings.mascot} onBack={() => setRoute('home')} />;
  } else if (route === 'mascot') {
    screen = <ComingSoon title="Buddies" mascot={settings.mascot} onBack={() => setRoute('home')} />;
  } else if (route === 'parent') {
    screen = <ComingSoon title="For grown-ups" mascot={settings.mascot} onBack={() => setRoute('home')} />;
  } else {
    screen = <Home mascot={settings.mascot} speak={speak} muted={muted} onToggleMute={() => setMuted((m) => !m)}
      theme={settings.theme} onToggleTheme={toggleTheme}
      progress={progressMap} lastCategory={lastCategory}
      onOpenCategory={openCategory} onParent={() => setRoute('parent')} />;
  }

  const showNav = ['home', 'rewards', 'mascot', 'paint'].includes(route);
  const isWeb = device === 'web';
  const useSidebar = isWeb && route !== 'onboard';
  const resumeCat = activeCat || (lastCategory && CATEGORIES.find((x) => x.id === lastCategory)) || null;
  const goLearn = () => { if (resumeCat) { setActiveCat(resumeCat); setRoute('deck'); } else setRoute('home'); };

  // shared destinations — identical on mobile bottom-nav and web sidebar
  const NAV = [
    { id: 'home', label: 'Home', icon: 'home', active: route === 'home', go: () => setRoute('home') },
    { id: 'learn', label: 'Learn', icon: 'play', active: route === 'deck' || route === 'quiz', go: goLearn },
    { id: 'rewards', label: 'Treasures', icon: 'gift', active: route === 'rewards', go: () => setRoute('rewards') },
    { id: 'paint', label: 'Paint', icon: 'palette', active: route === 'paint', go: () => setRoute('paint') },
    { id: 'mascot', label: 'Buddies', icon: 'sparkle', active: route === 'mascot', go: () => setRoute('mascot') },
  ];

  const sidebar = (
    <aside className="websidebar">
      <div className="web-logo"><span className="wm-pip">Pip</span><span className="wm-bang">!</span></div>
      <nav className="webnav">
        {NAV.map((n) => (
          <button key={n.id} className={`nav-item ${n.active ? 'active' : ''}`} data-testid={`webnav-${n.id}`} onClick={n.go}>
            <Icon name={n.icon} size={24} />{n.label}
          </button>
        ))}
      </nav>
      <div className="websidebar-foot">
        <div className="sb-goal"><DailyGoalRing count={dailyCount} /><small>Today&apos;s goal</small></div>
        <div className="sb-row">
          <button className="round-btn" aria-label={muted ? 'Turn voice on' : 'Turn voice off'} aria-pressed={muted} onClick={() => setMuted((m) => !m)}><Icon name={muted ? 'mute' : 'sound'} size={22} /></button>
          <button className="round-btn" aria-label="Switch light or dark" onClick={toggleTheme}><Icon name={settings.theme === 'dark' ? 'sparkle' : 'star'} size={22} /></button>
        </div>
        <button className="sb-grown" data-testid="parent-entry" onClick={() => setRoute('parent')}><Icon name="lock" size={20} /> For grown-ups</button>
      </div>
    </aside>
  );

  return (
    <>
      {useSidebar ? (
        <div className="webshell">{sidebar}<main className="webmain">{screen}</main></div>
      ) : (
        <>
          {screen}
          {!isWeb && showNav && (
            <nav className="bottom-nav">
              {NAV.map((n) => (
                <button key={n.id} className={`nav-item ${n.active ? 'active' : ''}`} data-testid={`bottomnav-${n.id}`} onClick={n.go}>
                  <Icon name={n.icon} size={26} />{n.label}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
      <CaptionBar />
      {route === 'home' && !isWeb && <div className="goal-float"><DailyGoalRing count={dailyCount} size={46} /></div>}
      {(route === 'deck' || route === 'quiz') && (
        <button className="round-btn key-help-btn" aria-label="Keyboard keys help" data-testid="key-help-btn" onClick={() => setShowKeys(true)}>?</button>
      )}
      {showKeys && <KeyHelp onClose={() => setShowKeys(false)} />}
    </>
  );
}

export default App;
