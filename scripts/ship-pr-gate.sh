#!/usr/bin/env bash
# Local pre-merge gate: verify + optional game smoke when game packages changed.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

force_game=false
for arg in "$@"; do
  case "$arg" in
    --game) force_game=true ;;
    -h | --help)
      echo "Usage: scripts/ship-pr-gate.sh [--game]"
      echo "  Runs pnpm verify, then pnpm smoke:game if game packages changed (or --game)."
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

echo "ship-pr-gate: pnpm verify"
pnpm verify

game_touched=false
if git rev-parse --verify origin/master >/dev/null 2>&1; then
  if git diff --name-only origin/master...HEAD | grep -qE '^packages/(game-hub|game-server|charades|just-one)/'; then
    game_touched=true
  fi
elif git diff --name-only HEAD~1..HEAD 2>/dev/null | grep -qE '^packages/(game-hub|game-server|charades|just-one)/'; then
  game_touched=true
fi

if $force_game || $game_touched; then
  echo "ship-pr-gate: pnpm smoke:game"
  pnpm smoke:game
else
  echo "ship-pr-gate: skipping game smoke (no game package changes vs origin/master)"
fi

echo "ship-pr-gate: passed"
