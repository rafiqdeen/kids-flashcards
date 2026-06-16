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

export function useSpeech(disabled) {
  const { speak: rawSpeak, speaking: liveSpeaking } = useHardenedSpeech(disabled, 'en-IN');
  const [clipPlaying, setClipPlaying] = useState(false);
  const audioRef = useRef(null);
  const lastRef = useRef({ text: '', t: 0 });

  const stopClip = useCallback(() => {
    const a = audioRef.current;
    if (a) { a.onended = null; a.onerror = null; try { a.pause(); } catch { /* ignore */ } audioRef.current = null; }
    setClipPlaying(false);
  }, []);

  const speak = useCallback((text) => {
    if (!text) return;
    announce(text);                 // caption shows even when muted
    if (disabled) { stopClip(); return; }
    // de-dupe a burst of identical calls (rapid taps / re-renders)
    const now = Date.now();
    if (text === lastRef.current.text && now - lastRef.current.t < 350) return;
    lastRef.current = { text, t: now };

    const clip = NARRATION[narrationKey(text)];
    if (clip) {
      stopClip();
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } // silence any live line
      const a = new Audio(clip);
      audioRef.current = a;
      setClipPlaying(true);
      const done = () => { if (audioRef.current === a) { audioRef.current = null; setClipPlaying(false); } };
      a.onended = done;
      a.onerror = () => { done(); rawSpeak(text, { rate: 0.9, pitch: 1.0 }); }; // clip unplayable → live
      a.play().catch(() => { done(); rawSpeak(text, { rate: 0.9, pitch: 1.0 }); });
      return;
    }
    // no clip for this (dynamic / rare) line → live Web Speech voice
    stopClip();
    rawSpeak(text, { rate: 0.9, pitch: 1.0 });
  }, [disabled, rawSpeak, stopClip]);

  // stopClip() syncs with the <audio> element (an external system) and clears the
  // speaking flag — a legitimate effect; the strict react-hooks@7 advisory misfires.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (disabled) stopClip(); }, [disabled, stopClip]); // mute → stop clip
  useEffect(() => () => stopClip(), [stopClip]);                        // unmount → stop clip

  return { speak, speaking: liveSpeaking || clipPlaying };
}
