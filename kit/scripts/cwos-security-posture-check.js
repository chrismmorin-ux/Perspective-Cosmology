#!/usr/bin/env node
// cwos-security-posture-check — Verify a node's actual Claude Code permission
// settings match the posture it declares in fleet/registry.yaml.
//
// Usage:
//   node kit/scripts/cwos-security-posture-check.js            # this node, JSON
//   node kit/scripts/cwos-security-posture-check.js --pretty   # human-readable
//   node kit/scripts/cwos-security-posture-check.js --node <id>
//
// Exit code: 0 when the node matches its declaration, 1 on divergence, 2 on a
// usage/config error, 3 when nothing diverged but a declared control could not
// be read (node classes only — see below). This IS a gate — silent drift in the
// permission posture is exactly what ADR-059 exists to prevent.
//
// Per ADR-059 §4 the kit ships this CHECKER, not a policy: each node declares
// its own `security_posture` block and this script only reports divergence from
// what that node declared. CWOS never imposes a permission posture on an
// adopted repo, whose founder has a risk profile we cannot see.
//
// Remote nodes: run over the documented fleet channel, e.g.
//   ssh cm-node1 "node C:/Users/chris/repos/homebase/kit/scripts/cwos-security-posture-check.js --pretty"
//
// Node classes (WS-942): a Claude Code cloud container is not a machine. It
// has no stable identity, every one of them reports the hostname `vm`, and it
// is gone when its session ends. It used to exit 2 here as "not registered",
// so the berth most exposed to the outside declared nothing and was checked
// against nothing. `node_classes:` in fleet/registry.yaml declares a posture
// for a KIND of node; a host that matches no `nodes:` entry is looked up
// there. A control the container cannot read about itself is reported as
// `unverified` and named, never counted as a pass: with any control unverified
// the run exits 3 and `ok` is false, so a caller keyed on exit 0 or on `ok`
// cannot read "could not check" as "checked".

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { readYAMLFile, findRepoRoot } = require('./lib/cwos-utils.js');

// ─── Args ─────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { pretty: false, node: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--pretty') out.pretty = true;
    else if (argv[i] === '--node') out.node = argv[++i] || null;
    else if (argv[i] === '--help' || argv[i] === '-h') out.help = true;
    else return { error: `unknown argument: ${argv[i]}` };
  }
  return out;
}

// ─── Inputs ───────────────────────────────────────────────────────────────

/** Is THIS process running on a host of the given class? */
function hostIsInClass(cls, probe) {
  if (cls.env && probe.env[cls.env] === 'true') return true;
  return Boolean(cls.hostname) && String(cls.hostname).toLowerCase() === probe.hostname;
}

/**
 * The declaration for a node, by id or hostname. A named machine in `nodes:`
 * always wins; a class is what a host falls back to when it is nobody in
 * particular. `probe` is injectable so the lookup can be tested off-host.
 */
function loadDeclaration(root, nodeId, probe) {
  probe = probe || { hostname: os.hostname().toLowerCase(), env: process.env };
  const registryPath = path.join(root, 'fleet', 'registry.yaml');
  if (!fs.existsSync(registryPath)) {
    // WS-747: NOT_ADOPTED. This repo has no fleet registry, so there is no declaration
    // to verify against and nothing is being skipped.
    return { error: `no fleet/registry.yaml at ${registryPath}`, code: 'no-registry' };
  }
  const { ok, data } = readYAMLFile(registryPath);
  if (!ok || !data || !Array.isArray(data.nodes)) {
    // WS-747: NOT_ADOPTED. No registry to check against, so there is genuinely nothing
    // to verify. Same NOT_ADOPTED class as the missing-file case above.
    return { error: 'fleet/registry.yaml has no readable nodes: block', code: 'no-registry' };
  }

  const wanted = (nodeId || probe.hostname).toLowerCase();
  const node = data.nodes.find(
    (n) => String(n.id || '').toLowerCase() === wanted
        || String(n.hostname || '').toLowerCase() === wanted
  );
  if (node) {
    if (!node.security_posture) {
      return {
        error: `node '${node.id}' declares no security_posture block (ADR-059)`,
        code: 'no-posture-declared',
      };
    }
    return { node };
  }

  const classes = (Array.isArray(data.node_classes) ? data.node_classes : [])
    .filter((c) => c && typeof c === 'object' && c.id);
  const cls = nodeId
    ? classes.find((c) => String(c.id).toLowerCase() === wanted)
    : classes.find((c) => hostIsInClass(c, probe));
  if (!cls) {
    // WS-747: UNVERIFIED, not N/A. A registry EXISTS -- the control is adopted -- and this
    // machine is outside it (no `nodes:` entry, no matching `node_classes:` entry), so its
    // posture has not been checked by anything. Reporting that as "not applicable" is a
    // false claim: it is the difference between "there is no rule here" and "there is a
    // rule and nobody looked". A replacement machine that has not been registered yet is
    // the normal case for this, not an edge case.
    return {
      error: `node '${wanted}' is not registered in fleet/registry.yaml nodes: and matches no node_classes: entry `
        + `(${data.nodes.length} node(s) ARE registered, so the control is adopted and this `
        + `machine's posture is UNVERIFIED)`,
      code: 'node-unregistered',
    };
  }
  if (!cls.security_posture) {
    return {
      error: `node class '${cls.id}' declares no security_posture block (ADR-059)`,
      code: 'no-posture-declared',
    };
  }
  return { node: cls, isClass: true, onHost: hostIsInClass(cls, probe) };
}

function loadActualSettings(opts) {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    // A container of a node class is built fresh per session and may carry no
    // user settings at all. That is its normal state, not a config error.
    if (opts && opts.optional) return { settings: {}, path: null };
    return { error: `no ~/.claude/settings.json at ${settingsPath}` };
  }
  try {
    const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^\uFEFF/, '');
    return { settings: JSON.parse(raw), path: settingsPath };
  } catch (err) {
    return { error: `~/.claude/settings.json is not valid JSON — ${err.message}` };
  }
}

// ─── Comparison ───────────────────────────────────────────────────────────

function registeredHookCommands(settings) {
  const found = new Set();
  const pre = (settings.hooks && settings.hooks.PreToolUse) || [];
  for (const entry of pre) {
    for (const hook of entry.hooks || []) {
      for (const arg of hook.args || []) {
        const base = path.basename(String(arg));
        if (base.endsWith('.js')) found.add(base);
      }
      // Hooks may also carry the script inline on `command`.
      const cmd = String(hook.command || '');
      const m = cmd.match(/([\w-]+\.js)/);
      if (m) found.add(m[1]);
    }
  }
  return found;
}

function compare(declared, settings, unverified) {
  const findings = [];
  const perms = settings.permissions || {};

  // 1. Permission mode — the core of the posture.
  if (declared.default_mode) {
    const actual = perms.defaultMode || 'default';
    if (!perms.defaultMode && declared.mode_set_by === 'platform') {
      // The platform that launches the session chooses the mode and writes it
      // to no file this script can read. Saying "matches" would be a guess, and
      // saying "drift" would be a false alarm on every run.
      if (unverified) {
        unverified.push({
          control: 'permission-mode',
          declared: declared.default_mode,
          reason: 'The mode is set by the platform that starts the session and is not written to any settings file, so it cannot be read from inside the session.',
        });
      }
    } else if (actual !== declared.default_mode) {
      findings.push({
        control: 'permission-mode',
        expected: declared.default_mode,
        actual,
        detail: `This node declares it runs in '${declared.default_mode}' mode but is actually in '${actual}'.`
                + (actual === 'bypassPermissions'
                    ? ' bypassPermissions means every tool call runs ungated — the state ADR-059 moved away from.'
                    : ''),
      });
    }
  }

  // 2. Bypass-era skip flags must be absent once a boundary mode is declared.
  if (declared.default_mode && declared.default_mode !== 'bypassPermissions') {
    for (const flag of ['skipDangerousModePermissionPrompt', 'skipAutoPermissionPrompt']) {
      if (settings[flag] === true) {
        findings.push({
          control: 'skip-flag',
          expected: `${flag} absent`,
          actual: `${flag}: true`,
          detail: `A bypass-era skip flag is still set while the node declares '${declared.default_mode}'. It suppresses prompts the declared posture relies on.`,
        });
      }
    }
  }

  // 3. Required PreToolUse hooks.
  if (Array.isArray(declared.required_hooks) && declared.required_hooks.length) {
    const present = registeredHookCommands(settings);
    for (const hook of declared.required_hooks) {
      if (!present.has(hook)) {
        findings.push({
          control: 'hook',
          expected: `${hook} registered as a PreToolUse hook`,
          actual: 'not registered',
          detail: `Declared guard '${hook}' is not wired into ~/.claude/settings.json, so it is not running.`,
        });
      }
    }
  }

  // 4. Admin escalation path — declared intent vs. whether it is audited.
  if (declared.admin_escalation === 'audited') {
    const present = registeredHookCommands(settings);
    if (!present.has('cwos-admin-escalation-audit.js')) {
      findings.push({
        control: 'admin-escalation',
        expected: 'admin escalation audited',
        actual: 'no audit hook registered',
        detail: 'The node declares the ssh-admin path is audited, but the audit hook is not registered — escalations would leave no record.',
      });
    }
  }

  return findings;
}

// Drift outranks unverified: a divergence that was read is a fact, and must
// not be softened by something else that could not be.
const EXIT = { ok: 0, drift: 1, unverified: 3 };

function verdictOf(findings, unverified) {
  if (findings.length) return 'drift';
  return (unverified && unverified.length) ? 'unverified' : 'ok';
}

// ─── Output ───────────────────────────────────────────────────────────────

function renderPretty(nodeId, findings, settingsPath, unverified, isClass) {
  unverified = unverified || [];
  const unverifiedLines = [];
  if (unverified.length) {
    unverifiedLines.push(`${unverified.length} declared control(s) could NOT be verified from here:`);
    for (const u of unverified) {
      unverifiedLines.push(`  [${u.control}] declared: ${u.declared}`);
      unverifiedLines.push(`     ${u.reason}`);
    }
  }
  if (!findings.length) {
    const head = unverified.length
      ? `Security posture on ${nodeId}: no drift in what could be read.`
      : `Security posture OK on ${nodeId} — actual settings match the declared posture.`;
    return [head, ...unverifiedLines].join('\n') + '\n';
  }
  const lines = [
    `Security posture DRIFT on ${nodeId} — ${findings.length} divergence(s) from the declared posture.`,
    `Declared in: fleet/registry.yaml (${isClass ? 'node_classes' : 'nodes'}: ${nodeId}.security_posture)`,
    `Actual from: ${settingsPath || '(no ~/.claude/settings.json on this host)'}`,
    '',
  ];
  for (const f of findings) {
    lines.push(`  [${f.control}]`);
    lines.push(`     expected: ${f.expected}`);
    lines.push(`     actual:   ${f.actual}`);
    lines.push(`     ${f.detail}`);
    lines.push('');
  }
  lines.push('Fix by bringing settings back in line with the declaration, or — if the change was');
  lines.push('deliberate — update the declaration and record it as a superseding decision (ADR-059).');
  if (unverifiedLines.length) lines.push('', ...unverifiedLines);
  return lines.join('\n') + '\n';
}

// ─── Main ─────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.error) { process.stderr.write(`security-posture-check: ${args.error}\n`); process.exit(2); }
  if (args.help) {
    process.stdout.write('usage: cwos-security-posture-check [--pretty] [--node <id>]\n');
    process.exit(0);
  }

  const root = findRepoRoot(__dirname) || process.cwd();

  const decl = loadDeclaration(root, args.node);
  if (decl.error) {
    // WS-747: the code travels with the refusal so INV-062 can tell "not adopted" from
    // "adopted and unverified" instead of collapsing both into a pass.
    process.stderr.write(`security-posture-check: [${decl.code || 'unknown'}] ${decl.error}\n`);
    process.exit(2);
  }

  // A class has no machine to ssh to. Its posture is checked from inside a
  // host of that class, or not at all.
  if (decl.isClass && !decl.onHost) {
    process.stderr.write(
      `security-posture-check: '${decl.node.id}' is a node class, not a machine, and this host is not one of them.\n`
      + `Run this script with no --node from inside a session of that class.\n`
    );
    process.exit(2);
  }

  // Remote means the declaration found is not THIS host's. The test used to
  // compare --node with the id of the node it had just looked up by that same
  // id, which is always equal: `--node cm-node1` run on the G16 compared the
  // G16's settings with node1's declaration and reported the result as node1's.
  const here = os.hostname().toLowerCase();
  const isRemote = !decl.isClass
    && String(decl.node.hostname || '').toLowerCase() !== here
    && String(decl.node.id || '').toLowerCase() !== here;

  // Settings are per-machine; we can only read the local ones. Checking another
  // node means running this script there over ssh, not guessing from here.
  if (isRemote) {
    process.stderr.write(
      `security-posture-check: cannot read settings for a remote node from here.\n`
      + `Run it on that node:\n`
      + `  ssh ${args.node} "node ${root.replace(/\\/g, '/')}/kit/scripts/cwos-security-posture-check.js --pretty"\n`
    );
    process.exit(2);
  }

  const actual = loadActualSettings({ optional: Boolean(decl.isClass) });
  if (actual.error) { process.stderr.write(`security-posture-check: ${actual.error}\n`); process.exit(2); }

  const unverified = [];
  const findings = compare(decl.node.security_posture, actual.settings, unverified);
  const nodeId = decl.node.id;
  const verdict = verdictOf(findings, unverified);

  if (args.pretty) {
    process.stdout.write(renderPretty(nodeId, findings, actual.path, unverified, decl.isClass));
  } else {
    process.stdout.write(JSON.stringify({
      // True only when every declared control was read and matched.
      ok: verdict === 'ok',
      verdict,
      node: nodeId,
      node_class: decl.isClass ? nodeId : null,
      declared: decl.node.security_posture,
      settings_path: actual.path,
      findings,
      // Declared, but not readable from here.
      unverified,
    }, null, 2) + '\n');
  }

  process.exit(EXIT[verdict]);
}

// WS-544: guard the entry point so requiring this file for a dependency
// smoke check does not run it.
if (require.main === module) main();

module.exports = { loadDeclaration, compare, renderPretty, hostIsInClass, verdictOf, EXIT };
