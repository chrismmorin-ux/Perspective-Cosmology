/**
 * git-hygiene — the detail layer under cwos-fleet-scan's in-flight state.
 *
 * WHY THIS IS A LIB, NOT A NEW COLLECTOR. The fleet already had a mirror of repo
 * git state: cwos-fleet-scan.js getInFlight() (WS-543), consumed by ai-personal's
 * repo-hygiene.js and the desk. It recorded COUNTS — dirty files, commits ahead,
 * stashes — which answer "is something there?" and never "what is it, and is it
 * safe to clean?". Three more tools had grown beside it to fill that gap
 * (cwos-branch-sweep.js, repo-hygiene.js unmergedBranches, repo-pull.ps1's rebase
 * check), each measuring a different slice with a different rule. This module is
 * the one place those facts are computed; fleet-scan (every repo on this node) and
 * cwos-hygiene.js (the repo you are standing in) both call it.
 *
 * WHAT IT ADDS OVER THE COUNTS
 *   stashes      each one: age, branch, message, files, and whether its content
 *                already exists on the default branch (LANDED = safe to drop)
 *   branches     every local branch: upstream, ahead AND behind, gone upstream
 *   remotes      every remote branch classified by MERGE RESULT, not by commit
 *                count or file existence — see classifyAgainstDefault()
 *   worktrees    prunable / missing / locked / dirty
 *   operation    an in-progress merge, rebase, cherry-pick, revert or bisect
 *   findings     each fact above as a finding with a stable fingerprint, a
 *                proposed action and an authority class
 *   ledger       findings someone already dispositioned stay ACCOUNTED until
 *                their fingerprint moves — see readLedger()
 *
 * Unknown stays null. A failed read never renders as clean (WS-543's rule).
 * Zero dependencies beyond shell-safe.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { runGitInRepo } = require('./shell-safe');
const { writeFileAtomic } = require('./cwos-utils');

const DAY_MS = 86400000;
const LEDGER_REL = path.join('.claude', 'hygiene', 'ledger.jsonl');
const POLICY_REL = path.join('.claude', 'hygiene', 'POLICY.md');

// Authority classes. The broker (/hygiene) may execute SAFE and ARCHIVE on its
// own; OWNER needs whoever owns the work; GATED needs the founder; STOP halts
// every other action in the repo.
const CLASS = Object.freeze({
  SAFE: 'SAFE',         // reversible, loses nothing: fetch, fast-forward, push, prune
  ARCHIVE: 'ARCHIVE',   // destructive, but only after an archive ref preserves the object
  OWNER: 'OWNER',       // someone's live work — ledger it, never touch it
  GATED: 'GATED',       // a judgement call or a real loss — the founder decides
  STOP: 'STOP',         // the repo cannot be trusted; do nothing else here
});

function git(repo, args, timeout) {
  const r = runGitInRepo(repo, args, { timeout: timeout || 10000 });
  return { ok: r.ok, out: String(r.stdout || '').trim(), code: r.code };
}

function lines(s) { return s ? s.split('\n').filter((l) => l.trim()) : []; }

function ageDays(iso, now) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.floor(((now || Date.now()) - t) / DAY_MS) : null;
}

function gitDir(repo) {
  const r = git(repo, ['rev-parse', '--absolute-git-dir']);
  return r.ok ? r.out : null;
}

/**
 * The branch everything else is compared to. origin/HEAD when the remote says,
 * then the conventional names. Null when none exists — callers then refuse to
 * classify rather than compare against the wrong base.
 */
function resolveDefaultRef(repo) {
  const sym = git(repo, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']);
  if (sym.ok && sym.out) return sym.out;
  for (const c of ['origin/main', 'origin/master', 'main', 'master']) {
    if (git(repo, ['rev-parse', '--verify', '--quiet', `${c}^{commit}`]).ok) return c;
  }
  return null;
}

/**
 * Would merging `ref` into `base` change anything?
 *
 *   LANDED     the merge result IS base's tree — every change this branch makes
 *              is already there, however it got there (merge, squash, rebase,
 *              cherry-pick, hand copy). Deleting it loses nothing.
 *   STRANDED   the merge is clean and changes base — real work not on base.
 *   CONFLICTS  the merge conflicts — diverged; a person reads it.
 *   UNKNOWN    this git cannot answer (merge-tree --write-tree needs git 2.38).
 *
 * This replaces two weaker rules the fleet was using: raw `rev-list --count`
 * (repo-hygiene.js; a squash-merged branch reads "ahead" forever) and "do the
 * added files exist on main" (cwos-branch-sweep.js; an edit to an existing file
 * is invisible to it).
 */
function classifyAgainstDefault(repo, ref, base, ctx) {
  if (!base) return { state: 'UNKNOWN', why: 'no default branch resolved' };
  // WS-1360: a ref already in base merges to base's own tree, so it is LANDED without a merge.
  // `ctx.merged` is one `for-each-ref --merged` read for the whole repo (getRemoteBranches).
  if (ctx && ctx.merged && ctx.merged.has(ref)) return { state: 'LANDED', why: null };
  const baseTree = ctx && ctx.baseTree ? ctx.baseTree : git(repo, ['rev-parse', `${base}^{tree}`]);
  if (!baseTree.ok) return { state: 'UNKNOWN', why: `cannot read ${base}` };
  if (ctx && !ctx.baseTree) ctx.baseTree = baseTree;
  const mt = runGitInRepo(repo, ['merge-tree', '--write-tree', '--name-only', base, ref], { timeout: 20000 });
  const out = String(mt.stdout || '').trim();
  if (mt.code === 0) {
    const tree = lines(out)[0];
    if (tree === baseTree.out) return { state: 'LANDED', why: null };
    const stat = git(repo, ['diff', '--name-only', base, tree]);
    return { state: 'STRANDED', why: null, files: stat.ok ? lines(stat.out).length : null };
  }
  if (mt.code === 1) {
    const conflicted = lines(out).slice(1).filter((l) => !/^\s*$/.test(l) && !/\s/.test(l.trim()));
    return { state: 'CONFLICTS', why: null, files: conflicted.length || null };
  }
  return { state: 'UNKNOWN', why: (String(mt.stderr || '').split('\n')[0] || 'merge-tree failed').slice(0, 120) };
}

/** Each stash, and whether dropping it would lose anything. */
function getStashes(repo, base, now) {
  const r = git(repo, ['stash', 'list', '--format=%gd%x09%H%x09%cI%x09%gs']);
  if (!r.ok) return null;
  return lines(r.out).map((l) => {
    const [ref, sha, date, subject] = l.split('\t');
    const m = /^(?:WIP on|On) ([^:]+):/.exec(subject || '');
    const files = git(repo, ['diff', '--name-only', `${sha}^1`, sha]);
    const fileList = files.ok ? lines(files.out) : null;
    const untracked = git(repo, ['rev-parse', '--verify', '--quiet', `${sha}^3`]).ok;
    // LANDED only when every file the stash changed has the stash's exact blob on
    // base, and it carries no untracked-files commit we did not compare.
    let landed = null;
    if (base && fileList) {
      // Compare full tree ENTRIES (mode, type, object), not blobs: a stash that
      // only sets the executable bit or swaps a symlink for a file has an
      // identical blob and is still unique work. ls-tree prints nothing for an
      // absent path, so "deleted in both" compares equal.
      landed = !untracked && fileList.every((f) => {
        const a = git(repo, ['ls-tree', sha, '--', f]);
        const b = git(repo, ['ls-tree', base, '--', f]);
        return a.ok && b.ok && a.out === b.out;
      });
    }
    return {
      ref, sha, date, age_days: ageDays(date, now), branch: m ? m[1] : null,
      message: subject || null, files: fileList, has_untracked: untracked,
      content_state: landed === null ? 'UNKNOWN' : (landed ? 'LANDED' : 'UNIQUE'),
    };
  });
}

/** Every local branch with its upstream relationship. */
function getLocalBranches(repo, now) {
  const r = git(repo, ['for-each-ref', 'refs/heads',
    '--format=%(refname:short)%09%(objectname)%09%(upstream:short)%09%(upstream:track)%09%(committerdate:iso-strict)']);
  if (!r.ok) return null;
  // WS-1360: one read of origin's branch names, instead of a rev-parse per local branch.
  const remotes = git(repo, ['for-each-ref', '--format=%(refname)', 'refs/remotes/origin']);
  const onOrigin = remotes.ok ? new Set(lines(remotes.out)) : null;
  return lines(r.out).map((l) => {
    const [name, sha, upstream, track, date] = l.split('\t');
    const out = { name, sha, upstream: upstream || null, upstream_gone: /gone/.test(track || ''),
      implicit_upstream: false, ahead: null, behind: null, date, age_days: ageDays(date, now) };
    // A branch pushed without -u (every cloud session's checkout) has no upstream
    // configured but a same-named remote branch. Reading it as "local-only" would
    // propose deleting work that is in fact on origin, or pushing it twice.
    if (!out.upstream && (onOrigin
      ? onOrigin.has(`refs/remotes/origin/${name}`)
      : git(repo, ['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${name}`]).ok)) {
      out.upstream = `origin/${name}`;
      out.implicit_upstream = true;
    }
    // WS-1360: a configured upstream's counts are already in %(upstream:track) ("" = in step,
    // "[ahead 1]", "[behind 2]", "[ahead 1, behind 2]"); only an implicit upstream, or a track
    // this does not recognise, costs a rev-list.
    const tr = !out.implicit_upstream && out.upstream && !out.upstream_gone
      ? /^(?:\[(?:ahead (\d+))?(?:, )?(?:behind (\d+))?\])?$/.exec(track || '') : null;
    if (tr && (track === '' || track === undefined || tr[1] || tr[2])) {
      out.ahead = Number(tr[1] || 0); out.behind = Number(tr[2] || 0);
    } else if (out.upstream && !out.upstream_gone) {
      const c = git(repo, ['rev-list', '--left-right', '--count', `${out.upstream}...${name}`]);
      if (c.ok) { const [b, a] = c.out.split(/\s+/).map(Number); out.behind = b; out.ahead = a; }
    }
    return out;
  });
}

/** Every remote-tracking branch other than the default, classified. */
function getRemoteBranches(repo, base, now) {
  const r = git(repo, ['for-each-ref', 'refs/remotes',
    '--format=%(refname:short)%09%(objectname)%09%(committerdate:iso-strict)%09%(symref)']);
  if (!r.ok) return null;
  // WS-1360: the per-branch merge took ~15-40 s on a 138-branch repo. Branches already in base
  // are found in one read and base's tree is read once; only the rest are merged one by one.
  // Both reads use refname:short, so the names match `name` below exactly.
  const ctx = {};
  if (base) {
    const m = git(repo, ['for-each-ref', `--merged=${base}`, '--format=%(refname:short)', 'refs/remotes'], 30000);
    if (m.ok) ctx.merged = new Set(lines(m.out));
  }
  return lines(r.out)
    .map((l) => l.split('\t'))
    // origin only. The default branch is resolved on origin, archives are pushed
    // to origin, and a second remote (upstream, a colleague's fork) is one the
    // broker has no business deleting from — review found archive deleting on
    // `upstream` while its safety copy landed on `origin`.
    .filter(([name, , , symref]) => !symref && name.startsWith('origin/') && name !== base && !/\/HEAD$/.test(name))
    .map(([name, sha, date]) => ({ name, sha, date, age_days: ageDays(date, now),
      ...classifyAgainstDefault(repo, name, base, ctx) }));
}

function getWorktrees(repo) {
  const r = git(repo, ['worktree', 'list', '--porcelain']);
  if (!r.ok) return null;
  const out = [];
  let cur = null;
  for (const l of r.out.split('\n')) {
    if (l.startsWith('worktree ')) { cur = { path: l.slice(9), head: null, branch: null, locked: false, prunable: false }; out.push(cur); }
    else if (!cur) continue;
    else if (l.startsWith('HEAD ')) cur.head = l.slice(5);
    else if (l.startsWith('branch ')) cur.branch = l.slice(7).replace(/^refs\/heads\//, '');
    else if (l.startsWith('locked')) cur.locked = true;
    else if (l.startsWith('prunable')) cur.prunable = true;
  }
  const main = out.length ? path.resolve(out[0].path) : null;
  for (const w of out) {
    w.main = path.resolve(w.path) === main;
    w.missing = !fs.existsSync(w.path);
    w.dirty_count = null;
    if (!w.missing && !w.main) {
      const s = git(w.path, ['status', '--porcelain']);
      if (s.ok) w.dirty_count = lines(s.out).length;
    }
  }
  return out;
}

/** An operation git was in the middle of when the session that started it went away. */
function getOperation(repo) {
  const gd = gitDir(repo);
  if (!gd) return null;
  const markers = [['rebase', 'rebase-merge'], ['rebase', 'rebase-apply'], ['merge', 'MERGE_HEAD'],
    ['cherry-pick', 'CHERRY_PICK_HEAD'], ['revert', 'REVERT_HEAD'], ['bisect', 'BISECT_LOG']];
  for (const [kind, file] of markers) {
    const p = path.join(gd, file);
    if (fs.existsSync(p)) {
      let since = null;
      try { since = fs.statSync(p).mtime.toISOString(); } catch { /* unknown */ }
      const orig = git(repo, ['rev-parse', '--verify', '--quiet', 'ORIG_HEAD']);
      return { kind, since, orig_head: orig.ok ? orig.out : null };
    }
  }
  return { kind: null };
}

// Read from BOTH the worktree's git dir and the common one (fetchAgeDays, below):
// reading only the former made a fetch done in the main tree read "never" from a
// linked worktree — measured 2026-11-04, the fleet scan run from a HomeBase
// worktree printed "refs never fetched" for HomeBase, fetched minutes before.
function lastFetchDays(repo, now) {
  return fetchAgeDays(repo, now);   // never fetched anywhere: null — unknown, not fresh
}

/**
 * The full detail block. `inFlight` is fleet-scan's existing counts object, so
 * the dirty/ref facts are not re-derived here.
 */
function getHygieneDetail(repo, inFlight, opts) {
  const now = (opts && opts.now) || Date.now();
  const base = resolveDefaultRef(repo);
  const shallow = git(repo, ['rev-parse', '--is-shallow-repository']);
  const worktrees = getWorktrees(repo);
  const st = git(repo, ['status', '--porcelain']);
  return {
    host: os.hostname(),
    default_ref: base,
    shallow: shallow.ok ? shallow.out === 'true' : null,
    last_fetch_days: lastFetchDays(repo, now),
    detached: inFlight && inFlight.branch === 'HEAD',
    operation: getOperation(repo),
    stashes: getStashes(repo, base, now),
    local_branches: getLocalBranches(repo, now),
    remote_branches: getRemoteBranches(repo, base, now),
    worktrees,
    // Branches checked out in ANY worktree. Never proposed for deletion: git
    // refuses it anyway, and the proposal would be noise the broker has to ledger.
    checked_out: (worktrees || []).map((w) => w.branch).filter(Boolean),
    // Fingerprint of WHICH files are dirty, not how many — so a ledgered "owned
    // by session X" survives further edits to the same files and reopens when
    // new files appear.
    dirty_paths_hash: st.ok ? hash(lines(st.out).map((l) => l.slice(3)).sort().join('\n')) : null,
  };
}

// ─── Findings ────────────────────────────────────────────────────────────────

function fp(...parts) { return parts.join(':'); }
function hash(s) { return crypto.createHash('sha1').update(s).digest('hex').slice(0, 10); }

/**
 * Turn the detail into findings. Each finding's fingerprint names the exact
 * object state it was judged on — a branch's tip sha, a stash's sha — so a
 * disposition recorded against it goes stale by itself the moment the object
 * moves. That is what stops a "we kept this on purpose" note from silently
 * covering new work pushed to the same branch later.
 */
function buildFindings(inFlight, detail, opts) {
  const staleDays = (opts && opts.staleDays != null && Number.isFinite(opts.staleDays)) ? opts.staleDays : 7;
  const out = [];
  const add = (kind, subject, fingerprint, state, action, cls, extra) =>
    out.push({ kind, subject, fingerprint, state, action, class: cls, ...(extra || {}) });

  if (inFlight && inFlight.ref_integrity === 'broken') {
    add('refs', 'git refs', fp('refs', hash(inFlight.ref_detail || '')), 'BROKEN',
      'repair refs by hand before any other git action — every read here is untrustworthy', CLASS.STOP);
    return out;
  }
  if (!detail) return out;

  // A null list is a git read that failed — not an empty list. Iterating it as
  // `|| []` reported summary.open 0 over a repo nobody had read (WS-543
  // inspection, 2026-10-30). Each failed read becomes one OPEN finding of its
  // own, GATED so nothing acts on it automatically; it clears itself the next
  // time the read succeeds, because the finding is simply not produced then.
  const unread = (what) => add('unread', what, fp('unread', what, detail.host || '?'), 'UNKNOWN',
    `git could not read the ${what} here — not checked, not clean; rescan`, CLASS.GATED);
  if (detail.stashes === null) unread('stashes');
  if (detail.local_branches === null) unread('local branches');
  if (detail.remote_branches === null) unread('remote branches');
  if (detail.worktrees === null) unread('worktrees');
  if (inFlight && inFlight.dirty_count === null) unread('working tree');

  if (detail.last_fetch_days === null || detail.last_fetch_days > 1) {
    add('fetch', 'remote refs', fp('fetch', detail.host), detail.last_fetch_days === null ? 'NEVER' : `${detail.last_fetch_days}d old`,
      'git fetch --all --prune', CLASS.SAFE);
  }
  if (detail.operation && detail.operation.kind) {
    const o = detail.operation;
    add('operation', `${o.kind} in progress`, fp('op', o.kind, o.orig_head || 'none'), 'IN-PROGRESS',
      `git ${o.kind === 'bisect' ? 'bisect reset' : `${o.kind} --abort`} once no live session owns it (abort restores ORIG_HEAD)`,
      CLASS.OWNER, { since: o.since });
  }
  if (inFlight && inFlight.dirty_count) {
    add('dirty', `working tree [${inFlight.branch || '?'}]`, fp('dirty', inFlight.branch || '?', detail.dirty_paths_hash || inFlight.dirty_count),
      `${inFlight.dirty_count} uncommitted`, 'owner commits it, or ledger who owns it', CLASS.OWNER);
  }

  for (const s of detail.stashes || []) {
    if (s.content_state === 'LANDED') {
      add('stash', `${s.ref} (${s.branch || '?'}, ${s.age_days}d)`, fp('stash', s.sha), 'LANDED',
        'archive + drop — content already on the default branch', CLASS.ARCHIVE, { message: s.message });
    } else {
      add('stash', `${s.ref} (${s.branch || '?'}, ${s.age_days}d)`, fp('stash', s.sha), s.content_state,
        'archive (pushes it off this machine), then drop only if the archive push succeeded; otherwise ledger it',
        CLASS.ARCHIVE, { message: s.message, unique: true });
    }
  }

  const baseName = detail.default_ref ? detail.default_ref.replace(/^[^/]+\//, '') : null;
  const checkedOut = new Set(detail.checked_out || []);
  for (const b of detail.local_branches || []) {
    const isDefault = b.name === baseName;
    const pinned = checkedOut.has(b.name);
    if (b.upstream_gone) {
      const c = classifyAgainstDefault(opts && opts.repo, b.name, detail.default_ref);
      const del = c.state === 'LANDED' && !pinned;
      add('branch', b.name, fp('branch', b.name, b.sha), `upstream gone, ${c.state}${pinned ? ', checked out' : ''}`,
        del ? 'archive + delete local branch' : (pinned ? 'checked out — switch away first, or ledger it' : 'push it back or ledger why it is kept'),
        del ? CLASS.ARCHIVE : (pinned ? CLASS.OWNER : CLASS.GATED));
      continue;
    }
    if (!b.upstream) {
      const c = classifyAgainstDefault(opts && opts.repo, b.name, detail.default_ref);
      if (c.state === 'LANDED' && pinned) {
        add('branch', b.name, fp('branch', b.name, b.sha), 'local-only, LANDED, checked out',
          'nothing to preserve; delete it once nobody has it checked out', CLASS.OWNER);
      } else if (c.state === 'LANDED') {
        add('branch', b.name, fp('branch', b.name, b.sha), 'local-only, LANDED', 'archive + delete local branch', CLASS.ARCHIVE);
      } else {
        add('branch', b.name, fp('branch', b.name, b.sha), `local-only, ${c.state}`,
          'push it (git push -u origin <branch>) so it exists off this machine', CLASS.SAFE);
      }
      continue;
    }
    // The default branch is the one place a push is a policy question (some repos
    // grant it, some deploy on it, some forbid it), so its divergence is GATED on
    // the repo's own git policy rather than assumed safe.
    if (b.ahead && b.behind) {
      add('branch', b.name, fp('branch', b.name, b.sha), `diverged +${b.ahead}/-${b.behind}`,
        isDefault
          ? 'move the local commits to a branch, reset to upstream only after that branch is pushed — per repo git policy'
          : 'rebase the unpushed commits onto upstream if clean; abort and ledger on conflict',
        isDefault ? CLASS.GATED : CLASS.SAFE);
    } else if (b.behind) {
      add('branch', b.name, fp('branch', b.name, b.sha), `behind ${b.behind}`, 'fast-forward (cwos-hygiene ff)', CLASS.SAFE);
    } else if (b.ahead) {
      add('branch', b.name, fp('branch', b.name, b.sha), `ahead ${b.ahead}`,
        isDefault ? 'push only if the repo\'s git policy grants default-branch pushes; otherwise branch + PR' : 'push',
        isDefault ? CLASS.GATED : CLASS.SAFE);
    }
  }

  for (const r of detail.remote_branches || []) {
    if (r.state === 'LANDED') {
      const old = r.age_days !== null && r.age_days >= staleDays;
      add('remote', r.name, fp('remote', r.name, r.sha), 'LANDED',
        old ? 'archive + delete the remote branch' : `LANDED but under ${staleDays}d old — leave; its session may still be pushing`,
        old ? CLASS.ARCHIVE : CLASS.OWNER);
    } else if (r.state === 'STRANDED') {
      add('remote', r.name, fp('remote', r.name, r.sha), `STRANDED (${r.files == null ? '?' : r.files} files)`,
        'merge it, open a PR, or ledger why it waits — never delete', CLASS.GATED, { age_days: r.age_days });
    } else if (r.state === 'CONFLICTS') {
      add('remote', r.name, fp('remote', r.name, r.sha), 'CONFLICTS with default',
        'a person reads it; ledger the owner', CLASS.GATED, { age_days: r.age_days });
    } else {
      add('remote', r.name, fp('remote', r.name, r.sha), `UNKNOWN (${r.why})`,
        detail.shallow ? 'shallow clone hides the merge base — resolve the shallow finding, then rescan' : 'cannot classify here',
        CLASS.GATED);
    }
  }
  // A shallow clone cannot see where most branches forked, so every one of them
  // reads UNKNOWN (measured: 20 of 22 on a cloud clone of HomeBase). That is the
  // classifier refusing correctly; the fix is history, not a weaker rule.
  const unknownRemotes = (detail.remote_branches || []).filter((r) => r.state === 'UNKNOWN').length;
  if (detail.shallow && unknownRemotes) {
    add('shallow', 'clone history', fp('shallow', detail.host), `shallow — ${unknownRemotes} branch(es) unclassifiable`,
      'git fetch --unshallow, then rescan', CLASS.SAFE);
  }

  for (const w of detail.worktrees || []) {
    if (w.main) continue;
    if (w.missing || w.prunable) {
      add('worktree', w.path, fp('worktree', w.path, w.head || '?'), 'missing dir', 'git worktree prune', CLASS.SAFE);
    } else if (w.dirty_count) {
      add('worktree', w.path, fp('worktree', w.path, w.head || '?'), `${w.dirty_count} uncommitted`,
        'its owner commits it; ledger the owner', CLASS.OWNER);
    } else if (w.dirty_count === null) {
      // getWorktrees leaves the count null when `git status` in it failed.
      add('unread', `worktree ${w.path}`, fp('unread', 'worktree', w.path), 'UNKNOWN',
        'git could not read this worktree\'s status — not checked, not clean; rescan', CLASS.GATED);
    }
  }
  return out;
}

// ─── Ledger ──────────────────────────────────────────────────────────────────
//
// THE PROBLEM IT SOLVES. A cleanup pass that meets something it cannot resolve
// leaves it. The next session sees the same stash, the same stranded branch,
// and has no way to know it was already looked at — so it re-investigates, or
// "fixes" something that was kept on purpose. The tail of every cleanup becomes
// rework for someone who does not know it is accounted for.
//
// A ledger row says: this exact object (fingerprint) was judged, here is the
// disposition, who owns it, the policy entry it rests on, and when to look again.
// It lives in the repo, so every machine reads the same one. Append-only JSONL:
// the row with the latest `at` for a fingerprint wins, and history is never rewritten.

function ledgerPath(repo) { return path.join(repo, LEDGER_REL); }

function readLedger(repo) {
  const p = ledgerPath(repo);
  const byFp = new Map();
  let bad = 0;
  if (!fs.existsSync(p)) return { byFp, bad, exists: false };
  for (const l of fs.readFileSync(p, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try {
      const row = JSON.parse(l);
      if (!row || !row.fingerprint) { bad++; continue; }
      // Latest by the row's own timestamp, NOT by line position: merge=union
      // interleaves two nodes' appends in diff order, not time order, so "last
      // line wins" could let a stale row override a fresher one.
      const prev = byFp.get(row.fingerprint);
      if (!prev || String(row.at || '') >= String(prev.at || '')) byFp.set(row.fingerprint, row);
    } catch { bad++; }
  }
  return { byFp, bad, exists: true };
}

const DISPOSITIONS = ['kept', 'waiting', 'owned', 'resolved'];

function appendLedger(repo, row) {
  if (!row || !row.fingerprint) throw new Error('ledger row needs a fingerprint');
  if (!DISPOSITIONS.includes(row.disposition)) throw new Error(`disposition must be one of ${DISPOSITIONS.join('|')}`);
  if (!row.reason || String(row.reason).length < 12) throw new Error('reason must say why (12+ chars)');
  const p = ledgerPath(repo);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  // Two machines append concurrently; union merge keeps both sides' rows.
  // Safe here because rows are independent — unlike the hash-chained event logs.
  const attrs = path.join(path.dirname(p), '.gitattributes');
  if (!fs.existsSync(attrs)) writeFileAtomic(attrs, 'ledger.jsonl merge=union\n');
  const full = { at: new Date().toISOString(), host: os.hostname(), ...row };
  fs.appendFileSync(p, JSON.stringify(full) + '\n');
  return full;
}

/** Mark each finding ACCOUNTED or OPEN against the ledger. */
function applyLedger(findings, ledger, now) {
  const today = new Date(now || Date.now()).toISOString().slice(0, 10);
  return findings.map((f) => {
    // A failed read cannot be accounted for: a ledger row saying "we know"
    // would hide every later failure of the same read, because the fingerprint
    // is stable (WS-543 inspection, 2026-11-05). It stays open until it reads.
    if (f.kind === 'unread') return { ...f, accounted: false };
    const row = ledger.byFp.get(f.fingerprint);
    if (!row || row.disposition === 'resolved') return { ...f, accounted: false };
    const expired = row.recheck_after && String(row.recheck_after) <= today;
    return { ...f, accounted: !expired, ledger: { disposition: row.disposition, owner: row.owner || null,
      reason: row.reason, policy: row.policy || null, recheck_after: row.recheck_after || null, expired: !!expired } };
  });
}

function summarize(findings) {
  const open = findings.filter((f) => !f.accounted);
  const byClass = {};
  for (const f of open) byClass[f.class] = (byClass[f.class] || 0) + 1;
  return { total: findings.length, open: open.length, accounted: findings.length - open.length, open_by_class: byClass };
}

// ─── Stranded check (SessionStart, WS-270) ──────────────────────────────────
//
// THE FAILURE IT EXISTS FOR. A session finishes, says "done", and its work sits
// on a branch nothing merges. ai-personal measured ten such branches on
// 2026-08-07, the oldest ten days old; on 2026-09-22 HomeBase alone carried 135
// commits across 13 of them. Only ai-personal looked, with its own sweep. This
// is the same question asked with this module's classifier, cheap enough to ask
// at every session start in every repo.
//
// WHY IT IS NOT JUST buildFindings(). That reads worktrees, stashes and status
// too: 31.7 s on deckside (81 remote branches, measured 2026-11-04), far too slow
// for a hook. This reads refs only, caches each verdict by (branch tip, base tip)
// so a verdict is computed once per pair, and stops at a time budget — leaving
// the rest PENDING for the next session, which resumes from the cache. Branches
// are taken newest first, so a budget that runs out leaves the oldest unread.
//
// WHAT IT NEVER DOES. Report silence as clean. A result is quiet only when every
// branch was classified, the refs were fetched within a day, origin exists and
// nothing is open. Every other state has a line. (Adversarial pass, 2026-11-04:
// stale refs, UNKNOWN verdicts and a swallowed crash all read as "nothing
// stranded" in the first draft.)

const STRANDED_HEARTBEAT_REL = path.join('.claude', 'workstream', 'liveness', 'stranded-check.txt');
const STRANDED_CACHE_FILE = 'cwos-stranded-cache.json';
const STRANDED_CACHE_VERSION = 2;   // 2: keyed by branch tip, base stored per verdict

function commonGitDir(repo) {
  const r = git(repo, ['rev-parse', '--git-common-dir']);
  return r.ok && r.out ? path.resolve(repo, r.out) : null;
}

/**
 * Days since any fetch reached this checkout. A linked worktree keeps its own
 * FETCH_HEAD, the main tree another; the freshest one is what the refs reflect.
 * Null when neither exists: never fetched, which is unknown, not fresh.
 */
function fetchAgeDays(repo, now) {
  const t = now || Date.now();
  let best = null;
  for (const d of [gitDir(repo), commonGitDir(repo)]) {
    if (!d) continue;
    try {
      const age = (t - fs.statSync(path.join(d, 'FETCH_HEAD')).mtimeMs) / DAY_MS;
      if (best === null || age < best) best = age;
    } catch { /* this dir has no FETCH_HEAD; the other may */ }
  }
  return best === null ? null : Math.floor(best);
}

function readStrandedCache(file) {
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (c && c.version === STRANDED_CACHE_VERSION && c.verdicts && typeof c.verdicts === 'object') return c.verdicts;
  } catch { /* absent or unreadable: start empty, costs one cold scan */ }
  return {};
}

function writeStrandedHeartbeat(repo, text) {
  try {
    const p = path.join(repo, STRANDED_HEARTBEAT_REL);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    writeFileAtomic(p, text + '\n');
    return true;
  } catch { return false; }   // reported by the caller's result, never thrown into a hook
}

/**
 * Read the heartbeat the check leaves. `phase` is start | done | error | null.
 * A `start` that is not followed by `done` means the check died or was killed.
 */
function readStrandedHeartbeat(repo, now) {
  let txt;
  try { txt = fs.readFileSync(path.join(repo, STRANDED_HEARTBEAT_REL), 'utf8').trim(); }
  catch { return { phase: null, at: null, age_hours: null, line: null }; }
  const [phase, at] = txt.split(/\s+/);
  const t = Date.parse(at);
  return { phase: phase || null, at: at || null, line: txt,
    age_hours: Number.isFinite(t) ? Math.round(((now || Date.now()) - t) / 3600000 * 10) / 10 : null };
}

/**
 * The stranded question for one repo, within a time budget.
 *
 * opts: now, budgetMs (default 5000), clock (injectable for tests), noCache.
 * Returns counts and the open rows; never throws for a git failure (an unread
 * fact becomes a line), and the caller's catch handles anything else.
 */
function strandedCheck(repo, opts) {
  const o = opts || {};
  const now = o.now || Date.now();
  const clock = o.clock || Date.now;
  const budgetMs = o.budgetMs != null ? o.budgetMs : 5000;
  const t0 = clock();

  const res = {
    repo, base: null, has_origin: false, shallow: null, fetch_age_days: null,
    candidates: 0, classified: 0, pending: 0, unknown: [], open: [], accounted: 0,
    elapsed_ms: 0, cache_hits: 0,
  };
  res.has_origin = git(repo, ['remote', 'get-url', 'origin']).ok;
  res.base = resolveDefaultRef(repo);
  const sh = git(repo, ['rev-parse', '--is-shallow-repository']);
  res.shallow = sh.ok ? sh.out === 'true' : null;
  res.fetch_age_days = fetchAgeDays(repo, now);
  const baseSha = res.base ? git(repo, ['rev-parse', `${res.base}^{commit}`]) : null;
  const baseKey = baseSha && baseSha.ok ? baseSha.out : null;

  // Candidates: every origin branch but the default, and every local branch
  // that exists on this machine only (no upstream, or its upstream is gone).
  const cands = [];
  const remoteNames = new Set();
  const rr = git(repo, ['for-each-ref', 'refs/remotes/origin',
    '--format=%(refname:short)%09%(objectname)%09%(committerdate:iso-strict)%09%(symref)']);
  if (rr.ok) {
    for (const l of lines(rr.out)) {
      const [name, sha, date, symref] = l.split('\t');
      remoteNames.add(name);
      if (symref || name === res.base || /\/HEAD$/.test(name) || !name.startsWith('origin/')) continue;
      cands.push({ kind: 'remote', name, sha, date, fingerprint: fp('remote', name, sha) });
    }
  }
  // One for-each-ref, not getLocalBranches(): that spends two git calls per
  // branch on ahead/behind counts this check never reads (5.2 s of a 5 s budget
  // on deckside's 95 local branches). Same rules: a branch with no upstream but a
  // same-named origin branch is on origin (every cloud checkout pushes without -u).
  const baseName = res.base ? res.base.replace(/^[^/]+\//, '') : null;
  const lr = git(repo, ['for-each-ref', 'refs/heads',
    '--format=%(refname:short)%09%(objectname)%09%(upstream:short)%09%(upstream:track)%09%(committerdate:iso-strict)']);
  for (const l of lr.ok ? lines(lr.out) : []) {
    const [name, sha, upstream, track, date] = l.split('\t');
    if (name === baseName) continue;
    const gone = /gone/.test(track || '');
    if (upstream && !gone) continue;
    if (!upstream && remoteNames.has(`origin/${name}`)) continue;
    cands.push({ kind: 'branch', name, sha, date,
      local: gone ? 'upstream gone' : 'local only', fingerprint: fp('branch', name, sha) });
  }
  cands.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  res.candidates = cands.length;

  const cdir = commonGitDir(repo);
  const cacheFile = cdir && !o.noCache ? path.join(cdir, STRANDED_CACHE_FILE) : null;
  const cache = cacheFile ? readStrandedCache(cacheFile) : {};
  const nextCache = {};
  const ledger = readLedger(repo);
  const today = new Date(now).toISOString().slice(0, 10);

  // Cache by branch tip. A verdict computed against the current base is reused
  // as is. A LANDED verdict is reused after the base moves too: the default
  // branch moves every few minutes in busy repos (ai-personal: every 10), and a
  // per-base key re-read every branch on every push — measured, the cache never
  // converged. The cost is stated: a branch whose changes the default branch
  // later REVERTS keeps reading LANDED until its own tip moves. This check only
  // reports; it never deletes, so that error is a missed line, not a lost branch.
  // STRANDED and CONFLICTS are always re-read when the base moves (a merge
  // changes them), and are read FIRST, because they are the lines that matter.
  const hit = (c) => {
    const v = cache[c.sha];
    return v && baseKey && (v.base === baseKey || v.state === 'LANDED') ? v : null;
  };
  const wasOpen = (c) => { const v = cache[c.sha]; return v && v.state !== 'LANDED' ? 0 : 1; };
  cands.sort((a, b) => wasOpen(a) - wasOpen(b));

  for (const c of cands) {
    let v = hit(c);
    if (v) res.cache_hits++;
    else if (clock() - t0 > budgetMs) { res.pending++; continue; }
    else {
      const k = classifyAgainstDefault(repo, c.kind === 'remote' ? c.name : `refs/heads/${c.name}`, res.base);
      v = { base: baseKey, state: k.state, files: k.files == null ? null : k.files, why: k.why || null };
    }
    // UNKNOWN is never cached: the cause (old git, shallow clone) may be fixed.
    if (baseKey && v.state !== 'UNKNOWN') nextCache[c.sha] = { base: v.base, state: v.state, files: v.files };
    if (v.state === 'UNKNOWN') { res.unknown.push({ name: c.name, why: v.why }); continue; }
    res.classified++;
    if (v.state === 'LANDED') continue;
    const row = ledger.byFp.get(c.fingerprint);
    const accounted = !!row && row.disposition !== 'resolved' &&
      !(row.recheck_after && String(row.recheck_after) <= today);
    if (accounted) { res.accounted++; continue; }
    res.open.push({ kind: c.kind, name: c.name, state: v.state, files: v.files, local: c.local || null,
      age_days: ageDays(c.date, now), fingerprint: c.fingerprint });
  }

  // Rewritten whole each run with only this run's pairs, so it never grows past
  // the branch count. A failed write costs the next session a cold scan, nothing else.
  if (cacheFile) {
    try { writeFileAtomic(cacheFile, JSON.stringify({ version: STRANDED_CACHE_VERSION, verdicts: nextCache })); }
    catch { /* cache is an optimisation */ }
  }
  res.elapsed_ms = clock() - t0;
  return res;
}

module.exports = {
  CLASS, LEDGER_REL, POLICY_REL, DISPOSITIONS,
  STRANDED_HEARTBEAT_REL, strandedCheck, fetchAgeDays, readStrandedHeartbeat, writeStrandedHeartbeat,
  resolveDefaultRef, classifyAgainstDefault,
  getStashes, getLocalBranches, getRemoteBranches, getWorktrees, getOperation, lastFetchDays,
  getHygieneDetail, buildFindings,
  readLedger, appendLedger, applyLedger, summarize,
};
