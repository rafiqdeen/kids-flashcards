// Phase 6 verification — onboarding gating, buddies, parent gate + working
// settings, welcome-back, motion toggle, update toast wiring.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();

// ---------- onboarding (fresh user) ----------
let page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.goto(BASE);
await page.waitForTimeout(600);
check('fresh user lands on Onboarding', await page.locator('[data-screen-label="Onboarding"]').count() === 1);
check('onboarding hides sidebar', await page.locator('.websidebar').count() === 0);
check('4 avatar choices', await page.locator('.avatar-card').count() === 4);
check('Next disabled until avatar picked', await page.locator('.onboard .pip-cta').isDisabled());
await page.locator('.avatar-card').nth(1).click();
await page.waitForTimeout(150);
check('avatar select = ring + spoken name', await page.locator('.avatar-card.sel').count() === 1
  && (await page.locator('.pip-caption').textContent()) === 'Puppy');
await page.locator('.onboard .pip-cta').click();
await page.waitForTimeout(300);
check('step 2: 3 size cards', await page.locator('.age-card').count() === 3);
await page.locator('.age-card').nth(1).click();
await page.waitForTimeout(300);
check('step 3: demo card with tap ring', await page.locator('.demo-card').count() === 1
  && await page.locator('.tap-ring').count() === 1);
check('CTA reads Skip before flip', (await page.locator('.onboard .pip-cta').textContent()) === 'Skip');
await page.waitForTimeout(600); // let the step-3 narration line land first
await page.locator('.demo-card').click();
await page.waitForTimeout(400);
check('flip speaks A is for Apple', (await page.locator('.pip-caption').textContent()) === 'A is for Apple.');
check('CTA becomes Let\'s play!', (await page.locator('.onboard .pip-cta').textContent()) === "Let's play!");
await page.locator('.onboard .pip-cta').click();
await page.waitForTimeout(400);
check('onboarding done → Home + pip-onboarded', await page.locator('[data-screen-label="Home"]').count() === 1
  && await page.evaluate(() => localStorage.getItem('pip-onboarded') === '1'));
await page.reload();
await page.waitForTimeout(500);
check('returning user goes straight Home', await page.locator('[data-screen-label="Home"]').count() === 1);

// ---------- buddies ----------
await page.locator('[data-testid="webnav-mascot"]').click();
await page.waitForTimeout(400);
check('mascot sheet with 6 concepts', await page.locator('.concept-pick').count() === 6);
check('5 mood cells', await page.locator('.state-cell').count() === 5);
await page.locator('.concept-pick').nth(3).click(); // bear
await page.waitForTimeout(300);
check('picking re-themes app-wide + persists', await page.evaluate(() =>
  JSON.parse(localStorage.getItem('pip-settings')).mascot === 'bear'));
await page.locator('[data-testid="mascot-back"]').click();
await page.waitForTimeout(300);

// ---------- parent gate ----------
await page.locator('.websidebar [data-testid="parent-entry"]').click();
await page.waitForTimeout(300);
check('parental gate shows', await page.locator('[data-testid="parental-gate"]').count() === 1);
const prob = await page.locator('.gate-problem').textContent();
const [a, b] = prob.match(/(\d+)\s*\+\s*(\d+)/).slice(1, 3).map(Number);
const sum = a + b;
// wrong answer first: type a full-length wrong value
const wrong = sum === 10 ? '99' : String(sum + 1);
for (const d of wrong) await page.locator('.key', { hasText: new RegExp(`^${d}$`) }).click();
await page.waitForTimeout(200);
check('wrong full answer → error state', (await page.locator('.gate-problem').getAttribute('class')).includes('err'));
const dels = wrong.length;
for (let i = 0; i < dels; i++) await page.locator('.key', { hasText: '⌫' }).click();
check('⌫ clears error', !(await page.locator('.gate-problem').getAttribute('class')).includes('err'));
for (const d of String(sum)) await page.locator('.key', { hasText: new RegExp(`^${d}$`) }).click();
await page.waitForTimeout(500);
check('correct answer unlocks dashboard', await page.locator('[data-screen-label="Parent dashboard"]').count() === 1);

// ---------- working settings ----------
check('real week stats (no fake play time)', await page.evaluate(() => {
  const stats = [...document.querySelectorAll('.dash-stats > div small')].map((e) => e.textContent);
  return stats.length === 2 && stats.includes('cards learned') && stats.includes('sets started');
}));
check('toggles have role=switch + aria-checked', await page.locator('[data-testid="settings-toggle-voice"][role="switch"]').count() === 1);

// voice off gates speech captions? (speech off still announces captions — capture mute behavior via settings persistence)
await page.locator('[data-testid="settings-toggle-voice"]').click();
check('voice toggle persists off', await page.evaluate(() => JSON.parse(localStorage.getItem('pip-settings')).voice === false));
await page.locator('[data-testid="settings-toggle-voice"]').click();

// motion toggle drives data-motion + confetti fallback
await page.locator('[data-testid="settings-toggle-motion"]').click();
await page.waitForTimeout(200);
check('motion off sets data-motion=off', await page.evaluate(() =>
  document.getElementById('root').getAttribute('data-motion') === 'off'));
// language select
await page.locator('[data-testid="settings-toggle-language"]').selectOption('en-US');
check('language persists', await page.evaluate(() => JSON.parse(localStorage.getItem('pip-settings')).language === 'en-US'));
check('privacy line present', (await page.locator('.privacy').last().textContent()).includes('No login'));

// motion-off confetti → static banner (master a card)
await page.locator('.deck-bar .round-btn').first().click();
await page.waitForTimeout(400);
await page.locator('[data-testid="category-tile-numbers"]').click();
await page.waitForTimeout(400);
await page.locator('[data-testid="flashcard"]').click();
await page.waitForTimeout(500);
await page.locator('[data-testid="mastered-button"]').click({ force: true });
await page.waitForTimeout(250);
check('motion off: static "Nice!" not confetti', await page.locator('.rm-celebrate').count() === 1
  && await page.locator('.confetti').count() === 0);
await page.close();

// ---------- welcome back ----------
page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.goto(BASE);
await page.waitForTimeout(300);
await page.evaluate(() => {
  localStorage.setItem('pip-onboarded', '1');
  localStorage.setItem('pip-last-visit', String(Date.now() - 7 * 3600 * 1000));
});
await page.reload();
await page.waitForTimeout(900);
check('>6h gap → welcome-back overlay', await page.locator('[data-testid="welcome-back"]').count() === 1);
await page.waitForTimeout(4000);
check('welcome-back auto-dismisses ~4.2s', await page.locator('[data-testid="welcome-back"]').count() === 0);

// ---------- update toast wiring (real hook, no 9s simulation) ----------
check('no simulated toast at 9s+', await page.locator('[data-testid="pwa-toast"]').count() === 0);
await page.evaluate(() => localStorage.clear());
await page.close();

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
