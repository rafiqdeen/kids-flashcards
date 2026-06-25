// useBackButton — ONE unified BACK gesture for the whole app (TV mode only).
//
// Screens and modals register a "dismiss" function on mount via useBackHandler. The most
// recently registered handler wins (LIFO), so a BACK press naturally peels off the
// topmost layer first: Complete  >  Settings  >  Profile sheet  >  sub-screen→World  >
// World root (no handler → let the platform exit). This replaces the per-screen Escape
// listeners that used to live in each screen, giving one predictable ordering.
//
// A BACK gesture arrives from any of:
//   - keyboard Escape (always) / Backspace (only when NOT typing in a field)
//   - the Android TV hardware BACK button, forwarded by the native wrapper as either a
//     `popstate` (history sentinel) or a `tvback` CustomEvent
//
// Everything here is gated on TV mode so the touch/mobile build is byte-for-byte unchanged.
import { useEffect, useRef } from 'react';
import { isTvMode } from '../tv.js';

const stack = []; // dismiss handlers; last entry = topmost layer

function runTop() {
  const fn = stack[stack.length - 1];
  if (fn) { fn(); return true; }
  return false; // nothing to dismiss
}

function isTyping(el) {
  if (!el) return false;
  const tag = (el.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

// Register a dismiss handler for as long as the calling component is mounted.
// `fn` may be re-created each render — we always invoke the latest via a ref, and the
// stack entry identity stays stable so LIFO ordering reflects mount order, not renders.
export function useBackHandler(fn, enabled = true) {
  const active = enabled && isTvMode();
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }); // keep latest without re-registering the entry
  useEffect(() => {
    if (!active) return undefined;
    const entry = () => { if (typeof ref.current === 'function') ref.current(); };
    stack.push(entry);
    return () => { const i = stack.lastIndexOf(entry); if (i >= 0) stack.splice(i, 1); };
  }, [active]);
}

// Mounted ONCE (in App) to install the listeners. No-op off TV.
export function useBackButton() {
  useEffect(() => {
    if (!isTvMode()) return undefined;
    // Arm a history sentinel so the WebView hardware BACK produces a popstate we catch
    // instead of immediately exiting the app.
    let armed = false;
    const arm = () => { try { window.history.pushState({ pipBack: true }, ''); armed = true; } catch { /* ignore */ } };
    arm();

    const onPop = () => {
      const consumed = runTop();
      // Re-arm so the NEXT hardware BACK is also caught — until the stack is empty, when
      // the following BACK is allowed to pop for real (exit to launcher / previous page).
      if (consumed) arm(); else armed = false;
    };
    const onKey = (e) => {
      if (e.key === 'Escape' || (e.key === 'Backspace' && !isTyping(e.target))) {
        if (runTop()) { e.preventDefault(); e.stopPropagation(); }
      }
    };
    const onTvBack = () => { runTop(); };

    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey, true); // capture: beat per-screen listeners
    window.addEventListener('tvback', onTvBack);
    // Bridge for the native Android TV wrapper: on hardware BACK it queries canGoBack()
    // and either pops one layer (back()) or finishes the activity when we're at the root.
    window.__pipBack = { canGoBack: () => stack.length > 0, back: () => runTop() };
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('tvback', onTvBack);
      delete window.__pipBack;
      if (armed) { try { window.history.back(); } catch { /* ignore */ } }
    };
  }, []);
}
