// functional.mjs — behavioral tests vs. the prototype spec, driven against the
// built impl (dist) in headless Chromium. Asserts the behaviors the handoff
// brief calls out. Also fails on any console error (clean-console gate).
//
//   node visual-tests/functional.mjs
import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

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

// stub speechSynthesis to record utterances; seed RNG; neutralize SW.
const INIT = `
  window.__utt = [];
  window.__clips = [];
  // window.speechSynthesis is a read-only accessor (can't be reassigned); patch
  // its methods on the native object and keep the native SpeechSynthesisUtterance
  // so the engine accepts it. Records the rate/pitch the app sets.
  try {
    const ss = window.speechSynthesis;
    ss.speak = (u) => { window.__utt.push({ text: u.text, rate: u.rate, pitch: u.pitch }); };
    ss.cancel = () => {};
    ss.resume = () => {};
    ss.getVoices = () => [];
  } catch (e) {}
  // narration now plays pre-baked Tara audio clips for covered lines; stub Audio
  // to record the clip src (and not actually play in headless).
  window.Audio = class { constructor(src) { this.src = src; window.__clips.push(src); } play() { return Promise.resolve(); } pause() {} };
  let s = 0x2f6e2b1>>>0; Math.random = () => { s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
`;

let passed = 0, failed = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };

const PROFILE = { id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' };
async function seed(page, progress) {
  await page.evaluate(({ profile, progress }) => {
    localStorage.clear();
    localStorage.setItem('pip-profiles', JSON.stringify([profile]));
    localStorage.setItem('pip-active', profile.id);
    if (progress) localStorage.setItem('pip-adv-prog-' + profile.id, JSON.stringify(progress));
  }, { profile: PROFILE, progress });
  await page.reload({ waitUntil: 'networkidle' });
}

async function main() {
  const { server, port } = await serve(DIST);
  const base = `http://localhost:${port}/`;
  const browser = await chromium.launch();
  const consoleErrors = [];

  async function newPage() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(INIT);
    await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    return { ctx, page };
  }

  try {
    // 1. Profile Save disabled until a name is typed
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.click('[data-testid="welcome-start"]');
      await page.waitForSelector('[data-testid="profile-save"]');
      ok('Save disabled with empty name', await page.isDisabled('[data-testid="profile-save"]'));
      await page.fill('[data-testid="profile-name"]', 'Sam');
      ok('Save enabled after typing name', !(await page.isDisabled('[data-testid="profile-save"]')));
      await ctx.close();
    }

    // 2. flip -> the card phrase is narrated via its pre-baked Tara audio clip
    // (covered lines play a /narration/ clip; uncovered ones fall back to live TTS)
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: {} });
      await page.click('[data-testid="node-animals-learn"]');
      await page.click('[data-testid="flashcard"]');
      await page.waitForTimeout(200);
      const clips = await page.evaluate(() => window.__clips);
      const utts = await page.evaluate(() => window.__utt.map((u) => u.text));
      const narrated = clips.some((s) => /\/narration\/\d+\.m4a$/.test(s)) || utts.includes('Cat. The cat says meow.');
      ok('flip narrates the card phrase (Tara clip or live fallback)', narrated, `clips=${JSON.stringify(clips)} utts=${JSON.stringify(utts)}`);
      await ctx.close();
    }

    // 3. Zone unlock gating: alphabet locked until animals quizStars>0
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } }); // quiz not cleared
      ok('next zone learn LOCKED before prev quiz cleared', await page.isDisabled('[data-testid="node-alphabet-learn"]'));
      await seed(page, { animals: { learnStars: 3, quizStars: 2 } });
      ok('next zone learn UNLOCKED after prev quizStars>0', !(await page.isDisabled('[data-testid="node-alphabet-learn"]')));
      await ctx.close();
    }

    // 4. Quiz: all-correct -> 3 stars in the Complete modal (>=99% -> 3)
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="node-animals-quiz"]');
      for (let i = 0; i < 6; i++) {
        await page.waitForSelector('.qprompt b');
        const word = (await page.textContent('.qprompt b')).trim();
        const opts = await page.$$('.qcard');
        let clicked = false;
        for (const o of opts) {
          const t = (await o.textContent()).trim();
          if (t.includes(word)) { await o.click(); clicked = true; break; }
        }
        if (!clicked && opts[0]) await opts[0].click();
        await page.waitForTimeout(1000);
        if (await page.$('[data-testid="level-complete"]')) break;
      }
      await page.waitForSelector('[data-testid="level-complete"]', { timeout: 6000 });
      const stars = await page.$$eval('.bigstars .bstar', (els) => els.filter((e) => !e.classList.contains('empty')).length);
      ok('quiz all-correct -> 3 stars', stars === 3, `stars=${stars}`);
      await ctx.close();
    }

    // 5. Settings: math gate + per-profile persistence to pip-adv-set-<pid>
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page);
      await page.$eval('[data-testid="open-settings"]', (el) => el.click());
      await page.waitForSelector('[data-testid="settings-gate"]');
      const tapKey = (d) => page.evaluate((x) => { const b = [...document.querySelectorAll('.gate2-key')].find((k) => k.textContent.trim() === x); b && b.click(); }, d);
      // a single wrong digit keeps the gate closed (panel not shown)
      await tapKey('0');
      ok('wrong gate answer keeps panel closed', !(await page.$('[data-testid="settings-tab-buddy"]')));
      await tapKey('⌫'); // clear before solving
      // solve correctly
      const sum = await page.$eval('.gate2-q', (el) => { const m = el.textContent.match(/(\d+)\s*\+\s*(\d+)/); return String(+m[1] + +m[2]); });
      for (const ch of sum) await page.evaluate((d) => { const b = [...document.querySelectorAll('.gate2-key')].find((x) => x.textContent.trim() === d); b && b.click(); }, ch);
      await page.waitForSelector('[data-testid="settings-tab-sound"]');
      ok('correct gate answer opens the panel', true);
      await page.click('[data-testid="settings-tab-sound"]');
      await page.click('[data-testid="adv-set-voice"]'); // toggle voice off
      await page.waitForTimeout(100);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pip-adv-set-p1')));
      ok('settings persist to pip-adv-set-<pid> (voice off)', saved && saved.voice === false, JSON.stringify(saved));
      // colour-tone (eye comfort): selecting a tone reflects to html[data-tone] + persists
      await page.click('[data-testid="settings-tab-play"]');
      await page.click('[data-testid="adv-tone-warm"]');
      await page.waitForTimeout(100);
      const tone = await page.evaluate(() => document.documentElement.getAttribute('data-tone'));
      const savedTone = await page.evaluate(() => JSON.parse(localStorage.getItem('pip-adv-set-p1')).colorTone);
      ok('colour tone applies (html[data-tone]) + persists', tone === 'warm' && savedTone === 'warm', `data-tone=${tone} saved=${savedTone}`);
      await ctx.close();
    }

    // 6. Difficulty=easy -> quiz renders 2 options (normal -> 4)
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('pip-profiles', JSON.stringify([{ id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' }]));
        localStorage.setItem('pip-active', 'p1');
        localStorage.setItem('pip-adv-prog-p1', JSON.stringify({ animals: { learnStars: 3 } }));
        localStorage.setItem('pip-adv-set-p1', JSON.stringify({ voice: true, sfx: true, music: false, motion: true, difficulty: 'easy', buddy: 'pip', disabled: [] }));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.click('[data-testid="node-animals-quiz"]');
      await page.waitForSelector('.qcard');
      const n = await page.$$eval('.qcard', (e) => e.length);
      ok('easy difficulty -> 2 quiz options', n === 2, `options=${n}`);
      await ctx.close();
    }

    // 7. Activity Hub: tiles render, a game opens, disabled games are hidden
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="node-animals-activity"]');
      await page.waitForSelector('[data-testid="activity-hub"]');
      const tiles = await page.$$eval('[data-testid^="activity-"]', (els) => els.length);
      ok('activity hub shows game tiles', tiles >= 4, `tiles=${tiles}`);
      await page.click('[data-testid="activity-pipsays"]');
      await page.waitForSelector('[data-screen-label="Pip Says"]', { timeout: 6000 });
      ok('tapping a tile opens the game', !(await page.$('[data-testid="activity-hub"]')));
      await ctx.close();
    }
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('pip-profiles', JSON.stringify([{ id: 'p1', name: 'Sam', buddy: 'pip', age: 'middle' }]));
        localStorage.setItem('pip-active', 'p1');
        localStorage.setItem('pip-adv-prog-p1', JSON.stringify({ animals: { learnStars: 3 } }));
        localStorage.setItem('pip-adv-set-p1', JSON.stringify({ voice: true, sfx: true, music: false, motion: true, difficulty: 'normal', buddy: 'pip', disabled: ['shadow'] }));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.click('[data-testid="node-animals-activity"]');
      await page.waitForSelector('[data-testid="activity-hub"]');
      const shadowGone = !(await page.$('[data-testid="activity-shadow"]'));
      const pipsaysThere = !!(await page.$('[data-testid="activity-pipsays"]'));
      ok('disabled game is hidden, others remain', shadowGone && pipsaysThere, `shadowGone=${shadowGone} pipsaysThere=${pipsaysThere}`);
      await ctx.close();
    }

    // 8. Story Land: shelf shows 4 books; a book opens; choose-your-path branches
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page);
      await page.$eval('[data-testid="open-story"]', (el) => el.click());
      await page.waitForSelector('[data-screen-label="Story Land"]');
      const books = await page.$$eval('[data-testid="story-book"],[data-testid="story-choose"],[data-testid="story-quest"],[data-testid="story-comic"]', (els) => els.length);
      ok('Story Land shows 4 books', books === 4, `books=${books}`);
      await page.click('[data-testid="story-choose"]');
      await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 6000 });
      ok('opening a book shows the comic', true);
      await page.waitForSelector('[data-testid="story-choices"]');
      await page.click('[data-testid="choice-boat"]');
      await page.waitForSelector('[data-testid="story-next"]', { timeout: 6000 });
      ok('choose-your-path advances on a choice', true);
      await ctx.close();
    }

    // 9. Paint: drawing enables "done"; finishing saves to the PER-PROFILE
    //    gallery key (the documented bug fix), not the legacy shared key.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="node-animals-activity"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      ok('paint "done" disabled before drawing', await page.isDisabled('[data-testid="paint-done"]'));
      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 8 });
      await page.mouse.up();
      ok('paint "done" enabled after drawing', !(await page.isDisabled('[data-testid="paint-done"]')));
      await page.click('[data-testid="paint-done"]');
      await page.waitForSelector('[data-testid="paint-complete"]');
      const keys = await page.evaluate(() => ({
        perProfile: JSON.parse(localStorage.getItem('pip-adv-gallery-p1') || '[]').length,
        legacyShared: localStorage.getItem('pip-gallery'),
      }));
      ok('finished art saved to per-profile gallery key', keys.perProfile === 1, JSON.stringify(keys));
      ok('legacy shared pip-gallery NOT written (per-profile fix)', keys.legacyShared === null, `legacy=${keys.legacyShared}`);
      await ctx.close();
    }
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="node-animals-activity"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      await page.click('[data-testid="paint-clear"]');
      ok('clear shows a confirm dialog', !!(await page.$('[data-testid="paint-clear-confirm"]')));
      await ctx.close();
    }

    // 9b. Paint — every tool, brush style, size, swatch, undo and template,
    //     verified by its real effect on the canvas pixels (div-by-div audit).
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="node-animals-activity"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');

      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      const ink = () => page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++;
        return n;
      });
      const stroke = async (x0, y0, x1, y1) => {
        await page.mouse.move(box.x + box.width * x0, box.y + box.height * y0);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * x1, box.y + box.height * y1, { steps: 8 });
        await page.mouse.up();
      };
      const checked = (sel) => page.getAttribute(sel, 'aria-checked');

      // control inventory
      ok('paint has 4 tools', (await page.$$('[data-testid^="paint-tool-"]')).length === 4);
      ok('paint has 11 colour swatches', (await page.$$('.pswatch')).length === 11);
      ok('brush tool selected by default', (await checked('[data-testid="paint-tool-brush"]')) === 'true');
      ok('brush shows 4 styles', (await page.$$('[data-testid^="paint-brush-"]')).length === 4);

      // each brush style lays down ink
      for (const style of ['marker', 'rainbow', 'spray', 'sparkle']) {
        await page.click(`[data-testid="paint-brush-${style}"]`);
        const sel = (await checked(`[data-testid="paint-brush-${style}"]`)) === 'true';
        const before = await ink();
        await stroke(0.3, 0.3, 0.7, 0.7);
        const after = await ink();
        ok(`brush "${style}" selects and draws`, sel && after > before, `sel=${sel} ${before}->${after}`);
      }

      // size buttons select
      for (const sz of ['small', 'medium', 'big']) {
        await page.click(`[aria-label="Size ${sz}"]`);
        ok(`size "${sz}" selects`, (await checked(`[aria-label="Size ${sz}"]`)) === 'true');
      }

      // colour swatch selects + clears eraser
      await page.click('[aria-label="Blue"]');
      ok('blue swatch selects', (await checked('[aria-label="Blue"]')) === 'true');

      // undo removes the last stroke
      const beforeUndo = await ink();
      await page.click('[aria-label="Undo"]');
      ok('undo reduces ink', (await ink()) < beforeUndo, `${beforeUndo}->${await ink()}`);

      // eraser removes ink under it (and selecting a swatch leaves eraser)
      await page.click('[data-testid="paint-tool-eraser"]');
      ok('eraser selects', (await checked('[data-testid="paint-tool-eraser"]')) === 'true');
      const beforeErase = await ink();
      await stroke(0.35, 0.35, 0.65, 0.65);
      ok('eraser reduces ink', (await ink()) < beforeErase, `${beforeErase}->${await ink()}`);
      await page.click('[aria-label="Red"]');
      ok('picking a colour exits the eraser', (await checked('[data-testid="paint-tool-brush"]')) === 'true');

      // stamp drops a shape
      await page.click('[data-testid="paint-tool-stamp"]');
      ok('stamp selects', (await checked('[data-testid="paint-tool-stamp"]')) === 'true');
      ok('stamp shows 3 shapes', (await page.$$('[data-testid^="paint-stamp-"]')).length === 3);
      await page.click('[data-testid="paint-stamp-heart"]');
      const beforeStamp = await ink();
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.2);
      ok('stamp adds ink', (await ink()) > beforeStamp);

      // template switch swaps the guide outline
      await page.click('[data-testid="paint-tmpl-star"]');
      await page.waitForTimeout(150);
      ok('template switch updates the guide', !!(await page.$('[data-testid="paint-tmpl-star"].on')));

      // magic fill floods an empty page
      await page.click('[data-testid="paint-tmpl-blank"]');
      await page.waitForTimeout(150);
      await page.click('[data-testid="paint-tool-fill"]');
      const beforeFill = await ink();
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await page.waitForTimeout(120);
      ok('magic fill floods the page', (await ink()) > beforeFill + 100000, `${beforeFill}->${await ink()}`);

      await ctx.close();
    }

    ok('console clean (no errors)', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
