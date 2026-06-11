// Phase 4 verification — quiz flow, option states, results, mistake review.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 800 } });
await page.goto(BASE);
await page.waitForTimeout(500);

// enter quiz via deck
await page.locator('[data-testid="category-tile-numbers"]').click();
await page.waitForTimeout(400);
await page.locator('[data-testid="quiz-start"]').click();
await page.waitForTimeout(700);
check('quiz screen label', await page.locator('[data-screen-label="Quiz: Numbers"]').count() === 1);
check('quiz: 4 options (normal difficulty)', await page.locator('[data-testid^="quiz-option-"]').count() === 4);
check('quiz: progress reads 1 of 10', (await page.locator('.quiz-progress small').textContent()) === '1 of 10');
check('quiz: prompt caption spoken', (await page.locator('.pip-caption').textContent() || '').includes('Find the'));

const target = await page.locator('.quiz-ask b').textContent();

// deliberate wrong answer on Q1
const wrongIdx = await page.evaluate((t) => {
  const opts = [...document.querySelectorAll('[data-testid^="quiz-option-"]')];
  return opts.findIndex((o) => !o.textContent.includes(t));
}, target);
await page.locator(`[data-testid="quiz-option-${wrongIdx}"]`).click();
await page.waitForTimeout(300);
check('wrong pick gets wrong state + ✗', await page.locator('.quiz-opt.wrong .quiz-mark.no').count() === 1);
check('correct answer revealed with sky ring', await page.locator('.quiz-opt.reveal').count() === 1);
check('others disabled after pick', await page.locator('.quiz-opt.disabled').count() === 2);
check('one attempt: second click ignored', await page.evaluate(() => {
  const score = document.querySelector('.quiz-score-chip').textContent;
  document.querySelector('.quiz-opt.reveal')?.click();
  return document.querySelector('.quiz-score-chip').textContent === score;
}));

// wait for auto-advance (~1500ms wrong)
await page.waitForTimeout(1700);
check('auto-advance to 2 of 10', (await page.locator('.quiz-progress small').textContent()) === '2 of 10');

// answer the rest correctly
for (let i = 2; i <= 10; i++) {
  const t = await page.locator('.quiz-ask b').textContent();
  const idx = await page.evaluate((tt) => {
    const opts = [...document.querySelectorAll('[data-testid^="quiz-option-"]')];
    return opts.findIndex((o) => o.querySelector('.quiz-opt-label').textContent === tt);
  }, t);
  await page.locator(`[data-testid="quiz-option-${idx}"]`).click();
  await page.waitForTimeout(1050);
}

check('results screen shown', await page.locator('[data-testid="quiz-result"]').count() === 1);
check('score 9 of 10', await page.evaluate(() => {
  const s = document.querySelector('.result-score');
  return s && s.querySelector('b').textContent === '9' && s.textContent.includes('of 10');
}));
check('≥70% says Amazing!', (await page.locator('[data-testid="quiz-result"] h1').textContent()) === 'Amazing!');
check('mistake review shows 1 row', await page.locator('.mistake-row').count() === 1);
check('mistake row is role=button div with inner speak button', await page.locator('.mistake-row').evaluate(
  (el) => el.tagName === 'DIV' && el.getAttribute('role') === 'button' && el.querySelector('button[data-testid="speak-button"]') !== null));
check('three result actions', await page.locator('.result-actions button').count() === 3);

// mistake row speaks (caption)
await page.locator('.mistake-row').first().click();
await page.waitForTimeout(200);
check('mistake row click announces phrase', await page.locator('.pip-caption').count() === 1);

// Try again remounts quiz
await page.locator('.result-actions .pip-cta').first().click();
await page.waitForTimeout(600);
check('try again restarts at 1 of 10 score 0', (await page.locator('.quiz-progress small').textContent()) === '1 of 10'
  && (await page.locator('.quiz-score-chip').textContent()) === '0');

// back to cards
await page.locator('.deck-bar .round-btn').first().click();
await page.waitForTimeout(400);
check('back returns to deck', await page.locator('[data-screen-label="Deck: Numbers"]').count() === 1);

// easy difficulty = 2 choices
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('pip-settings') || '{}');
  s.difficulty = 'easy';
  localStorage.setItem('pip-settings', JSON.stringify(s));
});
await page.reload();
await page.waitForTimeout(600);
await page.locator('[data-testid="category-tile-numbers"]').click();
await page.waitForTimeout(400);
await page.locator('[data-testid="quiz-start"]').click();
await page.waitForTimeout(700);
check('easy difficulty: 2 options', await page.locator('[data-testid^="quiz-option-"]').count() === 2);

await page.evaluate(() => localStorage.clear());
await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
