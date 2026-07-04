#!/usr/bin/env node
import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../artifacts/screenshots/charades');

const BASE = process.env.GAME_HUB_URL || 'http://127.0.0.1:30900';

async function capture() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const mobile = await browser.newContext({ ...devices['iPhone 13 Pro Max'] });
  const page = await mobile.newPage();

  await page.goto(`${BASE}/`);
  await page.getByRole('heading', { name: 'Play', exact: true }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, 'mobile-01-play-home.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: /Charades/i }).click();
  await page.waitForURL('**/play/charades');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, 'mobile-02-setup-generations.png'),
    fullPage: true,
  });

  await page
    .locator('.charades-pack-card')
    .filter({ hasText: /^Movies/ })
    .click();
  await page.getByRole('button', { name: 'Easy', exact: true }).click();
  await page.getByRole('button', { name: /^Gen Z/ }).click();
  await page.getByRole('button', { name: /^Millennials/ }).click();
  await page.getByRole('button', { name: /^Gen X\+/ }).click();
  await page.getByRole('button', { name: 'Actors', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, 'mobile-03-movies-filters.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForURL('**/play/charades/game');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, 'mobile-04-hidden-card.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Reveal', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, 'mobile-05-revealed-card.png'),
    fullPage: true,
  });

  await browser.close();
  console.log('Screenshots saved to:', OUT_DIR);
  for (const f of fs.readdirSync(OUT_DIR).sort()) {
    console.log(' -', f);
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
