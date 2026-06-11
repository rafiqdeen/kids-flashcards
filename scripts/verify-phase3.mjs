// Phase 3 verification — Home + Deck core loop, shells, persistence.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();

// ---------- web shell ----------
let page = await browser.newPage({ viewport: { width: 1180, height: 720 } });
await page.goto(BASE);
await page.waitForTimeout(600);

check('web: sidebar present', await page.locator('.websidebar').count() === 1);
check('web: sidebar is 236px', await page.locator('.websidebar').evaluate((el) => el.offsetWidth) === 236);
check('web: no bottom nav / no top home-bar', await page.locator('.bottom-nav').count() === 0
  && await page.locator('.home-bar').evaluate((el) => getComputedStyle(el).display) === 'none');
check('web: 12 category tiles', await page.locator('[data-testid^="category-tile-"]').count() === 12);
check('web: 4-col grid', await page.locator('.cat-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 4);
check('web: goal ring in sidebar', await page.locator('.websidebar [data-testid="daily-goal"]').count() === 1);
check('web: nav has 5 shared destinations', await page.locator('[data-testid^="webnav-"]').count() === 5);

// ---------- open a category (deck) ----------
await page.locator('[data-testid="category-tile-animals"]').click();
await page.waitForTimeout(400);
check('deck opens with screen label', await page.locator('[data-screen-label="Deck: Animals"]').count() === 1);
check('deck: caption announced category', (await page.locator('.pip-caption').textContent() || '').includes('Animals'));
check('deck: counts full dataset', (await page.locator('.deck-title small').textContent()) === '0/46 learned');
check('deck: thumb strip has 46 thumbs', await page.locator('.thumb').count() === 46);
check('deck: mastered button disabled before flip', await page.locator('[data-testid="mastered-button"]').isDisabled());
check('deck: key-help button present', await page.locator('[data-testid="key-help-btn"]').count() === 1);

// flip → master
await page.locator('[data-testid="flashcard"]').click();
await page.waitForTimeout(600);
check('deck: flip enables "I know this!"', (await page.locator('[data-testid="mastered-button"]').textContent() || '').includes('I know this'));
await page.locator('[data-testid="mastered-button"]').click({ force: true });
await page.waitForTimeout(300);
check('deck: master → Learned! + ribbon', (await page.locator('[data-testid="mastered-button"]').textContent() || '').includes('Learned')
  && await page.locator('.mastered-ribbon').count() === 1);
check('deck: confetti burst', await page.locator('.confetti').count() === 1);
check('deck: streak lit 1', (await page.locator('.streak-badge b').textContent()) === '1');
check('deck: progress counter 1/46', (await page.locator('.deck-title small').textContent()) === '1/46 learned');

// keyboard nav
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
check('deck: → advances to 2 of 46', (await page.locator('.deck-pos').textContent()) === '2 of 46');
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(250);
check('deck: ← returns to 1 of 46', (await page.locator('.deck-pos').textContent()) === '1 of 46');

// key help modal
await page.locator('[data-testid="key-help-btn"]').click();
check('key help modal opens', await page.locator('[data-testid="key-help"]').count() === 1);
await page.locator('[data-testid="key-help"] .pip-cta').click();
check('key help closes', await page.locator('[data-testid="key-help"]').count() === 0);

// Esc back home
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
check('Esc returns home', await page.locator('[data-screen-label="Home"]').count() === 1);
check('continue card appears for animals', (await page.locator('[data-testid="continue-card"] b').textContent()) === 'Animals');
check('animals tile shows 2%', (await page.locator('[data-testid="category-tile-animals"] .cat-ring b').textContent()) === '2%');
check('sidebar goal ring counts 1', (await page.locator('.websidebar .goal-ring-label').textContent()) === '1');

// persistence through reload
await page.reload();
await page.waitForTimeout(600);
check('reload: progress persists (2%)', (await page.locator('[data-testid="category-tile-animals"] .cat-ring b').textContent()) === '2%');
check('reload: continue card persists', await page.locator('[data-testid="continue-card"]').count() === 1);
check('reload: daily ring persists', (await page.locator('.websidebar .goal-ring-label').textContent()) === '1');

// legacy migration: seed old key, fresh pip-progress
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('kids-flashcards-progress', JSON.stringify({
    animals: { viewed: ['cat', 'dog'], mastered: ['cat', 'dog'] },
    bodyparts: { viewed: ['eyes'], mastered: ['eyes'] },
  }));
});
await page.reload();
await page.waitForTimeout(600);
check('migration: legacy mastery seeds pip-progress', await page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('pip-progress') || '{}');
  return Array.isArray(p.animals) && p.animals.length === 2 && Array.isArray(p.body) && p.body.includes('eyes');
}));
await page.evaluate(() => localStorage.clear());

// trophy modal — seed numbers to 9/10 then master the last
await page.evaluate(() => {
  localStorage.setItem('pip-progress', JSON.stringify({ numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }));
});
await page.reload();
await page.waitForTimeout(600);
await page.locator('[data-testid="category-tile-numbers"]').click();
await page.waitForTimeout(400);
// navigate to card 10
for (let i = 0; i < 9; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60); }
check('numbers: at 10 of 10', (await page.locator('.deck-pos').textContent()) === '10 of 10');
await page.locator('[data-testid="flashcard"]').click();
await page.waitForTimeout(600);
await page.locator('[data-testid="mastered-button"]').click({ force: true });
await page.waitForTimeout(1400);
check('trophy modal on category complete', await page.locator('[data-testid="category-complete"]').count() === 1);
check('trophy has quiz + home actions', (await page.locator('.trophy-actions .pip-cta').count()) === 2);
check('numbers tile would show stars', await page.evaluate(() => JSON.parse(localStorage.getItem('pip-progress')).numbers.length === 10));
await page.evaluate(() => localStorage.clear());
await page.close();

// ---------- phone shell ----------
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(BASE);
await page.waitForTimeout(600);
check('phone: bottom nav with 5 items', await page.locator('[data-testid^="bottomnav-"]').count() === 5);
check('phone: top home-bar with wordmark', await page.locator('.home-bar .wordmark').count() === 1);
check('phone: 2-col grid', await page.locator('.cat-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 2);
check('phone: floating goal ring on home', await page.locator('.goal-float [data-testid="daily-goal"]').count() === 1);
check('phone: no sidebar', await page.locator('.websidebar').count() === 0);

// tablet grid
await page.setViewportSize({ width: 834, height: 1112 });
await page.waitForTimeout(400);
check('tablet: 3-col grid', await page.locator('.cat-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 3);
await page.close();

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
