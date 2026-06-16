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

// Last spoken line + timestamp, to drop a burst of identical speak() calls that
// would otherwise cancel each other before any of them can start (see speak()).
let _lastText = '';
let _lastSpeakAt = 0;

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

// On the very first user gesture, clear any stuck/queued utterance and unpause
// the engine. NOTE: do NOT speak a blank "unlock" utterance here — a whitespace
// utterance can HANG in Chrome (onstart/onend never fire), pinning speaking=true
// forever and silencing every real line behind it. Listeners run in the capture
// phase so this settles before the app's own click→speak in the same gesture.
let _primed = false;
function primeSpeech() {
  if (_primed || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  _primed = true;
  try {
    const ss = window.speechSynthesis;
    ss.cancel();
    ss.resume();
  } catch { /* engine present but uncooperative — real speaks still try below */ }
}
function installSpeechPrimer() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const events = ['pointerdown', 'touchstart', 'keydown', 'mousedown'];
  const handler = () => {
    warmVoices();
    primeSpeech();
    events.forEach((ev) => window.removeEventListener(ev, handler, true));
  };
  events.forEach((ev) => window.addEventListener(ev, handler, true));
}
installSpeechPrimer();

// macOS lists ~20 "novelty" en-US voices (Albert, Bad News, Bubbles, Zarvox…)
// AND multilingual fun voices (Eddy/Flo/Grandma/Grandpa/Reed/Rocko/Sandy/Shelley)
// that sound broken/robotic for narration — never pick these.
const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;
// "Enhanced"/"Premium"/Siri/neural variants are downloaded separately on macOS
// and sound near-human — always prefer them over the robotic compact voices.
const ENHANCED = /\((enhanced|premium)\)|\bsiri\b|neural|natural/i;
// The chosen narration voice: Tara, female Indian-English (an Enhanced variant
// wins automatically once the user installs it).
const PREFERRED = /\btara\b/i;
// Other Indian-English voices to fall back to before leaving the accent.
const INDIAN = /\b(tara|aman|rishi|veena|lekha|isha|priya|neel)\b/i;
// high-quality natural voices across Apple / Chrome / Edge (last-resort, non-IN).
const GOOD = /\b(samantha|alex|allison|ava|susan|tom|nicky|aaron|daniel|karen|moira|tessa|fiona|serena|arthur|martha)\b|google (us|uk) english|microsoft (zira|david|mark|aria|guy|jenny)/i;

export function pickVoice(language) {
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null;
  const want = (language || 'en-IN').toLowerCase();
  const isEn = (v) => /^en/i.test(v.lang || '');
  const matchLang = (v) => (v.lang || '').toLowerCase().startsWith(want);
  const usable = (v) => !NOVELTY.test(v.name || '');

  // Order favours the chosen Indian-English voice (Tara) and the natural-quality
  // (Enhanced/Premium) variants, then any Indian-English accent, then a known-good
  // natural English voice, then progressively looser fallbacks so something
  // audible is always returned.
  return (
    vs.find((v) => PREFERRED.test(v.name || '') && ENHANCED.test(v.name || '')) ||
    vs.find((v) => PREFERRED.test(v.name || '')) ||
    vs.find((v) => matchLang(v) && ENHANCED.test(v.name || '')) ||
    vs.find((v) => matchLang(v) && usable(v)) ||
    vs.find((v) => INDIAN.test(v.name || '') && usable(v)) ||
    vs.find((v) => isEn(v) && ENHANCED.test(v.name || '')) ||
    vs.find((v) => GOOD.test(v.name || '') && isEn(v)) ||
    vs.find((v) => isEn(v) && v.localService && usable(v)) ||
    vs.find((v) => isEn(v) && usable(v)) ||
    vs.find((v) => v.localService && usable(v)) ||
    vs.find(usable) ||
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
    // De-dupe a burst of identical calls (rapid taps, re-renders): firing speak()
    // again before the previous utterance has even started makes Chrome cancel
    // BOTH and play NEITHER — the "canceled, never starts" loop.
    const now = Date.now();
    if (text === _lastText && now - _lastSpeakAt < 350) return;
    _lastText = text; _lastSpeakAt = now;

    const synth = window.speechSynthesis;
    try {
      // a backgrounded/idle Chrome tab can leave the engine paused → every later
      // utterance is queued but silent. Resume before we touch the queue.
      if (synth.paused) synth.resume();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 0.9;
      u.pitch = opts.pitch ?? 1.0;
      const v = pickVoice(language);
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = language; }

      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); release(u); };
      u.onerror = () => { setSpeaking(false); release(u); };

      // retain so the utterance isn't GC'd mid-speech (Safari/Chrome silent bug)
      _keepAlive.push(u);
      if (_keepAlive.length > 8) _keepAlive.shift();

      const fire = () => {
        try { synth.speak(u); synth.resume(); } catch { /* ignore */ }
      };
      // CRITICAL Chrome bug: an utterance spoken in the SAME tick as cancel() is
      // silently dropped (onstart never fires). When something is already
      // playing, cancel and then speak on a FRESH macrotask so the new line
      // actually starts. This is why flipping a card mid-narration was silent.
      if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(fire, 110); }
      else fire();

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
