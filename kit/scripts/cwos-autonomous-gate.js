#!/usr/bin/env node
/**
 * cwos-autonomous-gate — machine-facing eligibility gate for unattended A0 work.
 *
 * This is the AI session's gate, not the founder's. /next composes sprints for
 * founder approval; this gate answers a different question: "which queue items
 * may an autonomous session execute and close with NO founder in the loop?"
 * It implements the fail-closed eligibility contract from the repo's lanes
 * policy (in melody-hill: docs/canonical/04_LANES_AND_APPROVAL.md, "Eligibility
 * for unattended execution", as amended 2026-09-01: approval derives from RISK,
 * not effort):
 *
 *   1. status: backlog, unclaimed, no decision flags, no open blockers
 *      (blocked_by; a legacy depends_on field counts as blocked_by — the
 *      WS-004 case, where the dependency lived in a field nothing enforced),
 *      not referenced by any open (approved/active, uncompleted) sprint.
 *   2. Declared file scope (files_involved) exists, is real paths (not prose),
 *      and falls inside ONE lane whose band_ceiling is A0. Missing or vague
 *      scope DISQUALIFIES the item; disqualified items are reported by name,
 *      never silently dropped.
 *   3. Risk fields (2026-09-01 schema): `external_acts` must be empty or
 *      absent — any declared external act (dns-change, account creation,
 *      client-contact, publishing, ...) is an A3 pause gate. `facts_needed`
 *      must be `repo` (or absent) — items needing founder/client/third-party
 *      held facts belong on the founder's waiting list, not an AI queue.
 *      `verify: founder` items may be BUILT autonomously but never CLOSED
 *      unattended, so they are not eligible here.
 *   4. Effort is a SIZING hint, not an approval band: S and M are admitted by
 *      default, L only with --max-effort L. Undeclared effort fails closed.
 *   5. Vitals green. Red vitals block the gate; --override-vitals with a
 *      rationale (>= 20 chars) is the audited founder escape valve.
 *
 * No lane registry (.claude/workstream/lanes.yaml) => blocked. A repo that has
 * not defined lane ceilings has not defined unattended authority, and the gate
 * fails closed rather than inventing policy.
 *
 * READ-ONLY: this script never writes state. Claiming, executing, and closing
 * items is the dispatcher's job (see the autopilot-local command), using the
 * same claim + reconcile machinery every other consumer uses.
 *
 * Usage:
 *   node kit/scripts/cwos-autonomous-gate.js [--human] [--max-effort S|M|L]
 *        [--limit <n>] [--override-vitals "<rationale >= 20 chars>"]
 *
 * Output: JSON by default. Exit 0 = gate ran (eligible list may be empty),
 * exit 1 = blocked (vitals red without override, or no lane registry),
 * exit 2 = bad arguments (unknown flags refused per ADR-063).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  readYAMLFile,
  globFiles,
  findWorkstreamDir,
  findRepoRoot,
} = require('./lib/cwos-utils');
const { selectSlate } = require('./core/select-slate');

// ---------------------------------------------------------------- args

const HELP = `cwos-autonomous-gate — eligibility gate for unattended A0 execution

Reports which queue items an autonomous session may execute and close without
founder involvement, per the repo's lane policy. Approval derives from risk
(lane ceiling, external acts, whose facts, who verifies) — effort only sizes
the cycle. Read-only; fail-closed.

Usage:
  node kit/scripts/cwos-autonomous-gate.js [options]

Options:
  --human                  table output instead of JSON
  --max-effort S|M|L       largest effort admitted (default M; L is a
                           deliberate founder choice, not a default)
  --limit <n>              cap the eligible list (default: all)
  --override-vitals "<r>"  proceed despite red vitals; rationale >= 20 chars,
                           echoed into output for the dispatcher's audit log
  --help                   this text

Exit codes: 0 ran, 1 blocked, 2 bad arguments.`;

const EFFORT_RANK = { S: 1, M: 2, L: 3 };

function parseArgs(argv) {
  const args = { human: false, maxEffort: 'M', limit: null, overrideVitals: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { console.log(HELP); process.exit(0); }
    else if (a === '--human') args.human = true;
    else if (a === '--json') { /* default; accepted for symmetry */ }
    else if (a === '--max-effort') {
      const v = (argv[++i] || '').toUpperCase();
      if (!EFFORT_RANK[v]) { console.error('--max-effort requires S, M, or L'); process.exit(2); }
      args.maxEffort = v;
    } else if (a === '--limit') {
      const n = parseInt(argv[++i], 10);
      if (!Number.isFinite(n) || n < 1) { console.error('--limit requires a positive integer'); process.exit(2); }
      args.limit = n;
    } else if (a === '--override-vitals') {
      const r = argv[++i];
      if (!r || r.trim().length < 20) { console.error('--override-vitals requires a rationale of >= 20 characters'); process.exit(2); }
      args.overrideVitals = r.trim();
    } else {
      console.error(`Unknown flag: ${a}\nRun with --help for usage.`);
      process.exit(2);
    }
  }
  return args;
}

// ---------------------------------------------------------------- lane matching

// Minimal glob for lane `holds` patterns: ** = any depth, * = within segment.
function globToRegex(pattern) {
  const norm = pattern.replace(/\\/g, '/');
  let re = '';
  for (let i = 0; i < norm.length; i++) {
    const c = norm[i];
    if (c === '*') {
      if (norm[i + 1] === '*') {
        // `**` (optionally followed by /) matches any depth including none
        re += '(?:.*)';
        i++;
        if (norm[i + 1] === '/') i++;
      } else {
        re += '[^/]*';
      }
    } else if ('.+?^${}()|[]'.includes(c)) {
      re += '\\' + c;
    } else if (c === '/') {
      re += '/';
    } else {
      re += c;
    }
  }
  return new RegExp('^' + re + '$');
}

function laneForPath(lanes, filePath) {
  const norm = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  for (const lane of lanes) {
    const holds = Array.isArray(lane.holds) ? lane.holds : [];
    for (const pattern of holds) {
      if (globToRegex(pattern).test(norm)) return lane;
    }
  }
  return null;
}

// Path-shaped: a repo path, not prose. Same heuristic family as /autopilot
// stage B (WS-560): has a slash or a file extension, no "Label: " prefix,
// no sentence-like content.
function isPathShaped(entry) {
  if (typeof entry !== 'string') return false;
  const s = entry.trim();
  if (!s || s.length > 260) return false;
  if (/:\s/.test(s)) return false;          // "Label: value" prose
  if (/\s/.test(s)) return false;           // spaces => prose, not a path
  return s.includes('/') || s.includes('\\') || /\.[A-Za-z0-9]{1,10}$/.test(s);
}

// ---------------------------------------------------------------- load state

function loadYaml(p) {
  if (!fs.existsSync(p)) return null;
  const res = readYAMLFile(p);
  return res && res.ok !== false ? (res.data || res) : null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const wsDir = findWorkstreamDir(process.cwd());
  const repoRoot = findRepoRoot(process.cwd()) || process.cwd();
  const blockReasons = [];

  if (!wsDir || !fs.existsSync(wsDir)) {
    emit({ blocked: true, block_reasons: ['no .claude/workstream directory found'] }, args);
    process.exit(1);
  }

  // Lane registry — absence fails closed.
  const lanesFile = path.join(wsDir, 'lanes.yaml');
  const lanesDoc = loadYaml(lanesFile);
  const lanes = lanesDoc && Array.isArray(lanesDoc.lanes) ? lanesDoc.lanes : null;
  if (!lanes || lanes.length === 0) {
    emit({
      blocked: true,
      block_reasons: ['no lane registry (.claude/workstream/lanes.yaml) — unattended authority is undefined for this repo; fail closed. Define lanes with band ceilings before autonomous execution.'],
    }, args);
    process.exit(1);
  }

  // Vitals from system-summary.yaml (carried-forward; check observation age).
  const summary = loadYaml(path.join(wsDir, 'system-summary.yaml')) || {};
  const vitalsOk = summary.vital_signs_ok === true || summary.vital_signs_ok === 'true';
  const redVitals = Array.isArray(summary.red_vitals) ? summary.red_vitals : [];
  const observedAt = summary.vitals_observed_at || null;
  let vitalsStale = true;
  if (observedAt) {
    const ageMs = Date.now() - Date.parse(observedAt);
    vitalsStale = !Number.isFinite(ageMs) || ageMs > 24 * 3600 * 1000;
  }
  const vitals = { ok: vitalsOk, red: redVitals, observed_at: observedAt, stale: vitalsStale };

  if (!vitalsOk && !args.overrideVitals) {
    blockReasons.push(`vitals red (${redVitals.length ? redVitals.join(', ') : 'vital_signs_ok=false'}) — unattended execution requires green vitals or --override-vitals "<rationale>"`);
  }
  if (vitalsOk && vitalsStale) {
    blockReasons.push(`vitals last observed ${observedAt || 'never'} (>24h) — run /verify to refresh before an unattended run`);
  }

  // Risk-appetite registry (optional; melody-hill 05, ratified 2026-09-01).
  // Maps class id -> { id, appetite } where appetite is the highest RL the
  // founder will sit at for that class. Items declaring risk.accepts in a
  // repo WITHOUT a registry fail closed — declared risk that cannot be
  // evaluated is not evaluated-and-fine.
  const appetiteDoc = loadYaml(path.join(wsDir, 'risk-appetite.yaml'));
  const appetite = appetiteDoc && Array.isArray(appetiteDoc.classes)
    ? new Map(appetiteDoc.classes.map((c) => [String(c.id), c]))
    : null;

  // Open sprints: approved/active without completed_at fence their items.
  const sprintDir = path.join(wsDir, 'sprints');
  const sprintFence = new Map(); // item id -> sprint id
  if (fs.existsSync(sprintDir)) {
    for (const f of globFiles(sprintDir, 'SPR-*.yaml')) {
      const s = loadYaml(f);
      if (!s) continue;
      const open = (s.status === 'approved' || s.status === 'active') && !s.completed_at;
      if (!open) continue;
      const items = Array.isArray(s.items) ? s.items : [];
      for (const it of items) {
        if (it && it.id) sprintFence.set(String(it.id), s.id || path.basename(f, '.yaml'));
      }
    }
  }

  // Queue items — read the item files themselves (the index deliberately
  // omits fields like files_involved; consumers filtering on omitted fields
  // is the WS-560 failure class).
  const queueDir = path.join(wsDir, 'queue');
  const itemFiles = fs.existsSync(queueDir) ? globFiles(queueDir, 'WS-*.yaml') : [];
  const itemsById = new Map();
  for (const f of itemFiles) {
    const it = loadYaml(f);
    if (it && it.id) itemsById.set(String(it.id), it);
  }

  const eligible = [];
  const disqualified = [];
  let backlogCount = 0;

  for (const [id, it] of itemsById) {
    if (it.status !== 'backlog') continue;
    backlogCount++;
    const dq = (reason) => disqualified.push({ id, title: it.title || '', reason });

    if (it.claimed_by) { dq(`claimed by ${it.claimed_by}`); continue; }

    const flags = Array.isArray(it.decision_flags) ? it.decision_flags : [];
    if (flags.length > 0) { dq(`open decision flags (${flags.join(', ')}) — band A2, founder decides`); continue; }

    // blocked_by is canonical; a legacy depends_on field counts too — a
    // dependency written in a field nothing reads is how WS-004 nearly ran
    // before its prerequisite existed.
    const blockers = []
      .concat(Array.isArray(it.blocked_by) ? it.blocked_by : [])
      .concat(Array.isArray(it.depends_on) ? it.depends_on : []);
    const openBlockers = [...new Set(blockers.map(String))].filter((b) => {
      const dep = itemsById.get(b);
      return !dep || dep.status !== 'done';
    });
    if (openBlockers.length > 0) { dq(`blocked by ${openBlockers.join(', ')}`); continue; }

    if (sprintFence.has(id)) { dq(`referenced by open sprint ${sprintFence.get(id)} — a pooled/approved sprint's items await pickup, not poaching`); continue; }

    // Risk fields (2026-09-01): external acts and non-repo facts are A3/founder
    // territory regardless of size. Absent fields default open here because
    // the scope + lane checks below still fail closed; declaring them at
    // intake is what routes an item to the founder's waiting list early.
    const acts = Array.isArray(it.external_acts) ? it.external_acts : [];
    if (acts.length > 0) { dq(`external acts declared (${acts.join(', ')}) — A3 pause gate, never unattended`); continue; }

    const facts = it.facts_needed || 'repo';
    if (facts !== 'repo') { dq(`facts needed from ${facts} — not repo-derivable; belongs on the founder's waiting list`); continue; }

    if (it.verify === 'founder') { dq('acceptance is founder-observable (verify: founder) — may be built autonomously, never closed unattended'); continue; }

    // Risk block (05): accepted risk above the founder's per-class appetite —
    // or graded Assumed — is a founder decision, not an autonomous pull.
    // excess = RL - appetite; positive excess routes to the founder, zero or
    // negative is accepted risk. An Assumed low is a knowledge gap, not a
    // safe square.
    const accepts = it.risk && Array.isArray(it.risk.accepts) ? it.risk.accepts : [];
    if (accepts.length > 0) {
      if (!appetite) { dq('declares risk.accepts but no appetite registry (.claude/workstream/risk-appetite.yaml) — cannot evaluate; fail closed'); continue; }
      let riskDq = null;
      for (const a of accepts) {
        const cls = a && a.class ? String(a.class) : null;
        const cfg = cls ? appetite.get(cls) : null;
        if (!cfg) { riskDq = `unknown risk class ${cls || '(none)'} — vocabulary is bounded; adding a class is a founder decision`; break; }
        if (a.residual && !a.mitigation) { riskDq = `${cls} claims a residual without an in-item mitigation — a deferred mitigation does not reduce today's posture`; break; }
        const m = /^RL([1-5])$/.exec(String(a.residual || a.level || ''));
        if (!m) { riskDq = `${cls} has no parseable RL level/residual`; break; }
        const lvl = parseInt(m[1], 10);
        const app = parseInt(cfg.appetite, 10);
        if (lvl > app) { riskDq = `accepts ${cls} at RL${lvl} above appetite RL${app} (excess +${lvl - app})`; break; }
        const grade = String(a.grade || '').toLowerCase();
        if (!grade || grade === 'assumed') { riskDq = `accepted ${cls} risk graded ${grade || 'ungraded'} — a knowledge gap, not a safe square; go look, then re-grade`; break; }
      }
      if (riskDq) { dq(`risk: ${riskDq} — founder decision`); continue; }
    }

    // Effort: sizing only. Default ceiling M; L is a founder choice.
    const effort = it.effort || null;
    if (!EFFORT_RANK[effort]) { dq('effort undeclared — fail closed'); continue; }
    if (EFFORT_RANK[effort] > EFFORT_RANK[args.maxEffort]) {
      dq(`effort ${effort} exceeds --max-effort ${args.maxEffort} (sizing ceiling, not a risk verdict)`); continue;
    }

    const scope = Array.isArray(it.files_involved) ? it.files_involved : [];
    if (scope.length === 0) { dq('no declared file scope (files_involved missing/empty) — fail closed; add a files_involved: list to make this item eligible'); continue; }
    const badPaths = scope.filter((p) => !isPathShaped(p));
    if (badPaths.length > 0) { dq(`files_involved not path-shaped: ${badPaths.join(' | ')} — fail closed`); continue; }

    const laneHits = new Map(); // lane id -> lane
    let unlanedPath = null;
    for (const p of scope) {
      const lane = laneForPath(lanes, p);
      if (!lane) { unlanedPath = p; break; }
      laneHits.set(lane.id, lane);
    }
    if (unlanedPath) { dq(`path ${unlanedPath} matches no lane — fail closed`); continue; }
    if (laneHits.size > 1) { dq(`scope spans lanes ${[...laneHits.keys()].join(', ')} — cross-lane work takes the highest ceiling; not unattended`); continue; }
    const lane = [...laneHits.values()][0];
    if (lane.band_ceiling !== 'A0') { dq(`lane ${lane.id} ceiling is ${lane.band_ceiling} — only A0 territory is self-approvable end-to-end`); continue; }

    eligible.push({
      id,
      title: it.title || '',
      type: it.type || null,
      effort,
      priority_score: it.priority_score,
      lane: lane.id,
      rigor_floor: lane.rigor_floor || null,
      program: it.program || null,
      files_involved: scope,
    });
  }

  // ORDER comes from the one selector (core/select-slate.js), never a private sort. This
  // was a private descending sort on priority_score over `parseFloat(x) || 0`, which ranked an item
  // nobody scored as if it were scored at the bottom — and gave this gate a third ordering
  // of the same backlog beside /next and /status. Eligibility above IS the dependency gate
  // here, and it is stricter than the store's (any non-done blocker, legacy depends_on
  // included, fails closed), so every item reaching the selector has already cleared it.
  // An undeclared priority is refused BY NAME into `disqualified` (WS-1673; upstreamed
  // from Claude-Poker-Tracker WS-857).
  const slate = selectSlate({
    items: eligible.map((e) => itemsById.get(e.id)),
    resolveGates: () => ({ clear: true, resolutions: [], open: [], unresolvable: [] }),
  });
  const eligibleById = new Map(eligible.map((e) => [e.id, e]));
  for (const r of slate.priority_refusals) {
    const e = eligibleById.get(String(r.item));
    disqualified.push({
      id: r.item,
      title: e ? e.title : '',
      reason: `priority_score is ${r.found}, not a number — an undeclared priority is not a priority of zero; declare one`,
    });
  }
  const ranked = slate.candidates.map((c) => eligibleById.get(String(c.id)));
  const limited = args.limit ? ranked.slice(0, args.limit) : ranked;

  const blocked = blockReasons.length > 0;
  const out = {
    schema_version: 2,
    generated_at: new Date().toISOString(),
    repo: path.basename(repoRoot),
    blocked,
    block_reasons: blockReasons,
    vitals,
    override: args.overrideVitals ? { vitals_rationale: args.overrideVitals } : null,
    max_effort: args.maxEffort,
    risk_registry: appetite
      ? { classes: appetite.size, ratified: appetiteDoc.ratified || null, source: appetiteDoc.source_rule || null }
      : null,
    counts: { backlog: backlogCount, eligible: ranked.length, disqualified: disqualified.length },
    eligible: limited,
    disqualified,
  };
  emit(out, args);
  process.exit(blocked ? 1 : 0);
}

function emit(out, args) {
  if (!args || !args.human) {
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  const c = out.counts || { backlog: 0, eligible: 0, disqualified: 0 };
  console.log(`Autonomous gate — ${out.blocked ? 'BLOCKED' : 'open'}`);
  for (const r of out.block_reasons || []) console.log(`  ! ${r}`);
  if (out.vitals) console.log(`Vitals: ${out.vitals.ok ? 'green' : 'RED'}${out.vitals.stale ? ' (stale observation)' : ''}  observed ${out.vitals.observed_at || 'never'}`);
  console.log(`Backlog ${c.backlog} | eligible ${c.eligible} | disqualified ${c.disqualified} | max effort ${out.max_effort || 'M'}`);
  for (const e of out.eligible || []) {
    console.log(`  OK  ${e.id} [${e.effort}/${e.lane}/${e.priority_score}] ${e.title}`);
  }
  for (const d of out.disqualified || []) {
    console.log(`  --  ${d.id}: ${d.reason}`);
  }
}

main();
