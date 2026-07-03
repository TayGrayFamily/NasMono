import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const smokePort = process.env.SMOKE_PORT ?? '19888';
const baseURL = `http://127.0.0.1:${smokePort}`;
const fixturesDir = path.join(__dirname, 'test/fixtures');
const fixturesPath = path.join(fixturesDir, 'containers.json');
const domainsOutDir = path.join(fixturesDir, 'out');
const domainsConfigPath = path.join(domainsOutDir, 'domains.json');

fs.mkdirSync(domainsOutDir, { recursive: true });
fs.copyFileSync(path.join(fixturesDir, 'domains.routes.json'), domainsConfigPath);

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
    command: 'node dist-server/prod.js',
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      PORT: smokePort,
      SERVER_HOST: '127.0.0.1',
      DOCKER_FIXTURE_PATH: fixturesPath,
      DOMAINS_CONFIG_FIXTURE_PATH: domainsConfigPath,
      CADDYFILE_FIXTURE_PATH: path.join(domainsOutDir, 'Caddyfile'),
      PIHOLE_DNS_FIXTURE_PATH: path.join(domainsOutDir, 'domains.dns'),
      CADDY_RESTART_FIXTURE: 'ok',
      UNRAID_API_KEY: '',
      UNRAID_GRAPHQL_URL: '',
      DOCKER_SOCKET_PATH: 'null',
      NODE_ENV: 'production',
    },
  },
});
