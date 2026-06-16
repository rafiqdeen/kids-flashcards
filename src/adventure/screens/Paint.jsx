// Paint.jsx — the Paint Studio (Adventure-styled). Brush styles (marker /
// rainbow / spray / sparkle), true flood-fill respecting template outlines,
// eraser, stamps, ~12 colors, 3 sizes, 10 doodle templates, 10-deep undo,
// confirm-clear, and "I'm done!" -> saved to the gallery. Ported verbatim from
// adventure-paint.jsx, with the documented per-profile key fix applied:
// doodles  -> pip-adv-doodle-<pid>-<t>  · gallery -> pip-adv-gallery-<pid>
// (so paintings are NOT shared across profiles and "Reset all progress" — which
// clears those keys in App.jsx resetAll — actually wipes them).
import { useRef, useEffect, useState } from 'react';
import { HeroMascot } from '../art/Mascot.jsx';

const RES = 1000;

const COLORS = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' }, { name: 'Yellow', hex: '#fbbf24' },
  { name: 'Green', hex: '#22c55e' }, { name: 'Sky blue', hex: '#38bdf8' }, { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' }, { name: 'Brown', hex: '#92400e' },
  { name: 'Black', hex: '#1c1917' }, { name: 'White', hex: '#ffffff' },
];
const SIZES = [{ id: 's', w: 14, dot: 10 }, { id: 'm', w: 30, dot: 16 }, { id: 'l', w: 56, dot: 24 }];
const OUTLINE = {
  cat: 'M30 24 L24 6 L46 22 M70 24 L76 6 L54 22 M50 30 m-30 8 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 M40 50 h0 M60 50 h0 M50 56 l-5 5 5 3 5 -3Z M20 60 h-12 M20 66 h-12 M80 60 h12 M80 66 h12',
  apple: 'M50 28 q3 -12 16 -13 M50 30 C28 22 15 42 23 62 c6 18 19 26 27 26 s21 -8 27 -26 c8 -20 -7 -40 -27 -32Z M66 22 q14 -6 16 6 q-12 4 -16 -6Z',
  star: 'M50 10 l11 26 28 2 -21 18 7 27 -25 -15 -25 15 7 -27 -21 -18 28 -2Z',
  sun: 'M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 M50 18 v-12 M50 94 v-12 M18 50 h-12 M94 50 h-12 M27 27 l-8 -8 M81 81 l-8 -8 M73 27 l8 -8 M19 81 l8 -8',
  fish: 'M66 50 L92 32 q5 18 0 36Z M14 50 q0 -24 28 -24 q26 0 26 24 q0 24 -26 24 q-28 0 -28 -24Z M30 44 h0 M44 70 q14 -8 14 -20 q0 -12 -14 -20',
  flower: 'M50 50 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M50 41 q-14 -16 0 -26 q14 10 0 26 M59 50 q16 -14 26 0 q-10 14 -26 0 M50 59 q14 16 0 26 q-14 -10 0 -26 M41 50 q-16 14 -26 0 q10 -14 26 0 M50 76 v18',
  house: 'M18 50 L50 20 L82 50 M26 46 v36 h48 v-36 M44 82 v-22 h12 v22 M60 56 h12 v12 h-12Z M50 20 v-8 h8 v8',
  rocket: 'M50 8 q15 13 15 36 q0 15 -7 26 h-16 q-7 -11 -7 -26 q0 -23 15 -36Z M50 36 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M42 70 l-12 16 l14 -5 M58 70 l12 16 l-14 -5 M46 84 q4 8 8 0',
  icecream: 'M34 46 h32 l-16 44Z M34 46 a16 16 0 0 1 32 0 M38 34 a12 12 0 0 1 24 0',
};
const TEMPLATES = [
  { id: 'blank', label: 'Blank' }, { id: 'cat', label: 'Cat' }, { id: 'apple', label: 'Apple' },
  { id: 'star', label: 'Star' }, { id: 'sun', label: 'Sun' }, { id: 'fish', label: 'Fish' },
  { id: 'flower', label: 'Flower' }, { id: 'house', label: 'House' }, { id: 'rocket', label: 'Rocket' },
  { id: 'icecream', label: 'Ice cream' },
];
const BRUSH_TYPES = [
  { id: 'marker', label: 'Marker' }, { id: 'rainbow', label: 'Rainbow' },
  { id: 'spray', label: 'Spray' }, { id: 'sparkle', label: 'Sparkle' },
];
const STAMPS = [{ id: 'star', label: 'Star' }, { id: 'heart', label: 'Heart' }, { id: 'smile', label: 'Smiley' }];

function hexRgb(h) { h = h.replace('#', ''); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }; }
function dStar(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * .45 : r, a = rot + i * Math.PI / 5 - Math.PI / 2;
    i ? ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)) : ctx.moveTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  ctx.closePath(); ctx.fill();
}
function dHeart(ctx, x, y, r) {
  ctx.beginPath(); ctx.moveTo(x, y + r * .9);
  ctx.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .7, y - r, x, y - r * .35);
  ctx.bezierCurveTo(x + r * .7, y - r, x + r * 1.4, y - r * .1, x, y + r * .9);
  ctx.closePath(); ctx.fill();
}
function dSmile(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const o = ctx.fillStyle; ctx.fillStyle = '#fffdf9';
  ctx.beginPath(); ctx.arc(x - r * .35, y - r * .2, r * .13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * .35, y - r * .2, r * .13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fffdf9'; ctx.lineWidth = r * .12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y + r * .1, r * .45, Math.PI * .15, Math.PI * .85); ctx.stroke();
  ctx.fillStyle = o;
}
const STAMP_FN = { star: (c, x, y, r) => dStar(c, x, y, r, Math.random() * Math.PI), heart: dHeart, smile: dSmile };

// Tool cursors — each is a tiny SVG glyph of the actual tool, so a child sees a
// paintbrush / bucket / stamp / eraser following their hand instead of a generic
// arrow. The colour-using tools tint their tip to the chosen colour. The hotspot
// (the two trailing numbers) is the exact pixel where the tool "touches" paint.

// Paintbrush — bristle tip tinted to colour; hotspot (2,28) on the tip.
const brushCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">`
    + `<line x1="28" y1="4" x2="15" y2="17" stroke="#b9742e" stroke-width="5" stroke-linecap="round"/>`
    + `<rect x="11.5" y="14.5" width="6" height="4.5" rx="1" transform="rotate(45 14.5 16.7)" fill="#d4d8de" stroke="#9aa0a8" stroke-width="0.8"/>`
    + `<path d="M13 17 L17 21 L6 27 Q3 29 2 28 Q3 25 6 22 Z" fill="${col}" stroke="rgba(0,0,0,0.45)" stroke-width="0.8" stroke-linejoin="round"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 2 28, crosshair`;
};

// Magic fill — a tipped paint bucket pouring a splash of the chosen colour;
// hotspot (5,26) sits on the poured paint where the flood begins.
const fillCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">`
    + `<path d="M13 5 L25 9 L22 21 L10 17 Z" fill="#d4d8de" stroke="#9aa0a8" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="M13 5 Q9 1 6 5" fill="none" stroke="#9aa0a8" stroke-width="1.4" stroke-linecap="round"/>`
    + `<path d="M10 17 Q4 21 5 26 Q9 24 14 19 Z" fill="${col}" stroke="rgba(0,0,0,0.4)" stroke-width="0.7" stroke-linejoin="round"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 5 26, copy`;
};

// Stamps — a wooden rubber-stamp whose ink face is tinted to the chosen colour;
// hotspot (15,23) is the centre-bottom where the stamp presses down.
const stampCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">`
    + `<rect x="10" y="2" width="10" height="7" rx="3.5" fill="#b9742e" stroke="#8f581f" stroke-width="0.8"/>`
    + `<rect x="13" y="8" width="4" height="6" fill="#a85f1f"/>`
    + `<path d="M6 14 H24 L21 20 H9 Z" fill="#d4d8de" stroke="#9aa0a8" stroke-width="0.9" stroke-linejoin="round"/>`
    + `<rect x="8" y="19" width="14" height="4" rx="1.2" fill="${col}" stroke="rgba(0,0,0,0.35)" stroke-width="0.7"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 15 23, crosshair`;
};

// Eraser — a tilted pink rubber with a white sleeve band; neutral (it removes
// paint, never adds), so it never tints. Hotspot (4,22) on the leading corner.
const eraserCursor = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">`
    + `<path d="M8 12 L20 16 L24 12 L12 8 Z" fill="#eef1f5" stroke="#cdd3db" stroke-width="0.8" stroke-linejoin="round"/>`
    + `<path d="M4 22 L16 26 L20 16 L8 12 Z" fill="#f9a8c4" stroke="#d76a93" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="M7 14.5 L19 18.5 L18.2 20.5 L6.2 16.5 Z" fill="#ffffff" opacity="0.85"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 22, cell`;
})();

export function AdventurePaint({ pid, onExit, speak, Burst, I }) {
  const canvasRef = useRef(null), ctxRef = useRef(null), drawing = useRef(false),
    lastPt = useRef(null), undoStack = useRef([]), hueRef = useRef(0), distRef = useRef(0);
  const [color, setColor] = useState('#ef4444');
  const [size, setSize] = useState(SIZES[1].w);
  const [tool, setTool] = useState('brush');
  const [bType, setBType] = useState('marker');
  const [stamp, setStamp] = useState('star');
  const [tmpl, setTmpl] = useState('cat');
  const [canUndo, setCanUndo] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [askClear, setAskClear] = useState(false);
  const [doneArt, setDoneArt] = useState(null);
  const [burst, setBurst] = useState(false);
  const galleryKey = `pip-adv-gallery-${pid}`;
  const [gallery, setGallery] = useState(() => { try { return JSON.parse(localStorage.getItem(galleryKey) || '[]'); } catch { return []; } });

  useEffect(() => {
    const c = canvasRef.current; c.width = RES; c.height = RES;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctxRef.current = ctx;
    restore('cat');
  }, []);

  const key = (t) => `pip-adv-doodle-${pid}-${t}`;
  const persist = () => { try { localStorage.setItem(key(tmpl), canvasRef.current.toDataURL('image/png')); } catch { /* quota / private mode */ } };
  const clearAll = () => ctxRef.current.clearRect(0, 0, RES, RES);
  const restore = (t) => {
    clearAll();
    let d; try { d = localStorage.getItem(key(t)); } catch { /* private mode */ }
    if (d) { const img = new Image(); img.onload = () => ctxRef.current.drawImage(img, 0, 0, RES, RES); img.src = d; }
    setHasInk(!!d); undoStack.current = []; setCanUndo(false);
  };
  const switchTmpl = (t) => {
    persist(); setTmpl(t); restore(t);
    const tl = TEMPLATES.find((x) => x.id === t);
    if (t !== 'blank') { speak(`Color the ${tl.label.toLowerCase()}!`); }
  };
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (RES / r.width), y: (e.clientY - r.top) * (RES / r.height) };
  };
  const pushUndo = () => {
    try {
      undoStack.current.push(ctxRef.current.getImageData(0, 0, RES, RES));
      if (undoStack.current.length > 10) undoStack.current.shift();
      setCanUndo(true);
    } catch { /* tainted / unavailable */ }
  };

  const dab = (p) => {
    const ctx = ctxRef.current;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(p.x, p.y, size * .9, 0, Math.PI * 2); ctx.fill(); return;
    }
    ctx.globalCompositeOperation = 'source-over';
    if (tool === 'stamp') { ctx.fillStyle = color; STAMP_FN[stamp](ctx, p.x, p.y, size * 1.6); return; }
    if (bType === 'spray') {
      ctx.fillStyle = color;
      for (let i = 0; i < size * 1.5; i++) {
        const a = Math.random() * Math.PI * 2, rr = Math.random() * size * 1.4;
        ctx.globalAlpha = .5 + Math.random() * .5; ctx.fillRect(p.x + rr * Math.cos(a), p.y + rr * Math.sin(a), 3, 3);
      }
      ctx.globalAlpha = 1; return;
    }
    if (bType === 'sparkle') {
      ctx.fillStyle = color;
      dStar(ctx, p.x, p.y, size * (.5 + Math.random() * .6), Math.random() * Math.PI);
      ctx.fillStyle = '#ffffff';
      dStar(ctx, p.x + (Math.random() - .5) * size, p.y + (Math.random() - .5) * size, size * .25, Math.random() * Math.PI);
      return;
    }
    ctx.fillStyle = bType === 'rainbow' ? `hsl(${hueRef.current},90%,55%)` : color;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
  };
  const seg = (a, b) => {
    const ctx = ctxRef.current;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 1.8; ctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); return;
    }
    ctx.globalCompositeOperation = 'source-over';
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (tool === 'stamp' || bType === 'spray' || bType === 'sparkle') {
      distRef.current += d;
      const gap = tool === 'stamp' ? size * 3.2 : bType === 'sparkle' ? size * 1.6 : size * .5;
      if (distRef.current >= gap) { distRef.current = 0; dab(b); }
      return;
    }
    if (bType === 'rainbow') {
      hueRef.current = (hueRef.current + d * .25) % 360;
      ctx.strokeStyle = `hsl(${hueRef.current},90%,55%)`;
    } else ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  };

  const floodFill = (sx, sy) => {
    sx = Math.max(0, Math.min(RES - 1, Math.round(sx))); sy = Math.max(0, Math.min(RES - 1, Math.round(sy)));
    const bc = document.createElement('canvas'); bc.width = RES; bc.height = RES;
    const bctx = bc.getContext('2d');
    if (tmpl !== 'blank' && OUTLINE[tmpl]) {
      bctx.save(); bctx.translate(RES * .06, RES * .06); bctx.scale(RES * .88 / 100, RES * .88 / 100);
      bctx.lineWidth = 2.2; bctx.lineJoin = 'round'; bctx.lineCap = 'round'; bctx.strokeStyle = '#000';
      try { bctx.stroke(new Path2D(OUTLINE[tmpl])); } catch { /* Path2D unsupported */ }
      bctx.restore();
    }
    bctx.drawImage(canvasRef.current, 0, 0);
    const bd = bctx.getImageData(0, 0, RES, RES).data;
    const seed = sy * RES + sx;
    if (bd[seed * 4 + 3] > 40) return false;
    pushUndo();
    const seen = new Uint8Array(RES * RES);
    const out = ctxRef.current.createImageData(RES, RES); const od = out.data;
    const col = hexRgb(color);
    const stack = [seed]; seen[seed] = 1;
    while (stack.length) {
      const i = stack.pop();
      od[i * 4] = col.r; od[i * 4 + 1] = col.g; od[i * 4 + 2] = col.b; od[i * 4 + 3] = 255;
      const x = i % RES, y = (i / RES) | 0;
      if (x > 0) { const n = i - 1; if (!seen[n] && bd[n * 4 + 3] <= 40) { seen[n] = 1; stack.push(n); } }
      if (x < RES - 1) { const n = i + 1; if (!seen[n] && bd[n * 4 + 3] <= 40) { seen[n] = 1; stack.push(n); } }
      if (y > 0) { const n = i - RES; if (!seen[n] && bd[n * 4 + 3] <= 40) { seen[n] = 1; stack.push(n); } }
      if (y < RES - 1) { const n = i + RES; if (!seen[n] && bd[n * 4 + 3] <= 40) { seen[n] = 1; stack.push(n); } }
    }
    const fc = document.createElement('canvas'); fc.width = RES; fc.height = RES;
    fc.getContext('2d').putImageData(out, 0, 0);
    const ctx = ctxRef.current;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(fc, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    return true;
  };

  const start = (e) => {
    e.preventDefault();
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
    const p = pos(e);
    if (tool === 'fill') { if (floodFill(p.x, p.y)) { setHasInk(true); persist(); speak('Whoosh!'); } return; }
    pushUndo(); drawing.current = true; setHasInk(true); lastPt.current = p; distRef.current = 0; dab(p);
  };
  const move = (e) => {
    if (!drawing.current) return; e.preventDefault();
    const p = pos(e); seg(lastPt.current, p); lastPt.current = p;
  };
  const end = () => { if (!drawing.current) return; drawing.current = false; persist(); };

  const undo = () => {
    const s = undoStack.current; if (!s.length) return;
    ctxRef.current.putImageData(s.pop(), 0, 0); setCanUndo(s.length > 0); persist();
  };
  const wipe = () => { setAskClear(false); pushUndo(); clearAll(); persist(); setHasInk(false); speak('All clean!'); };

  const exportArt = () => {
    const out = document.createElement('canvas'); out.width = 480; out.height = 480;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#fffdf9'; ctx.fillRect(0, 0, 480, 480);
    if (tmpl !== 'blank' && OUTLINE[tmpl]) {
      ctx.save(); ctx.translate(480 * .06, 480 * .06); ctx.scale(480 * .88 / 100, 480 * .88 / 100);
      ctx.strokeStyle = '#d9c4ad'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      try { ctx.stroke(new Path2D(OUTLINE[tmpl])); } catch { /* Path2D unsupported */ }
      ctx.restore();
    }
    ctx.drawImage(canvasRef.current, 0, 0, 480, 480);
    return out.toDataURL('image/png');
  };
  const finish = () => {
    if (!hasInk) return;
    persist();
    const data = exportArt();
    const tl = TEMPLATES.find((x) => x.id === tmpl);
    const item = { id: Date.now(), template: tmpl, label: tl ? tl.label : 'Painting', data };
    setGallery((g) => {
      const ng = [item, ...g].slice(0, 24);
      try { localStorage.setItem(galleryKey, JSON.stringify(ng)); } catch { /* quota */ }
      return ng;
    });
    setDoneArt(data); setBurst(true);
    speak('Beautiful! I love it!');
  };
  const fresh = () => {
    setDoneArt(null); undoStack.current = []; setCanUndo(false);
    clearAll(); setHasInk(false);
    try { localStorage.removeItem(key(tmpl)); } catch { /* private mode */ }
  };

  return (
    <div className="level paint-level" data-screen-label="Paint studio">
      <div className="level-hud">
        <button className="gbtn white round" aria-label="Back to map" data-testid="level-exit" onClick={() => { persist(); onExit(); }} style={{ minHeight: 50, width: 50 }}><I n="close" s={22} /></button>
        <span className="hud-brand" style={{ fontSize: 22 }}>Paint Studio 🎨</span>
        <span style={{ flex: 1 }} />
        <button className="gbtn gold small" data-testid="paint-done" disabled={!hasInk} onClick={finish}>
          <I n="check" s={20} /> I&apos;m done!
        </button>
      </div>

      <div className="paint-body">
        <div className="paint-tmpls" role="tablist" aria-label="Coloring pages">
          {TEMPLATES.map((t) => (
            <button key={t.id} className={`ptmpl ${tmpl === t.id ? 'on' : ''}`} role="tab" aria-selected={tmpl === t.id}
              data-testid={`paint-tmpl-${t.id}`} onClick={() => switchTmpl(t.id)}>
              {t.id === 'blank'
                ? <I n="star" s={22} />
                : <svg viewBox="0 0 100 100" width="30" height="30" aria-hidden="true"><path d={OUTLINE[t.id]} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" /></svg>}
              <small>{t.label}</small>
            </button>
          ))}
        </div>
        <div className="paint-stage">
          <div className="paint-paper">
            {tmpl !== 'blank' && OUTLINE[tmpl] && (
              <svg className="paint-guide" viewBox="0 0 100 100" aria-hidden="true">
                <path d={OUTLINE[tmpl]} fill="none" stroke="#d9c4ad" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            )}
            <canvas ref={canvasRef} className="paint-canvas" data-testid="paint-canvas" aria-label="Drawing canvas"
              style={{ cursor: tool === 'brush' ? brushCursor(color) : tool === 'fill' ? fillCursor(color) : tool === 'stamp' ? stampCursor(color) : tool === 'eraser' ? eraserCursor : 'crosshair', touchAction: 'none' }}
              onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} onPointerCancel={end} />
          </div>
        </div>

        <div className="paint-rail">
          <div className="paint-swatches" role="radiogroup" aria-label="Colors">
            {COLORS.map((c) => (
              <button key={c.hex} className={`pswatch ${color === c.hex && tool !== 'eraser' ? 'sel' : ''}`}
                role="radio" aria-checked={color === c.hex && tool !== 'eraser'} aria-label={c.name}
                style={{ background: c.hex }} onClick={() => { setColor(c.hex); if (tool === 'eraser') setTool('brush'); speak(c.name); }} />
            ))}
          </div>

          <div className="rail-sep" />

          <div className="ptools tools-grid" role="radiogroup" aria-label="Tools">
            {[
              { id: 'brush', label: 'Brush', icon: 'brush' },
              { id: 'fill', label: 'Magic fill', icon: 'fill' },
              { id: 'stamp', label: 'Stamps', icon: 'star' },
              { id: 'eraser', label: 'Eraser', icon: 'eraser' },
            ].map((t) => (
              <button key={t.id} className={`ptool ${tool === t.id ? 'sel' : ''}`} role="radio" aria-checked={tool === t.id}
                aria-label={t.label} data-testid={`paint-tool-${t.id}`}
                onClick={() => { setTool(t.id); speak(t.label + '!'); }}>
                <I n={t.icon} s={24} />
              </button>
            ))}
          </div>

          {tool === 'brush' && (
            <div className="paint-subrow" role="radiogroup" aria-label="Brush style">
              {BRUSH_TYPES.map((b) => (
                <button key={b.id} className={`pchip ${bType === b.id ? 'on' : ''}`} role="radio" aria-checked={bType === b.id}
                  data-testid={`paint-brush-${b.id}`} onClick={() => { setBType(b.id); speak(b.label); }}>
                  {b.id === 'rainbow' ? <span className="pdot rainbow" /> : b.id === 'marker' ? <span className="pdot" style={{ background: color }} /> : <I n={b.id === 'spray' ? 'spray' : 'sparkle'} s={17} />}
                  {b.label}
                </button>
              ))}
            </div>
          )}
          {tool === 'stamp' && (
            <div className="paint-subrow" role="radiogroup" aria-label="Stamp shape">
              {STAMPS.map((s) => (
                <button key={s.id} className={`pchip ${stamp === s.id ? 'on' : ''}`} role="radio" aria-checked={stamp === s.id}
                  data-testid={`paint-stamp-${s.id}`} onClick={() => { setStamp(s.id); speak(s.label); }}>{s.label}</button>
              ))}
            </div>
          )}

          <div className="ptools size-row" role="radiogroup" aria-label="Size">
            {SIZES.map((b) => (
              <button key={b.id} className={`ptool ${size === b.w ? 'sel' : ''}`} role="radio" aria-checked={size === b.w}
                aria-label={`Size ${b.id === 's' ? 'small' : b.id === 'm' ? 'medium' : 'big'}`} onClick={() => setSize(b.w)}>
                <span className="pdot" style={{ width: b.dot, height: b.dot, background: tool === 'eraser' ? '#a8b0bc' : color }} />
              </button>
            ))}
          </div>

          <div className="ptools act-row">
            <button className="ptool" aria-label="Undo" disabled={!canUndo} onClick={undo}><I n="undo" s={24} /></button>
            <button className="ptool danger" aria-label="Clear page" data-testid="paint-clear" onClick={() => setAskClear(true)}><I n="trash" s={24} /></button>
          </div>

          {gallery.length > 0 && (
            <div className="paint-shelf" aria-label="My art">
              {gallery.slice(0, 8).map((a) => <img key={a.id} src={a.data} alt={`My ${a.label} painting`} />)}
            </div>
          )}
        </div>
      </div>

      {askClear && (
        <div className="complete-scrim" data-testid="paint-clear-confirm">
          <div className="complete-card">
            <HeroMascot state="encourage" size={90} />
            <h2>Start over?</h2>
            <p>Your picture will be wiped clean.</p>
            <div className="complete-actions">
              <button className="gbtn red" onClick={wipe}>Yes, clean it!</button>
              <button className="gbtn blue" onClick={() => setAskClear(false)}>Keep painting</button>
            </div>
          </div>
        </div>
      )}
      {doneArt && (
        <div className="complete-scrim" data-testid="paint-complete">
          <div className="complete-card">
            <HeroMascot state="cheer" size={90} />
            <div className="paint-frame"><img src={doneArt} alt="Your finished painting" /></div>
            <h2>Beautiful!</h2>
            <p>Saved to your art shelf.</p>
            <div className="complete-actions">
              <button className="gbtn" onClick={fresh}>Paint another</button>
              <button className="gbtn gold" onClick={() => { setDoneArt(null); onExit(); }}>Back to the map</button>
            </div>
          </div>
        </div>
      )}
      {burst && <Burst onDone={() => setBurst(false)} />}
    </div>
  );
}
