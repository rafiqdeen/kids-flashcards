// capture.mjs — screenshot the reference prototype AND the built impl at the
// same routes/viewports/state, with seeded RNG + reduced motion, into
// visual-tests/ref/ and visual-tests/impl/.
//
// Usage:
//   node visual-tests/capture.mjs               # both targets, all screens
//   node visual-tests/capture.mjs impl world    # only impl, only screens matching "world"
//   node visual-tests/capture.mjs ref           # only the reference target
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCREENS, waitLabel } from './screens.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REF_DIR = '/Users/rafiq/Downloads/design_handoff_pip_cards_adventure';
const IMPL_DIR = path.join(ROOT, 'dist');
const REF_ENTRY = '/Pip%20Cards%20Adventure.html';

const VIEWPORTS = { phone: { width: 390, height: 844 }, tablet: { width: 834, height: 1112 } };
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.jsx': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.m4a': 'audio/mp4',
};

function serve(dir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const file = path.join(dir, p);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, port: server.address().port })));
}

async function capture(browser, { target, base, entry }, filter) {
  const seedJs = fs.readFileSync(path.join(__dirname, 'seed.js'), 'utf8');
  const outDir = path.join(__dirname, target);
  fs.mkdirSync(outDir, { recursive: true });
  const screens = SCREENS.filter((s) => !filter || s.name.includes(filter));

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    for (const screen of screens) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      await ctx.addInitScript(seedJs);
      // neutralize the service worker so reloads always hit the static server
      await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      const page = await ctx.newPage();
      try {
        await page.goto(base + (entry || '/'), { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector('[data-screen-label],[data-testid]', { timeout: 25000 });
        await screen.prep(page);
        if (screen.label) await waitLabel(page, screen.label);
        // The reduced-motion CSS collapses animations via `* {...}`, but `*`
        // does not match pseudo-elements, so the current node's pulse ring
        // (.node.current .node-btn::after) keeps animating in BOTH ref and impl
        // and is caught at different phases per load. Freeze just that ring to
        // its rest state, identically for both targets, for a deterministic diff.
        await page.addStyleTag({ content: '.node-btn::after { animation: none !important; transform: none !important; }' }).catch(() => {});
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForTimeout(350);
        const out = path.join(outDir, `${screen.name}-${vpName}.png`);
        await page.screenshot({ path: out });
        process.stdout.write(`  ✓ ${target}/${screen.name}-${vpName}\n`);
      } catch (e) {
        process.stdout.write(`  ✗ ${target}/${screen.name}-${vpName}: ${e.message.split('\n')[0]}\n`);
      } finally {
        await ctx.close();
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const onlyTarget = args.find((a) => a === 'ref' || a === 'impl');
  const filter = args.find((a) => a !== 'ref' && a !== 'impl');

  const ref = await serve(REF_DIR);
  const impl = await serve(IMPL_DIR);
  const browser = await chromium.launch();
  try {
    const targets = [
      { target: 'ref', base: `http://localhost:${ref.port}`, entry: REF_ENTRY },
      { target: 'impl', base: `http://localhost:${impl.port}`, entry: '/' },
    ].filter((t) => !onlyTarget || t.target === onlyTarget);
    for (const t of targets) { console.log(`\n[${t.target}] ${t.base}${t.entry}`); await capture(browser, t, filter); }
  } finally {
    await browser.close();
    ref.server.close(); impl.server.close();
  }
}

main();
