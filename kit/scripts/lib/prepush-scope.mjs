#!/usr/bin/env node
/**
 * prepush-scope.mjs — is this push bookkeeping only? (WS-1172)
 *
 * ─── THE INCIDENT ────────────────────────────────────────────────────────────────────────
 *
 * Measured 2026-10-15 in claude-poker-tracker: a push whose ONLY change was one
 * `.claude/workstream/sessions/*.yaml` record ran the static-scan lane (157 s) and the
 * governance suite (`vitest run scripts/__tests__`, 387 s) on the G16 at 0.75 GB free,
 * outside the heavy lock, and then lost a remote ref race to another session — nine minutes
 * of a starved laptop spent re-proving a tree the record could not have changed.
 *
 * ─── WHY SKIPPING IS SOUND, AND WHAT IT IS NOT ───────────────────────────────────────────
 *
 * It is NOT that the heavy lanes cannot see these paths. They can. Measured the same day in
 * poker's governance suite: `sessionRecoveryOrphanClaims.test.js` reads the LIVE sessions/
 * registry and `eventSourceTrack.test.js` reads the live events/ directory. A session record
 * can turn that suite red.
 *
 * It is that the pre-push copy of those lanes buys nothing for a records-only push. Pre-push
 * runs them to turn a 74-minute CI discovery into a 4-minute one (WS-1205). A records-only
 * change does not take the 74-minute lane in CI: poker's `scripts/ci/classify-diff-lane.mjs`
 * sends any diff wholly under `.claude/workstream/` or `system/` to the RECORDS lane, which
 * runs every gate and all of `scripts/__tests__/` in about 4 minutes on node1. So the same
 * suite still runs against this exact change, at the same latency, on a machine with memory.
 *
 * That gives the rule that keeps this sound:
 *
 *   1. Every BOOKKEEPING_PATHS entry must lie inside CI_RECORDS_LANE_ROOTS. A pattern
 *      outside them would skip a check that nothing else runs cheaply. The test pins it.
 *   2. A lane may call the fast path only if its repo's CI runs that lane's checks on a
 *      records-only change. A repo without that backstop must not adopt it.
 *
 * ─── THE LIST, AND WHERE EACH ENTRY CAME FROM ────────────────────────────────────────────
 *
 * Machine-written record classes only. Authored records are deliberately OUT even though
 * they sit under the same root: queue items and decision requests are what tripped the
 * governance suite on poker PR #22 and in WS-1205, so a push carrying one runs the lanes.
 *
 * ─── FAIL-SAFE BY CONSTRUCTION ───────────────────────────────────────────────────────────
 *
 * `fast` requires every ref to be read, every changed path to be determined, and every path
 * to match. A malformed ref line, a git error, a missing object, an empty change set, a new
 * branch with no commits of its own, a quoted (non-ASCII) path, a rename out of the list —
 * all of these are `full`. The only way to be wrong is towards running more.
 *
 * A DELETED ref changes no content, so it contributes no paths. A push that only deletes
 * refs is `fast`; a deletion pushed alongside any other ref is judged by that other ref.
 *
 * CLI (git's pre-push ref lines on stdin):
 *   node kit/scripts/lib/prepush-scope.mjs [--remote <name>]
 *   -> prints ONE line, `fast<TAB>reason` or `full<TAB>reason`.
 *      Exit 0 ONLY for `fast`. Every other outcome, including a crash, is non-zero.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The roots poker's CI records lane covers (scripts/ci/classify-diff-lane.mjs RECORDS_ALLOWLIST). */
export const CI_RECORDS_LANE_ROOTS = Object.freeze(['.claude/workstream/', 'system/']);

/** Machine-written records. Keep this list SHORT, and every entry inside CI_RECORDS_LANE_ROOTS. */
export const BOOKKEEPING_PATHS = Object.freeze([
  { re: /^\.claude\/workstream\/sessions\/[^/].*/, why: 'session records: registration, heartbeats, end and recovery stamps' },
  { re: /^\.claude\/workstream\/events\/[^/].*/, why: 'the append-only event log (clean-tree-check.cjs CHURN_PATHS)' },
  { re: /^\.claude\/workstream\/evidence\/[^/].*/, why: 'evidence ledgers appended by runs and arm assignments' },
  { re: /^\.claude\/workstream\/mistakes\.jsonl$/, why: 'the mistake log written by cwos-mistake.js (a file, not a directory)' },
  { re: /^\.claude\/workstream\/chain-anchors\.yaml$/, why: 'stamped by the event chain (clean-tree-check.cjs CHURN_PATHS)' },
  { re: /^\.claude\/workstream\/meta\/invariant-firing-log\.yaml$/, why: 'stamped by every verify (clean-tree-check.cjs CHURN_PATHS)' },
]);

const ZERO = /^0+$/;
const SHA = /^[0-9a-f]{7,64}$/i;

/** True when `path` is a machine-written record. A quoted (escaped) path never is. */
export const isBookkeeping = (path) => {
  const p = String(path ?? '');
  if (!p || p.startsWith('"') || p.includes('..')) return false;
  return BOOKKEEPING_PATHS.some(({ re }) => re.test(p));
};

/**
 * git's pre-push stdin: `<local ref> SP <local sha> SP <remote ref> SP <remote sha>` per line.
 * Returns null on ANY malformed line — a line we cannot read is a push we cannot judge.
 */
export const parseRefLines = (text) => {
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const refs = [];
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length !== 4) return null;
    const [localRef, localSha, remoteRef, remoteSha] = parts;
    if (!SHA.test(localSha) || !SHA.test(remoteSha)) return null;
    refs.push({ localRef, localSha, remoteRef, remoteSha, deletion: ZERO.test(localSha), created: ZERO.test(remoteSha) });
  }
  return refs;
};

/**
 * Pure decision. `perRef` is [{ ref, paths: string[]|null }]; null paths = could not be determined.
 * @returns {{ scope: 'fast'|'full', reason: string }}
 */
export const classifyPush = (perRef) => {
  if (!Array.isArray(perRef)) return { scope: 'full', reason: 'the pushed refs could not be read' };
  if (perRef.length === 0) return { scope: 'full', reason: 'no refs on stdin — nothing to classify, so nothing is skipped' };
  const undetermined = perRef.filter((r) => !Array.isArray(r.paths));
  if (undetermined.length) {
    return { scope: 'full', reason: `the changes in ${undetermined.map((r) => r.ref.remoteRef).join(', ')} could not be determined` };
  }
  const deletions = perRef.filter((r) => r.ref.deletion);
  if (deletions.length === perRef.length) {
    return { scope: 'fast', reason: `deletes ${deletions.length} ref(s) only — no content changes` };
  }
  const paths = [...new Set(perRef.flatMap((r) => r.paths.map((p) => String(p).trim()).filter(Boolean)))];
  const empty = perRef.filter((r) => !r.ref.deletion && r.paths.length === 0);
  if (empty.length) {
    return { scope: 'full', reason: `no changed paths found for ${empty.map((r) => r.ref.remoteRef).join(', ')} — nothing to classify, so nothing is skipped` };
  }
  const outside = paths.filter((p) => !isBookkeeping(p));
  if (outside.length) {
    const shown = outside.slice(0, 3).join(', ');
    return { scope: 'full', reason: `${outside.length} of ${paths.length} changed path(s) are not bookkeeping (${shown}${outside.length > 3 ? ', …' : ''})` };
  }
  return { scope: 'fast', reason: `all ${paths.length} changed path(s) are bookkeeping records (sessions/events/evidence/mistakes)` };
};

const gitLines = (args, cwd) => execFileSync('git', ['-c', 'core.quotePath=true', ...args], {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024,
}).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** Is `name` a configured remote? A URL push has no tracking refs to subtract. */
const isRemoteName = (name, cwd) => {
  if (!name || /[:/\\]/.test(name)) return false;
  try { return gitLines(['remote'], cwd).includes(name); } catch { return false; }
};

/**
 * The paths one ref changes on the remote. [] for a deletion; null when undeterminable.
 *
 * Existing ref: the net diff between what the remote has and what it will have, both sides
 * of every rename listed (`--no-renames`), so a move OUT of the list counts.
 *
 * New ref (zero remote sha): every commit not already on the named remote's tracking refs,
 * each diffed against every parent (`-m`), so a merge that brings source in is full. With no
 * remote name (a URL push) nothing is subtracted, the whole history counts, and the push is
 * full — conservative, and said so. A new ref with no commits of its own is null.
 */
export const changedPathsForRef = (ref, { remote, cwd = process.cwd() } = {}) => {
  if (ref.deletion) return [];
  try {
    if (!ref.created) {
      // The remote's object must exist here; if it does not, `git diff` throws -> null.
      return gitLines(['diff', '--name-only', '--no-renames', ref.remoteSha, ref.localSha], cwd);
    }
    const not = isRemoteName(remote, cwd) ? ['--not', `--remotes=${remote}`] : [];
    const commits = gitLines(['rev-list', ref.localSha, ...not], cwd);
    if (commits.length === 0) return null;
    return gitLines(['log', '--format=', '--name-only', '--no-renames', '-m', ref.localSha, ...not], cwd);
  } catch {
    return null;
  }
};

/** Read refs, determine each ref's paths, decide. Never throws. */
export const scopeOfPush = (stdinText, { remote, cwd = process.cwd() } = {}) => {
  const refs = parseRefLines(stdinText);
  if (refs === null) return { scope: 'full', reason: 'a pre-push ref line was malformed' };
  return classifyPush(refs.map((ref) => ({ ref, paths: changedPathsForRef(ref, { remote, cwd }) })));
};

const main = () => {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--remote');
  const remote = i >= 0 ? argv[i + 1] : undefined;
  let stdin = '';
  try { stdin = readFileSync(0, 'utf8'); } catch { stdin = ''; }
  const v = scopeOfPush(stdin, { remote });
  process.stdout.write(`${v.scope}\t${v.reason}\n`);
  process.exitCode = v.scope === 'fast' ? 0 : 1;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try { main(); } catch (e) {
    process.stdout.write(`full\tthe classifier failed (${e && e.message}) — running every lane\n`);
    process.exitCode = 1;
  }
}
