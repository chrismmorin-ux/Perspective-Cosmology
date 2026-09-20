/**
 * id-collision — find work items this checkout minted under an id the remote
 * gave to something else, and move them out of the way.
 *
 * Issue #26 (2026-09-17). `lib/remote-ids.js` stops a node that is merely
 * BEHIND from minting over published ids. It cannot stop two nodes minting
 * while neither has pushed — no single machine can see that. This module is
 * the other half: it makes that residue detectable (INV-093) and repairable by
 * a command instead of by hand.
 *
 * ── What it compares ─────────────────────────────────────────────────────────
 *
 * LOCAL-NEW  = WS files on disk that the merge-base with the remote ref lacks.
 * REMOTE-NEW = WS files at the remote ref that the merge-base lacks.
 *
 * Identity is the item's `dedup_key` (every sweep-minted item carries one), or
 * its title when there is none. For each LOCAL-NEW item:
 *
 *   collision  same id on the remote, DIFFERENT identity. Two work items, one
 *              name. Repair: renumber the local one above every known id.
 *   duplicate  the remote holds the same identity (under this id or another).
 *              Both nodes swept the same source. Repair: the remote copy
 *              survives — it is the one other machines already reference — and
 *              the local file is removed. Refused when the local copy has left
 *              `backlog`: someone has worked on it, and that is a human call.
 *
 * Measured on the motivating incident: 8 local items, of which 5 were
 * collisions and 3 were duplicates (two of them under a DIFFERENT id on the
 * other node, which a filename comparison alone would have renumbered into
 * permanent twins).
 *
 * ── What repair rewrites, and what it only reports ───────────────────────────
 *
 * Rewritten: the file name, the file's own `id:` line, and `promoted_ws:`
 * back-references in fleet/maintenance/findings.yaml (the one machine-written
 * pointer at a sweep-minted id). Reported, not rewritten: any other mention of
 * a moved id. After the pull that token legitimately names the REMOTE's item,
 * so a blanket search-and-replace would corrupt as many references as it fixed.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { writeFileAtomic } = require('./cwos-utils');
const { git, resolveRemoteRef, remoteTreeNames, remoteFileText, refreshRemote, fetchAgeMs } = require('./remote-ids');

const WS_FILE_RE = /^WS-(\d+)\.yaml$/;
const QUEUE_DIRS = ['queue', 'queue/archive'];

/** First top-level scalar `key:` in a queue YAML, unquoted. Cheap on purpose. */
function topLevelScalar(text, key) {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(text || '');
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v === '' || v === 'null' ? null : v;
}

function identityOf(text) {
  const k = topLevelScalar(text, 'dedup_key');
  if (k) return `dedup:${k}`;
  const t = topLevelScalar(text, 'title');
  return t ? `title:${t.trim().toLowerCase()}` : null;
}

function localWsFiles(wsDir) {
  const out = new Map(); // id number → { rel, abs }
  for (const rel of QUEUE_DIRS) {
    const dir = path.join(wsDir, rel);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = WS_FILE_RE.exec(f);
      if (m) out.set(parseInt(m[1], 10), { rel: `${rel}/${f}`, abs: path.join(dir, f) });
    }
  }
  return out;
}

function treeWsFiles(wsDir, ref) {
  const out = new Map(); // id number → rel path at ref
  for (const rel of QUEUE_DIRS) {
    for (const f of remoteTreeNames(wsDir, ref, [rel])) {
      const m = WS_FILE_RE.exec(f);
      if (m) out.set(parseInt(m[1], 10), `${rel}/${f}`);
    }
  }
  return out;
}

const wsId = (n) => `WS-${String(n).padStart(3, '0')}`;

/**
 * @returns {{
 *   applicable: boolean, reason?: string, ref?: string, fetch?: object,
 *   fetch_age_ms?: number|null, remote_max?: number,
 *   collisions: Array<{id, local_path, local_title, remote_title}>,
 *   duplicates: Array<{id, local_path, survivor, title, removable, why_not?}>,
 * }}
 */
function detectCollisions(wsDir, opts = {}) {
  const empty = { applicable: false, collisions: [], duplicates: [] };
  if (!wsDir || !fs.existsSync(wsDir)) return { ...empty, reason: 'no workstream dir' };

  const fetch = opts.fetch === false ? { fetched: false, skipped: 'caller' } : refreshRemote(wsDir, opts);
  const ref = resolveRemoteRef(wsDir);
  if (!ref) return { ...empty, reason: 'no remote-tracking ref', fetch };

  const mb = git(wsDir, ['merge-base', 'HEAD', ref]);
  if (!mb.ok) return { ...empty, reason: `no merge-base with ${ref}`, ref, fetch };
  const base = mb.stdout.trim();

  const baseFiles = treeWsFiles(wsDir, base);
  const remoteFiles = treeWsFiles(wsDir, ref);
  const localFiles = localWsFiles(wsDir);

  // REMOTE-NEW, indexed both ways.
  const remoteNewById = new Map();
  const remoteNewByIdentity = new Map();
  for (const [n, rel] of remoteFiles) {
    if (baseFiles.has(n)) continue;
    const text = remoteFileText(wsDir, ref, rel);
    if (text === null) continue;
    const rec = { n, rel, text, identity: identityOf(text), title: topLevelScalar(text, 'title') };
    remoteNewById.set(n, rec);
    if (rec.identity && !remoteNewByIdentity.has(rec.identity)) remoteNewByIdentity.set(rec.identity, rec);
  }

  const collisions = [];
  const duplicates = [];
  for (const [n, loc] of [...localFiles].sort((a, b) => a[0] - b[0])) {
    if (baseFiles.has(n)) continue; // not minted here since the fork point
    let text;
    try { text = fs.readFileSync(loc.abs, 'utf8'); } catch { continue; }
    const identity = identityOf(text);
    const title = topLevelScalar(text, 'title');
    const sameId = remoteNewById.get(n);
    // Byte-identical to the remote (already pushed, or pulled): nothing to do.
    if (sameId && sameId.text.replace(/\r\n/g, '\n') === text.replace(/\r\n/g, '\n')) continue;

    const twin = identity ? remoteNewByIdentity.get(identity) : null;
    if (twin) {
      const status = topLevelScalar(text, 'status') || 'backlog';
      const claimed = topLevelScalar(text, 'claimed_by');
      const removable = status === 'backlog' && !claimed;
      duplicates.push({
        id: wsId(n), local_path: loc.rel, survivor: wsId(twin.n), title,
        removable,
        ...(removable ? {} : { why_not: `local copy is ${claimed ? `claimed by ${claimed}` : `status ${status}`} — merge by hand` }),
      });
    } else if (sameId) {
      collisions.push({ id: wsId(n), local_path: loc.rel, local_title: title, remote_title: sameId.title });
    }
  }

  let remoteMax = 0;
  for (const n of remoteFiles.keys()) if (n > remoteMax) remoteMax = n;

  return {
    applicable: true, ref, fetch, fetch_age_ms: fetchAgeMs(wsDir), remote_max: remoteMax,
    collisions, duplicates,
  };
}

/** Rewrite `promoted_ws: "<old>"` pointers. Returns how many lines changed. */
function rewritePromotedWs(filePath, mapping) {
  if (!fs.existsSync(filePath) || mapping.size === 0) return 0;
  const before = fs.readFileSync(filePath, 'utf8');
  let changed = 0;
  const after = before.replace(/^(\s*promoted_ws:\s*)(["']?)(WS-\d+)\2(\s*)$/gm, (line, head, q, id, tail) => {
    const to = mapping.get(id);
    if (!to) return line;
    changed++;
    return `${head}${q}${to}${q}${tail}`;
  });
  if (changed) writeFileAtomic(filePath, after);
  return changed;
}

/** Other files under the workstream/fleet dirs that still mention a moved id. */
function findStrayMentions(wsDir, repoRoot, movedIds, skipAbs) {
  const out = [];
  if (movedIds.length === 0) return out;
  const re = new RegExp(`\\b(${movedIds.join('|')})\\b`);
  const files = [];
  for (const rel of QUEUE_DIRS) {
    const dir = path.join(wsDir, rel);
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.yaml')) files.push(path.join(dir, f));
  }
  const sprints = path.join(wsDir, 'sprints');
  if (fs.existsSync(sprints)) for (const f of fs.readdirSync(sprints)) if (f.endsWith('.yaml')) files.push(path.join(sprints, f));
  for (const p of files) {
    if (skipAbs.has(path.resolve(p))) continue;
    let text; try { text = fs.readFileSync(p, 'utf8'); } catch { continue; }
    const m = re.exec(text);
    if (m) out.push({ file: path.relative(repoRoot, p).replace(/\\/g, '/'), mentions: m[1] });
  }
  return out;
}

/**
 * Apply the repair. Renumbering goes through the WS allocator, so it holds the
 * same lock a concurrent sweep would and lands above local AND remote ids.
 *
 * @param {string} wsDir
 * @param {object} [opts]
 * @param {string} [opts.repoRoot]  default: two levels above wsDir
 * @param {object} [opts.detection] a detectCollisions() result to act on
 */
function repairCollisions(wsDir, opts = {}) {
  const { allocateId } = require('./id-allocator');
  const repoRoot = opts.repoRoot || path.resolve(wsDir, '..', '..');
  const d = opts.detection || detectCollisions(wsDir, opts);
  const out = { renumbered: [], removed: [], refused: [], pointers_rewritten: 0, stray_mentions: [] };
  if (!d.applicable) return { ...out, reason: d.reason };

  const mapping = new Map(); // old id → id that now names that work
  const touched = new Set();

  for (const dup of d.duplicates) {
    if (!dup.removable) { out.refused.push(dup); continue; }
    fs.unlinkSync(path.join(wsDir, dup.local_path));
    mapping.set(dup.id, dup.survivor);
    out.removed.push({ id: dup.id, survivor: dup.survivor, title: dup.title });
  }

  for (const c of d.collisions) {
    const fromAbs = path.join(wsDir, c.local_path);
    const dir = path.dirname(fromAbs);
    const text = fs.readFileSync(fromAbs, 'utf8');
    const newId = allocateId('ws', {
      wsDir,
      writer: (id) => {
        const toAbs = path.join(dir, `${id}.yaml`);
        if (fs.existsSync(toAbs)) throw new Error(`refusing to overwrite ${toAbs}`);
        const renamed = text.replace(/^id:[ \t]*["']?WS-\d+["']?[ \t]*$/m, `id: "${id}"`);
        writeFileAtomic(toAbs, renamed);
        fs.unlinkSync(fromAbs);
        touched.add(path.resolve(toAbs));
      },
    });
    mapping.set(c.id, newId);
    out.renumbered.push({ from: c.id, to: newId, title: c.local_title });
  }

  out.pointers_rewritten = rewritePromotedWs(path.join(repoRoot, 'fleet', 'maintenance', 'findings.yaml'), mapping);
  out.stray_mentions = findStrayMentions(wsDir, repoRoot, out.renumbered.map(r => r.from), touched);
  return out;
}

module.exports = {
  detectCollisions,
  repairCollisions,
  identityOf,
  topLevelScalar,
  rewritePromotedWs,
};
