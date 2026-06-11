import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.goto('http://localhost:4173');
await page.waitForTimeout(400);
await page.locator('[data-testid="webnav-paint"]').click();
await page.waitForTimeout(500);

const canvas = page.locator('[data-testid="paint-canvas"]');
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
const inkSum = () => page.evaluate(() => {
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const d = c.getContext('2d').getImageData(0, 0, 1000, 1000).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
  return n;
});

console.log('before:', await inkSum());
await page.locator('[data-testid="paint-brush-rainbow"]').click();
await page.waitForTimeout(300);
console.log('chip state:', await page.locator('[data-testid="paint-brush-rainbow"]').getAttribute('class'));
await page.mouse.move(cx - 100, cy + 40);
await page.mouse.down();
await page.mouse.move(cx + 100, cy + 40, { steps: 20 });
await page.mouse.up();
await page.waitForTimeout(300);
console.log('after rainbow:', await inkSum());

// sample along the line
console.log(await page.evaluate(() => {
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const ctx = c.getContext('2d');
  const r = c.getBoundingClientRect();
  const y = Math.round((r.height / 2 + 40) * (1000 / r.height));
  const cols = [];
  for (const dx of [-90, -45, 0, 45, 90]) {
    const x = Math.round((r.width / 2 + dx) * (1000 / r.width));
    cols.push([...ctx.getImageData(x, y, 1, 1).data]);
  }
  return JSON.stringify({ y, cols });
}));
await browser.close();
// second pass: locate ink rows
const b2 = await chromium.launch();
const p2 = await b2.newPage({ viewport: { width: 1180, height: 800 } });
await p2.goto('http://localhost:4173');
await p2.waitForTimeout(400);
await p2.locator('[data-testid="webnav-paint"]').click();
await p2.waitForTimeout(500);
const cv = p2.locator('[data-testid="paint-canvas"]');
const bb = await cv.boundingBox();
console.log('canvas box:', JSON.stringify(bb));
await p2.locator('[data-testid="paint-brush-rainbow"]').click();
await p2.waitForTimeout(300);
await p2.mouse.move(bb.x + bb.width / 2 - 100, bb.y + bb.height / 2 + 40);
await p2.mouse.down();
await p2.mouse.move(bb.x + bb.width / 2 + 100, bb.y + bb.height / 2 + 40, { steps: 20 });
await p2.mouse.up();
await p2.waitForTimeout(300);
console.log(await p2.evaluate(() => {
  const c = document.querySelector('[data-testid="paint-canvas"]');
  const r = c.getBoundingClientRect();
  const ctx = c.getContext('2d');
  const d = ctx.getImageData(0, 0, 1000, 1000).data;
  const rows = new Set();
  for (let i = 3; i < d.length; i += 4) if (d[i] > 40) rows.add(Math.floor((i >> 2) / 1000));
  const arr = [...rows];
  return JSON.stringify({ rect: { w: r.width, h: r.height, top: r.top }, minRow: Math.min(...arr), maxRow: Math.max(...arr) });
}));
await b2.close();
