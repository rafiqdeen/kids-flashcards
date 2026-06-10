import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
await page.goto('http://localhost:4173/?pip-lab');
await page.waitForTimeout(600);
const card = page.locator('[data-testid="flashcard"]');
await card.click();
await page.waitForTimeout(800);
await page.evaluate(() => {
  window.__trace = [];
  document.addEventListener('click', (e) => {
    window.__trace.push('doc-capture target=' + (e.target.tagName + '.' + (e.target.className.baseVal ?? e.target.className)));
  }, true);
  const c = document.querySelector('[data-testid="flashcard"]');
  c.addEventListener('click', () => window.__trace.push('card-native-bubble'));
});
await card.locator('[data-testid="speak-button"]').click();
await page.waitForTimeout(300);
console.log(await page.evaluate(() => JSON.stringify({
  trace: window.__trace,
  flipped: document.querySelector('[data-testid="flashcard"]').classList.contains('flipped'),
}, null, 1)));
await browser.close();
