// useSpeech — Adventure TTS. The app's core narration is pre-baked as audio with
// the macOS female-Indian voice "Tara" (scripts/gen-narration.mjs → public/
// narration/, NARRATION manifest) because Chrome won't expose Tara to the live
// Web Speech API. When a line has a bundled clip we play it (realistic female
// Indian, fully offline); otherwise we fall back to the live Web Speech voice
// (src/pip/speech.js → Rishi/en-IN). Every line is mirrored to the caption bus.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeech as useHardenedSpeech } from '../../pip/speech.js';
import { announce } from '../bus.js';
import { NARRATION } from '../data/narrationManifest.js';
import { narrationKey } from '../data/narrationKey.js';
import { isTvMode } from '../tv.js';

// Rough narration duration (seconds) for the live-speech path or when clip
// metadata is missing — mirrors the generator's cadence (~150 wpm + a beat per
// sentence). Used to pace the motion comic when there's no real <audio> timeline.
function estimateDuration(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const breaks = (text.match(/[.!?]/g) || []).length;
  return Math.min(Math.max(words / 2.5 + breaks * 0.45 + 0.3, 1.2), 12); // 150 wpm = 2.5 w/s
}

export function useSpeech(disabled) {
  const { speak: rawSpeak, speaking: liveSpeaking } = useHardenedSpeech(disabled, 'en-IN');
  const [clipPlaying, setClipPlaying] = useState(false);
  const audioRef = useRef(null);
  const liveTimer = useRef(null);
  const lastRef = useRef({ text: '', t: 0 });

  const stopClip = useCallback(() => {
    clearTimeout(liveTimer.current); liveTimer.current = null;
    const a = audioRef.current;
    if (a) { a.onended = a.onerror = a.onloadedmetadata = a.ontimeupdate = null; try { a.pause(); } catch { /* ignore */ } audioRef.current = null; }
    setClipPlaying(false);
  }, []);

  // Optional opts { onStart({duration}), onProgress(0..1), onDone() } let the motion
  // comic time camera/beats to narration. All optional — callers that pass only
  // text behave exactly as before.
  const speak = useCallback((text, opts) => {
    const cb = opts || {};
    if (!text) { cb.onDone?.(); return; }
    announce(text);                 // caption shows even when muted
    if (disabled) {                 // muted: no audio, but still pace the motion
      stopClip(); const d = estimateDuration(text); cb.onStart?.({ duration: d });
      if (cb.onDone) liveTimer.current = setTimeout(cb.onDone, d * 1000);
      return;
    }
    // de-dupe a burst of identical calls (rapid taps / re-renders)
    const now = Date.now();
    if (text === lastRef.current.text && now - lastRef.current.t < 350) return;
    lastRef.current = { text, t: now };

    const live = (t) => {           // live Web-Speech voice (no real timeline → estimate)
      stopClip();
      // On TV (Android WebView) speechSynthesis voices are unreliable/absent and can
      // hang silently — prefer the bundled m4a clips and go caption-only for the few
      // dynamic lines that have no clip, rather than waiting on a voice that won't load.
      if (!isTvMode()) rawSpeak(t, { rate: 0.9, pitch: 1.0 });
      const d = estimateDuration(t); cb.onStart?.({ duration: d });
      if (cb.onDone) liveTimer.current = setTimeout(cb.onDone, d * 1000);
    };

    const clip = NARRATION[narrationKey(text)];
    if (clip) {
      stopClip();
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } // silence any live line
      const a = new Audio(clip);
      audioRef.current = a;
      setClipPlaying(true);
      const done = () => { if (audioRef.current === a) { audioRef.current = null; setClipPlaying(false); } cb.onDone?.(); };
      a.onloadedmetadata = () => { if (audioRef.current === a) cb.onStart?.({ duration: Number.isFinite(a.duration) && a.duration > 0 ? a.duration : estimateDuration(text) }); };
      if (cb.onProgress) a.ontimeupdate = () => { if (audioRef.current === a && Number.isFinite(a.duration) && a.duration > 0) cb.onProgress(Math.min(1, a.currentTime / a.duration)); };
      a.onended = done;
      a.onerror = () => { if (audioRef.current === a) { audioRef.current = null; setClipPlaying(false); } live(text); }; // clip unplayable → live
      a.play().catch(() => { if (audioRef.current === a) { audioRef.current = null; setClipPlaying(false); } live(text); });
      return;
    }
    live(text);                     // no clip for this (dynamic / rare) line
  }, [disabled, rawSpeak, stopClip]);

  // stopClip() syncs with the <audio> element (an external system) and clears the
  // speaking flag — a legitimate effect; the strict react-hooks@7 advisory misfires.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (disabled) stopClip(); }, [disabled, stopClip]); // mute → stop clip
  useEffect(() => () => stopClip(), [stopClip]);                        // unmount → stop clip

  return { speak, speaking: liveSpeaking || clipPlaying };
}
