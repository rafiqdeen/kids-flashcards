// dpad.mjs — D-pad / remote operability E2E. Drives the WHOLE app in TV mode
// (?tv=1) using ONLY the keyboard (Arrows / Enter / Escape — never the mouse), the
// way an Android-TV remote would. For every screen it asserts: focus lands on a real
// control on mount, the arrow keys move focus, Enter activates, and Escape/BACK exits
// to the parent. This proves the app is fully remote-operable.
//
//   node visual-tests/dpad.mjs
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
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

const INIT = `
  try { const ss = window.speechSynthesis; ss.speak = () => {}; ss.cancel = () => {}; ss.resume = () => {}; ss.getVoices = () => []; } catch (e) {}
  window.Audio = class { constructor(s) { this.src = s; } play() { return Promise.resolve(); } pause() {} };
  let s = 0x51a3f >>> 0; Math.random = () => { s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
`;

let passed = 0, failed = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };
const label = (page, l) => page.waitForSelector(`[data-screen-label="${l}"]`, { timeout: 15000 });
const sleep = (page, ms) => page.waitForTimeout(ms);

// What is focused right now (data-testid, else tag + data-nav marker).
const focusedId = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return null;
  return a.getAttribute('data-testid') || (a.matches('[data-nav]') ? `<${a.tagName.toLowerCase()}>` : null);
});
const focusedIsNav = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return !!(a && a !== document.body && a.matches('[data-nav], [role="dialog"] *'));
});

// Reach a target [data-testid] using ONLY arrow keys. Rotates direction whenever a
// press doesn't move focus, and gives up after several dead presses — robust for the
// app's grid/list/row layouts without depending on exact geometry.
const DOCK = new Set(['open-adventure', 'open-play', 'open-story']);
async function reach(page, testid, max = 320) {
  const dirs = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
  let di = 0, stuck = 0, last = null;
  const recent = [];
  for (let i = 0; i < max; i++) {
    const cur = await focusedId(page);
    if (cur === testid) return true;
    // If we drift into the Dock's wrap-around tab row and the target isn't a Dock tab,
    // press Up to hop back out to the content (otherwise Left/Right cycle forever).
    if (DOCK.has(cur) && !DOCK.has(testid)) { await page.keyboard.press('ArrowUp'); await sleep(page, 25); last = cur; continue; }
    // Rotate direction when truly stuck (focus unchanged) OR when cycling (revisiting a
    // recent element) — the latter breaks node↔dock / node↔HUD oscillations so every
    // direction (incl. Up to the HUD) gets tried. Only a true stall counts toward giving up.
    if (cur === last) { di = (di + 1) % 4; if (++stuck >= 8) break; }
    else { stuck = 0; if (recent.includes(cur)) di = (di + 1) % 4; }
    recent.push(cur); if (recent.length > 4) recent.shift();
    last = cur;
    await page.keyboard.press(dirs[di]);
    await sleep(page, 25);
  }
  return (await focusedId(page)) === testid;
}
// Reach a Dock tab deterministically: hop down into the Dock, then cycle the row.
async function reachDock(page, tab) {
  for (let i = 0; i < 8 && !DOCK.has(await focusedId(page)); i++) { await page.keyboard.press('ArrowDown'); await sleep(page, 35); }
  for (let i = 0; i < 5; i++) { if ((await focusedId(page)) === tab) return true; await page.keyboard.press('ArrowRight'); await sleep(page, 35); }
  return (await focusedId(page)) === tab;
}
// Press a key and report whether focus changed (proves arrow nav is live).
async function movesFocus(page, key) {
  const before = await focusedId(page);
  await page.keyboard.press(key); await sleep(page, 40);
  const after = await focusedId(page);
  return before !== after && after != null;
}

async function main() {
  const { server, port } = await serve(DIST);
  const base = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(INIT);
  await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const consoleErrors = [];
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  try {
    // fresh start in TV mode
    await page.goto(base + '?tv=1', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + '?tv=1', { waitUntil: 'networkidle' });
    ok('TV mode active (html[data-tv=on])', await page.evaluate(() => document.documentElement.getAttribute('data-tv') === 'on'));

    // ---- Welcome ----
    await label(page, 'Welcome');
    await sleep(page, 250);
    ok('1. Welcome: focus lands on the start CTA', (await focusedId(page)) === 'welcome-start', `focus=${await focusedId(page)}`);
    await page.keyboard.press('Enter'); // OK
    await label(page, 'Create profile');
    ok('2. Enter on CTA → Create profile', true);

    // ---- Create profile (keyboard only) ----
    await sleep(page, 250);
    ok('   focus lands on the name field', (await focusedId(page)) === 'profile-name', `focus=${await focusedId(page)}`);
    await page.keyboard.type('Alex');
    ok('   ArrowDown escapes the text field', await movesFocus(page, 'ArrowDown'));
    const reachedSave = await reach(page, 'profile-save');
    ok('3. Save button reachable by arrows', reachedSave);
    await page.keyboard.press('Enter');
    await label(page, 'World map');
    ok('4. Enter on Save → World map', true);

    // ---- World: focus lands on the current node; Enter opens it; BACK returns ----
    // (At game start only animals-learn is unlocked — the multi-item arrow test runs
    // later on the Playground shelf, which always has many focusable tiles.)
    await sleep(page, 300);
    const worldFocus = await focusedId(page);
    ok('5. World: focus lands on the current map node', worldFocus === 'node-animals-learn', `focus=${worldFocus}`);
    await page.keyboard.press('Enter'); // OK on the focused node
    await label(page, 'Learn: Animals');
    ok('6. Enter on a node → opens the level', true);
    await sleep(page, 200);
    ok('   Learn: focus lands on the flashcard', (await focusedId(page)) === 'flashcard', `focus=${await focusedId(page)}`);
    await page.keyboard.press('Escape'); // BACK
    await label(page, 'World map');
    ok('7. Escape/BACK returns to the World map', true);

    // ---- Dock: the only route to Play/Stories must be reachable by D-pad ----
    const reachedPlay = await reachDock(page, 'open-play');
    ok('8. Dock "Play" tab reachable by arrows', reachedPlay, `focus=${await focusedId(page)}`);
    await page.keyboard.press('Enter');
    await label(page, 'Playground');
    ok('   Enter → Pip\'s Playground', true);
    await sleep(page, 250);
    ok('   Playground: focus lands on a control', await focusedIsNav(page));
    ok('   arrow keys move focus among the shelf tiles', await movesFocus(page, 'ArrowRight') || await movesFocus(page, 'ArrowDown'));
    // a game tile is focused (the hub default, or whichever the arrows landed on) → open it
    const tileFocus = await focusedId(page);
    ok('9. a game tile is focused and openable', /^activity-/.test(tileFocus || ''), `focus=${tileFocus}`);
    await page.keyboard.press('Enter');
    await sleep(page, 300);
    ok('   Enter opens the game (left the shelf)', !(await page.$('[data-testid="activity-hub"]')));
    await page.keyboard.press('Escape'); // game → shelf
    await page.waitForSelector('[data-testid="activity-hub"]', { timeout: 6000 });
    ok('10. Escape returns game → shelf', true);
    await page.keyboard.press('Escape'); // shelf → world
    await label(page, 'World map');
    ok('    Escape returns shelf → map', true);

    // ---- Stories ----
    await reachDock(page, 'open-story');
    await page.keyboard.press('Enter');
    await label(page, 'Story Land');
    await sleep(page, 250);
    ok('11. Stories tab → Story Land, focus on a book', /^story-/.test((await focusedId(page)) || ''), `focus=${await focusedId(page)}`);
    await page.keyboard.press('Enter'); // open a comic
    await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 8000 });
    ok('    Enter opens a comic book', true);
    await page.keyboard.press('Escape'); // comic → shelf
    await label(page, 'Story Land');
    await page.keyboard.press('Escape'); // shelf → world
    await label(page, 'World map');
    ok('12. Escape chain comic → shelf → map', true);

    // ---- Settings (modal): focus traps, BACK closes ----
    await reach(page, 'open-settings');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="settings-gate"]', { timeout: 6000 });
    await sleep(page, 250);
    ok('13. Settings opens; focus lands on the gate keypad', (await focusedId(page)) === null ? false : true);
    ok('    gate keypad is keyboard-focusable', await page.evaluate(() => !!document.activeElement.closest('[data-testid="settings-gate"]')));
    await page.keyboard.press('Escape'); // BACK closes the modal
    await sleep(page, 200);
    ok('14. Escape closes Settings (back on the map)', !(await page.$('[data-testid="settings-modal"]')) && !!(await page.$('[data-screen-label="World map"]')));

    // ---- Paint (TV grid cursor): open, move cursor, OK fills, BACK exits ----
    await reachDock(page, 'open-play');
    await page.keyboard.press('Enter');
    await label(page, 'Playground');
    // Paint is the 6th game tile — in the 4-column shelf grid it wraps to row 2, beside
    // "unfold". So the D-pad path is: descend column 0 to the Build & Make shelf (lands on
    // unfold), then one Right to paint.
    let cur = await focusedId(page);
    for (let i = 0; i < 9 && cur !== 'activity-unfold' && cur !== 'activity-paint'; i++) {
      if (!(await movesFocus(page, 'ArrowDown'))) break;
      cur = await focusedId(page);
    }
    if (cur === 'activity-unfold') await movesFocus(page, 'ArrowRight');
    const reachedPaint = (await focusedId(page)) === 'activity-paint';
    ok('15. Paint tile reachable by arrows', reachedPaint, `focus=${await focusedId(page)}`);
    await page.keyboard.press('Enter');
    await label(page, 'Paint studio');
    await sleep(page, 300);
    ok('16. Paint: focus lands on the canvas', (await focusedId(page)) === 'paint-canvas', `focus=${await focusedId(page)}`);
    ok('    D-pad grid cursor is shown', !!(await page.$('[data-testid="paint-dpad-cursor"]')));
    // press OK on a few cells (default tool = Magic fill) until the canvas has ink
    let inked = false;
    for (let i = 0; i < 8 && !inked; i++) {
      await page.keyboard.press('Enter'); await sleep(page, 250);
      inked = await page.evaluate(() => !document.querySelector('[data-testid="paint-done"]').disabled);
      if (!inked) await page.keyboard.press(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'][i % 4]);
    }
    ok('17. OK fills a cell (canvas now has ink → "done" enabled)', inked);
    await page.keyboard.press('Escape'); // paint → shelf
    await page.waitForSelector('[data-testid="activity-hub"]', { timeout: 6000 });
    ok('18. Escape exits Paint → shelf', true);

    ok('19. console clean across the whole D-pad journey', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } catch (e) {
    failed++; console.log(`  ✗ journey threw: ${e.message.split('\n')[0]}`);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
