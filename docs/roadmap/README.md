# Roadmap

Living plans for **what we intend to build** and in what order. This is not the same as [ADRs](../decisions/README.md), which record **why** we made specific technical choices.

## Planning layers

| Layer              | Where                                                                      | Use for                                                    |
| ------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Decisions**      | [`docs/decisions/`](../decisions/)                                         | Non-obvious choices that should not be reversed casually   |
| **Roadmap**        | `docs/roadmap/` (this folder)                                              | Product vision, phases, deferred ideas, done-when criteria |
| **Execution**      | [GitHub Issues](https://github.com/TayGrayFamily/NasMono/issues)           | Concrete, closable tasks                                   |
| **Tracking**       | [GitHub Project: Game Hub](https://github.com/orgs/TayGrayFamily/projects) | Board views, status, phase filters                         |
| **How (today)**    | [`AGENTS.md`](../../AGENTS.md), package READMEs                            | Current behavior and dev setup                             |
| **How (patterns)** | [`ARCHITECTURE.md`](../../ARCHITECTURE.md)                                 | Socket.IO and real-time design principles                  |

**Rule of thumb:** If it ships as a PR, track it in an **issue**. If it is a multi-month narrative or “someday” idea, put it in a **roadmap doc**. If someone might pick the wrong option in three months, write an **ADR**.

## Product roadmaps

| Roadmap                             | Status                | ADR                                                                                                  |
| ----------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| [Game Hub](./game-hub.md)           | Active — P0 next      | [ADR-0007](../decisions/0007-game-hub-lobby-first-roadmap.md)                                        |
| LaunchPad (`packages/home`)         | Maintained via ADRs   | [0001](../decisions/0001-launchpad-hybrid-config.md)–[0004](../decisions/0004-port-8888-home-app.md) |
| [Caddy Domains](./caddy-domains.md) | P0 complete — P1 next | [ADR-0008](../decisions/0008-caddy-domains-in-home.md)                                               |

## GitHub Project setup

Labels, project board, and issue wiring are applied by:

```bash
./scripts/setup-game-hub-github.sh
```

Requires `gh` with `project` scope (`gh auth refresh -s project,write:org` or repo admin). See script header for details.

## Updating

1. **Phase completes** — check off narrative in the roadmap doc; close linked issues; move Project cards to Done.
2. **Priority changes** — update roadmap phase text + Project; do not rewrite ADRs unless the decision changed.
3. **New decision** — add ADR; link from roadmap if it affects sequencing.
