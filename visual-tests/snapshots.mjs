// snapshots.mjs — per-zone pixel regression for EVERY zone's Learn screen, at
// phone + tablet. The prototype has no concept of the 19 non-animals decks, so
// these can't diff against ref/; instead we keep a self-baseline (the approved
// impl) under visual-tests/baseline/ and diff fresh captures against it. First
// run establishes the baseline; later runs fail on any pixel drift (>0.1%).
//
//   node visual-tests/snapshots.mjs            # all zones, both viewports
//   node visual-tests/snapshots.mjs --reset    # rebuild the baseline from current
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { ZONE_CATS } from '../src/adventure/data/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const BASE = path.join(__dirname, 'baseline');
const SNAP = path.join(__dirname, 'snap');
const SDIFF = path.join(__dirname, 'snap-diff');
const THRESHOLD = 0.1; // percent (impl-vs-impl, deterministic — should be ~0)
const RESET = process.argv.includes('--reset');
for (const d of [BASE, SNAP, SDIFF]) fs.mkdirSync(d, { recursive: true });

const VIEWPORTS = { phone: { width: 390, height: 844 }, tablet: { width: 834, height: 1112 } };
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.m4a': 'audio/mp4', '.webp': 'image/webp' };
function serve(dir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const file = path.join(dir, p);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, () => r({ server, port: server.address().port })));
}
const seedJs = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf8');
const STUB = `try { const ss = window.speechSynthesis; ss.speak=()=>{}; ss.cancel=()=>{}; ss.resume=()=>{}; ss.getVoices=()=>[]; } catch(e){}
  window.Audio = class { constructor(s){ this.src=s; } play(){ return Promise.resolve(); } pause(){} };`;
const FREEZE = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}';

function diff(name) {
  const bp = path.join(BASE, name), sp = path.join(SNAP, name);
  if (RESET || !fs.existsSync(bp)) { fs.copyFileSync(sp, bp); return { created: true }; }
  const a = PNG.sync.read(fs.readFileSync(bp)), b = PNG.sync.read(fs.readFileSync(sp));
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const out = new PNG({ width: w, height: h });
  const mismatched = pixelmatch(a.data, b.data, out.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(path.join(SDIFF, name), PNG.sync.write(out));
  return { pct: (mismatched / (w * h)) * 100, dim: a.width !== b.width || a.height !== b.height };
}

async function main() {
  const { server, port } = await serve(DIST);
  const base = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  let created = 0, fails = 0, worst = 0;
  const prog = {}; ZONE_CATS.forEach((c) => { prog[c] = { learnStars: 3, quizStars: 3 }; });

  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await ctx.addInitScript(seedJs);
    await ctx.addInitScript(STUB);
    await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate((prog) => {
      localStorage.clear();
      localStorage.setItem('pip-profiles', JSON.stringify([{ id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' }]));
      localStorage.setItem('pip-active', 'p1');
      localStorage.setItem('pip-adv-prog-p1', JSON.stringify(prog));
    }, prog);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-screen-label="World map"]');

    for (const catId of ZONE_CATS) {
      await page.click(`[data-testid="node-${catId}-learn"]`);
      await page.waitForSelector('[data-testid="flashcard"]');
      await page.addStyleTag({ content: FREEZE }).catch(() => {});
      await page.waitForTimeout(250);
      const name = `${catId}-learn-${vp}.png`;
      await page.screenshot({ path: path.join(SNAP, name) });
      const r = diff(name);
      if (r.created) { created++; }
      else { worst = Math.max(worst, r.pct); if (r.pct > THRESHOLD || r.dim) { fails++; console.log(`  ✗ ${name}  ${r.pct.toFixed(3)}%${r.dim ? ' (DIM CHANGE)' : ''}`); } }
      await page.click('[data-testid="level-exit"]');
      await page.waitForSelector('[data-screen-label="World map"]');
      await page.waitForTimeout(120); // let the world settle before the next zone nav
    }
    await ctx.close();
  }
  await browser.close();
  server.close();

  const total = ZONE_CATS.length * 2;
  if (created) console.log(`\nbaseline ${RESET ? 'reset' : 'established'}: ${created}/${total} snapshots written to visual-tests/baseline/ — re-run to regression-check.`);
  console.log(`${total} snapshots — worst drift ${worst.toFixed(3)}%  threshold ${THRESHOLD}%  fails ${fails}/${created ? total - created : total}`);
  process.exit(fails ? 1 : 0);
}

main();
