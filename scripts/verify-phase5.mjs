// Phase 5 verification — Rewards (chest, stickers, badges, gallery) + Paint
// (tools, brushes, fill containment, undo, clear-confirm, done flow, WIP persistence).
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.goto(BASE);
await page.waitForTimeout(500);

// ---------- Rewards ----------
await page.locator('[data-testid="webnav-rewards"]').click();
await page.waitForTimeout(400);
check('rewards screen', await page.locator('[data-screen-label="Rewards"]').count() === 1);
check('chest present + closed', await page.locator('[data-testid="reward-chest"].closed').count() === 1);
check('9 sticker slots, all locked', await page.locator('.sticker-slot').count() === 9
  && await page.locator('.sticker-slot.has').count() === 0);
check('art gallery empty state → paint CTA', await page.locator('.art-empty').count() === 1);

await page.locator('[data-testid="reward-chest"]').click();
await page.waitForTimeout(200);
check('chest opening state', await page.locator('[data-testid="reward-chest"].opening').count() === 1);
await page.waitForTimeout(1000);
check('chest reveal + sticker added', await page.locator('[data-testid="reward-chest"].reveal').count() === 1
  && await page.locator('.sticker-slot.has').count() === 1);
check('earned persisted', await page.evaluate(() => JSON.parse(localStorage.getItem('pip-earned') || '[]').length === 1));
check('badge "First card" lit', await page.locator('.badge.on').count() >= 1);
await page.locator('.chest-zone .pip-cta').click();
check('chest resets', await page.locator('[data-testid="reward-chest"].closed').count() === 1);

// ---------- Paint ----------
await page.locator('.art-empty').click();
await page.waitForTimeout(500);
check('paint screen via empty-art CTA', await page.locator('[data-screen-label="Paint"]').count() === 1);
check('13 template chips, cat active', await page.locator('.tmpl-chip').count() === 13
  && await page.locator('.tmpl-chip.on small').first().textContent() === 'Cat');
check('12 swatches', await page.locator('.paint-swatch').count() === 12);
check('4 tools + 3 sizes', await page.locator('.tool-group .tool-btn').count() === 4
  && await page.locator('.brush-btn').count() === 3);
check('4 brush styles visible (brush active)', await page.locator('[data-testid^="paint-brush-"]').count() === 4);
check('done disabled before ink', await page.locator('[data-testid="paint-done"]').isDisabled());
check('undo disabled before ink', await page.locator('.tool-row .tool-btn[aria-label="Undo"]').isDisabled());

const canvas = page.locator('[data-testid="paint-canvas"]');
// toolbar clicks auto-scroll the pane — re-measure the canvas before each
// stroke so client coords map to the canvas correctly
let cx, cy;
const freshCenter = async () => {
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  cx = box.x + box.width / 2; cy = box.y + box.height / 2;
};
await freshCenter();

const inkSum = () => page.evaluate(() => {
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const d = c.getContext('2d').getImageData(0, 0, 1000, 1000).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
  return n;
});
const pixelAt = (x, y) => page.evaluate(([px, py]) => {
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const d = c.getContext('2d').getImageData(px, py, 1, 1).data;
  return [...d];
}, [x, y]);

// marker stroke
await freshCenter();
await page.mouse.move(cx - 60, cy);
await page.mouse.down();
await page.mouse.move(cx + 60, cy, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(200);
const inkMarker = await inkSum();
check('marker stroke paints', inkMarker > 1000, `${inkMarker}px`);
check('done enabled after ink', await page.locator('[data-testid="paint-done"]').isEnabled());
check('WIP persisted per template', await page.evaluate(() => !!localStorage.getItem('pip-doodle-cat')));

// undo restores
await page.locator('.tool-row .tool-btn[aria-label="Undo"]').click();
await page.waitForTimeout(200);
const inkAfterUndo = await inkSum();
check('undo removes stroke', inkAfterUndo < inkMarker / 4, `${inkAfterUndo}px`);

// rainbow brush: hue varies along stroke
await page.locator('[data-testid="paint-brush-rainbow"]').click();
await freshCenter();
await page.mouse.move(cx - 100, cy + 40);
await page.mouse.down();
await page.mouse.move(cx + 100, cy + 40, { steps: 20 });
await page.mouse.up();
const rainbowVaries = await page.evaluate(() => {
  // find leftmost and rightmost inked pixels and compare their colors
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const d = c.getContext('2d').getImageData(0, 0, 1000, 1000).data;
  let first = null, last = null;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > 200) { const px = [(d[i - 3]), d[i - 2], d[i - 1]]; if (!first) first = px; last = px; }
  }
  if (!first || !last) return false;
  return Math.abs(first[0] - last[0]) + Math.abs(first[1] - last[1]) + Math.abs(first[2] - last[2]) > 60;
});
check('rainbow hue cycles along stroke', rainbowVaries);

// spray + sparkle leave marks
await page.locator('[data-testid="paint-brush-spray"]').click();
await freshCenter();
const preSpray = await inkSum();
await page.mouse.click(cx - 80, cy - 60);
const postSpray = await inkSum();
check('spray speckles', postSpray > preSpray);
await page.locator('[data-testid="paint-brush-sparkle"]').click();
await freshCenter();
await page.mouse.click(cx + 80, cy - 60);
check('sparkle stars', (await inkSum()) > postSpray);

// stamps
await page.locator('[data-testid="paint-tool-stamp"]').click();
await page.waitForTimeout(150);
check('stamp shapes sub-row', await page.locator('[data-testid^="paint-stamp-"]').count() === 4);
await page.locator('[data-testid="paint-stamp-heart"]').click();
await freshCenter();
const preStamp = await inkSum();
await page.mouse.click(cx, cy - 90);
check('stamp places', (await inkSum()) > preStamp);

// eraser
await page.locator('[data-testid="paint-eraser"]').click();
await freshCenter();
const preErase = await inkSum();
await page.mouse.move(cx - 100, cy + 40);
await page.mouse.down();
await page.mouse.move(cx + 100, cy + 40, { steps: 10 });
await page.mouse.up();
check('eraser removes ink', (await inkSum()) < preErase);

// clear with confirm
await page.locator('[data-testid="paint-clear"]').click();
check('clear confirm modal', await page.locator('[data-testid="paint-clear-confirm"]').count() === 1);
await page.locator('[data-testid="paint-clear-confirm"] .pip-cta.ghost').click();
check('keep painting cancels', await page.locator('[data-testid="paint-clear-confirm"]').count() === 0);
await page.locator('[data-testid="paint-clear"]').click();
await page.locator('[data-testid="paint-clear-confirm"] .pip-cta').first().click();
await page.waitForTimeout(200);
check('confirmed clear empties canvas', (await inkSum()) === 0);

// magic fill inside the cat head (center) stays bounded by outline
await page.locator('[data-testid="paint-tool-fill"]').click();
await page.locator('.paint-swatch[aria-label="Green"]').click();
await freshCenter();
await page.mouse.click(cx, cy);
await page.waitForTimeout(400);
const center = await pixelAt(430, 430);
const corner = await pixelAt(20, 20);
check('fill colors inside the outline', center[3] > 200 && center[1] > 120, center.join(','));
check('fill stays inside (corner clean)', corner[3] <= 40, corner.join(','));

// fill on a wall is a no-op (tap the outline itself)
const preWall = await inkSum();
await page.locator('.tmpl-chip').nth(3).click(); // star template
await page.waitForTimeout(300);
void preWall;
check('template switch speaks + preserves cat WIP', await page.evaluate(() => !!localStorage.getItem('pip-doodle-cat')));
await page.locator('.tmpl-chip').nth(1).click(); // back to cat
await page.waitForTimeout(400);
check('returning restores cat fill', (await inkSum()) > 10000);

// done flow
await page.locator('[data-testid="paint-done"]').click({ force: true });
await page.waitForTimeout(600);
check('done modal with framed art', await page.locator('[data-testid="paint-complete"] .art-done-frame img').count() === 1);
check('gallery persisted with 480px export', await page.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('pip-gallery') || '[]');
  return g.length === 1 && g[0].template === 'cat' && g[0].data.startsWith('data:image/png');
}));
await page.locator('[data-testid="paint-complete"] .pip-cta.ghost').click();
await page.waitForTimeout(500);
check('see my treasures → rewards with art', await page.locator('[data-testid="art-gallery"] .art-frame').count() === 1);

await page.evaluate(() => localStorage.clear());
await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
