#!/usr/bin/env node
/**
 * cwos-agent-tools — check and provision the small host toolchain shared by
 * Claude Code and Codex sessions in every adopted repo.
 *
 * Tools are machine-scoped, not repo-scoped. Shipping this entry point in the
 * core kit gives every adopted repo the same diagnosis and repair command,
 * while HomeBase's node bootstrap runs it once per machine.
 *
 * Usage:
 *   node kit/scripts/cwos-agent-tools.js check [--json] [--required-only]
 *   node kit/scripts/cwos-agent-tools.js install [--json] [--required-only]
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const TOOL_SPECS = Object.freeze([
  {
    id: 'git',
    label: 'Git',
    command: 'git',
    versionArgs: ['--version'],
    required: true,
    why: 'version control and worktree isolation',
  },
  {
    id: 'node',
    label: 'Node.js',
    command: 'node',
    versionArgs: ['--version'],
    required: true,
    why: 'runs the zero-dependency CWOS command surface',
  },
  {
    id: 'rg',
    label: 'ripgrep',
    command: 'rg',
    versionArgs: ['--version'],
    required: true,
    why: 'fast repository search and file discovery for both agents',
    windowsInstaller: {
      manager: 'winget',
      id: 'BurntSushi.ripgrep.MSVC',
    },
    // WinGet packages live below AppData. Codex's Windows sandbox can inherit
    // that PATH entry while still being denied traversal to the executable —
    // exactly the state behind the fleet friction reports. Converge a trusted
    // copy into the already-standard user bin path that both agents can read.
    windowsBridge: {
      relativeDestination: '.local/bin/rg.exe',
      packagePrefix: 'BurntSushi.ripgrep.MSVC_',
      executable: 'rg.exe',
    },
  },
  {
    id: 'gh',
    label: 'GitHub CLI',
    command: 'gh',
    versionArgs: ['--version'],
    required: false,
    why: 'pull request, issue, and workflow operations',
  },
  {
    id: 'python',
    label: 'Python',
    command: 'python',
    versionArgs: ['--version'],
    required: false,
    why: 'repo-specific tests and analysis scripts',
  },
  {
    id: 'git-bash',
    label: 'Git Bash',
    command: 'bash',
    versionArgs: ['--version'],
    required: false,
    why: 'explicit Windows shell for bash-only repo scripts (avoids WSL routing)',
    windowsCandidates: [
      'C:/Program Files/Git/bin/bash.exe',
      'C:/Program Files/Git/usr/bin/bash.exe',
    ],
  },
]);

function defaultRunner(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    env: options.env || process.env,
  });
}

function oneLineVersion(result) {
  const raw = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  return raw.split(/\r?\n/).find(Boolean) || null;
}

function commandFor(spec, options) {
  if (options.platform === 'win32' && spec.windowsBridge) {
    const userProfile = options.env.USERPROFILE || options.env.UserProfile;
    return userProfile
      ? path.join(userProfile, spec.windowsBridge.relativeDestination)
      : spec.command;
  }
  if (options.platform !== 'win32' || !spec.windowsCandidates) {
    return spec.command;
  }
  const found = spec.windowsCandidates.find(candidate => options.exists(candidate));
  return found || spec.command;
}

function checkTool(spec, options = {}) {
  const platform = options.platform || process.platform;
  const exists = options.exists || fs.existsSync;
  const runner = options.runner || defaultRunner;
  const env = options.env || process.env;
  const command = commandFor(spec, { platform, exists, env });
  const result = runner(command, spec.versionArgs, { env });
  const ready = !result.error && result.status === 0;
  return {
    id: spec.id,
    label: spec.label,
    required: spec.required,
    why: spec.why,
    ready,
    command,
    version: ready ? oneLineVersion(result) : null,
    error: ready ? null : (result.error ? result.error.message : oneLineVersion(result) || `exit ${result.status}`),
  };
}

function summarize(results) {
  const required = results.filter(result => result.required);
  const missingRequired = required.filter(result => !result.ready);
  return {
    ok: missingRequired.length === 0,
    total: results.length,
    ready: results.filter(result => result.ready).length,
    required_total: required.length,
    required_ready: required.length - missingRequired.length,
    missing_required: missingRequired.map(result => result.id),
  };
}

function checkAll(options = {}) {
  const specs = options.requiredOnly ? TOOL_SPECS.filter(spec => spec.required) : TOOL_SPECS;
  const results = specs.map(spec => checkTool(spec, options));
  return { summary: summarize(results), tools: results };
}

function withPath(env, directory) {
  const parts = String(env.PATH || env.Path || '').split(path.delimiter).filter(Boolean);
  if (!parts.some(part => path.resolve(part).toLowerCase() === path.resolve(directory).toLowerCase())) {
    parts.push(directory);
  }
  return { ...env, PATH: parts.join(path.delimiter) };
}

function findFile(root, name, maxDepth = 3) {
  if (!root || !fs.existsSync(root)) return null;
  const queue = [{ dir: root, depth: 0 }];
  while (queue.length) {
    const { dir, depth } = queue.shift();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase() === name.toLowerCase()) return full;
      if (entry.isDirectory() && depth < maxDepth) queue.push({ dir: full, depth: depth + 1 });
    }
  }
  return null;
}

function findWindowsPackageExecutable(spec, env) {
  const bridge = spec.windowsBridge;
  const localAppData = env.LOCALAPPDATA || env.LocalAppData;
  if (!bridge || !localAppData) return null;
  const packagesDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
  let packages;
  try { packages = fs.readdirSync(packagesDir, { withFileTypes: true }); }
  catch { return null; }
  for (const pkg of packages) {
    if (!pkg.isDirectory() || !pkg.name.startsWith(bridge.packagePrefix)) continue;
    const executable = findFile(path.join(packagesDir, pkg.name), bridge.executable);
    if (executable) return executable;
  }
  return null;
}

function sameBytes(left, right) {
  try { return fs.readFileSync(left).equals(fs.readFileSync(right)); }
  catch { return false; }
}

function bridgeWindowsTool(spec, options) {
  if (!spec.windowsBridge) return { ok: true, changed: false, detail: 'no sandbox bridge required' };
  const userProfile = options.env.USERPROFILE || options.env.UserProfile;
  if (!userProfile) return { ok: false, changed: false, detail: 'USERPROFILE is unavailable' };
  const source = findWindowsPackageExecutable(spec, options.env);
  if (!source) return { ok: false, changed: false, detail: 'WinGet package executable not found' };
  const destination = path.join(userProfile, spec.windowsBridge.relativeDestination);
  try {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const changed = !sameBytes(source, destination);
    if (changed) fs.copyFileSync(source, destination);
    return { ok: true, changed, source, destination, detail: changed ? `copied to ${destination}` : `current at ${destination}` };
  } catch (err) {
    return { ok: false, changed: false, source, destination, detail: err.message };
  }
}

function installWindowsTool(spec, options) {
  const installer = spec.windowsInstaller;
  if (!installer || installer.manager !== 'winget') {
    return { attempted: false, ok: false, detail: 'no unattended Windows installer declared' };
  }
  const args = [
    'install', '--exact', '--id', installer.id, '--source', 'winget', '--scope', 'user',
    '--silent', '--disable-interactivity', '--accept-package-agreements', '--accept-source-agreements',
  ];
  const result = options.runner('winget', args, { env: options.env });
  return {
    attempted: true,
    ok: !result.error && result.status === 0,
    detail: oneLineVersion(result) || (result.error ? result.error.message : `winget exit ${result.status}`),
  };
}

function installMissingRequired(options = {}) {
  const platform = options.platform || process.platform;
  const runner = options.runner || defaultRunner;
  const exists = options.exists || fs.existsSync;
  const bridge = options.bridge || bridgeWindowsTool;
  let env = options.env || process.env;
  const before = checkAll({ platform, runner, exists, env, requiredOnly: true });
  const installs = [];

  for (const missing of before.tools.filter(tool => !tool.ready)) {
    const spec = TOOL_SPECS.find(candidate => candidate.id === missing.id);
    let outcome;
    if (platform === 'win32') {
      let bridgeResult = bridge(spec, { runner, env });
      let packageResult = null;
      if (!bridgeResult.ok) {
        packageResult = installWindowsTool(spec, { runner, env });
        bridgeResult = bridge(spec, { runner, env });
      }
      outcome = {
        attempted: Boolean(packageResult && packageResult.attempted) || Boolean(spec.windowsBridge),
        ok: bridgeResult.ok || Boolean(packageResult && packageResult.ok && !spec.windowsBridge),
        detail: bridgeResult.ok ? bridgeResult.detail : `${packageResult ? packageResult.detail + '; ' : ''}${bridgeResult.detail}`,
      };
      if (outcome.ok && spec.windowsBridge) {
        const userProfile = env.USERPROFILE || env.UserProfile;
        env = withPath(env, path.dirname(path.join(userProfile, spec.windowsBridge.relativeDestination)));
      }
    } else {
      outcome = {
        attempted: false,
        ok: false,
        detail: `automatic installation is not supported on ${platform}; install ${spec.label} with the system package manager`,
      };
    }
    installs.push({ id: spec.id, ...outcome });
  }

  const after = checkAll({ platform, runner, exists, env, requiredOnly: options.requiredOnly });
  return { before, installs, after };
}

function parseArgs(argv) {
  const args = { action: 'check', json: false, requiredOnly: false, help: false };
  let actionSeen = false;
  for (const arg of argv) {
    if (arg === 'check' || arg === 'install') {
      if (actionSeen) throw new Error(`multiple actions supplied: ${args.action}, ${arg}`);
      args.action = arg;
      actionSeen = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--required-only') {
      args.requiredOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return args;
}

function usage() {
  return [
    'usage: cwos-agent-tools [check|install] [--json] [--required-only]',
    '',
    'check            report host tools shared by Claude Code and Codex (default)',
    'install          install missing required tools; Windows uses user-scope WinGet',
    '--required-only  omit recommended repo-dependent tools from the report',
    '--json           machine-readable output',
  ].join('\n');
}

function renderCheck(report) {
  const lines = [
    `Agent tools: ${report.summary.required_ready}/${report.summary.required_total} required ready; ` +
      `${report.summary.ready}/${report.summary.total} checked ready`,
  ];
  for (const tool of report.tools) {
    const state = tool.ready ? 'OK' : (tool.required ? 'MISSING' : 'optional');
    lines.push(`  [${state}] ${tool.label}${tool.version ? ` — ${tool.version}` : ''}`);
  }
  if (!report.summary.ok) {
    lines.push('  Repair: node kit/scripts/cwos-agent-tools.js install');
  }
  return lines.join('\n');
}

function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`ERROR: ${err.message}\n\n${usage()}\n`);
    return 2;
  }
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }

  if (args.action === 'install') {
    const result = installMissingRequired({ requiredOnly: args.requiredOnly });
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      for (const install of result.installs) {
        process.stdout.write(`  [${install.ok ? 'installed' : 'FAILED'}] ${install.id} — ${install.detail}\n`);
      }
      process.stdout.write(`${renderCheck(result.after)}\n`);
    }
    return result.after.summary.ok ? 0 : 1;
  }

  const report = checkAll({ requiredOnly: args.requiredOnly });
  process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : `${renderCheck(report)}\n`);
  return report.summary.ok ? 0 : 1;
}

module.exports = {
  TOOL_SPECS,
  checkTool,
  checkAll,
  installMissingRequired,
  bridgeWindowsTool,
  findWindowsPackageExecutable,
  parseArgs,
  renderCheck,
  usage,
  main,
};

if (require.main === module) {
  process.exitCode = main();
}
