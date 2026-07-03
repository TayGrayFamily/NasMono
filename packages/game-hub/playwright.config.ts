import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hubPort = process.env.SMOKE_GAME_HUB_PORT ?? '30900';
const serverPort = process.env.SMOKE_GAME_SERVER_PORT ?? '30901';
const baseURL = `http://127.0.0.1:${hubPort}`;

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  globalTimeout: 600_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${hubPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      ...process.env,
      GAME_SERVER_PORT: serverPort,
      GAME_HUB_DEV_PORT: hubPort,
    },
  },
});
