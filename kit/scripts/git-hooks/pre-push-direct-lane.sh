#!/usr/bin/env bash
# pre-push-direct-lane.sh — the direct lane's gate (docs/designs/pr-flow-end-to-end.md §3, build
# step 2). A push to the default branch may carry only records: paths on `direct.paths` in the
# DEFAULT BRANCH's copy of .claude/landing.yaml, never code, never an always-tap floor path, and only
# when that copy says `direct_enabled: true`. Everything else goes through a pull request.
#
# Run by the CWOS pre-push dispatcher (kit/scripts/install-git-hooks.sh) with git's refs on stdin and
# the remote name as $1. The logic is `node kit/scripts/cwos-pr.js prepush` (tested there).
#
# Exit: 0 clean (or not a push to the default branch, or no landing.yaml on it yet: the lane is not
# configured there and nothing is enforced) · 1 refused · 2 could not run (no node, no script).
#
# A push to any other branch is never touched. Bypassing this (`git push --no-verify`) is a founder
# decision, never a session's (CLAUDE.md Git Policy: skipping hooks needs confirmation).

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "BLOCKED — direct-lane check COULD NOT RUN: not in a git repository." >&2; exit 2; }
# Armed per clone only (`bash kit/scripts/install-git-hooks.sh --with-direct-lane`). Unarmed, another
# lane's dispatcher can still run this file; it then checks nothing and says so.
if [ "$(git -C "$REPO_ROOT" config --get cwos.directLane 2>/dev/null || true)" != "true" ]; then
  echo "direct lane: not armed in this clone (install-git-hooks.sh --with-direct-lane arms it); not checked."
  exit 0
fi
SCRIPT="$REPO_ROOT/kit/scripts/cwos-pr.js"
if ! command -v node >/dev/null 2>&1; then
  echo "BLOCKED — direct-lane check COULD NOT RUN: node is not on PATH." >&2
  exit 2
fi
if [ ! -f "$SCRIPT" ]; then
  echo "BLOCKED — direct-lane check COULD NOT RUN: $SCRIPT is missing." >&2
  exit 2
fi
# $1 is the remote name, or the URL when the push named one; $2 is the URL.
node "$SCRIPT" prepush "${1:-origin}" "${2:-}"
