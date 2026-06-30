#!/usr/bin/env bash
# Start Postgres, game-server, and game-hub for local development.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SERVER_PORT="${GAME_SERVER_PORT:-3001}"
HUB_PORT="${GAME_HUB_DEV_PORT:-3000}"

bash scripts/start-postgres-dev.sh

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting game-server on :${SERVER_PORT}..."
pnpm --filter game-server dev &
SERVER_PID=$!

echo "Waiting for game-server..."
ready=false
for _ in $(seq 1 60); do
  if curl -sf "http://localhost:${SERVER_PORT}/debug" >/dev/null 2>&1; then
    ready=true
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "game-server exited unexpectedly" >&2
    exit 1
  fi
  sleep 0.5
done

if [[ "$ready" != true ]]; then
  echo "game-server did not become ready on :${SERVER_PORT}" >&2
  exit 1
fi

if ! curl -sf -X POST "http://localhost:${SERVER_PORT}/api/admin/actions/sync-db" >/dev/null; then
  echo "Warning: database schema sync failed (login may not work until sync succeeds)" >&2
fi

echo "Starting game-hub on :${HUB_PORT} (http://localhost:${HUB_PORT})..."
exec pnpm --filter game-hub dev
