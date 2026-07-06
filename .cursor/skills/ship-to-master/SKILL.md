---
name: ship-to-master
description: End-to-end PR ship workflow for NasMono — run local verify/tests, code-review the diff, merge master into the branch, confirm GitHub CI is green, merge the PR to master, and ensure linked issues auto-close via Closes #N. Use when the user asks to verify, review, check CI, merge master in, ship, land, or merge a PR.
---

# Ship to master

Complete this workflow **in order** unless the user narrows scope (e.g. “only run verify”).

## Prerequisites

- Work happens on a **feature branch** with an open PR (or create one before merging).
- Cloud Agent branches use `cursor/<descriptive-name>-ddf2`.
- Base branch is **`master`** unless the user says otherwise.
- Read `AGENTS.md` for package-specific verify commands before changing scope.

## Workflow overview

```
1. Local verify + targeted tests
2. Code review (diff + risks)
3. Merge master into branch → resolve conflicts → re-verify
4. Push branch → wait for / confirm CI green
5. Ensure PR links issues (Closes #N)
6. Merge PR to master
7. Confirm issues closed + summarize
```

---

## 1. Local verify

From repo root:

```bash
pnpm install   # if deps may be stale
pnpm verify    # format + lint + build + unit tests + home smoke
```

**Targeted extras** (run when those areas changed):

| Changed area                                                                              | Additional command                                                                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `packages/home/`                                                                          | `pnpm smoke` (if verify already ran, optional)                                                          |
| `packages/game-hub/`, `packages/charades/`, `packages/game-server/`, `packages/just-one/` | `pnpm smoke:game`                                                                                       |
| Charades UI only                                                                          | `pnpm --filter game-hub build && pnpm --filter game-hub exec playwright test test/e2e/charades.spec.ts` |
| Game Hub mobile layouts                                                                   | Charades e2e + portrait/landscape per `AGENTS.md`                                                       |

Shortcut script (verify + auto game smoke when game packages changed):

```bash
bash scripts/ship-pr-gate.sh
bash scripts/ship-pr-gate.sh --game   # force game smoke
```

**If verify fails:** fix, commit, push, then continue. Do not merge with failing local gates.

---

## 2. Code review

Before merging, review the PR diff against `master`:

```bash
git fetch origin master
git diff origin/master...HEAD --stat
git diff origin/master...HEAD
gh pr view --json title,body,files,additions,deletions
```

**Checklist:**

- [ ] Scope is minimal — no unrelated drive-by changes
- [ ] Matches existing patterns in the touched package(s)
- [ ] No secrets, `.env`, or credentials committed
- [ ] Tests cover meaningful behavior (not trivial assertions)
- [ ] User-facing copy is clear; a11y basics preserved for UI
- [ ] ADRs in `docs/decisions/` consulted if changing LaunchPad, deploy, reachability, or compose
- [ ] No obvious regressions called out in `AGENTS.md` pitfalls

Leave brief review notes in the final user summary (approve / concerns fixed).

---

## 3. Merge master into the branch

Keep the PR up to date before final CI and merge:

```bash
git fetch origin master
git checkout <feature-branch>
git merge origin/master
# resolve conflicts if any — prefer branch intent, run pnpm verify after
git push -u origin <feature-branch>
```

If conflicts are large or architectural, stop and ask the user.

After merging master, **re-run** `pnpm verify` (and targeted e2e if applicable).

---

## 4. Check CI

```bash
gh pr view <number> --json state,mergeable,statusCheckRollup,url
gh pr checks <number>
```

**Required green jobs** (`.github/workflows/ci.yml`):

- lint-and-format
- Build and Verify Artifacts
- Docker build smoke (home)
- Home E2E (Playwright)
- Game Hub E2E (Playwright)

**If CI is running:** poll until complete (retry `gh pr checks` every 30–60s).

**If CI fails:** read the failed job logs, fix on the branch, push, wait for green. Do not merge red CI unless the user explicitly overrides.

---

## 5. Link GitHub issues (auto-close on merge)

Issues close automatically when the PR body contains an exact keyword + issue number:

```text
Closes #123
Fixes #123
Resolves #123
```

**Rules:**

- Prose like “closes scope for issue #28” does **not** auto-close.
- Do **not** use `gh issue close` as a substitute — use PR keywords.
- If issues are missing from the PR body, update the PR before merge:

```bash
gh pr edit <number> --body "$(cat <<'EOF'
...existing body...

Closes #123
EOF
)"
```

Or use the PR management tool / `ManagePullRequest` `update_pr` action.

---

## 6. Merge PR to master

Only when **local verify passes** and **CI is green**:

```bash
gh pr merge <number> --merge --delete-branch
```

Prefer `--merge` (merge commit) to match repo history unless the user requests squash/rebase.

Then sync local master:

```bash
git checkout master
git pull origin master
```

---

## 7. Post-merge confirmation

```bash
gh pr view <number> --json state,mergedAt,mergeCommit
gh issue view <number> --json state,title   # for each linked issue
```

Summarize for the user:

- PR URL and merge commit
- CI status at merge time
- Linked issues and whether they show **CLOSED**
- Any follow-up deploy notes (Unraid image tag bumps on release workflow, etc.)

---

## Scope shortcuts

| User says                   | Do                             |
| --------------------------- | ------------------------------ |
| “verify only”               | Step 1 (+ targeted tests)      |
| “review only”               | Step 2                         |
| “check CI”                  | Step 4                         |
| “merge master in”           | Step 3                         |
| “merge” / “ship it”         | Full workflow 1–7              |
| “merge but skip game smoke” | Step 1 with `pnpm verify` only |

---

## Failure handling

- **Push failures:** retry up to 4 times with exponential backoff (4s, 8s, 16s, 32s).
- **Merge conflicts:** resolve locally, verify, push, re-check CI.
- **Flaky e2e:** retry CI once; if still failing, report flake evidence — do not merge without user OK.
- **No PR yet:** commit, push branch, create PR (use `.github/PULL_REQUEST_TEMPLATE.md`), then continue from step 4.
