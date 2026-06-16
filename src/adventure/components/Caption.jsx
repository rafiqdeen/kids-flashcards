// Caption.jsx — the global spoken-text caption. Listens on the bus and shows
// the line for 2.4s. announce() lives in ../bus.js. Ported from adventure-app.jsx.
import { useState, useEffect } from 'react';
import { I } from '../art/icons.jsx';

let capT;
export function Caption() {
  const [t, setT] = useState('');
  useEffect(() => {
    const h = (e) => { setT(e.detail); clearTimeout(capT); capT = setTimeout(() => setT(''), 2400); };
    window.addEventListener('adv-cap', h); return () => window.removeEventListener('adv-cap', h);
  }, []);
  return t ? <div className="cap2" role="status" aria-live="polite"><I n="sound" s={17} />{t}</div> : null;
}
