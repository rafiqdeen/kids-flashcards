// tv.js — resolves "TV mode" ONCE at boot and reflects it to <html data-tv="on">.
// TV mode turns on every D-pad / remote-operable behaviour app-wide (spatial focus,
// 10-foot layout, high-contrast focus rings, audio-on-first-OK, m4a-over-TTS). It is
// the single gate for all of that: when off, every TV hook early-returns to a no-op and
// no TV CSS applies, so the touch/mobile experience is byte-for-byte unchanged.
// Mirrors the data-motion / data-tone attribute pattern in useAdvSettings.js.
//
// Precedence (highest first):
//   1. window.__PIP_TV__       — injected by the native Android TV WebView wrapper
//   2. ?tv=1 / ?tv=0           — URL override (QA on any browser; ?tv=0 forces OFF)
//   3. localStorage 'pip-tv'   — persisted choice (survives an offline relaunch where
//                                the wrapper's start_url '/' carries no ?tv param)
//   4. UA / capability sniff   — weak last resort
const KEY = 'pip-tv';

function readStore() {
  try {
    const v = localStorage.getItem(KEY);
    return v === '1' ? true : v === '0' ? false : null;
  } catch { return null; }
}
function writeStore(on) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* private mode */ }
}

function uaHeuristic() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // Common smart-TV / set-top-box UA tokens.
  if (/\b(TV|BRAVIA|AFT[A-Z]|GoogleTV|Android ?TV|SMART-?TV|Web0S|WebOS|Tizen|HbbTV|NetCast|VIDAA)\b/i.test(ua)) return true;
  // Android + no fine pointer + large landscape screen is a reasonable TV signal.
  try {
    const noFinePointer = window.matchMedia && !window.matchMedia('(pointer: fine)').matches;
    const big = window.matchMedia && window.matchMedia('(min-width: 1280px)').matches;
    const landscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
    if (/Android/i.test(ua) && noFinePointer && big && landscape) return true;
  } catch { /* ignore */ }
  return false;
}

function resolve() {
  if (typeof window !== 'undefined' && window.__PIP_TV__ === true) return true;
  try {
    const p = new URLSearchParams(window.location.search).get('tv');
    if (p === '1' || p === 'true') return true;
    if (p === '0' || p === 'false') return false;
  } catch { /* ignore */ }
  const stored = readStore();
  if (stored !== null) return stored;
  return uaHeuristic();
}

let _on = resolve();

function reflect() {
  try {
    if (_on) document.documentElement.setAttribute('data-tv', 'on');
    else document.documentElement.removeAttribute('data-tv');
  } catch { /* no DOM */ }
}

// Side-effect on import: reflect + persist the resolved value so the next (possibly
// offline) relaunch resolves identically. The URL param and the Settings toggle always
// override the persisted value, so stickiness is safe.
reflect();
writeStore(_on);

export function isTvMode() { return _on; }

// Toggling reloads so every gated hook + CSS re-resolves cleanly from one source of truth.
export function setTvMode(on) {
  writeStore(!!on);
  try { window.location.reload(); }
  catch { _on = !!on; reflect(); }
}
