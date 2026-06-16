// e2e.mjs — full end-to-end journey through the built app (headless Chromium),
// asserting each waypoint and a clean console. Complements the per-screen pixel
// diffs (diff.mjs) and the unit-ish behavior checks (functional.mjs).
//
//   node visual-tests/e2e.mjs
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

// seeded RNG (deterministic quiz shuffle/gate) + patched speechSynthesis.
const INIT = `
  try { const ss = window.speechSynthesis; ss.speak = () => {}; ss.cancel = () => {}; ss.resume = () => {}; ss.getVoices = () => []; } catch (e) {}
  // narration plays pre-baked audio clips for covered lines — stub Audio so the
  // headless run neither loads files nor logs autoplay/decode console errors.
  window.Audio = class { constructor(s) { this.src = s; } play() { return Promise.resolve(); } pause() {} };
  let s = 0x51a3f >>> 0; Math.random = () => { s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
`;

let passed = 0, failed = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };
const label = (page, l) => page.waitForSelector(`[data-screen-label="${l}"]`, { timeout: 15000 });

async function solveGate(page) {
  const sum = await page.$eval('.gate2-q', (el) => { const m = el.textContent.match(/(\d+)\s*\+\s*(\d+)/); return String(+m[1] + +m[2]); });
  for (const ch of sum) await page.evaluate((d) => { const b = [...document.querySelectorAll('.gate2-key')].find((k) => k.textContent.trim() === d); b && b.click(); }, ch);
}

async function main() {
  const { server, port } = await serve(DIST);
  const base = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(INIT);
  await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const consoleErrors = [];
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  try {
    // ---- onboarding ----
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await label(page, 'Welcome');
    ok('1. first run shows Welcome', true);

    // ---- create profile (required name) ----
    await page.click('[data-testid="welcome-start"]');
    await label(page, 'Create profile');
    ok('2. Save disabled until name typed', await page.isDisabled('[data-testid="profile-save"]'));
    await page.fill('[data-testid="profile-name"]', 'Alex');
    await page.click('[data-testid="profile-buddy-fox"]');
    await page.click('[data-testid="profile-age-big"]');
    await page.click('[data-testid="profile-save"]');
    await label(page, 'World map');
    ok('3. profile created -> World map', true);
    ok('   next zone locked at start', await page.isDisabled('[data-testid="node-alphabet-learn"]'));

    // ---- Learn ---- (full deck now, no cap). Seed all-but-one card as already
    // mastered (exercises the new per-zone persistence) so completion is quick,
    // and assert the deck really exposes the full animal count.
    const pid = await page.evaluate(() => localStorage.getItem('pip-active'));
    const animalIds = CARDS.animals.map((c) => c.id);
    await page.evaluate(({ pid, ids }) => localStorage.setItem(`pip-adv-learn-${pid}-animals`, JSON.stringify(ids)), { pid, ids: animalIds.slice(1) });
    await page.click('[data-testid="node-animals-learn"]');
    await label(page, 'Learn: Animals');
    const pill = await page.$eval('.level-hud .hud-pill', (el) => el.textContent.trim());
    ok(`   Learn deck shows the full ${animalIds.length}-card count`, pill.endsWith(`/${animalIds.length}`), `pill="${pill}"`);
    for (let i = 0; i < 8; i++) { // only the 1 unmastered card remains -> completes fast
      await page.click('[data-testid="flashcard"]');
      await page.waitForTimeout(220);
      await page.click('[data-testid="mastered-button"]');
      await page.waitForTimeout(820);
      if (await page.$('[data-testid="level-complete"]')) break;
    }
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
    ok('4. completing the deck shows the stars modal', true);
    await page.click('[data-testid="complete-next"]'); // Quiz time!

    // ---- Quiz (answer all correct) ----
    await label(page, 'Quiz: Animals');
    for (let i = 0; i < 6; i++) {
      await page.waitForSelector('.qprompt b');
      const word = (await page.textContent('.qprompt b')).trim();
      const opts = await page.$$('.qcard');
      let clicked = false;
      for (const o of opts) { const t = (await o.textContent()).trim(); if (t.includes(word)) { await o.click(); clicked = true; break; } }
      if (!clicked && opts[0]) await opts[0].click();
      await page.waitForTimeout(1000);
      if (await page.$('[data-testid="level-complete"]')) break;
    }
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
    const stars = await page.$$eval('.bigstars .bstar', (els) => els.filter((e) => !e.classList.contains('empty')).length);
    ok('5. quiz all-correct -> 3 stars', stars === 3, `stars=${stars}`);
    await page.click('[data-testid="complete-next"]'); // Open treasure!

    // ---- Treasure / Chest ----
    await label(page, 'Treasure: Animals');
    await page.click('[data-testid="reward-chest"]');
    await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
    ok('6. chest opens -> zone complete', true);
    await page.click('[data-testid="complete-next"]'); // Back to the map
    await label(page, 'World map');

    // ---- unlock + stars ----
    ok('7. next zone UNLOCKED after the quiz', !(await page.isDisabled('[data-testid="node-alphabet-learn"]')));
    const starCount = await page.textContent('[data-testid="star-count"]');
    ok('   star count increased', parseInt(starCount.replace(/\D/g, ''), 10) >= 1, `stars="${starCount}"`);

    // ---- play a game ----
    await page.click('[data-testid="node-animals-activity"]');
    await page.waitForSelector('[data-testid="activity-hub"]');
    await page.click('[data-testid="activity-pipsays"]');
    await label(page, 'Pip Says');
    ok('8. a mini-game opens from the hub', true);
    await page.click('[data-testid="level-exit"]'); // game -> hub
    await page.click('[data-testid="level-exit"]'); // hub -> world
    await label(page, 'World map');

    // ---- Story Land ----
    await page.$eval('[data-testid="open-story"]', (el) => el.click());
    await label(page, 'Story Land');
    await page.click('[data-testid="story-quest"]');
    await page.waitForSelector('[data-screen-label^="Comic:"]');
    ok('9. Story Land opens a comic book', true);
    await page.click('[data-testid="story-exit"]'); // back to shelf
    await label(page, 'Story Land');
    await page.click('[data-testid="level-exit"]'); // back to world
    await label(page, 'World map');

    // ---- Paint ----
    await page.click('[data-testid="node-animals-activity"]');
    await page.click('[data-testid="activity-paint"]');
    await label(page, 'Paint studio');
    ok('10. Paint Studio opens', true);
    await page.click('[data-testid="level-exit"]'); // paint -> hub
    await page.click('[data-testid="level-exit"]'); // hub -> world
    await label(page, 'World map');

    // ---- Settings: gate + all 5 tabs ----
    await page.$eval('[data-testid="open-settings"]', (el) => el.click());
    await page.waitForSelector('[data-testid="settings-gate"]');
    await solveGate(page);
    await page.waitForSelector('[data-testid="settings-tab-buddy"]');
    let tabsOk = true;
    for (const t of ['buddy', 'sound', 'play', 'activities', 'progress']) {
      await page.click(`[data-testid="settings-tab-${t}"]`);
      await page.waitForTimeout(80);
      if (!(await page.$(`[data-testid="settings-tab-${t}"].on`))) tabsOk = false;
    }
    ok('11. settings gate opens; all 5 tabs switch', tabsOk);
    await page.click('[data-testid="settings-close"]');

    // ---- add + switch profile ----
    await page.click('[data-testid="open-profiles"]');
    await page.waitForSelector('[data-testid="profile-sheet"]');
    await page.click('[data-testid="profile-add"]');
    await page.waitForSelector('[data-testid="profile-gate"]');
    await solveGate(page);
    await label(page, 'Create profile');
    await page.fill('[data-testid="profile-name"]', 'Sam');
    await page.click('[data-testid="profile-buddy-owl"]');
    await page.click('[data-testid="profile-save"]');
    await label(page, 'World map');
    const nameAfterAdd = await page.textContent('.hud-profile-name');
    ok('12. added a 2nd profile and switched to it', nameAfterAdd.trim() === 'Sam', `name="${nameAfterAdd}"`);
    // switch back to the first profile
    await page.click('[data-testid="open-profiles"]');
    await page.waitForSelector('[data-testid="profile-sheet"]');
    const otherId = await page.$$eval('[data-testid^="switch-"]', (els) => {
      const row = els.find((e) => !e.closest('.pf-row.active'));
      return row ? row.getAttribute('data-testid').replace('switch-', '') : null;
    });
    await page.click(`[data-testid="switch-${otherId}"]`);
    await label(page, 'World map');
    const nameAfterSwitch = await page.textContent('.hud-profile-name');
    ok('    switching profiles updates the header name', nameAfterSwitch.trim() === 'Alex', `name="${nameAfterSwitch}"`);

    ok('13. console clean across the whole journey', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
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
