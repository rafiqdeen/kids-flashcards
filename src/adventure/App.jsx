// App.jsx — inner app for one profile. Owns world/level routing, per-profile
// progress (pip-adv-prog-<pid>), settings, and the complete modal. Ported from
// adventure-app.jsx `App`. BuddyContext flows the chosen buddy app-wide.
import { useState, useEffect } from 'react';
import { BuddyContext } from './art/buddy.js';
import { I, Star } from './art/icons.jsx';
import { Burst } from './components/Burst.jsx';
import { Caption } from './components/Caption.jsx';
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
import { ZONE_THEMES, CATEGORIES } from './data/categories.js';
import { load, save } from './data/profiles.js';
import { useAdvSettings } from './hooks/useAdvSettings.js';
import { useSpeech } from './hooks/useSpeech.js';

export function App({ pid, profile, onProfiles, onBuddyChange }) {
  const [muted, setMuted] = useState(false);
  const [adv, setAdv] = useState(() => load('pip-adv-prog-' + pid, {}));
  const [route, setRoute] = useState({ name: 'world' });
  const [complete, setComplete] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, updateSetting] = useAdvSettings(pid);
  const { speak, speaking } = useSpeech(muted || !settings.voice);

  useEffect(() => { save('pip-adv-prog-' + pid, adv); }, [adv, pid]);

  const setZone = (catId, patch) => setAdv((a) => ({ ...a, [catId]: { ...(a[catId] || {}), ...patch } }));
  const play = (cat, nodeId, zone) => {
    setRoute({ name: nodeId, cat, zone });
    speak(nodeId === 'learn' ? `Let's learn ${cat.name}!` : nodeId === 'quiz' ? `${cat.name} quiz! Ready?` : nodeId === 'activity' ? 'Play time!' : 'Treasure time!');
  };
  const backToWorld = () => { setComplete(null); setRoute({ name: 'world' }); };
  const quickPlay = (gameId) => {
    setShowSettings(false);
    const cat = CATEGORIES[0]; // animals as the universal demo deck
    if (gameId === 'paint') setRoute({ name: 'paint', cat, zone: 0 });
    else if (gameId === 'calm') setRoute({ name: 'activity', cat, zone: 0, autoGame: 'calm' });
    else setRoute({ name: 'activity', cat, zone: 0, autoGame: gameId });
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
      {route.name === 'world' && <World adv={adv} onPlay={play} onStory={() => { setRoute({ name: 'story' }); speak('Story time!'); }} muted={muted} setMuted={setMuted} speak={speak} onSettings={() => setShowSettings(true)} profile={profile} buddy={buddy} onProfiles={onProfiles} />}
      {route.name === 'story' && <StoryLand speak={speak} onExit={backToWorld} I={I} Star={Star} Burst={Burst} />}
      {route.name === 'paint' && <AdventurePaint pid={pid} onExit={() => (route.from === 'activity' ? setRoute({ name: 'activity', cat: route.cat, zone: route.zone }) : backToWorld())} speak={speak} announce={announce} Burst={Burst} I={I} Star={Star} />}
      {route.name === 'activity' && <ActivityHub cat={cat} zone={zone} theme={ZONE_THEMES[zone]} speak={speak}
        onExit={backToWorld} autoGame={route.autoGame} disabledGames={settings.disabled}
        onPaint={() => setRoute({ name: 'paint', cat, zone, from: 'activity' })}
        onRecord={(gameId, stars) => setZone(cat.id, { act: { ...((adv[cat.id] || {}).act || {}), [gameId]: stars } })}
        I={I} Star={Star} Burst={Burst} />}
      {route.name === 'learn' && <LearnLevel cat={cat} zone={zone} pid={pid} speak={speak} speaking={speaking}
        onExit={backToWorld}
        onComplete={(stars) => { setZone(cat.id, { learnStars: stars }); setComplete({ stars, title: 'Level complete!', sub: `You learned every ${cat.name.toLowerCase()} card!`, next: () => { setComplete(null); setRoute({ name: 'quiz', cat, zone }); }, nextLabel: 'Quiz time!' }); }} />}
      {route.name === 'quiz' && <QuizLevel cat={cat} zone={zone} speak={speak}
        onExit={backToWorld}
        onComplete={(stars, score, total) => { setZone(cat.id, { quizStars: Math.max(stars, (adv[cat.id] || {}).quizStars || 0) }); setComplete({ stars, title: stars >= 3 ? 'Perfect!' : stars === 2 ? 'Great job!' : 'Good try!', sub: `You got ${score} of ${total} right!`, retry: () => { setComplete(null); setRoute({ name: 'quiz', cat, zone: route.zone }); }, next: () => { setComplete(null); setRoute({ name: 'chest', cat, zone: route.zone }); }, nextLabel: 'Open treasure!' }); }} />}
      {route.name === 'chest' && <ChestLevel cat={cat} zone={zone} speak={speak}
        onExit={backToWorld}
        onComplete={(reward) => { setZone(cat.id, { chest: reward }); setComplete({ stars: 3, title: 'Zone complete!', sub: 'A new land is unlocked. Onward!', next: backToWorld, nextLabel: 'Back to the map' }); }} />}
      {complete && <Complete stars={complete.stars} title={complete.title} sub={complete.sub}
        onNext={complete.next} onRetry={complete.retry} nextLabel={complete.nextLabel} />}
      {showSettings && (
        <SettingsModal set={settings} update={updateSetting} onClose={() => setShowSettings(false)}
          onQuickPlay={quickPlay} onUnlockAll={unlockAll} onReset={resetAll} I={I} />
      )}
      <Caption />
      {/* eye-comfort colour filter — driven by html[data-tone]; backdrop-filter so
          it tints everything without disturbing layout or the fixed HUD */}
      <div className="tone-overlay" aria-hidden="true" />
    </BuddyContext.Provider>
  );
}
