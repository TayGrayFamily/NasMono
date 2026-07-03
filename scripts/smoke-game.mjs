#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gameServerPkg = path.join(repoRoot, 'packages/game-server');
const gameHubPkg = path.join(repoRoot, 'packages/game-hub');
const gameServerDist = path.join(gameServerPkg, 'dist/index.js');
const gameHubDist = path.join(gameHubPkg, 'dist/index.html');

const SERVER_PORT = Number(process.env.SMOKE_GAME_SERVER_PORT ?? 30901);
const HUB_PORT = Number(process.env.SMOKE_GAME_HUB_PORT ?? 30900);
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/game_hub';
const SMOKE_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10 * 60 * 1000);

/** @type {import('node:child_process').ChildProcess | null} */
let gameServerChild = null;

function fail(message) {
  console.error(`smoke-game: ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`smoke-game: ${message}`);
}

function killGameServer() {
  if (!gameServerChild || gameServerChild.killed) return;
  gameServerChild.kill('SIGTERM');
  setTimeout(() => {
    if (gameServerChild && !gameServerChild.killed) gameServerChild.kill('SIGKILL');
  }, 3000).unref();
}

function runCommand(command, args, env = process.env, cwd = repoRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function waitForHealth(url, label, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        log(`${label} ready`);
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fail(`${label} did not become ready at ${url}`);
}

async function startGameServer() {
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    DATABASE_URL,
    GAME_SERVER_PORT: String(SERVER_PORT),
    SERVER_HOST: '127.0.0.1',
    GAME_SERVER_ENABLE_ADMIN: 'false',
    MAX_LOBBY_SIZE: process.env.MAX_LOBBY_SIZE ?? '2',
  };

  gameServerChild = spawn('node', [gameServerDist], {
    cwd: gameServerPkg,
    stdio: 'inherit',
    env,
  });

  gameServerChild.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`smoke-game: game-server exited with code ${code}`);
    }
  });

  await waitForHealth(`http://127.0.0.1:${SERVER_PORT}/api/health`, 'game-server');
}

function runGameServerTests() {
  return runCommand('pnpm', ['--filter', 'game-server', 'test'], {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: '',
  });
}

function runPlaywright() {
  return runCommand('pnpm', ['--filter', 'game-hub', 'exec', 'playwright', 'test'], {
    ...process.env,
    CI: process.env.CI ?? 'true',
    SMOKE_GAME_SERVER_PORT: String(SERVER_PORT),
    SMOKE_GAME_HUB_PORT: String(HUB_PORT),
    DATABASE_URL,
  });
}

function withSmokeTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      killGameServer();
      reject(new Error(`smoke-game timed out after ${SMOKE_TIMEOUT_MS}ms`));
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
  const e2eOnly = process.argv.includes('--e2e-only');

  if (!skipBuild && !apiOnly && !e2eOnly) {
    log('building game-server and game-hub…');
    await runCommand('pnpm', ['--filter', 'game-server', 'build']);
    await runCommand('pnpm', ['--filter', 'game-hub', 'build']);
  }

  if (!e2eOnly) {
    log('running game-server unit tests…');
    await runGameServerTests();
  }

  if (!apiOnly) {
    if (!fs.existsSync(gameServerDist)) {
      fail(`missing ${gameServerDist} — run pnpm --filter game-server build first`);
    }
    if (!fs.existsSync(gameHubDist)) {
      fail(`missing ${gameHubDist} — run pnpm --filter game-hub build first`);
    }

    log('starting game-server for Playwright smoke…');
    await startGameServer();

    try {
      log('running Playwright lobby behavior smoke…');
      await runPlaywright();
    } finally {
      killGameServer();
    }
  }

  log('all game smoke checks passed');
}

process.on('SIGTERM', () => {
  killGameServer();
  process.exit(1);
});

withSmokeTimeout(main()).catch((err) => {
  killGameServer();
  console.error(err);
  process.exit(1);
});
