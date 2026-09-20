#!/usr/bin/env node
/**
 * cwos-command-deps-validate — publish-time gate for command→script references.
 *
 * INV-064 (cwos-manifest-deps-validate.js) asks whether the MANIFEST ships every
 * module a registered SCRIPT require()s. It walks the require() graph, and that
 * graph is the whole of what it can see.
 *
 * Commands do not live in that graph. A command is markdown, and it reaches a
 * script by telling the session to run `node kit/scripts/x.js`. Nothing read
 * those instructions, so a shipping command could name a script the MANIFEST
 * never ships and no gate anywhere noticed.
 *
 * That is WS-639. Measured 2026-08-14: six such edges across four shipping
 * commands, five distinct scripts, every one of them present in HomeBase and
 * absent from kit/MANIFEST.yaml. On the fleet, claude-poker-tracker and
 * ai-personal were missing all five; serveyournote had them only because it was
 * installed before the boundary drifted.
 *
 * The sharpest instance, and the reason this went unseen for months:
 * `/status` Step 0d runs `cwos-kit-health.js --json` and renders its entire Kit
 * Health section from the output. That script's job is to report whether the kit
 * installed correctly — and it was the single most conspicuous thing missing
 * from the install. THE GAP DETECTOR WAS THE GAP. Every tool that would have
 * reported this class was itself a member of it.
 *
 * WHAT IT CHECKS, over every command the manifest ships:
 *
 *   unshipped-script-ref   the command invokes a script that exists on disk but
 *                          is absent from kit/MANIFEST.yaml. In an adopted repo
 *                          the file is simply not there.
 *   unresolvable-script-ref the command invokes a path that exists nowhere, so
 *                          it is dead in HomeBase too — a rename or a typo.
 *
 * WHAT IT OBSERVES BUT DOES NOT FAIL ON: tier-gap.
 *
 * INV-064 fails a require() whose target ships at a LATER capability tier than
 * its consumer, because a module that is not there is a hard crash. The first
 * draft of this gate carried that rule over to commands by analogy. The analogy
 * does not hold, and the tree said so immediately: 43 of 50 findings were
 * tier-gaps, across nearly every command in the kit.
 *
 * They are not 43 bugs. `status.md` is capability `core` and invokes
 * `cwos-event.js`, which is `workstream` — and CLAUDE.md requires event
 * emission at every command boundary while ALSO requiring that commands work at
 * any milestone and degrade (the Graceful Degradation table). A command is
 * prose interpreted by a session that can notice a missing file and carry on; a
 * require() is not. Whether the tiering is wrong or the rule simply does not
 * transfer is a real architectural question — and it is not this gate's to
 * answer.
 *
 * So tier gaps are counted, deduped per (command, script), and reported under
 * `info`. They never fail. A release gate that hard-blocked on 43 pre-existing
 * conditions would not be a gate; it would be an outage, and the first thing
 * anyone did with it would be to add the bypass flag this file refuses to have.
 * The data stays visible so the question stays answerable — see WS-644.
 *
 * WHAT COUNTS AS AN INVOCATION — the load-bearing decision.
 *
 * Only two forms count: `node <path>.js` and `require('<path>')`. A bare mention
 * of a filename in prose does NOT. This is not conservatism for its own sake; a
 * looser rule is actively wrong, and the first scan of this class proved it
 * twice in the same pass:
 *
 *   1. `[\w-]+\.js` matches the `.js` inside `autopilot-cycles.jsonl` — a LOG
 *      FILE — and reports a script that never existed and never should. Hence
 *      the `(?![\w])` guard: `.js` must not be followed by a word character.
 *   2. fleet/commands/adopt.md names `cwos-verify-install.js` in prose precisely
 *      to say it is NOT yet shipped and `/audit` covers for it. Prose discussing
 *      a script's absence is the opposite of a dependency on it.
 *
 * Both live in __tests__/command-deps-validate.test.js as must-NOT-fire cases.
 * A gate that cries wolf gets disabled, and these two are exactly how it would.
 *
 * NON-SHIPPING COMMANDS ARE EXEMPT. fleet/ and sim/ commands are HomeBase-only
 * apparatus (ADR-049); they run where every script exists, so their references
 * cannot break an adopter. They are counted and reported under `info`, never as
 * violations — visible, so "did it even look at fleet/?" stays answerable.
 *
 * THERE IS DELIBERATELY NO WAIVER MECHANISM, and no bypass flag.
 *
 * INV-068 waives broken DECLARATIONS because a declaration can be legitimately
 * ahead of its consumer. Nothing analogous applies here: the fix for "a command
 * needs a script the kit does not ship" is to ship the script, which is a
 * one-row MANIFEST edit. A waiver would only ever buy time against a ten-second
 * change.
 *
 * Note also that a waiver registry with no waivers in it is a mechanism nothing
 * reads — which is the exact condition INV-068 fails on. Building one here would
 * trip the sibling gate on the way out the door.
 *
 * Commands that tolerate a script's absence at runtime (session-start.md says so
 * in prose for cwos-exception-sunset-check.js) still FAIL this gate, by decision
 * 2026-08-14. Graceful degradation protects repos on OLDER kits; it is not a
 * licence for the CURRENT kit to omit the file. The two concerns are orthogonal
 * and conflating them is what let the omission look intentional.
 *
 * Usage:
 *   node kit/scripts/cwos-command-deps-validate.js            # JSON to stdout
 *   node kit/scripts/cwos-command-deps-validate.js --human
 *   node kit/scripts/cwos-command-deps-validate.js --root <p>
 *
 * Exit codes: 0 = clean | 1 = violation(s) | 2 = invalid arg / manifest unreadable.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { cliGate } = require('./lib/cli');
const { readYAMLFile } = require('./lib/cwos-utils');
const { CAPABILITY_ORDER } = require('./lib/capability-map');

const CLI = {
  name: 'cwos-command-deps-validate',
  summary: 'verify kit/MANIFEST.yaml ships every script its registered commands invoke',
  flags: {
    human: { type: 'boolean', describe: 'render a readable report instead of JSON' },
    root: { type: 'string', placeholder: 'path', describe: 'HomeBase root (default: walk up from this script)' },
  },
  notes: [
    'Runs at publish time from cwos-hash-manifest.js, so a command referencing an',
    'unshipped script cannot reach a kit release, and as INV-073 in cwos-verify.js.',
    '',
    'Only `node <path>.js` and `require(<path>)` count as invocations. A filename',
    'mentioned in prose does not — see the header comment for why that matters.',
    '',
    'There is no waiver mechanism and no bypass flag: the fix for every violation',
    'this reports is a one-row addition to kit/MANIFEST.yaml.',
  ].join('\n'),
};

// Command sources, in manifest-path form. fleet/ and sim/ are HomeBase-only.
const COMMAND_DIRS = ['kit/commands', 'fleet/commands', 'sim/commands'];

// ─── extraction ─────────────────────────────────────────────────────────────

/**
 * Every script path a command invokes, with the line it appears on.
 *
 * Two anchors, both requiring a real invocation keyword. The `(?![\w])` after
 * `\.js` is what keeps `autopilot-cycles.jsonl` out; without it the extractor
 * invents a script from a log filename. See the header comment.
 *
 * `node` may be followed by flags (`node --experimental-x foo.js`), so the
 * pattern tolerates leading `-`-prefixed tokens before the path.
 */
function scanInvocations(text) {
  const found = [];
  const lines = text.split('\n');

  // `node [flags] <path>.js`
  const NODE_RE = /\bnode\s+((?:-{1,2}[\w-]+(?:=\S+)?\s+)*)([./\w-]*[\w-]+\.js)(?![\w])/g;
  // `require('<path>')` / require("<path>") / require(`<path>`)
  const REQUIRE_RE = /\brequire\s*\(\s*['"`]([./\w-]+)['"`]\s*\)/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const m of line.matchAll(NODE_RE)) {
      found.push({ raw: m[2], line: i + 1, form: 'node' });
    }
    for (const m of line.matchAll(REQUIRE_RE)) {
      const spec = m[1];
      // Only kit script paths are in scope. A command illustrating
      // require('fs') is not making a claim about the manifest.
      if (!/(^|\/)kit\/scripts\//.test(spec)) continue;
      found.push({ raw: spec, line: i + 1, form: 'require' });
    }
  }
  return found;
}

/**
 * Normalize an extracted reference to a manifest `source:` path.
 *
 * Commands write paths relative to the repo root (`kit/scripts/x.js`), sometimes
 * with a leading `./`. require() specs routinely omit the `.js`. Returns null for
 * anything that does not land under kit/scripts/, which is the only tree the
 * manifest ships scripts from.
 */
function normalizeRef(raw) {
  let p = String(raw).split('\\').join('/').replace(/^\.\//, '');
  const idx = p.indexOf('kit/scripts/');
  if (idx === -1) return null;
  p = p.slice(idx);
  if (!p.endsWith('.js')) p += '.js';
  return p;
}

// ─── the check ──────────────────────────────────────────────────────────────

function tierIndex(capability) {
  return CAPABILITY_ORDER.indexOf(capability);
}

function listCommandFiles(root) {
  const out = [];
  for (const dir of COMMAND_DIRS) {
    const abs = path.join(root, dir);
    let names;
    try { names = fs.readdirSync(abs); } catch { continue; }
    for (const n of names) {
      if (n.endsWith('.md')) out.push(`${dir}/${n}`);
    }
  }
  return out;
}

/**
 * Pure check. Returns a plain result object; never exits, never writes.
 * Exported so cwos-verify.js and the test suite can call it directly.
 */
function checkCommandDeps(root) {
  const manifestPath = path.join(root, 'kit', 'MANIFEST.yaml');
  const read = readYAMLFile(manifestPath);
  if (!read.ok) {
    return { ok: false, exit_code: 2, error: `cannot read kit/MANIFEST.yaml: ${read.error}`, violations: [] };
  }
  const entries = read.data && read.data.files;
  if (!Array.isArray(entries)) {
    return { ok: false, exit_code: 2, error: 'kit/MANIFEST.yaml has no files array', violations: [] };
  }

  const bySource = new Map();
  for (const e of entries) {
    if (e && e.source) bySource.set(String(e.source).split('\\').join('/'), e);
  }

  const violations = [];
  const info = [];
  const tierGapSeen = new Set();
  let shippingCommands = 0;
  let edgesChecked = 0;

  for (const cmdRel of listCommandFiles(root)) {
    const cmdEntry = bySource.get(cmdRel);
    const abs = path.join(root, cmdRel);

    let text;
    try { text = fs.readFileSync(abs, 'utf8'); } catch { continue; }

    const refs = scanInvocations(text);
    if (cmdEntry) shippingCommands++;

    for (const ref of refs) {
      const target = normalizeRef(ref.raw);
      if (!target) continue;
      edgesChecked++;

      // HomeBase-only command: cannot break an adopter. Recorded, never failed.
      if (!cmdEntry) {
        info.push({
          kind: 'homebase-only-command',
          command: cmdRel,
          line: ref.line,
          target,
          detail: `${cmdRel} is not shipped by the manifest — its reference to ${target} cannot reach an adopted repo`,
        });
        continue;
      }

      const onDisk = fs.existsSync(path.join(root, target));
      const targetEntry = bySource.get(target);

      if (!onDisk) {
        violations.push({
          kind: 'unresolvable-script-ref',
          command: cmdRel,
          line: ref.line,
          form: ref.form,
          target,
          detail: `${cmdRel}:${ref.line} invokes ${target}, which does not exist on disk — dead in HomeBase too`,
        });
        continue;
      }

      if (!targetEntry) {
        violations.push({
          kind: 'unshipped-script-ref',
          command: cmdRel,
          line: ref.line,
          form: ref.form,
          target,
          detail: `${cmdRel}:${ref.line} invokes ${target}, which kit/MANIFEST.yaml does not ship — absent in every adopted repo`,
        });
        continue;
      }

      // Observed, never failed — see the header. Deduped per (command, script):
      // next.md invokes cwos-next.js six times and that is one gap, not six.
      const cmdTier = tierIndex(cmdEntry.capability);
      const depTier = tierIndex(targetEntry.capability);
      if (cmdTier >= 0 && depTier >= 0 && depTier > cmdTier) {
        const key = `${cmdRel} ${target}`;
        if (!tierGapSeen.has(key)) {
          tierGapSeen.add(key);
          info.push({
            kind: 'tier-gap',
            command: cmdRel,
            line: ref.line,
            target,
            command_capability: cmdEntry.capability,
            script_capability: targetEntry.capability,
            detail: `${cmdRel} [${cmdEntry.capability}] invokes ${target} [${targetEntry.capability}] — a repo at the command's tier installs the command without the script`,
          });
        }
      }
    }
  }

  return {
    ok: violations.length === 0,
    exit_code: violations.length === 0 ? 0 : 1,
    commands_scanned: listCommandFiles(root).length,
    shipping_commands: shippingCommands,
    edges_checked: edgesChecked,
    violations,
    info,
  };
}

// ─── rendering ──────────────────────────────────────────────────────────────

function renderHuman(result) {
  const out = [];
  if (result.error) return `command-deps: ERROR — ${result.error}\n`;

  out.push(
    `command-deps: ${result.commands_scanned} command(s) scanned ` +
    `(${result.shipping_commands} shipped), ${result.edges_checked} invocation(s) resolved.`
  );

  if (!result.violations.length) {
    out.push('  OK — every script a shipped command invokes is shipped, at or below the command\'s tier.');
  } else {
    out.push(`  ${result.violations.length} violation(s):`);
    for (const v of result.violations) out.push(`    [${v.kind}] ${v.detail}`);
    out.push('');
    out.push('  Fix: add the script to kit/MANIFEST.yaml at a capability tier <= its command.');
  }

  // Stated on every run, pass or fail — the same reason INV-064 always prints
  // its kit/data line. A check that only speaks when it fails leaves "did it
  // look at fleet/ at all?" unanswerable.
  const exempt = result.info.filter((i) => i.kind === 'homebase-only-command');
  const gaps = result.info.filter((i) => i.kind === 'tier-gap');

  out.push(`  ${exempt.length} reference(s) from HomeBase-only commands — exempt, cannot reach an adopter.`);
  out.push(`  ${gaps.length} tier gap(s) — observed, not failed (see WS-644):`);
  for (const g of gaps.slice(0, 8)) {
    out.push(`    ${g.command} [${g.command_capability}] -> ${path.basename(g.target)} [${g.script_capability}]`);
  }
  if (gaps.length > 8) out.push(`    … and ${gaps.length - 8} more`);

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
  const result = checkCommandDeps(root);

  if (values.human) process.stdout.write(renderHuman(result));
  else process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  process.exit(result.exit_code);
}

module.exports = { checkCommandDeps, scanInvocations, normalizeRef, renderHuman };

if (require.main === module) main();
