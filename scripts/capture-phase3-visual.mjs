// Phase 3 visual pass — capture reference (Pip Cards v2.html) vs implementation
// for Home + Deck in clay/pop × light/dark × web/phone. Pairs land in
// verification-shots/phase3/ for region-by-region review.
import { chromium } from '@playwright/test';
import { mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';

const REF_DIR = '/tmp/pip-ref';
const OUT = 'verification-shots/phase3';
mkdirSync(OUT, { recursive: true });
cpSync('design_handoff_pip_cards', REF_DIR, { recursive: true });

const COMBOS = [];
for (const direction of ['clay', 'pop'])
  for (const theme of ['light', 'dark'])
    for (const device of ['web', 'phone'])
      COMBOS.push({ direction, theme, device });

const baseHtml = readFileSync(`${REF_DIR}/Pip Cards v2.html`, 'utf8');
for (const c of COMBOS) {
  const json = JSON.stringify({ direction: c.direction, theme: c.theme, device: c.device, mascot: 'pip' });
  const html = baseHtml.replace(/\/\*EDITMODE-BEGIN\*\/\{[\s\S]*?\}\/\*EDITMODE-END\*\//, `/*EDITMODE-BEGIN*/${json}/*EDITMODE-END*/`);
  writeFileSync(`${REF_DIR}/combo-${c.direction}-${c.theme}-${c.device}.html`, html);
}

const browser = await chromium.launch();

// ---------- reference captures ----------
for (const c of COMBOS) {
  const vp = c.device === 'web' ? { width: 1400, height: 950 } : { width: 640, height: 1050 };
  const page = await browser.newPage({ viewport: vp });
  const tag = `${c.direction}-${c.theme}-${c.device}`;
  try {
    await page.goto(`http://localhost:4174/combo-${tag}.html`, { waitUntil: 'networkidle', timeout: 45000 });
    // fresh profile boots into Onboarding — mark onboarded and reload to Home
    await page.waitForSelector('[data-screen-label]', { timeout: 40000 });
    await page.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-screen-label="Home"]', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.locator('.device-screen').screenshot({ path: `${OUT}/ref-home-${tag}.png` });
    await page.locator('[data-testid="category-tile-animals"]').click();
    await page.waitForSelector('[data-screen-label="Deck: Animals"]', { timeout: 10000 });
    await page.waitForTimeout(900);
    await page.locator('.device-screen').screenshot({ path: `${OUT}/ref-deck-${tag}.png` });
    console.log(`ref ok    ${tag}`);
  } catch (e) {
    console.log(`ref FAIL  ${tag}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

// ---------- implementation captures ----------
for (const c of COMBOS) {
  const vp = c.device === 'web' ? { width: 1180, height: 720 } : { width: 390, height: 844 };
  const page = await browser.newPage({ viewport: vp });
  const tag = `${c.direction}-${c.theme}-${c.device}`;
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page.evaluate(([d, t]) => {
      localStorage.clear();
      localStorage.setItem('pip-settings', JSON.stringify({ direction: d, theme: t }));
    }, [c.direction, c.theme]);
    await page.reload();
    await page.waitForSelector('[data-screen-label="Home"]', { timeout: 10000 });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/impl-home-${tag}.png` });
    await page.locator('[data-testid="category-tile-animals"]').click();
    await page.waitForSelector('[data-screen-label="Deck: Animals"]', { timeout: 10000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/impl-deck-${tag}.png` });
    console.log(`impl ok   ${tag}`);
  } catch (e) {
    console.log(`impl FAIL ${tag}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

await browser.close();
console.log('done');
