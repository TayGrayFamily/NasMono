# Home Web Apps Monorepo

pnpm workspace for web apps running on an **Unraid** NAS. Primary app: **LaunchPad dashboard** (`packages/home`). Also includes **Game Hub** (`packages/game-hub`, `packages/game-server`).

> **Agents:** read [`AGENTS.md`](AGENTS.md) first for architecture, pitfalls, and file map. Check [`docs/decisions/`](docs/decisions/) before changing LaunchPad, deploy, or reachability behavior.

## Repository layout

```
packages/
  home/          # NAS LaunchPad (Vite + React + Express) — main app
  game-hub/      # Game lobby UI
  game-server/   # Game Socket.IO server
docker-compose.unraid.yml
.env.example
docs/
  decisions/     # Architecture Decision Records (why)
  roadmap/       # Product roadmaps and phased plans (what/when)
```

## Scripts (from repo root)

```bash
pnpm install
pnpm dev:home          # LaunchPad dev server → http://localhost:8888
pnpm dev:game          # Game stack: Postgres + server + hub → http://localhost:3000
pnpm dev:game-hub      # Game Hub UI only
pnpm dev:game-server   # Game server only
pnpm check             # format + lint + build (fast)
pnpm test              # vitest in all packages
pnpm verify            # check + test + home smoke — run before PRs
```

## Local dev (LaunchPad)

```bash
cp .env.example .env
# Add UNRAID_API_KEY and UNRAID_GRAPHQL_URL (see .env.example)
pnpm dev:home
```

Details: [`packages/home/README.md`](packages/home/README.md)

## Architecture decisions & planning

- **ADRs** — non-obvious technical choices: [`docs/decisions/`](docs/decisions/README.md)
- **Roadmaps** — phased product plans and backlog narrative: [`docs/roadmap/`](docs/roadmap/README.md)
- **Game Hub** — active roadmap: [`docs/roadmap/game-hub.md`](docs/roadmap/game-hub.md) · [ADR-0007](docs/decisions/0007-game-hub-lobby-first-roadmap.md)

Add a new ADR when a decision might be reversed without context. Track implementation in GitHub Issues and the **Game Hub** Project.

## Deploy on Unraid

1. Add `docker-compose.unraid.yml` to **Compose Manager**
2. Create a `.env` next to the compose file with:

   ```env
   UNRAID_API_KEY=your-unraid-api-key
   ```

3. For the **game stack** only, also set `POSTGRES_PASSWORD`
4. Create external network once (game stack): `docker network create game-network`
5. Pull/recreate after releases:

   ```bash
   docker compose -f docker-compose.unraid.yml up -d --force-recreate nasmono-home
   ```

**Home app defaults:** host port **8888**, image `ghcr.io/taygrayfamily/nasmono-home:latest`

Optional per-app overrides: edit `/mnt/user/appdata/nasmono-home/apps.json` (see home README).

## CI & releases

| Workflow                                 | Trigger               | Purpose                         |
| ---------------------------------------- | --------------------- | ------------------------------- |
| `.github/workflows/ci.yml`               | PR + push to `master` | Format, lint, build, test       |
| `.github/workflows/release-on-merge.yml` | Push to `master`      | Semver bump, GHCR Docker images |

Docker images: `ghcr.io/taygrayfamily/nasmono-{home,game-server,game-hub}:latest`

## Adding a new package

1. Create `packages/my-app/` with `package.json` (`private: true`, `dev`/`build` scripts)
2. `pnpm install` from root
3. `pnpm --filter ./packages/my-app dev`

## Troubleshooting

- **Node not found in git hooks** — see Husky section below or run `pnpm run husky:normalize`
- **Port conflicts** — LaunchPad uses 8888; game-server 3001; game-hub 8000
- **LaunchPad deploy issues** — see [`packages/home/README.md`](packages/home/README.md#troubleshooting)

## Hooks & Node PATH

Git hooks may not see `node` if installed via nvm. Add nvm init to `~/.zshenv`, or install Node system-wide (`brew install node`). Run `pnpm run husky:normalize` after adding hooks.
