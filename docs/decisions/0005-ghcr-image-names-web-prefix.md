# ADR-0005: GHCR image names use `{repo}-{package}` prefix

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** docker

## Context

GitHub Actions (`release-on-merge.yml`) builds and pushes images as:

`ghcr.io/{owner}/{repo}-{package}:{tag}`

The GitHub repository is **`NasMono`** (not the local folder name `web`). CI therefore publishes:

- `ghcr.io/taygrayfamily/nasmono-home`
- `ghcr.io/taygrayfamily/nasmono-game-server`
- `ghcr.io/taygrayfamily/nasmono-game-hub`

Compose must match these names exactly.

## Decision

**Compose and docs use CI-generated names:**

| Package     | Image                                              |
| ----------- | -------------------------------------------------- |
| home        | `ghcr.io/taygrayfamily/nasmono-home:latest`        |
| game-server | `ghcr.io/taygrayfamily/nasmono-game-server:latest` |
| game-hub    | `ghcr.io/taygrayfamily/nasmono-game-hub:latest`    |

Derive the prefix from **`github.repository` name** (lowercased), not the local workspace directory.

## Alternatives considered

- **`web-*` prefix** — wrong; assumes local folder name matches GitHub repo name
- **`IMAGE` env override in compose** — extra indirection; easy to drift from CI

## Consequences

**Good:**

- Compose pulls what CI actually publishes
- One naming rule for all packages

**Bad / tradeoffs:**

- Renaming the GitHub repo changes image paths (update compose + ADR)

## Links

- `.github/workflows/release-on-merge.yml`
- `docker-compose.unraid.yml`
- Remote: `github.com/TayGrayFamily/NasMono`
