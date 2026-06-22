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
      // "Try again" must actually RESTART the quiz (remount, not a dead tap)
      await page.click('[data-testid="complete-retry"]');
      await page.waitForTimeout(300);
      const restarted = !(await page.$('[data-testid="level-complete"]')) && !!(await page.$('.qprompt b'))
        && (await page.$eval('.level-bar i', (e) => parseFloat(e.style.width) || 0)) < 50; // progress reset to the first question
      ok('quiz "Try again" restarts the quiz', restarted);
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
      await page.click('[data-testid="open-play"]');
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
      await page.click('[data-testid="open-play"]');
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

    // 8a. Persistent nav dock: 3 destinations, active state tracks the route, and
    // it stays present inside a sub-screen (a game).
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page);
      const tabs = await page.$$eval('.dock-tab', (els) => els.length);
      ok('dock shows 3 destinations', tabs === 3, `tabs=${tabs}`);
      ok('Adventure tab active on the world map', (await page.getAttribute('[data-testid="open-adventure"]', 'aria-current')) === 'page');
      await page.click('[data-testid="open-play"]');
      await page.waitForSelector('[data-screen-label="Playground"]', { timeout: 6000 });
      ok('dock Play opens the Playground', (await page.getAttribute('[data-testid="open-play"]', 'aria-current')) === 'page');
      await page.click('[data-testid="open-story"]');
      await page.waitForSelector('[data-screen-label="Story Land"]', { timeout: 6000 });
      ok('dock Stories opens Story Land', (await page.getAttribute('[data-testid="open-story"]', 'aria-current')) === 'page');
      await page.click('[data-testid="open-adventure"]');
      await page.waitForSelector('[data-screen-label="World map"]', { timeout: 6000 });
      ok('dock Adventure returns to the map', true);
      // persistence: open a game, dock is still there
      await page.click('[data-testid="open-play"]');
      await page.waitForSelector('[data-testid="activity-pipsays"]');
      await page.click('[data-testid="activity-pipsays"]');
      await page.waitForTimeout(300);
      ok('dock persists inside a game', !!(await page.$('[data-testid="dock"]')));
      ok('game is open (shelf hidden)', !(await page.$('[data-testid="activity-hub"]')));
      // re-tapping the ALREADY-active Play tab returns to the Playground shelf
      await page.click('[data-testid="open-play"]');
      await page.waitForSelector('[data-testid="activity-hub"]', { timeout: 4000 });
      ok('re-tapping active Play returns to the shelf', !!(await page.$('[data-testid="activity-hub"]')));
      await ctx.close();
    }

    // 8b. Motion comic — three tiers:
    //   • full (motion on)       → autoplay reveals panels hands-free + camera runs
    //   • OS reduced-motion      → autoplay OFF (tap-to-reveal) + camera frozen
    //   • in-app "gentle" off    → camera KEPT, busy ambient loops dropped
    {
      // full tier: a fast Audio stub fires loadedmetadata/ended so the narration-
      // driven autoplay advances deterministically (the global stub stays silent).
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      await ctx.addInitScript(INIT);
      await ctx.addInitScript(`window.Audio = class { constructor(src){ this.src=src; this.duration=0.3; (window.__clips||[]).push(src); } play(){ Promise.resolve().then(()=>{ this.onloadedmetadata && this.onloadedmetadata(); setTimeout(()=>{ this.onended && this.onended(); }, 50); }); return Promise.resolve(); } pause(){} };`);
      await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      const page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', (e) => consoleErrors.push(String(e)));
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page);
      await page.$eval('[data-testid="open-story"]', (el) => el.click());
      await page.click('[data-testid="story-book"]');
      await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 6000 });
      ok('autoplay page shows a replay control', !!(await page.$('[data-testid="story-replay"]')));
      ok('revealed panel mounts the Ken-Burns camera', !!(await page.$('.comic-panel.revealed .panel-cam.cam')));
      const autoRevealed = await page.waitForSelector('[data-testid="panel-1"].revealed', { timeout: 5000 }).then(() => true).catch(() => false);
      ok('autoplay reveals the next panel hands-free', autoRevealed);
      await ctx.close();
    }
    {
      // OS reduced-motion: autoplay off, tap still reveals, camera frozen (~0s).
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      await ctx.addInitScript(INIT);
      await ctx.route('**/registerSW.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      await ctx.route('**/sw.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
      const page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', (e) => consoleErrors.push(String(e)));
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page);
      await page.$eval('[data-testid="open-story"]', (el) => el.click());
      await page.click('[data-testid="story-book"]');
      await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 6000 });
      await page.waitForTimeout(900); // give any (disabled) autoplay a chance to misfire
      ok('reduced-motion disables autoplay (panel stays hidden)', !!(await page.$('[data-testid="panel-1"].hidden')));
      await page.click('[data-testid="panel-1"]');
      const tapped = await page.waitForSelector('[data-testid="panel-1"].revealed', { timeout: 3000 }).then(() => true).catch(() => false);
      ok('tap reveals a hidden panel under reduced-motion', tapped);
      const camDur = await page.$eval('.panel-cam.cam', (el) => getComputedStyle(el).animationDuration).catch(() => null);
      ok('reduced-motion freezes the camera', camDur != null && parseFloat(camDur) < 0.05, `dur=${camDur}`);
      await ctx.close();
    }
    {
      // in-app "gentle" (Big animations off, no OS reduce): camera KEPT, loops dropped.
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.evaluate((p) => {
        localStorage.clear();
        localStorage.setItem('pip-profiles', JSON.stringify([p]));
        localStorage.setItem('pip-active', p.id);
        localStorage.setItem('pip-adv-set-' + p.id, JSON.stringify({ voice: true, sfx: true, music: false, motion: false, difficulty: 'easy', buddy: 'pip', disabled: [] }));
      }, PROFILE);
      await page.reload({ waitUntil: 'networkidle' });
      await page.$eval('[data-testid="open-story"]', (el) => el.click());
      await page.click('[data-testid="story-book"]');
      await page.waitForSelector('[data-screen-label^="Comic:"]', { timeout: 6000 });
      const camName = await page.$eval('.panel-cam.cam', (el) => getComputedStyle(el).animationName).catch(() => 'none');
      const camDur = await page.$eval('.panel-cam.cam', (el) => getComputedStyle(el).animationDuration).catch(() => '0s');
      ok('gentle tier keeps the camera animating', camName.includes('kenBurns') && parseFloat(camDur) > 1, `name=${camName} dur=${camDur}`);
      const sprop = await page.$('.comic-panel .sprop');
      const spropAnim = sprop ? await sprop.evaluate((el) => getComputedStyle(el).animationName) : 'missing';
      ok('gentle tier stops busy ambient prop loops', spropAnim === 'none', `name=${spropAnim}`);
      await ctx.close();
    }

    // 9. Paint: drawing enables "done"; finishing saves to the PER-PROFILE
    //    gallery key (the documented bug fix), not the legacy shared key.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="open-play"]');
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
      await page.click('[data-testid="open-play"]');
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
      await page.click('[data-testid="open-play"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');

      const ink = () => page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++;
        return n;
      });
      // re-read the live canvas box on every stroke — the canvas fits its container,
      // so its on-screen size/position can settle/shift; a cached box drifts.
      const stroke = async (x0, y0, x1, y1) => {
        const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
        await page.mouse.move(box.x + box.width * x0, box.y + box.height * y0);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * x1, box.y + box.height * y1, { steps: 8 });
        await page.mouse.up();
      };
      const tap = async (x, y) => {
        const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
        await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
      };
      const checked = (sel) => page.getAttribute(sel, 'aria-checked');

      // control inventory
      ok('paint has 5 tools', (await page.$$('[data-testid^="paint-tool-"]')).length === 5);
      ok('paint has 11 colour swatches', (await page.$$('.pswatch')).length === 11);
      ok('brush tool selected by default', (await checked('[data-testid="paint-tool-brush"]')) === 'true');
      ok('brush shows 5 styles', (await page.$$('[data-testid^="paint-brush-"]')).length === 5);

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
      ok('stamp shows its shapes', (await page.$$('[data-testid^="paint-stamp-"]')).length === 6);
      await page.click('[data-testid="paint-stamp-heart"]');
      const beforeStamp = await ink();
      await tap(0.5, 0.2);
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
      await tap(0.5, 0.5);
      await page.waitForTimeout(120);
      ok('magic fill floods the page', (await ink()) > beforeFill + 100000, `${beforeFill}->${await ink()}`);

      await ctx.close();
    }

    // 9c. Magic fill must reach the outline (no white halo) AND not leak past it.
    //     Fill the cat face, then sample the canvas around the head circle: the
    //     outline inner edge (~r257 in 1000px space) should be the fill colour all
    //     the way round, and just outside the outline (~r285) should be untouched.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="open-play"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      await page.click('[aria-label="Red"]');
      await page.click('[data-testid="paint-tool-fill"]');
      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.52);
      await page.waitForTimeout(150);
      const ring = (radius) => page.evaluate((r) => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        const cx = 500, cy = 394; // head centre in 1000px space
        let red = 0, n = 0;
        for (let a = 0; a < 48; a++) {
          const ang = a * Math.PI / 24;
          const x = Math.round(cx + Math.cos(ang) * r), y = Math.round(cy + Math.sin(ang) * r);
          if (x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
          n++; const i = (y * c.width + x) * 4;
          if (d[i] > 180 && d[i + 1] < 120 && d[i + 2] < 120 && d[i + 3] > 200) red++;
        }
        return { red, n };
      }, radius);
      const inner = await ring(257);
      ok('magic fill reaches the outline (no white halo)', inner.red >= inner.n - 4, `${inner.red}/${inner.n} red at inner edge`);
      const outer = await ring(285);
      ok('magic fill does not leak past the outline', outer.red === 0, `${outer.red} red px outside`);
      // The cat ears must sit ON the head, not cross into it: after filling the
      // face, the upper-inner head band should have NO tan outline pixels (the old
      // template drew ear legs deep inside the head, which showed through the fill).
      const earTan = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let tan = 0;
        for (let x = 320; x <= 680; x += 4) {
          const i = (244 * c.width + x) * 4;
          if (d[i + 3] > 120 && Math.abs(d[i] - 217) < 45 && Math.abs(d[i + 1] - 196) < 45 && Math.abs(d[i + 2] - 173) < 45) tan++;
        }
        return tan;
      });
      ok('cat ears do not cross into the head', earTan === 0, `${earTan} tan px inside head`);
      await ctx.close();
    }

    // 9d. Phase 2 — safety & forgiveness: recolor-fill, gentle clear, the
    //     "has art" thumbnail dot, page-switch preservation, near-miss fill.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="open-play"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      const pixel = (xf, yf) => page.evaluate(({ xf, yf }) => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(Math.round(c.width * xf), Math.round(c.height * yf), 1, 1).data;
        return [d[0], d[1], d[2], d[3]];
      }, { xf, yf });
      const inkAt = () => page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++; return n;
      });

      // near-miss forgiveness FIRST (fresh cat, no caption yet): tapping right on
      // the head outline must still fill, not dead no-op.
      await page.click('[aria-label="Yellow"]');
      await page.click('[data-testid="paint-tool-fill"]');
      const beforeNM = await inkAt();
      await page.mouse.click(box.x + box.width * 0.236, box.y + box.height * 0.40); // on the head's left outline
      await page.waitForTimeout(150);
      ok('near-miss tap on the outline still fills', (await inkAt()) > beforeNM, `${beforeNM} -> ${await inkAt()}`);

      // recolor-fill: fill the cat face red, then tap it again with blue
      await page.click('[aria-label="Red"]');
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48);
      await page.waitForTimeout(120);
      const red = await pixel(0.5, 0.44);
      ok('fill paints the face', red[0] > 180 && red[1] < 120 && red[2] < 120, JSON.stringify(red));
      await page.click('[aria-label="Blue"]');
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48);
      await page.waitForTimeout(120);
      const blue = await pixel(0.5, 0.44);
      ok('recolor-fill repaints a filled region (red -> blue)', blue[2] > 150 && blue[0] < 120, JSON.stringify(blue));

      // gentle clear: dialog leads with Keep painting; Keep preserves the art
      await page.click('[data-testid="paint-clear"]');
      await page.waitForSelector('[data-testid="paint-clear-confirm"]');
      ok('clear confirm offers Keep + a demoted wipe', !!(await page.$('[data-testid="paint-clear-keep"]')) && !!(await page.$('[data-testid="paint-clear-wipe"]')));
      await page.click('[data-testid="paint-clear-keep"]');
      await page.waitForTimeout(80);
      ok('Keep painting preserves the art', !(await page.$('[data-testid="paint-clear-confirm"]')) && (await pixel(0.5, 0.44))[3] > 0);

      // "has art" thumbnail dot
      ok('inked page shows a thumbnail dot', !!(await page.$('[data-testid="paint-tmpl-cat"] .ptmpl-dot')));

      // page-switch preserves each page's drawing
      await page.click('[data-testid="paint-tmpl-apple"]'); await page.waitForTimeout(150);
      ok('switching to a blank page shows it empty', (await pixel(0.5, 0.44))[3] === 0);
      await page.click('[data-testid="paint-tmpl-cat"]'); await page.waitForTimeout(250);
      ok('switching back restores the cat art', (await pixel(0.5, 0.44))[3] > 0);
      await ctx.close();
    }

    // 9e. Phase 3 — output: gallery viewer, Print button, kid-safe per-item delete.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="open-play"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      await page.click('[data-testid="paint-tool-fill"]');
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48);
      await page.waitForTimeout(150);
      await page.click('[data-testid="paint-done"]');
      await page.waitForSelector('[data-testid="paint-complete"]');
      ok('done card offers a Print button', !!(await page.$('[data-testid="paint-print"]')));
      await page.click('button:has-text("Paint another")');
      await page.waitForTimeout(150);
      ok('gallery shelf appears after saving', !!(await page.$('[data-testid="paint-gallery-open"]')));
      await page.click('[data-testid="paint-gallery-open"]');
      await page.waitForSelector('[data-testid="paint-gallery"]');
      ok('gallery shows the saved painting', (await page.$$('[data-testid="paint-gallery-item"]')).length === 1);
      await page.click('[data-testid="paint-gallery-item"]');
      await page.waitForSelector('[data-testid="paint-gallery-view"]');
      ok('tapping a painting opens the full view + delete', !!(await page.$('[data-testid="paint-art-delete"]')));
      await page.click('[data-testid="paint-art-delete"]'); // first tap asks to confirm (kid-safe)
      await page.waitForSelector('[data-testid="paint-art-delete-yes"]');
      ok('delete asks for confirmation first', (await page.$$('[data-testid="paint-gallery-item"]')).length === 1);
      await page.click('[data-testid="paint-art-delete-yes"]');
      await page.waitForTimeout(150);
      ok('delete removes it from the gallery', (await page.$$('[data-testid="paint-gallery-item"]')).length === 0);
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pip-adv-gallery-p1') || '[]').length);
      ok('delete persists to storage', stored === 0, `stored=${stored}`);
      await ctx.close();
    }

    // 9f. Phase 4 — creative tools: 5 tools, mirror mode, eyedropper, glitter, shape stamps.
    {
      const { ctx, page } = await newPage();
      await page.goto(base, { waitUntil: 'networkidle' });
      await seed(page, { animals: { learnStars: 3 } });
      await page.click('[data-testid="open-play"]');
      await page.click('[data-testid="activity-paint"]');
      await page.waitForSelector('[data-screen-label="Paint studio"]');
      const box = await (await page.$('[data-testid="paint-canvas"]')).boundingBox();
      const ink = () => page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 10) n++; return n;
      });
      ok('paint now has 5 tools', (await page.$$('[data-testid^="paint-tool-"]')).length === 5);

      // mirror: a stroke on the LEFT also paints the RIGHT (blank page, clean halves)
      await page.click('[data-testid="paint-tmpl-blank"]'); await page.waitForTimeout(150);
      await page.click('[data-testid="paint-mirror"]');
      await page.click('[aria-label="Blue"]');
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.4);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.6, { steps: 6 });
      await page.mouse.up(); await page.waitForTimeout(100);
      const halves = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="paint-canvas"]');
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, mid = c.width / 2;
        let L = 0, R = 0;
        for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) { if (d[(y * c.width + x) * 4 + 3] > 10) (x < mid ? L++ : R++); }
        return { L, R };
      });
      ok('mirror mode paints both halves', halves.L > 40 && halves.R > 40, JSON.stringify(halves));
      await page.click('[data-testid="paint-mirror"]'); // off

      // eyedropper: fill the cat face blue, switch to red, pick the face, confirm adoption
      await page.click('[data-testid="paint-tmpl-cat"]'); await page.waitForTimeout(200);
      await page.click('[aria-label="Blue"]');
      await page.click('[data-testid="paint-tool-fill"]');
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48);
      await page.waitForTimeout(120);
      await page.click('[aria-label="Red"]');
      await page.click('[data-testid="paint-tool-pick"]');
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48); // pick the blue face
      await page.waitForTimeout(80);
      ok('eyedropper reverts to brush after picking', (await page.getAttribute('[data-testid="paint-tool-brush"]', 'aria-checked')) === 'true');
      // adoption is verified deterministically via the active-colour size dot
      const dotColor = await page.$eval('.size-row .pdot', (el) => getComputedStyle(el).backgroundColor);
      const cc = (dotColor.match(/\d+/g) || []).map(Number);
      ok('eyedropper adopted the picked (blue) colour', cc.length >= 3 && cc[2] > 150 && cc[0] < 130, dotColor);

      // glitter brush draws (on a blank page, in a clear lower area, so ink delta is real)
      await page.click('[data-testid="paint-tmpl-blank"]'); await page.waitForTimeout(180);
      await page.click('[aria-label="Pink"]');
      await page.click('[data-testid="paint-brush-glitter"]');
      const beforeG = await ink();
      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.85);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.88, { steps: 5 });
      await page.mouse.up(); await page.waitForTimeout(80);
      ok('glitter brush draws', (await ink()) > beforeG);

      // shape stamps
      await page.click('[data-testid="paint-tool-stamp"]');
      ok('stamps now include shapes (6 total)', (await page.$$('[data-testid^="paint-stamp-"]')).length === 6);
      await page.click('[data-testid="paint-stamp-triangle"]');
      const beforeS = await ink();
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.2); // clear top area
      await page.waitForTimeout(80);
      ok('shape stamp adds ink', (await ink()) > beforeS);
      await ctx.close();
    }

    // 10. Drag-free games: the 5 games that used drag/swipe are now completable by
    //     TAP only (tap source -> tap target; tap to spin; tap to trace). Ages 2-6.
    {
      const openGame = async (page, id) => {
        await page.goto(base, { waitUntil: 'networkidle' });
        await seed(page);
        await page.click('[data-testid="open-play"]');
        await page.waitForSelector(`[data-testid="activity-${id}"]`, { timeout: 5000 });
        await page.click(`[data-testid="activity-${id}"]`);
        await page.waitForTimeout(400);
      };
      // ColorSort — tap a swatch then the matching monster; wrong target keeps the item
      {
        const { ctx, page } = await newPage();
        await openGame(page, 'sort');
        await page.click('.sort-item[aria-label="Blue"]');
        const before = await page.$$eval('.sort-item[aria-label="Blue"]', (e) => e.length);
        await page.click('[data-monster="red"]');
        ok('ColorSort wrong target keeps the colour', (await page.$$eval('.sort-item[aria-label="Blue"]', (e) => e.length)) === before);
        let g = 0;
        while ((await page.$('.sort-item')) && g++ < 40) {
          const item = await page.$('.sort-item'); if (!item) break;
          const color = (await item.getAttribute('aria-label')).toLowerCase();
          await item.click(); await page.click(`[data-monster="${color}"]`); await page.waitForTimeout(110);
        }
        ok('ColorSort completable by tap', await page.waitForSelector('text=All fed!', { timeout: 3000 }).then(() => true).catch(() => false));
        await ctx.close();
      }
      // ShadowPuzzle + JigsawPuzzle — select a source, tap targets until placed; complete
      const placement = async (id, source, slot, doneText, label) => {
        const { ctx, page } = await newPage();
        await openGame(page, id);
        let g = 0;
        while (g++ < 60) {
          if (await page.$(`text=${doneText}`)) break;
          const src = await page.$(source);
          if (!src) { await page.waitForTimeout(180); continue; }
          await src.click();
          for (const s of await page.$$(slot)) { await s.click(); await page.waitForTimeout(55); }
          await page.waitForTimeout(180);
        }
        ok(`${label} completable by tap`, await page.waitForSelector(`text=${doneText}`, { timeout: 3000 }).then(() => true).catch(() => false));
        await ctx.close();
      };
      await placement('shadow', '.sort-item', '.shadow-slot:not(.filled)', 'Shadow master!', 'ShadowPuzzle');
      await placement('jigsaw', '.jig-piece', '.jig-slot:not(.filled)', 'Puzzle master!', 'JigsawPuzzle');
      // Jigsaw — switching difficulty (incl. to a SMALLER grid) must not crash; the
      // board remounts fresh so stale piece indices can't blow up the render.
      {
        const { ctx, page } = await newPage();
        await openGame(page, 'jigsaw');
        await page.click('.jig-lvl:nth-child(3)'); // Hard (16)
        await page.waitForTimeout(150);
        await page.click('.jig-lvl:nth-child(1)'); // Easy (4) — the old crash case
        await page.waitForTimeout(150);
        await page.click('.jig-lvl:nth-child(2)'); // Medium (9)
        await page.waitForTimeout(150);
        const tiles = await page.$$eval('.jig-slot', (els) => els.length);
        ok('Jigsaw difficulty switch does not crash', tiles === 9, `slots=${tiles}`);
        await ctx.close();
      }
      // PrizeWheel — tap to spin rotates the wheel (no swipe)
      {
        const { ctx, page } = await newPage();
        await openGame(page, 'wheel');
        const r0 = await page.$eval('.pw-wheel', (e) => e.style.transform);
        await page.click('[data-testid="wheel-spin"]');
        await page.waitForTimeout(300);
        ok('PrizeWheel tap spins the wheel', (await page.$eval('.pw-wheel', (e) => e.style.transform)) !== r0);
        await ctx.close();
      }
      // Tracing — tapping the glowing dot advances the trace (no drag)
      {
        const { ctx, page } = await newPage();
        await openGame(page, 'trace');
        const off = () => page.$eval('svg path:nth-of-type(3)', (e) => e.getAttribute('stroke-dashoffset')).catch(() => 'gone');
        const off0 = await off();
        for (let i = 0; i <= 60; i++) {
          const dot = await page.$('.trace-dot'); if (!dot) break;
          const b = await dot.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
          await page.waitForTimeout(35);
        }
        await page.waitForTimeout(150);
        ok('Tracing taps advance the trace', (await off()) !== off0);
        await ctx.close();
      }
      // MysteryBoxes — premium treasure chest renders, never spoils (the friend is
      // only in the DOM when a box is open), and is completable by tapping.
      {
        const { ctx, page } = await newPage();
        await openGame(page, 'boxes');
        ok('MysteryBoxes premium chest renders', !!(await page.$('.mbox-base')) && !!(await page.$('.mbox-clasp')));
        // wait for the guess phase (lids closed): no friend may be in the DOM yet
        await page.waitForFunction(() => /Where is/.test(document.querySelector('.game-ask')?.textContent || ''), null, { timeout: 9000 }).catch(() => {});
        ok('MysteryBoxes does not spoil (no friend while closed)', (await page.$$('.mbox-friend')).length === 0);
        let found = false;
        for (let i = 0; i < 3 && !found; i++) {
          const b = (await page.$$('.mbox'))[i]; if (b) await b.click();
          await page.waitForTimeout(450);
          if (await page.$('.mbox.open .mbox-friend')) found = true;
          else await page.waitForTimeout(650); // wrong box re-closes
        }
        ok('MysteryBoxes reveals the friend on the correct box', found);
        await ctx.close();
      }
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
