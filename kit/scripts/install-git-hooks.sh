#!/usr/bin/env bash
# install-git-hooks.sh — wires kit/scripts/git-hooks/*.sh into the repo's hooks directory.
# Idempotent: safe to re-run. Never overwrites a hook it did not generate.
#
# Usage:
#   bash kit/scripts/install-git-hooks.sh            install / refresh every dispatcher
#   bash kit/scripts/install-git-hooks.sh --check    diff the INSTALLED dispatchers against
#                                                    what this generator would write; exit 1
#                                                    on any drift, missing, or orphan file
#   bash kit/scripts/install-git-hooks.sh --print <phase>
#                                                    print one dispatcher, write nothing
#
# Installs one dispatcher per phase, each invoking kit/scripts/git-hooks/<phase>-*.sh:
#   pre-commit, post-commit, pre-push
#
# ─── WHY pre-push IS HERE NOW (WS-1191) ──────────────────────────────────────────────
#
# Until 2026-09-23 this script installed pre-commit and post-commit only, yet an adopter's
# hooks directory (Claude-Poker-Tracker, WS-1191 there) held a pre-push dispatcher whose
# header said "Installed by kit/scripts/install-git-hooks.sh. Re-run to refresh." That was
# false: re-running refreshed nothing, a fresh clone got NO pre-push gating at all, and the
# orphan flattened every non-zero exit to 1 — destroying the three outcomes
# (0 clean / 1 violation / 2 could-not-run) its pre-push lanes report. kit/scripts/
# git-hooks/prepush-lib.sh (WS-1172) presupposes exactly this dispatcher: it reads git's
# stdin refs and `$1` = remote, and reports a held lock as exit 2. This generator is now
# the source of that file and `--check` proves the installed copy matches it.
#
# A repo with NO pre-push-*.sh lanes gets NO pre-push dispatcher (WS-1673): the dispatcher
# refuses every push when it finds nothing to run, which is right once a repo has lanes and
# wrong for one that never had any. Such a repo's pre-push is left exactly as it was, and a
# CWOS dispatcher left over from when it did have lanes is removed.
#
# ─── A FOREIGN pre-push ENTRY POINT ──────────────────────────────────────────────────
#
# Another installer may own `pre-push` (on this fleet: ai-personal's repo-visibility hook,
# which refuses pushes to a non-private repo and then `exec`s `pre-push.chained`). This
# script never replaces a hook it did not write. If the existing `pre-push` hands over to
# `pre-push.chained`, the CWOS dispatcher is installed THERE, as its single chained child —
# git still has exactly one entry point, and exit codes pass through `exec` untouched. If
# it does not chain, this script refuses and says so rather than clobbering it.

set -euo pipefail

# ─── THE DIRECT LANE IS OPT-IN (pre-push-direct-lane.sh) ─────────────────────────────
#
# The direct-lane lane refuses code pushed straight to the default branch. It changes how sessions
# work, so it is armed per clone, on purpose, never by a plain (re)install: `--with-direct-lane`
# records `git config cwos.directLane true`, and only then does it count as a lane here (and only
# then does the lane script act). A plain install, or the kit's own tests running this installer,
# never arms it.

MODE="install"
PRINT_PHASE=""
WITH_DIRECT_LANE=0
case "${1:-}" in
  --check) MODE="check" ;;
  --print) MODE="print"; PRINT_PHASE="${2:-}" ;;
  --with-direct-lane) WITH_DIRECT_LANE=1 ;;
  "") ;;
  *) echo "usage: install-git-hooks.sh [--check | --print <phase> | --with-direct-lane]" >&2; exit 2 ;;
esac

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [ -z "$REPO_ROOT" ]; then
  echo "Not inside a git repository." >&2
  exit 1
fi
if [ "$WITH_DIRECT_LANE" = 1 ]; then
  git -C "$REPO_ROOT" config cwos.directLane true
  echo "direct lane ARMED in this clone (git config cwos.directLane true; unset it to disarm)."
fi
direct_lane_armed() { [ "$(git -C "$REPO_ROOT" config --get cwos.directLane 2>/dev/null || true)" = "true" ]; }

HOOK_SRC_DIR="$REPO_ROOT/kit/scripts/git-hooks"
# NOT "$REPO_ROOT/.git/hooks": in a linked worktree `.git` is a FILE, and the hooks live in
# the common dir. `--git-path hooks` resolves both, and honours core.hooksPath.
HOOK_DST_DIR=$(cd "$REPO_ROOT" && git rev-parse --git-path hooks)
case "$HOOK_DST_DIR" in /*|[A-Za-z]:*) ;; *) HOOK_DST_DIR="$REPO_ROOT/$HOOK_DST_DIR" ;; esac

if [ ! -d "$HOOK_SRC_DIR" ]; then
  echo "Hook source dir missing: $HOOK_SRC_DIR" >&2
  exit 1
fi

# ─── The generators ──────────────────────────────────────────────────────────────────

# pre-commit / post-commit: unchanged from the kit's original text, byte for byte, so a
# refresh is a no-op on every repo that already has them.
gen_commit_dispatcher() {
  local PHASE="$1"
  cat <<EOF
#!/usr/bin/env bash
# CWOS $PHASE dispatcher — invokes every kit/scripts/git-hooks/$PHASE-*.sh.
# Installed by kit/scripts/install-git-hooks.sh. Re-run to refresh.
set -e
REPO_ROOT=\$(git rev-parse --show-toplevel)
HOOK_DIR="\$REPO_ROOT/kit/scripts/git-hooks"
if [ ! -d "\$HOOK_DIR" ]; then exit 0; fi
FAIL=0
for HOOK in "\$HOOK_DIR"/$PHASE-*.sh; do
  [ -f "\$HOOK" ] || continue
  if ! bash "\$HOOK"; then FAIL=1; fi
done
exit \$FAIL
EOF
}

# pre-push: the three outcomes survive the dispatcher. A child's exit 2 is still 2 at the
# top, so anything reading the push's exit code can tell "a gate could not run" from "a
# gate found a violation". Git itself only sees zero vs non-zero, so both still refuse.
gen_prepush_dispatcher() {
  cat <<'EOF'
#!/usr/bin/env bash
# CWOS pre-push dispatcher — invokes every kit/scripts/git-hooks/pre-push-*.sh.
# Installed by kit/scripts/install-git-hooks.sh. Re-run to refresh;
# `bash kit/scripts/install-git-hooks.sh --check` diffs this file against its generator.
#
# Three outcomes, preserved (WS-1191): exit 0 every hook clean, 1 a hook found a
# violation, 2 a hook could not run and none found a violation. Nothing is flattened.
REPO_ROOT=$(git rev-parse --show-toplevel) || exit 2
HOOK_DIR="$REPO_ROOT/kit/scripts/git-hooks"
if [ ! -d "$HOOK_DIR" ]; then
  echo "BLOCKED — pre-push COULD NOT RUN: $HOOK_DIR is missing, so no pre-push gate ran." >&2
  exit 2
fi
# git passes the refs being pushed on stdin; every hook gets the same copy.
REFS=$(mktemp)
cat > "$REFS"
FAIL=0
UNRUNNABLE=0
RAN=0
for HOOK in "$HOOK_DIR"/pre-push-*.sh; do
  # Only the unmatched-glob literal is skipped here; RAN below makes "nothing ran" loud.
  [ -f "$HOOK" ] || continue
  RAN=$((RAN + 1))
  RC=0
  bash "$HOOK" "$@" < "$REFS" || RC=$?
  case "$RC" in
    0) ;;
    1) FAIL=1 ;;
    *) UNRUNNABLE=1 ;;
  esac
done
rm -f "$REFS"
if [ "$RAN" -eq 0 ]; then
  echo "BLOCKED — pre-push COULD NOT RUN: no pre-push-*.sh in $HOOK_DIR, so nothing was checked." >&2
  exit 2
fi
if [ "$FAIL" -ne 0 ]; then exit 1; fi
if [ "$UNRUNNABLE" -ne 0 ]; then exit 2; fi
exit 0
EOF
}

generate() {
  case "$1" in
    pre-commit|post-commit) gen_commit_dispatcher "$1" ;;
    pre-push) gen_prepush_dispatcher ;;
    *) echo "unknown phase: $1" >&2; return 2 ;;
  esac
}

is_cwos_prepush() { [ -f "$1" ] && grep -q '^# CWOS pre-push dispatcher' "$1"; }

# Does this repo declare any pre-push lane? prepush-lib.sh is sourced by lanes, never run.
has_prepush_lanes() {
  local H
  for H in "$HOOK_SRC_DIR"/pre-push-*.sh; do
    [ -f "$H" ] || continue
    # The direct lane counts only where it was armed (--with-direct-lane, above).
    if [ "$(basename "$H")" = "pre-push-direct-lane.sh" ] && ! direct_lane_armed; then continue; fi
    return 0
  done
  return 1
}

# Where the CWOS pre-push dispatcher belongs, given what is already installed.
# Prints the path, or prints a reason on stderr and returns 1.
prepush_target() {
  local ENTRY="$HOOK_DST_DIR/pre-push"
  if [ ! -e "$ENTRY" ] || is_cwos_prepush "$ENTRY"; then
    echo "$ENTRY"; return 0
  fi
  if grep -q 'pre-push\.chained' "$ENTRY"; then
    local CHAINED="$HOOK_DST_DIR/pre-push.chained"
    if [ -e "$CHAINED" ] && ! is_cwos_prepush "$CHAINED"; then
      echo "refusing: $ENTRY chains to $CHAINED, which exists and was not written by this generator" >&2
      return 1
    fi
    echo "$CHAINED"; return 0
  fi
  echo "refusing: $ENTRY is a pre-push hook this generator did not write, and it does not chain to pre-push.chained — not overwriting it" >&2
  return 1
}

if [ "$MODE" = "print" ]; then
  generate "$PRINT_PHASE"
  exit $?
fi

# ─── --check ─────────────────────────────────────────────────────────────────────────
if [ "$MODE" = "check" ]; then
  DRIFT=0
  for PHASE in pre-commit post-commit; do
    if ! diff -q <(generate "$PHASE") "$HOOK_DST_DIR/$PHASE" >/dev/null 2>&1; then
      echo "DRIFT  $HOOK_DST_DIR/$PHASE does not match its generator"; DRIFT=1
    else
      echo "ok     $HOOK_DST_DIR/$PHASE"
    fi
  done
  if ! has_prepush_lanes; then
    echo "n/a    pre-push (no pre-push-*.sh lanes in $HOOK_SRC_DIR)"
    for OTHER in "$HOOK_DST_DIR/pre-push" "$HOOK_DST_DIR/pre-push.chained"; do
      if is_cwos_prepush "$OTHER"; then
        echo "ORPHAN $OTHER is a CWOS pre-push dispatcher with no lanes to run — it refuses every push"; DRIFT=1
      fi
    done
  elif TARGET=$(prepush_target); then
    if ! diff -q <(generate pre-push) "$TARGET" >/dev/null 2>&1; then
      echo "DRIFT  $TARGET does not match its generator (pre-push)"; DRIFT=1
    else
      echo "ok     $TARGET (pre-push)"
    fi
    # Exactly one CWOS pre-push dispatcher: the location not chosen must not hold one too.
    for OTHER in "$HOOK_DST_DIR/pre-push" "$HOOK_DST_DIR/pre-push.chained"; do
      if [ "$OTHER" != "$TARGET" ] && is_cwos_prepush "$OTHER"; then
        echo "ORPHAN $OTHER is a second CWOS pre-push dispatcher"; DRIFT=1
      fi
    done
  else
    DRIFT=1
  fi
  exit $DRIFT
fi

# ─── install ─────────────────────────────────────────────────────────────────────────
mkdir -p "$HOOK_DST_DIR"

# Resolve the pre-push target FIRST: if it must refuse, nothing at all is written.
TARGET=""
if has_prepush_lanes; then TARGET=$(prepush_target); fi

for PHASE in pre-commit post-commit; do
  generate "$PHASE" > "$HOOK_DST_DIR/$PHASE"
  chmod +x "$HOOK_DST_DIR/$PHASE"
done

if [ -n "$TARGET" ]; then
  generate pre-push > "$TARGET"
  chmod +x "$TARGET"
fi
# If the dispatcher moved (a foreign entry point appeared, or went away), remove the copy
# at the other location so exactly one CWOS pre-push dispatcher remains. With no lanes,
# TARGET is empty and every CWOS copy goes: it could only ever refuse.
for OTHER in "$HOOK_DST_DIR/pre-push" "$HOOK_DST_DIR/pre-push.chained"; do
  if [ "$OTHER" != "$TARGET" ] && is_cwos_prepush "$OTHER"; then rm -f "$OTHER"; fi
done

chmod +x "$HOOK_SRC_DIR"/*.sh 2>/dev/null || true

echo "Installed hooks:"
echo "  $HOOK_DST_DIR/pre-commit   (chains pre-commit-*.sh)"
echo "  $HOOK_DST_DIR/post-commit  (chains post-commit-*.sh)"
if [ -n "$TARGET" ]; then
  echo "  $TARGET  (chains pre-push-*.sh; three outcomes preserved)"
else
  echo "  (no pre-push dispatcher — this repo declares no pre-push-*.sh lanes)"
fi
echo ""
echo "Current CWOS hook set:"
for HOOK in "$HOOK_SRC_DIR"/*.sh; do
  [ -f "$HOOK" ] || continue
  base=$(basename "$HOOK")
  case "$base" in
    pre-commit-*|post-commit-*|pre-push-*) echo "  - $base" ;;
  esac
done
