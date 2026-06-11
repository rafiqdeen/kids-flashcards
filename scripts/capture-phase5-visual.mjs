// Phase 5 visual — Paint + Rewards, reference vs implementation (clay light web).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
const OUT = 'verification-shots/phase5';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const ref = await browser.newPage({ viewport: { width: 1400, height: 950 } });
try {
  await ref.goto('http://localhost:4174/combo-clay-light-web.html', { waitUntil: 'networkidle', timeout: 60000 });
  await ref.waitForSelector('[data-screen-label]', { timeout: 40000 });
  await ref.evaluate(() => localStorage.setItem('pip-onboarded', '1'));
  await ref.reload({ waitUntil: 'networkidle' });
  await ref.waitForSelector('[data-screen-label="Home"]', { timeout: 30000 });
  await ref.locator('[data-testid="webnav-paint"]').click();
  await ref.waitForSelector('[data-screen-label="Paint"]');
  await ref.waitForTimeout(800);
  await ref.locator('.device-screen').screenshot({ path: `${OUT}/ref-paint.png` });
  await ref.locator('[data-testid="webnav-rewards"]').click();
  await ref.waitForSelector('[data-screen-label="Rewards"]');
  await ref.waitForTimeout(600);
  await ref.locator('.device-screen').screenshot({ path: `${OUT}/ref-rewards.png` });
  console.log('ref ok');
} catch (e) { console.log('ref FAIL: ' + e.message.split('\n')[0]); }
await ref.close();

const impl = await browser.newPage({ viewport: { width: 1180, height: 720 } });
await impl.goto('http://localhost:4173');
await impl.waitForSelector('[data-screen-label="Home"]');
await impl.locator('[data-testid="webnav-paint"]').click();
await impl.waitForSelector('[data-screen-label="Paint"]');
await impl.waitForTimeout(800);
await impl.screenshot({ path: `${OUT}/impl-paint.png` });
await impl.locator('[data-testid="webnav-rewards"]').click();
await impl.waitForSelector('[data-screen-label="Rewards"]');
await impl.waitForTimeout(600);
await impl.screenshot({ path: `${OUT}/impl-rewards.png` });
console.log('impl ok');
await impl.close();
await browser.close();
