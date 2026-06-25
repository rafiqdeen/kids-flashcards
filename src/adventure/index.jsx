// index.jsx — AdventureApp root: profile routing wraps the inner App.
// Phases: welcome (no profiles) -> create -> picker (2+ profiles) -> main.
// Ported from adventure-app.jsx `AdventureApp`. The prototype's window.PIP_SPEAK
// global is replaced by a top-level useSpeech passed to the welcome screen.
import { useState } from 'react';
import { App } from './App.jsx';
import { WelcomeScreen, CreateProfile, ProfilePicker, ProfileSheet, ParentGate } from './screens/Profiles.jsx';
import { useSpeech } from './hooks/useSpeech.js';
import { loadProfiles, saveProfiles, getActiveId, setActiveId } from './data/profiles.js';
import { useBackButton } from './hooks/useBackButton.js';
import { useSpatialNav } from './hooks/useSpatialNav.js';

export function AdventureApp() {
  // Install the ONE global BACK handler + D-pad navigator here (always mounted), so they
  // cover the profile phases (welcome/picker) too, not just the inner App. No-op off TV.
  useBackButton();
  useSpatialNav();
  const { speak } = useSpeech(false); // welcome/profile-phase narration (settings not loaded yet)
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [activeId, setActiveIdState] = useState(() => {
    const list = loadProfiles(); const a = getActiveId();
    return (a && list.some((p) => p.id === a)) ? a : (list[0] ? list[0].id : null);
  });
  const [phase, setPhase] = useState(() => {
    const list = loadProfiles();
    return list.length === 0 ? 'welcome' : list.length > 1 ? 'picker' : 'main';
  });
  const [sheet, setSheet] = useState(false);
  const [gate, setGate] = useState(null);

  const commit = (list, aid) => { saveProfiles(list); setProfiles(list); if (aid) { setActiveId(aid); setActiveIdState(aid); } };
  const active = profiles.find((p) => p.id === activeId) || null;

  if (phase === 'welcome') return <WelcomeScreen speak={speak} onStart={() => setPhase('create')} />;
  if (phase === 'create')
    return <CreateProfile title={profiles.length ? 'New profile' : 'Make a profile'}
      onCancel={profiles.length ? () => setPhase(profiles.length > 1 ? 'picker' : 'main') : null}
      onSave={(p) => { try { const k = 'pip-adv-set-' + p.id; const cur = JSON.parse(localStorage.getItem(k)) || {}; localStorage.setItem(k, JSON.stringify({ ...cur, buddy: p.buddy })); } catch { /* private mode */ } commit([...profiles, p], p.id); setSheet(false); setPhase('main'); }} />;
  if (phase === 'picker')
    return <>
      <ProfilePicker profiles={profiles} onPick={(id) => { setActiveId(id); setActiveIdState(id); setPhase('main'); }} onAdd={() => setGate({ t: 'add' })} />
      {gate && <ParentGate onClose={() => setGate(null)} onPass={() => { setGate(null); setPhase('create'); }} />}
    </>;

  return (
    <>
      <App key={activeId} pid={activeId} profile={active} onProfiles={() => setSheet(true)}
        onBuddyChange={(b) => setProfiles((list) => { if (!list.some((p) => p.id === activeId && p.buddy !== b)) return list; const nl = list.map((p) => p.id === activeId ? { ...p, buddy: b } : p); saveProfiles(nl); return nl; })} />
      {sheet && <ProfileSheet profiles={profiles} activeId={activeId}
        onClose={() => setSheet(false)}
        onSwitch={(id) => { setActiveId(id); setActiveIdState(id); setSheet(false); }}
        onAdd={() => setGate({ t: 'add' })}
        onDelete={(id) => setGate({ t: 'del', id })} />}
      {gate && <ParentGate onClose={() => setGate(null)} onPass={() => {
        const g = gate; setGate(null);
        if (g.t === 'add') { setSheet(false); setPhase('create'); }
        else if (g.t === 'del') {
          const list = profiles.filter((p) => p.id !== g.id);
          try { localStorage.removeItem('pip-adv-prog-' + g.id); localStorage.removeItem('pip-adv-set-' + g.id); } catch { /* private mode */ }
          const aid = g.id === activeId ? list[0].id : activeId;
          commit(list, aid); setSheet(false);
        }
      }} />}
    </>
  );
}
