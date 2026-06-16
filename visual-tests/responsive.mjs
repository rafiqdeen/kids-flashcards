// responsive.mjs — verify the impl matches the reference across a range of
// widths (mobile → tablet portrait → desktop), AND that dynamically resizing
// the live app keeps the layout intact with a clean console.
//
//   node visual-tests/responsive.mjs
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { SCREENS, waitLabel } from './screens.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REF_DIR = '/Users/rafiq/Downloads/design_handoff_pip_cards_adventure';
const REF_ENTRY = '/Pip%20Cards%20Adventure.html';
const IMPL_DIR = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jsx': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

// widths beyond the brief's 390 / 834 — small phone, large phone, tablet
// portrait, landscape/desktop. (Spans the 560px CSS breakpoint both ways.)
const SIZES = [
  { name: 'sm-phone', width: 360, height: 740 },
  { name: 'lg-phone', width: 414, height: 896 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
];
// representative screens spanning layout types (HUD/scroll, level shell, grids,
// modal, canvas, comic). Names must exist in screens.mjs.
const SET = ['welcome', 'world', 'learn', 'quiz', 'activity-hub', 'settings-buddy', 'paint', 'story-shelf', 'game-memory', 'create'];
const THRESHOLD = 1.0;

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

async function shoot(browser, base, entry, vp, screen) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(seedJs);
  await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const page = await ctx.newPage();
  await page.goto(base + entry, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('[data-screen-label],[data-testid]', { timeout: 25000 });
  await screen.prep(page);
  if (screen.label) await waitLabel(page, screen.label);
  await page.addStyleTag({ content: '.node-btn::after { animation: none !important; transform: none !important; }' }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(350);
  const buf = await page.screenshot();
  await ctx.close();
  return PNG.sync.read(buf);
}

async function main() {
  const ref = await serve(REF_DIR), impl = await serve(IMPL_DIR);
  const browser = await chromium.launch();
  let worst = 0, fails = 0, n = 0;
  const screens = SCREENS.filter((s) => SET.includes(s.name));
  try {
    console.log('Responsive parity (impl vs reference) across widths:\n');
    for (const vp of SIZES) {
      console.log(`[${vp.name}  ${vp.width}x${vp.height}]`);
      for (const screen of screens) {
        try {
          const a = await shoot(browser, `http://localhost:${ref.port}`, REF_ENTRY, vp, screen);
          const b = await shoot(browser, `http://localhost:${impl.port}`, '/', vp, screen);
          const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
          const m = pixelmatch(a.data, b.data, null, w, h, { threshold: 0.1 });
          const pct = (m / (w * h)) * 100; worst = Math.max(worst, pct); n++;
          const pass = pct <= THRESHOLD; if (!pass) fails++;
          console.log(`  ${screen.name.padEnd(16)} ${pct.toFixed(3)}%  ${pass ? 'PASS' : 'FAIL'}`);
        } catch (e) { fails++; console.log(`  ${screen.name.padEnd(16)} ERROR ${e.message.split('\n')[0]}`); }
      }
    }

    // ---- dynamic resize integrity (live impl) ----
    console.log('\nDynamic resize integrity (live impl, World map):');
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(seedJs);
    await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    const errs = [];
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(`http://localhost:${impl.port}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('pip-profiles', '[{"id":"p1","name":"Sam","buddy":"pip","age":"middle"}]'); localStorage.setItem('pip-active', 'p1'); });
    await page.reload({ waitUntil: 'networkidle' });
    await waitLabel(page, 'World map');
    for (const vp of [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 834, height: 1112 }, { width: 1280, height: 800 }, { width: 360, height: 640 }]) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(150);
      const intact = await page.evaluate(() => {
        const hud = document.querySelector('.world-hud');
        const zone = document.querySelector('.zone');
        const trail = document.querySelector('.trail .node');
        const noHScroll = document.documentElement.scrollWidth <= window.innerWidth + 2;
        return !!(hud && zone && trail) && noHScroll;
      });
      n++; const passR = intact && errs.length === 0;
      if (!passR) fails++;
      console.log(`  ${vp.width}x${vp.height}  ${passR ? 'PASS' : 'FAIL'}${errs.length ? ' (console errors)' : ''}${intact ? '' : ' (layout/elements missing or h-scroll)'}`);
    }
    await ctx.close();
    console.log(`\nworst parity: ${worst.toFixed(3)}%  ·  checks: ${n}  ·  fails: ${fails}`);
  } finally {
    await browser.close();
    ref.server.close(); impl.server.close();
  }
  process.exit(fails ? 1 : 0);
}

main();
