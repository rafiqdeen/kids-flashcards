import { useState, useEffect } from 'react';
import { announce } from '../speech.js';

// >6h absence → cheering overlay + spoken greeting for ~4.2s.
// Comeback is celebrated; absence is never punished.
export function useWelcomeBack(speak) {
  const [back, setBack] = useState(false);
  useEffect(() => {
    let last;
    try {
      last = parseInt(localStorage.getItem('pip-last-visit') || '0', 10);
    } catch {
      last = 0;
    }
    const now = Date.now();
    let t0, t1, t2;
    if (last && now - last > 6 * 3600 * 1000) {
      t0 = setTimeout(() => setBack(true), 0);
      t1 = setTimeout(() => { speak('Welcome back! I missed you!'); announce('Welcome back!'); }, 700);
      t2 = setTimeout(() => setBack(false), 4200);
    }
    try {
      localStorage.setItem('pip-last-visit', String(now));
    } catch { /* private mode */ }
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    // boot-only check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return back;
}
