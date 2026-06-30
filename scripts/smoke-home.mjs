import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const homePkg = path.join(repoRoot, 'packages/home');
const fixturesDir = path.join(homePkg, 'test/fixtures');
const distServer = path.join(homePkg, 'dist-server/prod.js');
const distIndex = path.join(homePkg, 'dist/index.html');

const SMOKE_PORT = Number(process.env.SMOKE_PORT ?? 19888);

function fail(message) {
  console.error(`smoke-home: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`smoke-home: ${message}`);
}

async function waitForHealth(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return;
    } catch {
      // server still starting
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  fail(`server did not become healthy on port ${port} within ${timeoutMs}ms`);
}

async function assertJson(url, predicate) {
  const res = await fetch(url);
  if (!res.ok) {
    fail(`${url} returned HTTP ${res.status}`);
  }
  const body = await res.json();
  predicate(body);
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

async function runProdSmoke() {
  if (!fs.existsSync(distServer)) {
    fail(`missing ${distServer} — run pnpm --filter home build first`);
  }
  if (!fs.existsSync(distIndex)) {
    fail(`missing ${distIndex} — client build required for static smoke`);
  }

  const child = spawn('node', [distServer], {
    cwd: homePkg,
    env: {
      ...process.env,
      PORT: String(SMOKE_PORT),
      SERVER_HOST: '127.0.0.1',
      DOCKER_FIXTURE_PATH: path.join(fixturesDir, 'containers.json'),
      UNRAID_API_KEY: '',
      UNRAID_GRAPHQL_URL: '',
      DOCKER_SOCKET_PATH: 'null',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  child.stdout?.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr?.on('data', (chunk) => {
    logs += chunk.toString();
  });

  try {
    await waitForHealth(SMOKE_PORT);

    await assertJson(`http://127.0.0.1:${SMOKE_PORT}/api/health`, (body) => {
      if (body?.ok !== true) fail('/api/health body missing ok:true');
    });

    await assertJson(`http://127.0.0.1:${SMOKE_PORT}/api/launchpad`, (body) => {
      if (!Array.isArray(body?.apps) || body.apps.length === 0) {
        fail('/api/launchpad returned no apps');
      }
      const immich = body.apps.find((a) => a.id === 'immich');
      if (!immich || immich.state !== 'running' || immich.containerName !== 'immich-server') {
        fail('Immich tile not matched to running immich-server fixture');
      }
    });

    const indexRes = await fetch(`http://127.0.0.1:${SMOKE_PORT}/`);
    if (!indexRes.ok) fail(`GET / returned HTTP ${indexRes.status}`);
    const html = await indexRes.text();
    if (!html.includes('<!DOCTYPE html') && !html.includes('<html')) {
      fail('GET / did not return HTML shell');
    }

    log('prod server smoke passed');
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 300));
    if (!child.killed) child.kill('SIGKILL');
    if (logs.trim()) log(`server log tail:\n${logs.trim().split('\n').slice(-5).join('\n')}`);
  }
}

async function main() {
  const skipBuild = process.argv.includes('--skip-build');
  const integrationOnly = process.argv.includes('--integration-only');

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
    log(`starting prod server on 127.0.0.1:${SMOKE_PORT}…`);
    await runProdSmoke();
  }

  log('all smoke checks passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
