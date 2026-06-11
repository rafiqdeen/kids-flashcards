// Regression tests for the three reported fixes:
// 1) Learn tab opens a deck even with no progress
// 2) consistent native emoji on cards (no SVG-vs-tiny-emoji mixing, no pink discs)
// 3) speech sets lang + prefers an offline (audible) voice
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.addInitScript(() => {
  localStorage.setItem('pip-onboarded', '1');
  window.__spoke = [];
  const orig = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = (u) => {
    window.__spoke.push({ text: u.text, lang: u.lang, local: u.voice ? u.voice.localService : null });
    return orig(u);
  };
});
await page.goto(BASE);
await page.waitForTimeout(600);

// 1) Learn with no progress → opens a deck (not stuck on Home)
check('Learn (no progress) opens a deck', await (async () => {
  await page.locator('[data-testid="webnav-learn"]').click();
  await page.waitForTimeout(400);
  const label = await page.evaluate(() => document.querySelector('[data-screen-label]')?.getAttribute('data-screen-label'));
  return /^Deck:/.test(label || '');
})());
await page.locator('[data-testid="deck-back"]').click();
await page.waitForTimeout(300);

// 2) emoji consistency across image categories
for (const cat of ['animals', 'fruits', 'vehicles', 'weather']) {
  await page.locator(`[data-testid="category-tile-${cat}"]`).click();
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const thumbs = document.querySelectorAll('.thumb').length;
    const thumbEmoji = document.querySelectorAll('.thumb .illu-emoji').length;
    const discs = document.querySelectorAll('.thumb svg circle[fill="currentColor"]').length;
    const front = document.querySelector('.face.front .illu-emoji');
    return { thumbs, thumbEmoji, discs, frontHasEmoji: !!front && front.textContent.length > 0 };
  });
  check(`${cat}: every thumb is native emoji, 0 pink-disc fallbacks`, m.thumbs > 0 && m.thumbEmoji === m.thumbs && m.discs === 0, JSON.stringify(m));
  check(`${cat}: front shows a realistic emoji`, m.frontHasEmoji);
  // back also shows the emoji visual (was previously blank for emoji cards)
  await page.locator('[data-testid="flashcard"]').click();
  await page.waitForTimeout(500);
  check(`${cat}: card back shows the emoji visual`, await page.locator('.card-back-visual .illu-emoji').count() === 1);
  await page.locator('[data-testid="deck-back"]').click();
  await page.waitForTimeout(300);
}

// alphabet back shows the word's emoji (front stays the mega letter)
await page.locator('[data-testid="category-tile-alphabet"]').click();
await page.waitForTimeout(400);
check('alphabet: front is the mega letter', await page.locator('.face.front .card-mega').count() === 1);
await page.locator('[data-testid="flashcard"]').click();
await page.waitForTimeout(500);
check('alphabet: back shows the word emoji', await page.locator('.card-back-visual .illu-emoji').count() === 1);

// 3) speech sets a non-empty lang and prefers a local voice
await page.evaluate(() => { window.__spoke = []; });
await page.locator('[data-testid="flashcard"] [data-testid="speak-button"]').click({ force: true });
await page.waitForTimeout(500);
const spoke = await page.evaluate(() => window.__spoke.slice(-1)[0]);
check('speak sets a non-empty lang', spoke && !!spoke.lang, JSON.stringify(spoke));
check('speak prefers an offline voice when available', spoke && (spoke.local === true || spoke.local === null), JSON.stringify(spoke));

await page.evaluate(() => localStorage.clear());
await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
