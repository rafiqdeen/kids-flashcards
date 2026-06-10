// Phase 2 verification — primitives driven through the ?pip-lab harness.
import { chromium } from '@playwright/test';

const BASE = (process.env.BASE_URL || 'http://localhost:4173') + '/?pip-lab';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(m.text()); });
await page.goto(BASE);
await page.waitForTimeout(600);

// Mascot: 6 concepts × 5 states all render
const mascots = await page.locator('[data-testid="lab-mascots"] [data-testid="mascot"]').count();
check('mascot 6×5 grid renders 30 svgs', mascots === 30, `got ${mascots}`);

// FlashCard structure: role=button div, not nested buttons
const card = page.locator('[data-testid="flashcard"]');
check('flashcard is role=button div', await card.evaluate((el) => el.tagName === 'DIV' && el.getAttribute('role') === 'button' && el.tabIndex === 0));
check('speak button inside card is real <button>', await card.locator('[data-testid="speak-button"]').evaluate((el) => el.tagName === 'BUTTON'));

// Flip on click + caption announce
await card.click();
await page.waitForTimeout(150);
check('click flips card', await card.evaluate((el) => el.classList.contains('flipped')));
const capVisible = await page.locator('.pip-caption').count();
check('caption bar shows on speak/announce', capVisible === 1);
check('caption is polite status', capVisible === 1 && await page.locator('.pip-caption').evaluate((el) => el.getAttribute('role') === 'status' && el.getAttribute('aria-live') === 'polite'));

// SpeakButton stopPropagation: clicking it must NOT flip the card back
await card.locator('[data-testid="speak-button"]').click();
await page.waitForTimeout(150);
check('speak click does not flip card', await card.evaluate((el) => el.classList.contains('flipped')));

// Keyboard: Space flips back
await card.focus();
await page.keyboard.press('Space');
await page.waitForTimeout(150);
check('Space flips card back', await card.evaluate((el) => !el.classList.contains('flipped')));
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
check('Enter flips card', await card.evaluate((el) => el.classList.contains('flipped')));

// Mastered + confetti
await page.locator('[data-testid="lab-master"]').click();
await page.waitForTimeout(200);
check('mastered ribbon appears', await card.locator('.mastered-ribbon').count() === 1);
check('confetti renders 40 pieces', await page.locator('.confetti span').count() === 40);

// CategoryTile states
check('tile fresh shows "{n} cards"', (await page.locator('[data-testid="category-tile-animals"] .cat-start').textContent()) === '46 cards');
check('tile in-progress shows pct ring', (await page.locator('[data-testid="category-tile-fruits"] .cat-ring b').textContent()) === '40%');
check('tile done shows 3 stars', await page.locator('[data-testid="category-tile-colors"] .cat-stars svg').count() === 3);

// QuizOption states
check('correct option disabled', await page.locator('[data-testid="quiz-option-1"]').isDisabled());
check('reveal option disabled', await page.locator('[data-testid="quiz-option-3"]').isDisabled());
check('wrong option stays enabled (try again)', await page.locator('[data-testid="quiz-option-2"]').isEnabled());
check('correct/wrong marks distinct', await page.locator('.quiz-mark.ok').count() === 1 && await page.locator('.quiz-mark.no').count() === 1);

// ProgressTrack / StreakBadge
check('progress track aria', await page.locator('.prog-track').evaluate((el) => el.getAttribute('role') === 'progressbar' && el.getAttribute('aria-valuenow') === '2'));
check('streak lit only when > 0', await page.evaluate(() => {
  const b = document.querySelectorAll('.streak-badge');
  return !b[0].classList.contains('lit') && b[1].classList.contains('lit');
}));

// Speak button sizing per spec (84px lg)
const dim = await page.locator('[data-testid="flashcard"] [data-testid="speak-button"]').evaluate((el) => el.offsetWidth);
check('speak button 84px', Math.round(dim) === 84, `got ${dim}`);

// No React DOM nesting warnings
const nesting = consoleErrors.filter((t) => t.includes('validateDOMNesting') || t.includes('cannot appear as a descendant'));
check('no nested-button DOM warnings', nesting.length === 0, nesting[0] || '');

// Reduced motion: confetti replaced by static banner
const rmPage = await browser.newPage({ viewport: { width: 1180, height: 900 }, reducedMotion: 'reduce' });
await rmPage.goto(BASE);
await rmPage.waitForTimeout(500);
await rmPage.locator('[data-testid="lab-master"]').click();
await rmPage.waitForTimeout(150);
check('reduced-motion: static "Nice!" instead of confetti',
  await rmPage.locator('.rm-celebrate').count() === 1 && await rmPage.locator('.confetti').count() === 0);
await rmPage.close();

// Screenshots for the record (clay/pop × light/dark)
for (const dir of ['clay', 'pop']) {
  for (const theme of ['light', 'dark']) {
    await page.evaluate(([d, t]) => {
      localStorage.setItem('pip-settings', JSON.stringify({ direction: d, theme: t }));
    }, [dir, theme]);
    await page.reload();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `verification-shots/phase2-lab-${dir}-${theme}.png`, fullPage: true });
  }
}

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
