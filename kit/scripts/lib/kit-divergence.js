'use strict';

/**
 * kit-divergence — detect kit-owned files an adopted repo has changed, and
 * carry that fact to the hub (WS-814).
 *
 * Why this exists. HomeBase has three courier lanes and every one of them
 * carries telemetry UP: friction, requests, maintenance. None carries a fix
 * BACK. Measured 2026-09-08 — searched fleet/*.yaml, fleet/commands/*.md and
 * cwos-friction-sweep.js for "backport" and "upstream": zero matches.
 *
 * What that cost. Claude-Poker-Tracker diagnosed and fixed two real defects in
 * HomeBase's own kit — the session-recovery claim sweep (their WS-618) and the
 * archive-aware blocker resolver (their WS-590) — and wrote, on 2026-08-21:
 * "The fix belongs upstream and should land in HomeBase, then flow back." It
 * did not, for eighteen days, because there was nowhere to put it. HomeBase's
 * friction lane DID fire on one of them; it arrived as "Recurring friction:
 * cwos-session-recovery — 2 event(s) across 2 repo(s)" and sat at severity
 * high. The signal came up and the answer stayed down, because from the hub a
 * recurrence stub and a solved problem look identical.
 *
 * And it compounds: /kit-upgrade replaces kit/scripts/ wholesale by design, so
 * an un-backported fix is on a timer, while cwos-migrate now refuses rather
 * than destroy it — which froze CPT nine minor versions behind precisely
 * because it had done good work. Doing the right thing locally was punished
 * with a stuck repo.
 *
 * THE SPLIT, and it is the whole design. This module runs REPO-SIDE and reports
 * only what the repo can know: which kit-owned files no longer match the hashes
 * its own .cwos-version recorded at install, how big they are now, and — where
 * the repo's queue says so — which of its items is about that file. It does NOT
 * decide whether the change is repo-authored work or ordinary drift, because
 * that judgement needs the reference version and only the hub holds every
 * released kit. The hub runs lib/script-magnitude.js against the claim.
 *
 * A claim, never code. Nothing here reads or ships file contents.
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const { readYAMLFile, globFiles } = require('./cwos-utils');

// Only these trees are kit-owned, so only these can "diverge" in the sense this
// lane means. A repo's own docs/ and src/ are its business.
const KIT_OWNED_PREFIXES = ['kit/scripts/', '.claude/commands/', 'kit/templates/'];

// Below this the change is almost certainly a line-ending or a one-line tweak,
// and reporting it would bury the four files that matter under four hundred
// that do not. The hub applies the real bound (script-magnitude); this is only
// here to keep the lane's signal-to-noise honest at the source.
const MIN_REPORTABLE_LINE_DELTA = 25;

function sha256(buf) {
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
}

/** Normalise the two hash spellings the kit has used, so a format change never
 *  reads as every file having diverged. */
function normalizeHash(h) {
  const s = String(h || '').trim();
  return s.startsWith('sha256:') ? s : (s ? 'sha256:' + s : '');
}

function countLines(text) {
  if (!text) return 0;
  const n = text.split(/\r?\n/).length;
  return text.endsWith('\n') ? n - 1 : n;
}

function isKitOwned(rel) {
  const p = rel.replace(/\\/g, '/');
  return KIT_OWNED_PREFIXES.some((pre) => p.startsWith(pre));
}

/**
 * Which of the repo's OWN queue items names this file.
 *
 * This is the field that turns a divergence report into something actionable.
 * "cwos-session-recovery.js is 352 lines bigger" is a curiosity; the same line
 * carrying "their WS-618: session recovery builds its release list from the
 * session's self-reported claimed_items" is the backport brief. In both known
 * instances the repo HAD filed the item — nothing ever carried it anywhere.
 *
 * Best-effort by design: a repo with no matching item still reports the
 * divergence, because an unattributed one is exactly as much of a problem.
 */
function itemsNaming(repoPath, rel) {
  const wsDir = path.join(repoPath, '.claude', 'workstream', 'queue');
  if (!fs.existsSync(wsDir)) return [];
  const target = rel.replace(/\\/g, '/');
  const out = [];
  let files = [];
  try { files = globFiles(wsDir, 'WS-*.yaml'); } catch { return []; }
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (!text.includes(target)) continue;
    const { ok, data } = readYAMLFile(f);
    if (!ok || !data) continue;
    const involved = Array.isArray(data.files_involved)
      ? data.files_involved.map((x) => String(x).replace(/\\/g, '/'))
      : [];
    // Require a declared files_involved match rather than any mention: a file
    // path quoted in some other item's description is not that item being
    // about the file.
    if (!involved.includes(target)) continue;
    if (['done', 'dismissed'].includes(String(data.status || ''))) continue;
    out.push({
      id: String(data.id || path.basename(f, '.yaml')),
      title: String(data.title || '').slice(0, 200),
      status: String(data.status || 'unknown'),
    });
  }
  return out;
}

/**
 * Scan one repo for kit-owned files that no longer match its recorded install
 * hashes. Returns { readable, reason, version, files: [...] }.
 *
 * Never throws: this runs inside the sweep's child, and a repo that cannot be
 * scanned must report that fact rather than take the sweep down.
 */
function scanDivergence(repoPath) {
  const versionPath = path.join(repoPath, '.cwos-version');
  if (!fs.existsSync(versionPath)) {
    return { readable: false, reason: 'no .cwos-version — not an adopted repo', version: null, files: [] };
  }
  const { ok, data } = readYAMLFile(versionPath);
  if (!ok || !data) {
    return { readable: false, reason: 'unreadable .cwos-version', version: null, files: [] };
  }
  const version = data.kit_version_at_install || null;
  const installed = data.installed_files || {};
  const tracked = Object.keys(installed);
  if (tracked.length === 0) {
    // Not a failure and not clean either. A repo with no baseline cannot have
    // divergence detected, and saying "0 diverged" would be a lie of omission —
    // the same "found nothing vs never looked" confusion WS-618 was about.
    return {
      readable: false,
      reason: 'no installed_files baseline — divergence cannot be computed here',
      version, files: [],
    };
  }

  const files = [];
  for (const rel of tracked) {
    if (!isKitOwned(rel)) continue;
    const abs = path.join(repoPath, rel);
    let buf;
    try {
      if (!fs.statSync(abs).isFile()) continue;
      buf = fs.readFileSync(abs);
    } catch {
      continue;  // a deleted kit file is the reaper's business, not this lane's
    }
    const current = sha256(buf);
    const baseline = normalizeHash(installed[rel]);
    if (!baseline || current === baseline) continue;

    const text = buf.toString('utf8');
    const currentLines = countLines(text);
    files.push({
      path: rel.replace(/\\/g, '/'),
      current_lines: currentLines,
      current_bytes: buf.length,
      current_hash: current,
      baseline_hash: baseline,
      items: itemsNaming(repoPath, rel),
    });
  }

  files.sort((a, b) => b.current_lines - a.current_lines);
  return { readable: true, reason: null, version, files };
}

module.exports = {
  scanDivergence,
  itemsNaming,
  isKitOwned,
  countLines,
  normalizeHash,
  KIT_OWNED_PREFIXES,
  MIN_REPORTABLE_LINE_DELTA,
};
