#!/usr/bin/env bash
# =====================================================================
# TINY ARCADE — sync.sh
#
# Pushes this folder to github.com/EffigyMedia/tiny_arcade, preserving
# the repo's history. Run it from inside the unzipped folder:
#
#     chmod +x sync.sh      (first time only)
#     ./sync.sh "what changed"
#
# It clones the repo to a temp directory, copies these files over the
# top, and commits only what actually differs. Nothing is force-pushed
# and nothing is deleted that you added on GitHub yourself.
#
# © 2026 Effigy Media. All rights reserved.
# =====================================================================
set -euo pipefail

REPO="${TINY_ARCADE_REPO:-https://github.com/EffigyMedia/tiny_arcade.git}"
MSG="${1:-Update from Tiny Arcade build}"
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "→ cloning $REPO"
git clone --quiet "$REPO" "$WORK/repo"

echo "→ copying files"
cd "$HERE"
for f in index.html arcade.js audio.js games.js sw.js manifest.webmanifest \
         icon.png icon-512.png effigy.png README.md DESIGN.md sync.sh; do
  [ -f "$f" ] && cp "$f" "$WORK/repo/$f"
done
mkdir -p "$WORK/repo/games"
cp games/*.html "$WORK/repo/games/" 2>/dev/null || true

cd "$WORK/repo"
if git diff --quiet && git diff --cached --quiet; then
  echo "→ nothing changed, repo is already up to date"
  exit 0
fi

echo "→ changed:"
git --no-pager diff --stat | sed 's/^/    /'

git add -A
git commit --quiet -m "$MSG"
echo "→ pushing"
git push --quiet
echo "✓ done — https://github.com/EffigyMedia/tiny_arcade"
