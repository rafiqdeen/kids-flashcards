// Phase 7 final sweep — every screen in 2 directions × 2 themes × web/phone,
// plus tablet spot-checks. Output: verification-shots/phase7/.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
const OUT = 'verification-shots/phase7';
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:4173';
const browser = await chromium.launch();

const COMBOS = [];
for (const direction of ['clay', 'pop'])
  for (const theme of ['light', 'dark'])
    for (const device of ['web', 'phone'])
      COMBOS.push({ direction, theme, device });
COMBOS.push({ direction: 'clay', theme: 'light', device: 'tablet' }); // spot-check

for (const c of COMBOS) {
  const vp = c.device === 'web' ? { width: 1180, height: 720 }
    : c.device === 'tablet' ? { width: 834, height: 1112 }
      : { width: 390, height: 844 };
  const tag = `${c.direction}-${c.theme}-${c.device}`;
  const page = await browser.newPage({ viewport: vp });
  const shot = (name) => page.screenshot({ path: `${OUT}/${name}-${tag}.png` });
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(([d, t]) => {
      localStorage.clear();
      localStorage.setItem('pip-settings', JSON.stringify({ direction: d, theme: t }));
    }, [c.direction, c.theme]);
    await page.reload();
    await page.waitForSelector('[data-screen-label="Onboarding"]');
    await page.waitForTimeout(600);
    await shot('onboard');
    await page.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
    await page.reload();
    await page.waitForSelector('[data-screen-label="Home"]');
    await page.waitForTimeout(600);
    await shot('home');
    await page.locator('[data-testid="category-tile-animals"]').click();
    await page.waitForSelector('[data-screen-label="Deck: Animals"]');
    await page.waitForTimeout(700);
    await shot('deck');
    await page.locator('[data-testid="quiz-start"]').click();
    await page.waitForSelector('[data-screen-label="Quiz: Animals"]');
    await page.waitForTimeout(700);
    await shot('quiz');
    // rewards / paint / buddies via nav (web sidebar or phone bottom nav)
    const nav = (id) => page.locator(`[data-testid="webnav-${id}"], [data-testid="bottomnav-${id}"]`).first();
    await page.locator('.deck-bar .round-btn').first().click(); // back to deck
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await nav('rewards').click();
    await page.waitForSelector('[data-screen-label="Rewards"]');
    await page.waitForTimeout(500);
    await shot('rewards');
    await nav('paint').click();
    await page.waitForSelector('[data-screen-label="Paint"]');
    await page.waitForTimeout(600);
    await shot('paint');
    await nav('mascot').click();
    await page.waitForSelector('[data-screen-label="Mascot sheet"]');
    await page.waitForTimeout(500);
    await shot('buddies');
    await nav('home').click(); // phone: parent button lives in Home's top bar
    await page.waitForSelector('[data-screen-label="Home"]');
    await page.locator('[data-testid="parent-entry"]').first().click();
    await page.waitForSelector('[data-testid="parental-gate"]');
    await page.waitForTimeout(400);
    await shot('gate');
    const prob = await page.locator('.gate-problem').textContent();
    const [a, b] = prob.match(/(\d+)\s*\+\s*(\d+)/).slice(1, 3).map(Number);
    for (const d of String(a + b)) await page.locator('.key', { hasText: new RegExp(`^${d}$`) }).click();
    await page.waitForSelector('[data-screen-label="Parent dashboard"]', { timeout: 5000 });
    await page.waitForTimeout(400);
    await shot('dash');
    console.log(`ok    ${tag}`);
  } catch (e) {
    console.log(`FAIL  ${tag}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}
await browser.close();
console.log('sweep done');
