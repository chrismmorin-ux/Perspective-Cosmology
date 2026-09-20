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
 *   cwos-item correct  WS-NNN --field <f> --to "<text>" --reason "<text>"
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
  todayISO, escapeYamlString, formatScalar, loadEventDeps,
} = require('./lib/cwos-utils');
const { runClosureSideEffects } = require('./lib/item-closure');

const MIN_REASON_LEN = 20;

// Fields `correct` may rewrite: what an item CLAIMS, never what it IS.
//
// The exclusions are the point. `status` has defer/dismiss/restore/done.
// `priority_score` and `program` are re-derived by reconcile. The *_at stamps,
// *_reason fields and transitioned_by_event are the audit trail of the verbs
// above -- rewriting one under the word "correct" would let this command
// launder a state change, which is the one thing it must never do.
const CORRECTABLE_FIELDS = [
  'title', 'description', 'accept_criteria', 'evidence', 'source', 'notes',
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
    'accept-criteria', 'session', 'customer-impact',
    // WS-789: risk-schema fields set at intake — what grows the
    // autonomous-eligible pool without a retrofit pass.
    'external-acts', 'facts-needed', 'verify', 'files-involved',
  ],
  done: ['notes', 'commit', 'clock'],
  defer: ['reason', 'until', 'to'],
  dismiss: ['reason', 'superseded-by', 'to'],
  restore: ['reason', 'to'],
  tag: ['customer-impact', 'reason'],
  correct: ['field', 'to', 'reason'],
  show: [],
};

/**
 * Refuse any `--flag` the subcommand does not declare.
 *
 * Walks pairwise so a VALUE that begins with `--` (a --reason whose text opens
 * with a dash) is consumed as a value rather than mistaken for a flag.
 */
function assertKnownFlags(verb, args) {
  const known = new Set(KNOWN_FLAGS[verb] || []);
  const unknown = [];
  for (let i = 0; i < args.length; i++) {
    const tok = args[i];
    if (typeof tok !== 'string' || !tok.startsWith('--')) continue;
    const name = tok.slice(2).split('=')[0];
    if (!known.has(name)) { unknown.push(tok); continue; }
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
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (head.test(lines[i])) { start = i; break; }
  }
  if (start === -1) return null;

  let end = start;
  if (/^[^:]+:\s*[|>][-+0-9]*\s*$/.test(lines[start])) {
    for (let i = start + 1; i < lines.length; i += 1) {
      const l = lines[i];
      if (l.trim() === '' || /^\s/.test(l)) { end = i; continue; }
      break;
    }
    // Do not swallow blank lines that separate this field from the next.
    while (end > start && lines[end].trim() === '') end -= 1;
  }
  return { start, end, lines };
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
  const v = read.data[field];
  if (v == null) return null;
  return typeof v === 'string' ? v : JSON.stringify(v);
}

/** Block scalar when the value spans lines, quoted scalar when it does not. */
function renderField(field, value) {
  if (!String(value).includes('\n')) {
    return `${field}: "${escapeYamlString(String(value))}"`;
  }
  const body = String(value)
    .replace(/\s+$/, '')
    .split('\n')
    .map((l) => (l.length ? `  ${l}` : ''))
    .join('\n');
  return `${field}: |\n${body}`;
}

function patchField(raw, field, value) {
  const range = fieldBlockRange(raw, field);
  const rendered = renderField(field, value);
  if (!range) return `${raw.trimEnd()}\n${rendered}\n`;
  const { lines, start, end } = range;
  return [...lines.slice(0, start), ...rendered.split('\n'), ...lines.slice(end + 1)].join('\n');
}

/**
 * Record the superseded text in the item file, newest first.
 *
 * Inserted directly under the `corrections:` key rather than re-serialized,
 * so existing entries are never rewritten -- the same reason patchScalar is
 * regex-based: these files carry hand-written prose the CWOS YAML subset does
 * not round-trip losslessly.
 */
function insertCorrection(raw, entry) {
  const wasBody = String(entry.was == null ? '' : entry.was)
    .replace(/\s+$/, '')
    .split('\n')
    .map((l) => (l.length ? `        ${l}` : ''))
    .join('\n');
  const block = [
    `  - at: "${entry.at}"`,
    `    field: ${entry.field}`,
    `    reason: "${escapeYamlString(entry.reason)}"`,
    entry.event ? `    event: "${entry.event}"` : null,
    entry.was == null ? '    was: null' : `    was: |\n${wasBody}`,
  ].filter(Boolean).join('\n');

  if (/^corrections:\s*$/m.test(raw)) {
    return raw.replace(/^corrections:\s*$/m, `corrections:\n${block}`);
  }
  return `${raw.trimEnd()}\ncorrections:\n${block}\n`;
}

function patchStatus(raw, status) {
  if (/^status:\s*.*$/m.test(raw)) {
    return raw.replace(/^status:\s*.*$/m, `status: ${status}`);
  }
  return `status: ${status}\n` + raw;
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

  try {
    withFileLock(qPath + '.lock', () => {
      let raw = fs.readFileSync(qPath, 'utf8');
      raw = patchStatus(raw, targetStatus);
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

  const stamp = todayISO();
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
      let raw = fs.readFileSync(qPath, 'utf8');
      raw = patchField(raw, field, String(to).trim());
      raw = insertCorrection(raw, {
        at: stamp, field, reason: reason.trim(), event: eventId, was,
      });
      writeFileAtomic(qPath, raw);
    }, { ownerLabel: 'item:correct', maxWaitMs: 5000 });
  } catch (e) {
    writeJson({
      ok: true, id, verb: 'correct', field, event_id: eventId, yaml_written: false,
      warning: `YAML write failed: ${e.message}`,
      next: 'run node kit/scripts/cwos-reconcile.js to re-derive indexes',
    });
    return;
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
  lines.push(`  rationale: ${formatScalar(fields.why)}`);
  lines.push(`blocked_by: ${fields.blocked_by.length ? JSON.stringify(fields.blocked_by) : '[]'}`);
  lines.push('enables: []');
  if (fields.description) {
    lines.push('description: |');
    for (const ln of String(fields.description).split('\n')) lines.push(`  ${ln}`);
  }
  if (fields.accept_criteria) push('accept_criteria', fields.accept_criteria);
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
    description: readFlag(args, 'description'),
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
    next: 'run node kit/scripts/cwos-reconcile.js to re-derive queue-index + program caps',
  };
  if (writeWarning) out.warning = `YAML write failed: ${writeWarning}`;
  writeJson(out);
}

function main() {
  const args = process.argv.slice(2);
  const sub = args[0];
  if (!sub || sub === '--help' || sub === '-h') {
    process.stdout.write(
      'usage: cwos-item <add|done|defer|dismiss|restore|tag|correct|show> WS-NNN [options]\n' +
      '\n' +
      'subcommands:\n' +
      '  add     "<title>" --program <id> --why "<text>" [options]\n' +
      '  done    WS-NNN [--notes "<text>"] [--commit <sha>]\n' +
      '  defer   WS-NNN --reason "<text>" --until "<resume condition>"\n' +
      '  dismiss WS-NNN --reason "<text>" [--superseded-by WS-MMM]\n' +
      '  restore WS-NNN --reason "<text>"\n' +
      '  tag     WS-NNN --customer-impact "RepoA,RepoB"   ("" clears)\n' +
      '  correct WS-NNN --field <f> --to "<text>" --reason "<why it was wrong>"\n' +
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
      '  --description "<text>"  long-form body\n' +
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
      '\n' +
      'correct options:\n' +
      `  --field <f>             one of: ${CORRECTABLE_FIELDS.join(', ')}\n` +
      '  --to "<text>"           the corrected text; --to - reads it from stdin\n' +
      '  --reason "<text>"       why the old text was wrong, and how that is known\n' +
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
  if (sub === 'done') return runDoneItem(args.slice(1));
  if (TRANSITIONS[sub]) return runTransition(sub, args.slice(1));
  process.stderr.write(
    `cwos-item: unknown subcommand: ${sub}\n` +
    'known: add, done, defer, dismiss, restore, tag, correct, show — run with --help for options\n'
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
  CORRECTABLE_FIELDS,
  normalizeProgramId,
  openSprintsContaining,
  renderNewItem,
};
