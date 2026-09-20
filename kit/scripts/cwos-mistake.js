#!/usr/bin/env node
/**
 * cwos-mistake.js — log a mistake in one breath; analyse later.
 *
 * Founder, 2026-08-17:
 *
 *   "A register or inventory of these things — maybe a command you fire off,
 *    token minimized, just snapshots the previous context that contextualized
 *    the mistake for later processing. If we minimize effort to log these but
 *    make it mandatory, the more likely you are to just, whoof, execute it."
 *
 * The design constraint IS the feature. Every field demanded at capture time is
 * a reason not to capture. So this command asks for exactly two things — a
 * sentence and an enforcement tier — and derives the rest of the context itself:
 *
 *   branch, HEAD, dirty files, the working set touched in the last 45 minutes,
 *   recent commit subjects, the active session id.
 *
 * That is what "snapshots the previous context" means here: pointers and a file
 * list, not prose. Root-cause analysis is expensive and is deliberately NOT done
 * now — `review` batches it later, when there are enough entries to see a shape.
 *
 * This file exists because system/failures.md — the register designated for
 * exactly this job — sat at zero entries with a commented-out template, for the
 * same reason system/invariants.md sat unfilled: the work was deferred to a
 * moment that requires effort and never arrives.
 *
 * ---------------------------------------------------------------------------
 * WHY THE ENFORCEMENT TIER IS MANDATORY (WS-672)
 * ---------------------------------------------------------------------------
 *
 * Every lesson this fleet learned was written as prose. Prose is at once the
 * most expensive way to carry a lesson (paid every session, whether or not it
 * is relevant) and the least reliable way to apply one (it has to be read,
 * remembered, and chosen — at a moment when you are deep in something else).
 *
 * Measured 2026-08-18: CLAUDE.md says in bold "use named file arguments to
 * `git add`, not `git add -A`", with a paragraph explaining the exact failure.
 * That text was in context. The session ran `git add -A` anyway. The prose did
 * not stop it. The `cwos-git.js guard` hook did, instantly.
 *
 * So the tier is not metadata about the lesson — it is the decision about
 * whether the lesson will ever work. Asking it at capture is the whole point,
 * and it is asked HERE rather than at review because review is a moment that
 * requires effort and therefore does not reliably arrive (RC1-deferred, 6
 * entries and counting).
 *
 * A missing --enforcement is a usage error (exit 2, per ADR-063), NOT a silent
 * default. Defaulting to prose is precisely the drift this exists to stop.
 * Every other failure path still exits 0 — see below.
 *
 * Usage:
 *   node cwos-mistake.js "main carried a superseded revision" --class RC4-nocanon --enforcement gate
 *   node cwos-mistake.js review              compact, grouped by root cause
 *   node cwos-mistake.js review --full       include the context snapshots
 *   node cwos-mistake.js classes             the root-cause taxonomy
 *   node cwos-mistake.js tiers               the enforcement taxonomy
 *
 * Never blocks on a WRITE failure. A logger that can stop your work over a
 * missing directory or a git error is a logger you will stop using, so every
 * path except a malformed command line exits 0.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { findWorkstreamDir, findRepoRoot } = require('./lib/cwos-utils');
const { cliGate } = require('./lib/cli');

const CLASSES = {
  'RC1-deferred': 'Work scheduled for a moment that does not reliably arrive (session end, "later", "next pass")',
  'RC2-absence': 'Absence of a record read as a fact about the world',
  'RC3-unwired': 'Artifact mistaken for outcome — built but not wired, or wired but not monitored',
  'RC4-nocanon': 'Superseded or duplicated content stays live; the newest version does not win',
  'RC5-overclaim': 'Claim outruns its source depth — secondary or abstract stated with primary confidence',
  'RC6-frame': 'Anchored on an early frame; later work defends the frame instead of testing it',
  'other': 'Not yet classified — triage at review',
};

/**
 * The enforcement tiers, cheapest and most reliable first.
 *
 * Read this as a ladder you climb DOWN only when forced. The question to ask is
 * not "where should I write this lesson" but "at what boundary could a machine
 * have caught this" — and prose is the answer only when no such boundary exists.
 */
const TIERS = {
  hook: {
    cost: '~0 tokens until it fires',
    reliability: 'cannot be skipped',
    fits: 'mechanically detectable at a tool boundary — a command shape, a path, a file write',
  },
  gate: {
    cost: '0 until /verify runs',
    reliability: 'cannot be merged past',
    fits: 'checkable against the tree or against a command\'s own output',
  },
  contextual: {
    cost: 'a few lines, and only when the moment is keyed',
    reliability: 'usually applied',
    fits: 'needs judgement, but the MOMENT it is needed is detectable',
  },
  prose: {
    cost: 'FULL COST EVERY SESSION, relevant or not',
    reliability: 'often ignored — see the git add -A case above',
    fits: 'genuinely needs a model to read and reason. The tier of last resort.',
  },
};

const TIER_ORDER = ['hook', 'gate', 'contextual', 'prose'];

/**
 * Reserved first-positionals. These are NOT declared as cliGate subcommands.
 *
 * cliGate treats positional[0] as a subcommand whenever `subcommands` is set,
 * which would make the hot path `cwos-mistake log "<sentence>"` — a word between
 * the founder and the capture, in a tool whose entire design premise is that
 * every demanded keystroke is a reason not to log. So the sentence stays bare
 * and these three words are dispatched by hand.
 *
 * The ambiguity is bounded rather than ignored: a word here is read as a
 * subcommand only when it is the SOLE positional and no --enforcement was
 * given. Since capture requires --enforcement, no real capture can be
 * swallowed — including the degenerate one-word summary "review".
 */
const RESERVED = {
  review: 'grouped by root cause, with prose lessons that have already recurred named as promotion candidates',
  classes: 'the root-cause taxonomy',
  tiers: 'the enforcement taxonomy — how a lesson gets applied',
};

const CLI = {
  name: 'cwos-mistake',
  summary: 'log a mistake in one breath, classified by how it will be enforced',
  usage: 'cwos-mistake "<one line>" --enforcement <tier> [options]  |  cwos-mistake <review|classes|tiers>',
  flags: {
    enforcement: {
      type: 'string',
      alias: 'e',
      placeholder: TIER_ORDER.join('|'),
      describe: 'REQUIRED on capture — how this lesson gets applied. Not a label; the decision about whether it will work at all.',
    },
    class: {
      type: 'string',
      alias: 'c',
      placeholder: 'RC1-deferred|…',
      describe: `root cause (default: other). One of: ${Object.keys(CLASSES).join(', ')}`,
    },
    repeat: { type: 'boolean', describe: 'this has happened before — the strongest signal that its tier is wrong' },
    full: { type: 'boolean', describe: 'for review: include the context snapshots' },
    json: { type: 'boolean', describe: 'for review: machine-readable output' },
  },
  notes: [
    'subcommands:',
    ...Object.entries(RESERVED).map(([k, v]) => `  ${k.padEnd(8)} ${v}`),
    '',
    'Capture is cheap and lossless; analysis can wait. The one thing that cannot wait',
    'is the enforcement tier — review is a moment that requires effort and therefore',
    'does not reliably arrive, which is itself the most-logged failure in this register.',
    '',
    'exit 0 — logged, or reviewed (including when the write itself failed)',
    'exit 2 — malformed command line',
  ].join('\n'),
};

function sh(cwd, cmd) {
  try { return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

/** Files touched recently — the working set that actually contextualised the mistake. */
function recentlyTouched(root, minutes) {
  const cutoff = Date.now() - minutes * 60000;
  const out = [];
  const skip = /(^|[\\/])(node_modules|\.git|events|worktrees)([\\/]|$)/;
  (function walk(dir, depth) {
    if (depth > 6 || skip.test(dir)) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p, depth + 1); continue; }
      if (!/\.(md|ya?ml|json|js|py|tsv)$/i.test(e.name)) continue;
      try {
        if (fs.statSync(p).mtimeMs >= cutoff) out.push(path.relative(root, p).replace(/\\/g, '/'));
      } catch { /* skip */ }
    }
  })(root, 0);
  return out.slice(0, 40);
}

function activeSession(wsDir) {
  try {
    const p = path.join(wsDir, '.current-session');
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  } catch { /* ignore */ }
  return null;
}

function logPath(wsDir) {
  return path.join(wsDir, 'mistakes.jsonl');
}

function readAll(wsDir) {
  const LOG = logPath(wsDir);
  if (!fs.existsSync(LOG)) return [];
  return fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function nextId(wsDir) {
  const LOG = logPath(wsDir);
  if (!fs.existsSync(LOG)) return 'MIS-001';
  let n = 0;
  try {
    for (const l of fs.readFileSync(LOG, 'utf8').split('\n')) if (l.trim()) n++;
  } catch { /* ignore */ }
  return 'MIS-' + String(n + 1).padStart(3, '0');
}

/**
 * The tier is missing. This message is doing real work: it has to make
 * answering cheaper than skipping, or the mandatory field becomes the reason
 * capture stops happening.
 */
function explainMissingTier(summary) {
  const L = [];
  L.push('cwos-mistake: --enforcement is required.');
  L.push('');
  L.push('  Not a label — the decision about whether this lesson will ever work.');
  L.push('  Ask: at what boundary could a machine have caught this?');
  L.push('');
  for (const t of TIER_ORDER) {
    L.push(`  --enforcement ${t.padEnd(11)} ${TIERS[t].fits}`);
  }
  L.push('');
  L.push('  Pick `prose` only when no boundary exists. It costs full tokens every');
  L.push('  session and is the tier that measurably fails (WS-672).');
  if (summary) {
    L.push('');
    L.push('  Re-run with your sentence intact:');
    L.push(`    node kit/scripts/cwos-mistake.js "${summary.replace(/"/g, '\\"')}" --enforcement <tier>`);
  }
  return L.join('\n') + '\n';
}

function capture(wsDir, root, summary, values) {
  const klass = CLASSES[values.class] ? values.class : 'other';
  const tier = values.enforcement;

  const entry = {
    id: nextId(wsDir),
    ts: new Date().toISOString(),
    summary,
    class: klass,
    enforcement: tier,
    repeat: !!values.repeat,
    processed: false,
    // --- context snapshot, all derived, none typed ---
    branch: sh(root, 'git rev-parse --abbrev-ref HEAD'),
    head: sh(root, 'git rev-parse --short HEAD'),
    dirty: sh(root, 'git status --porcelain').split('\n').filter(Boolean).slice(0, 25),
    recent_commits: sh(root, 'git log --oneline -5').split('\n').filter(Boolean),
    working_set: recentlyTouched(root, 45),
    session: activeSession(wsDir),
    cwd: path.basename(root),
  };

  try {
    fs.mkdirSync(path.dirname(logPath(wsDir)), { recursive: true });
    fs.appendFileSync(logPath(wsDir), JSON.stringify(entry) + '\n', 'utf8');
    process.stdout.write(
      `${entry.id} logged [${klass} · ${tier}]${entry.repeat ? ' REPEAT' : ''} — ${entry.working_set.length} file(s) in snapshot\n`
    );
    if (tier !== 'prose') {
      process.stdout.write(`  Not done yet: a ${tier} lesson is only real once the ${tier} exists.\n`);
    }
    if (entry.repeat && tier === 'prose') {
      process.stdout.write('  ⚠  repeat + prose — this has already proven prose does not hold it.\n');
    }
  } catch (e) {
    // Never block. Print the entry so it can be recovered by hand.
    process.stdout.write(`NOT captured (${e.message}) — [${klass} · ${tier}] ${summary}\n`);
  }
  return 0;
}

/**
 * Entries that have recurred AND are still carried as prose.
 *
 * These are defects, not backlog. Each one has proven two things at once: that
 * it will happen again, and that prose does not stop it. Naming them here is
 * what stops the promotion decision from being left to whoever happens to read
 * the list — the same deferral that RC1 describes.
 */
function promotionCandidates(entries) {
  return entries.filter((e) => e.repeat && (e.enforcement || 'prose') === 'prose');
}

function review(wsDir, values) {
  const all = readAll(wsDir);
  const open = all.filter((e) => !e.processed);
  const candidates = promotionCandidates(open);

  if (values.json) {
    process.stdout.write(JSON.stringify({
      total: all.length,
      unprocessed: open.length,
      by_tier: TIER_ORDER.reduce((a, t) => {
        a[t] = open.filter((e) => (e.enforcement || 'prose') === t).length;
        return a;
      }, {}),
      backfilled: open.filter((e) => e.enforcement_backfilled).length,
      promotion_candidates: candidates.map((e) => ({ id: e.id, class: e.class, summary: e.summary })),
    }, null, 2) + '\n');
    return 0;
  }

  const W = 78;
  const out = (s) => process.stdout.write(s + '\n');

  out('='.repeat(W));
  out('MISTAKE REGISTER');
  out('='.repeat(W));

  if (!all.length) {
    out('');
    out('  Register is empty.');
    out('');
    out('  ⚠️  That is not evidence of no mistakes. system/failures.md sat at zero');
    out('      entries for months for exactly this reason. An empty register is a');
    out('      finding about the logging, not about the work.');
    out('');
    return 0;
  }

  const byClass = {};
  for (const e of open) (byClass[e.class] = byClass[e.class] || []).push(e);
  const ranked = Object.entries(byClass).sort((a, b) => b[1].length - a[1].length);

  for (const [klass, entries] of ranked) {
    const repeats = entries.filter((e) => e.repeat).length;
    out('');
    out(`${klass}  (${entries.length}${repeats ? `, ${repeats} flagged repeat` : ''})`);
    out(`  ${CLASSES[klass] || ''}`);
    out('-'.repeat(W));
    for (const e of entries) {
      const tier = e.enforcement || 'prose';
      const mark = e.enforcement_backfilled ? '~' : ' ';
      out(`  ${e.id}  ${e.ts.slice(0, 10)}  [${tier}]${mark} ${e.summary}`);
      if (values.full) {
        out(`        branch=${e.branch}@${e.head}  session=${e.session || '—'}`);
        if (e.working_set && e.working_set.length) {
          out(`        working set: ${e.working_set.slice(0, 8).join(', ')}${e.working_set.length > 8 ? ` …+${e.working_set.length - 8}` : ''}`);
        }
      }
    }
  }

  // --- enforcement distribution -------------------------------------------
  out('');
  out('='.repeat(W));
  out('ENFORCEMENT TIERS');
  out('-'.repeat(W));
  for (const t of TIER_ORDER) {
    const n = open.filter((e) => (e.enforcement || 'prose') === t).length;
    const bar = '█'.repeat(Math.min(40, n));
    out(`  ${t.padEnd(11)} ${String(n).padStart(3)}  ${bar}`);
  }
  const backfilled = open.filter((e) => e.enforcement_backfilled).length;
  if (backfilled) {
    out(`  (~ marks the ${backfilled} entr${backfilled === 1 ? 'y' : 'ies'} backfilled as prose — never a deliberate choice)`);
  }

  // --- the part that stops the deferral ------------------------------------
  if (candidates.length) {
    out('');
    out('='.repeat(W));
    out(`PROMOTION CANDIDATES — ${candidates.length} recurred and are still prose`);
    out('-'.repeat(W));
    out('  Each has proven it will happen again AND that prose does not hold it.');
    out('  That combination is a defect, not a backlog entry.');
    out('');
    for (const e of candidates) {
      out(`  ${e.id}  [${e.class}]`);
      out(`      ${e.summary.length > 66 ? e.summary.slice(0, 66) + '…' : e.summary}`);
    }
    out('');
    out('  Promote one:  node kit/scripts/cwos-guard.js add --id <id> --pattern "<re>"');
    out('                node kit/scripts/cwos-guard.js test <id> --command "<thing>"');
    out('  Then DELETE its paragraph and name it in the rule\'s `retires:` field.');
    out('  A promotion that leaves the prose behind adds a place to look and');
    out('  reclaims nothing — INV-076 fails while the text is still on disk.');
  }

  out('');
  out('-'.repeat(W));
  out(`  ${all.length} logged · ${open.length} unprocessed · ${all.filter((e) => e.repeat).length} flagged repeat`);
  if (ranked.length && ranked[0][1].length >= 3) {
    out(`  ⚠️  ${ranked[0][0]} has ${ranked[0][1].length} entries — 3+ in one class is a systemic issue,`);
    out('      not a run of bad luck. Promote it to system/failures.md with a prevention.');
  }
  out('='.repeat(W));
  return 0;
}

function main() {
  const { values, positionals } = cliGate(process.argv.slice(2), CLI);

  // Hand-dispatch the reserved words — see RESERVED above for why they are not
  // cliGate subcommands. Sole positional + no --enforcement means it cannot be
  // a capture, so this can never eat a real one.
  const sub = (positionals.length === 1 && !values.enforcement && RESERVED[positionals[0]])
    ? positionals[0]
    : null;

  if (sub === 'classes') {
    for (const [k, v] of Object.entries(CLASSES)) process.stdout.write(`${k.padEnd(15)} ${v}\n`);
    return 0;
  }
  if (sub === 'tiers') {
    process.stdout.write('Enforcement tiers — cheapest and most reliable first.\n\n');
    for (const t of TIER_ORDER) {
      process.stdout.write(`${t}\n`);
      process.stdout.write(`  cost         ${TIERS[t].cost}\n`);
      process.stdout.write(`  reliability  ${TIERS[t].reliability}\n`);
      process.stdout.write(`  fits         ${TIERS[t].fits}\n\n`);
    }
    process.stdout.write('Climb down this ladder only when forced. Prose is the tier of last resort.\n');
    return 0;
  }

  let wsDir;
  try { wsDir = findWorkstreamDir(process.cwd()); }
  catch { process.stderr.write('cwos-mistake: no workstream dir found.\n'); return 2; }

  let root;
  try { root = findRepoRoot(process.cwd()); }
  catch { root = process.cwd(); }

  if (sub === 'review') return review(wsDir, values);

  const summary = positionals.join(' ').trim();
  if (!summary) {
    process.stderr.write('cwos-mistake: needs one sentence describing what went wrong.\n\n');
    process.stderr.write(CLI.usage + '\n');
    return 2;
  }

  if (!values.enforcement) {
    process.stderr.write(explainMissingTier(summary));
    return 2;
  }
  if (!TIERS[values.enforcement]) {
    process.stderr.write(`cwos-mistake: unknown enforcement tier "${values.enforcement}".\n\n`);
    process.stderr.write(explainMissingTier(summary));
    return 2;
  }

  return capture(wsDir, root, summary, values);
}

if (require.main === module) process.exit(main());

module.exports = { CLASSES, TIERS, TIER_ORDER, promotionCandidates, readAll };
