// Phase 6 visual — onboarding, buddies, parent gate + dashboard (clay light web).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
const OUT = 'verification-shots/phase6';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function driveRef() {
  const p = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  try {
    await p.goto('http://localhost:4174/combo-clay-light-web.html', { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForSelector('[data-screen-label="Onboarding"]', { timeout: 40000 });
    await p.waitForTimeout(800);
    await p.locator('.device-screen').screenshot({ path: `${OUT}/ref-onboard.png` });
    await p.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForSelector('[data-screen-label="Home"]', { timeout: 30000 });
    await p.locator('[data-testid="webnav-mascot"]').click();
    await p.waitForSelector('[data-screen-label="Mascot sheet"]');
    await p.waitForTimeout(600);
    await p.locator('.device-screen').screenshot({ path: `${OUT}/ref-buddies.png` });
    await p.locator('[data-testid="mascot-back"]').click();
    await p.waitForTimeout(300);
    await p.locator('.websidebar [data-testid="parent-entry"]').click();
    await p.waitForSelector('[data-testid="parental-gate"]');
    await p.waitForTimeout(400);
    await p.locator('.device-screen').screenshot({ path: `${OUT}/ref-gate.png` });
    const prob = await p.locator('.gate-problem').textContent();
    const [a, b] = prob.match(/(\d+)\s*\+\s*(\d+)/).slice(1, 3).map(Number);
    for (const d of String(a + b)) await p.locator('.key', { hasText: new RegExp(`^${d}$`) }).click();
    await p.waitForSelector('[data-screen-label="Parent dashboard"]', { timeout: 5000 });
    await p.waitForTimeout(400);
    await p.locator('.device-screen').screenshot({ path: `${OUT}/ref-dash.png` });
    console.log('ref ok');
  } catch (e) { console.log('ref FAIL: ' + e.message.split('\n')[0]); }
  await p.close();
}

async function driveImpl() {
  const p = await browser.newPage({ viewport: { width: 1180, height: 720 } });
  await p.goto('http://localhost:4173');
  await p.waitForSelector('[data-screen-label="Onboarding"]');
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${OUT}/impl-onboard.png` });
  await p.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
  await p.reload();
  await p.waitForSelector('[data-screen-label="Home"]');
  await p.locator('[data-testid="webnav-mascot"]').click();
  await p.waitForSelector('[data-screen-label="Mascot sheet"]');
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/impl-buddies.png` });
  await p.locator('[data-testid="mascot-back"]').click();
  await p.waitForTimeout(300);
  await p.locator('.websidebar [data-testid="parent-entry"]').click();
  await p.waitForSelector('[data-testid="parental-gate"]');
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/impl-gate.png` });
  const prob = await p.locator('.gate-problem').textContent();
  const [a, b] = prob.match(/(\d+)\s*\+\s*(\d+)/).slice(1, 3).map(Number);
  for (const d of String(a + b)) await p.locator('.key', { hasText: new RegExp(`^${d}$`) }).click();
  await p.waitForSelector('[data-screen-label="Parent dashboard"]', { timeout: 5000 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/impl-dash.png` });
  console.log('impl ok');
  await p.close();
}

await driveRef();
await driveImpl();
await browser.close();
