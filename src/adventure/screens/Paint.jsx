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
import { advSfx, ADV_SET } from '../audio.js';
import { useInitialFocus } from '../hooks/useSpatialNav.js';
import { useBackHandler } from '../hooks/useBackButton.js';
import { isTvMode } from '../tv.js';

const RES = 1000;
// TV/D-pad coloring grid: the canvas is divided into GRID×GRID cells; in dpad mode a
// highlighted cell cursor is moved with the arrows and OK fills/stamps that cell. 12×12
// (~83px cells at RES) is big enough to aim from the couch and matches paint-by-number.
const GRID = 12;

// Gentle haptics, gated on the in-app motion setting (absent on most desktops).
const vibrate = (pattern) => {
  if (ADV_SET.motion && typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* unsupported */ }
  }
};
// Calm mode: honour BOTH the OS reduced-motion preference and the in-app motion
// toggle, so the flickery sparkle/spray brushes settle to a still version (the
// global CSS reduced-motion rule can't reach these JS canvas draws).
const prefersCalm = () => !ADV_SET.motion
  || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
// Collision-proof id for saved paintings (toddlers double-tap "I'm done").
let _artSeq = 0;
const artId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `art-${Date.now()}-${_artSeq++}`);
// Warm, varied praise woven with the subject + colour.
const PRAISE = ['Beautiful! I love it!', 'Wow, look at that!', 'You are a real artist!', 'So lovely!', 'Amazing work!'];

const COLORS = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' }, { name: 'Yellow', hex: '#fbbf24' },
  { name: 'Green', hex: '#22c55e' }, { name: 'Sky blue', hex: '#38bdf8' }, { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' }, { name: 'Brown', hex: '#92400e' },
  { name: 'Black', hex: '#1c1917' }, { name: 'White', hex: '#ffffff' },
];
const SIZES = [{ id: 's', w: 14, dot: 10 }, { id: 'm', w: 30, dot: 16 }, { id: 'l', w: 56, dot: 24 }];
// Outline stroke width in the 100-unit template space. ONE source of truth shared
// by the visible guide, the flood-fill boundary wall, and the export — so the
// fill always reaches exactly the outline (no white halo from a width mismatch).
const GUIDE_W = 1.6;
// Magic-fill overfill (device px at RES): the filled region is grown a few pixels
// so its colour tucks UNDER the outline and no anti-aliased seam shows.
const FILL_BLEED = 4;
const OUTLINE = {
  cat: 'M25 22 L23 2 L40 10 M75 22 L77 2 L60 10 M50 30 m-30 8 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 M40 50 h0 M60 50 h0 M50 56 l-5 5 5 3 5 -3Z M20 60 h-12 M20 66 h-12 M80 60 h12 M80 66 h12',
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
  { id: 'spray', label: 'Spray' }, { id: 'sparkle', label: 'Sparkle' }, { id: 'glitter', label: 'Glitter' },
];
const STAMPS = [
  { id: 'star', label: 'Star' }, { id: 'heart', label: 'Heart' }, { id: 'smile', label: 'Smiley' },
  { id: 'circle', label: 'Circle' }, { id: 'square', label: 'Square' }, { id: 'triangle', label: 'Triangle' },
];

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
// Simple geometric shape stamps double as a counting / shapes-zone tie-in.
function dCircle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function dSquare(c, x, y, r) { c.fillRect(x - r * .88, y - r * .88, r * 1.76, r * 1.76); }
function dTriangle(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .92, y + r * .62); c.lineTo(x - r * .92, y + r * .62); c.closePath(); c.fill(); }
const STAMP_FN = {
  star: (c, x, y, r) => dStar(c, x, y, r, Math.random() * Math.PI), heart: dHeart, smile: dSmile,
  circle: dCircle, square: dSquare, triangle: dTriangle,
};

// Tool cursors — polished, dimensional SVG glyphs of the actual tool (wood
// gradients, metal ferrule/collar, glossy highlights, soft outline so they read
// on any background) at 36px, crisp on retina since they're vector. Colour-using
// tools tint their tip to the chosen colour; the trailing two numbers are the
// hotspot — the exact pixel where the tool "touches" the paint.

// Paintbrush — wooden handle + metal ferrule + glossy paint tip; hotspot on the tip.
const brushCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">`
    + `<defs><linearGradient id="bw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eab873"/><stop offset=".5" stop-color="#cf8f43"/><stop offset="1" stop-color="#9c5f25"/></linearGradient>`
    + `<linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f8fb"/><stop offset="1" stop-color="#a7afba"/></linearGradient></defs>`
    + `<g stroke-linecap="round" stroke-linejoin="round">`
    + `<line x1="33" y1="5" x2="18.5" y2="19.5" stroke="rgba(55,35,12,.4)" stroke-width="7.6"/>`
    + `<line x1="33" y1="5" x2="18.5" y2="19.5" stroke="url(#bw)" stroke-width="5.4"/>`
    + `<line x1="31.4" y1="6.6" x2="24" y2="14" stroke="#fff7e8" stroke-width="1.2" opacity=".55"/>`
    + `<line x1="19.7" y1="18.3" x2="15.6" y2="22.4" stroke="rgba(35,40,50,.4)" stroke-width="8.2"/>`
    + `<line x1="19.7" y1="18.3" x2="15.6" y2="22.4" stroke="url(#bm)" stroke-width="6.2"/>`
    + `<line x1="18.9" y1="17.7" x2="16.4" y2="20.2" stroke="#fff" stroke-width="1" opacity=".55"/></g>`
    + `<path d="M17.6 20.2 L20.1 22.7 L7.6 31.3 Q3.4 34.1 2.4 32.6 Q1.4 29.1 5 25.5 Z" fill="${col}" stroke="rgba(0,0,0,.38)" stroke-width="0.9" stroke-linejoin="round"/>`
    + `<path d="M9 27.6 Q6.6 29.6 4.9 31.7" stroke="#fff" stroke-width="1.3" opacity=".5" fill="none" stroke-linecap="round"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 3 32, crosshair`;
};

// Magic fill — a metallic paint bucket pouring a splash of the chosen colour;
// hotspot sits on the poured paint where the flood begins.
const fillCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">`
    + `<defs><linearGradient id="fm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset="1" stop-color="#9aa3af"/></linearGradient></defs>`
    + `<path d="M14.5 5.5 Q8.5 2 5.5 7.5" fill="none" stroke="#8b94a1" stroke-width="1.8" stroke-linecap="round"/>`
    + `<path d="M15 5 L30 9.5 L26 25 L11 20.5 Z" fill="url(#fm)" stroke="rgba(50,58,70,.55)" stroke-width="1.1" stroke-linejoin="round"/>`
    + `<path d="M15 5 L30 9.5" stroke="#dfe4ea" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="M17.5 8.5 L26 11" stroke="#fff" stroke-width="1.2" opacity=".5" stroke-linecap="round"/>`
    + `<path d="M11.5 19.5 Q4.5 25 5.5 31.5 Q11.5 28 16.5 22.5 Z" fill="${col}" stroke="rgba(0,0,0,.32)" stroke-width="0.9" stroke-linejoin="round"/>`
    + `<path d="M8 25 Q6 28 6 30.5" stroke="#fff" stroke-width="1.1" opacity=".4" fill="none" stroke-linecap="round"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 6 31, copy`;
};

// Stamps — a wooden rubber-stamp whose ink face is tinted to the chosen colour;
// hotspot is centre-bottom where the stamp presses down.
const stampCursor = (col) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">`
    + `<defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d98f4a"/><stop offset="1" stop-color="#9c5f25"/></linearGradient>`
    + `<linearGradient id="sm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset="1" stop-color="#a7afba"/></linearGradient></defs>`
    + `<rect x="11.5" y="2.5" width="13" height="9.5" rx="4.5" fill="url(#sw)" stroke="rgba(60,38,12,.45)" stroke-width="1"/>`
    + `<rect x="14" y="3.8" width="4.5" height="3" rx="1.5" fill="#fff" opacity=".4"/>`
    + `<rect x="15.5" y="11" width="5" height="7" fill="#9c6326"/>`
    + `<path d="M7 17.5 H29 L25 25.5 H11 Z" fill="url(#sm)" stroke="rgba(50,58,70,.5)" stroke-width="1" stroke-linejoin="round"/>`
    + `<rect x="9.5" y="24.5" width="17" height="5.5" rx="2" fill="${col}" stroke="rgba(0,0,0,.32)" stroke-width="0.9"/>`
    + `<rect x="11.5" y="25.6" width="6" height="1.6" rx=".8" fill="#fff" opacity=".35"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 18 29, crosshair`;
};

// Eraser — a 3D pink rubber with a white sleeve band; neutral (it removes paint,
// never adds), so it never tints. Hotspot on the leading corner.
const eraserCursor = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">`
    + `<defs><linearGradient id="ep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbb6d0"/><stop offset="1" stop-color="#ec6fa0"/></linearGradient></defs>`
    + `<path d="M10 13 L24 17.5 L29 12.5 L15 8 Z" fill="#fcdcea" stroke="rgba(170,70,110,.5)" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="M4 24.5 L19 29.5 L24 17.5 L10 13 Z" fill="url(#ep)" stroke="rgba(170,70,110,.55)" stroke-width="1" stroke-linejoin="round"/>`
    + `<path d="M7.6 16.4 L21.4 21 L20.1 24.6 L6.3 20 Z" fill="#fff" opacity=".92"/>`
    + `<path d="M5.5 23.8 L18.4 28.1" stroke="#fff" stroke-width="1" opacity=".4" stroke-linecap="round"/>`
    + `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 6 26, cell`;
})();

export function AdventurePaint({ pid, onExit, speak, announce, Burst, I, Star, dpad = false }) {
  const say = announce || (() => {}); // caption channel for silent actions
  const canvasRef = useRef(null), ctxRef = useRef(null), drawing = useRef(false),
    lastPt = useRef(null), undoStack = useRef([]), redoStack = useRef([]), hueRef = useRef(0), distRef = useRef(0),
    activeId = useRef(null), inkRef = useRef(false), restoreGen = useRef(0),
    restoringRef = useRef(false), persistTimer = useRef(null), wallRef = useRef({ t: null, bd: null });
  const [color, setColor] = useState('#ef4444');
  const [size, setSize] = useState(SIZES[1].w);
  const [tool, setTool] = useState(dpad ? 'fill' : 'brush'); // TV lands in paint-by-number (Magic fill)
  const [bType, setBType] = useState('marker');
  const [stamp, setStamp] = useState('star');
  const [tmpl, setTmpl] = useState('cat');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [askClear, setAskClear] = useState(false);
  const [doneArt, setDoneArt] = useState(null);
  const [saveOk, setSaveOk] = useState(true);
  const [burst, setBurst] = useState(false);
  const [showGallery, setShowGallery] = useState(false); // the full "My Art" viewer
  const [viewArt, setViewArt] = useState(null); // a single saved painting opened from the gallery
  const [mirror, setMirror] = useState(false); // symmetry mode
  const [confirmDel, setConfirmDel] = useState(false); // two-step delete in the art viewer
  const galleryKey = `pip-adv-gallery-${pid}`;
  const [gallery, setGallery] = useState(() => { try { return JSON.parse(localStorage.getItem(galleryKey) || '[]'); } catch { return []; } });
  // Which template pages currently hold a drawing — drives a thumbnail dot so a
  // child sees their art is "safe on its page" when they switch coloring pages.
  const [inked, setInked] = useState(() => {
    const s = new Set();
    try { TEMPLATES.forEach((t) => { if (localStorage.getItem(`pip-adv-doodle-${pid}-${t.id}`)) s.add(t.id); }); } catch { /* private mode */ }
    return s;
  });

  const rootRef = useRef(null);
  const [cur, setCur] = useState({ c: Math.floor(GRID / 2), r: Math.floor(GRID / 2) }); // dpad grid cursor

  useEffect(() => {
    const c = canvasRef.current; c.width = RES; c.height = RES;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctxRef.current = ctx;
    restore('cat');
    return () => clearTimeout(persistTimer.current);
  }, []);

  // TV: land focus on the canvas (the data-nav-default) when Paint opens.
  useInitialFocus(rootRef);
  // TV BACK: peel off the topmost open overlay, else leave Paint. (One handler for the
  // whole screen since Paint's modals are inline state, not separate components.)
  useBackHandler(() => {
    if (viewArt) { if (confirmDel) setConfirmDel(false); else setViewArt(null); }
    else if (showGallery) setShowGallery(false);
    else if (doneArt) setDoneArt(null);
    else if (askClear) setAskClear(false);
    else { flushPersist(); onExit(); }
  });
  // TV: when an overlay opens, land focus on its first control (the global navigator
  // then scopes arrow movement to that [role=dialog]).
  const overlayKey = `${viewArt ? 'v' : ''}${showGallery ? 'g' : ''}${doneArt ? 'd' : ''}${askClear ? 'c' : ''}${confirmDel ? 'x' : ''}`;
  useEffect(() => {
    if (!isTvMode() || !overlayKey || !rootRef.current) return;
    const dlgs = rootRef.current.querySelectorAll('[role="dialog"]');
    const dlg = dlgs[dlgs.length - 1];
    const el = dlg && (dlg.querySelector('[data-nav-default]') || dlg.querySelector('[data-nav]'));
    if (el) requestAnimationFrame(() => { try { el.focus(); } catch { /* ignore */ } });
  }, [overlayKey]);

  const key = (t) => `pip-adv-doodle-${pid}-${t}`;
  const setInk = (v) => { inkRef.current = v; setHasInk(v); }; // ref stays in sync for synchronous reads
  const refreshInked = () => {
    const s = new Set();
    try { TEMPLATES.forEach((t) => { if (localStorage.getItem(key(t.id))) s.add(t.id); }); } catch { /* private mode */ }
    setInked((prev) => (prev.size === s.size && [...s].every((x) => prev.has(x)) ? prev : s)); // only re-render on a real change
  };
  const persistNow = () => {
    if (restoringRef.current) return; // never write a half-loaded page over the saved one
    try {
      // An empty page keeps NO doodle, so the thumbnail dot stays honest.
      if (inkRef.current) localStorage.setItem(key(tmpl), canvasRef.current.toDataURL('image/png'));
      else localStorage.removeItem(key(tmpl));
      refreshInked();
    } catch { /* quota / private mode */ }
  };
  // Debounced autosave: a burst of dabs yields ONE PNG encode after the child
  // pauses (a full-res toDataURL is costly on budget tablets). Flush eagerly when
  // it actually matters (page switch / finish / exit).
  const persist = () => { clearTimeout(persistTimer.current); persistTimer.current = setTimeout(persistNow, 500); };
  const flushPersist = () => { clearTimeout(persistTimer.current); persistTimer.current = null; persistNow(); };
  // Optimistically light the current page's thumbnail dot the instant ink lands
  // (the debounced disk write / flush later reconciles the full set from storage).
  const markInkedNow = () => setInked((s) => (s.has(tmpl) ? s : new Set(s).add(tmpl)));
  const clearAll = () => ctxRef.current.clearRect(0, 0, RES, RES);
  const restore = (t) => {
    const gen = ++restoreGen.current;
    let d; try { d = localStorage.getItem(key(t)); } catch { /* private mode */ }
    if (d) {
      // Block input until the saved art has painted in, and clear+draw ONLY inside
      // onload — so the page is never "blank but inked" (a fast tap or fill in the
      // decode window used to wipe the saved drawing).
      restoringRef.current = true;
      const img = new Image();
      img.onload = () => { if (restoreGen.current !== gen) return; clearAll(); ctxRef.current.drawImage(img, 0, 0, RES, RES); restoringRef.current = false; };
      img.onerror = () => { if (restoreGen.current === gen) { clearAll(); restoringRef.current = false; } };
      img.src = d;
    } else {
      clearAll();
      restoringRef.current = false;
    }
    setInk(!!d); undoStack.current = []; setCanUndo(false); redoStack.current = []; setCanRedo(false);
  };
  const switchTmpl = (t) => {
    if (t === tmpl) return;
    const prev = TEMPLATES.find((x) => x.id === tmpl);
    const safe = inkRef.current && prev ? `Your ${prev.label.toLowerCase()} is safe. ` : ''; // reassure: art isn't lost
    flushPersist(); setTmpl(t); restore(t); advSfx('tap');
    const tl = TEMPLATES.find((x) => x.id === t);
    speak(`${safe}${t !== 'blank' ? `Now color the ${tl.label.toLowerCase()}!` : 'Here is a blank page!'}`); // one line: spoken AND captioned
  };
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (RES / r.width), y: (e.clientY - r.top) * (RES / r.height) };
  };
  const pushUndo = () => {
    try {
      undoStack.current.push(ctxRef.current.getImageData(0, 0, RES, RES));
      if (undoStack.current.length > 16) undoStack.current.shift();
      redoStack.current = []; setCanRedo(false);
      setCanUndo(true);
    } catch { /* tainted / unavailable */ }
  };

  const drawDab = (p) => {
    const ctx = ctxRef.current;
    const calm = prefersCalm();
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
        ctx.globalAlpha = calm ? .85 : .5 + Math.random() * .5; // calm: steady, no flicker
        ctx.fillRect(p.x + rr * Math.cos(a), p.y + rr * Math.sin(a), 3, 3);
      }
      ctx.globalAlpha = 1; return;
    }
    if (bType === 'sparkle') {
      ctx.fillStyle = color;
      if (calm) { dStar(ctx, p.x, p.y, size * .8, 0); return; } // calm: one still star, no white flash
      dStar(ctx, p.x, p.y, size * (.5 + Math.random() * .6), Math.random() * Math.PI);
      ctx.fillStyle = '#ffffff';
      dStar(ctx, p.x + (Math.random() - .5) * size, p.y + (Math.random() - .5) * size, size * .25, Math.random() * Math.PI);
      return;
    }
    if (bType === 'glitter') {
      const n = calm ? 5 : 12;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, rr = Math.random() * size * 1.3;
        ctx.globalAlpha = calm ? .85 : .35 + Math.random() * .65;
        ctx.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffd84d' : color; // sparkle of white / gold / colour
        ctx.beginPath(); ctx.arc(p.x + rr * Math.cos(a), p.y + rr * Math.sin(a), size * .12 + Math.random() * size * .14, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; return;
    }
    ctx.fillStyle = bType === 'rainbow' ? `hsl(${hueRef.current},90%,55%)` : color;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
  };
  // Mirror mode: every dab is also painted on the opposite side of the canvas,
  // turning scribbles into symmetric butterflies/faces.
  const dab = (p) => { drawDab(p); if (mirror) drawDab({ x: RES - p.x, y: p.y }); };
  const seg = (a, b) => {
    const ctx = ctxRef.current;
    const mir = (p) => ({ x: RES - p.x, y: p.y });
    if (tool === 'eraser') {
      const erase = (p, q) => { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = size * 1.8; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); };
      erase(a, b); if (mirror) erase(mir(a), mir(b)); return;
    }
    ctx.globalCompositeOperation = 'source-over';
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    if (tool === 'stamp' || bType === 'spray' || bType === 'sparkle' || bType === 'glitter') {
      distRef.current += d;
      const gap = tool === 'stamp' ? size * 3.2 : bType === 'sparkle' ? size * 1.6 : size * .5;
      if (distRef.current >= gap) { distRef.current = 0; dab(b); } // dab() mirrors
      return;
    }
    if (bType === 'rainbow') hueRef.current = (hueRef.current + d * .25) % 360;
    const line = (p, q) => { ctx.strokeStyle = bType === 'rainbow' ? `hsl(${hueRef.current},90%,55%)` : color; ctx.lineWidth = size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); };
    line(a, b); if (mirror) line(mir(a), mir(b));
  };

  // Returns 'filled' (did something), 'same' (region is already this colour) or
  // 'miss' (tap wasn't on a fillable region even after the near-miss search).
  const floodFill = (sx, sy) => {
    sx = Math.max(0, Math.min(RES - 1, Math.round(sx))); sy = Math.max(0, Math.min(RES - 1, Math.round(sy)));
    // Boundary wall = the template outline ONLY (existing paint is handled by the
    // colour-match below, so a filled region RE-colours). The wall depends only on
    // the template, so build it once and cache it — taps don't rebuild it.
    let bd = wallRef.current.t === tmpl ? wallRef.current.bd : null;
    if (!bd) {
      const bc = document.createElement('canvas'); bc.width = RES; bc.height = RES;
      const bctx = bc.getContext('2d');
      if (tmpl !== 'blank' && OUTLINE[tmpl]) {
        bctx.save(); bctx.translate(RES * .06, RES * .06); bctx.scale(RES * .88 / 100, RES * .88 / 100);
        bctx.lineWidth = GUIDE_W; bctx.lineJoin = 'round'; bctx.lineCap = 'round'; bctx.strokeStyle = '#000';
        try { bctx.stroke(new Path2D(OUTLINE[tmpl])); } catch { /* Path2D unsupported */ }
        bctx.restore();
      }
      bd = bctx.getImageData(0, 0, RES, RES).data;
      wallRef.current = { t: tmpl, bd };
    }
    const cd = ctxRef.current.getImageData(0, 0, RES, RES).data; // current paint
    let seed = sy * RES + sx;
    // Near-miss forgiveness: if the tap landed on the thin outline, spiral out to
    // a paintable pixel — checking TOWARD the canvas centre first, so an edge tap
    // resolves into the shape's interior, not the outside background.
    if (bd[seed * 4 + 3] > 40) {
      const cx = RES / 2, cy = RES * 0.46, base = Math.atan2(cy - sy, cx - sx);
      let found = -1;
      for (let r = 4; r <= 32 && found < 0; r += 4) {
        for (let k = 0; k < 16 && found < 0; k++) {
          const ang = base + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * (Math.PI / 8);
          const nx = sx + Math.round(Math.cos(ang) * r), ny = sy + Math.round(Math.sin(ang) * r);
          if (nx < 0 || ny < 0 || nx >= RES || ny >= RES) continue;
          if (bd[(ny * RES + nx) * 4 + 3] <= 40) found = ny * RES + nx;
        }
      }
      if (found < 0) return 'miss';
      seed = found;
    }
    const sr = cd[seed * 4], sg = cd[seed * 4 + 1], sb = cd[seed * 4 + 2], sa = cd[seed * 4 + 3];
    const col = hexRgb(color);
    if (sa > 200 && Math.abs(sr - col.r) < 12 && Math.abs(sg - col.g) < 12 && Math.abs(sb - col.b) < 12) return 'same';
    // Same region as the seed: not a wall, and the paint colour matches the seed
    // (so an empty area floods like before; a filled area recolours just itself).
    const matches = (i) => {
      if (bd[i * 4 + 3] > 40) return false;
      const dr = cd[i * 4] - sr, dg = cd[i * 4 + 1] - sg, db = cd[i * 4 + 2] - sb, da = cd[i * 4 + 3] - sa;
      return da * da < 3600 && dr * dr + dg * dg + db * db < 3200;
    };
    pushUndo();
    const seen = new Uint8Array(RES * RES);
    const out = ctxRef.current.createImageData(RES, RES); const od = out.data;
    const stack = [seed]; seen[seed] = 1;
    while (stack.length) {
      const i = stack.pop();
      od[i * 4] = col.r; od[i * 4 + 1] = col.g; od[i * 4 + 2] = col.b; od[i * 4 + 3] = 255;
      const x = i % RES, y = (i / RES) | 0;
      if (x > 0) { const n = i - 1; if (!seen[n] && matches(n)) { seen[n] = 1; stack.push(n); } }
      if (x < RES - 1) { const n = i + 1; if (!seen[n] && matches(n)) { seen[n] = 1; stack.push(n); } }
      if (y > 0) { const n = i - RES; if (!seen[n] && matches(n)) { seen[n] = 1; stack.push(n); } }
      if (y < RES - 1) { const n = i + RES; if (!seen[n] && matches(n)) { seen[n] = 1; stack.push(n); } }
    }
    const fc = document.createElement('canvas'); fc.width = RES; fc.height = RES;
    fc.getContext('2d').putImageData(out, 0, 0);
    // Overfill so the colour tucks UNDER the outline (no white halo at the seam).
    const grow = document.createElement('canvas'); grow.width = RES; grow.height = RES;
    const gctx = grow.getContext('2d');
    for (let a = 0; a < 8; a++) {
      gctx.drawImage(fc, Math.round(Math.cos(a * Math.PI / 4) * FILL_BLEED), Math.round(Math.sin(a * Math.PI / 4) * FILL_BLEED));
    }
    gctx.drawImage(fc, 0, 0);
    const ctx = ctxRef.current;
    // Empty seed (first fill): paint BEHIND existing strokes. Re-colour (seed had
    // paint): paint ON TOP so the new colour actually replaces the old.
    ctx.globalCompositeOperation = sa > 40 ? 'source-over' : 'destination-over';
    ctx.drawImage(grow, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    return 'filled';
  };

  // Eyedropper at a canvas point — shared by the pointer path and the D-pad cursor.
  const pickAt = (p) => {
    const d = ctxRef.current.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
    if (d[3] > 20) {
      setColor('#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join(''));
      setTool('brush'); advSfx('yes');
      // name the picked colour aloud when it's (near) a known swatch
      let best = null, bestD = Infinity;
      for (const c of COLORS) { const cr = hexRgb(c.hex); const dd = (cr.r - d[0]) ** 2 + (cr.g - d[1]) ** 2 + (cr.b - d[2]) ** 2; if (dd < bestD) { bestD = dd; best = c; } }
      speak(best && bestD < 1200 ? `${best.name}!` : 'Got it!');
    } else { speak('Tap a colour to pick it!'); advSfx('tap'); }
  };
  // Flood-fill at a canvas point + the shared feedback — shared by pointer + D-pad.
  const fillAt = (p) => {
    const r = floodFill(p.x, p.y);
    if (r === 'filled') { setInk(true); markInkedNow(); persist(); speak('Whoosh!'); advSfx('yes'); vibrate(15); }
    else if (r === 'same') { advSfx('tap'); } // already this colour — gentle, no scolding
    else { speak('Tap inside the shape!'); advSfx('tap'); } // never respond silently
  };

  // ---- D-pad coloring: a movable grid cell; OK runs the active tool at its centre ----
  const cellCenter = (c, r) => ({ x: (c + 0.5) * RES / GRID, y: (r + 0.5) * RES / GRID });
  const dpadAct = () => {
    const p = cellCenter(cur.c, cur.r);
    if (tool === 'pick') { pickAt(p); return; }
    if (tool === 'fill') { fillAt(p); return; }
    // brush / stamp / eraser → one discrete dab at the cell centre (reuses dab()).
    pushUndo(); setInk(true); markInkedNow(); dab(p); persist();
    if (tool === 'stamp') { advSfx('pop'); vibrate(12); } else advSfx('tap');
  };
  const onCanvasKey = (e) => {
    if (!dpad) return;
    const k = e.key;
    if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); e.stopPropagation(); dpadAct(); return; }
    let { c, r } = cur;
    if (k === 'ArrowLeft' && c > 0) c--;
    else if (k === 'ArrowRight' && c < GRID - 1) c++;
    else if (k === 'ArrowUp' && r > 0) r--;
    else if (k === 'ArrowDown' && r < GRID - 1) r++;
    else return; // at a grid edge → let the key bubble so the global nav hops to the rail/templates/HUD
    e.preventDefault(); e.stopPropagation(); setCur({ c, r });
  };

  const start = (e) => {
    // Ignore extra fingers / palm rests: only the primary pointer draws, and once
    // a stroke owns the canvas a second pointer can't hijack it.
    if (restoringRef.current || !e.isPrimary || (drawing.current && e.pointerId !== activeId.current)) return;
    e.preventDefault();
    activeId.current = e.pointerId;
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
    const p = pos(e);
    if (tool === 'pick') { pickAt(p); return; }   // eyedropper: adopt the colour under the tap
    if (tool === 'fill') { fillAt(p); return; }
    pushUndo(); drawing.current = true; setInk(true); markInkedNow(); lastPt.current = p; distRef.current = 0; dab(p);
    if (tool === 'stamp') { advSfx('pop'); vibrate(12); }
  };
  const move = (e) => {
    if (!drawing.current || e.pointerId !== activeId.current) return; e.preventDefault();
    const p = pos(e); seg(lastPt.current, p); lastPt.current = p;
  };
  // No onPointerLeave: pointer capture keeps a stroke alive past the paper edge,
  // so a big confident arm movement doesn't snap off at the border.
  const end = (e) => {
    if (e && e.pointerId != null && e.pointerId !== activeId.current) return;
    activeId.current = null;
    if (!drawing.current) return; drawing.current = false; persist();
  };

  const undo = () => {
    const s = undoStack.current; if (!s.length) return;
    try { redoStack.current.push(ctxRef.current.getImageData(0, 0, RES, RES)); if (redoStack.current.length > 16) redoStack.current.shift(); setCanRedo(true); } catch { /* unavailable */ }
    ctxRef.current.putImageData(s.pop(), 0, 0); setCanUndo(s.length > 0); persist();
    advSfx('tap'); say('Undo');
  };
  const redo = () => {
    const r = redoStack.current; if (!r.length) return;
    try { undoStack.current.push(ctxRef.current.getImageData(0, 0, RES, RES)); if (undoStack.current.length > 16) undoStack.current.shift(); setCanUndo(true); } catch { /* unavailable */ }
    ctxRef.current.putImageData(r.pop(), 0, 0); setCanRedo(r.length > 0); persist();
    advSfx('tap'); say('Redo');
  };
  const wipe = () => { setAskClear(false); pushUndo(); clearAll(); setInk(false); flushPersist(); speak('All clean!'); advSfx('no'); };

  const exportArt = (size = 480, type = 'image/png', q) => {
    const out = document.createElement('canvas'); out.width = size; out.height = size;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#fffdf9'; ctx.fillRect(0, 0, size, size);
    if (tmpl !== 'blank' && OUTLINE[tmpl]) {
      ctx.save(); ctx.translate(size * .06, size * .06); ctx.scale(size * .88 / 100, size * .88 / 100);
      ctx.strokeStyle = '#d9c4ad'; ctx.lineWidth = GUIDE_W; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      try { ctx.stroke(new Path2D(OUTLINE[tmpl])); } catch { /* Path2D unsupported */ }
      ctx.restore();
    }
    ctx.drawImage(canvasRef.current, 0, 0, size, size);
    return out.toDataURL(type, q);
  };
  const finish = () => {
    if (!hasInk) return;
    flushPersist();
    const full = exportArt(); // 480 PNG for instant Save / Print
    const thumb = exportArt(260, 'image/webp', 0.85); // small webp kept in the gallery so localStorage stays light
    const tl = TEMPLATES.find((x) => x.id === tmpl);
    const item = { id: artId(), template: tmpl, label: tl ? tl.label : 'Painting', data: thumb };
    const ng = [item, ...gallery].slice(0, 24);
    let ok = true;
    try { localStorage.setItem(galleryKey, JSON.stringify(ng)); } catch { ok = false; } // honest about quota/private-mode
    setGallery(ng); setSaveOk(ok);
    setDoneArt(full); setBurst(!prefersCalm()); // honour the in-app motion toggle, not just the OS pref
    advSfx('win'); vibrate([30, 40, 30]);
    const cName = (COLORS.find((c) => c.hex === color) || {}).name;
    const subj = tl && tl.id !== 'blank' ? `${cName ? cName.toLowerCase() + ' ' : ''}${tl.label.toLowerCase()}` : null;
    // Name what they made + a letter bridge to the alphabet zone ("Cat starts with C").
    speak(subj ? `Wow, a ${subj}! ${tl.label} starts with ${tl.label[0]}.` : PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  };
  // All output is client-side only — nothing is ever uploaded.
  const downloadArt = (dataUrl, label) => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl; a.download = `pip-${(label || 'painting').replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    advSfx('tap'); say('Saved to your device');
  };
  const saveToDevice = () => downloadArt(doneArt, (TEMPLATES.find((x) => x.id === tmpl) || {}).label);
  // Print via a hidden iframe (NOT window.open) so an installed standalone PWA
  // never dumps a child out into raw browser chrome they can't escape.
  const printArt = (dataUrl) => {
    if (!dataUrl) return;
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(f);
    const doc = f.contentWindow.document;
    doc.open();
    doc.write(`<!doctype html><title>My painting</title><style>@page{margin:1cm}html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh}</style><img src="${dataUrl}">`);
    doc.close();
    const go = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { /* print unavailable */ } setTimeout(() => f.remove(), 1500); };
    const img = doc.querySelector('img');
    if (img && !img.complete) { img.onload = go; img.onerror = go; } else { setTimeout(go, 80); }
    advSfx('tap'); say('Printing your painting');
  };
  const removeArt = (id) => {
    const ng = gallery.filter((a) => a.id !== id);
    try { localStorage.setItem(galleryKey, JSON.stringify(ng)); } catch { /* quota */ }
    setGallery(ng); setViewArt(null); advSfx('tap'); say('Painting deleted');
  };
  const fresh = () => {
    setDoneArt(null); undoStack.current = []; setCanUndo(false); redoStack.current = []; setCanRedo(false);
    clearAll(); setInk(false); flushPersist(); // removes the now-empty doodle + refreshes the dots
  };

  return (
    <div className="level paint-level" data-screen-label="Paint studio" ref={rootRef}>
      <div className="level-hud">
        <button className="gbtn white round" data-nav aria-label="Back to map" data-testid="level-exit" onClick={() => { flushPersist(); onExit(); }} style={{ minHeight: 50, width: 50 }}><I n="close" s={22} /></button>
        <span className="hud-brand" style={{ fontSize: 22 }}>Paint Studio 🎨</span>
        <span style={{ flex: 1 }} />
        <button className="gbtn gold small" data-nav data-testid="paint-done" disabled={!hasInk} onClick={finish}>
          <I n="check" s={20} /> I&apos;m done!
        </button>
      </div>

      <div className="paint-body">
        <div className="paint-tmpls" role="tablist" aria-label="Coloring pages">
          {TEMPLATES.map((t) => (
            <button key={t.id} className={`ptmpl ${tmpl === t.id ? 'on' : ''}`} role="tab" data-nav aria-selected={tmpl === t.id}
              aria-label={inked.has(t.id) ? `${t.label} (has your drawing)` : t.label}
              data-testid={`paint-tmpl-${t.id}`} onClick={() => switchTmpl(t.id)}>
              {inked.has(t.id) && <span className="ptmpl-dot" aria-hidden="true" />}
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
                <path d={OUTLINE[tmpl]} fill="none" stroke="#a98a54" strokeWidth={GUIDE_W} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            )}
            <canvas ref={canvasRef} className="paint-canvas" data-testid="paint-canvas" aria-label="Drawing canvas"
              style={{ cursor: tool === 'pick' ? 'copy' : tool === 'brush' ? brushCursor(color) : tool === 'fill' ? fillCursor(color) : tool === 'stamp' ? stampCursor(color) : tool === 'eraser' ? eraserCursor : 'crosshair', touchAction: 'none' }}
              {...(dpad ? { 'data-nav': '', 'data-nav-default': '', tabIndex: 0, onKeyDown: onCanvasKey } : {})}
              onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
            {dpad && (
              <div className="paint-dpad-cursor" data-testid="paint-dpad-cursor" aria-hidden="true"
                style={{ left: `${cur.c * 100 / GRID}%`, top: `${cur.r * 100 / GRID}%`, width: `${100 / GRID}%`, height: `${100 / GRID}%` }} />
            )}
            {!hasInk && tmpl === 'blank' && !dpad && <div className="paint-hint" role="note">Pick a colour and draw! ✏️</div>}
            {!hasInk && dpad && <div className="paint-hint" role="note">Move with the arrows, press OK to color! 🎨</div>}
          </div>
        </div>

        <div className="paint-rail">
          <div className="paint-swatches" role="radiogroup" aria-label="Colors">
            {COLORS.map((c) => (
              <button key={c.hex} className={`pswatch ${color === c.hex && tool !== 'eraser' ? 'sel' : ''}`}
                role="radio" data-nav aria-checked={color === c.hex && tool !== 'eraser'} aria-label={c.name}
                style={{ background: c.hex }} onClick={() => { const wasEraser = tool === 'eraser'; setColor(c.hex); if (wasEraser) setTool('brush'); advSfx('tap'); speak(wasEraser ? `${c.name} brush` : c.name); }} />
            ))}
          </div>

          <div className="rail-sep" />

          <div className="ptools tools-grid" role="radiogroup" aria-label="Tools">
            {[
              { id: 'brush', label: 'Brush', icon: 'brush' },
              { id: 'fill', label: 'Magic fill', icon: 'fill' },
              { id: 'stamp', label: 'Stamps', icon: 'star' },
              { id: 'eraser', label: 'Eraser', icon: 'eraser' },
              { id: 'pick', label: 'Color picker', icon: 'eye' },
            ].map((t) => (
              <button key={t.id} className={`ptool ${tool === t.id ? 'sel' : ''}`} role="radio" data-nav aria-checked={tool === t.id}
                aria-label={t.label} data-testid={`paint-tool-${t.id}`}
                onClick={() => { setTool(t.id); advSfx('tap'); speak(t.label + '!'); }}>
                <I n={t.icon} s={24} />
              </button>
            ))}
          </div>

          <button className={`pmirror ${mirror ? 'on' : ''}`} data-nav aria-pressed={mirror} data-testid="paint-mirror"
            onClick={() => { say(!mirror ? 'Mirror on' : 'Mirror off'); setMirror((m) => !m); advSfx('tap'); }}>
            <I n="mirror" s={18} /> <small>Mirror{mirror ? ' on' : ''}</small>
          </button>

          {tool === 'brush' && (
            <div className="paint-subrow" role="radiogroup" aria-label="Brush style">
              {BRUSH_TYPES.map((b) => (
                <button key={b.id} className={`pchip ${bType === b.id ? 'on' : ''}`} role="radio" data-nav aria-checked={bType === b.id}
                  data-testid={`paint-brush-${b.id}`} onClick={() => { setBType(b.id); advSfx('tap'); speak(b.label); }}>
                  {b.id === 'rainbow' ? <span className="pdot rainbow" /> : b.id === 'marker' ? <span className="pdot" style={{ background: color }} /> : <I n={b.id === 'spray' ? 'spray' : 'sparkle'} s={17} />}
                  {b.label}
                </button>
              ))}
            </div>
          )}
          {tool === 'stamp' && (
            <div className="paint-subrow" role="radiogroup" aria-label="Stamp shape">
              {STAMPS.map((s) => (
                <button key={s.id} className={`pchip ${stamp === s.id ? 'on' : ''}`} role="radio" data-nav aria-checked={stamp === s.id}
                  data-testid={`paint-stamp-${s.id}`} onClick={() => { setStamp(s.id); advSfx('tap'); speak(s.label); }}>{s.label}</button>
              ))}
            </div>
          )}

          <div className="ptools size-row" role="radiogroup" aria-label="Size">
            {SIZES.map((b) => (
              <button key={b.id} className={`ptool ${size === b.w ? 'sel' : ''}`} role="radio" data-nav aria-checked={size === b.w}
                aria-label={`Size ${b.id === 's' ? 'small' : b.id === 'm' ? 'medium' : 'big'}`}
                onClick={() => { setSize(b.w); advSfx('tap'); say(`${b.id === 's' ? 'Small' : b.id === 'm' ? 'Medium' : 'Big'} brush`); }}>
                <span className="pdot" style={{ width: b.dot, height: b.dot, background: tool === 'eraser' ? '#a8b0bc' : color }} />
              </button>
            ))}
          </div>

          <div className="ptools act-row">
            <button className="ptool" data-nav aria-label="Undo" disabled={!canUndo} onClick={undo}><I n="undo" s={24} /></button>
            <button className="ptool" data-nav aria-label="Redo" disabled={!canRedo} onClick={redo}><I n="redo" s={24} /></button>
          </div>

          <button className="clear-btn" data-nav aria-label="Start over" data-testid="paint-clear" onClick={() => { advSfx('tap'); setAskClear(true); }}>
            <I n="trash" s={18} /> <small>Start over</small>
          </button>

          {gallery.length > 0 && (
            <button className="paint-shelf-btn" data-nav data-testid="paint-gallery-open" aria-label={`My art, ${gallery.length} paintings`}
              onClick={() => { advSfx('tap'); setShowGallery(true); }}>
              <div className="paint-shelf" aria-hidden="true">
                {gallery.slice(0, 6).map((a) => <img key={a.id} src={a.data} alt="" />)}
              </div>
              <small>My art ({gallery.length}) ▸</small>
            </button>
          )}
        </div>
      </div>

      {askClear && (
        <div className="complete-scrim" data-testid="paint-clear-confirm">
          <div className="complete-card" role="dialog" aria-modal="true" aria-label="Keep your picture?">
            <HeroMascot state="encourage" size={90} />
            <h2>Keep your picture?</h2>
            <p>You worked hard on this!</p>
            <div className="complete-actions">
              <button className="gbtn gold" data-nav data-nav-default="" data-testid="paint-clear-keep" onClick={() => { advSfx('tap'); setAskClear(false); }}>Keep painting</button>
              <button className="clear-confirm-wipe" data-nav data-testid="paint-clear-wipe" onClick={wipe}>Start over with a clean page</button>
            </div>
          </div>
        </div>
      )}
      {doneArt && (
        <div className="complete-scrim" data-testid="paint-complete">
          <div className="complete-card" role="dialog" aria-modal="true" aria-label="Beautiful!">
            <HeroMascot state="cheer" size={90} />
            {Star && <div className="paint-stars">{[0, 1, 2].map((i) => <Star key={i} s={34} />)}</div>}
            <div className="paint-frame"><img src={doneArt} alt="Your finished painting" /></div>
            <h2>Beautiful!</h2>
            {tmpl !== 'blank' && <p className="done-subject">You painted a <b>{(TEMPLATES.find((x) => x.id === tmpl) || {}).label}</b>!</p>}
            <p>{saveOk ? 'Saved to your art shelf.' : "Couldn't save it here — tap Save it to keep it!"}</p>
            <div className="complete-actions">
              <button className={saveOk ? 'gbtn blue' : 'gbtn gold'} data-nav data-nav-default="" data-testid="paint-save-device" onClick={saveToDevice}><I n="paper" s={18} /> Save it</button>
              <button className="gbtn blue" data-nav data-testid="paint-print" onClick={() => printArt(doneArt)}><I n="print" s={18} /> Print</button>
              <button className="gbtn" data-nav onClick={fresh}>Paint another</button>
              <button className="gbtn gold" data-nav onClick={() => { setDoneArt(null); onExit(); }}>Back to the map</button>
            </div>
            <p className="gallery-privacy">Your art stays on this device. 🔒</p>
          </div>
        </div>
      )}
      {showGallery && (
        <div className="complete-scrim" data-testid="paint-gallery" onClick={() => setShowGallery(false)}>
          <div className="gallery-card" role="dialog" aria-modal="true" aria-label="My Art" onClick={(e) => e.stopPropagation()}>
            <h2>My Art</h2>
            <div className="gallery-grid">
              {gallery.map((a, gi) => (
                <button key={a.id} className="gallery-item" data-nav data-nav-default={gi === 0 ? '' : undefined} data-testid="paint-gallery-item" onClick={() => { advSfx('tap'); setConfirmDel(false); setViewArt(a); }}>
                  <img src={a.data} alt={`My ${a.label} painting`} />
                </button>
              ))}
            </div>
            <p className="gallery-privacy">All your art stays on this device. 🔒</p>
            <button className="gbtn gold" data-nav onClick={() => setShowGallery(false)}>Close</button>
          </div>
        </div>
      )}
      {viewArt && (
        <div className="complete-scrim" data-testid="paint-gallery-view" onClick={() => { setConfirmDel(false); setViewArt(null); }}>
          <div className="complete-card" role="dialog" aria-modal="true" aria-label="Your painting" onClick={(e) => e.stopPropagation()}>
            <div className="paint-frame"><img src={viewArt.data} alt={`My ${viewArt.label} painting`} /></div>
            {confirmDel ? (
              <>
                <h2>Throw it away?</h2>
                <div className="complete-actions">
                  <button className="gbtn gold" data-nav data-nav-default="" onClick={() => { advSfx('tap'); setConfirmDel(false); }}>Keep it</button>
                  <button className="clear-confirm-wipe" data-nav data-testid="paint-art-delete-yes" onClick={() => { setConfirmDel(false); removeArt(viewArt.id); }}>Yes, throw it away</button>
                </div>
              </>
            ) : (
              <>
                <h2>You painted this!</h2>
                <div className="complete-actions">
                  <button className="gbtn blue" data-nav data-nav-default="" onClick={() => printArt(viewArt.data)}><I n="print" s={18} /> Print</button>
                  <button className="gbtn blue" data-nav onClick={() => downloadArt(viewArt.data, viewArt.label)}><I n="paper" s={18} /> Save it</button>
                  <button className="gbtn gold" data-nav onClick={() => setViewArt(null)}>Back</button>
                </div>
                <button className="clear-confirm-wipe" data-nav data-testid="paint-art-delete" onClick={() => { advSfx('tap'); setConfirmDel(true); }}>Delete this painting</button>
              </>
            )}
          </div>
        </div>
      )}
      {burst && <Burst onDone={() => setBurst(false)} />}
    </div>
  );
}
