// Speech + caption bus. One shared hook drives all TTS; every spoken line is
// mirrored to the global CaptionBar via announce().
import { useState, useEffect, useCallback } from 'react';

// Caption bus — broadcast spoken text so the global caption can show it.
export const announce = (text) =>
  window.dispatchEvent(new CustomEvent('pip-caption', { detail: text }));

export function useCaption() {
  const [cap, setCap] = useState('');
  useEffect(() => {
    let t;
    const h = (e) => {
      setCap(e.detail);
      clearTimeout(t);
      t = setTimeout(() => setCap(''), 2600);
    };
    window.addEventListener('pip-caption', h);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pip-caption', h);
    };
  }, []);
  return cap;
}

// Voices load async — warm the list once at boot.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {});
}

// disabled gates BOTH the kid mute toggle and the parent "voice" setting —
// callers pass `muted || !settings.voice`.
export function useSpeech(disabled, language = 'en-IN') {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    setAvailable(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback((text, opts = {}) => {
    if (disabled || !text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // prevent queue pileup from rapid taps
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 0.7;
      u.pitch = opts.pitch ?? 1.3;
      const vs = window.speechSynthesis.getVoices();
      const v = vs.find((x) => x.lang?.toLowerCase().startsWith(language.toLowerCase()))
        || vs.find((x) => /en/i.test(x.lang));
      if (v) u.voice = v;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
      // Chrome occasionally drops onend (and headless never fires it) —
      // poll the engine and clear the wave state when it actually stops.
      const guard = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setSpeaking(false);
          clearInterval(guard);
        }
      }, 500);
    } catch {
      // API present but broken — stay silent, captions still announce
    }
  }, [disabled, language]);

  return { speak, speaking, available };
}
