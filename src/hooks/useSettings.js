import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pip-settings';

// README "State Management" schema keys + UI prefs (theme/direction/mascot)
// persisted alongside them — additive, recorded in PROGRESS.md decisions.
const DEFAULTS = {
  sound: true,
  music: false,
  voice: true,
  motion: true,
  language: 'en-IN',
  difficulty: 'normal',
  limit: true,
  theme: 'light',
  direction: 'clay',
  mascot: 'pip',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
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
