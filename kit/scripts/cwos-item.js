#!/usr/bin/env node
/**
 * cwos-item — item-level status transitions for the work queue.
 *
 * WHY THIS EXISTS (WS-537). `/workstream` documented `done|defer|claim|...` and
 * CLAUDE.md's routing table told sessions to use it instead of hand-editing
 * queue YAMLs — but only `done` (sprint-scoped, in cwos-next.js) and `block`
 * were ever implemented. There was no way to defer, dismiss, or supersede an
 * item through the envelope. So the bookkeeping either did not happen or
 * happened as raw YAML edits that bypassed event emission entirely.
 *
 * The consequence was measured on 2026-07-26: kit-quality sat at 18 open items
 * against a cap of 12 and fleet-health at 13 against 10, and SEVEN of those
 * were items that should not have been open at all — two duplicate pairs, two
 * gated on an item that was itself deferred, two pinned to a kit version four
 * releases stale, one explicitly conditional on a falsifier that had not fired.
 * None of that was neglect. There was simply no supported way to say "not this
 * one, and here is why."
 *
 * DESIGN COMMITMENTS
 *
 *  1. A reason is mandatory and is length-checked. An item leaving the backlog
 *     without a recorded rationale is how a queue becomes untrustworthy — the
 *     next session cannot tell a considered decision from an abandoned one.
 *  2. `defer` additionally requires --until: the condition that brings the item
 *     back. A deferral with no resume trigger is a silent dismissal wearing a
 *     softer word, and it is what turns a backlog into a graveyard.
 *  3. Nothing is deleted. Every transition is reversible via `restore`, and the
 *     item file keeps its full history. This mirrors the portfolio doctrine in
 *     ai-personal/intention.md: dormancy is a state, not an ending.
 *  4. Event-log first, YAML second — same commit-point convention as
 *     cwos-next.js runDone. If the YAML write fails the event still records the
 *     intent and reconcile catches up. `add` is the one inversion: it writes
 *     the file first, because an item_created event naming a file that does not
 *     exist is a phantom rather than a recoverable intent.
 *
 * WS-665 ADDED THE TWO ENDS OF AN ITEM'S LIFE. The middle was covered; the
 * beginning and the end were not, and both got hand-written YAML instead:
 *
 *  * `add` — nothing in the kit created a work item. `/workstream create` was
 *    prose with no script behind it, and every WS-*.yaml writer was an
 *    auto-promoter. AI-Personal hand-wrote WS-175..179 as raw YAML on
 *    2026-08-17, skipping id allocation and the event log entirely.
 *  * `done` — completion lives in cwos-next.js so sprint and item closure stay
 *    atomic, but that command requires --sprint. An item claimed outside any
 *    sprint therefore had NO closure path; HomeBase's WS-651 was hand-edited on
 *    2026-08-18. `done` here serves exactly that case and refuses any item a
 *    live sprint owns, naming the command that owns it. The atomicity
 *    commitment is preserved by the refusal, not abandoned.
 *
 * WS-716 ADDED `correct`, THE FOURTH GAP OF THE SAME SHAPE. A record that
 * turns out to be FALSE is a normal outcome of learning, and there was no
 * supported way to say so. Every verb above changes an item's state; none of
 * them changes what an item CLAIMS.
 *
 * Measured on 2026-08-23 in ServeYourNote: WS-457 shipped titled "Every
 * anonymous rate limit in the app was bypassable with one X-Forwarded-For
 * header", and its description asserted that Caddy appends to that header. Both
 * were false -- Caddy replaces, and the bypass was never reachable in
 * production. Fixing the record meant hand-editing the queue YAML and appending
 * an event by hand: exactly the bypass CLAUDE.md's routing table forbids, done
 * twice, because the envelope had no verb for it.
 *
 * `correct` preserves what it replaces, in the ITEM FILE and not only in the
 * event log. That is design commitment 3 applied to prose: had WS-457's title
 * simply been overwritten, a reader six months later would see clean text and
 * never learn the record had once asserted a live production vulnerability. That
 * the claim was made, survived unchecked, and was withdrawn is itself evidence
 * -- about how beliefs form here and how long they last before anything tests
 * them. Deleting it is the tidying `dismiss` is warned against, one layer down.
 *
 * It refuses to touch `status`, `priority_score`, `program` and the transition
 * bookkeeping. Those are state, they have their own verbs, and changing one
 * under the word "correct" is a transition wearing a correction's clothes.
 *
 * Usage:
 *   cwos-item add      "<title>" --program <id> --why "<text>" [options]
 *   cwos-item done     WS-NNN [--notes "<text>"] [--commit <sha>]
 *   cwos-item defer    WS-NNN --reason "<text>" --until "<resume condition>"
 *   cwos-item dismiss  WS-NNN --reason "<text>" [--superseded-by WS-MMM]
 *   cwos-item restore  WS-NNN --reason "<text>" [--to backlog]
 *   cwos-item release  WS-NNN --reason "<text>"
 *   cwos-item correct  WS-NNN --field <f> --to "<text>" --reason "<text>"
 *   cwos-item scope    WS-NNN --files "a,b" --reason "<text>" [--new "x"] [--replace]
 *   cwos-item inspect  WS-NNN --verdict pass|fail --inspector "<id>" --evidence "<text>"
 *   cwos-item show     WS-NNN
 *
 * Output is JSON on stdout. Exit 0 on success, 2 on usage/validation error.
 */

'use strict';

require('./lib/preflight');

const fs = require('fs');
const path = require('path');

const {
  readYAMLFile, writeFileAtomic, withFileLock, findWorkstreamDir, findRepoRoot,
  todayISO, escapeYamlString, formatScalar, loadEventDeps, blockScalarLines, parseYAML,
} = require('./lib/cwos-utils');
const { runClosureSideEffects } = require('./lib/item-closure');
const inspectionGate = require('./lib/inspection-gate');

const MIN_REASON_LEN = 20;

// Fields `correct` may rewrite: what an item CLAIMS, never what it IS.
//
// The exclusions are the point. `status` has defer/dismiss/restore/done.
// `priority_score` and `program` are re-derived by reconcile. The *_at stamps,
// *_reason fields and transitioned_by_event are the audit trail of the verbs
// above -- rewriting one under the word "correct" would let this command
// launder a state change, which is the one thing it must never do.
// `completion_commit` is correctable (poker-tracker WS-678 cleanup, 2026-08-27) and it is
// NOT a laundering hole: it does not move an item between states, it names WHICH change
// closed an item that is already closed. It is a provenance claim, and a wrong provenance
// claim is exactly what `correct` exists to fix with a stated reason.
//
// It needs to be correctable because it was systematically wrong. `cwos-next done` stamped
// `git rev-parse --short HEAD` onto every item in a sprint, so 41 of 69 recorded values
// shared a sha with another ticket and only 34.8% named their own ticket. Records written
// that way are repaired here.
const CORRECTABLE_FIELDS = [
  'title', 'description', 'accept_criteria', 'evidence', 'source', 'notes',
  'completion_commit', 'completion_commit_source',
];

// Status transitions driven by the shared runTransition path. `done` is NOT
// here because it is not a symmetric transition: closure carries side effects
// (calibration writes, friction announces, claim release) and a sprint-ownership
// refusal. See runDoneItem below.
const TRANSITIONS = {
  defer: {
    status: 'deferred',
    stampField: 'deferred_at',
    reasonField: 'defer_reason',
    requiresUntil: true,
    // Terminal states are not re-openable through defer; use restore first.
    // `review` (poker-tracker WS-181 sat in it from 2026-05-11 to 2026-09-18): nothing could
    // leave it — not defer, not dismiss, and `correct` refuses status by design. A status no
    // verb can leave is a false record the moment the session that set it dies.
    from: ['backlog', 'blocked', 'claimed', 'in_progress', 'review'],
  },
  dismiss: {
    status: 'dismissed',
    stampField: 'dismissed_at',
    reasonField: 'dismiss_reason',
    requiresUntil: false,
    from: ['backlog', 'blocked', 'claimed', 'in_progress', 'deferred', 'review'],
  },
  restore: {
    status: 'backlog',
    stampField: 'restored_at',
    reasonField: 'restore_reason',
    requiresUntil: false,
    from: ['deferred', 'dismissed', 'blocked'],
  },
  // poker-tracker WS-678 cleanup, 2026-08-27. An item could reach `in_progress` with
  // `claimed_by: null` and then had NO EXIT — a state every tool was blind to:
  //   /next               composes from `backlog`, so it never saw it
  //   cwos-item restore   allows deferred|dismissed|blocked, not in_progress
  //   cwos-item correct   refuses status by design (it is state, not a field)
  //   session-recovery    defines orphaned as "claimed by a dead session", and
  //                       these have no owner to trace — measured: 492 scanned,
  //                       0 claimed, 0 orphaned, while four sat stuck
  // Four items were in it, three since 2026-05-01. `restore` is the wrong verb
  // because nothing deferred or dismissed them; the claim died and left the
  // status behind. This is that claim being let go.
  release: {
    status: 'backlog',
    stampField: 'released_at',
    reasonField: 'release_reason',
    requiresUntil: false,
    from: ['claimed', 'in_progress', 'review'],
  },
};

function readFlag(args, name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1 || i === args.length - 1) return null;
  return args[i + 1];
}

// Flags each subcommand accepts. ADR-063: a script carrying the CLI contract
// refuses a flag it does not recognize rather than ignoring it. This CLI used
// to ignore them, which was survivable while every subcommand took two flags
// and both were mandatory — a missing --reason failed loudly. `add` changes
// that: it has thirteen optional flags with defaults, so a typo'd --priorty
// would have silently created an item at priority 50 and nothing would ever
// report it. A rejected flag is a fast honest answer; a wrong default is not.
const KNOWN_FLAGS = {
  add: [
    'title', 'program', 'why', 'priority', 'effort', 'severity', 'type',
    'category', 'capability', 'dedup-key', 'blocked-by', 'description',
    'description-file', 'accept-criteria', 'session', 'customer-impact',
    // WS-789: risk-schema fields set at intake — what grows the
    // autonomous-eligible pool without a retrofit pass.
    'external-acts', 'facts-needed', 'verify', 'files-involved',
  ],
  done: ['notes', 'commit', 'clock', 'skip-inspection', 'finding-open'],
  inspect: ['verdict', 'inspector', 'evidence', 'diff', 'class', 'contract-ref', 'tokens'],
  defer: ['reason', 'until', 'to'],
  dismiss: ['reason', 'superseded-by', 'to'],
  restore: ['reason', 'to'],
  release: ['reason'],
  tag: ['customer-impact', 'reason'],
  correct: ['field', 'to', 'reason'],
  scope: ['files', 'reason', 'new', 'replace'],
  show: [],
};

/**
 * Refuse any `--flag` the subcommand does not declare.
 *
 * Walks pairwise so a VALUE that begins with `--` (a --reason whose text opens
 * with a dash) is consumed as a value rather than mistaken for a flag.
 */
// Flags that take no value. Without this the walker below would swallow the
// next token as the boolean's value.
const BOOLEAN_FLAGS = { scope: ['replace'] };

function assertKnownFlags(verb, args) {
  const known = new Set(KNOWN_FLAGS[verb] || []);
  const bools = new Set(BOOLEAN_FLAGS[verb] || []);
  const unknown = [];
  for (let i = 0; i < args.length; i++) {
    const tok = args[i];
    if (typeof tok !== 'string' || !tok.startsWith('--')) continue;
    const name = tok.slice(2).split('=')[0];
    if (!known.has(name)) { unknown.push(tok); continue; }
    if (bools.has(name)) {
      if (tok.includes('=')) fail(`${verb}: --${name} takes no value`);
      continue;
    }
    // `--flag=value` was accepted here and then ignored: readFlag matches the
    // bare flag only, so the value was dropped AND the next token was skipped
    // as if it were the value. Refused, like any other form this CLI cannot act on.
    if (tok.includes('=')) {
      fail(`${verb}: write --${name} <value>, not --${name}=<value> — the = form is not read and its value would be dropped`);
    }
    // A value that begins with a dash is a value. One that IS another flag of
    // this verb means the value was left out.
    const next = args[i + 1];
    if (typeof next === 'string' && next.startsWith('--') && known.has(next.slice(2))) {
      fail(`${verb}: --${name} needs a value (the next argument is the flag ${next})`);
    }
    i++; // the next token is this flag's value
  }
  if (unknown.length > 0) {
    fail(
      `${verb}: unrecognized flag${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. ` +
      'Acting on a flag this command does not implement is how a typo becomes a ' +
      'silently wrong value — run --help for what it does accept.',
      { unknown_flags: unknown, accepted: KNOWN_FLAGS[verb] || [] }
    );
  }
}

function writeJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

function fail(msg, extra) {
  writeJson(Object.assign({ ok: false, error: msg }, extra || {}));
  process.exit(2);
}

function queuePathFor(wsDir, id) {
  return path.join(wsDir, 'queue', `${id}.yaml`);
}

/**
 * Patch a top-level scalar, or append it when absent. Regex-based rather than
 * parse-and-reserialize on purpose: queue YAMLs carry hand-written prose
 * (description, accept_criteria, completion_notes) that the CWOS YAML subset
 * does not round-trip losslessly. Same reasoning as cwos-next.js runDone.
 */
function patchScalar(raw, field, value) {
  const line = `${field}: "${escapeYamlString(value)}"`;
  const re = new RegExp(`^${field}:\\s*.*$`, 'm');
  if (re.test(raw)) return raw.replace(re, line);
  return raw.trimEnd() + `\n${line}\n`;
}

/**
 * Locate a top-level field, including a `|` / `>` block scalar's whole body.
 *
 * patchScalar above cannot serve `correct`: it writes `field: "..."`, which
 * collapses a multi-line block into one quoted line and mangles every newline
 * in a description. Corrections land almost entirely on prose fields, so the
 * block form has to survive the round trip.
 */
function fieldBlockRange(raw, field) {
  const lines = raw.split('\n');
  const head = new RegExp(`^${field}:(\\s|$)`);
  // Only a real top-level key: a `field:` line inside another value is text.
  const { keys } = scanTopLevel(raw);
  if (!keys.has(field)) return null;
  const start = keys.get(field);

  // A quoted scalar runs to its closing quote, and YAML lets its continuation
  // lines sit at column 0. Stopping at the first unindented line left
  // ServeYourNote's accept_criteria tails dangling under the new value.
  const close = quotedScalarEnd(lines, start, lines[start].replace(head, ''));
  if (close !== -1) return { start, end: close, lines };

  // WS-1092: a top-level field owns every following line that is blank, indented,
  // or a column-0 sequence item ("- x" is legal at the key's own indent). That
  // covers block scalars, mappings, sequences, and quoted/plain scalars folded
  // over several lines -- the old code extended only over `|` / `>` bodies, so
  // replacing a mapping or a multi-line quoted string left its tail dangling.
  let end = start;
  for (let i = start + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (l.trim() === '' || /^\s/.test(l) || /^-(\s|$)/.test(l)) { end = i; continue; }
    break;
  }
  // Do not swallow blank lines that separate this field from the next.
  while (end > start && lines[end].trim() === '') end -= 1;
  return { start, end, lines };
}

/**
 * The line on which a quoted scalar that opens `value` (the text after
 * `key:` on lines[start]) closes; -1 when the value is not quoted or never
 * closes. Double quotes honour backslash escapes, single quotes the `''` pair.
 */
function quotedScalarEnd(lines, start, value) {
  const v = value.trimStart();
  const q = v[0];
  if (q !== '"' && q !== "'") return -1;
  let text = v.slice(1);
  for (let i = start; i < lines.length; i += 1) {
    if (i > start) text = lines[i];
    for (let j = 0; j < text.length; j += 1) {
      if (q === '"' && text[j] === '\\') { j += 1; continue; }
      if (text[j] !== q) continue;
      if (q === "'" && text[j + 1] === "'") { j += 1; continue; }
      return i;
    }
  }
  return -1;
}

/**
 * Column-0 lines that are not a plain `identifier:` key, a sequence item, a
 * comment or a document marker, and do not sit inside a quoted scalar.
 *
 * This is the positive definition of what these rewriters accept: the block
 * mapping with identifier keys that every CWOS writer produces. Anything else
 * -- a quoted or `? ` explicit key, a JSON-form item, a `%YAML` directive, text
 * the reader silently drops -- is a shape the line-based writers cannot be
 * proved safe on, because the kit reader misreads it without a warning. Listing
 * exotic shapes one at a time is the chase that failed nine inspections on
 * wt/fr-item; a whitelist ends it.
 */
function strayTopLevelLines(raw) {
  return scanTopLevel(raw).stray;
}

/**
 * The line on which a flow collection that opens `value` (`[` or `{`) closes;
 * -1 when the value is not one or never closes. Quotes and comments inside it
 * are honoured so a bracket in text does not count.
 */
function flowCollectionEnd(lines, start, value) {
  const v = value.trimStart();
  if (v[0] !== '[' && v[0] !== '{') return -1;
  let depth = 0;
  let quote = null;
  for (let i = start; i < lines.length; i += 1) {
    const text = i === start ? v : lines[i];
    for (let j = 0; j < text.length; j += 1) {
      const c = text[j];
      if (quote) {
        if (quote === '"' && c === '\\') j += 1;
        else if (c === quote && quote === "'" && text[j + 1] === "'") j += 1;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") quote = c;
      else if (c === '#' && (j === 0 || /\s/.test(text[j - 1]))) break;
      else if (c === '[' || c === '{') depth += 1;
      else if ((c === ']' || c === '}') && --depth === 0) return i;
    }
  }
  return -1;
}

/**
 * One pass that decides which lines are the file's real top-level keys, shared
 * by the writers (fieldBlockRange, insertListEntry) and the check
 * (verifyRewrite) so they cannot disagree about it.
 *
 * Returns { keys: Map(name -> line index), stray, hidden }:
 *  - stray: column-0 lines that are not a plain `identifier:` key, a sequence
 *    item, a comment or a document marker, and not inside a value.
 *  - hidden: lines a value spills onto that the kit reader reads without a
 *    warning as something else -- a column-0 line inside a quoted value opened
 *    by a `- key:` sequence item, or any flow collection spanning lines. A
 *    line there can look exactly like `corrections: []`; a writer that took it
 *    for a key, and a check that could not see it, is inspection 4's FAIL.
 *
 * Together they are the positive definition of what these rewriters accept:
 * the block mapping with identifier keys every CWOS writer produces. Listing
 * exotic shapes one at a time is the chase that failed nine inspections on
 * wt/fr-item; a whitelist ends it.
 */
function scanTopLevel(raw) {
  const lines = raw.split('\n');
  if (lines.length && lines[0].charCodeAt(0) === 0xFEFF) lines[0] = lines[0].slice(1);
  const keys = new Map();
  const stray = [];
  const hidden = [];
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    const m = l.match(/^(\s*)(-\s+)?([A-Za-z_][\w.-]*):(\s|$)/);
    if (m) {
      const top = m[1] === '' && !m[2];
      if (top && !keys.has(m[3])) keys.set(m[3], i);
      const rest = l.slice(m[0].length);
      if (/^\s*[|>][-+0-9]*\s*(#.*)?$/.test(rest)) {
        // A block scalar's body is text, however much of it looks like keys.
        let end = i;
        for (let j = i + 1; j < lines.length; j += 1) {
          if (lines[j].trim() === '' || lines[j].length - lines[j].trimStart().length > m[1].length) end = j;
          else break;
        }
        i = end;
        continue;
      }
      const flow = flowCollectionEnd(lines, i, rest);
      const end = Math.max(i, flow, quotedScalarEnd(lines, i, rest));
      if (flow > i) hidden.push(l);
      // Measured 2026-10-21: the reader follows a quoted value onto column-0
      // lines under any mapping key, nested ones included, but under a `- key:`
      // sequence item it keeps only the first line and reads the rest as keys.
      else if (m[2]) for (let j = i + 1; j <= end; j += 1) if (/^\S/.test(lines[j])) hidden.push(lines[j]);
      i = end;
      continue;
    }
    if (l.trim() === '' || /^\s/.test(l) || /^#/.test(l) || /^-(\s|$)/.test(l) || /^(---|\.\.\.)(\s|$)/.test(l)) continue;
    stray.push(l);
  }
  return { keys, stray, hidden };
}

/**
 * Index of the first character outside YAML's printable set (tab, LF, CRLF,
 * the printable ranges, NEL), or -1. A lone CR counts: YAML reads it as a line
 * break, which these line-based writers do not. Code-point arithmetic rather
 * than a regex so the ranges cannot be mangled by an escape.
 */
function firstUnprintable(text) {
  for (let i = 0; i < text.length; i += 1) {
    const c = text.codePointAt(i);
    if (c > 0xFFFF) { i += 1; continue; }
    const ok = c === 0x09 || c === 0x0A || (c === 0x0D && text.charCodeAt(i + 1) === 0x0A)
      || (c >= 0x20 && c <= 0x7E) || c === 0x85 || (c >= 0xA0 && c <= 0xD7FF) || (c >= 0xE000 && c <= 0xFFFD);
    if (!ok) return i;
  }
  return -1;
}

/** True when a `---` or `...` marker sits anywhere but as the first content line. */
function hasInnerDocumentMarker(raw) {
  const text = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  let seenContent = false;
  for (const l of text.split('\n')) {
    if (!seenContent && (l.trim() === '' || /^#/.test(l))) continue;
    const marker = /^(---|\.\.\.)(\s|$)/.test(l);
    if (marker && (seenContent || l.startsWith('...'))) return true;
    seenContent = true;
  }
  return false;
}

/**
 * Insert a new entry first under the top-level list `key`, in whatever shape
 * the list already has: absent, a bare `key:` header, an inline `key: []`, and
 * entries at column 0 or indented. Returns null for any other shape (an inline
 * list with entries, a scalar) -- the caller refuses rather than guesses.
 *
 * Inserted rather than re-serialized, so existing entries are never rewritten:
 * these files carry hand-written prose the CWOS YAML subset does not
 * round-trip losslessly. `render(pad)` returns the entry's lines at that indent.
 */
function insertListEntry(raw, key, render) {
  const lines = raw.split('\n');
  const found = scanTopLevel(raw).keys;
  const idx = found.has(key) ? found.get(key) : -1;
  // Remove nothing: trimEnd() ate a block scalar's trailing spaces, and
  // stripping whitespace-only lines ate a last line that belonged to the block.
  if (idx === -1) return `${raw.endsWith('\n') ? raw : `${raw}\n`}${key}:\n${render('  ').join('\n')}\n`;
  const rest = lines[idx].slice(key.length + 1).replace(/\s+#.*$/, '').trim();
  let pad = '  ';
  if (rest === '') {
    const next = lines.slice(idx + 1).find((l) => l.trim() !== '' && !/^\s*#/.test(l));
    const m = next && next.match(/^( *)-(\s|$)/);
    if (m) pad = m[1];
  } else if (!/^\[\s*\]$/.test(rest)) {
    return null;
  }
  return [...lines.slice(0, idx), `${key}:`, ...render(pad), ...lines.slice(idx + 1)].join('\n');
}

/**
 * Prove a rewrite changed only what it meant to, on the text that will be
 * written. Returns null when it holds, else the reason to refuse.
 *
 * `field`/`value`: the one top-level field allowed to change, and what it must
 * read back as. `listKey`: the list that must have grown by exactly one entry
 * at its head, with every older entry unchanged. Everything else -- every
 * other top-level field, column-0 text the reader would drop -- must be as it
 * was, and both texts must read with no warning at all.
 */
function verifyRewrite(beforeRaw, afterRaw, { field = null, value = null, listKey }) {
  // The kit reader accepts both of these; YAML does not. Checked on the final
  // text, so it holds whichever input carried them in: --to, --evidence, or an
  // escape in the superseded text that `was` decodes.
  const at = firstUnprintable(afterRaw);
  if (at !== -1) {
    const line = afterRaw.slice(0, at).split('\n').length;
    const code = afterRaw.charCodeAt(at).toString(16).toUpperCase().padStart(4, '0');
    return `the rewritten file would hold U+${code} at line ${line}, a character YAML does not allow `
      + '(terminal colour codes and lone carriage returns are the usual source); remove it from the new text.';
  }
  if (hasInnerDocumentMarker(beforeRaw)) {
    return 'the item holds a YAML document marker (--- or ...) after its first line, so anything '
      + 'appended would land in a second document; edit the file by hand.';
  }
  const beforeWarn = [];
  const afterWarn = [];
  const before = parseYAML(beforeRaw, beforeWarn) || {};
  const after = parseYAML(afterRaw, afterWarn) || {};
  // A file the reader already misreads (14 of 7,050 fleet items on 2026-10-21,
  // mostly column-0 lists it reads as null) cannot be checked, only guessed at.
  if (beforeWarn.length) {
    const w = beforeWarn[0];
    return `the item already does not read cleanly (${w.reason} at line ${w.line}), so no rewrite of it can be checked; fix that by hand first.`;
  }
  if (afterWarn.length) {
    const w = afterWarn[0];
    return `the rewritten file would not parse cleanly (${w.reason} at line ${w.line}).`;
  }
  const scanBefore = scanTopLevel(beforeRaw);
  const offForm = scanBefore.stray[0] || scanBefore.hidden[0];
  if (offForm !== undefined) {
    return `the item is not in the plain "key: value" form CWOS writes (line ${JSON.stringify(offForm.slice(0, 60))}), `
      + 'so no rewrite of it can be checked; edit the file by hand.';
  }
  const scanAfter = scanTopLevel(afterRaw);
  const newStray = scanAfter.stray[0] || scanAfter.hidden[0];
  if (newStray !== undefined) return `the rewrite would leave text outside any field: ${JSON.stringify(newStray.slice(0, 60))}.`;
  for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (k === field || k === listKey) continue;
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) return `the rewrite would also change "${k}".`;
  }
  if (field && (typeof after[field] !== 'string' || after[field].trim() !== String(value).trim())) {
    return `"${field}" would not read back as the new text.`;
  }
  const old = before[listKey] == null ? [] : before[listKey];
  const now = after[listKey];
  if (!Array.isArray(old)) return `"${listKey}" is not a list, so the history cannot be added to it.`;
  if (!Array.isArray(now) || now.length !== old.length + 1
      || JSON.stringify(now.slice(1)) !== JSON.stringify(old)) {
    return `"${listKey}" would not read back as its old entries plus one new one.`;
  }
  return null;
}

/**
 * WS-1092: the CWOS YAML reader keeps only the first line of a quoted scalar
 * folded over several lines, so `was` would silently lose the rest of the text
 * being superseded. Decode that one shape from the raw lines; null for any other.
 * YAML folding: lines are trimmed and joined by a space, a blank line is a newline.
 */
function foldedQuotedValue(raw, field) {
  const range = fieldBlockRange(raw, field);
  if (!range || range.end === range.start) return null;
  const first = range.lines[range.start].replace(new RegExp(`^${field}:\\s*`), '');
  const q = first[0];
  if (q !== '"' && q !== "'") return null;
  const parts = [first, ...range.lines.slice(range.start + 1, range.end + 1)];
  let text = parts.map((l, i) => (i === 0 ? l.trimEnd() : l.trim())).reduce((acc, l, i) => {
    if (i === 0) return l;
    return l === '' ? `${acc}\n` : (acc.endsWith('\n') ? acc + l : `${acc} ${l}`);
  }, '');
  if (text.length < 2 || text[text.length - 1] !== q) return null;
  text = text.slice(1, -1);
  return q === '"'
    ? text.replace(/\\(["\\\/nt]|u[0-9a-fA-F]{4})/g, (m, c) => (c[0] === 'u' ? String.fromCharCode(parseInt(c.slice(1), 16)) : ({ n: '\n', t: '\t' }[c] || c)))
    : text.replace(/''/g, "'");
}

/**
 * The field's current value, via the reader CWOS commands actually use.
 *
 * readYAMLFile returns {ok, data, warnings} -- NOT the document. The first
 * version of this treated the envelope as the document, so `field in doc` was
 * always false and every correction recorded `was: null`: the title was
 * replaced correctly, the block scalars survived, and the one thing this
 * command exists to preserve was silently thrown away. An unreadable item is a
 * hard failure for the same reason -- a correction that cannot see what it is
 * replacing must not proceed as though it could.
 */
function readFieldValue(qPath, field) {
  const read = readYAMLFile(qPath);
  if (!read || !read.ok || !read.data) {
    fail('correct: item YAML is unreadable, so the superseded text cannot be '
       + 'preserved. Refusing to overwrite it.', { path: qPath, detail: (read && read.error) || null });
  }
  const folded = foldedQuotedValue(fs.readFileSync(qPath, 'utf8'), field);
  if (folded != null) return folded;
  const v = read.data[field];
  if (v == null) return null;
  return typeof v === 'string' ? v : JSON.stringify(v);
}

/**
 * Rewrite `field` and record the superseded text, then prove the result is
 * still the same record -- on the full text that will be written.
 *
 * Returns {ok:true, raw} or {ok:false, reason}. Refuses, rather than writes, when:
 *  - the field is absent (appending would leave the wrong text in whatever
 *    field the item really uses, and report success);
 *  - its value carries an anchor, alias or tag (the CWOS reader cannot see
 *    them, so nothing could check what replacing it breaks);
 *  - its current value is a mapping or list (a prose --to would flatten it);
 *  - `corrections:` has a shape insertListEntry does not know;
 *  - verifyRewrite finds anything else changed. Checking only the field swap
 *    let the history insert duplicate an inline `corrections: []` key and mix
 *    indents into a column-0 list, while reporting yaml_written true.
 */
function buildCorrection(raw, field, value, entry) {
  const range = fieldBlockRange(raw, field);
  if (!range) {
    return { ok: false, reason: `the item has no "${field}" field, so there is nothing to correct. `
      + 'Appending one would leave the wrong text in whichever field the item actually uses.' };
  }
  if (/^[&*!]/.test(range.lines[range.start].slice(field.length + 1).trim())) {
    return { ok: false, reason: `"${field}" carries a YAML anchor, alias or tag, which the kit reader `
      + 'cannot check a rewrite against; edit the file by hand.' };
  }
  const cur = (parseYAML(raw, []) || {})[field];
  if (cur !== null && typeof cur === 'object') {
    return { ok: false, reason: `"${field}" holds a ${Array.isArray(cur) ? 'list' : 'mapping'}, not text. `
      + 'Replacing it with a prose value would destroy its structure; edit the file by hand.' };
  }
  const next = insertCorrection(patchField(raw, field, value), entry);
  if (next == null) {
    return { ok: false, reason: '"corrections" is not a list this command can add to; edit the file by hand.' };
  }
  const why = verifyRewrite(raw, next, { field, value, listKey: 'corrections' });
  return why ? { ok: false, reason: why } : { ok: true, raw: next };
}

/** Block scalar when the value spans lines, quoted scalar when it does not. */
function renderField(field, value) {
  if (!String(value).includes('\n')) {
    return `${field}: "${escapeYamlString(String(value))}"`;
  }
  return blockScalarLines(field, String(value).replace(/\s+$/, '')).join('\n');
}

function patchField(raw, field, value) {
  const range = fieldBlockRange(raw, field);
  const rendered = renderField(field, value);
  if (!range) return `${raw.trimEnd()}\n${rendered}\n`;
  const { lines, start, end } = range;
  return [...lines.slice(0, start), ...rendered.split('\n'), ...lines.slice(end + 1)].join('\n');
}

/**
 * Record the superseded text in the item file, newest first, under
 * `corrections:`. Null when that list has a shape insertListEntry refuses.
 */
function insertCorrection(raw, entry) {
  return insertListEntry(raw, 'corrections', (pad) => [
    `${pad}- at: "${entry.at}"`,
    `${pad}  field: ${entry.field}`,
    `${pad}  reason: "${escapeYamlString(entry.reason)}"`,
    entry.event ? `${pad}  event: "${entry.event}"` : null,
    // The body sits 4 spaces inside its key; the header says so when the old
    // text's first line is itself indented (see blockScalarHeader).
    ...(entry.was == null
      ? [`${pad}  was: null`]
      : blockScalarLines('was', String(entry.was).replace(/\s+$/, ''), { indent: pad.length + 2, bodyIndent: 4 })),
  ].filter((l) => l != null));
}

function patchStatus(raw, status) {
  if (/^status:\s*.*$/m.test(raw)) {
    return raw.replace(/^status:\s*.*$/m, `status: ${status}`);
  }
  return `status: ${status}\n` + raw;
}

/**
 * Record an inspection, newest first, under `inspections:` (WS-941 gap 3).
 * Same insert-don't-reserialize shape as insertCorrection: a FAIL stays in the
 * file when a later PASS lands, because an item that failed inspection once is
 * evidence about the work, and overwriting it is tidying.
 */
function insertInspection(raw, entry) {
  return insertListEntry(raw, 'inspections', (pad) => [
    `${pad}- at: "${entry.at}"`,
    `${pad}  verdict: ${entry.verdict}`,
    `${pad}  inspector: "${escapeYamlString(entry.inspector)}"`,
    entry.diff ? `${pad}  diff: "${escapeYamlString(entry.diff)}"` : null,
    entry.event ? `${pad}  event: "${entry.event}"` : null,
    // An inspector's evidence is free text. Its first line being indented must
    // not let a later line such as `verdict: pass` be read as this entry's field.
    ...blockScalarLines('evidence', String(entry.evidence || '').replace(/\s+$/, ''), { indent: pad.length + 2, bodyIndent: 4 }),
  ].filter((l) => l != null));
}

/**
 * Record an inspection and prove only the history grew. {ok, raw} or {ok:false, reason}.
 */
function buildInspection(raw, entry) {
  const next = insertInspection(raw, entry);
  if (next == null) {
    return { ok: false, reason: '"inspections" is not a list this command can add to; edit the file by hand.' };
  }
  const why = verifyRewrite(raw, next, { listKey: 'inspections' });
  return why ? { ok: false, reason: why } : { ok: true, raw: next };
}

function runInspect(args) {
  assertKnownFlags('inspect', args.slice(1));
  const id = args[0];
  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail('inspect: first argument must be a work item id (e.g. WS-941)', { got: id || null });
  }
  const verdict = String(readFlag(args, 'verdict') || '').trim().toLowerCase();
  if (!inspectionGate.VERDICTS.has(verdict)) fail('inspect: --verdict must be pass or fail', { got: verdict || null });
  const inspector = String(readFlag(args, 'inspector') || '').trim();
  if (!inspector) {
    fail('inspect: --inspector is required — name the agent (or person) who inspected, not the session that built it');
  }
  let evidence = readFlag(args, 'evidence');
  if (evidence === '-') { try { evidence = fs.readFileSync(0, 'utf8'); } catch { evidence = ''; } }
  evidence = String(evidence || '').trim();
  if (evidence.length < inspectionGate.MIN_INSPECTION_EVIDENCE) {
    fail(`inspect: --evidence must be at least ${inspectionGate.MIN_INSPECTION_EVIDENCE} chars — one line per ` +
      'accept criterion, each with the pointer it was checked against (--evidence - reads stdin)',
      { got_chars: evidence.length });
  }
  const diff = readFlag(args, 'diff');
  // WS-1239: what the convergent-gate redesign measures itself against. The
  // kind of break and the contract are named by whoever ran the inspection;
  // round and tier are read from the record so nobody can type them.
  const breakClass = readFlag(args, 'class');
  if (breakClass !== null && !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(String(breakClass))) {
    fail('inspect: --class must be a slug such as yaml/quoted-continuation (lowercase, digits, - and /)', { got: breakClass });
  }
  const contractRef = readFlag(args, 'contract-ref');
  if (contractRef !== null && (!String(contractRef).trim() || String(contractRef).length > 200 || firstUnprintable(String(contractRef)) !== -1)) {
    fail('inspect: --contract-ref must be a path or id of at most 200 printable characters', { got: contractRef });
  }
  const tokensRaw = readFlag(args, 'tokens');
  if (tokensRaw !== null && !/^\d+$/.test(String(tokensRaw))) {
    fail("inspect: --tokens must be a whole number: the inspector's total tokens, as its run reported them", { got: tokensRaw });
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail(`inspect: no .claude/workstream directory found from ${process.cwd()}`);
  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`inspect: no such item: ${id}`, { looked_in: qPath });
  const before = readYAMLFile(qPath);
  const record = before && before.ok && before.data ? before.data : {};
  const round = (Array.isArray(record.inspections) ? record.inspections.length : 0) + 1;
  const tier = record.severity ? String(record.severity) : (record.inspection === 'required' ? 'required' : null);

  const at = new Date().toISOString();
  // WS-1092: a refused inspection must leave neither a damaged file nor an event.
  const probe = buildInspection(fs.readFileSync(qPath, 'utf8'),
    { at, verdict, inspector, diff, evidence, event: 'ev-0-probe' });
  if (!probe.ok) fail(`inspect: refusing to record on ${id}: ${probe.reason}`, { id });

  let eventId = null;
  const { appendEvent, ensureCommandId } = loadEventDeps();
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_inspected',
        payload: {
          type: 'item_inspected', ws_id: id, verdict, inspector,
          diff: diff || null, evidence_chars: evidence.length,
          gate_version: 1, round, tier,
          class: breakClass, contract_ref: contractRef,
          tokens: tokensRaw === null ? null : Number(tokensRaw),
        },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-inspect'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  withFileLock(qPath + '.lock', () => {
    const built = buildInspection(fs.readFileSync(qPath, 'utf8'), { at, verdict, inspector, diff, evidence, event: eventId });
    if (!built.ok) fail(`inspect: refusing to record on ${id}: ${built.reason}`, { id, event_id: eventId });
    writeFileAtomic(qPath, built.raw);
  }, { ownerLabel: 'item:inspect', maxWaitMs: 5000 });

  const after = readYAMLFile(qPath);
  const gate = inspectionGate.gateItem(after && after.ok ? after.data : null);
  writeJson({
    ok: true, id, verb: 'inspect', verdict, inspector, at, event_id: eventId, round,
    closable: gate.ok, gate_reason: gate.reason,
    next: gate.ok ? 'the item may close' : `not closable yet: ${gate.reason}`,
  });
}

/**
 * The inspection gate for a closure path (WS-941 gap 3). Returns null when the
 * item may close on its record, a waiver descriptor when --skip-inspection was
 * given and logged, and exits via fail() otherwise.
 */
function enforceInspection(id, data, args, closurePath) {
  const gate = inspectionGate.gateItem(data);
  if (gate.ok) return null;
  const waiver = readFlag(args, 'skip-inspection');
  if (waiver == null) {
    fail(`done: ${id} needs an independent inspection before it closes (${gate.reason}). ` +
      inspectionGate.refusalHint([id]), { inspection_required: true, reason: gate.reason });
  }
  const rationale = String(waiver).trim();
  if (rationale.length < inspectionGate.MIN_WAIVER_RATIONALE) {
    fail(`done: --skip-inspection rationale must be at least ${inspectionGate.MIN_WAIVER_RATIONALE} chars`);
  }
  const { appendEvent, ensureCommandId } = loadEventDeps();
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'inspection_waived',
        payload: { type: 'inspection_waived', ws_id: id, rationale, reason: gate.reason, closure_path: closurePath },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('inspection-waived'); } catch { /* non-fatal */ }
      }
      appendEvent(evtArgs);
    } catch { /* non-fatal */ }
  }
  return { waived: true, rationale };
}

function runTransition(verb, args) {
  assertKnownFlags(verb, args.slice(1));
  const spec = TRANSITIONS[verb];
  const id = args[0];

  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail(`${verb}: first argument must be a work item id (e.g. WS-375)`, { got: id || null });
  }

  const reason = readFlag(args, 'reason');
  if (!reason || reason.trim().length < MIN_REASON_LEN) {
    fail(
      `${verb}: --reason is required and must be at least ${MIN_REASON_LEN} characters. ` +
      `An item leaving the backlog without a recorded rationale cannot be audited later.`,
      { got_length: reason ? reason.trim().length : 0 }
    );
  }

  const until = readFlag(args, 'until');
  if (spec.requiresUntil && (!until || until.trim().length < MIN_REASON_LEN)) {
    fail(
      `defer: --until is required and must be at least ${MIN_REASON_LEN} characters. ` +
      `A deferral with no resume condition is a silent dismissal — state what brings this back.`,
      { got_length: until ? until.trim().length : 0 }
    );
  }

  const supersededBy = readFlag(args, 'superseded-by');
  if (supersededBy && !/^WS-[A-Za-z0-9-]+$/.test(supersededBy)) {
    fail(`${verb}: --superseded-by must be a work item id`, { got: supersededBy });
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail(`${verb}: no .claude/workstream directory found from ${process.cwd()}`);

  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`${verb}: no such item: ${id}`, { looked_in: qPath });

  const read = readYAMLFile(qPath);
  if (!read.ok || !read.data) fail(`${verb}: item YAML unreadable: ${id}`, { detail: read.error || null });

  const priorStatus = String(read.data.status || 'backlog');
  const targetStatus = readFlag(args, 'to') || spec.status;

  if (priorStatus === targetStatus) {
    writeJson({ ok: true, noop: true, id, status: priorStatus, note: 'already in target state' });
    return;
  }
  if (priorStatus === 'done') {
    fail(
      `${verb}: ${id} is done — completed work is not re-openable through this CLI. ` +
      `File a follow-up item instead so the completion record stays intact.`,
      { prior_status: priorStatus }
    );
  }
  if (!spec.from.includes(priorStatus)) {
    fail(`${verb}: illegal transition ${priorStatus} -> ${targetStatus} for ${id}`, {
      prior_status: priorStatus,
      allowed_from: spec.from,
    });
  }
  // Cross-check: superseding item must exist, or the pointer rots on write.
  if (supersededBy) {
    const supPath = queuePathFor(wsDir, supersededBy);
    if (!fs.existsSync(supPath)) {
      fail(`${verb}: --superseded-by ${supersededBy} does not exist`, { looked_in: supPath });
    }
    if (supersededBy === id) fail(`${verb}: an item cannot supersede itself`);
  }

  const stamp = todayISO();
  const { appendEvent, ensureCommandId } = loadEventDeps();

  // Event first — the commit point. Non-fatal if the runtime is absent
  // (fleet repos without core/), per AS-23.
  let eventId = null;
  if (appendEvent) {
    try {
      const payload = {
        type: 'item_transitioned',
        ws_id: id,
        verb,
        from_status: priorStatus,
        to_status: targetStatus,
        reason: reason.trim(),
        at: stamp,
      };
      if (until) payload.resume_condition = until.trim();
      if (supersededBy) payload.superseded_by = supersededBy;
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_transitioned',
        payload,
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-transition'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  // Releasing is exactly the act of dropping ownership. Leaving a stale claimed_by
  // behind would recreate the state this verb exists to exit. The lease machinery
  // runs first so a live holder is recorded as released_by and its lease sidecar
  // forgets the item (WS-1073); it is a no-op for an ownerless item.
  let claimReleased = null;
  if (verb === 'release') {
    claimReleased = true;
    try { require('./lib/cwos-claims').releaseItems(wsDir, [id]); } catch { claimReleased = false; }
  }

  try {
    withFileLock(qPath + '.lock', () => {
      let raw = fs.readFileSync(qPath, 'utf8');
      raw = patchStatus(raw, targetStatus);
      if (verb === 'release') {
        // A real null, as releaseItems writes it — not patchScalar's quoted "".
        raw = raw.replace(/^claimed_by:.*$/m, 'claimed_by: null').replace(/^claimed_at:.*$/m, 'claimed_at: null');
      }
      raw = patchScalar(raw, spec.stampField, stamp);
      raw = patchScalar(raw, spec.reasonField, reason.trim());
      if (until) raw = patchScalar(raw, 'resume_condition', until.trim());
      if (supersededBy) raw = patchScalar(raw, 'superseded_by', supersededBy);
      if (eventId) raw = patchScalar(raw, 'transitioned_by_event', eventId);
      writeFileAtomic(qPath, raw);
    }, { ownerLabel: `item:${verb}`, maxWaitMs: 5000 });
  } catch (e) {
    // Event is already logged; reconcile reconciles. Report but do not fail
    // the caller — matches runDone's degradation contract.
    writeJson({
      ok: true, id, verb, from_status: priorStatus, to_status: targetStatus,
      event_id: eventId, yaml_written: false, warning: `YAML write failed: ${e.message}`,
      next: 'run node kit/scripts/cwos-reconcile.js to re-derive indexes',
    });
    return;
  }

  writeJson({
    ok: true,
    id,
    verb,
    from_status: priorStatus,
    to_status: targetStatus,
    reason: reason.trim(),
    resume_condition: until ? until.trim() : null,
    superseded_by: supersededBy || null,
    ...(verb === 'release' ? { claim_released: claimReleased } : {}),
    event_id: eventId,
    yaml_written: true,
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index + program caps',
  });
}

function runShow(args) {
  assertKnownFlags('show', args.slice(1));
  const id = args[0];
  if (!id) fail('show: first argument must be a work item id');
  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail('show: no .claude/workstream directory found');
  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`show: no such item: ${id}`);
  const read = readYAMLFile(qPath);
  if (!read.ok) fail(`show: unreadable: ${id}`, { detail: read.error || null });
  const d = read.data || {};
  writeJson({
    ok: true,
    id: d.id || id,
    title: d.title || '',
    status: d.status || 'backlog',
    program: d.program || null,
    priority_score: d.priority_score ?? null,
    effort: d.effort || null,
    blocked_by: d.blocked_by || null,
    resume_condition: d.resume_condition || d.deferred_until_condition || null,
    superseded_by: d.superseded_by || null,
  });
}

/**
 * `cwos-item tag WS-NNN --customer-impact "RepoA,RepoB"`
 *
 * WS-695. The context-boost mechanism in cwos-next scores on `customer_impact`,
 * and until now no command could write that field on an EXISTING item — only
 * `add` could set it, at creation. The routing table forbids hand-editing queue
 * YAMLs (and WS-570 already logs that contradiction), so a founder-set customer
 * priority would have had exactly one authoring route: the one the rules ban.
 *
 * Pass an empty value to clear the tag. Names are registry-validated exactly as
 * in `add`, for the same reason: an unmatched name is a silent no-boost.
 */
function runTag(args) {
  assertKnownFlags('tag', args.slice(1));
  const id = args[0];
  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail('tag: first argument must be a work item id (e.g. WS-695)', { got: id || null });
  }
  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail('tag: no .claude/workstream directory found');
  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`tag: no such item: ${id}`);

  const rawFlag = readFlag(args, 'customer-impact');
  if (rawFlag == null) {
    fail('tag: --customer-impact is required (pass "" to clear the tag)');
  }
  const names = parseCustomerImpact(rawFlag, 'tag');

  let wrote = null;
  withFileLock(qPath + '.lock', () => {
    const raw = fs.readFileSync(qPath, 'utf8');
    const line = names.length ? `customer_impact: ${JSON.stringify(names)}` : null;
    const re = /^customer_impact:\s*.*$/m;
    let next;
    if (re.test(raw)) {
      next = line ? raw.replace(re, line) : raw.replace(re, '').replace(/\n{3,}/g, '\n\n');
    } else {
      next = line ? raw.trimEnd() + `\n${line}\n` : raw;
    }
    writeFileAtomic(qPath, next);
    wrote = qPath;
  }, { ownerLabel: 'item:tag', maxWaitMs: 5000 });

  writeJson({
    ok: true,
    id,
    verb: 'tag',
    customer_impact: names,
    path: wrote,
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index',
  });
}

function runCorrect(args) {
  assertKnownFlags('correct', args.slice(1));
  const id = args[0];
  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail('correct: first argument must be a work item id (e.g. WS-457)', { got: id || null });
  }

  const field = readFlag(args, 'field');
  if (!field) {
    fail('correct: --field is required', { correctable: CORRECTABLE_FIELDS });
  }
  if (!CORRECTABLE_FIELDS.includes(field)) {
    fail(
      `correct: ${field} is not a correctable field`,
      {
        correctable: CORRECTABLE_FIELDS,
        why: 'status, priority_score, program and the transition stamps are STATE. '
           + 'They have their own verbs (defer/dismiss/restore/done) or are re-derived '
           + 'by reconcile. Changing one here would launder a state change as a correction.',
      },
    );
  }

  const reason = readFlag(args, 'reason');
  if (!reason || reason.trim().length < MIN_REASON_LEN) {
    fail(
      `correct: --reason is required and must be at least ${MIN_REASON_LEN} characters`,
      {
        got: reason ? reason.trim().length : 0,
        why: 'say what was wrong and how it is known to be wrong. A correction with no '
           + 'rationale is indistinguishable from someone quietly changing the story.',
      },
    );
  }

  let to = readFlag(args, 'to');
  if (to == null) {
    fail('correct: --to is required (use --to - to read the new value from stdin)');
  }
  if (to === '-') {
    try {
      to = fs.readFileSync(0, 'utf8');
    } catch (e) {
      fail(`correct: could not read the new value from stdin: ${e.message}`);
    }
  }
  // Windows stdin arrives CRLF; the block writer stores LF, so an unnormalised
  // value never read back as itself and every multi-line correction was refused.
  to = String(to).replace(/\r\n/g, '\n');
  if (!String(to).trim()) {
    fail('correct: the new value is empty. To remove a claim rather than replace it, '
       + 'say so explicitly in the new text -- a blank field reads as "never asserted".');
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail('correct: no .claude/workstream directory found');
  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`correct: no such item: ${id}`, { looked_in: qPath });

  const was = readFieldValue(qPath, field);
  if (was != null && was.trim() === String(to).trim()) {
    fail(
      `correct: ${field} already reads exactly that`,
      { why: 'a no-op correction records a rationale for a change that did not happen, '
           + 'which is worse than no record at all.' },
    );
  }

  // WS-1092: prove the rewrite is safe BEFORE the event is appended -- a refused
  // correction must leave neither a damaged file nor an event claiming it happened.
  // The probe carries a placeholder event id of the real one's shape.
  const stamp = todayISO();
  const entry = { at: stamp, field, reason: reason.trim(), event: 'ev-0-probe', was };
  const probe = buildCorrection(fs.readFileSync(qPath, 'utf8'), field, String(to).trim(), entry);
  if (!probe.ok) {
    fail(`correct: refusing to rewrite ${field} on ${id}: ${probe.reason}`, { field, id });
  }

  const { appendEvent, ensureCommandId } = loadEventDeps();

  // Event first — the commit point, per design commitment 4.
  let eventId = null;
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_corrected',
        payload: {
          type: 'item_corrected',
          ws_id: id,
          field,
          was,
          now: String(to).trim(),
          reason: reason.trim(),
          at: stamp,
        },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-correct'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  try {
    withFileLock(qPath + '.lock', () => {
      const safe = buildCorrection(fs.readFileSync(qPath, 'utf8'), field, String(to).trim(),
        { ...entry, event: eventId });
      if (!safe.ok) throw new Error(safe.reason);
      writeFileAtomic(qPath, safe.raw);
    }, { ownerLabel: 'item:correct', maxWaitMs: 5000 });
  } catch (e) {
    // Only reachable when the file changed between the probe and the lock. The
    // event is already in the log, so say so rather than report success.
    fail(`correct: the item changed while this ran and the rewrite was refused (${e.message}); `
       + 'the file is untouched but the item_corrected event was already logged. Re-run correct.',
    { id, field, event_id: eventId, yaml_written: false });
  }

  writeJson({
    ok: true,
    id,
    verb: 'correct',
    field,
    was,
    now: String(to).trim(),
    reason: reason.trim(),
    event_id: eventId,
    yaml_written: true,
    next: field === 'title'
      ? 'run node kit/scripts/cwos-reconcile.js — queue-index carries the title and still shows the old one'
      : 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index',
  });
}

// ─── scope ──────────────────────────────────────────────────────────────────
//
// `cwos-item scope WS-NNN --files "a,b" --reason "<why>" [--new "x"] [--replace]`
//
// The autonomous gate fails closed on an item with no `files_involved`, and until
// this verb nothing could add that field to an EXISTING item: `add` sets it only
// at creation, `correct` refuses list fields and absent fields. That left the
// unattended pool near zero while most of the backlog sat one field short.
//
// Scope is a claim about where the work lands, so it is validated the way the
// gate will read it. isPathShaped below mirrors the one in
// cwos-autonomous-gate.js (that script runs main() on require, so it cannot be
// imported); the test extracts the gate's function and checks the two agree.

/** Same rule as the gate's isPathShaped: slash or extension, no spaces, no "Label: ". */
function isPathShaped(entry) {
  if (typeof entry !== 'string') return false;
  const s = entry.trim();
  if (!s || s.length > 260) return false;
  if (/:\s/.test(s)) return false;
  if (/\s/.test(s)) return false;
  return s.includes('/') || s.includes('\\') || /\.[A-Za-z0-9]{1,10}$/.test(s);
}

function splitList(v) {
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
}

/** Line range of a top-level `files_involved` (flow or block list), or null. */
function filesInvolvedRange(raw) {
  const lines = raw.split('\n');
  const start = lines.findIndex((l) => /^files_involved:(\s|$)/.test(l));
  if (start === -1) return null;
  let end = start;
  if (/^files_involved:\s*$/.test(lines[start])) {
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^\s+\S/.test(lines[i]) || /^-\s/.test(lines[i])) end = i; else break;
    }
  }
  return { start, end, lines };
}

function runScope(args) {
  assertKnownFlags('scope', args.slice(1));
  const id = args[0];
  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail('scope: first argument must be a work item id (e.g. WS-123)', { got: id || null });
  }
  const filesFlag = readFlag(args, 'files');
  if (filesFlag == null) fail('scope: --files "a,b,c" is required');
  const files = splitList(filesFlag);
  if (files.length === 0) fail('scope: --files is empty');
  const reason = readFlag(args, 'reason');
  if (!reason || reason.trim().length < MIN_REASON_LEN) {
    fail(`scope: --reason is required and must be at least ${MIN_REASON_LEN} characters`, {
      got: reason ? reason.trim().length : 0,
      why: 'say why this is the scope. A scope with no rationale is a guess the gate will treat as a fact.',
    });
  }
  const newFlag = readFlag(args, 'new');
  const created = newFlag == null ? [] : splitList(newFlag);
  const replace = args.includes('--replace');

  const notShaped = [...files, ...created].filter((p) => !isPathShaped(p));
  if (notShaped.length) {
    fail('scope: entries must be path-shaped (a slash or an extension, no spaces, no "Label: " prefix)', { bad: notShaped });
  }
  const strayNew = created.filter((p) => !files.includes(p));
  if (strayNew.length) {
    fail('scope: every --new path must also appear in --files', { bad: strayNew });
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail('scope: no .claude/workstream directory found');
  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`scope: no such item: ${id}`, { looked_in: qPath });

  const root = findRepoRoot(process.cwd());
  const missing = [];
  const outside = [];
  for (const p of files) {
    if (created.includes(p)) continue;
    const abs = path.resolve(root, p);
    const rel = path.relative(root, abs);
    if (path.isAbsolute(p) || rel.startsWith('..') || path.isAbsolute(rel)) { outside.push(p); continue; }
    if (!fs.existsSync(abs)) missing.push(p);
  }
  if (outside.length) fail('scope: paths must be relative and inside the repo', { bad: outside, repo_root: root });
  if (missing.length) {
    fail('scope: path does not exist under the repo root. If the item will create it, list it in --new.', { missing, repo_root: root });
  }

  const read = readYAMLFile(qPath);
  if (!read || !read.ok || !read.data) {
    fail('scope: item YAML is unreadable; refusing to edit it', { path: qPath });
  }
  const status = String(read.data.status || '');
  if (status === 'done' || status === 'dismissed') {
    fail(`scope: ${id} is ${status}; scope on a closed item is meaningless`, { status });
  }
  const was = Array.isArray(read.data.files_involved) ? read.data.files_involved.map(String) : [];
  if (was.length > 0 && !replace) {
    fail(`scope: ${id} already has files_involved; pass --replace to overwrite`, { current: was });
  }

  const stamp = todayISO();
  const line = `files_involved: ${JSON.stringify(files)}`;
  const { appendEvent, ensureCommandId } = loadEventDeps();
  let eventId = null;
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_scoped',
        payload: {
          type: 'item_scoped', id, ws_id: id, files, new_files: created,
          was, reason: reason.trim(), at: stamp,
        },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-scope'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  try {
    withFileLock(qPath + '.lock', () => {
      const raw = fs.readFileSync(qPath, 'utf8');
      const range = filesInvolvedRange(raw);
      let next;
      if (range) {
        range.lines.splice(range.start, range.end - range.start + 1, line);
        next = range.lines.join('\n');
      } else {
        next = raw.trimEnd() + `\n${line}\n`;
      }
      writeFileAtomic(qPath, next);
    }, { ownerLabel: 'item:scope', maxWaitMs: 5000 });
  } catch (e) {
    writeJson({
      ok: true, id, verb: 'scope', files, event_id: eventId, yaml_written: false,
      warning: `YAML write failed: ${e.message}`,
      next: 'run node kit/scripts/cwos-reconcile.js to re-derive indexes',
    });
    return;
  }

  writeJson({
    ok: true, id, verb: 'scope', files, new_files: created, was,
    reason: reason.trim(), event_id: eventId, yaml_written: true, path: qPath,
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index',
  });
}

// ─── add ────────────────────────────────────────────────────────────────────
//
// WS-665. There was no command to CREATE a work item. `/workstream create` was
// prose in a command doc with no script behind it, and the only code paths that
// wrote a WS-*.yaml were auto-promoters (findings, friction sweeps, migrations)
// — none of them reachable by a session that simply wants to record work.
// Measured in AI-Personal on 2026-08-17: WS-175 through WS-179 were hand-written
// as raw YAML, which skips id allocation, skips the event log, and skips every
// field the ranker reads.
//
// Two validations earn their place here because both failure modes are silent:
//
//  * `--program` is resolved against programs/ and normalized to the BARE id.
//    Program YAMLs carry `id: security`, not `id: prog-security`, and both
//    cwos-next's cap lookup and the reconciler key on that bare form. 15 of 326
//    queue items in HomeBase carry `program: prog-<x>` — those items are
//    invisible to their own program's cap, forever, with nothing reporting it.
//  * `--dedup-key` is checked against the existing queue. A duplicate that
//    lands anyway consumes a capped program slot that no sprint can ever use.

const VALID_EFFORTS = ['S', 'M', 'L', 'XL'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const MIN_TITLE_LEN = 10;
const MIN_WHY_LEN = 20;

/** Program ids are bare on disk (`id: kit-quality`); accept either form in. */
function normalizeProgramId(p) {
  return String(p).trim().replace(/^prog-/, '').replace(/\.yaml$/, '');
}

function listQueueFiles(wsDir) {
  const dir = path.join(wsDir, 'queue');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /^WS-[A-Za-z0-9-]+\.yaml$/.test(f))
    .map((f) => path.join(dir, f));
}

/** An existing item under the same dedup_key means this one is already filed. */
function findByDedupKey(wsDir, key) {
  for (const p of listQueueFiles(wsDir)) {
    const r = readYAMLFile(p);
    if (!r.ok || !r.data) continue;
    if (String(r.data.dedup_key || '') === key) return r.data.id || path.basename(p, '.yaml');
  }
  return null;
}

function renderNewItem(fields) {
  const lines = [];
  const push = (k, v) => lines.push(`${k}: ${formatScalar(v)}`);
  // id / title / created_at are always quoted rather than left to formatScalar's
  // needs-quoting test. Every hand-written and auto-promoted item in the corpus
  // quotes them, and an unquoted `created_at: 2026-08-19` is a date scalar to
  // any parser stricter than ours.
  const quoted = (k, v) => lines.push(`${k}: "${escapeYamlString(String(v))}"`);
  quoted('id', fields.id);
  quoted('title', fields.title);
  lines.push(`status: ${fields.status}`);
  lines.push('claimed_by: null');
  lines.push('claimed_at: null');
  push('type', fields.type);
  push('category', fields.category);
  push('capability', fields.capability);
  push('program', fields.program);
  lines.push(`priority_score: ${fields.priority_score}`);
  push('effort', fields.effort);
  push('severity', fields.severity);
  // WS-695: flow-sequence style, matching blocked_by — the shared YAML reader
  // parses `[ ]` sequences but returns `{ }` flow MAPPINGS as raw strings, so
  // a list is the safe shape here.
  if (Array.isArray(fields.customer_impact) && fields.customer_impact.length) {
    lines.push(`customer_impact: ${JSON.stringify(fields.customer_impact)}`);
  }
  quoted('created_at', fields.created_at);
  if (fields.dedup_key) push('dedup_key', fields.dedup_key);
  lines.push('source:');
  lines.push('  type: manual');
  lines.push('  created_by: cwos-item add');
  if (fields.session) lines.push(`  session: ${formatScalar(fields.session)}`);
  // A multi-line rationale is a block scalar, as description and accept_criteria are:
  // a scalar slot would join its lines with spaces and lose the structure the author
  // wrote (claude-poker-tracker INV-006 repair, 2026-09-23). The block header guards the
  // first-line-indented case (WS-942), so no body line can be read as a field.
  if (String(fields.why).includes('\n')) {
    const why = String(fields.why).replace(/\s+$/, '');
    lines.push(...blockScalarLines('rationale', why, { indent: 2 }));
  } else {
    lines.push(`  rationale: ${formatScalar(fields.why)}`);
  }
  lines.push(`blocked_by: ${fields.blocked_by.length ? JSON.stringify(fields.blocked_by) : '[]'}`);
  lines.push('enables: []');
  if (fields.description) {
    // The header says where the body starts when its first line is indented;
    // without it, the rest of a pasted body is read as fields of the item.
    lines.push(...blockScalarLines('description', fields.description));
  }
  // Criteria that span lines go in a block scalar. A scalar slot holds one
  // line, and formatScalar would join them with spaces.
  if (fields.accept_criteria) {
    if (String(fields.accept_criteria).includes('\n')) lines.push(renderField('accept_criteria', fields.accept_criteria));
    else push('accept_criteria', fields.accept_criteria);
  }
  // WS-789: risk-schema fields, emitted only when declared — an explicit
  // `external_acts: []` (via --external-acts none) is a recorded answer, while
  // an absent field is an unasked question the gate's other checks still fail
  // closed on. files_involved uses flow-sequence style, same reasoning as
  // blocked_by above.
  if (Array.isArray(fields.external_acts)) {
    lines.push(`external_acts: ${fields.external_acts.length ? JSON.stringify(fields.external_acts) : '[]'}`);
  }
  if (fields.facts_needed) lines.push(`facts_needed: ${fields.facts_needed}`);
  if (fields.verify) lines.push(`verify: ${fields.verify}`);
  if (Array.isArray(fields.files_involved) && fields.files_involved.length) {
    lines.push(`files_involved: ${JSON.stringify(fields.files_involved)}`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Parse `--customer-impact "RepoA,RepoB"` into a validated list of repo names.
 *
 * WS-695. This field is what `system/context.md` boost specs match on, so a
 * typo here does not error at write time — it produces an item that silently
 * never gets boosted, which is indistinguishable from an item nobody
 * prioritised. That is precisely the failure this whole change set exists to
 * delete, so the name is checked against the fleet registry and a miss is
 * refused with the valid names listed.
 *
 * In an adopted repo there is no fleet/registry.yaml — validation degrades to a
 * pass with a one-line notice rather than blocking work in repos that legitimately
 * cannot resolve fleet names.
 */
function parseCustomerImpact(raw, verb) {
  if (raw == null || String(raw).trim() === '') return [];
  const names = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
  if (!names.length) return [];

  const registryPath = path.join(findRepoRoot(process.cwd()) || process.cwd(), 'fleet', 'registry.yaml');
  if (!fs.existsSync(registryPath)) {
    process.stderr.write(
      `[cwos-item] note: fleet/registry.yaml not found — --customer-impact accepted unvalidated (${names.join(', ')})\n`
    );
    return names;
  }

  const txt = fs.readFileSync(registryPath, 'utf8');
  const known = new Set();
  const re = /^\s*-\s*name:\s*["']?([^"'\n]+?)["']?\s*$/gm;
  let m;
  while ((m = re.exec(txt)) !== null) known.add(m[1].trim());

  const unknown = names.filter((n) => !known.has(n));
  if (unknown.length) {
    fail(
      `${verb}: --customer-impact names no repo in the fleet registry: ${unknown.join(', ')}. ` +
      'A name that matches nothing produces an item no boost can ever lift.',
      { unknown, known: Array.from(known).sort() }
    );
  }
  return names;
}

function runAdd(args) {
  assertKnownFlags('add', args[0] && !args[0].startsWith('--') ? args.slice(1) : args);
  // Title is positional so the common case reads like a sentence, but --title
  // is accepted too — a title starting with a dash is otherwise unexpressible.
  let title = readFlag(args, 'title');
  if (!title && args[0] && !args[0].startsWith('--')) title = args[0];
  if (!title || title.trim().length < MIN_TITLE_LEN) {
    fail(
      `add: a title is required and must be at least ${MIN_TITLE_LEN} characters. ` +
      'Pass it as the first argument or via --title.',
      { got_length: title ? title.trim().length : 0 }
    );
  }
  title = title.trim();

  const why = readFlag(args, 'why');
  if (!why || why.trim().length < MIN_WHY_LEN) {
    fail(
      `add: --why is required and must be at least ${MIN_WHY_LEN} characters. ` +
      'An item entering the backlog without a recorded reason cannot be ranked ' +
      'against anything, and the next session cannot tell real work from a stray note.',
      { got_length: why ? why.trim().length : 0 }
    );
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail(`add: no .claude/workstream directory found from ${process.cwd()}`);

  const programRaw = readFlag(args, 'program');
  if (!programRaw) {
    fail('add: --program <id> is required — an unprogrammed item is invisible to program caps and health.');
  }
  const program = normalizeProgramId(programRaw);
  const programsDir = path.join(wsDir, 'programs');
  const progPath = path.join(programsDir, `prog-${program}.yaml`);
  if (!fs.existsSync(progPath)) {
    const available = fs.existsSync(programsDir)
      ? fs.readdirSync(programsDir)
        .filter((f) => /^prog-.+\.yaml$/.test(f) && f !== 'prog-template.yaml')
        .map((f) => f.replace(/^prog-/, '').replace(/\.yaml$/, ''))
      : [];
    fail(`add: no such program: ${program}`, { looked_in: progPath, available });
  }

  const effort = (readFlag(args, 'effort') || 'M').toUpperCase();
  if (!VALID_EFFORTS.includes(effort)) {
    fail(`add: --effort must be one of ${VALID_EFFORTS.join('|')}`, { got: effort });
  }
  const severity = (readFlag(args, 'severity') || 'medium').toLowerCase();
  if (!VALID_SEVERITIES.includes(severity)) {
    fail(`add: --severity must be one of ${VALID_SEVERITIES.join('|')}`, { got: severity });
  }

  const priorityRaw = readFlag(args, 'priority');
  const priority = priorityRaw == null ? 50 : Number(priorityRaw);
  if (!Number.isFinite(priority) || priority < 0 || priority > 100) {
    fail('add: --priority must be a number between 0 and 100', { got: priorityRaw });
  }

  const customerImpact = parseCustomerImpact(readFlag(args, 'customer-impact'), 'add');

  const dedupKey = readFlag(args, 'dedup-key');
  if (dedupKey) {
    const existing = findByDedupKey(wsDir, dedupKey.trim());
    if (existing) {
      fail(
        `add: dedup_key "${dedupKey.trim()}" is already held by ${existing}. ` +
        'A duplicate consumes a capped program slot no sprint can draw from — ' +
        'amend that item instead.',
        { existing_item: existing }
      );
    }
  }

  const blockedBy = (readFlag(args, 'blocked-by') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  for (const dep of blockedBy) {
    if (!/^WS-[A-Za-z0-9-]+$/.test(dep)) fail(`add: --blocked-by entry is not a work item id: ${dep}`);
    if (!fs.existsSync(queuePathFor(wsDir, dep))) {
      fail(`add: --blocked-by ${dep} does not exist — a gate on a phantom item never opens`, { dep });
    }
  }

  let session = readFlag(args, 'session');
  if (!session) {
    try { session = require('./lib/cwos-claims').resolveSessionId(wsDir) || null; } catch { session = null; }
  }

  // WS-789: risk-schema fields (2026-09-01 founder-approved eligibility
  // schema). Declared at intake because that is when the author still holds
  // the answers; the autonomous gate fails closed on their ABSENCE only via
  // the scope/lane checks, so an undeclared item quietly never becomes
  // gate-eligible. `--external-acts none` records the deliberate answer
  // "there are none" as an explicit empty list.
  const externalActsRaw = readFlag(args, 'external-acts');
  let externalActs = null;
  if (externalActsRaw != null) {
    const t = externalActsRaw.trim().toLowerCase();
    externalActs = (t === 'none' || t === '')
      ? []
      : externalActsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const factsNeededRaw = readFlag(args, 'facts-needed');
  let factsNeeded = null;
  if (factsNeededRaw != null) {
    factsNeeded = factsNeededRaw.trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]*$/.test(factsNeeded)) {
      fail('add: --facts-needed must be a single lowercase token naming the fact source (repo, founder, dealer, ...)', { got: factsNeededRaw });
    }
  }

  const verifyRaw = readFlag(args, 'verify');
  let verifyBy = null;
  if (verifyRaw != null) {
    verifyBy = verifyRaw.trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]*$/.test(verifyBy)) {
      fail('add: --verify must be a single lowercase token naming who can observe acceptance (session, founder, ...)', { got: verifyRaw });
    }
  }

  const filesInvolved = (readFlag(args, 'files-involved') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  // WS-942: a description passed as argv is parsed by the caller's shell
  // before this script sees it, and inside double quotes a backtick is command
  // substitution. That is how a Stripe test key reached WS-719.yaml: the shell
  // ran the quoted text and pasted the output into the item. `--description -`
  // (stdin) and `--description-file <path>` hand the text over without any
  // shell reading it. An empty read is refused rather than written: an item
  // that silently lost its body looks exactly like one that never had one.
  let description = readFlag(args, 'description');
  const descriptionFile = readFlag(args, 'description-file');
  // readFlag returns null for a flag given last with no value. For these two
  // that would create the item with no body and exit 0.
  for (const flag of ['description', 'description-file']) {
    if (args[args.length - 1] === `--${flag}`) fail(`add: --${flag} needs a value`);
  }
  if (description != null && descriptionFile != null) {
    fail('add: pass --description or --description-file, not both');
  }
  if (description != null && description.trim() === '') fail('add: --description is empty');
  if (description === '-' || descriptionFile != null) {
    const from = descriptionFile != null ? `--description-file ${descriptionFile}` : 'stdin';
    try {
      description = fs.readFileSync(descriptionFile != null ? path.resolve(descriptionFile) : 0, 'utf8');
    } catch (e) {
      fail(`add: could not read the description from ${from}: ${e.message}`);
    }
    // A leading byte-order mark is an editor artifact, not part of the text.
    if (description.charCodeAt(0) === 0xFEFF) description = description.slice(1);
    description = description.replace(/\r\n/g, '\n').replace(/\s+$/, '');
    if (!description) fail(`add: the description read from ${from} is empty`);
  }

  const fields = {
    title,
    status: 'backlog',
    type: readFlag(args, 'type') || 'task',
    category: readFlag(args, 'category') || program,
    capability: readFlag(args, 'capability') || 'workstream',
    program,
    priority_score: priority,
    effort,
    severity,
    customer_impact: customerImpact,
    created_at: todayISO(),
    dedup_key: dedupKey ? dedupKey.trim() : null,
    session: session || null,
    why: why.trim(),
    blocked_by: blockedBy,
    description,
    accept_criteria: readFlag(args, 'accept-criteria'),
    external_acts: externalActs,
    facts_needed: factsNeeded,
    verify: verifyBy,
    files_involved: filesInvolved,
  };

  // Allocate + write inside one lock (the `writer` path). Reserving and then
  // writing separately is what let allocate-ws-id hand out the same id three
  // times in a row — see lib/id-allocator.js.
  const { allocateId } = require('./lib/id-allocator');
  let wroteTo = null;
  const id = allocateId('ws', {
    wsDir,
    reservedBy: `cwos-item add (pid:${process.pid})`,
    writer: (allocated) => {
      fields.id = allocated;
      wroteTo = queuePathFor(wsDir, allocated);
      writeFileAtomic(wroteTo, renderNewItem(fields));
    },
  });

  // Event AFTER the write here, not before. `add` inverts the transition
  // ordering deliberately: for a status change the event is the commit point
  // because the item already exists, but an item_created event naming a file
  // that was never written is a phantom the reducers would materialize into a
  // queue entry with nothing behind it.
  let eventId = null;
  const { appendEvent, ensureCommandId } = loadEventDeps();
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_created',
        payload: {
          type: 'item_created',
          ws_id: id,
          title,
          program,
          priority_score: priority,
          effort,
          severity,
          customer_impact: customerImpact,
          rationale: why.trim(),
          created_by: 'cwos-item add',
          session: session || null,
          at: fields.created_at,
        },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-add'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  if (eventId && wroteTo) {
    try {
      withFileLock(wroteTo + '.lock', () => {
        const raw = fs.readFileSync(wroteTo, 'utf8');
        writeFileAtomic(wroteTo, patchScalar(raw, 'created_by_event', eventId));
      }, { ownerLabel: 'item:add', maxWaitMs: 5000 });
    } catch { /* the item exists; the back-reference is a convenience */ }
  }

  writeJson({
    ok: true,
    id,
    verb: 'add',
    title,
    program,
    priority_score: priority,
    effort,
    severity,
    customer_impact: customerImpact,
    status: 'backlog',
    path: wroteTo,
    event_id: eventId,
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index + program caps',
  });
}

// ─── done ───────────────────────────────────────────────────────────────────
//
// WS-665, second half. Completion deliberately lives in cwos-next.js `done` so
// that sprint closure and item closure are one atomic act — but that command
// requires --sprint, so an item claimed OUTSIDE any sprint had no CLI closure
// path at all. Measured on HomeBase 2026-08-18: WS-651 was claimed, finished,
// and had to be hand-edited to done, which is precisely the event-log bypass
// this CLI exists to prevent.
//
// The atomicity commitment survives intact because this path REFUSES an item
// that belongs to an open sprint and names the command that owns it. There is
// no --force: a correct alternative exists, so per ADR-063 the honest answer is
// a refusal that points at it.

/** Sprints whose YAML lists this item and which are not themselves closed. */
function openSprintsContaining(wsDir, id) {
  const dir = path.join(wsDir, 'sprints');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/^SPR-.+\.yaml$/.test(f)) continue;
    const r = readYAMLFile(path.join(dir, f));
    if (!r.ok || !r.data) continue;
    const status = String(r.data.status || '');
    if (status === 'done' || status === 'abandoned') continue;
    const items = Array.isArray(r.data.items) ? r.data.items : [];
    const member = items.find((it) => it && it.id === id);
    if (!member) continue;
    // An item the sprint already recorded as done or skipped is not live there.
    if (member.status === 'done' || member.status === 'skipped') continue;
    out.push(r.data.id || path.basename(f, '.yaml'));
  }
  return out;
}

function runDoneItem(args) {
  assertKnownFlags('done', args.slice(1));
  const id = args[0];
  if (!id || !/^WS-[A-Za-z0-9-]+$/.test(String(id))) {
    fail('done: first argument must be a work item id (e.g. WS-651)', { got: id || null });
  }

  const wsDir = findWorkstreamDir(process.cwd());
  if (!wsDir) fail(`done: no .claude/workstream directory found from ${process.cwd()}`);

  const qPath = queuePathFor(wsDir, id);
  if (!fs.existsSync(qPath)) fail(`done: no such item: ${id}`, { looked_in: qPath });

  const read = readYAMLFile(qPath);
  if (!read.ok || !read.data) fail(`done: item YAML unreadable: ${id}`, { detail: read.error || null });

  const priorStatus = String(read.data.status || 'backlog');
  if (priorStatus === 'done') {
    writeJson({ ok: true, noop: true, id, status: 'done', note: 'already done' });
    return;
  }
  if (priorStatus === 'dismissed') {
    fail(
      `done: ${id} is dismissed — restore it first if the work actually happened, ` +
      'so the record shows the reversal rather than hiding it.',
      { prior_status: priorStatus }
    );
  }

  const owningSprints = openSprintsContaining(wsDir, id);
  if (owningSprints.length > 0) {
    fail(
      `done: ${id} belongs to open sprint ${owningSprints.join(', ')} — close it there ` +
      'so sprint and item closure stay atomic: ' +
      `node kit/scripts/cwos-next.js done --sprint ${owningSprints[0]}`,
      { open_sprints: owningSprints, use_instead: `cwos-next.js done --sprint ${owningSprints[0]}` }
    );
  }

  // WS-941 gap 3: a high/critical (or opted-in) item closes on an independent
  // inspector's PASS, not on the builder's word.
  const inspectionWaiver = enforceInspection(id, read.data, args, 'cwos-item done');

  // WS-1311: an item raised for a maintenance finding closes only once that
  // finding has, or on a recorded override.
  {
    const mfg = require('./lib/maintenance-finding-gate');
    const g = mfg.gateMaintenanceItem(read.data, findRepoRoot(process.cwd()) || process.cwd());
    if (!g.ok) {
      const why = readFlag(args, 'finding-open');
      if (why == null) {
        fail(`done: ${id} cannot close: ${g.reason}. ` + mfg.refusalHint(g.finding_id),
          { finding_open: true, finding_id: g.finding_id });
      }
      if (String(why).trim().length < mfg.MIN_OVERRIDE_RATIONALE) {
        fail(`done: --finding-open rationale must be at least ${mfg.MIN_OVERRIDE_RATIONALE} chars`);
      }
      const { appendEvent: ae, ensureCommandId: ec } = loadEventDeps();
      if (ae) {
        try {
          const ev = {
            source_track: 'T6:workstream', source_tier: 'founder-prompt', track_tag: 'finding_open_override',
            payload: { type: 'finding_open_override', ws_id: id, finding_id: g.finding_id, rationale: String(why).trim(), closure_path: 'cwos-item done' },
          };
          if (ec) { try { ev.command_id = ec('finding-open-override'); } catch { /* non-fatal */ } }
          ae(ev);
        } catch { /* non-fatal */ }
      }
    }
  }

  const notes = readFlag(args, 'notes');
  const completedAt = readFlag(args, 'clock') || new Date().toISOString();

  let completionCommit = readFlag(args, 'commit');
  if (!completionCommit) {
    try {
      const { spawnSync } = require('child_process');
      const root = findRepoRoot(process.cwd()) || process.cwd();
      const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
      if (r.status === 0 && r.stdout) completionCommit = r.stdout.trim();
    } catch { /* non-fatal */ }
  }

  // Event first — same commit-point convention as runTransition and runDone.
  // sprint_id is null by construction: that is the whole point of this path,
  // and it makes standalone closures distinguishable in the log.
  let eventId = null;
  const { appendEvent, ensureCommandId } = loadEventDeps();
  if (appendEvent) {
    try {
      const evtArgs = {
        source_track: 'T6:workstream',
        source_tier: 'founder-prompt',
        track_tag: 'item_closed',
        payload: {
          type: 'item_closed',
          ws_id: id,
          sprint_id: null,
          from_status: priorStatus,
          completed_at: completedAt,
          completion_commit: completionCommit || null,
          closure_path: 'cwos-item done',
          completion_notes: notes ? notes.trim() : null,
        },
      };
      if (ensureCommandId) {
        try { evtArgs.command_id = ensureCommandId('item-closed'); } catch { /* non-fatal */ }
      }
      const r = appendEvent(evtArgs);
      if (r && r.ok && r.event) eventId = r.event.id;
    } catch { /* non-fatal per AS-23 */ }
  }

  let yamlWritten = true;
  let writeWarning = null;
  try {
    withFileLock(qPath + '.lock', () => {
      let raw = fs.readFileSync(qPath, 'utf8');
      raw = patchStatus(raw, 'done');
      raw = patchScalar(raw, 'completed_at', completedAt);
      if (completionCommit) raw = patchScalar(raw, 'completion_commit', completionCommit);
      if (notes) raw = patchScalar(raw, 'completion_notes', notes.trim());
      if (eventId) raw = patchScalar(raw, 'closed_by_event', eventId);
      writeFileAtomic(qPath, raw);
    }, { ownerLabel: 'item:done', maxWaitMs: 5000 });
  } catch (e) {
    // The item_closed event is already logged; reconcile's drift detector
    // re-derives from it. Report, do not fail — matches runDone's contract.
    yamlWritten = false;
    writeWarning = e.message;
  }

  // A closed item releases its lease (WS-533). Without this the queue accretes
  // claims that outlive the session that took them.
  let claimReleased = true;
  try {
    require('./lib/cwos-claims').releaseItems(wsDir, [id]);
  } catch { claimReleased = false; }

  const sideEffects = runClosureSideEffects({
    repoRoot: findRepoRoot(process.cwd()) || process.cwd(),
    queueData: read.data,
    wsId: id,
    sprintId: null,
    completedAt,
    completionCommit: completionCommit || null,
    onWarn: (msg) => process.stderr.write(`done: ${msg}\n`),
  });

  const out = {
    ok: true,
    id,
    verb: 'done',
    from_status: priorStatus,
    to_status: 'done',
    sprint_id: null,
    completed_at: completedAt,
    completion_commit: completionCommit || null,
    completion_notes: notes ? notes.trim() : null,
    event_id: eventId,
    yaml_written: yamlWritten,
    claim_released: claimReleased,
    auto_resolved: sideEffects.auto_resolved,
    friction_announce: sideEffects.friction_announce,
    inspection_waived: inspectionWaiver ? inspectionWaiver.rationale : null,
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index + program caps',
  };
  if (writeWarning) out.warning = `YAML write failed: ${writeWarning}`;
  writeJson(out);
}

function main() {
  const args = process.argv.slice(2);
  let sub = args[0];
  // --help anywhere after a subcommand explains and never acts.
  if (sub && !sub.startsWith('-') && (args.includes('--help') || args.includes('-h'))) sub = '--help';
  if (!sub || sub === '--help' || sub === '-h') {
    process.stdout.write(
      'usage: cwos-item <add|done|defer|dismiss|restore|release|tag|correct|scope|inspect|show> WS-NNN [options]\n' +
      '\n' +
      'subcommands:\n' +
      '  add     "<title>" --program <id> --why "<text>" [options]\n' +
      '  done    WS-NNN [--notes "<text>"] [--commit <sha>]\n' +
      '  defer   WS-NNN --reason "<text>" --until "<resume condition>"\n' +
      '  dismiss WS-NNN --reason "<text>" [--superseded-by WS-MMM]\n' +
      '  restore WS-NNN --reason "<text>"\n' +
      '  release WS-NNN --reason "<text>"   (claimed|in_progress|review -> backlog, drops the claim)\n' +
      '  tag     WS-NNN --customer-impact "RepoA,RepoB"   ("" clears)\n' +
      '  correct WS-NNN --field <f> --to "<text>" --reason "<why it was wrong>"\n' +
      '  scope   WS-NNN --files "a,b,c" --reason "<why this is the scope>" [--new "x,y"] [--replace]\n' +
      '  inspect WS-NNN --verdict pass|fail --inspector "<id>" --evidence "<text>" [--diff <range>]\n' +
      '  show    WS-NNN\n' +
      '\n' +
      'add options:\n' +
      `  --program <id>          required; bare program id (prog- prefix accepted)\n` +
      `  --why "<text>"          required, min ${MIN_WHY_LEN} chars — why this belongs in the backlog\n` +
      '  --priority <0-100>      default 50\n' +
      `  --effort ${VALID_EFFORTS.join('|')}          default M\n` +
      `  --severity ${VALID_SEVERITIES.join('|')}\n` +
      '                          default medium\n' +
      '  --type <t>              default task\n' +
      '  --category <c>          default: the program id\n' +
      '  --capability <c>        default workstream\n' +
      '  --dedup-key <key>       refuses if another item already holds it\n' +
      '  --blocked-by WS-A,WS-B  each must exist\n' +
      '  --description "<text>"  long-form body; --description - reads it from stdin\n' +
      '  --description-file <path>\n' +
      '                          long-form body read from a file. Use this or stdin for\n' +
      '                          any text holding backticks or $(...): inside a double-\n' +
      '                          quoted argument the shell runs them first (WS-942)\n' +
      '  --accept-criteria "<text>"\n' +
      '  --customer-impact "RepoA,RepoB"\n' +
      '                          fleet repos this item serves; names are validated\n' +
      '                          against fleet/registry.yaml. Matched by boost specs\n' +
      '                          in system/context.md active overrides.\n' +
      '  --external-acts "a,b"   world-touching acts this item performs (payment,\n' +
      '                          client-contact, publishing, ...); "none" records an\n' +
      '                          explicit empty list. Any entry routes the item to the\n' +
      '                          founder — the autonomous gate never runs it (WS-789)\n' +
      '  --facts-needed <src>    where the facts live: repo (autonomous-eligible),\n' +
      '                          founder, dealer, ... — non-repo goes to the waiting list\n' +
      '  --verify <who>          who can observe acceptance: session, founder, ... —\n' +
      '                          verify founder items build autonomously, close attended\n' +
      '  --files-involved "a,b"  declared file scope; the autonomous gate fails closed\n' +
      '                          without one\n' +
      '\n' +
      'done options:\n' +
      '  --notes "<text>"        completion notes\n' +
      '  --commit <sha>          default: current git HEAD\n' +
      '  --skip-inspection "<why>"  close a high/critical item with no inspection PASS;\n' +
      '                          logged as inspection_waived (founder escape valve)\n' +
      '\n' +
      'inspect options (WS-941): high/critical items, and any item carrying\n' +
      '`inspection: required`, close only on an independent PASS recorded here.\n' +
      '  --verdict pass|fail     the inspector verdict\n' +
      '  --inspector "<id>"      who inspected: a fresh subagent, never the builder\n' +
      '  --evidence "<text>"     one line per accept criterion with its pointer (>=40 chars);\n' +
      '                          --evidence - reads stdin\n' +
      '  --diff <range>          the commit range inspected\n' +
      '  --class <slug>          the kind of break a FAIL found, e.g. yaml/quoted-continuation\n' +
      '  --contract-ref <ref>    the contract the item was judged against (path or id)\n' +
      "  --tokens <n>            the inspector's total tokens, as its run reported them\n" +
      '                          (round and tier are read from the item, never typed)\n' +
      '\n' +
      'correct options:\n' +
      `  --field <f>             one of: ${CORRECTABLE_FIELDS.join(', ')}\n` +
      '  --to "<text>"           the corrected text; --to - reads it from stdin\n' +
      '  --reason "<text>"       why the old text was wrong, and how that is known\n' +
      '\n' +
      'scope options: sets files_involved on an EXISTING item so the autonomous gate can\n' +
      'see it. Each path must be path-shaped (slash or extension, no spaces, no "Label: "\n' +
      'prefix) and exist under the repo root, unless listed in --new (paths the item will\n' +
      'create; each must also be in --files). Refused (exit 2) if the item is done or\n' +
      'dismissed, or already has scope and --replace was not passed.\n' +
      '\n' +
      '`correct` changes what an item CLAIMS, never what it IS. It refuses status,\n' +
      'priority_score and program: those are state, they have their own verbs, and\n' +
      'a state change wearing the word "correct" is the one thing it must not do.\n' +
      'The superseded text is kept in the item file under `corrections:` — a record\n' +
      'that was wrong is evidence, and deleting it is tidying, not correcting.\n' +
      '\n' +
      `--reason and --until must each be at least ${MIN_REASON_LEN} characters.\n` +
      '\n' +
      '`done` closes an item that belongs to NO open sprint. An item inside an\n' +
      'open sprint is refused here and routed to cwos-next.js done --sprint, so\n' +
      'sprint closure and item closure stay atomic.\n'
    );
    process.exit(sub ? 0 : 1);
  }
  if (sub === 'show') return runShow(args.slice(1));
  if (sub === 'add') return runAdd(args.slice(1));
  if (sub === 'tag') return runTag(args.slice(1));
  if (sub === 'correct') return runCorrect(args.slice(1));
  if (sub === 'scope') return runScope(args.slice(1));
  if (sub === 'inspect') return runInspect(args.slice(1));
  if (sub === 'done') return runDoneItem(args.slice(1));
  if (TRANSITIONS[sub]) return runTransition(sub, args.slice(1));
  process.stderr.write(
    `cwos-item: unknown subcommand: ${sub}\n` +
    'known: add, done, defer, dismiss, restore, release, tag, correct, scope, inspect, show — run with --help for options\n'
  );
  process.exit(2);
}

if (require.main === module) main();

module.exports = {
  TRANSITIONS,
  MIN_REASON_LEN,
  MIN_TITLE_LEN,
  MIN_WHY_LEN,
  VALID_EFFORTS,
  VALID_SEVERITIES,
  patchScalar,
  patchStatus,
  patchField,
  renderField,
  fieldBlockRange,
  insertCorrection,
  insertInspection,
  buildCorrection,
  buildInspection,
  verifyRewrite,
  CORRECTABLE_FIELDS,
  normalizeProgramId,
  openSprintsContaining,
  renderNewItem,
  isPathShaped,
};
