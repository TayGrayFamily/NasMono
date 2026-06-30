#!/usr/bin/env bash
# Start local Postgres for game-server dev (Cloud Agent VMs have no systemd).
set -euo pipefail

CLUSTER_VERSION="${POSTGRES_CLUSTER_VERSION:-16}"
CLUSTER_NAME="${POSTGRES_CLUSTER_NAME:-main}"
HOST="${POSTGRES_HOST:-localhost}"
PORT="${POSTGRES_PORT:-5432}"

if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  echo "pg_ctlcluster not found. Install PostgreSQL 16 (postgresql, postgresql-contrib)." >&2
  exit 1
fi

status="$(pg_lsclusters -h | awk -v v="$CLUSTER_VERSION" -v n="$CLUSTER_NAME" '$1 == v && $2 == n { print $4 }')"
if [[ "$status" != "online" ]]; then
  echo "Starting Postgres cluster ${CLUSTER_VERSION}/${CLUSTER_NAME}..."
  sudo pg_ctlcluster "$CLUSTER_VERSION" "$CLUSTER_NAME" start
fi

for _ in $(seq 1 40); do
  if pg_isready -h "$HOST" -p "$PORT" -q; then
    echo "Postgres ready at ${HOST}:${PORT}"
    exit 0
  fi
  sleep 0.25
done

echo "Postgres did not become ready at ${HOST}:${PORT}" >&2
exit 1
