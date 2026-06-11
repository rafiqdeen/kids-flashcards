import { useState, useCallback, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { useViewport } from './hooks/useViewport';
import { useSound } from './hooks/useSound';
import { useSpeech, announce } from './pip/speech.js';
import { useProgress } from './pip/hooks/useProgress.js';
import { useDaily } from './pip/hooks/useDaily.js';
import { Icon } from './pip/components/Icon.jsx';
import { CaptionBar } from './pip/components/CaptionBar.jsx';
import { DailyGoalRing } from './pip/components/DailyGoalRing.jsx';
import { KeyHelp } from './pip/components/KeyHelp.jsx';
import { Home } from './pip/screens/Home.jsx';
import { Deck } from './pip/screens/Deck.jsx';
import { Quiz } from './pip/screens/Quiz.jsx';
import { Rewards } from './pip/screens/Rewards.jsx';
import { Paint } from './pip/screens/Paint.jsx';
import { Onboarding } from './pip/screens/Onboarding.jsx';
import { MascotSheet } from './pip/screens/MascotSheet.jsx';
import { Parent } from './pip/screens/Parent.jsx';
import { WelcomeBack } from './pip/components/WelcomeBack.jsx';
import { useWelcomeBack } from './pip/hooks/useWelcomeBack.js';
import { UpdateToast } from './pip/components/UpdateToast.jsx';
import { useEarned } from './pip/hooks/useEarned.js';
import { useGallery } from './pip/hooks/useGallery.js';
import { Lab } from './pip/Lab.jsx';
import { SpeechDebug } from './pip/SpeechDebug.jsx';
import { CATEGORIES } from './pip/data/categories.js';
import { CARDS } from './pip/data/cards.js';

function App() {
  const { settings, setSetting } = useSettings();
  const device = useViewport();
  const [route, setRoute] = useState(() => {
    try {
      return localStorage.getItem('pip-onboarded') ? 'home' : 'onboard';
    } catch {
      return 'onboard';
    }
  });
  const [activeCat, setActiveCat] = useState(null);
  const [muted, setMuted] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [quizRun, setQuizRun] = useState(0); // key bump remounts Quiz for "Try again"
  const { progress, masterCard } = useProgress();
  const { dailyCount, bumpDaily } = useDaily();
  const { earned, addSticker, dripSticker } = useEarned();
  const { gallery, addArt } = useGallery();

  // Speech is gated by BOTH the kid mute toggle and the parent voice setting.
  const { speak, speaking } = useSpeech(muted || !settings.voice, settings.language);
  const { playSound } = useSound();
  const sfx = useCallback((name) => { if (settings.sound) playSound(name); }, [settings.sound, playSound]);
  const welcomeBack = useWelcomeBack(speak);

  // gentle screen-time nudge after 20 minutes (parent "limit" setting) — a
  // spoken/captioned suggestion, never a lock-out
  useEffect(() => {
    if (!settings.limit) return;
    const t = setTimeout(() => {
      speak('We played a lot! Time for a little stretch?');
      announce('Time for a little stretch?');
    }, 20 * 60 * 1000);
    return () => clearTimeout(t);
  }, [settings.limit, speak]);

  const openCategory = useCallback((cat) => {
    setActiveCat(cat);
    setRoute('deck');
    sfx('click');
    speak(cat.name);
    announce(cat.name);
  }, [speak, sfx]);

  const onMaster = useCallback((cardId) => {
    if (activeCat) {
      masterCard(activeCat.id, cardId);
      bumpDaily();
      dripSticker();
      sfx('celebrate');
    }
  }, [activeCat, masterCard, bumpDaily, dripSticker, sfx]);

  if (window.location.search.includes('pip-lab')) {
    return <Lab />;
  }
  if (window.location.search.includes('pipdebug')) {
    return <SpeechDebug />;
  }

  const learnedArr = activeCat ? (progress[activeCat.id] || []) : [];
  const deckProgress = { learnedSet: new Set(learnedArr) };
  const progressMap = {};
  Object.keys(progress).forEach((k) => { progressMap[k] = { learned: progress[k].length }; });
  const lastCategory = Object.keys(progress).slice(-1)[0] || null;

  const toggleTheme = () => setSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');

  let screen;
  if (route === 'onboard') {
    screen = <Onboarding mascot={settings.mascot} speak={speak}
      onDone={() => {
        try { localStorage.setItem('pip-onboarded', '1'); } catch { /* private mode */ }
        setRoute('home');
      }} />;
  } else if (route === 'home') {
    screen = <Home mascot={settings.mascot} speak={speak} muted={muted} onToggleMute={() => setMuted((m) => !m)}
      theme={settings.theme} onToggleTheme={toggleTheme}
      progress={progressMap} lastCategory={lastCategory}
      onOpenCategory={openCategory} onParent={() => setRoute('parent')} />;
  } else if (route === 'deck' && activeCat) {
    screen = <Deck cat={activeCat} cards={CARDS[activeCat.id] || []} mascot={settings.mascot}
      speak={speak} speaking={speaking} progress={deckProgress}
      onMaster={onMaster} onBack={() => setRoute('home')} onQuiz={() => setRoute('quiz')} />;
  } else if (route === 'quiz' && activeCat) {
    screen = <Quiz key={quizRun} cat={activeCat} cards={CARDS[activeCat.id] || []} mascot={settings.mascot}
      speak={speak} difficulty={settings.difficulty}
      onBack={() => setRoute('deck')} onRewards={() => setRoute('rewards')}
      onAgain={() => setQuizRun((n) => n + 1)} />;
  } else if (route === 'rewards') {
    screen = <Rewards earned={earned} gallery={gallery} speak={speak}
      onOpenChest={addSticker} onPaint={() => setRoute('paint')} onBack={() => setRoute('home')} />;
  } else if (route === 'paint') {
    screen = <Paint mascot={settings.mascot} speak={speak}
      onSaveArt={addArt} onRewards={() => setRoute('rewards')} onBack={() => setRoute('home')} />;
  } else if (route === 'mascot') {
    screen = <MascotSheet concept={settings.mascot} onPick={(c) => setSetting('mascot', c)} onBack={() => setRoute('home')} />;
  } else if (route === 'parent') {
    screen = <Parent settings={settings} onSetting={setSetting} progress={progress} onBack={() => setRoute('home')} />;
  } else {
    screen = <Home mascot={settings.mascot} speak={speak} muted={muted} onToggleMute={() => setMuted((m) => !m)}
      theme={settings.theme} onToggleTheme={toggleTheme}
      progress={progressMap} lastCategory={lastCategory}
      onOpenCategory={openCategory} onParent={() => setRoute('parent')} />;
  }

  const showNav = ['home', 'rewards', 'mascot', 'paint'].includes(route);
  const isWeb = device === 'web';
  const useSidebar = isWeb && route !== 'onboard';
  // Learn always opens a deck — resume the active/last-played category, else
  // start the first one (previously did nothing when there was no progress).
  const resumeCat = activeCat || (lastCategory && CATEGORIES.find((x) => x.id === lastCategory)) || CATEGORIES[0];
  const goLearn = () => { setActiveCat(resumeCat); setRoute('deck'); };

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
      <WelcomeBack show={welcomeBack} mascot={settings.mascot} />
      <UpdateToast />
    </>
  );
}

export default App;
