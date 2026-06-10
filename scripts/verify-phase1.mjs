// Phase 1 verification — foundations: tokens, font, theme/direction attributes,
// breakpoint classes, focus-visible, reduced-motion, persistence.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok, detail }) && console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();

// --- web viewport ---
let page = await browser.newPage({ viewport: { width: 1180, height: 720 } });
await page.goto(BASE);
await page.waitForTimeout(600);

const root = page.locator('#root');
check('data-theme=light default', (await root.getAttribute('data-theme')) === 'light');
check('data-direction=clay default', (await root.getAttribute('data-direction')) === 'clay');
check('app-root class applied', ((await root.getAttribute('class')) || '').includes('app-root'));
check('web class at 1180px', ((await root.getAttribute('class')) || '').includes('web'));

const bg = await page.evaluate(() =>
  getComputedStyle(document.getElementById('root')).getPropertyValue('--bg').trim());
check('--bg token (light)', bg === '#fff3e2', `got ${bg}`);

const lexend = await page.evaluate(async () => {
  await document.fonts.ready;
  return document.fonts.check('16px Lexend');
});
check('Lexend self-hosted loads', lexend);

const fontReq = await page.evaluate(() =>
  performance.getEntriesByType('resource').some((r) => r.name.includes('/fonts/lexend')));
check('font served locally (no gstatic)', fontReq);

// focus-visible ring (settle: legacy `transition: all` animates outline in)
await page.keyboard.press('Tab');
await page.waitForTimeout(350);
const focusOutline = await page.evaluate(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'no-focus';
  const s = getComputedStyle(el);
  return `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`;
});
check('focus-visible 4px sky ring', focusOutline.includes('4px') && focusOutline.includes('rgb(56, 189, 248)'), focusOutline);

// persistence: flip to dark via stored settings, reload
await page.evaluate(() => localStorage.setItem('pip-settings', JSON.stringify({ theme: 'dark', direction: 'pop' })));
await page.reload();
await page.waitForTimeout(400);
check('persisted theme=dark on reload', (await root.getAttribute('data-theme')) === 'dark');
check('persisted direction=pop on reload', (await root.getAttribute('data-direction')) === 'pop');
const bgDark = await page.evaluate(() =>
  getComputedStyle(document.getElementById('root')).getPropertyValue('--bg').trim());
check('--bg token (dark)', bgDark === '#241a13', `got ${bgDark}`);
const strokeW = await page.evaluate(() =>
  getComputedStyle(document.getElementById('root')).getPropertyValue('--stroke-w').trim());
check('pop direction --stroke-w 3px', strokeW === '3px', `got ${strokeW}`);
const darkFocus = await page.evaluate(() => {
  document.querySelector('button')?.focus();
  return true;
});
void darkFocus;
await page.evaluate(() => localStorage.clear());
await page.close();

// --- phone & tablet breakpoints ---
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(BASE);
await page.waitForTimeout(400);
let cls = (await page.locator('#root').getAttribute('class')) || '';
check('no web/tablet class at 390px', !cls.includes('web') && !cls.includes('tablet'), cls);
await page.setViewportSize({ width: 834, height: 1112 });
await page.waitForTimeout(300);
cls = (await page.locator('#root').getAttribute('class')) || '';
check('tablet class at 834px', cls.includes('tablet') && !cls.includes('web'), cls);
await page.close();

// --- reduced motion ---
page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
await page.goto(BASE);
await page.waitForTimeout(400);
const animDur = await page.evaluate(() => {
  const el = document.querySelector('button') || document.body;
  return getComputedStyle(el).transitionDuration;
});
check('reduced-motion collapses transitions', parseFloat(animDur) < 0.01, animDur);
await page.close();

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
