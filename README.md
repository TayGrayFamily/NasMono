# Home Web Apps Monorepo

This repository is a pnpm workspace for web applications and utilities that run on my home Unraid NAS. It contains apps and tools for home automation, IoT, and monitoring.

Purpose
- Host frontend web apps and small tools that integrate with home automation systems (Home Assistant, Node-RED, MQTT, etc.).
- Centralize shared dev scripts, dependency management, and CI for all web apps.
- Make it easy to add new apps, reuse UI components, and run multiple dev servers locally.

Repository layout
- `package.json` - workspace root package.json with workspace-level scripts.
- `pnpm-workspace.yaml` - pnpm workspace globs (currently `packages/*`).
- `.npmrc` - pnpm workspace config (shared lockfile, save-exact, etc.).
- `packages/` - all workspace packages/apps live here.
  - `packages/home` - existing Vite + React app used for the NAS dashboard or experiments.

How to add a new app
1. Create a new folder under `packages/`, e.g. `packages/device-manager`.
2. Add a `package.json` with at least a `name`, `version`, `private: true` and scripts such as `dev` and `build`.
3. Add your source files (e.g. `src/`, `public/`, config files) and any config (Vite, tsconfig, eslint).
4. From the repo root run:

```bash
pnpm install
pnpm --filter ./packages/device-manager dev
# or run across all packages
pnpm -w dev
```

Important workspace scripts (run from repo root)

```bash
# install dependencies and generate a single pnpm-lock.yaml
pnpm install

# run 'dev' in all workspace packages (recursive)
pnpm -w dev

# run a script only for a single package
pnpm --filter ./packages/<name> dev
pnpm --filter ./packages/<name> build
pnpm --filter ./packages/<name> preview

# run lint/tests across workspaces
pnpm -w lint
pnpm -w test
```

Notes and best practices
- Keep the root `package.json` `private: true` to avoid accidental publishes.
- Prefer adding shared dependencies at the root (pnpm will hoist them) if multiple packages use the same library.
- If a package will be published to npm, give it a globally unique `name` in its `package.json` and remove `private: true`.
- The repo `.npmrc` has `shared-workspace-lockfile=true` so there will be a single `pnpm-lock.yaml` at the root.
- If tools/IDEs have trouble resolving modules, try enabling hoisting in `.npmrc` by uncommenting the `public-hoist-pattern[]="*"` line.

Vite-specific notes
- Files placed in a package's `public/` directory are served at the root of that package's dev server. In this repo `packages/home/public/vite.svg` is referenced in code as `/vite.svg`.
- If you change the package layout or move files, update `vite.config.ts` `base` or `root` options as needed.

CI example (GitHub Actions)

Create `.github/workflows/ci.yml` with something like this to build all workspace packages:

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install pnpm
        run: npm install -g pnpm
      - name: Install dependencies
        run: pnpm install
      - name: Build all packages
        run: pnpm -w -r build
```

Troubleshooting
- "env: node: No such file or directory" — install Node (and pnpm) on the machine running the commands.
- Peer dependency errors — inspect package.json `peerDependencies` and align versions across workspace packages or add the dependency at the root.
- Port conflicts when running many dev servers — set package dev scripts to accept a PORT env var or run them individually.
