#!/usr/bin/env node
/**
 * cross-branch-closures — find item_closed events that exist in git objects on
 * refs which are NOT merged into HEAD.
 *
 * WHY THIS EXISTS. The ADR-045 drift healer reads the working tree's event log
 * and treats it as the whole story. That holds only while the log is a single
 * machine-local file set — which is what ADR-057/058 intends, and what HomeBase
 * does (`.claude/workstream/events/` is gitignored here).
 *
 * Some repos track their event log instead. ServeYourNote carries
 * `!.claude/workstream/events/*.jsonl` in .gitignore, un-ignoring 24 chunks,
 * and has six local branches. There, the event log is not one log: it FORKS
 * WITH THE BRANCH. Closure bookkeeping committed on a side branch that never
 * merged (deadb95, 1fa4179) is invisible from main, so main's queue YAMLs sat
 * at `backlog` for work that had shipped, the healer reported
 * `drift_detected: false`, and /next composed SPR-034 out of eight items where
 * five were already done.
 *
 * Claude-Poker-Tracker removed that ignore rule deliberately, as a recorded
 * decision (see lib/gitignore-guard.js). So both regimes exist in the fleet and
 * the kit has to be correct under both. Which of the two a repo runs is that
 * repo's call (DEC-054); this module only makes the consequence visible.
 *
 * WHAT THIS IS NOT. This does not reopen ADR-045. There is no commit-message
 * parsing here, no `git log`, no `--grep`, no regex against narrative. It reads
 * the canonical event log — the same JSONL chunks, through the same parser
 * (core/events.js parseChunkText) and the same name guard (CHUNK_NAME_RE) —
 * from copies that happen to live in git objects rather than in the working
 * tree. The anti-narrative tripwire in __tests__/state-drift.test.js is
 * extended to cover this file precisely so that stays true.
 *
 * EVERYTHING FAILS OPEN. If git cannot be consulted for any reason, callers get
 * an empty index and proceed exactly as before. A drift detector that crashes
 * the gate would be worse than one that occasionally sees nothing, and the
 * condition it detects is rare by construction.
 *
 * COST. `gate` runs this on every /next, so the common case must be free. Two
 * short-circuits do that work: a repo whose events dir is not tracked exits at
 * step 1 after a single `git ls-files`, and a repo with nothing unmerged exits
 * at step 2. HomeBase always takes the first.
 */

'use strict';

const path = require('path');
const { runGitInRepo, validateGitRef } = require('./shell-safe');
const { CHUNK_NAME_RE, parseChunkText } = require('../core/events');

// Refs scanned per call. This was 50 while cost scaled with ref count -- one
// `ls-tree` plus one `cat-file` per chunk per ref. Measured on ServeYourNote
// (75 unmerged refs, 27 tracked chunks) that shape spent 52 SECONDS inside
// `gate` and still left 25 refs unscanned. It no longer scales that way: refs
// sharing an events tree collapse to one `ls-tree`, and every distinct blob is
// read in a single `cat-file --batch`. The cap is now a runaway guard for a
// repo far larger than anything measured -- SCAN_BUDGET_MS is the real bound --
// and `truncated` still reports whatever it clips, so a bounded scan never
// reads as a complete one.
const MAX_REFS = 500;

// Per-git-call ceiling. shell-safe's runGit defaults to 5s; blob reads over a
// large log deserve a little more, and a hung git must never wedge /next.
const GIT_TIMEOUT_MS = 10000;

// The batch calls do the real work and move real bytes, so they get a longer
// ceiling and a buffer sized for a large tracked log.
const BATCH_TIMEOUT_MS = 30000;
const BATCH_MAX_BUFFER = 512 * 1024 * 1024;

// Wall-clock bound on the whole scan. `gate` runs this on every /next, so a
// hung git or a repo pathologically bigger than anything measured must cost the
// founder seconds, not minutes. Exceeding it stops the scan and sets
// `timed_out` -- an incomplete scan must never be reported as a clean one,
// which is the conditioning discipline WS-564 put on claim_conflicts.
const SCAN_BUDGET_MS = 8000;

/**
 * Is `relPath` tracked in this repo? Returns { tracked, count }.
 * Fails open as NOT tracked — the caller then skips the scan entirely, which
 * is the pre-WS-694 behaviour.
 */
function trackedFileCount(repoRoot, relPath) {
  const r = runGitInRepo(repoRoot, ['ls-files', '--', relPath], { timeout: GIT_TIMEOUT_MS });
  if (!r || !r.ok) return { tracked: false, count: 0 };
  const files = String(r.stdout || '').split('\n').filter(Boolean);
  return { tracked: files.length > 0, count: files.length };
}

/**
 * Local branches + remote-tracking refs that are NOT merged into HEAD.
 * These are the only places a closure can hide: anything merged into HEAD is
 * already in the working tree's log, where the existing detector sees it.
 */
function listUnmergedRefs(repoRoot) {
  const r = runGitInRepo(
    repoRoot,
    ['for-each-ref', '--format=%(refname)', '--no-merged=HEAD', 'refs/heads', 'refs/remotes'],
    { timeout: GIT_TIMEOUT_MS }
  );
  if (!r || !r.ok) return [];
  return String(r.stdout || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // HEAD pointers (refs/remotes/origin/HEAD) are aliases, not branches.
    .filter((ref) => !ref.endsWith('/HEAD'))
    // validateGitRef THROWS on a bad ref and returns undefined on a good one --
    // it is an assertion, not a predicate. Using it directly in .filter() drops
    // every ref, which is how this silently reported "no unmerged refs" on a
    // repo that had one.
    .filter((ref) => { try { validateGitRef(ref); return true; } catch { return false; } });
}

/**
 * Resolve `<ref>:<eventsRelPath>` to a tree object for every ref, in ONE
 * `cat-file --batch-check` process.
 *
 * Most refs in a busy repo carry an IDENTICAL events tree: a branch that never
 * touched the log shares its parent's. Collapsing on the tree sha is what
 * removes the per-ref `ls-tree` spawn -- ServeYourNote's 75 unmerged refs
 * resolve to a handful of distinct trees.
 *
 * Returns Map<treeSha, { ref, refs[] }> holding the FIRST ref per tree, built
 * in ref order -- which is what preserves this module's "first ref wins"
 * attribution.
 */
function resolveEventTrees(repoRoot, refs, eventsRelPath) {
  const trees = new Map();
  if (!refs.length) return trees;
  const r = runGitInRepo(repoRoot, ['cat-file', '--batch-check'], {
    input: refs.map((ref) => `${ref}:${eventsRelPath}`).join('\n') + '\n',
    timeout: BATCH_TIMEOUT_MS,
  });
  if (!r || !r.ok) return trees;
  // One output line per input line, in order.
  const lines = String(r.stdout || '').split('\n');
  for (let i = 0; i < refs.length && i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    // "<sha> tree <size>" on success. A ref carrying no events dir prints
    // "<name> missing", which is ordinary rather than an error.
    if (parts.length < 3 || parts[1] !== 'tree') continue;
    const sha = parts[0];
    if (trees.has(sha)) trees.get(sha).refs.push(refs[i]);
    else trees.set(sha, { ref: refs[i], refs: [refs[i]] });
  }
  return trees;
}

/**
 * Chunk blobs inside one events tree. Paths come back relative to that tree,
 * so the basename test is the same guard core/events.js applies on disk.
 */
function listChunkBlobsInTree(repoRoot, treeSha) {
  const r = runGitInRepo(repoRoot, ['ls-tree', '-r', treeSha], { timeout: GIT_TIMEOUT_MS });
  if (!r || !r.ok) return [];
  const out = [];
  for (const line of String(r.stdout || '').split('\n')) {
    // "<mode> <type> <sha>\t<path>"
    const tab = line.indexOf('\t');
    if (tab < 0) continue;
    const meta = line.slice(0, tab).split(/\s+/);
    if (meta.length < 3 || meta[1] !== 'blob') continue;
    const blobPath = line.slice(tab + 1);
    // Strictly YYYY-MM-DD.jsonl -- what keeps current.jsonl, a byte-identical
    // mirror of today's chunk, from being counted twice (INV-077).
    if (!CHUNK_NAME_RE.test(path.posix.basename(blobPath))) continue;
    out.push({ sha: meta[2], path: blobPath });
  }
  return out;
}

/**
 * Read many blobs in ONE `cat-file --batch`. Returns Map<sha, text>.
 *
 * The batch protocol is `<sha> <type> <size>\n`, then exactly <size> BYTES,
 * then a newline. It has to be walked as bytes: a chunk holding any multi-byte
 * character would desynchronise a character-indexed parser and silently
 * truncate every blob after it.
 */
function readBlobsBatched(repoRoot, shas) {
  const out = new Map();
  if (!shas.length) return out;
  const r = runGitInRepo(repoRoot, ['cat-file', '--batch'], {
    input: shas.join('\n') + '\n',
    encoding: 'buffer',
    timeout: BATCH_TIMEOUT_MS,
    maxBuffer: BATCH_MAX_BUFFER,
  });
  if (!r || !r.ok || !Buffer.isBuffer(r.stdout)) return out;
  const buf = r.stdout;
  let off = 0;
  while (off < buf.length) {
    const nl = buf.indexOf(0x0a, off);
    if (nl < 0) break;
    const parts = buf.slice(off, nl).toString('utf8').trim().split(/\s+/);
    off = nl + 1;
    if (parts.length < 3 || parts[1] !== 'blob') continue; // "<sha> missing"
    const size = Number(parts[2]);
    if (!Number.isFinite(size) || size < 0 || off + size > buf.length) break;
    out.set(parts[0], buf.slice(off, off + size).toString('utf8'));
    off += size + 1; // the trailing newline git adds after each payload
  }
  return out;
}

/**
 * Build the index of closures reachable only from unmerged refs.
 *
 * @param {string} repoRoot   repo root for git (findRepoRoot(), NOT derived
 *                            from wsDir — see WS-576)
 * @param {string} wsDir      workstream dir (findWorkstreamDir())
 * @param {object} [opts]     { maxRefs }
 * @returns {{closures: Map<string, object>, reopened: Map<string, string>,
 *            scanned_refs: string[], truncated: number,
 *            events_tracked: boolean, tracked_chunk_count: number,
 *            reason: string|null}}
 *
 * `reason` is non-null exactly when the scan short-circuited, and names why.
 * An empty `closures` with `reason: null` means the scan really ran and found
 * nothing — the caller must be able to tell those two apart, because a silent
 * "no drift" from a scan that never happened is the failure this whole module
 * exists to correct.
 */
function crossBranchClosureIndex(repoRoot, wsDir, opts = {}) {
  const maxRefs = Number.isInteger(opts.maxRefs) && opts.maxRefs > 0 ? opts.maxRefs : MAX_REFS;
  const empty = (reason, extra = {}) => ({
    closures: new Map(),
    reopened: new Map(),
    scanned_refs: [],
    truncated: 0,
    timed_out: false,
    events_tracked: false,
    tracked_chunk_count: 0,
    reason,
    ...extra,
  });

  if (!repoRoot || !wsDir) return empty('no-repo-root');

  // git wants a repo-relative, forward-slash path. This is the ONE place the
  // two roots are related, and it is a path computation for git's argv — not
  // state resolution. wsDir still comes from findWorkstreamDir().
  let eventsRelPath;
  try {
    eventsRelPath = path.relative(repoRoot, path.join(wsDir, 'events')).split(path.sep).join('/');
  } catch { return empty('path-unresolvable'); }
  if (!eventsRelPath || eventsRelPath.startsWith('..')) {
    // The workstream dir lives outside this repo (a worktree resolving back to
    // the primary tree). Nothing here is answerable with this repo's objects.
    return empty('events-dir-outside-repo');
  }

  // ── Short-circuit 1: is the log even in git? ──────────────────────────────
  // The intended ADR-058 configuration exits here, one git call in.
  const tracked = trackedFileCount(repoRoot, eventsRelPath);
  if (!tracked.tracked) return empty('events-not-tracked');

  // ── Short-circuit 2: is there anywhere for it to fork to? ─────────────────
  const allRefs = listUnmergedRefs(repoRoot);
  if (allRefs.length === 0) {
    return empty('no-unmerged-refs', {
      events_tracked: true,
      tracked_chunk_count: tracked.count,
    });
  }

  const refs = allRefs.slice(0, maxRefs);
  const truncated = allRefs.length - refs.length;
  const startedAt = Date.now();
  let timedOut = false;

  // One batch-check resolves every ref's events tree. Refs that never touched
  // the log share their parent's tree and collapse here, which is what removes
  // the per-ref ls-tree spawn.
  const trees = resolveEventTrees(repoRoot, refs, eventsRelPath);

  // blob sha -> the FIRST (ref, path) that carried it. Branches overwhelmingly
  // share chunks -- 1,304 (ref, chunk) pairs across ServeYourNote's 75 refs are
  // only 51 distinct blobs -- so reading each once is what keeps this off the
  // gate's critical path. Iteration follows ref order, so "first ref wins" is
  // unchanged from the per-ref loop this replaced.
  const byBlob = new Map();
  for (const [treeSha, owner] of trees) {
    if (Date.now() - startedAt > SCAN_BUDGET_MS) { timedOut = true; break; }
    for (const b of listChunkBlobsInTree(repoRoot, treeSha)) {
      if (byBlob.has(b.sha)) continue;
      byBlob.set(b.sha, { ref: owner.ref, chunk: `${eventsRelPath}/${b.path}` });
    }
  }

  const texts = readBlobsBatched(repoRoot, [...byBlob.keys()]);

  const closures = new Map();
  const reopened = new Map();
  for (const [sha, where] of byBlob) {
    const text = texts.get(sha);
    if (text == null) continue;
    const { events } = parseChunkText(text);
    for (const ev of events) {
      if (!ev || !ev.payload || typeof ev.payload !== 'object') continue;
      const p = ev.payload;
      if (p.type === 'item_closed' && typeof p.ws_id === 'string') {
        // First ref wins. Which branch reported it first is not interesting;
        // that ANY unmerged branch reports it is the whole signal.
        if (closures.has(p.ws_id)) continue;
        closures.set(p.ws_id, {
          ws_id: p.ws_id,
          event_id: ev.id || null,
          ref: where.ref,
          chunk: where.chunk,
          completed_at: p.completed_at || ev.timestamp || null,
          completion_commit: p.completion_commit || null,
          sprint_id: p.sprint_id || null,
          timestamp: ev.timestamp || null,
        });
      } else if (p.type === 'item_reopened' && typeof p.ws_id === 'string') {
        // A reopen on the same unmerged ref cancels its own closure.
        closures.delete(p.ws_id);
        reopened.set(p.ws_id, ev.timestamp || null);
      }
    }
  }

  return {
    closures,
    reopened,
    scanned_refs: refs,
    truncated,
    // A scan cut short by SCAN_BUDGET_MS saw only part of the refs it listed.
    // Callers must be able to tell that from a scan that finished and found
    // nothing -- reporting the two identically is the exact failure WS-694
    // exists to correct, one level up.
    timed_out: timedOut,
    events_tracked: true,
    tracked_chunk_count: tracked.count,
    reason: null,
  };
}

module.exports = {
  crossBranchClosureIndex,
  listUnmergedRefs,
  trackedFileCount,
  resolveEventTrees,
  listChunkBlobsInTree,
  readBlobsBatched,
  MAX_REFS,
  SCAN_BUDGET_MS,
};
