import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const homePkg = path.join(repoRoot, 'packages/home');
const fixturesDir = path.join(homePkg, 'test/fixtures');
const distServer = path.join(homePkg, 'dist-server/prod.js');

const SMOKE_PORT = Number(process.env.SMOKE_PORT ?? 19888);

function fail(message) {
  console.error(`smoke-home: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`smoke-home: ${message}`);
}

function runVitestIntegration() {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', 'home', 'exec', 'vitest', 'run', 'test/integration'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        DOCKER_FIXTURE_PATH: path.join(fixturesDir, 'containers.json'),
        UNRAID_API_KEY: '',
        UNRAID_GRAPHQL_URL: '',
        DOCKER_SOCKET_PATH: 'null',
      },
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`integration tests exited with code ${code}`));
    });
  });
}

function runPlaywrightE2E() {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', 'home', 'exec', 'playwright', 'test'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        SMOKE_PORT: String(SMOKE_PORT),
        CI: process.env.CI ?? 'true',
      },
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Playwright e2e exited with code ${code}`));
    });
  });
}

async function main() {
  const skipBuild = process.argv.includes('--skip-build');
  const integrationOnly = process.argv.includes('--api-only');

  if (!skipBuild && !integrationOnly) {
    log('building packages/home…');
    await new Promise((resolve, reject) => {
      const child = spawn('pnpm', ['--filter', 'home', 'build'], {
        cwd: repoRoot,
        stdio: 'inherit',
      });
      child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('build failed'))));
    });
  }

  log('running API integration tests…');
  await runVitestIntegration();

  if (!integrationOnly) {
    if (!fs.existsSync(distServer)) {
      fail(`missing ${distServer} — run pnpm --filter home build first`);
    }
    log('running Playwright UI smoke (prod server + fixtures)…');
    await runPlaywrightE2E();
  }

  log('all smoke checks passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
