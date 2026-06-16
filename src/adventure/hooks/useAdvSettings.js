// useAdvSettings — per-profile settings persisted to pip-adv-set-<pid>, mirrored
// to ADV_SET, reflected to <html data-motion>, and driving the music loop.
// Ported from adventure-settings.jsx `useAdvSettings`.
import { useState, useEffect } from 'react';
import { syncAdvSet, setMusic } from '../audio.js';

const DEFAULTS = { voice: true, sfx: true, music: false, motion: true, difficulty: 'normal', buddy: 'pip', disabled: [], colorTone: 'normal' };
const loadSettings = (pid) => { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem('pip-adv-set-' + pid)) || {}) }; } catch { return { ...DEFAULTS }; } };

export function useAdvSettings(pid) {
  const [set, setSet] = useState(() => loadSettings(pid));
  useEffect(() => {
    try { localStorage.setItem('pip-adv-set-' + pid, JSON.stringify(set)); } catch { /* private mode */ }
    syncAdvSet(set);
    document.documentElement.setAttribute('data-motion', set.motion ? 'on' : 'off');
    document.documentElement.setAttribute('data-tone', set.colorTone || 'normal'); // eye-comfort colour filter
    setMusic(set.music);
  }, [set, pid]);
  useEffect(() => () => { setMusic(false); document.documentElement.setAttribute('data-tone', 'normal'); }, []);
  const update = (k, v) => setSet((s) => ({ ...s, [k]: v }));
  return [set, update, setSet];
}
