#!/usr/bin/env node
/**
 * cwos-kit-upgrade — founder-facing, single-repo kit upgrade orchestrator.
 *
 * Composes the EXISTING upgrade machinery (cwos-migrate.js for MANIFEST-driven
 * file classification + apply + program v2→v3 + index rebuild + version stamp;
 * the registry-sync scripts for re-materialization) and adds the safety layer a
 * non-technical founder needs to run one command and trust the result:
 *
 *   • version-staged schema sequencing (refuse if an intermediate migrator is absent)
 *   • a comprehensive pre-upgrade snapshot (.cwos-snapshots/kit-pre-upgrade-<ts>/)
 *   • the whole write phase under a file lock (no concurrent reconcile corruption)
 *   • a post-upgrade validation gate (reconcile / next gate / allocate-ws-id /
 *     pulse / audit drift / registry path resolution / version bumped)
 *   • AUTOMATIC rollback to the snapshot if the gate fails — never a half-upgrade
 *   • loud surfacing of locally hand-edited kit files before they're overwritten
 *
 * This is adopter-local and SINGLE-repo. /fleet-update remains the HomeBase-side
 * bulk push; /kit-upgrade is the careful one-repo path with gates + auto-rollback.
 *
 * Usage:
 *   node kit/scripts/cwos-kit-upgrade.js [<repo-path>] --homebase <path> [--apply]
 *   node kit/scripts/cwos-kit-upgrade.js [<repo-path>] --rollback [--yes]
 *
 *   <repo-path>   repo to upgrade (default: cwd)
 *   --homebase    HomeBase root that sources the new kit (required unless cwd/.cwos-version resolves it)
 *   --apply       perform writes (default: dry-run — shows the full diff, writes nothing)
 *   --rollback    PREVIEW restoring the most recent kit-pre-upgrade snapshot (writes nothing)
 *   --yes         with --rollback: perform the restore, under the upgrade lock
 *   --json        machine-readable summary
 *
 * Exit: 0 ok / preview · 1 error, incl. an INCOMPLETE rollback · 3 missing schema
 * migrator · 4 gate failed (auto-rolled back) · 5 an earlier upgrade was
 * interrupted (--apply refused) · 6 repo-authored file at a kit/scripts path ·
 * 7 rollback refused (the snapshot is not the installed upgrade)
 */

'use strict';

require('./lib/preflight');

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { readYAMLFile, withFileLock, makeEventEmitter, writeFileAtomic } = require('./lib/cwos-utils');

const emitEvent = makeEventEmitter();
const { resolveRepoVersion } = require('./lib/kit-version');
// WS-503: the snapshot/rollback mechanism this file pioneered now lives in a
// shared lib so /adopt can reuse it rather than grow a second implementation.
const repoSnapshot = require('./lib/repo-snapshot');
// WS-674: shared with cwos-migrate's additive .gitignore merge — two write
// sites, one predicate. See the lib header for why guarding one was not enough.
const { filterIgnoreLinesAgainstTracked } = require('./lib/gitignore-guard');

const SNAPSHOT_PREFIX = 'kit-pre-upgrade-';
// Authored surfaces we snapshot for rollback (those an upgrade overwrites).
const SNAPSHOT_DIRS = [
  'kit',
  '.claude/commands',
  '.claude/agents',
  '.claude/skills',
  '.claude/workstream/programs',
  '.claude/workstream/engines',
  // WS-502 / ADR-058: state cache snapshotted so a failed apply after the 3d
  // state-schema migration (or the 3g untrack migration) restores cleanly —
  // "never a half-upgrade" now covers state. Post-ADR-058 the cache is also
  // rebuildable via cwos-reconcile --refresh-state, so this is belt-and-braces.
  '.claude/workstream/state',
];
// .gitignore included since 3g (ADR-058) appends the CWOS block — rollback
// restores the pre-upgrade file content. Index changes from `git rm --cached`
// (3g, 3h) are undone by autoRollback via restoreIndex (WS-1141).
const SNAPSHOT_FILES = ['.cwos-version', '.gitignore'];
// Written by step 3i. Snapshotted per-run (it may not exist yet), not listed above.
const CLAUDE_SETTINGS = '.claude/settings.json';

// ─── small fs helpers (Node floor is v14 — no fs.cpSync) ────────────────────

// WS-600: hashing + line-ending comparison moved to the shared lib so this
// site, cwos-migrate's stamp gate, and cwos-stamp-audit apply ONE rule.
const { sha256 } = require('./lib/kit-hash');
function isFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

const copyTree = repoSnapshot.copyTree;

// ─── HomeBase / version resolution ──────────────────────────────────────────

function looksLikeHomeBase(dir) {
  return dir && isFile(path.join(dir, 'kit', 'VERSION')) && isFile(path.join(dir, 'kit', 'MANIFEST.yaml'));
}

function resolveHomeBase(override, repoPath) {
  if (override) return path.resolve(override);
  // walk up from cwd (works when invoked from inside HomeBase)
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (looksLikeHomeBase(dir) && path.resolve(dir) !== path.resolve(repoPath)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// .cwos-version may be YAML (new) or a bare version scalar (legacy fixtures).
// WS-547: precedence moved to lib/kit-version.js. This used to prefer
// kit_version_at_install over version — the same inversion as cwos-migrate — and
// it also never looked at the /genesis `kit_version:` shape, so an M0 repo
// resolved to null here.
function readInstalledVersion(repoPath) {
  const resolved = resolveRepoVersion(repoPath);
  return resolved ? resolved.version : null;
}

function readKitVersion(homebase) {
  return fs.readFileSync(path.join(homebase, 'kit', 'VERSION'), 'utf8').trim();
}

// ─── schema sequencing (req 3) ──────────────────────────────────────────────

function detectMinProgramSchema(repoPath) {
  const dir = path.join(repoPath, '.claude', 'workstream', 'programs');
  if (!isDir(dir)) return null;
  let min = null;
  for (const f of fs.readdirSync(dir)) {
    if (!/^prog-.*\.yaml$/.test(f) || f === 'registry.yaml') continue;
    const { ok, data } = readYAMLFile(path.join(dir, f));
    if (!ok || !data || !data.id) continue;
    const sv = Number(data.schema_version) || 1;
    if (min === null || sv < min) min = sv;
  }
  return min;
}

function targetProgramSchema(homebase) {
  const { ok, data } = readYAMLFile(path.join(homebase, 'kit', 'templates', 'workstream', 'programs', 'prog-template.yaml'));
  return ok && data && Number(data.schema_version) ? Number(data.schema_version) : 4;
}

/**
 * Resolve the ordered program-schema migrator chain. Returns
 * { steps: ['2→3','3→4'], missing: [] } — `missing` non-empty means refuse.
 */
function resolveSchemaChain(fromSchema, toSchema, SCHEMA_MIGRATIONS) {
  const steps = [];
  const missing = [];
  // migrators below 2 are folded into '2→3' (it tolerates v1/v2 input)
  let v = fromSchema < 2 ? 2 : fromSchema;
  for (; v < toSchema; v++) {
    const key = `${v}→${v + 1}`;
    steps.push(key);
    if (!SCHEMA_MIGRATIONS[key]) missing.push(key);
  }
  return { steps, missing };
}

// ─── local-mod baseline (req 9, decision 3: shipped hash manifest) ──────────

function loadHashBaseline(homebase, repoPath, installedVersion) {
  // primary: the per-version manifest SHIPPED into the adopter at install time,
  // i.e. the adopter's own kit/hashes-<installed>.yaml. This is the authoritative
  // record of what version <installed> shipped (decision 3). Fall back to
  // HomeBase's copy of the same version if the adopter predates the manifest.
  for (const [label, root] of [['repo', repoPath], ['homebase', homebase]]) {
    const mp = path.join(root, 'kit', `hashes-${installedVersion}.yaml`);
    if (isFile(mp)) {
      const { ok, data } = readYAMLFile(mp);
      if (ok && data && data.files) {
        return { source: `${label}:hashes-${installedVersion}.yaml`, files: data.files };
      }
    }
  }
  // fallback: .cwos-version installed_files (populated by adopt/fleet-update)
  const { ok, data } = readYAMLFile(path.join(repoPath, '.cwos-version'));
  if (ok && data && data.installed_files && Object.keys(data.installed_files).length) {
    return { source: '.cwos-version#installed_files', files: data.installed_files, keyedByDestination: true };
  }
  // else: git-tag reconstruction is handled inside cwos-migrate's classifyFiles;
  // we mark the baseline unavailable so detection is never silently skipped.
  return null;
}

/**
 * Detect locally hand-edited kit files among those that will be overwritten.
 * Returns [{ source, destination, expected, actual }].
 *
 * WS-544: the comparison is line-ending insensitive. Baselines are sha256 over
 * raw bytes, and 127 of the 389 files HomeBase ships contain CRLF, so the same
 * logical content hashes differently depending on which platform checked the
 * repo out. The observed symptom was the WRONG direction of wrong: /kit-upgrade
 * reported "No local kit modifications" for a repo whose cwos-utils.js genuinely
 * differed, because the file fell out of the known-baseline path entirely.
 *
 * A file counts as unmodified when the baseline matches ANY of its three
 * renderings: as-is, all-LF, or all-CRLF. Both directions have to be covered —
 * the baseline may have been recorded on a CRLF checkout and be compared against
 * an LF one, or the reverse — and only the local bytes are available to vary,
 * since a baseline is a hash and cannot be re-normalized after the fact.
 * Accepting any of the three keeps the shipped baselines (hashes-3.8.0,
 * hashes-3.8.1) valid; regenerating them would break detection for every repo
 * already installed on those versions.
 *
 * A real edit still shows up: changing content changes all three hashes.
 *
 * WS-600: the implementation now lives in lib/kit-hash.js (shared with the
 * stamp-audit checker and cwos-migrate's pre-stamp gate); this rationale
 * stays here because this is where the failure was measured.
 */
const { lineEndingVariantHashes } = require('./lib/kit-hash');

function detectLocalMods(homebase, repoPath, manifestFiles, baseline) {
  if (!baseline) return null; // unavailable — caller surfaces this
  const mods = [];
  for (const entry of manifestFiles) {
    if (entry.homebase_only) continue;
    const dest = String(entry.destination || '').replace('{system_dir}', 'system');
    const destAbs = path.join(repoPath, dest);
    if (!isFile(destAbs)) continue;
    const key = baseline.keyedByDestination ? dest : entry.source;
    const expected = baseline.files[key];
    if (!expected) continue;
    const buf = fs.readFileSync(destAbs);
    if (lineEndingVariantHashes(buf).has(expected)) continue;
    mods.push({ source: entry.source, destination: dest, expected, actual: sha256(buf) });
  }
  return mods;
}

// ─── snapshot / rollback (req 8) ────────────────────────────────────────────

function snapshotDirsRoot(repoPath) { return repoSnapshot.snapshotRoot(repoPath); }

// Thin wrappers over lib/repo-snapshot.js (WS-503). The lib keeps the ordering
// WS-502 established — ignore snapshot storage BEFORE capturing .gitignore, so
// the ignore line survives a rollback that retains the snapshot dir.
//
// `extraFiles` (WS-631) are individual files outside SNAPSHOT_DIRS that the
// upgrade will delete or rewrite — the pre-existing `.kit-update` sidecars.
// They sit wherever their live file sits (system/, .claude/rules/, the repo
// root), which is exactly where the dir list does not reach.
function createPreUpgradeSnapshot(repoPath, createdFiles, fromV, toV, extraFiles = []) {
  return repoSnapshot.createSnapshot(repoPath, {
    dirs: SNAPSHOT_DIRS,
    files: [...SNAPSHOT_FILES, ...extraFiles.filter(f => !SNAPSHOT_FILES.includes(f))],
    createdFiles,                 // did not exist pre-upgrade → delete on rollback
    prefix: SNAPSHOT_PREFIX,
    meta: { from_version: fromV, to_version: toV },
  });
}

// ADR-058 (WS-504): state/*.json is a per-node rebuildable cache. During
// upgrade, ship the gitignore block and untrack any previously git-tracked
// domain JSONs so multi-node clones stop conflicting on derived state.
// Idempotent; every step is non-fatal (repos without git, or already
// migrated, fall through silently).
const STATE_DOMAIN_FILES = ['config', 'engines', 'envelope', 'findings', 'programs', 'queue', 'sessions', 'sprints']
  .map(d => `.claude/workstream/state/${d}.json`);


function migrateStateCacheTracking(homebase, repoPath) {
  let untracked = [];
  try {
    const tpl = path.join(homebase, 'kit', 'templates', 'gitignore-cwos.txt');
    const gi = path.join(repoPath, '.gitignore');
    if (isFile(tpl)) {
      const block = fs.readFileSync(tpl, 'utf8');
      const cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
      if (!cur.includes('.claude/workstream/state/*.json')) {
        // Drop any managed line that would ignore a path this repo already
        // TRACKS. Measured 2026-08-23 in Claude-Poker-Tracker: appending the
        // block re-added `.claude/workstream/events/` to a repo holding 40
        // tracked event chunks, silently re-creating the condition that had
        // stranded 19 chunks (2,005 events, 1.3 MB) on a single machine —
        // nothing adds a chunk while the directory is ignored. The repo had
        // removed that rule four hours earlier as a recorded decision, and the
        // upgrade put it back without a word.
        //
        // This is INV-079's predicate run BEFORE the write instead of after.
        // Anything the repo does not track is unaffected, so a fresh adopt
        // still gets the full block.
        const kept = filterIgnoreLinesAgainstTracked(repoPath, block);
        fs.appendFileSync(gi, (cur.endsWith('\n') || !cur ? '' : '\n') + '\n' + kept);
      }
    }
  } catch { /* non-fatal */ }
  try {
    const ls = spawnSync('git', ['ls-files', '.claude/workstream/state'], { cwd: repoPath, encoding: 'utf8', timeout: 10000 });
    if (ls.status === 0) {
      const tracked = ls.stdout.split('\n').map(s => s.trim().replace(/\\/g, '/')).filter(Boolean)
        .filter(f => STATE_DOMAIN_FILES.includes(f));
      if (tracked.length > 0) {
        const rm = spawnSync('git', ['rm', '--cached', '--quiet', ...tracked], { cwd: repoPath, encoding: 'utf8', timeout: 10000 });
        if (rm.status === 0) untracked = tracked;
      }
    }
  } catch { /* non-fatal */ }
  return { untracked };
}

/**
 * WS-1141: put back index entries this run took out with `git rm --cached`.
 * The snapshot restores files, not the index, so a rolled-back upgrade used to
 * leave its untracking staged — the next commit in that repo deleted the files
 * from history. `git reset -- <paths>` restores each entry from HEAD and never
 * touches the working copy. Returns the paths it could not restore.
 * Restores the HEAD entry: a change someone had staged in one of these paths
 * before the upgrade is not brought back. They are machine-written files
 * (node-local stamps, the state cache), so that is accepted, not handled.
 */
function restoreIndex(repoPath, paths) {
  const failed = [];
  for (let i = 0; i < paths.length; i += 50) {
    const batch = paths.slice(i, i + 50);
    const r = spawnSync('git', ['reset', '-q', '--', ...batch], { cwd: repoPath, encoding: 'utf8', timeout: 10000 });
    if (r.status !== 0) failed.push(...batch);
  }
  return failed;
}

/**
 * WS-884: take the node-local files out of the index. Idempotent, non-fatal,
 * and it never touches the working copy — the files stay where they are and
 * regenerate on the next hook fire; only git stops carrying them. The
 * matching .gitignore lines arrive through the template's additive merge in
 * 3b, which is why this must run first (see the call site).
 */
function untrackNodeLocalFiles(repoPath) {
  let isNodeLocal;
  try { ({ isNodeLocal } = require('./lib/derived-state')); } catch { return { untracked: [] }; }
  try {
    const ls = spawnSync('git', ['ls-files', '-z', '--', '.claude/workstream'], { cwd: repoPath, encoding: 'utf8', timeout: 10000 });
    if (ls.status !== 0) return { untracked: [] };
    const tracked = String(ls.stdout || '').split(String.fromCharCode(0)).map(s => s.trim().split('\\').join('/')).filter(Boolean)
      .filter(isNodeLocal);
    for (let i = 0; i < tracked.length; i += 50) {
      spawnSync('git', ['rm', '--cached', '--quiet', '--', ...tracked.slice(i, i + 50)], { cwd: repoPath, encoding: 'utf8', timeout: 10000 });
    }
    if (tracked.length) {
      emitEvent('T6:workstream', 'node-local-untracked', { files: tracked.length, sample: tracked.slice(0, 8) });
    }
    return { untracked: tracked };
  } catch { return { untracked: [] }; }
}

const ensureGitignore = repoSnapshot.ensureGitignore;

function latestSnapshot(repoPath) {
  return repoSnapshot.latestSnapshot(repoPath, SNAPSHOT_PREFIX);
}

// `overlay` preserves this file's original semantics: copy the snapshot back
// over the current tree. Files ADDED inside a snapshotted dir survive, because
// the upgrade's own created_files list is what deletes them. (/adopt uses
// `replace` instead — it has no reliable created-file record after a crash.)
function restoreSnapshot(repoPath, snapDir) {
  return repoSnapshot.restoreSnapshot(repoPath, snapDir, {
    mode: 'overlay',
    defaultDirs: SNAPSHOT_DIRS,
    defaultFiles: SNAPSHOT_FILES,
  });
}

// ─── upgrade lifecycle markers (run-032 C2) ─────────────────────────────────
//
// The snapshot dir records how its upgrade ENDED, because the in-process
// auto-rollback only covers a gate that fails while this process is alive. The
// migrate subprocess runs up to 300 s, unlinks sidecars and overwrites kit
// files inside that window, and G16 dies on battery routinely: a kill there
// left a half-upgraded repo, a retained snapshot, and nothing telling anyone to
// roll back — the next run even printed "Already current" when the stamp had
// landed. Three files, exactly one terminal:
//
//   IN-PROGRESS.json  {pid, started_at, from, to}  written right after the snapshot
//   completed.json    {completed_at}               gate passed (C1's mtime basis)
//   rolled-back.json  {rolled_back_at, by, reason} a restore with zero errors
//
// An auto-rollback that hit restore errors leaves IN-PROGRESS in place on
// purpose: once this process exits its pid is dead, so the next run sees an
// interrupted upgrade, refuses --apply and authorises --rollback.
const MARKER_IN_PROGRESS = 'IN-PROGRESS.json';
const MARKER_COMPLETED = 'completed.json';
const MARKER_ROLLED_BACK = 'rolled-back.json';
// Past this, an IN-PROGRESS marker is interrupted even if its pid answers:
// Windows recycles pids, and no upgrade (migrate 300 s + gate) runs this long.
const INTERRUPTED_AFTER_MS = 600 * 1000;
// completed_at is stamped after the gate's own writes (reconcile, hook wiring)
// settle; anything newer than this slack is the founder's, not the upgrade's.
const CHANGED_SLACK_MS = 60 * 1000;

function writeMarker(snapDir, name, body) {
  writeFileAtomic(path.join(snapDir, name), JSON.stringify(body, null, 2) + '\n');
}
// Terminal markers are best-effort: losing one degrades C1's preview basis, it
// never blocks an upgrade that already succeeded or a restore that already ran.
function writeMarkerSafe(snapDir, name, body) {
  try { writeMarker(snapDir, name, body); return true; } catch { return false; }
}
function readMarker(snapDir, name) {
  try { return JSON.parse(fs.readFileSync(path.join(snapDir, name), 'utf8')); } catch { return null; }
}
function clearMarker(snapDir, name) {
  try { fs.unlinkSync(path.join(snapDir, name)); } catch { /* absent is the goal */ }
}
function readSnapshotManifest(snapDir) {
  try { return JSON.parse(fs.readFileSync(path.join(snapDir, 'manifest.json'), 'utf8')); } catch { return {}; }
}

function pidAlive(pid) {
  const n = Number(pid);
  if (!Number.isInteger(n) || n <= 0) return false;
  try { process.kill(n, 0); return true; }
  catch (e) { return e && e.code === 'EPERM'; } // EPERM: exists, not ours to signal
}

/**
 * Did the latest kit upgrade in this repo stop without finishing?
 *
 * Returns null when the latest snapshot carries no IN-PROGRESS marker (or a
 * terminal marker at least as new as it — the crash window between writing
 * completed.json and unlinking IN-PROGRESS). Otherwise
 *   { interrupted, reason, snapshot, pid, started_at, from, to, phase, age_ms }
 * where interrupted is true when the pid is gone or the marker is older than
 * INTERRUPTED_AFTER_MS; false means an upgrade is running right now.
 */
function interruptedUpgrade(repoPath, now = Date.now()) {
  const snap = latestSnapshot(repoPath);
  if (!snap) return null;
  const m = readMarker(snap, MARKER_IN_PROGRESS);
  if (!m) return null;
  const startedMs = Date.parse(m.started_at) || 0;
  for (const [name, key] of [[MARKER_COMPLETED, 'completed_at'], [MARKER_ROLLED_BACK, 'rolled_back_at']]) {
    const t = readMarker(snap, name);
    if (t && (Date.parse(t[key]) || 0) >= startedMs) return null;
  }
  const ageMs = now - startedMs;
  const alive = pidAlive(m.pid);
  const stale = ageMs > INTERRUPTED_AFTER_MS;
  return {
    interrupted: !alive || stale,
    reason: !alive ? `process ${m.pid} is gone` : (stale ? `started ${Math.round(ageMs / 60000)} min ago` : 'running now'),
    snapshot: snap, pid: m.pid, started_at: m.started_at, from: m.from, to: m.to,
    phase: m.phase || 'upgrade', age_ms: ageMs,
  };
}

// ─── snapshot pruning (WS-975) ──────────────────────────────────────────────
//
// Every upgrade leaves a full snapshot and nothing removed them: run-032 C13
// counted 15-25 per repo, 119 MB in one. Each old one is also a stale
// --rollback target waiting to be misread as current. After a successful
// upgrade we keep the newest KEEP_COMPLETED_SNAPSHOTS completed ones and drop
// older terminal ones. Never pruned, whatever their age:
//   - the newest snapshot (the --rollback target);
//   - any snapshot still carrying IN-PROGRESS (interrupted or running — it is
//     the only record that a repo may be half-upgraded);
//   - the snapshot whose upgrade produced the installed version.
// A dir without manifest.json (a capture that died midway) or a rolled-back
// snapshot is pruned only once a newer completed upgrade has superseded it.
const KEEP_COMPLETED_SNAPSHOTS = 3;

function pruneSnapshots(repoPath, opts = {}) {
  const keep = opts.keep == null ? KEEP_COMPLETED_SNAPSHOTS : opts.keep;
  const root = snapshotDirsRoot(repoPath);
  let names = [];
  try {
    names = fs.readdirSync(root)
      .filter(d => d.startsWith(SNAPSHOT_PREFIX) && isDir(path.join(root, d)))
      .sort();
  } catch { return { pruned: [], kept: [], errors: [] }; }
  const installed = opts.installed !== undefined ? opts.installed : readInstalledVersion(repoPath);

  const info = names.map(name => {
    const dir = path.join(root, name);
    const manifest = isFile(path.join(dir, 'manifest.json')) ? readSnapshotManifest(dir) : null;
    const completed = readMarker(dir, MARKER_COMPLETED);
    return {
      name, dir, manifest,
      completed: !!completed,
      inProgress: isFile(path.join(dir, MARKER_IN_PROGRESS)),
      to: (completed && completed.to) || (manifest && manifest.to_version) || null,
    };
  });

  const completedNewestFirst = info.filter(s => s.completed && !s.inProgress).reverse();
  const keptCompleted = new Set(completedNewestFirst.slice(0, keep).map(s => s.name));
  const oldestKept = completedNewestFirst.length >= keep && keep > 0
    ? completedNewestFirst[keep - 1].name : null;
  const newest = names[names.length - 1];

  const pruned = [], kept = [], errors = [];
  for (const s of info) {
    let protect = s.name === newest || s.inProgress || keptCompleted.has(s.name) ||
      (installed && s.completed && s.to === installed);
    // Not completed (rolled back, or no manifest): only once superseded by the
    // retained window, i.e. older than the oldest completed snapshot we keep.
    if (!protect && !s.completed) protect = !oldestKept || s.name > oldestKept;
    if (protect) { kept.push(s.name); continue; }
    try { fs.rmSync(s.dir, { recursive: true, force: true }); pruned.push(s.name); }
    catch (e) { errors.push({ snapshot: s.name, reason: e.message }); kept.push(s.name); }
  }
  return { pruned, kept, errors };
}

// Repo-relative files under `rel` (a file or a dir) whose mtime is past `basisMs`.
function filesNewerThan(repoPath, rel, basisMs, keep = () => true) {
  const out = [];
  const walk = (abs, r) => {
    let st;
    try { st = fs.statSync(abs); } catch { return; }
    if (st.isDirectory()) {
      let ents = [];
      try { ents = fs.readdirSync(abs); } catch { return; }
      for (const e of ents) {
        if (e === repoSnapshot.SNAPSHOT_ROOT || e === '.git' || e === 'node_modules') continue;
        walk(path.join(abs, e), `${r}/${e}`);
      }
    } else if (st.isFile() && st.mtimeMs > basisMs && keep(r)) {
      out.push(r);
    }
  };
  walk(path.join(repoPath, rel), rel);
  return out;
}

/**
 * What `--rollback` would do, and whether it may (run-032 C1).
 *
 * The old --rollback restored the latest snapshot unconditionally. Rolled back
 * days after a successful upgrade, that silently overwrote every program,
 * engine and state file written since with pre-upgrade bytes; run a second time
 * (or after an auto-rollback) it re-applied a snapshot whose upgrade was no
 * longer installed. A version check alone does not catch the first case, so the
 * plan carries both: a refusal when the snapshot's target is not what is
 * installed (unless IN-PROGRESS.json says the upgrade never finished — then the
 * stamp proves nothing and restoring is the point), and the list of files
 * changed since the upgrade finished, for the founder to see before --yes.
 *
 * Returns { snapshot, age_ms, from, to, interrupted, installed, refuse,
 *           will_delete, overlay_dirs, restore_files, changed_since_upgrade,
 *           changed_basis }.
 * The guard lives here, not in restoreSnapshot: the auto-rollback inside
 * applyUpgrade restores a snapshot it took seconds earlier and must not be
 * second-guessed by it.
 */
function planRollback(repoPath, now = Date.now()) {
  const snapshot = latestSnapshot(repoPath);
  if (!snapshot) return { snapshot: null, refuse: 'no kit-pre-upgrade snapshot found' };
  const manifest = readSnapshotManifest(snapshot);
  const createdMs = Date.parse(manifest.created_at) || 0;
  const inProgress = readMarker(snapshot, MARKER_IN_PROGRESS);
  const completed = readMarker(snapshot, MARKER_COMPLETED);
  const rolledBack = readMarker(snapshot, MARKER_ROLLED_BACK);
  const intr = interruptedUpgrade(repoPath, now);
  const installed = readInstalledVersion(repoPath);
  const from = manifest.from_version || null;
  const to = manifest.to_version || null;

  let refuse = null;
  if (!inProgress && installed !== to) {
    refuse = `the latest snapshot (${path.basename(snapshot)}) is the v${from || '?'} → v${to || '?'} upgrade, ` +
      `but v${installed || '?'} is installed` +
      (rolledBack ? ` — that upgrade was already rolled back (${rolledBack.rolled_back_at || 'time unknown'})` : '') +
      '. Restoring it now would overwrite newer work with older bytes.';
  }

  const exists = rel => fs.existsSync(path.join(repoPath, rel));
  const inSnap = rel => fs.existsSync(path.join(snapshot, rel));
  const willDelete = [
    ...(manifest.created_files || []).filter(rel => isFile(path.join(repoPath, rel))),
    ...(manifest.absent_files || []).filter(exists),
    ...(manifest.absent_dirs || []).filter(exists).map(rel => rel + '/'),
  ];
  const overlayDirs = (manifest.snapshot_dirs || []).filter(rel => isDir(path.join(snapshot, rel)));
  const restoreFiles = (manifest.snapshot_files || []).filter(rel => isFile(path.join(snapshot, rel)));

  // Basis: the upgrade's own completion stamp. Without one (an interrupted run,
  // or a snapshot taken before these markers existed) the upgrade's writes ran
  // for at most INTERRUPTED_AFTER_MS past its start.
  const startMs = (inProgress && Date.parse(inProgress.started_at)) || createdMs;
  const basisMs = completed && Date.parse(completed.completed_at)
    ? Date.parse(completed.completed_at) + CHANGED_SLACK_MS
    : startMs + INTERRUPTED_AFTER_MS;
  // Only what the restore would actually wipe: an overlay keeps a file the
  // snapshot never held, so a newer file there is not at risk and not listed.
  const changed = new Set();
  for (const rel of overlayDirs) filesNewerThan(repoPath, rel, basisMs, inSnap).forEach(f => changed.add(f));
  for (const rel of restoreFiles) filesNewerThan(repoPath, rel, basisMs).forEach(f => changed.add(f));
  for (const rel of [...(manifest.created_files || []), ...(manifest.absent_files || []), ...(manifest.absent_dirs || [])]) {
    filesNewerThan(repoPath, rel, basisMs).forEach(f => changed.add(f));
  }

  return {
    snapshot, age_ms: createdMs ? now - createdMs : null, from, to,
    interrupted: !!(intr && intr.interrupted), installed, refuse,
    will_delete: willDelete, overlay_dirs: overlayDirs, restore_files: restoreFiles,
    changed_since_upgrade: Array.from(changed).sort(),
    changed_basis: completed && completed.completed_at
      ? `upgrade completed ${completed.completed_at} (+60 s)`
      : `no completion marker — snapshot start + ${INTERRUPTED_AFTER_MS / 60000} min`,
  };
}

function renderRollbackPlan(plan) {
  const ago = plan.age_ms == null ? 'age unknown'
    : plan.age_ms < 3600000 ? `${Math.round(plan.age_ms / 60000)} min ago`
      : plan.age_ms < 172800000 ? `${Math.round(plan.age_ms / 3600000)} h ago`
        : `${Math.round(plan.age_ms / 86400000)} days ago`;
  const lines = [
    `Rollback plan: ${path.basename(plan.snapshot)} (v${plan.from || '?'} → v${plan.to || '?'}, taken ${ago})`,
    `  Installed now: v${plan.installed || '?'}${plan.interrupted ? '  — that upgrade was INTERRUPTED and never finished' : ''}`,
  ];
  const list = (arr, n) => arr.slice(0, n).map(r => `      ${r}`).concat(arr.length > n ? [`      … and ${arr.length - n} more`] : []);
  if (plan.will_delete.length) lines.push(`  Deletes ${plan.will_delete.length} path(s) the upgrade added:`, ...list(plan.will_delete, 10));
  lines.push(`  Overwrites from the snapshot: ${[...plan.overlay_dirs, ...plan.restore_files].join(', ') || 'nothing'}`);
  if (plan.changed_since_upgrade.length) {
    lines.push(`  ⚠ ${plan.changed_since_upgrade.length} file(s) changed AFTER the upgrade — the rollback replaces them with pre-upgrade bytes:`,
      ...list(plan.changed_since_upgrade, 25), `    (basis: ${plan.changed_basis})`);
  } else {
    lines.push(`  ✓ No file the rollback touches changed after the upgrade (basis: ${plan.changed_basis}).`);
  }
  return lines.join('\n');
}

// The in-apply rollback (gate failure, migrate failure). restoreSnapshot is
// called directly — planRollback's guard is for a founder rolling back later,
// not for the snapshot this same run took seconds ago. Returns restore_errors.
function autoRollback(repoPath, snapshot, reason, untracked = []) {
  const errs = restoreSnapshot(repoPath, snapshot).restore_errors || [];
  for (const p of restoreIndex(repoPath, untracked)) errs.push({ path: p, op: 'restore-index', reason: 'git reset failed' });
  if (!errs.length) {
    writeMarkerSafe(snapshot, MARKER_ROLLED_BACK, { rolled_back_at: new Date().toISOString(), by: 'auto', reason });
    clearMarker(snapshot, MARKER_IN_PROGRESS);
  }
  return errs;
}

// --rollback --yes, already under the upgrade lock.
function performRollback(repoPath, plan) {
  const prior = readMarker(plan.snapshot, MARKER_IN_PROGRESS);
  const untracked = prior && Array.isArray(prior.untracked) ? prior.untracked : [];
  const m = restoreSnapshot(repoPath, plan.snapshot);
  const errs = m.restore_errors || (m.restore_errors = []);
  for (const p of restoreIndex(repoPath, untracked)) errs.push({ path: p, op: 'restore-index', reason: 'git reset failed' });
  if (errs.length) {
    // Leave the repo flagged: an IN-PROGRESS marker newer than any terminal one
    // makes the next run refuse --apply and lets --rollback retry, which the
    // version check would otherwise refuse once .cwos-version came back.
    writeMarkerSafe(plan.snapshot, MARKER_IN_PROGRESS, {
      pid: process.pid, started_at: new Date().toISOString(), from: plan.from, to: plan.to,
      phase: 'rollback-incomplete', restore_errors: errs.length, untracked,
    });
  } else {
    writeMarkerSafe(plan.snapshot, MARKER_ROLLED_BACK, { rolled_back_at: new Date().toISOString(), by: 'manual', reason: '--rollback --yes' });
    clearMarker(plan.snapshot, MARKER_IN_PROGRESS);
  }
  return m;
}

// Run fn under the upgrade lock, keeping "could not get the lock" apart from
// "fn threw". run-032 found main() reporting ANY exception inside applyUpgrade
// — a restore that threw midway included — as "could not acquire upgrade lock
// (another upgrade running?)", sending the founder after a lock that was fine.
function underUpgradeLock(repoPath, fn) {
  const lockPath = path.join(repoPath, '.claude', 'workstream', '.kit-upgrade.lock');
  ensureDir(path.dirname(lockPath));
  let entered = false;
  try {
    const value = withFileLock(lockPath, () => { entered = true; return fn(); },
      { ownerLabel: 'kit-upgrade', maxWaitMs: 8000, staleAfterMs: 600000 });
    return { value };
  } catch (e) {
    return entered ? { error: e } : { lockError: e };
  }
}

// ─── spawning composed tools + validation gate ──────────────────────────────

function run(homebase, repoPath, scriptRel, args, opts = {}) {
  // prefer the repo's own (post-upgrade) copy for validation; else homebase's
  const repoScript = path.join(repoPath, scriptRel);
  const hbScript = path.join(homebase, scriptRel);
  const script = (opts.preferRepo && isFile(repoScript)) ? repoScript : (isFile(hbScript) ? hbScript : repoScript);
  if (!isFile(script)) return { ok: false, code: 127, stdout: '', stderr: `script not found: ${scriptRel}`, absent: true };
  const r = spawnSync('node', [script, ...args], { cwd: repoPath, encoding: 'utf8', timeout: 120000 });
  return { ok: r.status === 0, code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

// WS-544: require() every .js the repo actually has under kit/scripts/, each in
// its own child process so an import-time exit or side effect cannot corrupt the
// upgrade run. Scripts are guarded by `require.main === module`, so a clean load
// produces no output and does no work; a missing transitive dependency shows up
// here as MODULE_NOT_FOUND, which is exactly the breakage the old gate missed.
function requireSmokeCheck(repoPath) {
  const scriptsDir = path.join(repoPath, 'kit', 'scripts');
  if (!fs.existsSync(scriptsDir)) return { checked: 0, broken: [] };

  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === '__tests__' || e.name === 'node_modules') continue;
        walk(full);
      } else if (e.isFile() && e.name.endsWith('.js')) {
        files.push(full);
      }
    }
  })(scriptsDir);

  const broken = [];
  const noisy = [];
  for (const abs of files) {
    const r = spawnSync('node', ['-e', `require(${JSON.stringify(abs)})`], {
      cwd: repoPath, encoding: 'utf8', timeout: 20000,
    });
    if (r.status === 0) continue;

    const msg = (r.stderr || r.stdout || `exit ${r.status}`).trim();
    const line = msg.split('\n').find(l => /Error|Cannot find/.test(l)) || msg.split('\n')[0];
    const rec = { file: path.relative(repoPath, abs).split(path.sep).join('/'), error: line.slice(0, 140) };

    // Only a MODULE-RESOLUTION failure is a gate failure. A script that lacks a
    // `require.main === module` guard runs on import and exits non-zero with its
    // usage text — annoying, but not a missing dependency, and rolling an
    // upgrade back over it would be a false positive. Pre-WS-544 kits are full
    // of exactly those, so this distinction is what keeps the check usable.
    if (/Cannot find module|MODULE_NOT_FOUND/.test(msg)) broken.push(rec);
    else noisy.push(rec);
  }
  return { checked: files.length, broken, noisy };
}

// Each check returns { name, pass, detail }.
// `preUnresolved` is the set of registry paths already broken BEFORE the upgrade;
// the gate fails the registry check only on paths the upgrade newly broke, so a
// pre-existing drift doesn't block (and silently roll back) an otherwise-clean upgrade.
function runValidationGate(homebase, repoPath, targetVersion, validateRegistryPaths, preUnresolved = new Set(), opts = {}) {
  const checks = [];

  // verifyOnly: the no-op "already current" path runs this gate purely to REPORT
  // health — it must not mutate the founder's live workstream. Use --dry-run so
  // reconcile computes drift without auto-promoting items / rewriting indexes.
  // The post-apply path (verifyOnly falsy) keeps write-mode reconcile to finalize
  // state consistency after the upgrade.
  const verifyOnly = opts.verifyOnly === true;
  const reconcileArgs = verifyOnly ? ['--quiet', '--dry-run'] : ['--quiet'];
  const reconcile = run(homebase, repoPath, 'kit/scripts/cwos-reconcile.js', reconcileArgs, { preferRepo: true });
  checks.push({ name: `reconcile ${reconcileArgs.join(' ')}`, pass: reconcile.code === 0, detail: reconcile.code === 0 ? 'clean' : (reconcile.stderr || reconcile.stdout || `exit ${reconcile.code}`).trim().slice(0, 200) });

  // gate: exit 0 (clear) or 1 (legit gate-block, e.g. token budget) both mean "ran"; 2/crash = fail
  const gate = run(homebase, repoPath, 'kit/scripts/cwos-next.js', ['gate'], { preferRepo: true });
  checks.push({ name: 'next gate', pass: gate.code === 0 || gate.code === 1, detail: `exit ${gate.code}` });

  const alloc = run(homebase, repoPath, 'kit/scripts/cwos-next.js', ['allocate-ws-id'], { preferRepo: true });
  let allocOk = false; try { allocOk = JSON.parse(alloc.stdout.trim()).ok === true; } catch { /* */ }
  checks.push({ name: 'allocate-ws-id (WS-040 guard)', pass: allocOk, detail: alloc.stdout.trim().slice(0, 120) });

  const pulse = run(homebase, repoPath, 'kit/scripts/cwos-pulse.js', ['overview'], { preferRepo: true });
  checks.push({ name: 'pulse overview', pass: pulse.code === 0 || pulse.absent, detail: pulse.absent ? 'script absent (skipped)' : `exit ${pulse.code}` });

  const audit = run(homebase, repoPath, 'kit/scripts/cwos-audit.js', ['focus', 'drift'], { preferRepo: true });
  checks.push({ name: 'audit focus drift', pass: audit.code === 0 || audit.absent, detail: audit.absent ? 'script absent (skipped)' : `exit ${audit.code}` });

  const reg = validateRegistryPaths(repoPath);
  const newlyBroken = reg.unresolved.filter(u => !preUnresolved.has(u.path));
  checks.push({
    name: 'registry path resolution',
    pass: newlyBroken.length === 0,
    detail: newlyBroken.length
      ? `${newlyBroken.length} NEWLY unresolved: ${newlyBroken.map(u => u.path).join(', ').slice(0, 160)}`
      : (reg.ok ? `${reg.checked} paths ok` : `${reg.unresolved.length} pre-existing unresolved (not introduced by upgrade)`),
  });

  // WS-544: load every shipped script. The gate above exercises reconcile /
  // next / pulse / audit and nothing else, which is why it reported 7/7 green
  // for a claude-poker-tracker upgrade that had just left four scripts unable
  // to require('./lib/cli'). Requiring each file in its own child process is
  // the cheapest check that would have caught it.
  const smoke = requireSmokeCheck(repoPath);
  checks.push({
    name: 'require smoke (every shipped script loads)',
    pass: smoke.broken.length === 0,
    detail: smoke.broken.length
      ? `${smoke.broken.length} script(s) fail at require(): ${smoke.broken.slice(0, 3).map(b => `${b.file} — ${b.error}`).join(' | ').slice(0, 220)}`
      : `${smoke.checked} script(s) resolve their dependencies`
        + (smoke.noisy.length ? ` (${smoke.noisy.length} unguarded script(s) ran on import — not a dependency fault)` : ''),
  });

  const stamped = readInstalledVersion(repoPath);
  checks.push({ name: 'version stamped', pass: stamped === targetVersion, detail: `${stamped} (want ${targetVersion})` });

  // Test seam: force a gate failure to exercise the auto-rollback path deterministically.
  if (process.env.CWOS_KITUPGRADE_FORCE_GATE_FAIL) {
    checks.push({ name: 'forced-failure (test seam)', pass: false, detail: 'CWOS_KITUPGRADE_FORCE_GATE_FAIL set' });
  }

  return { ok: checks.every(c => c.pass), checks };
}

// ─── output helpers ─────────────────────────────────────────────────────────

function emit(opts, human, payload) {
  if (opts.json) process.stdout.write(JSON.stringify(payload) + '\n');
  else process.stdout.write(human + '\n');
}

function printDiff(repoPath, classification, schemaPlan, localMods, baselineInfo, superseded = []) {
  const lines = [];
  const A = classification.new.length + classification.needsInstall.length;
  const M = classification.stock.length;
  const C = classification.customized.length;
  lines.push('');
  lines.push('Schema migrations (run on apply):');
  if (schemaPlan.program.steps.length) lines.push(`  • program schema: ${schemaPlan.program.from} → ${schemaPlan.program.to} (${schemaPlan.program.count} program(s), steps ${schemaPlan.program.steps.join(', ')})`);
  else lines.push('  • program schema: up to date');
  lines.push('  • state-store schema: brought current (idempotent)');
  lines.push('');
  const P = (classification.skipped || []).length;
  lines.push(`Files — ${M} overwrite, ${A} add, ${C} customized, ${P} preserved:`);
  const show = (label, arr) => arr.slice(0, 50).forEach(e => lines.push(`  [${label}] ${e.destination}`));

  // WS-559: report by DECLARED strategy, not just by bucket.
  //
  // The old report collapsed every customized file into one ".kit-update" line,
  // which was wrong in both directions once strategies started being honoured: a
  // CLAUDE.md merged in place and a rules file sidecarred are different
  // outcomes, and the founder has to act on one and not the other. Splitting on
  // merge_strategy is the only way this report can say which is which — and say
  // that the preserved files were left alone on purpose rather than missed.
  const byStrategy = (arr, value) => (arr || []).filter(e => (e.merge_strategy || 'overwrite') === value);
  show('overwrite', classification.stock);
  show('add', [...classification.new, ...classification.needsInstall]);
  show('preserve', byStrategy(classification.skipped, 'skip-if-exists'));
  show('merge', byStrategy(classification.customized, 'additive'));
  show('preamble', byStrategy(classification.customized, 'preamble-replace'));
  show('.kit-update', byStrategy(classification.customized, 'overwrite'));
  const total = M + A + C + P;
  if (total > 150) lines.push(`  … (${total} files total)`);
  lines.push('');
  // WS-1149: a destination spelled differently from a path the repo holds is
  // never written. Named here so the founder can pick one spelling.
  const X = (classification.caseCollisions || []);
  if (X.length) {
    lines.push(`${X.length} file(s) NOT written — each collides by case with a path the repo already holds`);
    lines.push('(on Windows and macOS the two spellings are one file). Keep one spelling with git mv, then re-run:');
    X.slice(0, 20).forEach(e => lines.push(`  [case-collision] ${e.destination}  (repo has ${e.collides_with})`));
    lines.push('');
  }
  if (P) {
    lines.push(`${P} file(s) are yours — seeded once at install and preserved, not overwritten.`);
    lines.push('');
  }
  // WS-631: a full overwrite answers the sidecar's offer, so the sidecar goes.
  // Said here because a file disappearing unannounced reads as loss; it is
  // captured in the pre-upgrade snapshot and a rollback restores it.
  if (superseded.length) {
    lines.push(`${superseded.length} stale .kit-update sidecar(s) will be retired — their live file is fully replaced with kit content:`);
    superseded.slice(0, 12).forEach(rel => lines.push(`  [retire] ${rel}`));
    if (superseded.length > 12) lines.push(`  … and ${superseded.length - 12} more`);
    lines.push('');
  }
  {
    // Preview only: the exact list depends on which scripts this upgrade installs,
    // so it is computed on apply by the repo's own installer (step 3i).
    lines.push('Claude Code hooks: any missing kit hook (session register/recovery, drift reconcile, git guard)');
    lines.push('  is APPENDED to .claude/settings.json on apply — existing hooks are never edited or removed.');
    lines.push('');
  }
  // WS-796: a strict subset of driftedScripts, printed FIRST and separately —
  // these are not drifted kit scripts, they are the repo's own work at a kit
  // filename, and the upgrade refuses on them rather than replacing them.
  const repoAuthored = classification.repoAuthoredScripts || [];
  if (repoAuthored.length) {
    lines.push(`${repoAuthored.length} file(s) at kit-owned paths are too large to be drift — the upgrade will REFUSE:`);
    repoAuthored.slice(0, 10).forEach(e => {
      const m = e.magnitude || {};
      lines.push(`  [refuse] ${e.destination}`);
      lines.push(`           ${m.currentLines} lines on disk vs ${m.referenceLines} in the ${m.referenceKind} (${e.reason})`);
    });
    if (repoAuthored.length > 10) lines.push(`  … and ${repoAuthored.length - 10} more`);
    lines.push('  kit/scripts/ is machinery and is replaced with no .kit-update sidecar (WS-557),');
    lines.push('  which is right for a drifted kit script and total for a file this size.');
    lines.push('  Move it out of kit/ and re-run, or pass --force-replace-scripts to replace it');
    lines.push(`  (the current file is copied to ${RESCUE_DIR}/ first).`);
    lines.push('');
  }
  const drifted = classification.driftedScripts || [];
  if (drifted.length) {
    // WS-557: these diverged from baseline but are machinery, so they are
    // replaced rather than sidecarred. Named here because a silent replace
    // would be its own invisible failure; the snapshot keeps the old copy.
    lines.push(`${drifted.length} script(s) diverged from baseline and will be REPLACED (not sidecarred):`);
    drifted.slice(0, 12).forEach(e => lines.push(`  [replace] ${e.destination}${e.reason === 'no-baseline' ? '  (not in baseline)' : ''}`));
    if (drifted.length > 12) lines.push(`  … and ${drifted.length - 12} more`);
    lines.push('  kit/scripts/ is machinery — holding one back strands the modules that call it.');
    lines.push('  Previous copies are retained in the pre-upgrade snapshot.');
    lines.push('');
  }
  if (localMods === null) {
    lines.push(`⚠ Local-mod baseline unavailable (no hashes-<version> manifest, no installed_files).`);
    lines.push(`  Customized files are still protected: cwos-migrate writes .kit-update sidecars (git-tag baseline).`);
  } else if (localMods.length) {
    lines.push(`⚠ Local kit modifications detected (baseline: ${baselineInfo}) — overwritten unless saved:`);
    for (const m of localMods.slice(0, 40)) lines.push(`  ${m.destination}\n      ${m.expected} → ${m.actual}`);
    if (localMods.length > 40) lines.push(`  … and ${localMods.length - 40} more`);
  } else {
    lines.push(`✓ No local kit modifications (baseline: ${baselineInfo}).`);
  }
  return lines.join('\n');
}

// ─── main ───────────────────────────────────────────────────────────────────

// WS-796: where a forced script replacement leaves the old file. cwos-migrate
// owns the name; this is the copy used in message text, overwritten from the
// resolved HomeBase's module below so the two can never disagree at runtime.
let RESCUE_DIR = 'rescued-from-kit-upgrade';

function parseArgs(argv) {
  const o = { repo: null, homebase: null, apply: false, rollback: false, json: false, yes: false, forceReplaceScripts: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--homebase' && argv[i + 1]) o.homebase = argv[++i];
    else if (a === '--apply') o.apply = true;
    else if (a === '--rollback') o.rollback = true;
    else if (a === '--json') o.json = true;
    else if (a === '--yes' || a === '-y') o.yes = true;
    // WS-796: forwarded to cwos-migrate's Guard E. Not a general 'yes' —
    // --yes confirms an upgrade you already understand; this one asserts that
    // a file which does not look like a kit script should be replaced anyway.
    else if (a === '--force-replace-scripts') o.forceReplaceScripts = true;
    else if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
    else if (!a.startsWith('--') && !o.repo) o.repo = a;
  }
  return o;
}

function printUsage() {
  process.stdout.write([
    'Usage: cwos-kit-upgrade.js [<repo-path>] --homebase <path> [--apply]',
    '       cwos-kit-upgrade.js [<repo-path>] --rollback [--yes]',
    '',
    'Default is DRY RUN (shows the full diff, writes nothing). Pass --apply to upgrade.',
    '',
    '  --homebase <path>         HomeBase root that sources the new kit',
    '  --apply                   perform the upgrade (snapshot, lock, gate, auto-rollback)',
    '  --rollback                PREVIEW restoring the latest pre-upgrade snapshot: what it',
    '                            deletes, what it overwrites, and every file changed since',
    '                            the upgrade finished. Writes nothing. Refused when the',
    '                            installed version is not the one that snapshot upgraded to.',
    '  --yes                     with --rollback: perform the restore',
    '  --json                    machine-readable summary',
    '  --force-replace-scripts   replace repo-authored files at kit/scripts/ paths',
    '                            (refused by default; copies them to rescued-from-kit-upgrade/)',
    '',
    'Exit: 0 ok/preview, 1 error or INCOMPLETE rollback, 3 missing schema migrator,',
    '      4 gate failed (auto-rolled back), 5 an earlier upgrade was interrupted',
    '      (preview --rollback), 6 repo-authored kit/scripts file, 7 rollback refused.',
  ].join('\n') + '\n');
}

function fail(opts, code, msg) {
  if (opts.json) process.stdout.write(JSON.stringify({ ok: false, error: msg }) + '\n');
  else process.stderr.write(`ERROR: ${msg}\n`);
  process.exit(code);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const repoPath = path.resolve(opts.repo || process.cwd());
  if (!isDir(repoPath)) return fail(opts, 1, `repo path does not exist: ${repoPath}`);

  // ── rollback mode: preview by default, --yes to act (run-032 C1) ──
  if (opts.rollback) return rollbackMode(opts, repoPath);

  if (!fs.existsSync(path.join(repoPath, '.cwos-version'))) {
    return fail(opts, 1, 'no .cwos-version in repo — use /adopt for a fresh install, not /kit-upgrade');
  }

  // ── an earlier upgrade that never finished (run-032 C2) ──
  // Checked before Phase 0 on purpose: a run killed after migrate stamped the
  // new version would otherwise report "Already current" over a half-upgrade.
  const interrupted = interruptedUpgrade(repoPath);
  if (interrupted && interrupted.interrupted) {
    const what = interrupted.phase === 'rollback-incomplete'
      ? `a rollback of the v${interrupted.from || '?'} → v${interrupted.to || '?'} upgrade did not complete`
      : `the v${interrupted.from || '?'} → v${interrupted.to || '?'} upgrade started ${interrupted.started_at} never finished (${interrupted.reason})`;
    const next = 'Preview the restore with `node kit/scripts/cwos-kit-upgrade.js --rollback`, then run it with `--rollback --yes`.';
    if (opts.apply) {
      return fail(opts, 5, `refusing to upgrade: ${what} — this repo may be half-upgraded. ${next} Nothing was modified.`);
    }
    process.stderr.write(`⚠ ${what} — this repo may be half-upgraded. ${next}\n`);
  }

  const homebase = resolveHomeBase(opts.homebase, repoPath);
  if (!homebase || !looksLikeHomeBase(homebase)) {
    return fail(opts, 1, 'could not resolve HomeBase source — pass --homebase "<path to Claude HomeBase>"');
  }
  if (path.resolve(homebase) === repoPath) {
    return fail(opts, 1, 'HomeBase source and target repo are the same path — pass --homebase explicitly');
  }

  // require the NEWEST composed logic from the resolved HomeBase
  let migrate, validateRegistryPaths, loadManifest;
  try {
    migrate = require(path.join(homebase, 'kit', 'scripts', 'cwos-migrate.js'));
    ({ validateRegistryPaths } = require(path.join(homebase, 'kit', 'scripts', 'lib', 'cwos-registry-paths.js')));
    ({ loadManifest } = require(path.join(homebase, 'kit', 'scripts', 'cwos-adopt-install.js')));
  } catch (e) {
    return fail(opts, 1, `could not load HomeBase upgrade modules: ${e.message}`);
  }
  if (migrate.RESCUE_DIR) RESCUE_DIR = migrate.RESCUE_DIR;

  const installedVersion = readInstalledVersion(repoPath);
  const targetVersion = readKitVersion(homebase);
  if (!installedVersion) return fail(opts, 1, 'could not read installed kit version from .cwos-version');

  // ── Phase 0: idempotent no-op ──
  if (installedVersion === targetVersion) {
    // verifyOnly: a "gap check" on an already-current repo must not mutate live state.
    const gate = runValidationGate(homebase, repoPath, targetVersion, validateRegistryPaths, undefined, { verifyOnly: true });
    emit(opts,
      `Already current: kit v${installedVersion} == HomeBase v${targetVersion}. No changes.\n` +
      `Health: ${gate.ok ? 'all checks pass ✓' : 'WARNINGS — ' + gate.checks.filter(c => !c.pass).map(c => c.name).join(', ')}`,
      { ok: true, noop: true, installed: installedVersion, target: targetVersion, gate });
    return;
  }

  // ── Phase 1: schema sequencing (refuse if an intermediate migrator is missing) ──
  const minProg = detectMinProgramSchema(repoPath);
  const tgtProg = targetProgramSchema(homebase);
  const progChain = (minProg !== null && minProg < tgtProg)
    ? resolveSchemaChain(minProg, tgtProg, migrate.SCHEMA_MIGRATIONS)
    : { steps: [], missing: [] };
  if (progChain.missing.length) {
    return fail(opts, 3, `cannot stage upgrade — missing program-schema migrator(s): ${progChain.missing.join(', ')}. ` +
      `Add them to SCHEMA_MIGRATIONS in kit/scripts/cwos-migrate.js before upgrading.`);
  }

  // ── Phase 2: classify + local-mod detection ──
  const manifestFiles = loadManifest(homebase);
  const classification = migrate.classifyFiles(repoPath, homebase, installedVersion);
  const baseline = loadHashBaseline(homebase, repoPath, installedVersion);
  const localMods = detectLocalMods(homebase, repoPath, manifestFiles, baseline);
  const baselineInfo = baseline ? baseline.source : 'unavailable';

  const schemaPlan = {
    program: { from: minProg === null ? 'n/a' : minProg, to: tgtProg, steps: progChain.steps, count: countProgsBelow(repoPath, tgtProg) },
  };

  const header = `Kit upgrade: ${path.basename(repoPath)} (v${installedVersion} → v${targetVersion})${opts.apply ? '' : '  [DRY RUN]'}\nSource: ${homebase}`;
  const superseded = supersededSidecars(repoPath, classification, migrate);

  if (!opts.apply) {
    const diff = printDiff(repoPath, classification, schemaPlan, localMods, baselineInfo, superseded);
    emit(opts, header + '\n' + diff + '\n\nRun with --apply to upgrade (snapshot + auto-rollback on gate failure).',
      { ok: true, dry_run: true, installed: installedVersion, target: targetVersion,
        files: { overwrite: classification.stock.length, add: classification.new.length + classification.needsInstall.length, customized: classification.customized.length },
        superseded_sidecars: superseded,
        drifted_scripts: (classification.driftedScripts || []).map(e => ({ destination: e.destination, reason: e.reason })),
        case_collisions: (classification.caseCollisions || []).map(e => ({ destination: e.destination, collides_with: e.collides_with })),
        schema: schemaPlan, local_mods: localMods, baseline: baselineInfo,
        interrupted_upgrade: interrupted && interrupted.interrupted ? interrupted : null });
    return;
  }

  // ── WS-796 Guard E, host side ──
  // cwos-migrate refuses on this too, but it runs as a subprocess AFTER the
  // pre-upgrade snapshot — that path is a gate failure and a rollback, which is
  // recoverable but reads as a crash. Refusing here, before anything is
  // written, makes it what it is: a decision waiting on the operator.
  const repoAuthoredScripts = classification.repoAuthoredScripts || [];
  if (repoAuthoredScripts.length && !opts.forceReplaceScripts) {
    return fail(opts, 6,
      `refusing to upgrade: ${repoAuthoredScripts.length} file(s) at kit-owned paths are too far from baseline to be drift — ` +
      repoAuthoredScripts.slice(0, 5).map(e => {
        const m = e.magnitude || {};
        return `${e.destination} (${m.currentLines} lines vs ${m.referenceLines} in the ${m.referenceKind})`;
      }).join('; ') +
      (repoAuthoredScripts.length > 5 ? `; and ${repoAuthoredScripts.length - 5} more` : '') +
      `. kit/scripts/ is machinery and is replaced with no sidecar (WS-557). Move the file out of kit/ and re-run, ` +
      `or pass --force-replace-scripts to replace it (the current file is copied to ${RESCUE_DIR}/ first). Nothing was modified.`);
  }

  // ── Phase 3: APPLY under lock ──
  const progress = { snapshot: null };
  const locked = underUpgradeLock(repoPath, () => applyUpgrade({
    opts, repoPath, homebase, installedVersion, targetVersion,
    classification, migrate, validateRegistryPaths, progChain, progress,
  }));
  if (locked.lockError) {
    return fail(opts, 1, `could not acquire upgrade lock (another upgrade running?): ${locked.lockError.message}`);
  }
  if (locked.error) {
    return fail(opts, 1, progress.snapshot
      ? `upgrade CRASHED mid-apply: ${locked.error.message}. No automatic rollback ran — the repo may be half-upgraded. ` +
        `Preview the restore with --rollback, then run --rollback --yes (snapshot ${path.basename(progress.snapshot)}).`
      : `upgrade CRASHED before the pre-upgrade snapshot: ${locked.error.message}. Nothing was upgraded.`);
  }
  const result = locked.value;

  if (!result.ok) {
    const restoreErrors = result.restoreErrors || [];
    const gateDetail = `\n\nGate detail:\n` +
      result.gate.checks.map(c => `  ${c.pass ? '✓' : '✗'} ${c.name} — ${c.detail}`).join('\n');
    // run-032 C7: "Repo restored" is said only when every path restored.
    const restoredLine = restoreErrors.length
      ? `  ✗ rollback INCOMPLETE (${restoreErrors.length} path(s) could not be restored):\n` +
        restoreErrors.slice(0, 10).map(e => `      ${e.path} — ${e.op}: ${e.reason}`).join('\n') +
        (restoreErrors.length > 10 ? `\n      … and ${restoreErrors.length - 10} more` : '') +
        `\n  The repo is NOT back at v${installedVersion}. Fix the paths above (close whatever holds them), then preview\n` +
        `  the restore with --rollback and run it with --rollback --yes.`
      : `  Repo restored to v${installedVersion}.`;
    emit(opts,
      `${header}\n\n✗ Upgrade FAILED at gate check: ${result.failedCheck}\n  → auto-rollback from pre-upgrade snapshot (${path.basename(result.snapshot)}).\n${restoredLine}` + gateDetail,
      { ok: false, applied: false, rolled_back: restoreErrors.length === 0, rollback_incomplete: restoreErrors.length > 0,
        restore_errors: restoreErrors, failed_check: result.failedCheck, snapshot: path.basename(result.snapshot), gate: result.gate });
    process.exit(4);
  }

  emit(opts,
    `${header}\n\n✓ Upgrade complete: v${installedVersion} → v${targetVersion}.\n  Snapshot: ${path.basename(result.snapshot)} (retained)\n  Gate: all ${result.gate.checks.length} checks passed.` +
    (classification.customized.length ? `\n\n  Action: answer ${classification.customized.length} .kit-update sidecar(s) — take, decline or defer each, with the reason recorded:\n    node kit/scripts/cwos-sidecar.js list` : '') +
    ((classification.caseCollisions || []).length ? `\n\n  NOT written: ${classification.caseCollisions.length} kit file(s) collide by case with a path this repo holds (WS-1149). Keep one spelling with git mv, then re-run:` +
      classification.caseCollisions.map(e => `\n    ${e.destination}  (repo has ${e.collides_with})`).join('') : '') +
    (superseded.length ? `\n  Retired: ${superseded.length} stale .kit-update sidecar(s) whose live file was fully replaced (copies in the snapshot).` : '') +
    ((classification.driftedScripts || []).length ? `\n  Note: ${classification.driftedScripts.length} diverged script(s) were replaced; previous copies are in the snapshot.` : '') +
    ((result.snapshotsPruned || []).length ? `\n  Pruned: ${result.snapshotsPruned.length} older snapshot(s) — the newest ${KEEP_COMPLETED_SNAPSHOTS} completed ones are kept.` : '') +
    ((result.hooksWired || []).length ? `\n  Hooks: wired ${result.hooksWired.length} kit Claude Code hook(s) into .claude/settings.json (appended; your own hooks untouched).` : '') +
    (result.hooksError ? `\n  Hooks: NOT wired — ${result.hooksError}. Run \`node kit/scripts/install-claude-hooks.mjs --check\`.` : ''),
    { ok: true, applied: true, installed: installedVersion, target: targetVersion, snapshot: path.basename(result.snapshot), gate: result.gate,
      snapshots_pruned: result.snapshotsPruned || [],
      claude_hooks_wired: result.hooksWired || [], claude_hooks_error: result.hooksError || null,
      kit_update_sidecars: classification.customized.map(e => e.destination + '.kit-update'),
      superseded_sidecars: superseded,
      drifted_scripts: (classification.driftedScripts || []).map(e => ({ destination: e.destination, reason: e.reason })),
      case_collisions: (classification.caseCollisions || []).map(e => ({ destination: e.destination, collides_with: e.collides_with })) });
}

// --rollback [--yes]. Preview is the default because the restore is an
// overlay of the whole authored surface: rolled back days later it replaces
// every program, engine and state file written since (run-032 C1).
function rollbackMode(opts, repoPath) {
  const plan = planRollback(repoPath);
  if (!plan.snapshot) return fail(opts, 1, plan.refuse);
  const human = renderRollbackPlan(plan);

  if (plan.refuse) {
    if (opts.json) process.stdout.write(JSON.stringify({ ok: false, rolled_back: false, refused: plan.refuse, plan }) + '\n');
    else process.stderr.write(`${human}\n\nREFUSED: ${plan.refuse}\n  Nothing was changed. If a newer upgrade went wrong, run /kit-upgrade again rather than restoring an older snapshot.\n`);
    process.exit(7);
  }

  if (!opts.yes) {
    emit(opts, `${human}\n\nPreview only — nothing was changed. To restore: node kit/scripts/cwos-kit-upgrade.js --rollback --yes`,
      { ok: true, rolled_back: false, preview: true, plan });
    return;
  }

  const locked = underUpgradeLock(repoPath, () => performRollback(repoPath, plan));
  if (locked.lockError) return fail(opts, 1, `could not acquire upgrade lock (another upgrade running?): ${locked.lockError.message}`);
  if (locked.error) {
    return fail(opts, 1, `rollback CRASHED: ${locked.error.message}. The snapshot is retained (${path.basename(plan.snapshot)}); ` +
      'preview what is left with --rollback.');
  }
  const m = locked.value;
  const errs = m.restore_errors || [];
  if (errs.length) {
    emit(opts,
      `Rollback INCOMPLETE (${errs.length} path(s)) from ${path.basename(plan.snapshot)}:\n` +
      errs.slice(0, 20).map(e => `  ${e.path} — ${e.op}: ${e.reason}`).join('\n') +
      (errs.length > 20 ? `\n  … and ${errs.length - 20} more` : '') +
      '\nFix the paths above (close whatever holds them), then re-run --rollback --yes. Snapshot retained.',
      { ok: false, rolled_back: false, rollback_incomplete: true, restore_errors: errs, snapshot: path.basename(plan.snapshot) });
    process.exit(1);
  }
  emit(opts, `Rolled back to ${path.basename(plan.snapshot)} (was v${m.from_version || '?'} → v${m.to_version || '?'}). Snapshot retained.`,
    { ok: true, rolled_back: true, snapshot: path.basename(plan.snapshot), restored_to: m.from_version,
      overwrote_changed_since_upgrade: plan.changed_since_upgrade });
}

function countProgsBelow(repoPath, target) {
  const dir = path.join(repoPath, '.claude', 'workstream', 'programs');
  if (!isDir(dir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(dir)) {
    if (!/^prog-.*\.yaml$/.test(f) || f === 'registry.yaml') continue;
    const { ok, data } = readYAMLFile(path.join(dir, f));
    if (ok && data && data.id && (Number(data.schema_version) || 1) < target) n++;
  }
  return n;
}

// WS-631: sidecars the migrate subprocess will retire (full overwrite of the
// live file). Asked of the resolved HomeBase's cwos-migrate so the preview, the
// snapshot and the apply share one predicate; an older HomeBase without the
// export also does not retire, so [] is the honest answer there.
function supersededSidecars(repoPath, classification, migrate) {
  return migrate && typeof migrate.supersededSidecarCandidates === 'function'
    ? migrate.supersededSidecarCandidates(repoPath, classification) : [];
}

/**
 * What the pre-upgrade snapshot must record about `.kit-update` sidecars.
 *
 *   createdFiles  paths the upgrade CREATES, deleted on rollback: genuinely
 *                 new/needsInstall files, and a customized file's sidecar when
 *                 none stood there before.
 *   sidecarFiles  sidecars that EXIST now and the upgrade will rewrite
 *                 (customized refresh) or delete (superseded), captured and
 *                 restored on rollback.
 *
 * Before WS-631 every customized sidecar went into createdFiles, existing or
 * not. Inside SNAPSHOT_DIRS the dir restore happened to copy it back after the
 * delete; anywhere else (system/, .claude/rules/, the repo root) a rollback
 * deleted a sidecar that predated the upgrade and restored nothing — a failed
 * upgrade destroyed the one thing it promised to leave alone.
 */
function planSidecarSnapshot(repoPath, classification, superseded = []) {
  const systemDir = require('./lib/kit-artifacts').resolveSystemDir(repoPath);
  const destRel = e => String(e.destination || '').replace('{system_dir}', systemDir);
  const exists = rel => fs.existsSync(path.join(repoPath, rel));
  const customizedSidecars = classification.customized.map(e => destRel(e) + '.kit-update');
  const createdFiles = [
    ...[...classification.new, ...classification.needsInstall].map(destRel).filter(rel => !exists(rel)),
    ...customizedSidecars.filter(rel => !exists(rel)),
  ];
  // Every live file the upgrade overwrites (stock) or merges in place
  // (customized additive/preamble) that SNAPSHOT_DIRS does not already cover.
  // Measured 2026-09-30 on a deckside clone: a gate failure printed "Repo
  // restored to v3.40.0" while .claude/rules/testing-strategy.md and an
  // engines/library/ manifest stayed at the new kit's content — neither
  // directory is in SNAPSHOT_DIRS, so the rollback had nothing to restore.
  const covered = rel => SNAPSHOT_DIRS.some(d => rel === d || rel.startsWith(d + '/'));
  const overwritten = [...classification.stock, ...classification.customized]
    .map(destRel).filter(rel => rel && !covered(rel) && exists(rel));
  const sidecarFiles = Array.from(new Set([
    ...customizedSidecars.filter(exists),
    ...superseded.filter(exists),
    ...overwritten,
  ]));
  return { createdFiles, sidecarFiles };
}

function applyUpgrade(ctx) {
  const { opts, repoPath, homebase, installedVersion, targetVersion, classification, migrate, validateRegistryPaths } = ctx;

  const { createdFiles, sidecarFiles } = planSidecarSnapshot(repoPath, classification, supersededSidecars(repoPath, classification, migrate));
  // 3i writes .claude/settings.json. Snapshot it when it exists (rollback
  // restores the adopter's own hook chain byte-for-byte); mark it created when
  // it does not (rollback removes the file the upgrade made).
  if (fs.existsSync(path.join(repoPath, CLAUDE_SETTINGS))) sidecarFiles.push(CLAUDE_SETTINGS);
  else createdFiles.push(CLAUDE_SETTINGS);

  // registry paths already broken before we touch anything — the gate must not
  // fail (and roll back) on drift that was pre-existing.
  const preUnresolved = new Set(validateRegistryPaths(repoPath).unresolved.map(u => u.path));

  // 3a. comprehensive pre-upgrade snapshot (the rollback source of truth)
  const snapshot = createPreUpgradeSnapshot(repoPath, createdFiles, installedVersion, targetVersion, sidecarFiles);
  if (ctx.progress) ctx.progress.snapshot = snapshot;
  // run-032 C2: from here until a terminal marker, a dead process means a
  // half-upgraded repo. Unguarded on purpose — if even this write fails, stop
  // before the first repo mutation rather than run an upgrade nobody can detect.
  const progress = { pid: process.pid, started_at: new Date().toISOString(), from: installedVersion, to: targetVersion };
  writeMarker(snapshot, MARKER_IN_PROGRESS, progress);
  // WS-1141: the marker carries what this run untracked, so a manual --rollback
  // after a crash can put the index back too, not only the in-process rollback.
  const noteUntracked = () => {
    if (untracked.length) writeMarkerSafe(snapshot, MARKER_IN_PROGRESS, Object.assign({}, progress, { untracked }));
  };

  // 3h (WS-884) — runs BEFORE 3b on purpose. Node-local files (liveness stamps,
  // the recovery mutex, the test-sweep stamp, the invariant firing log, leaked
  // .lock/.tmp) are untracked here, so that 3b's additive .gitignore merge —
  // which refuses any line that would ignore a TRACKED file (INV-079's
  // predicate, run before the write) — can land the new template lines in the
  // same upgrade. Placed after 3g it would have left every repo one upgrade
  // behind: untracked-but-not-ignored, re-tracked by the next `git add -A`.
  // WS-1141: remembered so a rollback puts the index back, not just the files.
  const untracked = [...untrackNodeLocalFiles(repoPath).untracked];
  noteUntracked();

  // 3b. file apply + program v2→v3 + index rebuild + version stamp (the existing engine)
  const migArgs = [path.join(homebase, 'kit', 'scripts', 'cwos-migrate.js'), repoPath, '--homebase', homebase];
  // WS-796: Guard E lives in cwos-migrate and runs again in this subprocess.
  // Without the flag it would refuse here — after the snapshot, as a gate
  // failure and rollback. The decision was already made and reported above.
  if (opts.forceReplaceScripts) migArgs.push('--force-replace-scripts');
  const mig = spawnSync('node', migArgs,
    { cwd: repoPath, encoding: 'utf8', timeout: 300000 });
  if (mig.status !== 0) {
    const restoreErrors = autoRollback(repoPath, snapshot, 'cwos-migrate apply failed', untracked);
    return { ok: false, failedCheck: 'cwos-migrate apply (file/schema/stamp)', snapshot, restoreErrors, gate: { checks: [{ name: 'cwos-migrate', pass: false, detail: (mig.stderr || mig.stdout || `exit ${mig.status}`).trim().slice(0, 300) }] } };
  }

  // 3c. program v3 → v4 (the step cwos-migrate's main() doesn't run)
  for (const f of fs.readdirSync(path.join(repoPath, '.claude', 'workstream', 'programs'))) {
    if (!/^prog-.*\.yaml$/.test(f) || f === 'registry.yaml') continue;
    const fp = path.join(repoPath, '.claude', 'workstream', 'programs', f);
    const { ok, data } = readYAMLFile(fp);
    if (ok && data && (Number(data.schema_version) || 1) === 3) migrate.migrateSchemaV3ToV4(fp, data);
  }

  // 3d. state-store schema (idempotent)
  spawnSync('node', [path.join(homebase, 'kit', 'scripts', 'cwos-migrate.js'), '--state-schema', '--workstream-dir', path.join(repoPath, '.claude', 'workstream')],
    { cwd: repoPath, encoding: 'utf8', timeout: 60000 });

  // 3e. re-materialize registries (then validated by the gate's path-resolution loop)
  for (const s of ['cwos-program-registry-sync.js', 'cwos-engines-registry-sync.js']) {
    run(homebase, repoPath, `kit/scripts/${s}`, ['--path', repoPath, '--quiet', '--json'], { preferRepo: false });
  }

  // 3f. seed the adopter's local-mod baseline for NEXT time: copy HomeBase's
  // hashes-<target>.yaml into the repo (decision 3 — baseline lives in the
  // adopter as version-named local state, never MANIFEST-orphan-reaped).
  const hbHashes = path.join(homebase, 'kit', `hashes-${targetVersion}.yaml`);
  if (isFile(hbHashes)) {
    ensureDir(path.join(repoPath, 'kit'));
    fs.copyFileSync(hbHashes, path.join(repoPath, 'kit', `hashes-${targetVersion}.yaml`));
    // WS-560 (INV-028): this baseline is what the NEXT /kit-upgrade diffs local
    // modifications against. Seeding it unrecorded is how a repo ends up
    // reporting zero local mods against a baseline nobody can date.
    emitEvent('T6:workstream', 'kit-baseline-seeded', { version: targetVersion });
  }

  // 3g. ADR-058 state-cache migration: gitignore block + untrack domain JSONs.
  // Runs after 3d's state-schema migration and before the gate; the snapshot
  // from 3a now includes .claude/workstream/state, so rollback restores the
  // pre-migration tracking state cleanly.
  untracked.push(...migrateStateCacheTracking(homebase, repoPath).untracked);
  noteUntracked();

  // 3i (WS-514). Wire the kit's Claude Code hooks — session registration,
  // abandoned-session recovery, drift reconcile, the git guard. Until this step
  // nothing ran the installer, so those scripts reached every adopter and their
  // hooks reached none: ServeYourNote still had no .current-session two months
  // after the fix shipped. The REPO's copy runs (preferRepo), so the hook list
  // is the one this upgrade just installed. Append-only by construction, and
  // non-fatal: a hook that could not be wired is reported, never a rollback.
  const hooks = run(homebase, repoPath, 'kit/scripts/install-claude-hooks.mjs', [], { preferRepo: true });
  const hooksWired = hooks.stdout.split('\n').filter(l => /^\s+\+ /.test(l)).map(l => l.trim().slice(2));
  if (hooksWired.length) emitEvent('T6:workstream', 'claude-hooks-wired', { count: hooksWired.length, hooks: hooksWired });

  // ── Phase 4: validation gate ──
  const gate = runValidationGate(homebase, repoPath, targetVersion, validateRegistryPaths, preUnresolved);
  if (!gate.ok) {
    // ── Phase 5 (failure): AUTO-rollback ──
    const failed = gate.checks.find(c => !c.pass);
    const restoreErrors = autoRollback(repoPath, snapshot, `gate failed: ${failed ? failed.name : 'unknown'}`, untracked);
    return { ok: false, failedCheck: failed ? failed.name : 'unknown', snapshot, gate, restoreErrors };
  }
  // Terminal marker first, then clear IN-PROGRESS: a crash between the two
  // leaves both, and interruptedUpgrade lets the newer terminal one win.
  writeMarkerSafe(snapshot, MARKER_COMPLETED, { completed_at: new Date().toISOString(), from: installedVersion, to: targetVersion });
  clearMarker(snapshot, MARKER_IN_PROGRESS);
  // WS-975: only after the terminal marker, so this run's snapshot counts as
  // completed. Best-effort — a prune that fails never fails an upgrade.
  let snapshotsPruned = [];
  try { snapshotsPruned = pruneSnapshots(repoPath, { installed: targetVersion }).pruned; } catch { /* keep going */ }
  return {
    ok: true, snapshot, gate, hooksWired, snapshotsPruned,
    hooksError: hooks.ok ? null : (hooks.stderr || hooks.stdout || `exit ${hooks.code}`).trim().split('\n')[0],
  };
}

module.exports = {
  resolveSchemaChain, detectMinProgramSchema, targetProgramSchema,
  loadHashBaseline, detectLocalMods, createPreUpgradeSnapshot, restoreSnapshot,
  latestSnapshot, runValidationGate, readInstalledVersion, copyTree,
  requireSmokeCheck, lineEndingVariantHashes, planSidecarSnapshot,
  filterIgnoreLinesAgainstTracked, untrackNodeLocalFiles, restoreIndex,
  planRollback, interruptedUpgrade, pruneSnapshots, KEEP_COMPLETED_SNAPSHOTS,
  MARKER_IN_PROGRESS, MARKER_COMPLETED, MARKER_ROLLED_BACK,
};

if (require.main === module) main();
