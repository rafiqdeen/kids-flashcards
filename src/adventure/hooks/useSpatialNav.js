// useSpatialNav — ONE global D-pad / arrow-key navigator for the whole app (TV mode only).
// Mounted once in App. It treats every visible, focusable [data-nav] element as part of a
// single focus space and moves focus to the nearest one in the pressed direction (geometry
// based, so it works for regular grids AND irregular layouts like the winding World nodes
// without hard-coded coordinates). Enter/Space activate; native <button>/<a> already do
// that, so we only synthesize a click for non-native focusables.
//
// Two zones are kept apart so the persistent bottom Dock doesn't hijack scrolling:
//   • content/HUD  — everything not inside .dock; arrows move among these by geometry.
//   • the Dock     — the persistent bottom nav. You HOP into it by pressing past an edge
//                    of the content (no candidate in that direction), and hop back out the
//                    same way. Inside the Dock, Left/Right move between tabs (wrapping).
// This guarantees the Dock (the only route to Play/Stories) is always one edge-press away
// from any screen, while Up/Down still scrolls through content normally.
//
// When a [role="dialog"] is open, navigation is scoped to it (modal isolation).
// useInitialFocus sets the landing focus when a screen/modal mounts.
import { useEffect } from 'react';
import { isTvMode } from '../tv.js';

const SEL = '[data-nav]';
const KEY_DIR = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

function isTyping(el) {
  const t = (el && el.tagName || '').toLowerCase();
  return t === 'input' || t === 'textarea' || (el && el.isContentEditable);
}
function isVisible(el) {
  return el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"]');
}
function focusable(el) {
  return el && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';
}
function inDock(el) { return !!(el && el.closest && el.closest('.dock')); }
function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
// Nearest item in `dir` from `curEl`, weighting cross-axis distance heavier than along-axis.
function pick(curEl, dir, els) {
  const c = center(curEl);
  let best = null, score = Infinity;
  for (const el of els) {
    if (el === curEl) continue;
    const t = center(el);
    const dx = t.x - c.x, dy = t.y - c.y;
    let along, cross;
    if (dir === 'left') { if (dx >= -2) continue; along = -dx; cross = Math.abs(dy); }
    else if (dir === 'right') { if (dx <= 2) continue; along = dx; cross = Math.abs(dy); }
    else if (dir === 'up') { if (dy >= -2) continue; along = -dy; cross = Math.abs(dx); }
    else { if (dy <= 2) continue; along = dy; cross = Math.abs(dx); }
    const s = along + cross * 2;
    if (s < score) { score = s; best = el; }
  }
  return best;
}

function allItems() {
  let els = Array.from(document.querySelectorAll(SEL)).filter((el) => isVisible(el) && focusable(el));
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).filter(isVisible);
  if (dialogs.length) {
    const top = dialogs[dialogs.length - 1];
    els = els.filter((el) => top.contains(el));
  }
  return els;
}
function contentDefault(els) {
  const content = els.filter((el) => !inDock(el));
  return content.find((e) => e.dataset.navDefault !== undefined)
    || content.find((e) => e.getAttribute('aria-current') === 'page' || e.getAttribute('aria-current') === 'true')
    || content[0] || els[0];
}
function focusInto(el) {
  if (!el) return;
  try { el.focus({ preventScroll: true }); } catch { el.focus(); }
  if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export function useSpatialNav() {
  useEffect(() => {
    if (!isTvMode()) return undefined;
    const onKey = (e) => {
      const active = document.activeElement;
      const dir = KEY_DIR[e.key];
      if (dir) {
        // In a text field, Left/Right move the caret; Up/Down still escape to nav.
        if (isTyping(active) && (dir === 'left' || dir === 'right')) return;
        const els = allItems();
        if (!els.length) return;
        e.preventDefault();
        const cur = els.includes(active) ? active : null;
        if (!cur) { focusInto(contentDefault(els)); return; }
        // Confine geometry to the current zone (Dock vs content) so the Dock can't grab
        // a downward press meant for the next content node.
        const zone = inDock(cur) ? els.filter(inDock) : els.filter((el) => !inDock(el));
        let next = pick(cur, dir, zone);
        if (!next && inDock(cur) && (dir === 'left' || dir === 'right')) {
          // wrap within the Dock row
          const tabs = els.filter(inDock);
          next = dir === 'right' ? tabs[0] : tabs[tabs.length - 1];
        }
        if (next) { focusInto(next); return; }
        // No candidate in this direction → hop between content and the Dock.
        if (inDock(cur)) focusInto(contentDefault(els));
        else {
          const dock = els.filter(inDock);
          const tab = dock.find((d) => d.getAttribute('aria-current')) || dock[0];
          focusInto(tab || cur);
        }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        if (active && active.matches && active.matches(SEL) && !isTyping(active)) {
          const tag = (active.tagName || '').toLowerCase();
          if (tag !== 'button' && tag !== 'a') { e.preventDefault(); active.click(); }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

// Land focus on a screen/modal's default [data-nav] when it mounts (TV only).
// Pass the screen root ref and a deps array (e.g. [navNonce] or [page]) to re-run.
export function useInitialFocus(ref, deps = []) {
  useEffect(() => {
    if (!isTvMode()) return;
    const node = ref.current;
    if (!node) return;
    const els = Array.from(node.querySelectorAll(SEL)).filter((el) => isVisible(el) && focusable(el));
    const target = els.find((e) => e.dataset.navDefault !== undefined)
      || els.find((e) => e.getAttribute('aria-current') === 'page' || e.getAttribute('aria-current') === 'true')
      || els[0];
    if (target) requestAnimationFrame(() => focusInto(target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
