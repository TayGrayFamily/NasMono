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
const SMOKE_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10 * 60 * 1000);

/** @type {import('node:child_process').ChildProcess | null} */
let activeChild = null;

function fail(message) {
  console.error(`smoke-home: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`smoke-home: ${message}`);
}

function killActiveChild() {
  if (!activeChild || activeChild.killed) return;
  activeChild.kill('SIGTERM');
  setTimeout(() => {
    if (activeChild && !activeChild.killed) activeChild.kill('SIGKILL');
  }, 3000).unref();
}

function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      env,
    });
    activeChild = child;
    child.on('exit', (code) => {
      if (activeChild === child) activeChild = null;
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function runVitestIntegration() {
  return runCommand('pnpm', ['--filter', 'home', 'test'], {
    ...process.env,
    DOCKER_FIXTURE_PATH: path.join(fixturesDir, 'containers.json'),
    UNRAID_API_KEY: '',
    UNRAID_GRAPHQL_URL: '',
    DOCKER_SOCKET_PATH: 'null',
  });
}

function runPlaywrightE2E() {
  return runCommand('pnpm', ['--filter', 'home', 'exec', 'playwright', 'test'], {
    ...process.env,
    SMOKE_PORT: String(SMOKE_PORT),
    CI: process.env.CI ?? 'true',
  });
}

function withSmokeTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      killActiveChild();
      reject(new Error(`smoke-home timed out after ${SMOKE_TIMEOUT_MS}ms`));
    }, SMOKE_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function main() {
  const skipBuild = process.argv.includes('--skip-build');
  const apiOnly = process.argv.includes('--api-only');
  const skipApi = skipBuild && !apiOnly;

  if (!skipBuild && !apiOnly) {
    log('building packages/home…');
    await runCommand('pnpm', ['--filter', 'home', 'build']);
  }

  if (!skipApi) {
    log('running API integration tests…');
    await runVitestIntegration();
  }

  if (!apiOnly) {
    if (!fs.existsSync(distServer)) {
      fail(`missing ${distServer} — run pnpm --filter home build first`);
    }
    log('running Playwright UI smoke (prod server + fixtures)…');
    await runPlaywrightE2E();
  }

  log('all smoke checks passed');
}

process.on('SIGTERM', () => {
  killActiveChild();
  process.exit(1);
});

withSmokeTimeout(main()).catch((err) => {
  console.error(err);
  process.exit(1);
});
