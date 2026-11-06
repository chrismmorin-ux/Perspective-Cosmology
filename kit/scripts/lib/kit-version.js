'use strict';

/**
 * kit-version — the one place that answers "what kit version is this repo on?"
 *
 * WS-547 / ADR-064 P1. Four readers used to answer this question four different
 * ways, and none of them agreed:
 *
 *   cwos-migrate.js:292      kit_version_at_install → version
 *   cwos-kit-upgrade.js:102  kit_version_at_install → version
 *   cwos-fleet-scan.js:318   kit_version → kit_version_at_install → registry cache
 *   cwos-kit-health.js:210   kit_version_at_install only
 *
 * The first two prefer the HISTORICAL install-time field over the CURRENT stamp,
 * which is backwards. physical-therapy-by-ai carries `version: "3.0"` with
 * `kit_version_at_install: "3.3"` (the latter hand-edited to record a partial
 * rollout), so migration computed its baseline as three releases ahead of what
 * the repo actually had, and every file changed in between was misclassified.
 *
 * There was also no semver comparator anywhere in kit/scripts/ — comparison was
 * hand-rolled in three places. lib/cwos-utils.js quotes any value where
 * !isNaN(Number(value)), which is why "3.0" and "3.3" are quoted while 3.8.1 is
 * bare; mixed-type version fields plus string compare makes
 * "3.10.0" < "3.9.0" true on the first two-digit minor.
 *
 * ADR-064 D1 puts kit/scripts/ inside the plugin, at a Claude-Code-controlled
 * depth in an ephemeral cache. Nothing here walks up from __dirname to find a
 * repo root — every entry point takes an explicit path. (WS-549 removes the 17
 * existing sites that do; this module must not become the 18th.)
 */

const fs = require('fs');
const path = require('path');
const { readYAMLFile } = require('./cwos-utils');

// Field precedence, most authoritative first. Order is the whole point of this
// module — change it here and every reader changes with it.
//
//   version                 the current stamp. What the repo has NOW. Written by
//                           /adopt (writeVersionStamp) and by cwos-migrate
//                           (updateVersionStamp) on every upgrade.
//   kit_version_at_install  historical. Written alongside `version` and normally
//                           equal to it; only meaningful when `version` is absent.
//   kit_version             the /genesis M0 shape. Was written by nothing else
//                           and read by nothing at all, which is how siteproof
//                           degraded to the literal tag `kit-vunknown`.
const VERSION_FIELDS = ['version', 'kit_version_at_install', 'kit_version'];

// Legacy fixtures store a bare scalar rather than a YAML mapping.
const BARE_VERSION_RE = /(\d+\.\d+(?:\.\d+)?)/;

/**
 * Read a repo's .cwos-version. Returns { ok, data, raw, path }; `data` is the
 * parsed mapping (null when the file is absent or unparseable) and `raw` is the
 * original text, which callers need for comment-preserving edits.
 */
function readVersionStamp(repoPath) {
  const stampPath = path.join(repoPath, '.cwos-version');
  if (!fs.existsSync(stampPath)) {
    return { ok: false, data: null, raw: null, path: stampPath };
  }
  let raw = null;
  try { raw = fs.readFileSync(stampPath, 'utf8'); } catch { /* unreadable */ }
  const { ok, data } = readYAMLFile(stampPath);
  return {
    ok: !!(ok && data && typeof data === 'object'),
    data: (ok && data && typeof data === 'object') ? data : null,
    raw,
    path: stampPath,
  };
}

/**
 * Resolve the installed version from a parsed stamp (or its raw text).
 *
 * Returns { version, field } — `field` names which key answered, so callers can
 * explain WHY they resolved what they did. Returns null when nothing resolves.
 *
 * Never returns a sentinel string. The old code returned 'unknown' on failure,
 * which flowed straight into `kit-v${version}` and produced a git ref that could
 * not exist — a lookup that then failed open. A null forces the caller to decide.
 *
 * @param {object|null} data  parsed .cwos-version mapping
 * @param {string|null} raw   original text, for the legacy bare-scalar fallback
 */
function resolveInstalledVersion(data, raw) {
  if (data && typeof data === 'object') {
    for (const field of VERSION_FIELDS) {
      const value = data[field];
      if (value === undefined || value === null) continue;
      const version = String(value).trim();
      // A stamp may carry the key with an empty value; that is not an answer.
      if (version) return { version, field };
    }
  }
  if (typeof raw === 'string') {
    const m = raw.match(BARE_VERSION_RE);
    if (m) return { version: m[1], field: 'bare-scalar' };
  }
  return null;
}

/** Convenience: read + resolve in one call. Returns null if either step fails. */
function resolveRepoVersion(repoPath) {
  const stamp = readVersionStamp(repoPath);
  if (!stamp.raw) return null;
  return resolveInstalledVersion(stamp.data, stamp.raw);
}

/**
 * Parse a version into numeric components. Returns null rather than coercing —
 * a version that does not parse is a fact the caller needs, not one to paper
 * over with zeros. Accepts "3.8" and "3.8.1"; tolerates a leading "v".
 */
function parseSemver(value) {
  if (value === undefined || value === null) return null;
  const m = String(value).trim().match(/^v?(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: m[3] === undefined ? 0 : Number(m[3]) };
}

/**
 * Compare two versions numerically. -1 / 0 / 1, ordering unparseable values
 * last (two unparseable values compare equal). This is what makes
 * compareSemver('3.10.0', '3.9.0') === 1, where string compare says -1.
 */
function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  for (const part of ['major', 'minor', 'patch']) {
    if (pa[part] < pb[part]) return -1;
    if (pa[part] > pb[part]) return 1;
  }
  return 0;
}

/**
 * Classify how far an installed version lags HEAD: none | patch | minor | major.
 * The /status renderer keys its /fleet-update prompt off this (WS-404), so any
 * non-'none' value means the repo is behind. 'none' when installed >= head, or
 * when either side is missing or unparseable — an unknown lag is not a lag, and
 * INV-065 is what catches the unknown.
 */
function lagSeverity(installed, head) {
  if (!installed || !head) return 'none';
  const pa = parseSemver(installed);
  const pb = parseSemver(head);
  if (!pa || !pb) return 'none';
  if (compareSemver(installed, head) >= 0) return 'none';
  if (pa.major < pb.major) return 'major';
  if (pa.minor < pb.minor) return 'minor';
  return 'patch';
}

/** The git tag a given kit version was released under. */
function baselineTag(version) {
  return `kit-v${version}`;
}

// ─── Mandatory releases (WS-943) ────────────────────────────────────────────
//
// Every kit release was optional: nothing could mark a security fix as
// must-install-by-a-date. A release is now made mandatory by ONE line in its
// own kit/CHANGELOG.md entry, directly under the header:
//
//   ## 3.44.0 - 2026-11-02
//   > **Mandatory by:** 2026-11-16 — closes the push-credential leak (WS-NNN)
//
// The changelog is the single source. A sibling YAML would be a second place to
// keep in step with the entry a human actually reads, and this file already
// holds the one version comparator. The changelog does not ship to adopted
// repos; readers reach it through the same HomeBase root kit-health already
// resolves to read kit/VERSION.
//
// A mandate REPORTS. Nothing here blocks: when to upgrade is the repo's own
// decision (DEC-054 / DEC-145), and what the hub owes the repo is that the
// deadline is impossible to miss.

// Both header styles are live in the file: "## 3.42.0 - 2026-09-28" and the
// older "## 3.22.0 — 2026-08-26".
const RELEASE_HEADER_RE = /^##\s+v?(\d+\.\d+(?:\.\d+)?)\b/;
// "Is this line TRYING to declare a mandate?" — deliberately much looser than
// the one accepted form below. Any line that, after list / blockquote / emphasis
// markers, begins with the words "Mandatory by" is an attempt: `- **Mandatory
// by:** …`, `> Mandatory by: …`, `> __Mandatory by:__ …`, `> **Mandatory by:
// 2026-10-20** …`. The first version of this pattern required the exact bold
// form, so every one of those was dropped without a word while the changelog's
// own header promised that a line which does not parse is reported.
// The separator is loose too — `mandatory_by:` (the edge worksheet's own field
// name) and `Mandatory-by` are the same attempt. What this cannot catch is a
// different phrase altogether ("Must install by"); the how-to at the top of the
// changelog names the one accepted form, and that is the limit of a detector.
const MANDATORY_ANY_RE = /^[>\-*_+\s]*mandatory[\s_-]*by\b/i;
const MANDATORY_RE = /^>\s*\*\*Mandatory by:\*\*\s*(\d{4}-\d{2}-\d{2})\s*(?:[—–-]+\s*(.+?))?\s*$/;

function isRealDate(ymd) {
  const t = Date.parse(`${ymd}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === ymd;
}

/**
 * Parse changelog text into its mandatory releases.
 *
 * `malformed` is the half that matters most: a line that is plainly TRYING to
 * declare a mandate (it starts "**Mandatory by") but does not parse — a bad
 * date, a missing reason, no blockquote marker — is returned there, never
 * dropped. A deadline that silently fails to register is worse than none,
 * because its author believes it is in force.
 */
function parseMandatoryReleases(text) {
  const releases = [], malformed = [];
  let current = null;
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    const h = line.match(RELEASE_HEADER_RE);
    if (h) { current = h[1]; continue; }
    if (/^##\s/.test(line)) { current = null; continue; }   // "## Unreleased" and the like
    if (!MANDATORY_ANY_RE.test(line)) continue;
    const m = line.match(MANDATORY_RE);
    if (!current) { malformed.push({ version: null, line, why: 'not inside a numbered release entry' }); continue; }
    if (!m) { malformed.push({ version: current, line, why: 'expected: > **Mandatory by:** YYYY-MM-DD — reason' }); continue; }
    if (!isRealDate(m[1])) { malformed.push({ version: current, line, why: `${m[1]} is not a calendar date` }); continue; }
    if (!m[2]) { malformed.push({ version: current, line, why: 'a mandate needs its reason on the same line' }); continue; }
    if (releases.some(r => r.version === current)) { malformed.push({ version: current, line, why: 'second mandate line in one release entry' }); continue; }
    releases.push({ version: current, mandatory_by: m[1], reason: m[2] });
  }
  return { releases, malformed };
}

/** Read and parse <homebase>/kit/CHANGELOG.md. `ok:false` = could not look. */
function readMandatoryReleases(homebaseRoot) {
  const p = path.join(homebaseRoot, 'kit', 'CHANGELOG.md');
  let text;
  try { text = fs.readFileSync(p, 'utf8'); }
  catch (e) { return { ok: false, error: `kit/CHANGELOG.md unreadable: ${e.code || e.message}`, releases: [], malformed: [] }; }
  return { ok: true, error: null, ...parseMandatoryReleases(text) };
}

/**
 * The mandate an installed version is under, or null when it is under none.
 *
 * A release binds every installed version below it. When several bind, the one
 * reported is the one whose deadline comes first — that is the date the repo
 * has to act by — and `required_version` is the highest binding release, since
 * installing that one clears them all. Overdue from the day AFTER mandatory_by:
 * the date named is the last day in compliance.
 *
 * null for an unparseable installed version, matching lagSeverity: an unknown
 * lag is not a lag, and INV-065 is what catches the unknown.
 */
function mandateFor(installed, releases, now) {
  if (!parseSemver(installed)) return null;
  const binding = (releases || []).filter(r => parseSemver(r.version) && compareSemver(installed, r.version) < 0);
  if (binding.length === 0) return null;
  binding.sort((a, b) => a.mandatory_by.localeCompare(b.mandatory_by) || compareSemver(a.version, b.version));
  const first = binding[0];
  const today = new Date(typeof now === 'number' ? now : Date.now()).toISOString().slice(0, 10);
  const daysLeft = Math.round((Date.parse(`${first.mandatory_by}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
  return {
    version: first.version,
    mandatory_by: first.mandatory_by,
    reason: first.reason,
    required_version: binding.map(r => r.version).sort(compareSemver).pop(),
    overdue: daysLeft < 0,
    days_left: daysLeft,
    binding: binding.length,
  };
}

module.exports = {
  readVersionStamp,
  resolveInstalledVersion,
  resolveRepoVersion,
  parseSemver,
  compareSemver,
  lagSeverity,
  baselineTag,
  parseMandatoryReleases,
  readMandatoryReleases,
  mandateFor,
  VERSION_FIELDS,
};
