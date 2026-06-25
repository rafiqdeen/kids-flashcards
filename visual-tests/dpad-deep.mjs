// dpad-deep.mjs — DEEP D-pad operability: not just "can you reach it" but "can you
// COMPLETE it with only a remote". Plays full flows via keyboard (Arrows/Enter/Escape):
// the core Learn→Quiz→Chest→unlock loop, winning a game + operating its win modal,
// solving the parental math gate, and reading a comic. Each flow is isolated so one
// failure still reports the rest.
//
//   node visual-tests/dpad-deep.mjs
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../src/adventure/data/cards.js';

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
const focusedId = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; return a.getAttribute('data-testid') || (a.matches('[data-nav]') ? `<${a.tagName.toLowerCase()}>` : null); });
const focusedText = (page) => page.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.textContent || '').trim() : null; });
const DOCK = new Set(['open-adventure', 'open-play', 'open-story']);

// Geometry-directed reach: read the target's on-screen rect vs the focused element and
// press the arrow that moves toward it (trying the secondary axis if the primary stalls).
// This mirrors how the real spatial navigator picks, so it converges reliably — a test
// helper must not depend on luck. (Dock tabs use reachDock; everything else uses this.)
async function reach(page, testid, max = 60) {
  for (let i = 0; i < max; i++) {
    const info = await page.evaluate((tid) => {
      const a = document.activeElement;
      const t = document.querySelector(`[data-testid="${tid}"]`);
      if (!t || t.getClientRects().length === 0) return { missing: true };
      if (a === t) return { done: true };
      const tr = t.getBoundingClientRect();
      const ar = (a && a !== document.body) ? a.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      return { dx: (tr.left + tr.width / 2) - (ar.left + ar.width / 2), dy: (tr.top + tr.height / 2) - (ar.top + ar.height / 2) };
    }, testid);
    if (info.done) return true;
    if (info.missing) return false;
    const horiz = Math.abs(info.dx) > Math.abs(info.dy);
    const primary = horiz ? (info.dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (info.dy > 0 ? 'ArrowDown' : 'ArrowUp');
    const secondary = horiz ? (info.dy > 0 ? 'ArrowDown' : 'ArrowUp') : (info.dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    const before = await focusedId(page);
    await page.keyboard.press(primary); await sleep(page, 30);
    if ((await focusedId(page)) === before) { await page.keyboard.press(secondary); await sleep(page, 30); }
  }
  return (await focusedId(page)) === testid;
}
async function reachDock(page, tab) {
  for (let i = 0; i < 8 && !DOCK.has(await focusedId(page)); i++) { await page.keyboard.press('ArrowDown'); await sleep(page, 35); }
  for (let i = 0; i < 5; i++) { if ((await focusedId(page)) === tab) return true; await page.keyboard.press('ArrowRight'); await sleep(page, 35); }
  return (await focusedId(page)) === tab;
}
// Reach a button by its visible text (for the math keypad), rotating on stall.
async function reachText(page, text, max = 40) {
  const dirs = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  let di = 0, stuck = 0, last = null;
  for (let i = 0; i < max; i++) {
    const t = await focusedText(page);
    if (t === text) return true;
    if (t === last) { di = (di + 1) % 4; if (++stuck >= 8) break; } else stuck = 0;
    last = t; await page.keyboard.press(dirs[di]); await sleep(page, 30);
  }
  return (await focusedText(page)) === text;
}
const enter = async (page) => { await page.keyboard.press('Enter'); await sleep(page, 120); };

async function onboard(page, base) {
  await page.goto(base + '?tv=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(base + '?tv=1', { waitUntil: 'networkidle' });
  await label(page, 'Welcome');
  await sleep(page, 200); await enter(page); // start
  await label(page, 'Create profile');
  await sleep(page, 200);
  await page.keyboard.type('Alex');
  await reach(page, 'profile-save'); await enter(page);
  await label(page, 'World map');
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

  // ============ FLOW A: full Learn → Quiz → Chest → unlock, keyboard only ============
  try {
    await onboard(page, base);
    const pid = await page.evaluate(() => localStorage.getItem('pip-active'));
    const animalIds = CARDS.animals.map((c) => c.id);
    // seed all-but-one card mastered so the deck completes in one mark
    await page.evaluate(({ pid, ids }) => localStorage.setItem(`pip-adv-learn-${pid}-animals`, JSON.stringify(ids)), { pid, ids: animalIds.slice(1) });

    // World → open animals Learn (focus lands on the current node)
    await sleep(page, 300);
    await reach(page, 'node-animals-learn'); await enter(page);
    await label(page, 'Learn: Animals');
    await sleep(page, 200);
    // flip the card (OK on the focused flashcard), then mark known → completes the deck
    ok('A1. Learn: flashcard focused on entry', (await focusedId(page)) === 'flashcard', `focus=${await focusedId(page)}`);
    await enter(page); // flip
    await sleep(page, 250);
    const reachedMastered = await reach(page, 'mastered-button');
    ok('A2. "I know this!" reachable after flip', reachedMastered);
    await enter(page); // mark known → deck complete
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
    ok('A3. completing the deck shows the Complete modal', true);
    // Complete modal must be operable: focus on one of its buttons
    await sleep(page, 250);
    const cf = await focusedId(page);
    ok('A4. Complete modal focuses a button', cf === 'complete-next' || cf === 'complete-retry', `focus=${cf}`);
    await reach(page, 'complete-next'); await enter(page); // → Quiz

    // Quiz: answer all correct by reading the target word and picking the matching card
    await label(page, 'Quiz: Animals');
    for (let q = 0; q < 6; q++) {
      await page.waitForSelector('.qprompt b', { timeout: 6000 });
      await sleep(page, 250);
      const word = (await page.textContent('.qprompt b')).trim();
      const idx = await page.evaluate((w) => {
        const cards = [...document.querySelectorAll('[data-testid^="quiz-option-"]')];
        return cards.findIndex((c) => (c.textContent || '').includes(w));
      }, word);
      if (idx < 0) { ok(`A5. quiz q${q + 1}: found the correct option`, false, `word=${word}`); break; }
      await reach(page, `quiz-option-${idx}`);
      await enter(page);
      await sleep(page, 1100);
      if (await page.$('[data-testid="level-complete"]')) break;
    }
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 8000 });
    const stars = await page.$$eval('.bigstars .bstar', (els) => els.filter((e) => !e.classList.contains('empty')).length);
    ok('A5. quiz answered all-correct via remote → 3 stars', stars === 3, `stars=${stars}`);
    await reach(page, 'complete-next'); await enter(page); // → Chest

    // Chest: OK opens it → zone complete
    await label(page, 'Treasure: Animals');
    await sleep(page, 200);
    ok('A6. Chest focused on entry', (await focusedId(page)) === 'reward-chest', `focus=${await focusedId(page)}`);
    await enter(page);
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
    await reach(page, 'complete-next'); await enter(page); // → World
    await label(page, 'World map');
    ok('A7. full Learn→Quiz→Chest loop completed by remote; next zone unlocked',
      !(await page.isDisabled('[data-testid="node-alphabet-learn"]')));
  } catch (e) { failed++; console.log(`  ✗ FLOW A threw: ${e.message.split('\n')[0]}`); }

  // ============ FLOW B: solve the parental math gate with the remote ============
  try {
    await reach(page, 'open-settings'); await enter(page);
    await page.waitForSelector('[data-testid="settings-gate"]', { timeout: 6000 });
    await sleep(page, 200);
    const sum = await page.$eval('.gate2-q', (el) => { const m = el.textContent.match(/(\d+)\s*\+\s*(\d+)/); return String(+m[1] + +m[2]); });
    for (const ch of sum) { await reachText(page, ch); await enter(page); }
    await page.waitForSelector('[data-testid="settings-tab-buddy"]', { timeout: 6000 });
    ok('B1. math gate solved with the remote → Settings opens', true);
    // tabs operable
    await reach(page, 'settings-tab-activities'); await enter(page);
    ok('B2. a Settings tab switches via remote', !!(await page.$('[data-testid="settings-tab-activities"].on')));
    await page.keyboard.press('Escape'); await sleep(page, 200);
    ok('B3. BACK closes Settings', !(await page.$('[data-testid="settings-modal"]')));
  } catch (e) { failed++; console.log(`  ✗ FLOW B threw: ${e.message.split('\n')[0]}`); }

  // ============ FLOW C: a game is operable (OK acts) + its win modal works ============
  // Prize Wheel: OK spins it. (It takes 4 lucky rounds to fully win, so we assert the
  // spin responds to OK — the operability proof — then best-effort spin toward the win
  // modal and, if reached, confirm that modal is remote-operable.)
  try {
    await reachDock(page, 'open-play'); await enter(page);
    await label(page, 'Playground');
    await sleep(page, 300);
    const reachedWheel = await reach(page, 'activity-wheel');
    ok('C1. Prize Wheel tile reachable', reachedWheel, `focus=${await focusedId(page)}`);
    await enter(page); // open
    await label(page, 'Prize Wheel');
    await sleep(page, 300);
    ok('C2. wheel spin control focused on entry', (await focusedId(page)) === 'wheel-spin', `focus=${await focusedId(page)}`);
    await page.keyboard.press('Enter'); // OK → spin
    const spun = await page.waitForSelector('.pw-wheel.spinning', { timeout: 3000 }).then(() => true).catch(() => false);
    ok('C3. OK spins the Prize Wheel (game responds to the remote)', spun);
    // best-effort: keep spinning toward the 4-round win; verify the modal if it appears
    let won = false;
    for (let i = 0; i < 6 && !won; i++) {
      await sleep(page, 1500);
      won = !!(await page.$('[data-testid="activity-complete"]'));
      if (won) break;
      const disabled = await page.$eval('[data-testid="wheel-spin"]', (b) => b.disabled).catch(() => true);
      if (!disabled) await page.keyboard.press('Enter');
    }
    if (won) {
      await sleep(page, 250);
      ok('C4. win modal (StarsModal) is focus-trapped + operable', await page.evaluate(() => !!document.activeElement.closest('[data-testid="activity-complete"]')));
      await reach(page, 'activity-back'); await enter(page);
      ok('C5. "All activities" returns to the shelf', !!(await page.$('[data-testid="activity-hub"]')));
    } else {
      console.log('    (wheel full win not reached within spin budget — operability already proven by C3)');
      await page.keyboard.press('Escape'); await sleep(page, 200); // game → shelf
    }
    await page.keyboard.press('Escape'); await sleep(page, 200); // shelf → world
  } catch (e) { failed++; console.log(`  ✗ FLOW C threw: ${e.message.split('\n')[0]}`); }

  // ============ FLOW D: read a comic to a branch/end with the remote ============
  try {
    await label(page, 'World map').catch(() => {});
    await reachDock(page, 'open-story'); await enter(page);
    await label(page, 'Story Land');
    await sleep(page, 250);
    await enter(page); // open the focused book
    await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 8000 });
    // advance through up to 8 pages: focus the primary button (Reveal/Next/choice) and OK
    let endedOrChose = false;
    for (let i = 0; i < 12; i++) {
      await sleep(page, 250);
      if (await page.$('[data-testid="story-again"]')) { endedOrChose = true; break; }       // reached the end
      if (await page.$('[data-testid="story-choices"]')) { endedOrChose = true; break; }      // hit a choice branch
      // press OK on whatever primary control is focused (Reveal panels, then Next)
      const fid = await focusedId(page);
      if (fid === 'story-next' || fid === null) { await reach(page, 'story-next').catch(() => {}); }
      await enter(page);
    }
    ok('D1. comic advances page-by-page via remote (reached an end or a choice)', endedOrChose);
    await page.keyboard.press('Escape'); await sleep(page, 200); // comic → shelf
    ok('D2. BACK leaves the comic to the shelf', !!(await page.$('[data-screen-label="Story Land"]')));
  } catch (e) { failed++; console.log(`  ✗ FLOW D threw: ${e.message.split('\n')[0]}`); }

  ok('Z. console clean across all deep flows', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

  await browser.close();
  server.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
