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
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await desktop.newPage();

  await page.goto(`${BASE}/`);
  await page.getByRole('heading', { name: 'Play', exact: true }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, '01-play-home-desktop.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: /Charades/i }).click();
  await page.waitForURL('**/play/charades');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, '02-charades-setup-desktop.png'),
    fullPage: true,
  });

  await page
    .locator('.charades-pack-card')
    .filter({ hasText: 'Titles, quotes, characters, and actors' })
    .click();
  await page.getByRole('button', { name: 'Easy', exact: true }).click();
  await page.getByRole('button', { name: 'Actors', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, '03-movies-type-toggles-desktop.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Start' }).click();
  await page.waitForURL('**/play/charades/game');
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, '04-charades-hidden-card-desktop.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Reveal', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT_DIR, '05-charades-revealed-card-desktop.png'),
    fullPage: true,
  });

  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mobilePage = await mobile.newPage();

  await mobilePage.goto(`${BASE}/play/charades`);
  await mobilePage.locator('.charades-pack-card').filter({ hasText: 'Animals' }).first().click();
  await mobilePage.getByRole('button', { name: 'Easy', exact: true }).click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '06-charades-setup-mobile.png'),
    fullPage: true,
  });

  await mobilePage.getByRole('button', { name: 'Start' }).click();
  await mobilePage.waitForURL('**/play/charades/game');
  await mobilePage.getByRole('button', { name: 'Reveal', exact: true }).click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '07-charades-play-mobile.png'),
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
