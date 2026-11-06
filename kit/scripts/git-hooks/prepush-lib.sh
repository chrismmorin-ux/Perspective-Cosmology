#!/usr/bin/env bash
# prepush-lib.sh — helpers a heavy pre-push lane SOURCES (WS-1172). Not a hook itself: the
# dispatcher runs `pre-push-*.sh`, and this name deliberately does not match that glob.
#
#   . "$REPO_ROOT/kit/scripts/git-hooks/prepush-lib.sh"
#   prepush_fast_path "governance suite" "${1:-}" && exit 0    # $1 = git's remote name
#   ...
#   export VITEST_TREE_GUARD=warn
#   prepush_heavy "$OUT" node "$VITEST" run scripts/__tests__; RC=$?
#   [ "$PREPUSH_LOCK" = held ] && could_not_run "$PREPUSH_LOCK_NOTE"
#
# ─── prepush_fast_path <lane label> <remote name> ────────────────────────────────────────
#
# Reads git's ref lines from stdin (the dispatcher hands every lane its own copy), asks
# kit/scripts/lib/prepush-scope.mjs whether every changed path is a bookkeeping record, and
# returns 0 — after printing ONE line naming the lane and the reason — only when it is.
# Any doubt (no node, no classifier, a malformed ref, a git error) returns 1: run the lane.
# The refs it read are left in PREPUSH_REFS for a lane that needs them afterwards.
#
# ONLY ADOPT THIS IN A LANE WHOSE CHECKS CI ALSO RUNS ON A RECORDS-ONLY CHANGE. The fast path
# is sound because CI's records lane re-runs those checks in minutes, not because the lane
# cannot see records — it can (see the header of prepush-scope.mjs).
#
# ─── prepush_heavy <outfile> <command...> ────────────────────────────────────────────────
#
# Runs the command under kit/scripts/ops/with-heavy-lock.mjs, so a pre-push suite contends
# for the same per-repository lock as `npm test` and `npm run build` in every worktree. It
# waits up to PREPUSH_HEAVY_LOCK_WAIT_SECONDS (default 600) for a held lock, saying so first.
# Output goes to <outfile>; the return value is the command's exit code. It sets:
#
#   PREPUSH_LOCK=taken    the command ran under the lock
#   PREPUSH_LOCK=held     the lock stayed held for the whole wait; the command DID NOT RUN.
#                         The caller reports COULD NOT RUN (exit 2) with PREPUSH_LOCK_NOTE —
#                         never a red suite, never a pass.
#   PREPUSH_LOCK=absent   this checkout has no with-heavy-lock.mjs; the command ran unlocked
#                         and a line saying so was printed.
#
# Lock-held is told apart from a command that happens to exit 73 by the wrapper's own
# message in the output, not by the exit code alone.

prepush_fast_path() {
  local lane="${1:-pre-push lane}" remote="${2:-}" root lib out rc
  PREPUSH_REFS=$(cat)
  root=$(git rev-parse --show-toplevel 2>/dev/null) || return 1
  lib="$root/kit/scripts/lib/prepush-scope.mjs"
  [ -f "$lib" ] || return 1
  command -v node >/dev/null 2>&1 || return 1
  out=$(printf '%s\n' "$PREPUSH_REFS" | node "$lib" --remote "$remote" 2>/dev/null)
  rc=$?
  if [ "$rc" -eq 0 ] && [ "${out%%$'\t'*}" = "fast" ]; then
    echo "pre-push: $lane SKIPPED — ${out#*$'\t'}. CI's records lane still runs it on this change."
    return 0
  fi
  return 1
}

prepush_heavy() {
  local out="$1" root wrapper common lockdir wait rc
  shift
  PREPUSH_LOCK_NOTE=""
  root=$(git rev-parse --show-toplevel 2>/dev/null) || root="."
  wrapper="$root/kit/scripts/ops/with-heavy-lock.mjs"
  if [ ! -f "$wrapper" ]; then
    PREPUSH_LOCK=absent
    echo "pre-push: no heavy lock in this checkout ($wrapper is missing) — running unserialized."
    "$@" </dev/null >"$out" 2>&1
    return $?
  fi
  wait="${PREPUSH_HEAVY_LOCK_WAIT_SECONDS:-600}"
  common=$(git rev-parse --git-common-dir 2>/dev/null) || common=".git"
  case "$common" in /*|[A-Za-z]:*) ;; *) common="$root/$common" ;; esac
  lockdir="$common/heavy-run.lock"
  if [ -d "$lockdir" ]; then
    echo "pre-push: the heavy lock is held ($lockdir) — waiting up to ${wait}s for it."
  fi
  node "$wrapper" --wait "$wait" -- "$@" </dev/null >"$out" 2>&1
  rc=$?
  if [ "$rc" -eq 73 ] && grep -q "^with-heavy-lock: another heavy job owns" "$out" 2>/dev/null; then
    PREPUSH_LOCK=held
    PREPUSH_LOCK_NOTE="the heavy lock stayed held for ${wait}s, so the suite never started. $(grep -E '^  (held by|running:)' "$out" | head -2 | sed 's/^ *//' | tr '\n' ' ')Lock: $lockdir. Nothing was established; push again when it is free."
  else
    PREPUSH_LOCK=taken
  fi
  return "$rc"
}
