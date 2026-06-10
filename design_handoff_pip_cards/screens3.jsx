// screens3.jsx — Paint / coloring studio (v2: brush styles, fill bucket, stamps, more pages)
(function () {
  const { useRef, useEffect, useState } = React;

  const PAINT_COLORS = [
    { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' }, { name: 'Yellow', hex: '#fbbf24' },
    { name: 'Green', hex: '#22c55e' }, { name: 'Teal', hex: '#14b8a6' }, { name: 'Sky blue', hex: '#38bdf8' },
    { name: 'Blue', hex: '#3b82f6' }, { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' },
    { name: 'Brown', hex: '#92400e' }, { name: 'Black', hex: '#1c1917' }, { name: 'White', hex: '#ffffff' },
  ];
  const BRUSHES = [{ id: 's', w: 14, dot: 10 }, { id: 'm', w: 30, dot: 16 }, { id: 'l', w: 56, dot: 24 }];

  // Outline templates — stroke-only guides on a 0..100 viewBox.
  const OUTLINE = {
    cat: 'M30 24 L24 6 L46 22 M70 24 L76 6 L54 22 M50 30 m-30 8 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 M40 50 h0 M60 50 h0 M50 56 l-5 5 5 3 5 -3Z M20 60 h-12 M20 66 h-12 M80 60 h12 M80 66 h12',
    apple: 'M50 28 q3 -12 16 -13 M50 30 C28 22 15 42 23 62 c6 18 19 26 27 26 s21 -8 27 -26 c8 -20 -7 -40 -27 -32Z M66 22 q14 -6 16 6 q-12 4 -16 -6Z',
    star: 'M50 10 l11 26 28 2 -21 18 7 27 -25 -15 -25 15 7 -27 -21 -18 28 -2Z',
    sun: 'M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 M50 18 v-12 M50 94 v-12 M18 50 h-12 M94 50 h-12 M27 27 l-8 -8 M81 81 l-8 -8 M73 27 l8 -8 M19 81 l8 -8',
    fish: 'M66 50 L92 32 q5 18 0 36Z M14 50 q0 -24 28 -24 q26 0 26 24 q0 24 -26 24 q-28 0 -28 -24Z M30 44 h0 M44 70 q14 -8 14 -20 q0 -12 -14 -20',
    flower: 'M50 50 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M50 41 q-14 -16 0 -26 q14 10 0 26 M59 50 q16 -14 26 0 q-10 14 -26 0 M50 59 q14 16 0 26 q-14 -10 0 -26 M41 50 q-16 14 -26 0 q10 -14 26 0 M50 76 v18',
    house: 'M18 50 L50 20 L82 50 M26 46 v36 h48 v-36 M44 82 v-22 h12 v22 M60 56 h12 v12 h-12Z M50 20 v-8 h8 v8',
    car: 'M12 64 h76 M16 64 v-8 q0 -4 4 -4 h10 l10 -14 h24 l10 14 h10 q4 0 4 4 v8 M42 38 v14 M30 52 h44 M30 72 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M70 72 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',
    butterfly: 'M50 28 v48 M50 36 q-26 -22 -34 -2 q-6 16 14 18 q-18 4 -10 18 q8 12 30 -8 M50 36 q26 -22 34 -2 q6 16 -14 18 q18 4 10 18 q-8 12 -30 -8 M44 26 q-6 -10 -12 -12 M56 26 q6 -10 12 -12',
    balloon: 'M50 12 q-22 0 -22 25 q0 22 22 27 q22 -5 22 -27 q0 -25 -22 -25Z M46 65 l4 7 l4 -7 M50 72 q-8 12 0 22',
    rocket: 'M50 8 q15 13 15 36 q0 15 -7 26 h-16 q-7 -11 -7 -26 q0 -23 15 -36Z M50 36 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M42 70 l-12 16 l14 -5 M58 70 l12 16 l-14 -5 M46 84 q4 8 8 0',
    icecream: 'M34 46 h32 l-16 44Z M34 46 a16 16 0 0 1 32 0 M38 34 a12 12 0 0 1 24 0',
    blank: null,
  };
  const TEMPLATES = [
    { id: 'blank', label: 'Blank' }, { id: 'cat', label: 'Cat' }, { id: 'apple', label: 'Apple' },
    { id: 'star', label: 'Star' }, { id: 'sun', label: 'Sun' }, { id: 'fish', label: 'Fish' },
    { id: 'flower', label: 'Flower' }, { id: 'house', label: 'House' }, { id: 'car', label: 'Car' },
    { id: 'butterfly', label: 'Butterfly' }, { id: 'balloon', label: 'Balloon' }, { id: 'rocket', label: 'Rocket' },
    { id: 'icecream', label: 'Ice cream' },
  ];
  const RES = 1000;

  const BRUSH_TYPES = [
    { id: 'marker', label: 'Marker' }, { id: 'rainbow', label: 'Rainbow' },
    { id: 'spray', label: 'Spray' }, { id: 'sparkle', label: 'Sparkle' },
  ];
  const STAMP_SHAPES = [
    { id: 'star', label: 'Star' }, { id: 'heart', label: 'Heart' },
    { id: 'flower', label: 'Flower' }, { id: 'smile', label: 'Smiley' },
  ];

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  function drawStar(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = rot + i * Math.PI / 5 - Math.PI / 2;
      i === 0 ? ctx.moveTo(x + rad * Math.cos(a), y + rad * Math.sin(a)) : ctx.lineTo(x + rad * Math.cos(a), y + rad * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }
  function drawHeart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r, x, y - r * 0.35);
    ctx.bezierCurveTo(x + r * 0.7, y - r, x + r * 1.4, y - r * 0.1, x, y + r * 0.9);
    ctx.closePath(); ctx.fill();
  }
  function drawFlower(ctx, x, y, r) {
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ctx.beginPath(); ctx.arc(x + r * 0.6 * Math.cos(a), y + r * 0.6 * Math.sin(a), r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    const old = ctx.fillStyle; ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = old;
  }
  function drawSmile(ctx, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    const old = ctx.fillStyle;
    ctx.fillStyle = '#fffdf9';
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.2, r * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.2, r * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fffdf9'; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.45, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.fillStyle = old;
  }
  const STAMP_FNS = { star: (c, x, y, r) => drawStar(c, x, y, r, Math.random() * Math.PI), heart: drawHeart, flower: drawFlower, smile: drawSmile };

  function TemplateGuide({ id }) {
    if (id === 'blank' || !OUTLINE[id]) return null;
    return (
      <svg className="doodle-guide" viewBox="0 0 100 100" aria-hidden="true">
        <path d={OUTLINE[id]} fill="none" stroke="#d9c4ad" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  function Paint({ onBack, onSaveArt, onRewards, mascot, speak, isWeb }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawing = useRef(false);
    const lastPt = useRef(null);
    const undoStack = useRef([]);
    const hueRef = useRef(0);
    const distRef = useRef(0);
    const [color, setColor] = useState('#ef4444');
    const [brush, setBrush] = useState(BRUSHES[1].w);
    const [tool, setTool] = useState('brush');           // brush | fill | stamp | eraser
    const [brushType, setBrushType] = useState('marker'); // marker | rainbow | spray | sparkle
    const [stampShape, setStampShape] = useState('star');
    const [template, setTemplate] = useState('cat');
    const [canUndo, setCanUndo] = useState(false);
    const [hasInk, setHasInk] = useState(false);
    const [doneArt, setDoneArt] = useState(null);
    const [celebrate, setCelebrate] = useState(false);
    const [askClear, setAskClear] = useState(false);

    useEffect(() => {
      const c = canvasRef.current;
      c.width = RES; c.height = RES;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctxRef.current = ctx;
      restore('cat');
      // eslint-disable-next-line
    }, []);

    const storeKey = (t) => `pip-doodle-${t}`;
    const persist = () => { try { localStorage.setItem(storeKey(template), canvasRef.current.toDataURL('image/png')); } catch (e) {} };
    const clearCanvas = () => ctxRef.current.clearRect(0, 0, RES, RES);
    const restore = (t) => {
      clearCanvas();
      let data; try { data = localStorage.getItem(storeKey(t)); } catch (e) {}
      if (data) { const img = new Image(); img.onload = () => ctxRef.current.drawImage(img, 0, 0, RES, RES); img.src = data; }
      setHasInk(!!data);
      undoStack.current = []; setCanUndo(false);
    };
    const switchTemplate = (t) => {
      persist(); setTemplate(t); restore(t);
      const tl = TEMPLATES.find(x => x.id === t);
      if (tl && t !== 'blank') { speak(`Color the ${tl.label.toLowerCase()}`); announce(`Color the ${tl.label}`); }
    };

    const pos = (e) => {
      const c = canvasRef.current, r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (RES / r.width), y: (e.clientY - r.top) * (RES / r.height) };
    };
    const pushUndo = () => {
      try {
        undoStack.current.push(ctxRef.current.getImageData(0, 0, RES, RES));
        if (undoStack.current.length > 10) undoStack.current.shift();
        setCanUndo(true);
      } catch (e) {}
    };

    // ---- mark-making per tool/brush type ----
    const dab = (p) => {
      const ctx = ctxRef.current;
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath(); ctx.arc(p.x, p.y, brush * 0.9, 0, Math.PI * 2); ctx.fill();
        return;
      }
      ctx.globalCompositeOperation = 'source-over';
      if (tool === 'stamp') {
        ctx.fillStyle = color;
        STAMP_FNS[stampShape](ctx, p.x, p.y, brush * 1.6);
        return;
      }
      // brush types
      if (brushType === 'spray') {
        ctx.fillStyle = color;
        for (let i = 0; i < brush * 1.5; i++) {
          const a = Math.random() * Math.PI * 2, rr = Math.random() * brush * 1.4;
          ctx.globalAlpha = 0.5 + Math.random() * 0.5;
          ctx.fillRect(p.x + rr * Math.cos(a), p.y + rr * Math.sin(a), 3, 3);
        }
        ctx.globalAlpha = 1;
        return;
      }
      if (brushType === 'sparkle') {
        ctx.fillStyle = color;
        drawStar(ctx, p.x, p.y, brush * (0.5 + Math.random() * 0.6), Math.random() * Math.PI);
        ctx.fillStyle = '#ffffff';
        drawStar(ctx, p.x + (Math.random() - .5) * brush, p.y + (Math.random() - .5) * brush, brush * 0.25, Math.random() * Math.PI);
        return;
      }
      // marker / rainbow dot
      ctx.fillStyle = brushType === 'rainbow' ? `hsl(${hueRef.current},90%,55%)` : color;
      ctx.beginPath(); ctx.arc(p.x, p.y, brush / 2, 0, Math.PI * 2); ctx.fill();
    };
    const seg = (a, b) => {
      const ctx = ctxRef.current;
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brush * 1.8; ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        return;
      }
      ctx.globalCompositeOperation = 'source-over';
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (tool === 'stamp' || brushType === 'spray' || brushType === 'sparkle') {
        // spaced dabs along the path
        distRef.current += d;
        const gap = tool === 'stamp' ? brush * 3.2 : brushType === 'sparkle' ? brush * 1.6 : brush * 0.5;
        if (distRef.current >= gap) { distRef.current = 0; dab(b); }
        return;
      }
      if (brushType === 'rainbow') {
        hueRef.current = (hueRef.current + d * 0.25) % 360;
        ctx.strokeStyle = `hsl(${hueRef.current},90%,55%)`;
      } else {
        ctx.strokeStyle = color;
      }
      ctx.lineWidth = brush;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };

    // ---- magic fill bucket (outline-aware flood fill) ----
    const floodFill = (sx, sy) => {
      sx = Math.max(0, Math.min(RES - 1, Math.round(sx)));
      sy = Math.max(0, Math.min(RES - 1, Math.round(sy)));
      const bc = document.createElement('canvas'); bc.width = RES; bc.height = RES;
      const bctx = bc.getContext('2d');
      if (template !== 'blank' && OUTLINE[template]) {
        bctx.save();
        bctx.translate(RES * 0.06, RES * 0.06); bctx.scale(RES * 0.88 / 100, RES * 0.88 / 100);
        bctx.lineWidth = 2.2; bctx.lineJoin = 'round'; bctx.lineCap = 'round'; bctx.strokeStyle = '#000';
        try { bctx.stroke(new Path2D(OUTLINE[template])); } catch (e) {}
        bctx.restore();
      }
      bctx.drawImage(canvasRef.current, 0, 0);
      const bd = bctx.getImageData(0, 0, RES, RES).data;
      const seedIdx = sy * RES + sx;
      if (bd[seedIdx * 4 + 3] > 40) return false; // tapped on a line or paint
      pushUndo();
      const seen = new Uint8Array(RES * RES);
      const out = ctxRef.current.createImageData(RES, RES); const od = out.data;
      const col = hexToRgb(color);
      const stack = [seedIdx]; seen[seedIdx] = 1;
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
      try { canvasRef.current.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or stale pointer */ }
      const p = pos(e);
      if (tool === 'fill') {
        if (floodFill(p.x, p.y)) { setHasInk(true); persist(); speak('Whoosh!'); }
        return;
      }
      pushUndo();
      drawing.current = true; setHasInk(true); lastPt.current = p; distRef.current = 0;
      dab(p);
    };
    const move = (e) => {
      if (!drawing.current) return; e.preventDefault();
      const p = pos(e);
      seg(lastPt.current, p);
      lastPt.current = p;
    };
    const end = () => { if (!drawing.current) return; drawing.current = false; persist(); };

    const pickColor = (c) => { setColor(c.hex); if (tool === 'eraser') setTool('brush'); speak(c.name); announce(c.name); };
    const undo = () => {
      const s = undoStack.current; if (!s.length) return;
      ctxRef.current.putImageData(s.pop(), 0, 0); setCanUndo(s.length > 0); persist();
    };
    const doWipe = () => {
      setAskClear(false);
      pushUndo(); clearCanvas(); persist(); setHasInk(false);
      speak('All clean!'); announce('Cleared');
    };

    const exportArt = () => {
      const out = document.createElement('canvas'); out.width = 480; out.height = 480;
      const ctx = out.getContext('2d');
      ctx.fillStyle = '#fffdf9'; ctx.fillRect(0, 0, 480, 480);
      if (template !== 'blank' && OUTLINE[template]) {
        ctx.save();
        ctx.translate(480 * 0.06, 480 * 0.06); ctx.scale(480 * 0.88 / 100, 480 * 0.88 / 100);
        ctx.strokeStyle = '#d9c4ad'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        try { ctx.stroke(new Path2D(OUTLINE[template])); } catch (e) {}
        ctx.restore();
      }
      ctx.drawImage(canvasRef.current, 0, 0, 480, 480);
      return out.toDataURL('image/png');
    };
    const finish = () => {
      if (!hasInk) return;
      persist();
      const data = exportArt();
      const tl = TEMPLATES.find(x => x.id === template);
      onSaveArt({ id: Date.now(), template, label: tl ? tl.label : 'Painting', data });
      setDoneArt(data); setCelebrate(true);
      speak('Beautiful! I love it!'); announce('Saved to My Treasures!');
    };
    const freshPage = () => {
      setDoneArt(null);
      undoStack.current = []; setCanUndo(false);
      clearCanvas(); setHasInk(false);
      try { localStorage.removeItem(storeKey(template)); } catch (e) {}
    };

    const pickTool = (id, say) => { setTool(id); speak(say); announce(say); };

    return (
      <div className="screen doodle" data-screen-label="Paint">
        <header className="deck-bar">
          <button className="round-btn" aria-label="Back home" data-testid="paint-back" onClick={onBack}><Icon name="back" size={26} /></button>
          <div className="deck-title"><b>Paint &amp; Doodle</b></div>
          <div className="doodle-mini"><Mascot concept={mascot} state="encourage" size={44} /></div>
        </header>

        <div className="template-row" role="tablist" aria-label="Coloring pages">
          {TEMPLATES.map(t => (
            <button key={t.id} className={`tmpl-chip ${template === t.id ? 'on' : ''}`} role="tab" aria-selected={template === t.id}
              onClick={() => switchTemplate(t.id)}>
              {t.id === 'blank'
                ? <span className="tmpl-blank"><Icon name="brush" size={20} /></span>
                : <svg viewBox="0 0 100 100" width="34" height="34" aria-hidden="true"><path d={OUTLINE[t.id]} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>}
              <small>{t.label}</small>
            </button>
          ))}
        </div>

        <div className="doodle-stage">
          <div className="doodle-paper">
            <TemplateGuide id={template} />
            <canvas ref={canvasRef} data-testid="paint-canvas" className="doodle-canvas" aria-label="Drawing canvas"
              style={{ cursor: tool === 'eraser' ? 'cell' : tool === 'fill' ? 'copy' : 'crosshair', touchAction: 'none' }}
              onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} onPointerCancel={end} />
          </div>
        </div>

        <div className="doodle-tools">
          <div className="swatch-row" role="radiogroup" aria-label="Colors">
            {PAINT_COLORS.map(c => (
              <button key={c.hex} className={`paint-swatch ${color === c.hex && tool !== 'eraser' ? 'sel' : ''}`} role="radio" aria-checked={color === c.hex && tool !== 'eraser'}
                aria-label={c.name} style={{ '--sw': c.hex }} onClick={() => pickColor(c)} />
            ))}
          </div>

          <div className="tool-row">
            <div className="tool-group" role="radiogroup" aria-label="Tools">
              <button className={`tool-btn ${tool === 'brush' ? 'sel' : ''}`} aria-label="Brush" data-testid="paint-tool-brush" onClick={() => pickTool('brush', 'Brush!')}><Icon name="brush" size={24} /></button>
              <button className={`tool-btn ${tool === 'fill' ? 'sel' : ''}`} aria-label="Magic fill bucket" data-testid="paint-tool-fill" onClick={() => pickTool('fill', 'Magic fill!')}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M16.6 10.9 7.7 2 6.3 3.4l2.4 2.4-5.2 5.1c-.6.6-.6 1.6 0 2.2l5.5 5.5c.3.3.7.4 1.1.4.4 0 .8-.1 1.1-.4l5.4-5.5c.6-.6.6-1.6 0-2.2zM5.2 12 10 7.2l4.8 4.8zM19 13s-2 2.2-2 3.5c0 1.1.9 2 2 2s2-.9 2-2C21 15.2 19 13 19 13z" /></svg>
              </button>
              <button className={`tool-btn ${tool === 'stamp' ? 'sel' : ''}`} aria-label="Stamps" data-testid="paint-tool-stamp" onClick={() => pickTool('stamp', 'Stamps!')}><Icon name="star" size={24} /></button>
              <button className={`tool-btn ${tool === 'eraser' ? 'sel' : ''}`} aria-label="Eraser" data-testid="paint-eraser" onClick={() => pickTool('eraser', 'Eraser!')}><Icon name="eraser" size={24} /></button>
            </div>

            <div className="brush-group" role="radiogroup" aria-label="Size">
              {BRUSHES.map(b => (
                <button key={b.id} className={`brush-btn ${brush === b.w ? 'sel' : ''}`} role="radio" aria-checked={brush === b.w}
                  aria-label={`Size ${b.id === 's' ? 'small' : b.id === 'm' ? 'medium' : 'big'}`} onClick={() => setBrush(b.w)}>
                  <span className="brush-dot" style={{ width: b.dot, height: b.dot, background: tool === 'eraser' ? 'var(--ink-3)' : color }} />
                </button>
              ))}
            </div>

            <button className="tool-btn" aria-label="Undo" disabled={!canUndo} onClick={undo}><Icon name="undo" size={24} /></button>
            <button className="tool-btn danger" aria-label="Clear page" data-testid="paint-clear" onClick={() => setAskClear(true)}><Icon name="trash" size={24} /></button>
            <button className={`done-art ${hasInk ? 'ready' : ''}`} data-testid="paint-done" disabled={!hasInk} onClick={finish}>
              <Icon name="check" size={22} /> I'm done!
            </button>
          </div>

          {tool === 'brush' && (
            <div className="sub-row" role="radiogroup" aria-label="Brush style">
              {BRUSH_TYPES.map(bt => (
                <button key={bt.id} className={`type-chip ${brushType === bt.id ? 'on' : ''}`} role="radio" aria-checked={brushType === bt.id}
                  data-testid={`paint-brush-${bt.id}`} onClick={() => { setBrushType(bt.id); speak(bt.label); announce(bt.label); }}>
                  {bt.id === 'marker' && <span className="type-dot" style={{ background: color }} />}
                  {bt.id === 'rainbow' && <span className="type-dot rainbow" />}
                  {bt.id === 'spray' && <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="6" cy="6" r="2" /><circle cx="13" cy="4" r="1.5" /><circle cx="18" cy="8" r="2" /><circle cx="9" cy="12" r="1.5" /><circle cx="16" cy="14" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="13" cy="19" r="1.5" /></svg>}
                  {bt.id === 'sparkle' && <Icon name="sparkle" size={18} />}
                  {bt.label}
                </button>
              ))}
            </div>
          )}
          {tool === 'stamp' && (
            <div className="sub-row" role="radiogroup" aria-label="Stamp shape">
              {STAMP_SHAPES.map(s => (
                <button key={s.id} className={`type-chip ${stampShape === s.id ? 'on' : ''}`} role="radio" aria-checked={stampShape === s.id}
                  data-testid={`paint-stamp-${s.id}`} onClick={() => { setStampShape(s.id); speak(s.label); announce(s.label); }}>
                  <StampPreview shape={s.id} color={color} />{s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Confetti show={celebrate} onDone={() => setCelebrate(false)} />
        {askClear && (
          <div className="modal-scrim" data-testid="paint-clear-confirm">
            <div className="trophy-modal">
              <Mascot concept={mascot} state="encourage" size={100} />
              <h2>Start over?</h2>
              <p>Your picture will be wiped clean.</p>
              <div className="trophy-actions">
                <button className="pip-cta" onClick={doWipe}><Icon name="trash" size={20} /> Yes, clean it!</button>
                <button className="pip-cta ghost" onClick={() => setAskClear(false)}>Keep painting</button>
              </div>
            </div>
          </div>
        )}
        {doneArt && (
          <div className="modal-scrim" data-testid="paint-complete">
            <div className="trophy-modal art-done-modal">
              <Mascot concept={mascot} state="cheer" size={110} />
              <div className="art-done-frame"><img src={doneArt} alt="Your finished painting" /></div>
              <h2>Beautiful!</h2>
              <p>Your painting is saved in My Treasures.</p>
              <div className="trophy-actions">
                <button className="pip-cta" onClick={freshPage}><Icon name="brush" size={20} /> Paint another</button>
                <button className="pip-cta ghost" onClick={() => { setDoneArt(null); onRewards(); }}><Icon name="gift" size={20} /> See my treasures</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function StampPreview({ shape, color }) {
    const ref = useRef(null);
    useEffect(() => {
      const c = ref.current; if (!c) return;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 22, 22);
      ctx.fillStyle = color;
      STAMP_FNS[shape](ctx, 11, 11, 8);
    }, [shape, color]);
    return <canvas ref={ref} width="22" height="22" aria-hidden="true" />;
  }

  window.Paint = Paint;
})();
