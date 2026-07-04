#!/usr/bin/env node
import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MOBILE_VIEWPORTS, REFERENCE_MOBILE_DEVICE } from '../test/mobile-devices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../artifacts/screenshots/charades');

const BASE = process.env.GAME_HUB_URL || 'http://127.0.0.1:30900';

async function capturePlayFlow(page, prefix) {
  await page.goto(`${BASE}/play/charades`);
  await page
    .locator('.charades-pack-card')
    .filter({ hasText: /^Movies/ })
    .click();
  await page.getByRole('button', { name: 'Easy', exact: true }).click();
  await page.getByRole('button', { name: /^Gen Z/ }).click();
  await page.getByRole('button', { name: /^Millennials/ }).click();
  await page.getByRole('button', { name: /^Gen X\+/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, `${prefix}-setup.png`),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForURL('**/play/charades/game');
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, `${prefix}-hidden-card.png`),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Reveal', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT_DIR, `${prefix}-revealed-card.png`),
    fullPage: true,
  });
}

async function capture() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const device = devices[REFERENCE_MOBILE_DEVICE];

  const portrait = await browser.newContext({
    ...device,
    viewport: MOBILE_VIEWPORTS['iphone-13-pro-max-portrait'],
  });
  const portraitPage = await portrait.newPage();

  await portraitPage.goto(`${BASE}/`);
  await portraitPage.getByRole('heading', { name: 'Play', exact: true }).waitFor();
  await portraitPage.waitForTimeout(300);
  await portraitPage.screenshot({
    path: path.join(OUT_DIR, 'portrait-01-play-home.png'),
    fullPage: true,
  });

  await portraitPage.getByRole('button', { name: /Charades/i }).click();
  await portraitPage.waitForURL('**/play/charades');
  await portraitPage.waitForTimeout(300);
  await portraitPage.screenshot({
    path: path.join(OUT_DIR, 'portrait-02-setup-generations.png'),
    fullPage: true,
  });

  await capturePlayFlow(portraitPage, 'portrait-03-movies');

  const landscape = await browser.newContext({
    ...device,
    viewport: MOBILE_VIEWPORTS['iphone-13-pro-max-landscape'],
  });
  const landscapePage = await landscape.newPage();
  await capturePlayFlow(landscapePage, 'landscape-01-movies');

  await browser.close();
  console.log(`Screenshots saved (${REFERENCE_MOBILE_DEVICE}):`, OUT_DIR);
  for (const f of fs.readdirSync(OUT_DIR).sort()) {
    console.log(' -', f);
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
