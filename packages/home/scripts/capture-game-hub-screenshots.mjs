#!/usr/bin/env node
import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../artifacts/screenshots/game-hub-lobby-ux');

const BASE = process.env.GAME_HUB_URL || 'http://localhost:3000';
const suffix = Date.now().toString(36);
const PLAYER_A = `Host-${suffix}`;
const PLAYER_B = `Guest-${suffix}`;
const LOBBY_NAME = `Friday Game Night ${suffix}`;

async function waitConnected(page) {
  await page.getByText('Connected', { exact: true }).waitFor({ timeout: 15000 });
}

async function login(page, name) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel('Display Name').fill(name);
  await page.getByRole('button', { name: 'Join Game' }).click();
  await page.waitForURL('**/lobbies**');
  await waitConnected(page);
}

async function capture() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const hostPage = await desktop.newPage();

  await login(hostPage, PLAYER_A);
  await hostPage.screenshot({
    path: path.join(OUT_DIR, '01-lobby-list-desktop.png'),
    fullPage: true,
  });

  await hostPage.getByPlaceholder('Enter lobby name...').fill(LOBBY_NAME);
  await hostPage.getByRole('button', { name: 'Create Lobby' }).click();
  await hostPage.waitForURL('**/lobbies/*');
  await hostPage.getByText('Start Game').waitFor({ timeout: 10000 });
  await hostPage.waitForTimeout(800);
  await hostPage.screenshot({
    path: path.join(OUT_DIR, '02-lobby-detail-host-desktop.png'),
    fullPage: true,
  });

  const lobbyId = hostPage.url().split('/').pop();

  const guestCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const guestPage = await guestCtx.newPage();
  await login(guestPage, PLAYER_B);
  await guestPage.waitForTimeout(500);
  await guestPage.screenshot({
    path: path.join(OUT_DIR, '03-lobby-list-with-card-desktop.png'),
    fullPage: true,
  });

  await guestPage
    .getByRole('button', { name: new RegExp(`^${LOBBY_NAME}.*Leader: ${PLAYER_A}`) })
    .click();
  await guestPage.waitForURL(`**/lobbies/${lobbyId}`, { timeout: 15000 });
  await guestPage.getByText('Waiting for host to start').waitFor({ timeout: 10000 });
  await guestPage.waitForTimeout(800);
  await guestPage.screenshot({
    path: path.join(OUT_DIR, '04-lobby-detail-guest-desktop.png'),
    fullPage: true,
  });

  await hostPage.bringToFront();
  await hostPage.getByText(PLAYER_B).waitFor({ timeout: 10000 });
  await hostPage.getByRole('button', { name: '⋯' }).click();
  await hostPage.getByRole('menuitem', { name: 'Make host' }).waitFor({ timeout: 5000 });
  await hostPage.waitForTimeout(300);
  await hostPage.screenshot({
    path: path.join(OUT_DIR, '05-host-transfer-menu-desktop.png'),
    fullPage: true,
  });

  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mobilePage = await mobile.newPage();
  await login(mobilePage, `Mobile-${suffix}`);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '06-lobby-list-mobile.png'),
    fullPage: true,
  });

  await mobilePage.getByPlaceholder('Enter lobby name...').fill('Mobile Lobby');
  await mobilePage.getByRole('button', { name: 'Create Lobby' }).click();
  await mobilePage.waitForURL('**/lobbies/*');
  await mobilePage.getByText('Start Game').waitFor({ timeout: 10000 });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '07-lobby-detail-mobile.png'),
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
