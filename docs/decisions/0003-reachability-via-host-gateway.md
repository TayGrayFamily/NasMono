# ADR-0003: Server-side reachability via host gateway

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** packages/home

## Context

LaunchPad shows “Responding / Not responding” via server-side HTTP probes (avoids browser CORS). Locally on a dev machine, `*.tower` hostnames resolve (Tailscale/DNS). Inside the `web_app` container on Unraid, those names often **fail DNS**, so all tiles showed “Not responding” even though the browser could open them fine.

## Decision

Keep **server-side** probing in `reachability.ts`, with a fallback chain:

1. Direct fetch to `probeUrl` or `url`
2. If that fails and `REACHABILITY_GATEWAY` is set → fetch the gateway (e.g. `http://host.docker.internal`) with the original `Host:` header so the host reverse proxy routes correctly
3. If that fails → try the matched container’s published **host port** via the gateway

Compose for `nasmono-home` sets:

```yaml
REACHABILITY_GATEWAY: http://host.docker.internal
extra_hosts:
  - 'host.docker.internal:host-gateway'
```

Return **actionable errors** in the API (`dns`, `connection_refused`, `timeout`, etc.) for the UI.

Treat HTTP status **&lt; 500** as responding (401/403/404 mean the service answered).

## Alternatives considered

- **Browser-only probes** — breaks on CORS for most homelab apps
- **Host network mode for container** — simpler networking but messier port isolation
- **Skip reachability in production** — less useful dashboard signal

## Consequences

**Good:**

- Works with reverse-proxy hostnames from inside Docker
- Dev unchanged when direct fetch succeeds

**Bad / tradeoffs:**

- Depends on reverse proxy listening on the host gateway from Docker’s perspective
- Auth-gated launch URLs may need separate `probeUrl` (e.g. Pi-hole `/api/docs/`)

## Links

- `packages/home/server/reachability.ts`
- `docker-compose.unraid.yml` (`nasmono-home`)
