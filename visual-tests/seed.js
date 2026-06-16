// seed.js — injected into every page (ref + impl) before any app code runs, so
// confetti/quiz-shuffle/gate-RNG are identical across both and don't add diff
// noise. Deterministic Math.random (mulberry32) + frozen Date.now. Captures
// also run with prefers-reduced-motion:reduce, which collapses looping/entrance
// animations to a stable end-state (and disables the confetti Burst entirely).
(() => {
  let s = 0x2f6e2b1 >>> 0;
  Math.random = function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const FIXED = 1718200000000; // frozen epoch (only feeds profile id generation)
  try { Date.now = () => FIXED; } catch { /* ignore */ }
})();
