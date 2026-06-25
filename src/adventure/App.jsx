// App.jsx — inner app for one profile. Owns world/level routing, per-profile
// progress (pip-adv-prog-<pid>), settings, and the complete modal. Ported from
// adventure-app.jsx `App`. BuddyContext flows the chosen buddy app-wide.
import { useState, useEffect, useRef } from 'react';
import { BuddyContext } from './art/buddy.js';
import { I, Star } from './art/icons.jsx';
import { Burst } from './components/Burst.jsx';
import { Caption } from './components/Caption.jsx';
import { Dock } from './components/Dock.jsx';
import { announce } from './bus.js';
import { Complete } from './components/Complete.jsx';
import { World } from './screens/World.jsx';
import { LearnLevel } from './screens/LearnLevel.jsx';
import { QuizLevel } from './screens/QuizLevel.jsx';
import { ChestLevel } from './screens/ChestLevel.jsx';
import { SettingsModal } from './screens/Settings.jsx';
import { ActivityHub } from './screens/ActivityHub.jsx';
import { StoryLand } from './screens/StoryLand.jsx';
import { AdventurePaint } from './screens/Paint.jsx';
import { CATEGORIES } from './data/categories.js';
import { load, save } from './data/profiles.js';
import { useAdvSettings } from './hooks/useAdvSettings.js';
import { useSpeech } from './hooks/useSpeech.js';
import { useTvMode } from './hooks/useTvMode.js';

export function App({ pid, profile, onProfiles, onBuddyChange }) {
  const [muted, setMuted] = useState(false);
  const [adv, setAdv] = useState(() => load('pip-adv-prog-' + pid, {}));
  const [route, setRoute] = useState({ name: 'world' });
  const [complete, setComplete] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [navNonce, setNavNonce] = useState(0); // bump to re-tap the active dock tab back to a room's root
  const [settings, updateSetting] = useAdvSettings(pid);
  const { speak, speaking } = useSpeech(muted || !settings.voice);
  const [tv] = useTvMode(); // TV/remote mode — single gate for D-pad behaviour (no-op when off)
  const lastZoneRef = useRef(null); // remember the zone we left so World can restore focus on return

  useEffect(() => { save('pip-adv-prog-' + pid, adv); }, [adv, pid]);

  const setZone = (catId, patch) => setAdv((a) => ({ ...a, [catId]: { ...(a[catId] || {}), ...patch } }));
  // ALL navigation goes through goRoute: it bumps navNonce, which keys every dynamic
  // screen below. That guarantees a FRESH MOUNT on every navigation — including
  // re-navigating to the SAME route (e.g. Quiz "Try again", or re-tapping the active
  // dock tab), where route.name alone wouldn't change and the screen would otherwise
  // keep its stale, finished state.
  const goRoute = (r) => { setComplete(null); setNavNonce((n) => n + 1); setRoute(r); };
  const play = (cat, nodeId, zone) => {
    if (cat) lastZoneRef.current = cat.id; // for World focus restore on return
    goRoute({ name: nodeId, cat, zone });
    speak(nodeId === 'learn' ? `Let's learn ${cat.name}!` : nodeId === 'quiz' ? `${cat.name} quiz! Ready?` : nodeId === 'activity' ? 'Play time!' : 'Treasure time!');
  };
  const backToWorld = () => goRoute({ name: 'world' });
  // Persistent bottom dock: which destination is "current", and how each tab navigates.
  // Paint always belongs to Play (only reachable via the Playground or Settings quick-play).
  const dockActive = route.name === 'story' ? 'stories'
    : (route.name === 'activity' || route.name === 'paint') ? 'play'
    : 'adventure';
  const navDock = (key) => {
    if (key === 'stories') { goRoute({ name: 'story' }); speak('Story time!'); }
    else if (key === 'play') { goRoute({ name: 'activity', cat: CATEGORIES[0], zone: 0 }); speak('Play time!'); }
    else { goRoute({ name: 'world' }); speak('To the map!'); }
  };
  const quickPlay = (gameId) => {
    setShowSettings(false);
    const cat = CATEGORIES[0]; // animals as the universal demo deck
    if (gameId === 'paint') goRoute({ name: 'paint', cat, zone: 0 });
    else goRoute({ name: 'activity', cat, zone: 0, autoGame: gameId }); // gameId 'calm' carries through
    speak('Play time!');
  };
  const unlockAll = () => {
    const a = { ...adv };
    CATEGORIES.forEach((c) => { a[c.id] = { ...(a[c.id] || {}), learnStars: Math.max(1, (a[c.id] || {}).learnStars || 0), quizStars: Math.max(1, (a[c.id] || {}).quizStars || 0) }; });
    setAdv(a); setShowSettings(false); speak('All lands are open!');
  };
  const resetAll = () => {
    setAdv({}); setShowSettings(false);
    // Per-profile paint key fix (was a documented bug: reset cleared the wrong
    // keys and paint was shared across profiles). Clear this profile's doodles
    // + gallery (new per-profile keys) plus the legacy shared keys.
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('pip-adv-doodle-' + pid) || k === 'pip-adv-gallery-' + pid
          || k.startsWith('pip-adv-learn-' + pid) // mastered-cards progress per zone
          || k.startsWith('pip-doodle-') || k === 'pip-gallery')
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* private mode */ }
    speak('All fresh! Let’s start a new adventure!');
  };

  const { cat, zone } = route;
  const buddy = settings.buddy || 'pip';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (onBuddyChange) onBuddyChange(buddy); }, [buddy]);
  return (
    <BuddyContext.Provider value={buddy}>
      {route.name === 'world' && <World adv={adv} onPlay={play} muted={muted} setMuted={setMuted} speak={speak} onSettings={() => setShowSettings(true)} profile={profile} buddy={buddy} onProfiles={onProfiles} focusZone={lastZoneRef.current} />}
      {route.name === 'story' && <StoryLand key={'story-' + navNonce} speak={speak} onExit={backToWorld} I={I} Star={Star} Burst={Burst} />}
      {route.name === 'paint' && <AdventurePaint key={'paint-' + navNonce} pid={pid} dpad={tv} onExit={() => (route.from === 'activity' ? goRoute({ name: 'activity', cat: route.cat, zone: route.zone }) : backToWorld())} speak={speak} announce={announce} Burst={Burst} I={I} Star={Star} />}
      {route.name === 'activity' && <ActivityHub key={'activity-' + navNonce} cat={cat} speak={speak} dpad={tv}
        onExit={backToWorld} autoGame={route.autoGame} disabledGames={settings.disabled}
        onPaint={() => goRoute({ name: 'paint', cat, zone, from: 'activity' })}
        onRecord={(gameId, stars) => setAdv((a) => ({ ...a, __play: { act: { ...((a.__play || {}).act || {}), [gameId]: stars } } }))}
        I={I} Star={Star} Burst={Burst} />}
      {route.name === 'learn' && <LearnLevel key={'learn-' + navNonce} cat={cat} zone={zone} pid={pid} speak={speak} speaking={speaking}
        onExit={backToWorld}
        onComplete={(stars) => { setZone(cat.id, { learnStars: stars }); setComplete({ stars, title: 'Level complete!', sub: `You learned every ${cat.name.toLowerCase()} card!`, retry: () => goRoute({ name: 'learn', cat, zone }), retryLabel: 'Learn again', next: () => goRoute({ name: 'quiz', cat, zone }), nextLabel: 'Quiz time!' }); }} />}
      {route.name === 'quiz' && <QuizLevel key={'quiz-' + navNonce} cat={cat} zone={zone} speak={speak}
        onExit={backToWorld}
        onComplete={(stars, score, total) => { setZone(cat.id, { quizStars: Math.max(stars, (adv[cat.id] || {}).quizStars || 0) }); setComplete({ stars, title: stars >= 3 ? 'Perfect!' : stars === 2 ? 'Great job!' : 'Good try!', sub: `You got ${score} of ${total} right!`, retry: () => goRoute({ name: 'quiz', cat, zone: route.zone }), next: () => goRoute({ name: 'chest', cat, zone: route.zone }), nextLabel: 'Open treasure!' }); }} />}
      {route.name === 'chest' && <ChestLevel key={'chest-' + navNonce} cat={cat} zone={zone} speak={speak}
        onExit={backToWorld}
        onComplete={(reward) => { setZone(cat.id, { chest: reward }); setComplete({ stars: 3, title: 'Zone complete!', sub: 'A new land is unlocked. Onward!', next: backToWorld, nextLabel: 'Back to the map' }); }} />}
      {complete && <Complete stars={complete.stars} title={complete.title} sub={complete.sub}
        onNext={complete.next} onRetry={complete.retry} nextLabel={complete.nextLabel} retryLabel={complete.retryLabel} />}
      {showSettings && (
        <SettingsModal set={settings} update={updateSetting} onClose={() => setShowSettings(false)}
          onQuickPlay={quickPlay} onUnlockAll={unlockAll} onReset={resetAll} I={I} />
      )}
      <Dock active={dockActive} onNavigate={navDock} inert={!!(complete || showSettings)} />
      <Caption suppress={route.name === 'story'} />
      {/* eye-comfort colour filter — driven by html[data-tone]; backdrop-filter so
          it tints everything without disturbing layout or the fixed HUD */}
      <div className="tone-overlay" aria-hidden="true" />
    </BuddyContext.Provider>
  );
}
