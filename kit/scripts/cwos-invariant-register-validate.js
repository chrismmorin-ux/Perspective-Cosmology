#!/usr/bin/env node
/**
 * cwos-invariant-register-validate — the register and the enforcement, reconciled.
 *
 * system/invariants.md is the document a session consults to answer "what must
 * always be true here?". cwos-verify.js is the thing that keeps it true. Nothing
 * ever checked that they describe the same set — and by 2026-08-14 they did not:
 * 72 declared invariants, 61 registered checks, and not the same list. Three
 * entries carried a Check Command naming a cwos-verify id that does not exist,
 * so the documented way to verify them exits 2 unrunnable. Ten ids were enforced
 * on every /verify run and appear nowhere in the register, invisible to anyone
 * auditing coverage — INV-071, the release-drift gate, among them.
 *
 * The sharpest instance: INV-019 and INV-020 exist precisely for "a session
 * marked active but not heartbeating". On 2026-08-14 a SessionStart hook warned
 * of exactly that condition. The hook caught it; the invariant register, which
 * names two invariants for it, ran nothing.
 *
 * That is WS-641. This gate makes the drift a failure instead of an archaeology
 * finding. WS-642 closes the drift it reports.
 *
 * WHAT COUNTS AS "ENFORCED" — the load-bearing decision.
 *
 * Grep does not work here. Outside cwos-verify.js, enforcing scripts do not
 * contain their own INV ids (cwos-session-recovery.js has no idea it is
 * INV-019's enforcer); the only binding that exists anywhere is the
 * `**Check Command:**` line in the register itself. So the definition is:
 *
 *   An invariant is enforced iff its Check Command names an enforcer that is
 *   real: either `cwos-verify.js --only X` where X is registered in
 *   INVARIANT_CHECKS, or a script path that exists on disk.
 *
 * Verifiable without executing anything, and strictly tighter than
 * string-presence: a Check Command that lies (names an unregistered id, or a
 * script that was renamed away) FAILS rather than counting as coverage. The
 * looser rule — "the id appears somewhere under kit/" — was measured 2026-08-14
 * to over-report, because an id named in a comment or a queue YAML enforces
 * nothing.
 *
 * THE BUCKETS:
 *
 *   declared-unenforced   FAIL   no Check Command line at all; or the command
 *                                names `--only X` with X unregistered; or the
 *                                named script does not exist on disk.
 *   enforced-undeclared   FAIL   an id in INVARIANT_CHECKS with no `### INV-`
 *                                heading in the register.
 *   enforced-outside-verify INFO the Check Command names a real script other
 *                                than cwos-verify.js. Not a hole — but /verify
 *                                passing does not cover it, and the owning
 *                                script is named so the split is documented
 *                                rather than inferred.
 *
 * WAIVERS — unlike INV-073, this gate has them, and ships with them in use.
 *
 * INV-073 refused a waiver registry because every violation it can raise is a
 * one-row MANIFEST fix. The violations here are not: registering an invariant
 * means writing a real check function, and retiring one is a decision, not an
 * edit. Landing a hard gate over 18 pre-existing discrepancies without waivers
 * would be the "outage, not a gate" the WS-639 header warns about. So the known
 * drift is waived — each entry dated, tracked by WS-642, and rendered on every
 * run — in a `## Waivers (INV-074)` fenced block at the bottom of
 * system/invariants.md, beside the register it waives. The rules are copied
 * from INV-068 (WS-562): a waiver missing tracked_by or expires is malformed, an
 * expired waiver fails, and a waiver that suppresses nothing is itself a
 * violation (obsolete-waiver) — a fixed defect must take its waiver with it.
 *
 * Usage:
 *   node kit/scripts/cwos-invariant-register-validate.js            # JSON
 *   node kit/scripts/cwos-invariant-register-validate.js --human
 *   node kit/scripts/cwos-invariant-register-validate.js --root <p>
 *
 * Exit codes: 0 = clean | 1 = violation(s) | 2 = invalid arg / register unreadable.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { parseYAML, readYAMLFile, boundedSystemDir, todayISO } = require('./lib/cwos-utils');

const CLI = {
  name: 'cwos-invariant-register-validate',
  summary: 'reconcile system/invariants.md against what cwos-verify.js and the named enforcer scripts actually check',
  flags: {
    human: { type: 'boolean', describe: 'render a readable report instead of JSON' },
    root: { type: 'string', placeholder: 'path', describe: 'repo root (default: walk up from this script)' },
  },
  notes: [
    'Runs at publish time from cwos-hash-manifest.js, so register/enforcement drift',
    'cannot reach a kit release, and as INV-074 in cwos-verify.js.',
    '',
    'An invariant counts as enforced iff its **Check Command:** line names a real',
    'enforcer: `cwos-verify.js --only X` with X registered, or a script that exists.',
    'A Check Command that lies fails; prose mentioning an id proves nothing.',
    '',
    'Known drift is waived in the `## Waivers (INV-074)` block of invariants.md —',
    'tracked_by + expires mandatory, obsolete waivers are themselves violations.',
  ].join('\n'),
};

// ─── register parsing ───────────────────────────────────────────────────────

const HEADING_RE = /^### (INV-[A-Za-z0-9-]+)/;
const CHECK_RE = /^\*\*Check Command:\*\*\s*(.*)$/;
// `cwos-verify.js --only <id>` anywhere in the Check Command line. Ids may be
// numeric (INV-073) or slugs (INV-cli-subcommand-cap).
const VERIFY_ONLY_RE = /cwos-verify\.js\s+--only\s+(INV-[A-Za-z0-9-]+)/;
// First repo-relative script path in the line. Test files count: a tripwire
// test that must fail on regression is a real enforcer (INV-no-regex-drift-
// detection is one today).
const SCRIPT_PATH_RE = /((?:kit|fleet|sim)\/[\w./-]+?\.(?:js|ps1|py))/;

/**
 * Parse the register: every `### INV-` heading with its Check Command line (or
 * null), plus the `## Waivers (INV-074)` fenced-yaml block if present.
 */
function parseRegister(text) {
  // \r?\n: the register is CRLF on disk, and `.` refuses to match \r — a plain
  // '\n' split leaves every trailer regex silently failing on real files.
  const lines = text.split(/\r?\n/);
  const entries = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(HEADING_RE);
    if (h) {
      cur = { id: h[1], line: i + 1, check_command: null };
      entries.push(cur);
      continue;
    }
    if (lines[i].startsWith('## ')) { cur = null; continue; }
    if (cur && cur.check_command === null) {
      const c = lines[i].match(CHECK_RE);
      if (c) cur.check_command = c[1].trim();
    }
  }

  let waivers = [];
  const wIdx = lines.findIndex((l) => /^## Waivers \(INV-074\)/.test(l));
  if (wIdx !== -1) {
    const open = lines.indexOf('```yaml', wIdx);
    const close = open === -1 ? -1 : lines.indexOf('```', open + 1);
    if (open !== -1 && close !== -1) {
      const parsed = parseYAML(lines.slice(open + 1, close).join('\n'));
      if (parsed && Array.isArray(parsed.waivers)) waivers = parsed.waivers;
    }
  }
  return { entries, waivers };
}

// ─── the check ──────────────────────────────────────────────────────────────

function resolveSystemDir(root) {
  const cfg = readYAMLFile(path.join(root, '.cwos-config.yaml'));
  const raw = cfg.ok && cfg.data && cfg.data.system_dir;
  if (!raw) return 'system';
  try { return boundedSystemDir(String(raw)); } catch { return 'system'; }
}

/**
 * Pure check. Returns a plain result object; never exits, never writes.
 *
 * opts.today       ISO date for waiver-expiry logic (default: today).
 * opts.registered  injectable array of registered check ids — the test fixtures
 *                  use this; the default lazily requires <root>/kit/scripts/
 *                  cwos-verify.js. Lazy on purpose: cwos-verify requires THIS
 *                  module for its INV-074 wrapper, and a top-level require back
 *                  at it would close the cycle before either finished loading.
 */
function checkInvariantRegister(root, opts = {}) {
  const today = opts.today || todayISO();
  const registerRel = `${resolveSystemDir(root)}/invariants.md`;
  const registerPath = path.join(root, registerRel);

  let text;
  try { text = fs.readFileSync(registerPath, 'utf8'); }
  catch (e) {
    return { ok: false, exit_code: 2, error: `cannot read ${registerRel}: ${e.message}`, violations: [], info: [], waived: [] };
  }

  let registered = opts.registered;
  if (!registered) {
    try {
      ({ INVARIANT_CHECKS: registered } = require(path.join(root, 'kit', 'scripts', 'cwos-verify.js')));
      registered = registered.map((c) => c.id);
    } catch (e) {
      return { ok: false, exit_code: 2, error: `cannot load INVARIANT_CHECKS from kit/scripts/cwos-verify.js: ${e.message}`, violations: [], info: [], waived: [] };
    }
  }
  const registeredSet = new Set(registered);

  const { entries, waivers } = parseRegister(text);
  const declaredSet = new Set(entries.map((e) => e.id));
  const violations = [];
  const info = [];

  for (const e of entries) {
    if (!e.check_command) {
      violations.push({
        kind: 'no-check-command',
        bucket: 'declared-unenforced',
        target: e.id,
        line: e.line,
        detail: `${e.id} (${registerRel}:${e.line}) declares a rule with no **Check Command:** line — nothing enforces it and nothing can`,
      });
      continue;
    }

    const only = e.check_command.match(VERIFY_ONLY_RE);
    if (only) {
      if (!registeredSet.has(only[1])) {
        violations.push({
          kind: 'unregistered-verify-target',
          bucket: 'declared-unenforced',
          target: e.id,
          line: e.line,
          detail: `${e.id} (${registerRel}:${e.line}) says \`cwos-verify.js --only ${only[1]}\` but ${only[1]} is not in INVARIANT_CHECKS — the documented check exits unrunnable`,
        });
      }
      continue; // registered in verify: enforced, nothing to report
    }

    const script = e.check_command.match(SCRIPT_PATH_RE);
    if (!script) {
      violations.push({
        kind: 'unparseable-check-command',
        bucket: 'declared-unenforced',
        target: e.id,
        line: e.line,
        detail: `${e.id} (${registerRel}:${e.line}) has a Check Command naming no script path — unverifiable as written: ${e.check_command.slice(0, 80)}`,
      });
      continue;
    }
    if (!fs.existsSync(path.join(root, script[1]))) {
      violations.push({
        kind: 'missing-enforcer',
        bucket: 'declared-unenforced',
        target: e.id,
        line: e.line,
        detail: `${e.id} (${registerRel}:${e.line}) names ${script[1]} as its enforcer, which does not exist on disk — renamed or removed`,
      });
      continue;
    }
    info.push({
      kind: 'enforced-outside-verify',
      target: e.id,
      line: e.line,
      enforcer: script[1],
      detail: `${e.id} is enforced by ${script[1]}, outside /verify's check set`,
    });
  }

  for (const id of registered) {
    if (!declaredSet.has(id)) {
      violations.push({
        kind: 'undeclared-check',
        bucket: 'enforced-undeclared',
        target: id,
        detail: `${id} is registered in INVARIANT_CHECKS but has no \`### ${id}\` entry in ${registerRel} — enforced on every run, invisible to anyone auditing coverage`,
      });
    }
  }

  // ─── waiver application (INV-068 rules, WS-562) ───────────────────────────
  const waived = [];
  const violByTarget = new Map();
  for (const v of violations) {
    if (!violByTarget.has(v.target)) violByTarget.set(v.target, []);
    violByTarget.get(v.target).push(v);
  }
  const suppressed = new Set();

  for (const w of waivers) {
    if (!w || typeof w !== 'object' || !w.target || !w.tracked_by || !w.expires) {
      violations.push({
        kind: 'malformed-waiver',
        bucket: 'waiver-mechanism',
        target: (w && w.target) || '(no target)',
        detail: `waiver for ${(w && w.target) || '(no target)'} is missing target, tracked_by or expires — an undated waiver is the defect this gate exists to catch`,
      });
      continue;
    }
    if (String(w.expires) < today) {
      violations.push({
        kind: 'expired-waiver',
        bucket: 'waiver-mechanism',
        target: w.target,
        detail: `waiver for ${w.target} (tracked_by ${w.tracked_by}) expired ${w.expires} — the drift it covered is a live violation again`,
      });
      continue;
    }
    const covered = violByTarget.get(w.target);
    if (!covered || covered.every((v) => suppressed.has(v))) {
      violations.push({
        kind: 'obsolete-waiver',
        bucket: 'waiver-mechanism',
        target: w.target,
        detail: `waiver for ${w.target} (tracked_by ${w.tracked_by}) suppresses nothing — the defect was fixed; remove the waiver with it`,
      });
      continue;
    }
    for (const v of covered) {
      suppressed.add(v);
      waived.push({ ...v, waived_by: w.tracked_by, expires: String(w.expires) });
    }
  }

  const remaining = violations.filter((v) => !suppressed.has(v));

  return {
    ok: remaining.length === 0,
    exit_code: remaining.length === 0 ? 0 : 1,
    register: registerRel,
    declared: entries.length,
    registered: registered.length,
    violations: remaining,
    info,
    waived,
  };
}

// ─── rendering ──────────────────────────────────────────────────────────────

function renderHuman(result) {
  const out = [];
  if (result.error) return `invariant-register: ERROR — ${result.error}\n`;

  out.push(
    `invariant-register: ${result.declared} declared in ${result.register}, ` +
    `${result.registered} registered in INVARIANT_CHECKS.`
  );

  if (!result.violations.length) {
    out.push('  OK — every declared invariant names a real enforcer, and every registered check is declared.');
  } else {
    out.push(`  ${result.violations.length} violation(s):`);
    for (const v of result.violations) out.push(`    [${v.kind}] ${v.detail}`);
    out.push('');
    out.push('  Fix: register the check, correct the Check Command, retire the entry, or waive it');
    out.push('  (tracked_by + expires) in the `## Waivers (INV-074)` block of the register.');
  }

  // Stated on every run, pass or fail — waived drift stays visible (dated,
  // tracked, and still failing), and the verify/elsewhere split stays legible.
  if (result.waived.length === 0) {
    out.push('  0 waived — the register holds with no suppression');
  } else {
    out.push(`  ${result.waived.length} waived — dated, tracked, and still drifted:`);
    for (const w of result.waived.slice(0, 6)) {
      out.push(`    ${w.target} [${w.kind}] — ${w.waived_by}, expires ${w.expires}`);
    }
    if (result.waived.length > 6) out.push(`    … and ${result.waived.length - 6} more`);
  }

  const outside = result.info.filter((i) => i.kind === 'enforced-outside-verify');
  out.push(`  ${outside.length} enforced outside /verify — documented, not failed:`);
  for (const i of outside) out.push(`    ${i.target} -> ${i.enforcer}`);

  return out.join('\n') + '\n';
}

// ─── entry point ────────────────────────────────────────────────────────────

function findRoot(override) {
  if (override) return path.resolve(override);
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'kit', 'MANIFEST.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return require('./lib/kit-paths').resolveDistRoot();
}

function main() {
  const { values } = cliGate(process.argv.slice(2), CLI);
  const root = findRoot(values.root);
  const result = checkInvariantRegister(root);

  if (values.human) process.stdout.write(renderHuman(result));
  else process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  process.exit(result.exit_code);
}

module.exports = { checkInvariantRegister, parseRegister, renderHuman };

if (require.main === module) main();
