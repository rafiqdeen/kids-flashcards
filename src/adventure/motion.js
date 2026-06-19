// motion.js — one source of truth for the app's motion tiers. Used by the motion
// comic (camera/parallax/beats), Burst, and any effect that should respect the
// child's/parent's motion preferences.
//
//   full   — everything: camera pan/zoom, parallax, timed pops, confetti bursts.
//   gentle — the in-app "Big animations" toggle is OFF: KEEP the slow cinematic
//            camera + parallax (they're calm and aid engagement), but DROP the
//            busy/flashy layer (confetti, bouncy pops, fast ambient loops).
//   static — the OS "Reduce Motion" accessibility setting is on: NO camera /
//            parallax / pops at all (those are the vestibular triggers) — just
//            still panels + voice + captions. This is a hard override and is also
//            what makes the reduced-motion screenshot tests deterministic.
import { ADV_SET } from './audio.js';

export function motionLevel() {
  if (typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static';
  if (!ADV_SET.motion) return 'gentle';
  return 'full';
}

// True when the BIG, attention-grabbing motion (confetti, bouncy pops) should be
// suppressed — i.e. anything that isn't the calm camera/parallax layer.
export const prefersCalm = () => motionLevel() !== 'full';
// True only for the OS accessibility setting — everything motion must be off.
export const prefersStatic = () => motionLevel() === 'static';
