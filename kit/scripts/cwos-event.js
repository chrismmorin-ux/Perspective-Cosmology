#!/usr/bin/env node
/**
 * cwos-event — thin CLI wrapper for appending a shadow event.
 *
 * ADR-018 step 1, WS-174 Phase B. Commands in `kit/commands/*.md` add
 * ONE call to this CLI at their final-summary step so the log records
 * a `command_completed` envelope. Per-mutation events fire from the
 * invoked scripts (Phase A), not from commands.
 *
 * Zero external dependencies. Safe to run in environments without a
 * workstream dir — failure is quiet + non-fatal (AS-42: guarded so
 * fleet repos without the runtime installed do not break).
 *
 * Usage:
 *   cwos-event append <type> --track <track> --tag <tag> [--payload <json>]
 *   cwos-event append command_completed --track T0:envelope --tag /status --payload '{"exit":0}'
 *   cwos-event head                      # print current chain head (empty if no log)
 *   cwos-event current-id                # print CWOS_COMMAND_ID (or generate + set)
 *
 * WS-594 — the ledger is append-only and hash-chained, so a junk record is
 * removable ONLY while it is still the last line. `cwos-event append` with no
 * event type therefore fails closed (exit 2, usage, nothing written) rather
 * than inventing a `command_completed` for a command that never ran. Three
 * separate sessions probed this tool for its usage in a single day and each
 * one got a written event instead of a usage string.
 */

'use strict';

require('./lib/preflight');

const path = require('path');
const { cliGate, formatUsage } = require('./lib/cli');

/**
 * ADR-063 CLI contract. Declared explicitly (flags are read dashless via the
 * parser, so a spec cannot be derived by scanning source for '--track').
 *
 * `append` is the only subcommand that writes; `head` and `current-id` are
 * read-only (`current-id` touches process.env, never the disk), which is why
 * only `append` carries a required positional.
 */
const CLI = {
  name: 'cwos-event',
  summary: 'append a hash-chained shadow event, or inspect the chain',
  usage: 'cwos-event <append|head|current-id|help> [options]',
  subcommands: {
    append: 'append ONE event — REQUIRES an event type positional',
    head: 'print the current chain head (empty if no log)',
    'current-id': 'print CWOS_COMMAND_ID (or generate + set one)',
    help: 'print this usage and exit without acting',
  },
  flags: {
    track: { type: 'string', describe: 'source track (default: T0:envelope)', default: 'T0:envelope' },
    tag: { type: 'string', describe: 'track tag, e.g. /status (default: the event type)' },
    payload: { type: 'string', describe: 'JSON object merged into the event payload' },
    causation: { type: 'string', describe: 'id of the event that caused this one' },
    tier: { type: 'string', describe: 'source tier (default: founder-prompt)', default: 'founder-prompt' },
  },
  notes: [
    'examples:',
    '  cwos-event append command_completed --track T0:envelope --tag /status --payload \'{"exit":0}\'',
    '  cwos-event head',
    '',
    'The event log is append-only and hash-chained: a record is removable only',
    'while it is still the last line. Arguments are therefore validated BEFORE',
    'the ledger is opened — `cwos-event append` with no event type exits 2 and',
    'writes nothing (WS-594).',
  ],
};

let events, composition, renderEvents, telemetry;

/**
 * Load the core modules. Called AFTER the CLI gate, so `--help` and a
 * malformed command line still explain themselves in a repo that has no
 * step-1 runtime installed.
 *
 * Guarded by AS-42: if the core modules are missing (e.g. fleet repo without
 * the step-1 runtime), exit 0 silently. Instrumented commands invoking this
 * CLI should NOT break the command.
 */
function loadCore() {
  try {
    events = require('./core/events');
    composition = require('./core/composition');
  } catch (err) {
    process.exit(0);
  }
  try { renderEvents = require('./core/render-events'); } catch { /* optional */ }
  try { telemetry = require('./core/telemetry'); } catch { /* optional */ }
}

// Best-effort post-append regen of system/events.log.md. Guarded with
// CWOS_SKIP_RENDER=1 for CI / replay-corpus runs. Failure is silent —
// never blocks the host command (AS-23).
function maybeRegenView() {
  if (!renderEvents) return;
  if (process.env.CWOS_SKIP_RENDER === '1') return;
  try { renderEvents.renderEventsLog({}); } catch { /* silent */ }
}

/**
 * Undo MSYS/Git Bash path conversion on `--tag` values. A literal `--tag /next`
 * arrives here as `C:/Program Files/Git/next` when the caller runs under Git
 * Bash, because MSYS rewrites leading-slash arguments into Windows paths
 * before Node sees argv. Tags are never legitimate absolute Windows paths, so
 * any drive-letter-prefixed tag is mangled: recover the original by taking the
 * final path segment and restoring the leading slash. (Root cause of the
 * `track_tag: "C:/Program Files/Git/next"` corruption that blinded INV-043
 * and every envelope consumer, 2026-04 → 2026-07.)
 */
function normalizeTag(tag) {
  if (!tag) return tag;
  if (/^[A-Za-z]:[\\/]/.test(tag)) {
    const last = tag.split(/[\\/]/).filter(Boolean).pop();
    if (last) return `/${last}`;
  }
  return tag;
}

function parsePayload(raw) {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
  } catch { /* fall through */ }
  return { raw: String(raw) };
}

function main() {
  // ADR-063 gate FIRST, before core modules load and long before the ledger is
  // opened for append. `--help`/`-h` print usage and exit 0 without acting; a
  // command line this script cannot parse is fatal (exit 2) rather than
  // half-obeyed.
  const { values, positionals, sub } = cliGate(process.argv.slice(2), CLI);

  if (sub === 'help') {
    process.stdout.write(formatUsage(CLI));
    process.exit(0);
  }

  // WS-594: the event type is REQUIRED and is checked here — before loadCore(),
  // before the chain head is read, before a single byte is appended. Defaulting
  // it to `command_completed` is what turned the universal "how do I call this"
  // probe into a write to an append-only ledger.
  if (sub === 'append' && positionals.length === 0) {
    process.stderr.write(
      'cwos-event: append requires an event type '
      + '(e.g. `cwos-event append command_completed --track T0:envelope --tag /status`). '
      + 'Nothing was written.\n\n'
      + formatUsage(CLI),
    );
    process.exit(2);
  }

  loadCore();

  try {
    if (sub === 'append') {
      const type = positionals[0];
      const track = values.track;
      const tag = normalizeTag(values.tag) || type;
      const payloadRaw = values.payload;
      const causation = values.causation || null;
      const sourceTier = values.tier;
      const payload = parsePayload(payloadRaw);
      payload.type = type;

      // WS-180: auto-populate transcript_mark for token attribution.
      // Silent no-op if telemetry module or transcript is unavailable.
      if (payload.transcript_mark == null && telemetry) {
        try {
          const mark = telemetry.currentTranscriptMark({ cwd: process.cwd() });
          if (Number.isInteger(mark)) payload.transcript_mark = mark;
        } catch { /* silent */ }
      }

      const commandId = composition.ensureCommandId(type);
      const result = events.appendEvent({
        source_track: track,
        source_tier: sourceTier,
        track_tag: tag,
        command_id: commandId,
        causation_id: causation,
        payload,
      });

      if (!result.ok) {
        // Warn-only per ADR-018 (validation in warn mode during step 1).
        process.stderr.write(`cwos-event: append validation failed: ${result.errors.join('; ')}\n`);
        process.exit(0); // non-blocking
      }
      process.stdout.write(`${result.event.id} ${result.event.content_hash.slice(0, 12)}\n`);
      maybeRegenView();
      return;
    }

    if (sub === 'head') {
      process.stdout.write(`${events.chainHead() || '(empty)'}\n`);
      return;
    }

    if (sub === 'current-id') {
      const id = composition.ensureCommandId();
      process.stdout.write(`${id}\n`);
      return;
    }

    // Unreachable in practice — cliGate rejects any subcommand not declared in
    // CLI.subcommands. Kept as a fail-closed backstop so a subcommand added to
    // the spec but not to this dispatch never silently does nothing and reports
    // success.
    process.stderr.write(`cwos-event: subcommand declared but not implemented: ${sub}\n`);
    process.exit(2);
  } catch (err) {
    // WS-532: a worktree refusal is NOT a shadow-log failure — it is a
    // deliberate policy stop, and AS-42's "never break the host command"
    // rationale does not cover it. Exiting 0 here would let a caller checking
    // status conclude the event landed, which is the silent fork the guard
    // exists to prevent. Fail loudly instead.
    if (err && err.code === 'CWOS_WORKTREE_WRITE_REFUSED') {
      process.stderr.write(`cwos-event: ${err.message}\n`);
      process.exit(1);
    }
    // Final safety net — AS-42 + AS-23 (do not break commands under any
    // shadow-log failure). Log to stderr, exit 0.
    process.stderr.write(`cwos-event: ${err.message}\n`);
    process.exit(0);
  }
}

if (require.main === module) main();

module.exports = { normalizeTag, CLI };
