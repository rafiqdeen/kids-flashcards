import { useState, useEffect } from 'react';

// The reference prototype gates layout via `web` / `tablet` classes on the app
// root (sidebar shell ≥ web, 3-col grids on tablet). In production those frames
// become responsive breakpoints applied as the same classes so app.css works
// verbatim. Phone is the unmarked default.
const WEB_MIN = 900;
const TABLET_MIN = 768;

function deviceFor(width) {
  if (width >= WEB_MIN) return 'web';
  if (width >= TABLET_MIN) return 'tablet';
  return 'phone';
}

export function useViewport() {
  const [device, setDevice] = useState(() => deviceFor(window.innerWidth));

  useEffect(() => {
    const onResize = () => setDevice(deviceFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.classList.toggle('web', device === 'web');
    root.classList.toggle('tablet', device === 'tablet');
  }, [device]);

  return device;
}
