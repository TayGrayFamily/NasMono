import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const smokePort = process.env.SMOKE_PORT ?? '19888';
const baseURL = `http://127.0.0.1:${smokePort}`;
const fixturesPath = path.join(__dirname, 'test/fixtures/containers.json');

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node dist-server/prod.js',
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      PORT: smokePort,
      SERVER_HOST: '127.0.0.1',
      DOCKER_FIXTURE_PATH: fixturesPath,
      UNRAID_API_KEY: '',
      UNRAID_GRAPHQL_URL: '',
      DOCKER_SOCKET_PATH: 'null',
      NODE_ENV: 'production',
    },
  },
});
