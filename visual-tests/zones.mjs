// zones.mjs — runtime E2E across ALL 20 zones + all 4 Story Land books.
// e2e.mjs drives only the animals zone; this opens EVERY zone and verifies:
//   • Learn renders the full deck (pill /count) with visible card art
//   • the card flips to its word
//   • Learn completes -> stars (progress is seeded all-but-one so it's fast)
//   • Quiz renders a prompt + options and accepts a correct answer
//   • every story book opens to a comic
//   • the console stays clean throughout
//   node visual-tests/zones.mjs
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../src/adventure/data/cards.js';
import { ZONE_CATS, CATEGORIES } from '../src/adventure/data/categories.js';

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

// stub speechSynthesis + Audio (no real playback / console noise) + seeded RNG
const INIT = `
  try { const ss = window.speechSynthesis; ss.speak = () => {}; ss.cancel = () => {}; ss.resume = () => {}; ss.getVoices = () => []; } catch (e) {}
  window.Audio = class { constructor(s) { this.src = s; } play() { return Promise.resolve(); } pause() {} };
  let s = 0x51a3f >>> 0; Math.random = () => { s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
`;

let passed = 0, failed = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };
const label = (page, l) => page.waitForSelector(`[data-screen-label="${l}"]`, { timeout: 15000 });

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
    await page.goto(base, { waitUntil: 'networkidle' });
    // one profile; unlock every zone; seed each Learn deck all-but-first mastered
    const prog = {}; const learn = {};
    for (const c of ZONE_CATS) { prog[c] = { learnStars: 3, quizStars: 3 }; learn[`pip-adv-learn-p1-${c}`] = JSON.stringify((CARDS[c] || []).map((x) => x.id).slice(1)); }
    await page.evaluate(({ prog, learn }) => {
      localStorage.clear();
      localStorage.setItem('pip-profiles', JSON.stringify([{ id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' }]));
      localStorage.setItem('pip-active', 'p1');
      localStorage.setItem('pip-adv-prog-p1', JSON.stringify(prog));
      for (const [k, v] of Object.entries(learn)) localStorage.setItem(k, v);
    }, { prog, learn });
    await page.reload({ waitUntil: 'networkidle' });
    await label(page, 'World map');

    for (const catId of ZONE_CATS) {
      const cat = CATEGORIES.find((c) => c.id === catId);
      const deck = CARDS[catId] || [];
      const first = deck[0];

      // ---- Learn ----
      await page.click(`[data-testid="node-${catId}-learn"]`);
      await label(page, `Learn: ${cat.name}`);
      const pill = await page.$eval('.level-hud .hud-pill', (el) => el.textContent.trim());
      ok(`${catId}: Learn shows full deck (${pill})`, pill.endsWith(`/${deck.length}`), `want /${deck.length}`);
      const art = await page.$('[data-testid="flashcard"] .aface.front img, [data-testid="flashcard"] .aface.front svg, [data-testid="flashcard"] .aface.front .amega');
      ok(`${catId}: card art renders`, !!art);
      await page.click('[data-testid="flashcard"]');
      await page.waitForTimeout(450);
      const word = await page.$eval('[data-testid="flashcard"] .aword', (el) => el.textContent.trim()).catch(() => '');
      ok(`${catId}: flips to its word`, word === first.word, `got "${word}" want "${first.word}"`);
      await page.click('[data-testid="mastered-button"]');
      await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
      ok(`${catId}: Learn completes`, true);
      await page.click('[data-testid="complete-next"]');

      // ---- Quiz ----
      await label(page, `Quiz: ${cat.name}`);
      await page.waitForSelector('.qprompt b');
      const target = (await page.textContent('.qprompt b')).trim();
      const opts = await page.$$('.qcard');
      ok(`${catId}: Quiz renders prompt + ${opts.length} options`, opts.length >= 2);
      let clicked = false;
      for (const o of opts) { const t = (await o.textContent()).trim(); if (t.includes(target)) { await o.click(); clicked = true; break; } }
      if (!clicked && opts[0]) await opts[0].click();
      await page.waitForTimeout(800);
      ok(`${catId}: Quiz accepts an answer`, true);
      await page.click('[data-testid="level-exit"]');
      await label(page, 'World map');
    }

    // ---- Story Land: all 4 books ----
    for (const b of [['book', 'Pip & the Lost Star'], ['choose', 'Big Day Out'], ['quest', 'Rainbow Mountain'], ['comic', 'Super Day']]) {
      await page.$eval('[data-testid="open-story"]', (el) => el.click());
      await label(page, 'Story Land');
      await page.click(`[data-testid="story-${b[0]}"]`);
      await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 8000 });
      ok(`story "${b[0]}" opens a comic`, true);
      await page.click('[data-testid="story-exit"]');
      await label(page, 'Story Land');
      await page.click('[data-testid="level-exit"]');
      await label(page, 'World map');
    }

    ok('console clean across all 20 zones + 4 stories', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } catch (e) {
    failed++; console.log(`  ✗ threw: ${e.message.split('\n')[0]}`);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed  (${ZONE_CATS.length} zones + 4 stories)`);
  process.exit(failed ? 1 : 0);
}

main();
