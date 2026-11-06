#!/usr/bin/env node
/**
 * cwos-admin-escalation-audit.js — PreToolUse audit trail for admin escalation.
 *
 * On Windows, sshd skips UAC filtering, so `ssh chris@localhost '<cmd>'` returns
 * a full administrator token with no prompt. ADR-059 keeps that path — it removes
 * real founder friction, and removing it just pushes admin work back to UAC
 * clicks — but makes every use leave a record.
 *
 * This hook is AUDIT-ONLY by decision, not by oversight. ADR-059 §3 considered a
 * denylist of destructive admin commands and rejected it: denylists have gaps
 * that invite false confidence while blocking legitimate work. This never blocks
 * and always exits 0.
 *
 * Log: ~/.claude/admin-escalation.log (JSON lines).
 * Installed via ~/.claude/settings.json PreToolUse, matcher "Bash|PowerShell".
 *
 * 2026-10-14 adversarial review: the hook saw only the Bash tool, so the same
 * escalation sent through the PowerShell tool left no record, and the patterns
 * required the host to follow `ssh ` directly, so `ssh -o BatchMode=yes
 * chris@localhost`, `ssh chris@100.87.51.104` and `cwos-fleet-run.js cm-node1`
 * all went unlogged. The patterns below take ssh options before the host and
 * name the tailnet addresses. cwos-dispatch-contain.js reuses classify() to
 * BLOCK these for dispatched sessions; for founder sessions this stays a record.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// CWOS_ESCALATION_LOG redirects the log; tests use it so they never write the real one.
const LOG_PATH = process.env.CWOS_ESCALATION_LOG || path.join(os.homedir(), '.claude', 'admin-escalation.log');
const AUDITED_TOOLS = new Set(['Bash', 'PowerShell']);

// SSH invocations that land on a shell with elevated rights. Two shapes:
//   - loopback to this machine: the no-UAC admin token path
//   - a fleet node over the tailnet: sessions there carry a full admin token
// Matched on the command string; deliberately broad, since this only records.
// `ssh`, then any options, then the host. Options never contain a shell
// separator, so stopping at one keeps a later unrelated word from matching.
const SSH = String.raw`\bssh(?:\s+-\S+(?:\s+[^\s|;&@-]\S*)?)*\s+(?:[\w.-]+@)?`;
// The host must end the token: `localhost` matches, `localhostile` does not.
const host = (h) => new RegExp(SSH + h + String.raw`(?![\w.-])`, 'i');

const ESCALATION_PATTERNS = [
  { kind: 'localhost-admin', re: host(String.raw`(?:localhost|127\.0\.0\.1|::1)\b`) },
  { kind: 'localhost-admin', re: host(String.raw`100\.120\.209\.34\b`) },
  { kind: 'fleet-node',      re: host(String.raw`cm-node\d+\b`) },
  { kind: 'fleet-node',      re: host(String.raw`100\.87\.51\.104\b`) },
  { kind: 'fleet-node',      re: host(String.raw`(?:morincomputer|g16)\b`) },
  // 2026-08-22: an adversarial audit of ServeYourNote found the one hook whose
  // job is to record prod escalation did not fire for that repo's production
  // server at all. Its SSH alias is `serveyournote` -- it carries neither
  // `prod` nor `production`, so no name heuristic matched it either, and every
  // prod action went unrecorded. Named hosts first, then the generic shape, so
  // a new deployment target is covered on day one rather than after an incident.
  { kind: 'production-host', re: host(String.raw`serveyournote\b`) },
  { kind: 'production-host', re: host(String.raw`[\w.-]*(prod|production)[\w.-]*`) },
  // A remote AI dispatch lands in an admin ssh session on the target node.
  { kind: 'fleet-dispatch',  re: /\bcwos-(?:fleet-run|repo-ask)(?:\.js)?\b/i },
];

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function classify(cmd) {
  for (const { kind, re } of ESCALATION_PATTERNS) {
    if (re.test(cmd)) return kind;
  }
  return null;
}

function record(entry) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // An audit trail must never break the session it is observing.
  }
}

function main() {
  const raw = readStdin();

  let input;
  try {
    // Strip a UTF-8 BOM — some shells prepend one when piping.
    input = JSON.parse(raw.replace(/^﻿/, '') || '{}');
  } catch {
    process.exit(0);
  }

  if (!AUDITED_TOOLS.has(input.tool_name || '')) process.exit(0);

  const cmd = String((input.tool_input || {}).command || '');
  const kind = classify(cmd);
  if (!kind) process.exit(0);

  record({
    timestamp: new Date().toISOString(),
    node: os.hostname(),
    kind,
    session_id: input.session_id || null,
    cwd: input.cwd || process.cwd(),
    command: cmd,
  });

  process.exit(0);
}

// WS-544: guard the entry point so requiring this file for a dependency
// smoke check does not run it.
if (require.main === module) main();

module.exports = { classify, ESCALATION_PATTERNS, LOG_PATH };
