# ADR-0005: GHCR image names use `web-*` prefix

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** docker

## Context

GitHub Actions (`release-on-merge.yml`) builds and pushes images as:

`ghcr.io/{owner}/{repo}-{package}:{tag}`

For this repo that is `ghcr.io/taygrayfamily/web-home`, `web-game-server`, `web-game-hub`.

Compose previously referenced `nasmono-home`, which did not match CI output and caused pull/deploy confusion.

## Decision

**Compose and docs use CI-generated names:**

| Package     | Image                                          |
| ----------- | ---------------------------------------------- |
| home        | `ghcr.io/taygrayfamily/web-home:latest`        |
| game-server | `ghcr.io/taygrayfamily/web-game-server:latest` |
| game-hub    | `ghcr.io/taygrayfamily/web-game-hub:latest`    |

Do not hand-maintain alternate tags like `nasmono-*` unless CI is changed to match.

## Alternatives considered

- **Rename CI to `nasmono-*`** — would require workflow change and GHCR package rename
- **`IMAGE` env override in compose** — extra indirection; easy to drift from CI

## Consequences

**Good:**

- Compose pulls what CI actually publishes
- One naming rule for all packages

**Bad / tradeoffs:**

- Image name tied to repo name (`web`); renaming repo changes image paths

## Links

- `.github/workflows/release-on-merge.yml`
- `docker-compose.unraid.yml`
