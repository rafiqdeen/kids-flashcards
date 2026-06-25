// useFocusTrap — keep keyboard/D-pad focus inside a modal while it's open, set initial
// focus, and restore focus to wherever it was when the modal closes. BACK/Escape closes
// the modal via useBackHandler; pass NO onClose to make BACK inert (e.g. the celebratory
// Complete overlay, which the child must act on rather than dismiss with BACK).
//
// Arrow-key movement inside a modal is handled by useSpatialNav (used alongside this);
// this hook only owns the Tab cycle, initial focus, restore, and the BACK→onClose wiring.
// No-op when TV mode is off.
import { useEffect } from 'react';
import { isTvMode } from '../tv.js';
import { useBackHandler } from './useBackButton.js';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visible(node) {
  return Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
}

export function useFocusTrap(ref, { onClose, initialFocus, enabled = true } = {}) {
  const active = enabled && isTvMode();

  // BACK closes the modal. Omitting onClose registers a no-op so BACK can't escape past it.
  useBackHandler(() => { if (onClose) onClose(); }, active);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return undefined;
    const prev = document.activeElement;

    const resolveInitial = () => {
      const cand = typeof initialFocus === 'function' ? initialFocus() : initialFocus;
      const el = cand && cand.current !== undefined ? cand.current : cand; // accept a ref
      // Fall back to an explicit [data-nav-default] (e.g. Complete's "Next") before the
      // first DOM-order focusable (which would be "Retry").
      return el || node.querySelector('[data-nav-default]') || visible(node)[0];
    };
    const target = resolveInitial();
    if (target) requestAnimationFrame(() => { try { target.focus(); } catch { /* ignore */ } });

    const onKey = (e) => {
      if (e.key === 'Tab') {
        const f = visible(node);
        if (!f.length) return;
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      } else if (e.key.startsWith('Arrow') && !node.contains(document.activeElement)) {
        // focus somehow escaped the modal — pull it back in
        const f = visible(node);
        if (f.length) { e.preventDefault(); f[0].focus(); }
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      if (prev && prev.focus) { try { prev.focus(); } catch { /* ignore */ } }
    };
  }, [active, ref, onClose, initialFocus]);
}
