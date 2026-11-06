/**
 * repo-snapshot.js — pre-mutation snapshot + restore for repo-wide operations.
 *
 * Generalized from cwos-kit-upgrade.js, which pioneered the mechanism ("never a
 * half-upgrade"): capture the surfaces an operation is about to overwrite, and
 * on failure put them back exactly. WS-503 extends the same contract to /adopt,
 * whose crash mode is worse — it mutates CLAUDE.md at Phase 3 but writes the
 * .cwos-version marker at Phase 7, so a crash between them leaves a half-adopted
 * repo that --repair refuses to touch.
 *
 * Two restore modes, because the two callers need different semantics:
 *
 *   overlay  — copy the snapshot back over the current tree (kit-upgrade).
 *              Files ADDED inside a snapshotted dir survive. Correct there:
 *              the upgrade's own created-file list drives their deletion.
 *   replace  — delete each snapshotted dir, then restore it (adopt). Files added
 *              during the failed run are pruned. Correct there: adopt creates
 *              hundreds of files across .claude/ and kit/ with no reliable
 *              on-disk record after a crash.
 *
 * Either way, paths recorded as absent at snapshot time are DELETED on restore —
 * that is what returns a virgin repo to virgin.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SNAPSHOT_ROOT = '.cwos-snapshots';

// ─── small fs helpers (Node floor is v14 — no fs.cpSync) ────────────────────

function isFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function copyTree(srcDir, dstDir) {
  ensureDir(dstDir);
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(dstDir, ent.name);
    if (ent.isDirectory()) {
      // never recurse into snapshot storage or VCS internals
      if (ent.name === SNAPSHOT_ROOT || ent.name === '.git' || ent.name === 'node_modules') continue;
      copyTree(s, d);
    } else if (ent.isFile()) {
      ensureDir(path.dirname(d));
      fs.copyFileSync(s, d);
    }
  }
}

function snapshotRoot(repoPath) { return path.join(repoPath, SNAPSHOT_ROOT); }

/**
 * Ignore snapshot storage. Runs BEFORE .gitignore is captured (WS-502): a
 * restore retains the snapshot dir, so the ignore line has to survive with it —
 * capturing first would revert .gitignore to a state leaving the retained
 * snapshot untracked-and-unignored, i.e. committable by accident.
 */
function ensureGitignore(repoPath) {
  const gi = path.join(repoPath, '.gitignore');
  try {
    const cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
    if (!cur.includes(SNAPSHOT_ROOT)) {
      fs.appendFileSync(gi, (cur.endsWith('\n') || !cur ? '' : '\n') + SNAPSHOT_ROOT + '/\n');
    }
  } catch { /* non-fatal */ }
}

/**
 * Capture `dirs` and `files` (repo-relative) under .cwos-snapshots/<prefix><ts>/.
 *
 * @param {string} repoPath
 * @param {object} opts
 * @param {string[]} opts.dirs         repo-relative dirs to capture
 * @param {string[]} opts.files        repo-relative files to capture
 * @param {string[]} [opts.createdFiles] files the operation will create → deleted on restore
 * @param {string}   [opts.prefix]     snapshot dir name prefix
 * @param {object}   [opts.meta]       extra manifest fields (from_version, etc.)
 * @returns {string} absolute path to the snapshot directory
 */
function createSnapshot(repoPath, opts = {}) {
  const dirs = opts.dirs || [];
  const files = opts.files || [];
  const prefix = opts.prefix || 'snapshot-';
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const root = path.join(snapshotRoot(repoPath), `${prefix}${ts}`);
  ensureDir(root);

  ensureGitignore(repoPath); // before capture — see the note on the function

  // Paths absent right now are deleted on restore, which is how a virgin repo
  // returns to virgin after a failed adopt.
  const absentDirs = [];
  const absentFiles = [];

  for (const rel of dirs) {
    const src = path.join(repoPath, rel);
    if (isDir(src)) copyTree(src, path.join(root, rel));
    else absentDirs.push(rel);
  }
  for (const rel of files) {
    const src = path.join(repoPath, rel);
    if (isFile(src)) {
      ensureDir(path.join(root, path.dirname(rel)));
      fs.copyFileSync(src, path.join(root, rel));
    } else if (!fs.existsSync(src)) {
      absentFiles.push(rel);
    }
    // else: something that is not a file stands there (a directory named
    // CLAUDE.md). It is not absent, so a restore must not delete it — the old
    // code recorded it as absent and only got away with it because the rmSync
    // that failed on it was swallowed (run-032 C7 made restores report errors).
  }

  const manifest = Object.assign({
    created_at: new Date().toISOString(),
    snapshot_dirs: dirs,
    snapshot_files: files,
    absent_dirs: absentDirs,
    absent_files: absentFiles,
    created_files: opts.createdFiles || [],
  }, opts.meta || {});
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return root;
}

/**
 * Put the repo back the way createSnapshot() found it.
 *
 * Every path is attempted, and every failure is RECORDED rather than swallowed
 * or thrown. run-032 (C7) found the old shape wrong in both directions: steps
 * 1-2 caught and discarded each error, so a delete that failed left a file the
 * failed upgrade created while the caller printed "Repo restored"; steps 3-4
 * did not catch at all, so ONE unwritable path (a file whose destination had
 * become a directory, a handle held open on Win32) aborted the restore midway
 * — every path after it never restored — and cwos-kit-upgrade's main() then
 * reported the throw as "could not acquire upgrade lock". A partial restore is
 * survivable only when it is named, so the caller gets the list.
 *
 * @param {string} repoPath
 * @param {string} snapDir
 * @param {object} [opts]
 * @param {'overlay'|'replace'} [opts.mode='overlay']
 * @param {string[]} [opts.defaultDirs]  used when the manifest is unreadable
 * @param {string[]} [opts.defaultFiles]
 * @returns {object} the manifest that drove the restore, plus
 *   `restore_errors: [{ path, op, reason }]` — empty means every path restored.
 */
function restoreSnapshot(repoPath, snapDir, opts = {}) {
  const mode = opts.mode || 'overlay';
  const errors = [];
  const attempt = (rel, op, fn) => {
    try { fn(); }
    catch (err) { errors.push({ path: String(rel).split(path.sep).join('/'), op, reason: (err && (err.code || err.message)) || String(err) }); }
  };

  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(path.join(snapDir, 'manifest.json'), 'utf8')); }
  catch (err) {
    // Fall back to the caller's defaults — but say so: without the manifest
    // there is no created/absent list, so nothing the failed run ADDED can be
    // deleted, and "restored" would overstate it.
    errors.push({ path: 'manifest.json', op: 'read-manifest', reason: (err && (err.code || err.message)) || String(err) });
  }

  // 1. delete files the failed operation created
  for (const rel of (manifest.created_files || [])) {
    const p = path.join(repoPath, rel);
    attempt(rel, 'delete-created', () => { if (isFile(p)) fs.unlinkSync(p); });
  }

  // 2. remove paths that did not exist when we snapshotted
  for (const rel of (manifest.absent_dirs || [])) {
    attempt(rel, 'remove-absent-dir', () => fs.rmSync(path.join(repoPath, rel), { recursive: true, force: true }));
  }
  for (const rel of (manifest.absent_files || [])) {
    const p = path.join(repoPath, rel);
    // A directory here is not the file the operation created. Manifests written
    // before createSnapshot stopped listing pre-existing dirs as absent still
    // carry such entries; the old rmSync failed on them silently and left the
    // dir, which is the right outcome — keep it, without a false error.
    if (isDir(p)) continue;
    attempt(rel, 'remove-absent-file', () => fs.rmSync(p, { force: true }));
  }

  // 3. restore captured dirs — per FILE, so one bad path inside a dir does not
  //    strand the rest of that dir (copyTree would stop at the first throw).
  const dirs = manifest.snapshot_dirs || opts.defaultDirs || [];
  for (const rel of dirs) {
    const src = path.join(snapDir, rel);
    if (!isDir(src)) continue; // absent at capture — handled in step 2
    const dst = path.join(repoPath, rel);
    if (mode === 'replace') {
      // prune anything the failed run added inside this dir
      attempt(rel, 'prune-dir', () => fs.rmSync(dst, { recursive: true, force: true }));
    }
    restoreTree(src, dst, rel, attempt);
  }

  // 4. restore captured files
  const files = manifest.snapshot_files || opts.defaultFiles || [];
  for (const rel of files) {
    const src = path.join(snapDir, rel);
    if (!isFile(src)) continue;
    attempt(rel, 'restore-file', () => {
      ensureDir(path.join(repoPath, path.dirname(rel)));
      fs.copyFileSync(src, path.join(repoPath, rel));
    });
  }

  return Object.assign(manifest, { restore_errors: errors });
}

// copyTree's walk with a per-entry attempt(): the restore-side twin. Kept
// separate because createSnapshot WANTS copyTree to throw — a snapshot that
// silently missed a file is worse than no snapshot.
function restoreTree(srcDir, dstDir, relBase, attempt) {
  let entries = [];
  attempt(relBase, 'restore-dir', () => {
    ensureDir(dstDir);
    entries = fs.readdirSync(srcDir, { withFileTypes: true });
  });
  for (const ent of entries) {
    const s = path.join(srcDir, ent.name);
    const d = path.join(dstDir, ent.name);
    const rel = `${relBase}/${ent.name}`;
    if (ent.isDirectory()) {
      if (ent.name === SNAPSHOT_ROOT || ent.name === '.git' || ent.name === 'node_modules') continue;
      restoreTree(s, d, rel, attempt);
    } else if (ent.isFile()) {
      attempt(rel, 'restore-file', () => fs.copyFileSync(s, d));
    }
  }
}

/**
 * Most recent snapshot for `prefix`, or null.
 *
 * Only a dir holding manifest.json counts. createSnapshot writes the manifest
 * LAST, so a dir without one is a capture that died midway (G16 loses power
 * routinely) or a stray — and the old sort-and-take-last would hand it to
 * --rollback as "the latest", restoring a partial copy with no created-file
 * list over a working repo (run-032 C7).
 */
function latestSnapshot(repoPath, prefix) {
  const root = snapshotRoot(repoPath);
  if (!isDir(root)) return null;
  const pre = prefix || '';
  const dirs = fs.readdirSync(root)
    .filter(d => d.startsWith(pre) && isFile(path.join(root, d, 'manifest.json')))
    .sort();
  return dirs.length ? path.join(root, dirs[dirs.length - 1]) : null;
}

module.exports = {
  SNAPSHOT_ROOT,
  createSnapshot, restoreSnapshot, latestSnapshot,
  copyTree, ensureGitignore, snapshotRoot,
};
