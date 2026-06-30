#!/usr/bin/env bash
# Wire Game Hub planning into GitHub: labels, project board, issue links.
# Run from repo root with a token that can manage the repo and org projects.
#
#   gh auth refresh -h github.com -s project,write:org,repo
#   ./scripts/setup-game-hub-github.sh
#
set -euo pipefail

REPO="TayGrayFamily/NasMono"
OWNER="TayGrayFamily"
PROJECT_TITLE="Game Hub"

create_label() {
  local name="$1" color="$2" description="$3"
  if gh label list --repo "$REPO" --json name --jq ".[] | select(.name==\"$name\") | .name" | grep -q "^${name}$"; then
    echo "Label exists: $name"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$description"
    echo "Created label: $name"
  fi
}

echo "=== Creating labels ==="
create_label "game-hub" "06b6d4" "Game Hub / game-server stack"
create_label "launchpad" "3b82f6" "LaunchPad (packages/home)"
create_label "p0" "d73a4a" "Phase 0 — trustworthy lobby"
create_label "p1" "fb8500" "Phase 1 — lobby UX polish"
create_label "p2" "7057ff" "Phase 2 — platform contracts"
create_label "p3" "22c55e" "Phase 3 — Just One"

label_issue() {
  local num="$1"
  shift
  gh issue edit "$num" --repo "$REPO" --add-label "$*" >/dev/null
  echo "Labeled issue #$num: $*"
}

echo ""
echo "=== Labeling issues ==="
label_issue 25 game-hub p0
label_issue 26 game-hub p0
label_issue 27 game-hub p1
label_issue 28 game-hub p1 launchpad
label_issue 29 game-hub p3
label_issue 30 game-hub p2
label_issue 31 game-hub p2

echo ""
echo "=== Closing resolved product-decisions issue ==="
if gh issue view 32 --repo "$REPO" --json state --jq .state | grep -q OPEN; then
  gh issue close 32 --repo "$REPO" --reason completed \
    --comment "All product questions resolved in ADR-0007 and docs/roadmap/game-hub.md. Future planning uses GitHub Project + issues."
  echo "Closed #32"
else
  echo "Issue #32 already closed"
fi

echo ""
echo "=== Creating GitHub Project (if missing) ==="
PROJECT_NUMBER="$(
  gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" | head -1
)"

if [[ -z "$PROJECT_NUMBER" ]]; then
  PROJECT_NUMBER="$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq .number)"
  echo "Created project #$PROJECT_NUMBER: $PROJECT_TITLE"
else
  echo "Using existing project #$PROJECT_NUMBER: $PROJECT_TITLE"
fi

add_to_project() {
  local issue_num="$1"
  local url="https://github.com/${REPO}/issues/${issue_num}"
  if gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.items[].content.url' 2>/dev/null | grep -q "issues/${issue_num}$"; then
    echo "Already on project: #$issue_num"
  else
    gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" >/dev/null
    echo "Added to project: #$issue_num"
  fi
}

echo ""
echo "=== Adding issues to project ==="
for num in 25 26 27 28 29 30 31; do
  add_to_project "$num"
done

echo ""
echo "=== Done ==="
echo "Project: https://github.com/orgs/${OWNER}/projects/${PROJECT_NUMBER}"
echo "Roadmap: docs/roadmap/game-hub.md"
echo ""
echo "Suggested Project views (create in GitHub UI):"
echo "  - Board: columns Todo / In Progress / Done"
echo "  - Table: filter by label p0, p1, p2, p3"
