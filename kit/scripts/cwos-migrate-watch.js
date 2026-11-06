#!/usr/bin/env node
/**
 * cwos-migrate-watch — INV firing → migration WS auto-promotion (WS-376 / FIND-251).
 *
 * Bridges the invariant system and the workstream queue. When an INV fires
 * N consecutive times without resolution AND no migration WS exists for it,
 * generate one. Closes RC-F from the 2026-05-10 retro: invariants that fire
 * forever as yellow noise because nothing structurally routes detection to
 * remediation (INV-039 on SYN fired for 11 months).
 *
 * WS-1203 (run-038, 2026-10-19): the escalator was built and invoked by
 * nothing — 15 of 16 red invariants sat unowned, INV-075 at 154 consecutive
 * failures. It also never re-escalated once linked (INV-039's owner WS-437 was
 * dismissed; the alarm kept firing at nobody) and ignored open items that
 * already named the invariant. Now:
 *   - cwos-verify calls runWatch() after every run that is not --only;
 *   - an invariant is due at `threshold` consecutive failures OR once it has
 *     been red for AGE_THRESHOLD_DAYS (run counts never accumulate for an
 *     invariant outside the fast set);
 *   - a link to a closed or missing item is no owner;
 *   - an open queue item that names the invariant in its title or structured
 *     fields is linked before a new one is created;
 *   - `--link INV-NNN WS-NNN` records an owner by hand.
 *
 * Inputs (read-only):
 *   .claude/workstream/meta/invariant-firing-log.yaml  — populated by cwos-verify
 *   system/invariants.md                               — for rule/source text
 *   .claude/workstream/queue/                          — open owners, next WS id
 *
 * Outputs (atomic):
 *   .claude/workstream/queue/WS-NNN.yaml               — one per new escalation
 *   .claude/workstream/meta/invariant-firing-log.yaml  — counter reset + ws_id link
 *
 * Usage:
 *   node kit/scripts/cwos-migrate-watch.js --watch         # link or generate owners
 *   node kit/scripts/cwos-migrate-watch.js --list          # dry-run + report
 *   node kit/scripts/cwos-migrate-watch.js --dry-run       # alias of --list
 *   node kit/scripts/cwos-migrate-watch.js --link INV-039 WS-1204
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { readYAMLFile, findWorkstreamDir, findRepoRoot, todayISO, globFiles, loadEventDeps, writeFileAtomic, blockScalarLines } = require('./lib/cwos-utils');
const { systemPath } = require('./lib/kit-artifacts');
const { allocateId } = require('./lib/id-allocator');
const { cliGate } = require('./lib/cli');

const { appendEvent, ensureCommandId } = loadEventDeps();

const AGE_THRESHOLD_DAYS = 14;
// Statuses that mean an item no longer owns anything.
const CLOSED_STATUSES = new Set(['done', 'dismissed', 'superseded', 'cancelled', 'abandoned', 'archived', 'wont_do']);

const CLI = {
  name: 'cwos-migrate-watch',
  summary: 'give every sustained-red invariant an owner work item (WS-376, WS-1203)',
  usage: 'cwos-migrate-watch (--watch | --list | --link INV-NNN WS-NNN)',
  flags: {
    watch: { type: 'boolean', describe: 'link or generate owner items for every due invariant' },
    list: { type: 'boolean', describe: 'dry run: report what --watch would do' },
    'dry-run': { type: 'boolean', describe: 'alias of --list' },
    link: { type: 'string', placeholder: 'INV-NNN', describe: 'record WS-NNN (positional) as this invariant\'s owner' },
  },
  notes: [
    `Due: consecutive failures >= threshold (default 5) OR red for ${AGE_THRESHOLD_DAYS}+ days.`,
    'A link to a closed or missing item counts as no owner.',
  ],
};

function loadFiringLog(wsDir) {
  const logPath = path.join(wsDir, 'meta', 'invariant-firing-log.yaml');
  if (!fs.existsSync(logPath)) return { path: logPath, data: { schema_version: 1, invariants: {} } };
  const r = readYAMLFile(logPath);
  if (!r.ok || !r.data) return { path: logPath, data: { schema_version: 1, invariants: {} } };
  if (!r.data.invariants) r.data.invariants = {};
  return { path: logPath, data: r.data };
}

function serializeFiringLog(data) {
  const out = [`schema_version: ${data.schema_version || 1}`, 'invariants:'];
  const ids = Object.keys(data.invariants || {}).sort();
  for (const id of ids) {
    const e = data.invariants[id];
    out.push(`  ${id}:`);
    out.push(`    consecutive_failures: ${e.consecutive_failures || 0}`);
    out.push(`    first_failed_at: ${e.first_failed_at ? `"${e.first_failed_at}"` : 'null'}`);
    out.push(`    last_failed_at: ${e.last_failed_at ? `"${e.last_failed_at}"` : 'null'}`);
    out.push(`    last_status: ${e.last_status ? `"${e.last_status}"` : 'null'}`);
    out.push(`    threshold: ${e.threshold || 5}`);
    out.push(`    migration_ws_id: ${e.migration_ws_id ? `"${e.migration_ws_id}"` : 'null'}`);
  }
  return out.join('\n') + '\n';
}

// ─── Owners: who, if anyone, already answers for an invariant ───────────────

function readItemHead(file) {
  // Only the top-level scalars the owner checks need. Queue items can carry
  // 80KB of notes; a full YAML parse of every file on every verify is waste.
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const field = (name) => {
    const m = text.match(new RegExp(`^${name}:[ \\t]*["']?([^"'\\r\\n]*)`, 'm'));
    return m ? m[1].trim() : '';
  };
  return { text, id: field('id'), status: field('status'), title: field('title') };
}

/** 'open' | 'closed' | 'missing' for a WS id, looking in queue/ then queue/archive/. */
function ownerState(wsDir, wsId) {
  for (const dir of [path.join(wsDir, 'queue'), path.join(wsDir, 'queue', 'archive')]) {
    const file = path.join(dir, `${wsId}.yaml`);
    if (!fs.existsSync(file)) continue;
    const head = readItemHead(file);
    if (!head) return 'missing';
    return CLOSED_STATUSES.has(head.status) ? 'closed' : 'open';
  }
  return 'missing';
}

/**
 * An open item that already names this invariant as its subject: in its title,
 * or in a structured `invariant_id:` / `depends_on:` entry. Description text is
 * deliberately NOT searched — an umbrella item (WS-1203 names six invariants)
 * would become the owner of everything it mentions.
 */
function findExistingOwner(wsDir, invId) {
  const queueDir = path.join(wsDir, 'queue');
  if (!fs.existsSync(queueDir)) return null;
  const token = new RegExp(`\\b${invId}(?!\\d)`);
  const structured = new RegExp(`^\\s*(?:invariant_id:|-)[ \\t]*["']?${invId}["']?[ \\t]*$`, 'm');
  const hits = [];
  for (const file of globFiles(queueDir, 'WS-*.yaml')) {
    const head = readItemHead(file);
    if (!head || !head.id || CLOSED_STATUSES.has(head.status)) continue;
    const inTitle = token.test(head.title);
    if (!inTitle && !structured.test(head.text)) continue;
    hits.push({ id: head.id, rank: inTitle ? 1 : 0, n: parseInt(head.id.split('-')[1], 10) || 0 });
  }
  // Structured declarations first (the item says so itself), then the oldest.
  hits.sort((x, y) => (x.rank - y.rank) || (x.n - y.n));
  return hits.length ? hits[0].id : null;
}

function daysRed(entry, now) {
  if (!entry.first_failed_at) return 0;
  const since = Date.parse(`${String(entry.first_failed_at).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(since)) return 0;
  return Math.floor((now.getTime() - since) / 86_400_000);
}

/** Why an invariant needs an owner now, or null. */
function dueReason(entry, now) {
  // Red as of its last observation. NOT_MEASURED keeps the count (WS-1114), so
  // an invariant outside the fast set still reads as red between full runs.
  if (!entry || !(entry.consecutive_failures > 0) || entry.last_status === 'PASS') return null;
  const threshold = entry.threshold || 5;
  if (entry.consecutive_failures >= threshold) return `failed ${entry.consecutive_failures} consecutive runs`;
  const days = daysRed(entry, now);
  // first_failed_at is the start of the current red streak only for entries
  // written after verify began clearing it on PASS; say what is actually known.
  if (days >= AGE_THRESHOLD_DAYS) return `first failed ${days} days ago`;
  return null;
}

function emit(wsDir, trackTag, payload) {
  if (!appendEvent || !ensureCommandId) return;
  try {
    appendEvent({
      source_track: 'T6:workstream',
      source_tier: 'ai-autonomous',
      track_tag: trackTag,
      command_id: ensureCommandId('migrate-watch'),
      payload: { type: trackTag, ...payload },
    }, { workstreamDir: wsDir });
  } catch { /* non-fatal: the queue file and the log are the record */ }
}

// Parse the rule/status prose for a given INV-NNN from system/invariants.md.
// Returns { rule, status, lastVerified } as best-effort strings.
function loadInvariantContext(rootDir, invId) {
  const invPath = systemPath(rootDir, 'invariants.md');
  if (!fs.existsSync(invPath)) return { rule: '', status: '', lastVerified: null };
  const content = fs.readFileSync(invPath, 'utf8');
  // Match the section starting at "### <invId>:" until the next "### " or EOF.
  const escId = invId.replace(/-/g, '-');
  // No `m` flag: with it `$` matched the end of the heading line, so every
  // escalation item shipped an empty rule and status (fixed WS-1203).
  const re = new RegExp(`### ${escId}:[\\s\\S]*?(?=\\n### |\\n## |(?![\\s\\S]))`);
  const m = content.match(re);
  if (!m) return { rule: '', status: '', lastVerified: null };
  const section = m[0];
  const ruleMatch = section.match(/\*\*Rule:\*\*\s+([\s\S]*?)(?=\n\*\*|\n###|$)/);
  const statusMatch = section.match(/\*\*Status:\*\*\s+([^\n]+)/);
  const verMatch = section.match(/\*\*Last Verified:\*\*\s+([^\n]+)/);
  return {
    rule: ruleMatch ? ruleMatch[1].trim() : '',
    status: statusMatch ? statusMatch[1].trim() : '',
    lastVerified: verMatch ? verMatch[1].trim() : null,
  };
}

// Build a migration WS-NNN.yaml body for the given INV escalation.
function buildMigrationWsYaml(wsId, invId, invCtx, log, reason) {
  const now = new Date().toISOString();
  const today = todayISO();
  const firstFailedAt = log.first_failed_at || today;
  const consecutive = log.consecutive_failures;
  const ruleExcerpt = (invCtx.rule || '').split('\n')[0].slice(0, 200);
  const statusExcerpt = (invCtx.status || '').slice(0, 200);
  const why = reason || `failed ${consecutive} consecutive runs`;
  // The excerpts are text from invariants.md. The body is assembled whole and
  // indented by the one writer, so none of its lines can become a field (WS-1079).
  const description = blockScalarLines('description', [
    `${invId} has been red since ${firstFailedAt} (${why}) with no open item`,
    'answering for it. cwos-migrate-watch generated this owner item (WS-376,',
    'WS-1203): an alarm is due an owner after 5 consecutive failing runs or',
    `${AGE_THRESHOLD_DAYS} days red, whichever comes first.`,
    '',
    'Rule excerpt:',
    `  ${ruleExcerpt}`,
    '',
    'Current status from system/invariants.md:',
    `  ${statusExcerpt}`,
    '',
    "Founder action: review the invariant's rule + status text, decide whether",
    'to (a) author the remediation steps (migration), (b) document why the',
    'invariant fires as expected and update its status text, or (c) retire the',
    'invariant if it no longer reflects desired behavior.',
  ].join('\n')).join('\n');

  return `id: "${wsId}"
title: "Alarm ${invId} is red with no owner (${why}) - fix it or retire it"
status: "backlog"
type: "migration"
category: "migration"
capability: "core"
program: "kit-quality"
priority_score: 75
effort: "M"
created_at: "${today}"
invariant_id: "${invId}"
source:
  surfaced_by: "cwos-migrate-watch.js (WS-376)"
  surfaced_during: "${invId} ${why} without an open owner item"
  first_failed_at: "${firstFailedAt}"
  invariant_id: "${invId}"
${description}
accept_criteria:
  - "${invId} passes cwos-verify on the affected fleet member(s)"
  - "Or: invariants.md status text updated to reflect the structural EXPECTED-FAIL framing with cited next steps"
  - "consecutive_failures counter in invariant-firing-log resets to 0 (automatic on PASS)"
files_likely_involved:
  - "system/invariants.md (status text)"
  - "kit/scripts/cwos-verify.js (the check function)"
depends_on:
  - "${invId}"
auto_generated_by: "cwos-migrate-watch"
auto_generated_at: "${now}"
blocked_by_note: "Auto-generated escalation; founder triages remediation path. See depends_on invariant for the exact rule that's failing."
`;
}

function resolveDirs(opts) {
  const rootDir = opts.rootDir
    || findRepoRoot(process.cwd(), { markers: ['CLAUDE.md', 'kit'], requireAll: true, maxDepth: 8 });
  const wsDir = opts.wsDir || findWorkstreamDir(rootDir);
  return { rootDir, wsDir };
}

/**
 * Link or create an owner for every due invariant. Pure of stdout — callers
 * render the returned report (verify prints one line; the CLI prints JSON).
 *
 * @param {object} opts { dryRun, rootDir, wsDir, now }
 * @returns {{ok:true, escalations:Array, dry_run:boolean}}
 *   escalations[]: { invariant_id, action: 'linked'|'created', ws_id, reason,
 *                    stale_owner?, consecutive_failures, first_failed_at, path? }
 */
function runWatch(opts = {}) {
  const dryRun = !!opts.dryRun;
  const now = opts.now || new Date();
  const { rootDir, wsDir } = resolveDirs(opts);
  // A stamp-only dir (CWOS_VERIFY_STAMP_DIR, test sandboxes) has no queue to
  // put an owner in — and nothing to escalate to.
  if (!fs.existsSync(path.join(wsDir, 'queue'))) return { ok: true, escalations: [], dry_run: dryRun };
  const { path: logPath, data: log } = loadFiringLog(wsDir);

  const escalations = [];
  for (const invId of Object.keys(log.invariants).sort()) {
    const entry = log.invariants[invId];
    const reason = dueReason(entry, now);
    if (!reason) continue;

    let staleOwner = null;
    if (entry.migration_ws_id) {
      const state = ownerState(wsDir, entry.migration_ws_id);
      if (state === 'open') continue;
      // WS-437 was dismissed and INV-039 kept firing for months with this
      // field still pointing at it: a closed owner is no owner.
      staleOwner = { ws_id: entry.migration_ws_id, state };
    }

    const base = {
      invariant_id: invId,
      reason,
      consecutive_failures: entry.consecutive_failures,
      first_failed_at: entry.first_failed_at || null,
      ...(staleOwner ? { stale_owner: staleOwner } : {}),
    };

    const existing = findExistingOwner(wsDir, invId);
    if (existing) {
      escalations.push({ ...base, action: 'linked', ws_id: existing });
      if (!dryRun) {
        log.invariants[invId] = { ...entry, migration_ws_id: existing };
        emit(wsDir, 'migration_linked', { ...base, ws_id: existing, by: 'existing-item' });
      }
      continue;
    }

    if (dryRun) {
      escalations.push({ ...base, action: 'created', ws_id: '(dry-run)' });
      continue;
    }

    const invCtx = loadInvariantContext(rootDir, invId);
    let wsPath = null;
    // Written inside the allocator's lock so no concurrent caller can be handed
    // the same id (the WS-040 class pickNextFreeWsId's bare max+1 scan had).
    // The remote and every-branch scans stay on, as in cwos-item: an id open on
    // a PR or cloud branch is taken too. Their cost lands only when an owner is
    // actually created, which is rare.
    const wsId = allocateId('ws', {
      wsDir,
      reservedBy: 'cwos-migrate-watch',
      writer: (id) => {
        wsPath = path.join(wsDir, 'queue', `${id}.yaml`);
        writeFileAtomic(wsPath, buildMigrationWsYaml(id, invId, invCtx, entry, reason));
      },
    });
    log.invariants[invId] = { ...entry, migration_ws_id: wsId };
    emit(wsDir, 'migration_auto_promoted', { ...base, ws_id: wsId });
    escalations.push({ ...base, action: 'created', ws_id: wsId, path: path.relative(rootDir, wsPath) });
  }

  if (!dryRun && escalations.length) writeFileAtomic(logPath, serializeFiringLog(log));
  return { ok: true, escalations, dry_run: dryRun };
}

/** Record `wsId` as the owner of `invId` by hand. Throws on an unknown id. */
function runLink(invId, wsId, opts = {}) {
  if (!/^INV-[\w-]+$/.test(invId || '')) throw new Error(`not an invariant id: ${invId}`);
  if (!/^WS-\d+$/.test(wsId || '')) throw new Error(`not a work item id: ${wsId}`);
  const { wsDir } = resolveDirs(opts);
  const { path: logPath, data: log } = loadFiringLog(wsDir);
  const entry = log.invariants[invId];
  if (!entry) throw new Error(`${invId} has no entry in the firing log — verify has never measured it`);
  const state = ownerState(wsDir, wsId);
  if (state !== 'open') throw new Error(`${wsId} is ${state} — only an open item can own an invariant`);
  const prior = entry.migration_ws_id || null;
  log.invariants[invId] = { ...entry, migration_ws_id: wsId };
  writeFileAtomic(logPath, serializeFiringLog(log));
  emit(wsDir, 'migration_linked', { invariant_id: invId, ws_id: wsId, prior_ws_id: prior, by: 'hand' });
  return { ok: true, invariant_id: invId, ws_id: wsId, prior_ws_id: prior };
}

function main() {
  const { values, positionals } = cliGate(process.argv.slice(2), CLI);
  if (values.link) {
    try {
      const r = runLink(values.link, (positionals || [])[0]);
      process.stdout.write(JSON.stringify(r, null, 2) + '\n');
    } catch (e) {
      process.stderr.write(`cwos-migrate-watch: ${e.message}\n`);
      process.exit(1);
    }
    return;
  }
  const dryRun = values.list || values['dry-run'];
  if (!dryRun && !values.watch) {
    process.stderr.write('cwos-migrate-watch: pass --watch (apply), --list (dry-run) or --link INV-NNN WS-NNN\n');
    process.exit(2);
  }
  const r = runWatch({ dryRun });
  if (!r.escalations.length) r.note = 'no red invariant is without an owner';
  process.stdout.write(JSON.stringify(r, null, 2) + '\n');
}

if (require.main === module) main();

module.exports = { runWatch, runLink, dueReason, findExistingOwner, ownerState, loadInvariantContext, AGE_THRESHOLD_DAYS, buildMigrationWsYaml };
