// audio.js — the Adventure WebAudio engine (SFX + soft music loop) and the
// ADV_SET runtime mirror. Ported verbatim from adventure-settings.jsx
// (window.advSfx / window.ADV_SET). useAdvSettings keeps ADV_SET in sync so
// non-React readers (advSfx gate, quiz difficulty) see the active settings.
export const ADV_SET = { voice: true, sfx: true, music: false, motion: true, difficulty: 'normal', buddy: 'pip', disabled: [] };
export function syncAdvSet(settings) { Object.assign(ADV_SET, settings); }

let actx = null;
const ctx = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; } catch { return null; } };
function tone(freq, t0, dur, type = 'sine', vol = 0.12) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
}

export const advSfx = (name) => {
  if (!ADV_SET || !ADV_SET.sfx) return;
  if (name === 'tap') tone(520, 0, 0.08, 'triangle', 0.08);
  else if (name === 'yes') { tone(660, 0, 0.12, 'triangle'); tone(880, 0.1, 0.18, 'triangle'); }
  else if (name === 'no') tone(220, 0, 0.2, 'sine', 0.09);
  else if (name === 'win') { tone(523, 0, 0.14, 'triangle'); tone(659, 0.12, 0.14, 'triangle'); tone(784, 0.24, 0.26, 'triangle'); }
  else if (name === 'chest') { tone(392, 0, 0.12, 'triangle'); tone(523, 0.1, 0.12, 'triangle'); tone(659, 0.2, 0.12, 'triangle'); tone(1047, 0.32, 0.4, 'triangle', 0.1); }
  else if (name === 'pop') tone(900, 0, 0.06, 'square', 0.05);
};

// music: soft alternating pad
let musicTimer = null;
export function setMusic(on) {
  clearInterval(musicTimer); musicTimer = null;
  if (!on) return;
  const NOTES = [262, 330, 392, 330, 294, 392, 349, 294];
  let i = 0;
  const step = () => { tone(NOTES[i % NOTES.length], 0, 1.6, 'sine', 0.035); tone(NOTES[i % NOTES.length] / 2, 0, 1.8, 'sine', 0.03); i++; };
  step(); musicTimer = setInterval(step, 1700);
}
