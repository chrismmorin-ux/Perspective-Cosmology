#!/usr/bin/env node
/**
 * cwos-agents-md — create AGENTS.md, and keep its command list from
 * contradicting the repo's own Vital Signs.
 *
 * AGENTS.md (agents.md — the open convention, Linux Foundation / Agentic AI
 * Foundation) is what a non-Claude harness reads. CWOS ships one as a
 * portability hedge: if the harness changes, the repo still explains itself.
 *
 * The hedge is only worth having if it stays true. See lib/agents-md.js for
 * why exactly one section is generated and everything else is prose, and
 * ADR-069 for the decision behind it.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');

const { cliGate } = require('./lib/cli');
const { findRepoRoot, writeFileAtomic } = require('./lib/cwos-utils');
const {
  MARK_START,
  MARK_END,
  agentsPath,
  checkAgentsMd,
  syncAgentsMd,
  renderBlock,
  readVitalSigns,
} = require('./lib/agents-md');

const CLI = {
  name: 'cwos-agents-md',
  summary: "create AGENTS.md and keep its commands identical to state.md's Vital Signs",
  subcommands: {
    check: 'report whether AGENTS.md contradicts the Vital Signs table (exit 1 if it does)',
    sync: 'regenerate the managed command block from the Vital Signs table',
    init: 'create AGENTS.md from the kit template, then sync (never overwrites)',
    adopt: 'add a managed command block to an AGENTS.md that has none (append-only)',
  },
  flags: {
    root: { type: 'string', placeholder: 'path', describe: 'repo root (default: walk up from cwd)' },
    json: { type: 'boolean', describe: 'machine-readable output' },
    quiet: { type: 'boolean', alias: 'q', describe: 'suppress non-error output' },
    'dry-run': { type: 'boolean', describe: 'sync/adopt: report the change, write nothing' },
  },
  notes: [
    'Source of truth is the Vital Signs table in {system_dir}/state.md. The',
    'managed block holds exactly the rows carrying a runnable command — change',
    'a vital sign, run `sync`, and AGENTS.md follows. There is no second place',
    'to edit a command, which is the whole point.',
    '',
    'An AGENTS.md with no cwos:commands markers is reported as `unmanaged` and',
    'checked against nothing. `adopt` brings it under sync by appending a',
    'section; it never rewrites prose someone else wrote.',
    '',
    'Enforced as INV-092 in cwos-verify.js.',
  ].join('\n'),
};

// The full template lives in kit/templates/AGENTS.md and ships to adopted
// repos as AGENTS.md itself (skip-if-exists), so it is normally already on
// disk before this script is ever run. This skeleton is the repair path for a
// repo that has neither — deliberately minimal, so there is no second copy of
// the template's prose to drift.
const SKELETON = [
  '# AGENTS.md',
  '',
  '> Vendor-neutral instructions for any AI coding agent working in this repo.',
  '> Deliberately thin — the full working protocol lives in `CLAUDE.md`.',
  '',
  '## What this repo is',
  '',
  '<!-- One or two sentences. What it does, and for whom. -->',
  '',
].join('\n');

/**
 * The prose above the block must name a command the READER can actually run.
 *
 * `--root` lets this script repair a repo whose own kit predates it — WS-827
 * found all four fleet repos between 3.9.0 and 3.30.1, none of them carrying
 * cwos-agents-md.js. Writing "regenerate with `node
 * kit/scripts/cwos-agents-md.js sync`" into such a repo points the next agent
 * at a file that is not there, which is exactly the defect AGENTS.md exists to
 * stop. So the sentence is chosen from what the target repo actually has.
 */
function commandsSection(repoRoot) {
  const hasScript = fs.existsSync(path.join(repoRoot, 'kit', 'scripts', 'cwos-agents-md.js'));
  return [
    '## Commands',
    '',
    "Generated from the Vital Signs table in `system/state.md` — that table is the",
    hasScript
      ? 'single source of truth. Regenerate with `node kit/scripts/cwos-agents-md.js sync`.'
      : "single source of truth. This repo's kit does not carry `cwos-agents-md.js` yet, so the",
    ...(hasScript ? [] : ['block is regenerated from HomeBase with `--root <this repo>` until a kit',
      'upgrade brings the script here. Do not hand-edit it either way.']),
    '',
    `${MARK_START} — generated from system/state.md Vital Signs. Hand edits are overwritten by \`cwos-agents-md.js sync\` and fail \`cwos-agents-md.js check\`. -->`,
    MARK_END,
    '',
  ].join('\n');
}

function templateText(repoRoot) {
  // HomeBase (and any checkout carrying the kit sources) has the real template.
  for (const candidate of [
    path.join(__dirname, '..', 'templates', 'AGENTS.md'),
    path.join(repoRoot, 'kit', 'templates', 'AGENTS.md'),
  ]) {
    try {
      if (fs.existsSync(candidate)) return { text: fs.readFileSync(candidate, 'utf8'), from: candidate };
    } catch { /* fall through to the skeleton */ }
  }
  return { text: SKELETON + commandsSection(repoRoot), from: '(built-in skeleton)' };
}

function main() {
  const { values, sub } = cliGate(process.argv.slice(2), CLI);
  const repoRoot = values.root ? path.resolve(values.root) : findRepoRoot(process.cwd());
  if (!repoRoot) {
    process.stderr.write('cwos-agents-md: no repo root found (pass --root)\n');
    process.exit(2);
  }
  const say = (s) => { if (!values.quiet) process.stdout.write(s + '\n'); };
  const file = agentsPath(repoRoot);

  if (sub === 'check') {
    const r = checkAgentsMd(repoRoot);
    if (values.json) {
      process.stdout.write(JSON.stringify(r, null, 2) + '\n');
    } else {
      say(`${r.status.toUpperCase()}: ${r.detail}`);
    }
    // `absent` and `unmanaged` are legitimate states, not failures: not every
    // repo ships an AGENTS.md, and one CWOS did not author is not CWOS's to
    // police. `torn` and `no-state` are breakage a human introduced.
    process.exit(r.status === 'fail' || r.status === 'torn' || r.status === 'no-state' ? 1 : 0);
  }

  if (sub === 'sync') {
    const r = syncAgentsMd(repoRoot, { dryRun: values['dry-run'] });
    if (values.json) { process.stdout.write(JSON.stringify(r, null, 2) + '\n'); }
    else if (!r.ok) { say(`nothing synced: AGENTS.md is ${r.reason}`); }
    else { say(r.changed ? `${values['dry-run'] ? 'would rewrite' : 'rewrote'} the command block — ${r.count} command(s)` : `already in sync — ${r.count} command(s)`); }
    process.exit(r.ok ? 0 : 1);
  }

  if (sub === 'init') {
    if (fs.existsSync(file)) {
      say('AGENTS.md already exists — left untouched. Use `sync` to refresh its command block.');
      process.exit(0);
    }
    const tpl = templateText(repoRoot);
    if (!values['dry-run']) writeFileAtomic(file, tpl.text);
    say(`${values['dry-run'] ? 'would create' : 'created'} AGENTS.md from ${tpl.from}`);
    if (!values['dry-run']) {
      const r = syncAgentsMd(repoRoot);
      say(r.ok ? `synced ${r.count} command(s) from state.md Vital Signs` : `command block not synced: ${r.reason}`);
    }
    process.exit(0);
  }

  if (sub === 'adopt') {
    if (!fs.existsSync(file)) {
      say('No AGENTS.md — run `init` first.');
      process.exit(1);
    }
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes(MARK_START)) {
      say('AGENTS.md already carries a managed command block — nothing to adopt.');
      process.exit(0);
    }
    const rows = readVitalSigns(repoRoot) || [];
    const section = commandsSection(repoRoot).replace(`${MARK_END}`, `${renderBlock(rows)}\n${MARK_END}`);
    const next = text.replace(/\s*$/, '\n') + '\n' + section;
    if (!values['dry-run']) writeFileAtomic(file, next);
    say(`${values['dry-run'] ? 'would append' : 'appended'} a managed command block (${rows.length} command(s)) to AGENTS.md`);
    process.exit(0);
  }

  process.stderr.write(`cwos-agents-md: unknown subcommand: ${sub}\n`);
  process.exit(2);
}

if (require.main === module) main();

module.exports = { CLI };
