import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pip-settings';

// README "State Management" schema keys + UI prefs (theme/direction/mascot)
// persisted alongside them — additive, recorded in PROGRESS.md decisions.
const DEFAULTS = {
  sound: true,
  music: false,
  voice: true,
  motion: true,
  // en-US is the reliably-audible default voice on macOS/Chrome/Windows; en-IN
  // (and others) remain selectable in the parent voice picker. en-IN OS voices
  // are often listed but not downloaded → silent, so it's not the default.
  language: 'en-US',
  difficulty: 'normal',
  limit: true,
  theme: 'light',
  direction: 'clay',
  mascot: 'pip',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      // One-time: the previous hard-coded en-IN default routes to an OS voice
      // (e.g. "Rishi") that's often listed-but-not-downloaded → silent. Move
      // that legacy default to the audible en-US once; the user can re-pick
      // en-IN afterward and it sticks (guarded by _langFix).
      if (stored.language === 'en-IN' && !stored._langFix) {
        stored.language = 'en-US';
      }
      stored._langFix = true;
      return { ...DEFAULTS, ...stored };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // private mode / quota — settings stay in-memory
    }
  }, [settings]);

  // Theme + direction live as attributes on the app root; all styling is CSS-var
  // driven off them. Components never branch on these in JS.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.classList.add('app-root');
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-direction', settings.direction);
    // parent "Big animations" toggle — off mirrors prefers-reduced-motion
    root.setAttribute('data-motion', settings.motion ? 'on' : 'off');
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', settings.theme === 'dark' ? '#241a13' : '#fff3e2');
  }, [settings.theme, settings.direction, settings.motion]);

  const setSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  return { settings, setSetting };
}
