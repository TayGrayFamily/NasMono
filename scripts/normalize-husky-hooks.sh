#!/usr/bin/env bash
set -euo pipefail

HUSKY_DIR="$(pwd)/.husky"
if [ ! -d "$HUSKY_DIR" ]; then
  echo "No .husky directory found at $HUSKY_DIR"
  exit 1
fi

changed=0
for f in "$HUSKY_DIR"/*; do
  # skip the internal directory (named _)
  if [ -d "$f" ]; then
    echo "Skipping directory: $f"
    continue
  fi
  # only regular files
  if [ ! -f "$f" ]; then
    continue
  fi

  # read first line
  read -r firstline < "$f" || firstline=""

  if [[ "$firstline" =~ ^#! ]]; then
    if [[ "$firstline" == "#!/usr/bin/env zsh" ]]; then
      echo "Already zsh: $(basename "$f")"
    else
      echo "Updating shebang to zsh for: $(basename "$f")"
      # replace first line with zsh shebang
      tail -n +2 "$f" > "$f.tmp" && printf '%s\n' "#!/usr/bin/env zsh" > "$f" && cat "$f.tmp" >> "$f" && rm "$f.tmp"
      changed=$((changed+1))
    fi
  else
    echo "Prepending zsh shebang to: $(basename "$f")"
    printf '%s\n' "#!/usr/bin/env zsh" > "$f.tmp" && cat "$f" >> "$f.tmp" && mv "$f.tmp" "$f"
    changed=$((changed+1))
  fi

  chmod +x "$f"
done

if [ $changed -eq 0 ]; then
  echo "No changes needed; all top-level husky hooks already use zsh."
else
  echo "Updated $changed hook(s) to use zsh and ensured they are executable."
fi

