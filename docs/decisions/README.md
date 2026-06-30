# Architecture Decision Records (ADRs)

Short, durable notes on **why** we made non-obvious choices. For **how things work today**, see [`AGENTS.md`](../../AGENTS.md) and package READMEs.

## When to write an ADR

Add one when:

- The choice is non-obvious or easy to revert incorrectly
- You would re-explain it in three months
- An agent or future contributor might reasonably pick a different option

Skip ADRs for routine fixes, dependency bumps, and formatting.

## How to add one

1. Copy [`template.md`](./template.md)
2. Use the next number: `NNNN-short-slug.md`
3. Set **Status** to `Accepted` when merged
4. Add a row to the index table below
5. Link related code/config in **Links** when helpful

## Index

| ADR                                                | Title                                                      | Status   | Scope         |
| -------------------------------------------------- | ---------------------------------------------------------- | -------- | ------------- |
| [0001](./0001-launchpad-hybrid-config.md)          | Hybrid LaunchPad config (repo + Unraid override)           | Accepted | packages/home |
| [0002](./0002-curated-tiles-not-auto-discovery.md) | Curated app tiles, not pure Docker discovery               | Accepted | packages/home |
| [0003](./0003-reachability-via-host-gateway.md)    | Server-side reachability via host gateway                  | Accepted | packages/home |
| [0004](./0004-port-8888-home-app.md)               | Port 8888 for home app (dev and container)                 | Accepted | packages/home |
| [0005](./0005-ghcr-image-names-web-prefix.md)      | GHCR image names use `nasmono-*` prefix (GitHub repo name) | Accepted | docker        |
| [0006](./0006-minimal-unraid-compose-env.md)       | Minimal Unraid compose env (secrets only)                  | Accepted | docker        |
