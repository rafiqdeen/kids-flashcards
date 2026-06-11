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

// CRITICAL: keep a live reference to in-flight utterances. Safari/Chrome
// garbage-collect a SpeechSynthesisUtterance with no retained JS reference,
// which fires onstart but produces NO audio (the "speaks but silent" bug).
// Holding the last few here keeps them alive until they finish.
const _keepAlive = [];

// Warm the voice list — getVoices() is empty until 'voiceschanged' on Chrome.
let _voicesWarmed = false;
function warmVoices() {
  if (_voicesWarmed || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  _voicesWarmed = true;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    window.speechSynthesis.getVoices();
  });
}
warmVoices();

function pickVoice(language) {
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null;
  const want = language.toLowerCase();
  const matchLang = (v) => v.lang && v.lang.toLowerCase().startsWith(want);
  const isEn = (v) => /^en/i.test(v.lang || '');

  // macOS/Chrome LIST en-IN voices (e.g. "Rishi") that are usually NOT
  // downloaded: they report localService=true and fire onstart but emit NO
  // audio. For en-IN, prefer the guaranteed-audible OS-default English voice so
  // sound actually plays. (en-IN remains selectable; if a real en-IN voice is
  // installed it still wins for the en-US/en-GB paths below.)
  if (want.startsWith('en-in')) {
    const audible =
      vs.find((v) => v.default && isEn(v) && v.localService) ||
      vs.find((v) => v.default && isEn(v)) ||
      vs.find((v) => isEn(v) && v.localService && !/rishi|veena|lekha/i.test(v.name));
    if (audible) return audible;
  }

  // Prefer offline (localService) voices — remote/enhanced OS voices can report
  // speaking=true while emitting no audio. Honor the requested language, then
  // fall back to the OS default voice (guaranteed to vocalize).
  return (
    vs.find((v) => matchLang(v) && v.localService) ||
    vs.find((v) => isEn(v) && v.localService) ||
    vs.find((v) => v.default && v.localService) ||
    vs.find((v) => v.default) ||
    vs.find(matchLang) ||
    vs.find(isEn) ||
    vs.find((v) => v.localService) ||
    vs[0] || null
  );
}

// disabled gates BOTH the kid mute toggle and the parent "voice" setting —
// callers pass `muted || !settings.voice`.
export function useSpeech(disabled, language = 'en-IN') {
  const [speaking, setSpeaking] = useState(false);
  const available = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => { warmVoices(); }, []);

  const speak = useCallback((text, opts = {}) => {
    if (disabled || !text || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    try {
      // only cancel when something is actually queued/playing — an unconditional
      // cancel() right before speak() can suppress the new utterance in Safari
      if (synth.speaking || synth.pending) synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 0.7;
      u.pitch = opts.pitch ?? 1.3;
      const v = pickVoice(language);
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = language; }

      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); release(u); };
      u.onerror = () => { setSpeaking(false); release(u); };

      // retain so the utterance isn't GC'd mid-speech (Safari/Chrome silent bug)
      _keepAlive.push(u);
      if (_keepAlive.length > 8) _keepAlive.shift();

      synth.speak(u);
      synth.resume(); // Chrome can leave synthesis paused → silent; unpause it

      // Chrome occasionally drops onend (headless never fires it) — poll the
      // engine and clear the wave state when it actually stops.
      const guard = setInterval(() => {
        if (!synth.speaking) {
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

function release(u) {
  const i = _keepAlive.indexOf(u);
  if (i >= 0) _keepAlive.splice(i, 1);
}
