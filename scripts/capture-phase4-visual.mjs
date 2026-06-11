// Phase 4 visual — quiz screen + results, reference vs implementation.
import { chromium } from '@playwright/test';

const OUT = 'verification-shots/phase4';
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function answerAll(page, correct = true) {
  for (let i = 0; i < 12; i++) {
    if (await page.locator('[data-testid="quiz-result"]').count()) break;
    const t = await page.locator('.quiz-ask b').textContent();
    const idx = await page.evaluate((tt) => {
      const opts = [...document.querySelectorAll('[data-testid^="quiz-option-"]')];
      const hit = opts.findIndex((o) => o.querySelector('.quiz-opt-label').textContent === tt);
      const miss = opts.findIndex((o) => o.querySelector('.quiz-opt-label').textContent !== tt);
      return tt && (window.__flip = !window.__flip) || true ? hit : miss; // default correct
    }, t);
    await page.locator(`[data-testid="quiz-option-${correct ? idx : idx}"]`).click().catch(() => {});
    await page.waitForTimeout(1100);
  }
}

// reference (clay light web)
const ref = await browser.newPage({ viewport: { width: 1400, height: 950 } });
try {
  await ref.goto('http://localhost:4174/combo-clay-light-web.html', { waitUntil: 'networkidle', timeout: 60000 });
  await ref.waitForSelector('[data-screen-label]', { timeout: 40000 });
  await ref.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
  await ref.reload({ waitUntil: 'networkidle' });
  await ref.waitForSelector('[data-screen-label="Home"]', { timeout: 30000 });
  await ref.locator('[data-testid="category-tile-animals"]').click();
  await ref.waitForSelector('[data-screen-label="Deck: Animals"]');
  await ref.locator('[data-testid="quiz-start"]').click();
  await ref.waitForSelector('[data-screen-label="Quiz: Animals"]');
  await ref.waitForTimeout(800);
  await ref.locator('.device-screen').screenshot({ path: `${OUT}/ref-quiz-clay-light-web.png` });
  await answerAll(ref);
  if (await ref.locator('[data-testid="quiz-result"]').count()) {
    await ref.locator('.device-screen').screenshot({ path: `${OUT}/ref-result-clay-light-web.png` });
    console.log('ref results ok');
  } else console.log('ref results: not reached (skipped)');
  console.log('ref quiz ok');
} catch (e) { console.log('ref FAIL: ' + e.message.split('\n')[0]); }
await ref.close();

// implementation (clay light web)
const impl = await browser.newPage({ viewport: { width: 1180, height: 720 } });
await impl.goto('http://localhost:4173');
await impl.waitForSelector('[data-screen-label="Home"]');
await impl.locator('[data-testid="category-tile-animals"]').click();
await impl.waitForSelector('[data-screen-label="Deck: Animals"]');
await impl.locator('[data-testid="quiz-start"]').click();
await impl.waitForSelector('[data-screen-label="Quiz: Animals"]');
await impl.waitForTimeout(800);
await impl.screenshot({ path: `${OUT}/impl-quiz-clay-light-web.png` });
await answerAll(impl);
if (await impl.locator('[data-testid="quiz-result"]').count()) {
  await impl.screenshot({ path: `${OUT}/impl-result-clay-light-web.png` });
  console.log('impl results ok');
}
console.log('impl quiz ok');
await impl.close();
await browser.close();
