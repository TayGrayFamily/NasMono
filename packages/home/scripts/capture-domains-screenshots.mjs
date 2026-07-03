#!/usr/bin/env node
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homePkg = path.resolve(__dirname, '..');
const fixturesDir = path.join(homePkg, 'test/fixtures');
const outDir = path.join(fixturesDir, 'out');
const OUT_DIR =
  process.env.DOMAINS_SCREENSHOT_DIR ??
  path.resolve(homePkg, '../../artifacts/screenshots/domains-editor');
const PORT = process.env.DOMAINS_SCREENSHOT_PORT ?? '18888';
const BASE = `http://127.0.0.1:${PORT}`;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.copyFileSync(path.join(fixturesDir, 'domains.routes.json'), path.join(outDir, 'domains.json'));

const serverEnv = {
  ...process.env,
  PORT,
  SERVER_HOST: '127.0.0.1',
  NODE_ENV: 'production',
  DOCKER_FIXTURE_PATH: path.join(fixturesDir, 'containers.json'),
  DOMAINS_CONFIG_FIXTURE_PATH: path.join(outDir, 'domains.json'),
  CADDYFILE_FIXTURE_PATH: path.join(outDir, 'Caddyfile'),
  PIHOLE_DNS_FIXTURE_PATH: path.join(outDir, 'domains.dns'),
  CADDY_RESTART_FIXTURE: 'ok',
  UNRAID_API_KEY: '',
  UNRAID_GRAPHQL_URL: '',
  DOCKER_SOCKET_PATH: 'null',
};

async function waitForHealth() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('server did not become healthy');
}

async function capture() {
  const server = spawn('node', ['dist-server/prod.js'], {
    cwd: homePkg,
    env: serverEnv,
    stdio: 'inherit',
  });

  try {
    await waitForHealth();
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${BASE}/system/domains`);
    await page.getByRole('heading', { name: 'Domains' }).waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUT_DIR, '01-domains-editor.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: 'Add route' }).click();
    await page.getByPlaceholder('home.tower').last().fill('demo.tower');
    await page.locator('input[type="number"]').last().fill('3456');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, '02-domains-add-route.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Saved — Caddy restarted.').waitFor();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, '03-domains-save-success.png'),
      fullPage: true,
    });

    await browser.close();
    console.log(`Screenshots saved to ${OUT_DIR}`);
  } finally {
    server.kill('SIGTERM');
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
