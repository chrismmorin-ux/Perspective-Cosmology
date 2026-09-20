#!/usr/bin/env node
/**
 * cwos-mcp-census.js — what does each MCP server COST, and has it ever been CALLED?
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A globally-scoped MCP server is charged twice per session, on every repo:
 *
 *   - RAM. Measured on G16, 2026-08-23: six live sessions, `sympy-mcp` spawned once
 *     per session at ~750 MB. That is 4.5 GB — 29% of a 16 GB machine — held
 *     permanently, and it was a direct cause of tests reporting failures that did
 *     not exist, because the machine was paging.
 *   - CONTEXT. Every server's tool listing is injected into every session's prompt.
 *     `sympy-mcp` alone contributes ~33 tool definitions to repos that will never
 *     do symbolic algebra.
 *
 * Both are invisible. Nobody notices the tax, so nobody audits the roster, so
 * servers accumulate. `sympy-mcp`, `mermaid` and `wolfram-alpha` had all sat in
 * user scope with ZERO recorded invocations across 29 project transcript
 * directories before anyone measured (WS-708).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THE MEASUREMENT TRAP — THIS IS THE POINT OF THE SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The obvious query is WRONG, and it was got backwards on the first pass (WS-708):
 *
 *     grep -rl "mcp__sympy-mcp__" ~/.claude/projects/
 *     -> 539 hits in one repo, 15 repos overall
 *
 * Every one of those hits is the TOOL LISTING injected into the session's context,
 * not a call. **The string that names a capability is not the capability.** Reading
 * that 539 as usage is how a server nobody has ever invoked keeps its place on the
 * roster forever.
 *
 * The correct query matches the tool_use SHAPE — `"name":"mcp__<server>__<tool>"`
 * as it appears in an assistant tool-call record — which the listing does not
 * produce. That is what this script runs.
 *
 * AND IT VALIDATES ITSELF. A zero is only trustworthy from a query proven to
 * detect a positive, so the census always reports the servers it DID find. If
 * `playwright` (known-used, hundreds of calls) does not appear with a non-zero
 * count, the pattern is broken and every zero on the report is meaningless — the
 * script says so rather than letting you act on it.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   node kit/scripts/cwos-mcp-census.js              # invocation counts, all servers
 *   node kit/scripts/cwos-mcp-census.js --json       # machine-readable
 *   node kit/scripts/cwos-mcp-census.js --since 30   # only transcripts touched in N days
 *
 * A zero is EVIDENCE, NOT A VERDICT. It shows only that nobody has used the server
 * YET. Removing one is a founder call — and before removing any server, capture its
 * definition (`claude mcp get <name>`), because removal destroys the config,
 * including any API key it carries.
 *
 * Exit codes: 0 = ok · 2 = usage error or unusable result.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const HELP = `
cwos-mcp-census.js — what does each MCP server cost, and has it ever been called?

USAGE
  node kit/scripts/cwos-mcp-census.js [flags]

FLAGS
  --since N   Only count transcripts modified in the last N days (default: all).
  --json      Machine-readable output.
  --help,-h   This text.

WHAT IT COUNTS
  Actual tool_use records — the shape "name":"mcp__<server>__<tool>" — NOT mentions
  of the tool name. Those differ by three orders of magnitude: the naive grep
  reported 539 "hits" for a server with zero real invocations (WS-708).

  The census reports which servers it DID find, so a zero can be trusted only when
  a known-used server (playwright) shows a non-zero count in the same pass. If it
  does not, the pattern is broken and the script says so instead of reporting zeros.

READING THE RESULT
  A zero means nobody has used the server YET — evidence, not a verdict. Scope or
  removal is a founder call. Capture the definition first (\`claude mcp get <name>\`):
  removal destroys the config, including any API key it holds.
`;

const parseArgs = (argv) => {
  const a = { json: false, since: null, help: false };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--json') a.json = true;
    else if (t === '--since') a.since = Number(argv[++i]);
    else if (t === '--help' || t === '-h') a.help = true;
    // ADR-063: refuse an unrecognised flag rather than acting on a guess.
    else { console.error(`cwos-mcp-census: unknown argument ${t}\nRun with --help for the flags this accepts.`); process.exit(2); }
  }
  if (a.since !== null && (!Number.isFinite(a.since) || a.since <= 0)) {
    console.error('cwos-mcp-census: --since needs a positive number of days');
    process.exit(2);
  }
  return a;
};

// The tool_use shape, NOT a bare mention. See the header — this distinction is the
// entire reason the script exists.
const INVOCATION = /"name"\s*:\s*"mcp__([a-zA-Z0-9_.-]+?)__([a-zA-Z0-9_]+)"/g;

// A server whose presence proves the pattern still matches reality. If this one
// comes back zero, every other zero in the report is noise.
const CANARY = 'playwright';

const walk = function* (dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && /\.jsonl?$/.test(e.name)) yield full;
  }
};

const main = () => {
  const args = parseArgs(process.argv);
  if (args.help) { console.log(HELP); process.exit(0); }

  const root = path.join(os.homedir(), '.claude', 'projects');
  if (!fs.existsSync(root)) {
    console.error(`cwos-mcp-census: no transcript directory at ${root} — nothing to measure.`);
    process.exit(2);
  }

  const cutoff = args.since ? Date.now() - args.since * 86400_000 : null;
  const counts = new Map();   // server -> total invocations
  const perRepo = new Map();  // server -> Set(project dir)
  let filesScanned = 0;
  let filesSkipped = 0;

  for (const file of walk(root)) {
    try {
      if (cutoff && fs.statSync(file).mtimeMs < cutoff) { filesSkipped++; continue; }
      const text = fs.readFileSync(file, 'utf8');
      filesScanned++;
      const project = path.relative(root, file).split(path.sep)[0];
      let m;
      INVOCATION.lastIndex = 0;
      while ((m = INVOCATION.exec(text)) !== null) {
        const server = m[1];
        counts.set(server, (counts.get(server) || 0) + 1);
        if (!perRepo.has(server)) perRepo.set(server, new Set());
        perRepo.get(server).add(project);
      }
    } catch { filesSkipped++; }
  }

  const rows = [...counts.entries()]
    .map(([server, n]) => ({ server, invocations: n, repos: perRepo.get(server).size }))
    .sort((a, b) => b.invocations - a.invocations);

  const canaryOk = (counts.get(CANARY) || 0) > 0;

  if (args.json) {
    console.log(JSON.stringify({
      measuredAt: new Date().toISOString(),
      transcriptRoot: root,
      filesScanned,
      filesSkipped,
      sinceDays: args.since,
      servers: rows,
      canary: { server: CANARY, invocations: counts.get(CANARY) || 0, ok: canaryOk },
      caveat: 'Counts are tool_use records, not mentions. A zero means "not used yet", not "not needed".',
    }, null, 2));
    process.exit(canaryOk ? 0 : 2);
  }

  console.log('');
  console.log(`  MCP CENSUS   ${new Date().toISOString()}`);
  console.log(`  ${'-'.repeat(74)}`);
  console.log(`  scanned        ${filesScanned} transcript file(s)`
    + (filesSkipped ? `, skipped ${filesSkipped}` : '')
    + (args.since ? `  ·  last ${args.since} day(s)` : ''));
  console.log('');
  if (!rows.length) {
    console.log('  no MCP tool invocations found at all — see the canary note below.');
  } else {
    console.log('  INVOKED        server                        calls   repos');
    for (const r of rows) {
      console.log(`                 ${r.server.padEnd(28)} ${String(r.invocations).padStart(6)}  ${String(r.repos).padStart(6)}`);
    }
  }
  console.log('');
  if (!canaryOk) {
    console.log(`  ⚠ CANARY FAILED — '${CANARY}' shows zero invocations.`);
    console.log('    That server is known to be heavily used, so a zero for it means the match');
    console.log('    pattern no longer fits the transcript format — NOT that nothing is used.');
    console.log('    Every zero in this report is unusable until the pattern is fixed.');
    console.log('');
    process.exit(2);
  }
  console.log(`  canary OK      '${CANARY}' non-zero, so the pattern still detects real calls`);
  console.log('                 and a zero elsewhere is a real zero.');
  console.log('');
  console.log('  Any configured server ABSENT from the list above has never been invoked.');
  console.log('  Compare against `claude mcp list`. A zero is evidence, not a verdict — it');
  console.log('  shows only that nobody has used it YET, and scoping is a founder call.');
  console.log('  Capture the definition (`claude mcp get <name>`) BEFORE removing anything:');
  console.log('  removal destroys the config, including any API key it carries.');
  console.log('');
  process.exit(0);
};

main();
