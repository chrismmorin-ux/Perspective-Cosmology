#!/usr/bin/env node
/**
 * cwos-headroom.js — measure, gate on, and reclaim machine memory headroom.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Promoted to the kit from `claude-poker-tracker/scripts/fleet/headroom.mjs`
 * (WS-708 note: "if the headroom tool proves out it belongs in the kit rather than
 * in one repo"). It proved out twice, in two repos, on the same failure:
 *
 *   - claude-poker-tracker, 2026-08-22: 16.1 GB physical against 44.7 GB commit
 *     charge. The SAME test suite on IDENTICAL code reported 5 failed, then 1, then
 *     0 — purely as a function of concurrent load. Hours went into debugging bugs
 *     that were never there.
 *   - ServeYourNote, 2026-08-23: four xdist workers racing `--create-db` on a loaded
 *     machine tripped the 30s pytest timeout — 2,341 then 3,868 spurious errors.
 *
 * That is the class this tool exists for. Contention on an unmanaged shared resource
 * does not announce itself as contention. It announces itself as a FAILING TEST, and
 * a failing test is believed.
 *
 * Two distinct failures follow from having no instrument here:
 *
 *   1. Memory-intensive runs START into headroom that cannot hold them. The corpus
 *      OOM on cm-node1 was filed FOUR separate times (WS-502, WS-512, WS-593,
 *      WS-616) and every filing rediscovered the same fact from a crash rather than
 *      reading it from a gate.
 *   2. When a run does die, nothing recorded what headroom it started with — so the
 *      post-mortem cannot separate "this workload is too big" from "this machine was
 *      already full."
 *
 * So this is not a process killer with a report attached. It is a MEASUREMENT that
 * can optionally act, and whose verdict is meant to be stamped into a run manifest.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE CLASSIFIER, AND THE FALSIFIER THAT SHAPED IT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The obvious test — "its parent is dead, so it is an orphan" — is WRONG here, and
 * it was caught by running it rather than by reasoning about it. On 2026-08-22 the
 * ancestry of a HEALTHY, ACTIVELY-RUNNING vitest process read:
 *
 *     node:22076 <- cmd:67108 <- node:48404 <- bash:8308 <- bash:12660 <- DEAD:35184
 *
 * Every tool-spawned process on Windows traces back through transient shell wrappers
 * that exit immediately. Dead ancestry is the NORMAL state here, not the exceptional
 * one. A classifier built on it would have killed the very test suite measuring it.
 *
 * So reclaim requires ALL FOUR of these, and each one is load-bearing:
 *
 *   1. ROLE MATCH — the command line matches an allow-listed role below, AND the
 *      executable name matches. A bare `node` process is never reclaimable.
 *   2. NO LIVE CLAUDE ANCESTOR — walking up the parent chain never reaches a live
 *      `claude.exe`. This is what protects every MCP server currently in use.
 *   3. AGE — older than `--min-age-min` (default 45). Something started moments ago
 *      is work in flight, not a leftover.
 *   4. NOT SELF — never anything in this process's own ancestry.
 *
 * PID reuse is real, so conditions 2 and 4 are treated as advisory-to-protect: an
 * unresolvable chain PROTECTS, it never condemns.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHAT THE KIT ADDS THAT ONE REPO COULD NOT — SESSION RECONCILIATION (WS-669)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WS-669 (claude-poker-tracker) is an OPEN investigation, and this port does not
 * pretend to close it. Its finding: on 2026-08-23 there were 7 `claude.exe` running
 * and ~6.5 GB of MCP servers protected as "attached to a live Claude session", while
 * the founder and the session registry both said ONE session was in flight. Either
 * six Claude processes outlived their sessions, or "live" here means the OS process
 * rather than the CWOS session. Those have different fixes.
 *
 * A single repo cannot answer that, because a repo sees only its own session
 * registry. The kit can: `fleet/registry.yaml` names every repo, and each carries
 * `.claude/workstream/sessions/*.yaml` with `status` and `pid`. So this build
 * reconciles the two populations and REPORTS the gap:
 *
 *     registered   a claude.exe whose pid is an active CWOS session somewhere
 *     unregistered a claude.exe no active CWOS session claims
 *
 * It does NOT reclaim against that signal, and it must not be made to. An
 * unregistered claude.exe is not proof of a dead session — a session can predate
 * registration, run in a repo without CWOS, or be mid-startup. The output is a
 * NUMBER FOR A HUMAN, which is precisely what WS-669 asked for: "the tool should be
 * able to say which is which — or say plainly that it cannot."
 *
 * The reason this matters is that "nothing reclaimable" is the one answer that stops
 * anyone looking further. If it is being produced by a liveness test that cannot see
 * dead sessions, it is a confident wrong answer, and confident wrong answers are the
 * expensive kind.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHAT IS DELIBERATELY NOT RECLAIMABLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - Test runners. A long legitimate run and a stale one are indistinguishable from
 *   outside, and killing the former costs far more than the memory is worth. Opt in
 *   per-invocation with `--include-stale-tests` when you know the run is dead.
 * - MCP servers attached to a LIVE session. Measured on G16, 2026-08-23: six
 *   `sympy-mcp` instances at ~750 MB each, one per live Claude session, every one
 *   correctly attached. That 4.5 GB was a PER-SESSION TAX, not an orphan — and the
 *   fix was CONFIGURATION (scoping the server out of user scope, WS-708), not a kill.
 *   Claiming it here would be claiming memory this tool cannot free.
 * - Editors, browsers, Docker, WSL, and anything not on the role allow-list.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   node kit/scripts/cwos-headroom.js                        # measure + classify, act on nothing
 *   node kit/scripts/cwos-headroom.js --verbose              # also list what was protected, and why
 *   node kit/scripts/cwos-headroom.js --sessions             # reconcile claude.exe vs CWOS sessions
 *   node kit/scripts/cwos-headroom.js --apply                # reclaim, then re-measure
 *   node kit/scripts/cwos-headroom.js --require-gb 6         # GATE: exit 1 if under 6 GB free
 *   node kit/scripts/cwos-headroom.js --require-gb 6 --apply # reclaim, then gate on the result
 *   node kit/scripts/cwos-headroom.js --json                 # machine-readable, for a manifest
 *
 * Exit codes: 0 = ok · 1 = gate unmet · 2 = usage/platform error.
 * The gate is a REFUSAL, never a warning — a run that cannot fit must not start.
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// WS-711 lever 2: the gate refuses a run that cannot fit; this sizes one that can.
const { deriveWorkers, DEFAULT_PER_WORKER_GB, DEFAULT_RESERVE_GB } = require('./lib/worker-sizing');
const slots = require('./lib/slot-registry');

const { DEFAULT_PER_JOB_GB } = slots;
const SLOT_RESERVE_GB = slots.DEFAULT_RESERVE_GB;

// ── Roles ────────────────────────────────────────────────────────────────────
// Each entry: what it is, how to recognise it, whether it is on by default.
// `test` receives the lower-cased command line; `names` constrains the EXECUTABLE.
//
// `names` is not decoration. On the first --apply (2026-08-22) the static-server
// regex matched three `bash.exe -c "source ~/.claude/shell-snapshots/..."` wrappers,
// because a sourced shell snapshot mentions `npx` and `serve` somewhere in the PATH
// it exports. A shell that MENTIONS a server is not a server. Requiring the runtime
// executable is what separates the thing from a string that talks about the thing.
const ROLES = [
  {
    id: 'static-server',
    label: 'static file server',
    default: true,
    names: /^(node|python|pythonw)\.exe$/i,
    test: (c) => /python[^\n]*-m\s+http\.server/.test(c)
      || (/\bserve\b/.test(c) && /npx|npm-cache|serve[\\/]build[\\/]main/.test(c)),
  },
  {
    id: 'worktree-dev',
    label: 'worktree dev server',
    default: true,
    names: /^node\.exe$/i,
    test: (c) => c.includes('.worktrees') && c.includes('node'),
  },
  {
    id: 'mcp-server',
    // Label the THING, not the intent: a role match is not yet a verdict, and most of
    // these turn out to be correctly attached. Calling them "unattached" in the
    // protected list would have printed a false claim about every one of them.
    label: 'MCP server',
    default: true,
    names: /^(node|python|pythonw|mcp|uv|uvx)\.exe$/i,
    test: (c) => /playwright[\\/]mcp|claude-mermaid|sympy-mcp|sympy[\\/]|mcp-wolfram|[\\/]mcp\.exe/.test(c),
  },
  {
    id: 'stale-test',
    label: 'stale test runner',
    default: false,
    names: /^(node|python|pythonw)\.exe$/i,
    test: (c) => /vitest|jest|pytest/.test(c),
  },
];

// Never classified, whatever else matches. Belt-and-braces around the role list.
const NEVER_NAME = /^(code|chrome|msedge|msedgewebview2|explorer|claude|MsMpEng|com\.docker|vmmem|dllhost|svchost|powershell|pwsh|WindowsTerminal|conhost|System|Registry)/i;

// ── Args ─────────────────────────────────────────────────────────────────────
const HELP = `
cwos-headroom.js — measure, gate on, and reclaim machine memory headroom.

  Concurrent sessions contending for RAM do not fail as "out of memory". They fail
  as FALSELY FAILING TESTS. This is the instrument that tells you which one you are
  looking at, and the gate that stops a run that cannot fit from starting at all.

USAGE
  node kit/scripts/cwos-headroom.js [flags]
  node kit/scripts/cwos-headroom.js run --job <name> -- <command...>
  node kit/scripts/cwos-headroom.js slots [--json]

SUBCOMMAND: run — claim a high-memory slot, WAIT if none is free, release after
  node kit/scripts/cwos-headroom.js run --job test -- npm test

  The flags above act on ONE job in isolation: --require-gb refuses a run that
  cannot fit, --workers shrinks one to fit. Neither can see the job in the OTHER
  REPO that is about to start two seconds from now, and that is the case that
  actually killed three test shards on the G16 on 2026-08-22. \`run\` is the part
  that waits: the slot registry is machine-scoped (~/.claude/cwos-slots.json), so
  a job in repo A queues behind a job in repo B on the same box.

  A warning nobody is required to read changes nothing — measured in this fleet,
  a CI gate failed loudly for sixteen consecutive runs across six days and moved
  no one. So this BLOCKS THE ACT: it wraps your command and holds it until a slot
  frees, printing who it is waiting on.

  Slots are OPT-IN. Gates, greps, git and doc edits take no slot and are never
  blocked — only what you explicitly wrap.

  --job <name>          What this job is, shown to whoever waits on it. Required.
  --repo <name>         Defaults to the current repo's directory name.
  --session <id>        Defaults to $CWOS_SESSION_ID, else the pid.
  --per-job-gb N        Cost of one heavy job (default ${DEFAULT_PER_JOB_GB}, the MEASURED
                        peak of a vitest shard on the G16, 2026-08-22). Pass your
                        own figure to mark the verdict calibrated.
  --reserve-gb N        Memory left for the OS (default ${SLOT_RESERVE_GB}).
  --wait-timeout-min N  Give up waiting after N minutes and run anyway, loudly
                        (default 30). A mediator that can wait forever is a
                        mediator that can hang your machine.
  --no-wait             Exit 1 instead of waiting if no slot is free.

  On a registry that cannot be read or locked, the job RUNS UNMEDIATED with a
  warning and a friction event (founder decision, 2026-09-11). The worst case is
  then today's behaviour; the only outcome ruled out is silence.

  The child's exit code is propagated unchanged.

SUBCOMMAND: slots — who holds a slot right now
  node kit/scripts/cwos-headroom.js slots

FLAGS
  --require-gb N        GATE. Exit 1 if fewer than N GB physical are free.
                        Put this in front of a test suite or a long calculation.
  --apply               Reclaim what all four safety conditions allow, then re-measure.
                        The before/after commit delta is the real number; the kill
                        list is only the intent.
  --min-age-min N       Age floor for reclaim, in minutes (default 45). Something
                        started moments ago is work in flight, not a leftover.
  --include-stale-tests Opt in to reclaiming test runners. OFF by default: a long
                        legitimate run and a dead one look identical from outside.
  --roles a,b,c         Restrict to named roles. Available: ${ROLES.map((r) => r.id).join(', ')}
  --sessions            Reconcile live claude.exe processes against the CWOS session
                        registries across the fleet, and report the gap (WS-669).
                        Reporting only — this signal never authorises a kill.
  --workers             Print the derived worker count as ONE BARE INTEGER on
                        stdout and nothing else, so a runner can take it directly:
                          pytest -n $(node kit/scripts/cwos-headroom.js --workers)
                        Combine with --require-gb and the gate wins: on refusal
                        stdout stays EMPTY and the exit code is 1, so the runner's
                        command line breaks loudly instead of running at a
                        garbage count. Never returns 0 workers — "run serially"
                        is an answer, "run nothing" is the gate's job.
                        The sizing verdict is computed and shown on EVERY run;
                        this flag only makes it script-readable. To read it, drop
                        the flag. --json wins over it and returns the full verdict.
  --per-worker-gb N     Estimated cost of one worker (default ${DEFAULT_PER_WORKER_GB}).
                        THE DEFAULT IS AN ESTIMATE, NOT A MEASUREMENT — the fleet
                        has never measured what a test worker actually costs.
                        Passing your own measured figure marks the result
                        calibrated: true. Calibrating it needs a repo with a
                        genuinely parallel runner.
  --reserve-gb N        Memory left unallocated for the OS and this session
                        (default ${DEFAULT_RESERVE_GB}).
  --max-workers N       Hard ceiling (default: this machine's core count). Free RAM
                        can suggest more workers than there are cores, and that is
                        never the right answer.
  --verbose             List what matched a role and was PROTECTED, and why.
  --json                Machine-readable verdict, for stamping into a run manifest.
  --help, -h            This text.

EXIT CODES
  0  ok        1  gate unmet        2  usage or platform error

SAFETY
  Reclaim requires ALL FOUR: role allow-list match (executable AND command line),
  no live claude.exe ancestor, older than the age floor, and not in this process's
  own ancestry. An unresolvable parent chain PROTECTS — it never condemns. Read the
  header of this file for the falsifier that shaped each condition.
`;

const parseArgs = (argv) => {
  const a = {
    apply: false, json: false, verbose: false, includeStaleTests: false,
    sessions: false, requireGb: null, minAgeMin: 45, roles: null, help: false,
    workers: false, perWorkerGb: null, reserveGb: null, maxWorkers: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--apply') a.apply = true;
    else if (t === '--json') a.json = true;
    else if (t === '--verbose') a.verbose = true;
    else if (t === '--sessions') a.sessions = true;
    else if (t === '--include-stale-tests') a.includeStaleTests = true;
    else if (t === '--require-gb') a.requireGb = Number(argv[++i]);
    else if (t === '--workers') a.workers = true;
    else if (t === '--per-worker-gb') a.perWorkerGb = Number(argv[++i]);
    else if (t === '--reserve-gb') a.reserveGb = Number(argv[++i]);
    else if (t === '--max-workers') a.maxWorkers = Number(argv[++i]);
    else if (t === '--min-age-min') a.minAgeMin = Number(argv[++i]);
    else if (t === '--roles') a.roles = String(argv[++i]).split(',').map((s) => s.trim());
    else if (t === '--help' || t === '-h') a.help = true;
    // ADR-063: refuse an unrecognised flag rather than silently ignoring it. A
    // rejected flag is a fast honest answer; a silently-dropped one is an
    // expensive wrong action. (cwos-verify.js --quick ran the full 10-minute
    // suite for months because it did the other thing.)
    else { console.error(`cwos-headroom: unknown argument ${t}\nRun with --help for the flags this accepts.`); process.exit(2); }
  }
  if (a.requireGb !== null && !Number.isFinite(a.requireGb)) {
    console.error('cwos-headroom: --require-gb needs a number');
    process.exit(2);
  }
  if (!Number.isFinite(a.minAgeMin) || a.minAgeMin < 0) {
    console.error('cwos-headroom: --min-age-min needs a non-negative number');
    process.exit(2);
  }
  // Sizing knobs: reject a bad number here rather than silently falling back to
  // the default. A caller who typed --per-worker-gb meant to override it, and a
  // silently-ignored override is the ADR-063 failure mode one level in.
  for (const [flag, val, floor] of [
    ['--per-worker-gb', a.perWorkerGb, 'positive'],
    ['--reserve-gb', a.reserveGb, 'non-negative'],
    ['--max-workers', a.maxWorkers, 'positive'],
  ]) {
    if (val === null) continue;
    const ok = Number.isFinite(val) && (floor === 'positive' ? val > 0 : val >= 0);
    if (!ok) {
      console.error(`cwos-headroom: ${flag} needs a ${floor} number`);
      process.exit(2);
    }
  }
  if (a.roles) {
    const known = new Set(ROLES.map((r) => r.id));
    const bad = a.roles.filter((r) => !known.has(r));
    if (bad.length) {
      console.error(`cwos-headroom: unknown role(s) ${bad.join(', ')}. Known: ${[...known].join(', ')}`);
      process.exit(2);
    }
  }
  return a;
};

// ── Snapshot ─────────────────────────────────────────────────────────────────
// One PowerShell round-trip returns both the OS memory counters and the full
// process table. `ageMin` is computed on the PowerShell side because CreationDate
// marshals badly through JSON.
const PS_SNAPSHOT = [
  "$ErrorActionPreference='Stop'",
  '$now=Get-Date',
  '$os=Get-CimInstance Win32_OperatingSystem',
  '$procs=@(Get-CimInstance Win32_Process | ForEach-Object {',
  '  $age=-1.0',
  '  if($_.CreationDate){ $age=[double]((New-TimeSpan -Start $_.CreationDate -End $now).TotalMinutes) }',
  '  [pscustomobject]@{',
  '    pid=[int]$_.ProcessId; ppid=[int]$_.ParentProcessId; name=[string]$_.Name;',
  '    commitMB=[int]($_.PageFileUsage/1KB); wsMB=[int]($_.WorkingSetSize/1MB);',
  // Strip C0 control characters from the command line before it is JSON-encoded. A real
  // process on this machine carries an embedded newline in its command line (a heredoc-built
  // node invocation), and ConvertTo-Json emitted it raw — JSON.parse then died with "Bad
  // control character in string literal" and took the whole tool down. Measured 2026-08-23.
  // A monitoring tool that crashes on the thing it monitors is worse than no tool, because
  // it fails exactly when the machine is busiest and least normal.
  "    ageMin=$age; cmd=([string]$_.CommandLine -replace '[\\x00-\\x1F]',' ') }",
  '})',
  '[pscustomobject]@{',
  '  totalMB=[int]($os.TotalVisibleMemorySize/1KB);',
  '  freeMB=[int]($os.FreePhysicalMemory/1KB);',
  '  commitMB=[int](($os.TotalVirtualMemorySize-$os.FreeVirtualMemory)/1KB);',
  '  procs=$procs } | ConvertTo-Json -Depth 4 -Compress',
// Joined with newlines, NOT '; '. A semicolon join splices statement separators into the
// middle of the `@{ ... }` hash literals and PowerShell 5.1 fails with "The hash literal
// was incomplete" — caught by running it, 2026-08-22.
].join('\n');

const snapshot = () => {
  const out = execFileSync(
    'powershell',
    ['-NoProfile', '-NonInteractive', '-Command', PS_SNAPSHOT],
    { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, windowsHide: true },
  );
  const raw = JSON.parse(out);
  raw.procs = Array.isArray(raw.procs) ? raw.procs : [raw.procs].filter(Boolean);
  return raw;
};

const MB_TO_GB = (mb) => mb / 1024;

// ── Ancestry ─────────────────────────────────────────────────────────────────
/**
 * Walk the parent chain.
 * `reachedLiveClaude` is what protects an in-use MCP server.
 * `resolvable` is false when the chain runs off the end of the process table —
 * which is the NORMAL case for anything tool-spawned, so it protects rather than
 * condemns. See the header.
 */
const ancestry = (startPid, byPid, claudePids) => {
  const chain = [];
  const seen = new Set();
  let cur = startPid;
  let reachedLiveClaude = false;
  let claudeAncestorPid = null;
  while (cur && byPid.has(cur) && !seen.has(cur)) {
    seen.add(cur);
    const p = byPid.get(cur);
    chain.push({ name: p.name, pid: cur });
    if (claudePids.has(cur) && cur !== startPid) {
      reachedLiveClaude = true;
      if (claudeAncestorPid === null) claudeAncestorPid = cur;
    }
    cur = p.ppid;
  }
  return { chain, reachedLiveClaude, claudeAncestorPid, resolvable: !cur || byPid.has(cur) };
};

// ── Session reconciliation (WS-669) ──────────────────────────────────────────
/**
 * Collect the pids of every ACTIVE CWOS session across every fleet repo hosted on
 * this node. Best-effort and deliberately forgiving: a repo without a registry, a
 * malformed YAML, or an absent fleet registry all degrade to "we know less", never
 * to a crash and never to a kill.
 *
 * Hand-parsed rather than routed through a YAML dependency: session files are a
 * flat `key: value` shape, and this must not fail closed on a machine where the
 * kit's node_modules have not been installed.
 */
const activeSessionPids = (repoRoot) => {
  const pids = new Map(); // pid -> "repo/session-id"
  const repos = new Set();

  // Every repo we can find. fleet/registry.yaml when present (HomeBase), else just us.
  const registryPath = path.join(repoRoot, 'fleet', 'registry.yaml');
  try {
    if (fs.existsSync(registryPath)) {
      const text = fs.readFileSync(registryPath, 'utf8');
      for (const m of text.matchAll(/^\s*path:\s*["']?([^"'\n]+)["']?\s*$/gm)) {
        repos.add(m[1].trim());
      }
    }
  } catch { /* a registry we cannot read means we know less, not that we act */ }
  repos.add(repoRoot);

  for (const repo of repos) {
    const dir = path.join(repo.replace(/\//g, path.sep), '.claude', 'workstream', 'sessions');
    let files;
    try { files = fs.readdirSync(dir); } catch { continue; }
    for (const f of files) {
      if (!f.endsWith('.yaml')) continue;
      let text;
      try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch { continue; }
      const status = /^status:\s*["']?(\w+)/m.exec(text);
      const pid = /^pid:\s*(\d+)/m.exec(text);
      if (status && status[1] === 'active' && pid) {
        pids.set(Number(pid[1]), `${path.basename(repo)}/${f.replace(/\.yaml$/, '')}`);
      }
    }
  }
  return pids;
};

// ── Subcommand: run ──────────────────────────────────────────────────────────
//
// The gate (--require-gb) and the sizer (--workers) both reason about one job in
// isolation. This is the part that coordinates BETWEEN jobs, which is the case
// that actually broke: on 2026-08-22 a 1,190 MB node process from ServeYourNote's
// worktree was competing with poker-tracker's test workers, and nothing on the
// machine knew about both.
//
// Requirement 3 of WS-707, in the founder's framing: it must BLOCK THE ACT, not
// print a warning. Measured in this same fleet, a CI gate failed loudly for
// sixteen consecutive runs over six days, naming three files and their line
// numbers every time, and changed nobody's behaviour — because nothing was
// required to look. So this wraps the command and holds it.

const parseRunArgs = (argv) => {
  const sep = argv.indexOf('--');
  if (sep === -1 || sep === argv.length - 1) {
    console.error('cwos-headroom run: needs a command after `--`, e.g.\n'
      + '  node kit/scripts/cwos-headroom.js run --job test -- npm test');
    process.exit(2);
  }
  const flags = argv.slice(3, sep);
  const command = argv.slice(sep + 1);

  const a = {
    job: null, repo: null, session: null, perJobGb: null, reserveGb: null,
    waitTimeoutMin: 30, noWait: false, command,
  };
  const num = (label, raw, floor) => {
    const v = Number(raw);
    const good = Number.isFinite(v) && (floor === 'positive' ? v > 0 : v >= 0);
    if (!good) { console.error(`cwos-headroom run: ${label} needs a ${floor} number`); process.exit(2); }
    return v;
  };
  for (let i = 0; i < flags.length; i++) {
    const t = flags[i];
    if (t === '--job') a.job = String(flags[++i] || '');
    else if (t === '--repo') a.repo = String(flags[++i] || '');
    else if (t === '--session') a.session = String(flags[++i] || '');
    else if (t === '--per-job-gb') a.perJobGb = num('--per-job-gb', flags[++i], 'positive');
    else if (t === '--reserve-gb') a.reserveGb = num('--reserve-gb', flags[++i], 'non-negative');
    else if (t === '--wait-timeout-min') a.waitTimeoutMin = num('--wait-timeout-min', flags[++i], 'positive');
    else if (t === '--no-wait') a.noWait = true;
    // ADR-063 again: an unrecognised flag is refused, never silently dropped.
    else { console.error(`cwos-headroom run: unknown argument ${t}\nRun with --help for what run accepts.`); process.exit(2); }
  }
  if (!a.job) { console.error('cwos-headroom run: --job <name> is required — a slot nobody can identify is a slot nobody can wait on.'); process.exit(2); }
  return a;
};

/**
 * Re-quote an argv array into one shell command line.
 *
 * The shell already ate the caller's quoting before we saw it, so an argument
 * that arrived containing spaces has to be re-wrapped or the child receives a
 * different command than the founder typed. Only quote what needs it — wrapping
 * everything would break `--job=x` style arguments on some shells and makes the
 * echoed command line unreadable.
 */
const shellCommandLine = (argv) => argv.map((arg) => {
  const s = String(arg);
  if (s !== '' && !/[\s"&|<>^()%!]/.test(s)) return s;
  return `"${s.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1')}"`;
}).join(' ');

/** Park the thread for ms. Synchronous by design — the wait loop is a loop. */
const sleepSync = (ms) => {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch { /* fall through */ }
};

/** Best-effort friction event. Never blocks the job — that is the whole point. */
const captureFriction = (detail) => {
  try {
    execFileSync(process.execPath, [
      path.join(__dirname, 'cwos-capture.js'), 'friction', detail,
      '--component', 'cwos-slot', '--severity', 'medium',
      '--workaround', 'ran the job unmediated',
    ], { stdio: 'ignore', timeout: 10000, windowsHide: true });
  } catch { /* a capture failure must never be the reason a job does not run */ }
};

const runSubcommand = (argv) => {
  const a = parseRunArgs(argv);
  const repo = a.repo || path.basename(process.cwd());
  const session = a.session || process.env.CWOS_SESSION_ID || `pid-${process.pid}`;

  // Only consulted when the cached figure is stale or a denial is imminent —
  // it is a ~2 s PowerShell round-trip (measured 1,589 / 1,775 / 2,064 ms on
  // cm-node1, 2026-09-11) and must never sit on the granted-claim path.
  const capacityProvider = () => {
    const snap = snapshot();
    return slots.deriveSlots({
      freeGB: MB_TO_GB(snap.freeMB),
      perJobGB: a.perJobGb === null ? undefined : a.perJobGb,
      reserveGB: a.reserveGb === null ? undefined : a.reserveGb,
    });
  };

  const claimOpts = { repo, session, job: a.job, capacityProvider };

  const started = Date.now();
  const timeoutMs = a.waitTimeoutMin * 60_000;
  let held = null;
  let announced = 0;
  let degradedOnce = false;

  for (;;) {
    const r = slots.tryClaim(claimOpts);

    if (r.degraded && !degradedOnce) {
      degradedOnce = true;
      console.error(`cwos-headroom run: WARN slot registry unusable (${r.degraded}) — running unmediated`);
      captureFriction(`slot registry unusable during a ${a.job} claim in ${repo}: ${r.degraded}`);
    }
    for (const rec of r.reclaimed || []) {
      console.error(`cwos-headroom run: reclaimed a dead slot — ${slots.describeHolder(rec.holder)}: ${rec.reason}`);
    }

    if (r.granted) { held = r.holder; break; }

    if (a.noWait) {
      console.error(`cwos-headroom run: no slot free (--no-wait). Held by ${slots.describeHolder(r.waitingOn)}.`);
      process.exit(1);
    }

    const waited = Date.now() - started;
    if (waited > timeoutMs) {
      // Running anyway is the lesser evil: this is a scheduling hint, and a
      // mediator that can wait forever is one that can hang the machine. Said
      // loudly, and recorded, so a chronic waiter is visible rather than folklore.
      console.error(`cwos-headroom run: waited ${Math.round(waited / 60000)}m for a slot and gave up — RUNNING ANYWAY.`);
      console.error(`cwos-headroom run: still held by ${slots.describeHolder(r.waitingOn)}.`);
      captureFriction(`waited ${Math.round(waited / 60000)}m for a memory slot in ${repo} (${a.job}) and ran unmediated`);
      break;
    }

    // Requirement 6: an opaque wait is indistinguishable from a hang, and a
    // session that cannot explain its own stall gets killed by the founder.
    if (Date.now() - announced > 15_000) {
      announced = Date.now();
      const cap = r.capacity ? `${r.holders.length} of ${r.capacity.slots} slot(s) in use` : 'capacity unknown';
      console.error(`cwos-headroom run: waiting on ${slots.describeHolder(r.waitingOn)} — ${cap}`);
    }
    // Jittered, so N waiters do not wake in lockstep and thrash the lockfile.
    // Atomics.wait is a real synchronous sleep: it parks the thread. A busy-wait
    // here would burn a core for the entire queue, on a machine that is already
    // short of resources — the mediator would become a second load source.
    sleepSync(1500 + Math.floor(Math.random() * 1000));
  }

  // ── Release paths ──────────────────────────────────────────────────────────
  // A killed holder is reclaimed by the registry's own liveness check, so these
  // are the tidy path, not the safety net. Both exist because three holders were
  // really killed on the day this was filed.
  let releasedAlready = false;
  const letGo = () => {
    if (releasedAlready || !held) return;
    releasedAlready = true;
    try { slots.release(held.id); } catch { /* the TTL and pid check cover us */ }
  };
  process.on('exit', letGo);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
    try { process.on(sig, () => { letGo(); process.exit(130); }); } catch { /* not all signals exist on win32 */ }
  }

  const beat = held
    ? setInterval(() => { try { slots.heartbeat(held.id); } catch { /* best effort */ } }, slots.HEARTBEAT_INTERVAL_MS)
    : null;
  if (beat && beat.unref) beat.unref();

  const waitedMs = Date.now() - started;
  if (held) {
    console.error(`cwos-headroom run: slot held by ${repo}/${session}/${a.job}`
      + (waitedMs > 1000 ? ` (waited ${Math.round(waitedMs / 1000)}s)` : ''));
  }

  // A shell is unavoidable on win32 — `npm` is npm.cmd, which spawn() cannot
  // execute directly — but passing an ARGV ARRAY alongside shell:true makes Node
  // concatenate the parts unescaped (DEP0190). Caught immediately: a wrapped
  // `node -e "console.log('x y')"` reached the child as broken syntax because the
  // quoting was dropped on the way through. So we re-quote ourselves and hand the
  // shell one finished command line.
  const child = require('child_process').spawn(shellCommandLine(a.command), {
    stdio: 'inherit', shell: true, windowsHide: true,
  });
  child.on('error', (err) => {
    console.error(`cwos-headroom run: could not start ${a.command[0]}: ${err.message}`);
    letGo();
    process.exit(2);
  });
  child.on('close', (code, signal) => {
    if (beat) clearInterval(beat);
    letGo();
    // The child's verdict is the run's verdict, unchanged. A wrapper that
    // rewrites an exit code is a wrapper that hides a failing test.
    process.exit(signal ? 1 : (code === null ? 1 : code));
  });
};

// ── Subcommand: slots ────────────────────────────────────────────────────────
const slotsSubcommand = (argv) => {
  const json = argv.includes('--json');
  const extra = argv.slice(3).filter((t) => t !== '--json');
  if (extra.length) { console.error(`cwos-headroom slots: unknown argument ${extra[0]}`); process.exit(2); }

  const s = slots.status();
  if (json) { console.log(JSON.stringify(s, null, 2)); process.exit(0); }

  console.log('');
  if (s.degraded) console.log(`  WARN  slot registry: ${s.degraded}`);
  const cap = s.capacity ? `${s.capacity.slots}` : 'unknown';
  console.log(`  SLOTS  ${s.holders.length} held of ${cap}   (${slots.REGISTRY_PATH})`);
  for (const h of s.holders) console.log(`         ${slots.describeHolder(h)}`);
  for (const rec of s.reclaimed || []) console.log(`         reclaimed ${slots.describeHolder(rec.holder)}: ${rec.reason}`);
  if (!s.holders.length) console.log('         nothing is holding a high-memory slot right now.');
  console.log('');
  process.exit(0);
};

// ── Main ─────────────────────────────────────────────────────────────────────
const main = () => {
  // Subcommands are matched before parseArgs, which is flag-only and would
  // reject a bare word under ADR-063.
  if (process.argv[2] === 'run') return runSubcommand(process.argv);
  if (process.argv[2] === 'slots') return slotsSubcommand(process.argv);

  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (process.platform !== 'win32') {
    console.error('cwos-headroom: Windows-only today (uses Win32_Process). Port it before using on another node.');
    process.exit(2);
  }

  const enabledRoles = new Set(
    args.roles || ROLES.filter((r) => r.default).map((r) => r.id),
  );
  if (args.includeStaleTests) enabledRoles.add('stale-test');

  const before = snapshot();
  const byPid = new Map(before.procs.map((p) => [p.pid, p]));
  const claudeProcs = before.procs.filter((p) => /^claude\.exe$/i.test(p.name));
  const claudePids = new Set(claudeProcs.map((p) => p.pid));
  const selfChain = new Set(ancestry(process.pid, byPid, claudePids).chain.map((c) => c.pid));

  const candidates = [];
  const spared = [];

  for (const p of before.procs) {
    const cmd = (p.cmd || '').toLowerCase();
    if (!cmd) continue;
    if (NEVER_NAME.test(p.name)) continue;

    // The executable gate runs BEFORE the command-line test — see the `names` note above.
    const role = ROLES.find((r) => (!r.names || r.names.test(p.name)) && r.test(cmd));
    if (!role) continue;

    const anc = ancestry(p.pid, byPid, claudePids);
    const ageMin = p.ageMin >= 0 ? p.ageMin : Infinity;

    const protectedBy = [];
    if (!enabledRoles.has(role.id)) protectedBy.push(`role '${role.id}' not enabled`);
    if (anc.reachedLiveClaude) protectedBy.push('attached to a live Claude session');
    if (selfChain.has(p.pid)) protectedBy.push("in this process's own ancestry");
    if (ageMin < args.minAgeMin) protectedBy.push(`age ${ageMin.toFixed(0)}m < ${args.minAgeMin}m floor`);

    const row = {
      pid: p.pid,
      name: p.name,
      role: role.id,
      roleLabel: role.label,
      commitMB: p.commitMB,
      wsMB: p.wsMB,
      ageMin: Number.isFinite(ageMin) ? Math.round(ageMin) : null,
      claudeAncestorPid: anc.claudeAncestorPid,
      cmd: (p.cmd || '').replace(/\s+/g, ' ').slice(0, 120),
      chain: anc.chain.slice(0, 6).map((c) => `${c.name}:${c.pid}`).join(' <- '),
    };
    if (protectedBy.length) spared.push(Object.assign({}, row, { protectedBy }));
    else candidates.push(row);
  }

  candidates.sort((a, b) => b.commitMB - a.commitMB);
  spared.sort((a, b) => b.commitMB - a.commitMB);
  const reclaimableMB = candidates.reduce((s, c) => s + c.commitMB, 0);

  // ── Session reconciliation — REPORT ONLY, never a reclaim signal ───────────
  let reconciliation = null;
  if (args.sessions || args.json) {
    const registered = activeSessionPids(process.cwd());
    const rows = claudeProcs.map((p) => {
      // Memory the "attached to a live Claude session" rule is holding for THIS claude.exe.
      const heldMB = spared
        .filter((s) => s.claudeAncestorPid === p.pid)
        .reduce((sum, s) => sum + s.commitMB, 0);
      return {
        pid: p.pid,
        ageMin: p.ageMin >= 0 ? Math.round(p.ageMin) : null,
        commitMB: p.commitMB,
        session: registered.get(p.pid) || null,
        protectedMB: heldMB,
      };
    }).sort((a, b) => b.protectedMB - a.protectedMB);

    const unregistered = rows.filter((r) => !r.session);
    reconciliation = {
      claudeProcesses: rows.length,
      activeCwosSessions: registered.size,
      registered: rows.length - unregistered.length,
      unregistered: unregistered.length,
      memoryProtectedBehindUnregisteredMB: unregistered.reduce((s, r) => s + r.protectedMB, 0),
      rows,
      caveat: 'An unregistered claude.exe is NOT proof of a dead session — it may predate '
        + 'session registration, run in a repo without CWOS, or be mid-startup. This is a '
        + 'number for a human, never an authorisation to kill.',
    };
  }

  // ── Act ────────────────────────────────────────────────────────────────────
  const killed = [];
  const unverified = [];
  if (args.apply) {
    for (const c of candidates) {
      try {
        execFileSync('taskkill', ['/PID', String(c.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        killed.push(c);
      } catch (e) {
        // A process that exited between snapshot and kill is a success, but taskkill's
        // exit code cannot distinguish that from a genuine failure. Record it as
        // UNVERIFIED rather than claiming a reclaim that may not have happened — the
        // before/after commit delta below is the number that actually settles it.
        unverified.push(Object.assign({}, c, { error: String((e && e.message) || e).split('\n')[0] }));
      }
    }
  }

  const after = args.apply ? snapshot() : null;

  // ── Verdict ────────────────────────────────────────────────────────────────
  const freeMBNow = after ? after.freeMB : before.freeMB;
  const verdict = {
    measuredAt: new Date().toISOString(),
    before: {
      physicalTotalGB: +MB_TO_GB(before.totalMB).toFixed(2),
      physicalFreeGB: +MB_TO_GB(before.freeMB).toFixed(2),
      commitChargeGB: +MB_TO_GB(before.commitMB).toFixed(2),
      oversubscription: +(before.commitMB / before.totalMB).toFixed(2),
      processCount: before.procs.length,
    },
    reclaimable: { count: candidates.length, commitMB: reclaimableMB, items: candidates },
    protected: args.verbose ? spared : spared.length,
    sessions: reconciliation,
    applied: args.apply,
    killed: killed.map((k) => ({ pid: k.pid, role: k.role, commitMB: k.commitMB })),
    unverified,
    after: after ? {
      physicalFreeGB: +MB_TO_GB(after.freeMB).toFixed(2),
      commitChargeGB: +MB_TO_GB(after.commitMB).toFixed(2),
      processCount: after.procs.length,
    } : null,
    gate: args.requireGb === null ? null : {
      requiredGB: args.requireGb,
      actualFreeGB: +MB_TO_GB(freeMBNow).toFixed(2),
      met: MB_TO_GB(freeMBNow) >= args.requireGb,
    },
    // WS-711 lever 2. Sized from the SAME measurement the gate uses (post-reclaim
    // when --apply ran), so the two verdicts can never disagree about the machine.
    //
    // Computed on EVERY run, not only under --workers: it costs nothing (the
    // measurement is already taken) and it makes the answer ambient. A session
    // that runs this tool to see why the machine is slow should be told what
    // parallelism the machine can hold without having to know to ask. --workers
    // is then purely the accessor for scripts, not the switch that enables it.
    sizing: deriveWorkers({
      freeGB: MB_TO_GB(freeMBNow),
      perWorkerGB: args.perWorkerGb,
      reserveGB: args.reserveGb,
      maxWorkers: args.maxWorkers,
    }),
  };

  const gateRefused = !!(verdict.gate && !verdict.gate.met);

  // --workers is a PIPE CONTRACT: one bare integer on stdout and nothing else, so
  // `pytest -n $(...)` works. That contract is why this returns before the human
  // report — and why a refused gate prints NOTHING here. An empty substitution
  // breaks the runner's command line loudly; a number printed anyway would invite
  // exactly the run the gate just refused. --json wins over it: asking for a
  // format is asking for the whole verdict. To READ the sizing rather than pipe
  // it, drop --workers — the human report carries it either way.
  if (args.workers && !args.json) {
    if (gateRefused) {
      console.error(`cwos-headroom: GATE REFUSED — ${verdict.gate.actualFreeGB.toFixed(2)} GB free `
        + `< ${verdict.gate.requiredGB} GB required. No worker count issued; do not run the suite.`);
      process.exit(1);
    }
    console.log(String(verdict.sizing.workers));
    process.exit(0);
  }

  if (args.json) {
    console.log(JSON.stringify(verdict, null, 2));
  } else {
    const b = verdict.before;
    const pad = (n, w) => String(n).padStart(w);
    console.log('');
    console.log(`  HEADROOM   ${verdict.measuredAt}`);
    console.log(`  ${'-'.repeat(74)}`);
    console.log(`  physical       ${b.physicalFreeGB.toFixed(2)} GB free of ${b.physicalTotalGB.toFixed(2)} GB`);
    console.log(`  commit charge  ${b.commitChargeGB.toFixed(2)} GB  (${b.oversubscription}x physical)`
      + (b.oversubscription > 1.5 ? '   <-- oversubscribed, the machine is paging' : ''));
    console.log(`  processes      ${b.processCount}`);
    console.log('');
    if (!candidates.length) {
      console.log('  RECLAIMABLE    nothing — every role match was protected. --verbose shows why.');
    } else {
      console.log(`  RECLAIMABLE    ${candidates.length} process(es), ${reclaimableMB} MB of commit`);
      for (const c of candidates) {
        console.log(`    ${pad(c.pid, 6)}  ${pad(c.commitMB, 5)} MB  ${pad(c.ageMin === null ? '?' : c.ageMin, 5)}m  ${c.roleLabel}`);
        console.log(`            ${c.cmd}`);
      }
    }
    if (args.verbose && spared.length) {
      console.log('');
      console.log(`  PROTECTED      ${spared.length} matched a role and were spared`);
      for (const s of spared.slice(0, 30)) {
        console.log(`    ${pad(s.pid, 6)}  ${pad(s.commitMB, 5)} MB  ${s.roleLabel}`);
        console.log(`            ${s.protectedBy.join(' · ')}`);
      }
      if (spared.length > 30) console.log(`    ... and ${spared.length - 30} more`);
    }
    if (reconciliation) {
      const r = reconciliation;
      console.log('');
      console.log(`  SESSIONS       ${r.claudeProcesses} claude.exe  ·  ${r.activeCwosSessions} active CWOS session(s) registered fleet-wide`);
      for (const row of r.rows) {
        const tag = row.session ? `session ${row.session}` : 'NO active CWOS session claims this pid';
        console.log(`    ${pad(row.pid, 6)}  holds ${pad(row.protectedMB, 5)} MB of protected servers  ·  ${pad(row.ageMin === null ? '?' : row.ageMin, 5)}m`);
        console.log(`            ${tag}`);
      }
      if (r.unregistered) {
        console.log('');
        console.log(`  ⚠ ${r.unregistered} claude.exe process(es) hold ${r.memoryProtectedBehindUnregisteredMB} MB of servers`);
        console.log('    that "attached to a live Claude session" is protecting, with no active CWOS');
        console.log('    session claiming them. That is a QUESTION, not a verdict (WS-669): a session');
        console.log('    can predate registration or run in a repo without CWOS. Confirm by hand before');
        console.log('    closing anything — this tool will never kill on this signal.');
      }
    }
    if (args.apply) {
      console.log('');
      console.log(`  APPLIED        killed ${killed.length}` + (unverified.length ? `, ${unverified.length} unverified` : ''));
      console.log(`  after          ${verdict.after.physicalFreeGB.toFixed(2)} GB free  ·  commit ${verdict.after.commitChargeGB.toFixed(2)} GB  ·  ${verdict.after.processCount} processes`);
      const dFree = verdict.after.physicalFreeGB - b.physicalFreeGB;
      const dCommit = verdict.after.commitChargeGB - b.commitChargeGB;
      console.log(`  delta          free ${dFree >= 0 ? '+' : ''}${dFree.toFixed(2)} GB  ·  commit ${dCommit >= 0 ? '+' : ''}${dCommit.toFixed(2)} GB`);
      console.log('                 (the commit delta is the measured reclaim — the kill list is only the intent)');
    }
    if (verdict.gate) {
      console.log('');
      console.log(verdict.gate.met
        ? `  GATE  OK       ${verdict.gate.actualFreeGB.toFixed(2)} GB free >= ${verdict.gate.requiredGB} GB required`
        : `  GATE  REFUSED  ${verdict.gate.actualFreeGB.toFixed(2)} GB free < ${verdict.gate.requiredGB} GB required`);
      if (!verdict.gate.met) {
        console.log('                 A run that cannot fit must not start. Close sessions or editors,');
        console.log('                 re-run with --apply, or move the work to another fleet node');
        console.log('                 (cwos-fleet-run.js <node> ...).');
      }
    }
    if (verdict.sizing) {
      const z = verdict.sizing;
      console.log('');
      console.log(`  SIZING         ${z.workers} worker(s)`
        + `   (${z.usableGB.toFixed(2)} GB usable / ${z.perWorkerGB} GB per worker, max ${z.maxWorkers})`);
      console.log(`                 ${z.freeGB.toFixed(2)} GB free - ${z.reserveGB} GB reserved for the OS and this session`);
      if (!z.calibrated) {
        console.log(`                 per-worker cost is an ESTIMATE, not a measurement — pass`);
        console.log(`                 --per-worker-gb with your own figure once you have one`);
      }
      if (z.workers === 1) {
        console.log('                 one worker means RUN SERIALLY, not "do not run" — that is the gate.');
      }
    }
    console.log('');
  }

  // Sizing never changes an exit code on its own — it degrades, it does not refuse.
  process.exit(gateRefused ? 1 : 0);
};

main();
