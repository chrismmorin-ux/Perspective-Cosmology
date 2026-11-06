---
name: autopilot-local
description: "Run autonomous A0 work in THIS session — fresh-context subagent per item, one at a time, founder-free within the gate"
user-invocable: true
argument-hint: "[max items, default 5] | status"
---

# /autopilot-local — In-Session Autonomous Work (fresh context per item)

The local sibling of `/autopilot` (which needs an origin remote and cloud
sessions — some repos have neither). One session acts as a thin dispatcher; each
work item executes inside a **fresh-context subagent**, so per-item context
never accumulates in the dispatcher. Durable state lives on disk (queue YAMLs,
cycle log), never in session memory — the dispatcher can die at any point and
the next one recovers from the repo alone.

**Authority:** the repo's autonomous operating contract and lane/approval
rules (where the repo declares them — e.g. under `docs/canonical/`) — lowest
autonomous band only (A0 or this repo's equivalent), via the fail-closed
eligibility gate. Pause gates always win. The gate is the AI's, not the
founder's: it pulls only work requiring no founder decision. Everything it
disqualifies is *reported*, never silently dropped.

## Output Shape

**Autopilot-local arc:** `<blocked | running | done>` — `<one-clause status>`.

`<Delta line: items completed / failed this run.>`

`<Cycle table: Item / Outcome / Lane / Verification — reverse-chronological.>`

### Waiting on you
`<Founder-blocked list distilled from the gate's disqualified output: items
blocked on decisions, calls, sign-offs, or scope declarations only the founder
can supply. Always render — the founder cannot see silent blocks.>`

**Do next:** numbered options.

## Step 0: Parse

- `status` → read `.claude/workstream/autopilot-cycles.jsonl`, show entries
  with `run_id` starting `aplocal-`, newest 20. Done.
- Integer `N` (1–10) → MAX_ITEMS = N. Default 5.
- Generate `RUN_ID = aplocal-YYYYMMDD-HHMM` (UTC).

## Step 1: Gate (fail closed)

```bash
node kit/scripts/cwos-autonomous-gate.js
```

- **Exit 1 (blocked):** render `block_reasons` verbatim, render the "Waiting on
  you" list from `disqualified`, and STOP. Red vitals are a stop, not a caveat.
  The founder override (`--override-vitals "<rationale ≥20 chars>"`) exists but
  is only ever passed when the founder supplies the rationale in this
  conversation — never self-authored. Persistence does not expand authority.
- **Exit 0, empty `eligible`:** report why (the `disqualified` reasons aggregate),
  surface items that are one `files_involved:` line away from eligible, STOP.
- Eligibility is risk-derived: lowest lane ceiling, no `external_acts`,
  `facts_needed: repo`, not `verify: founder`. Effort is sizing only — the
  gate admits S and M by default; `--max-effort L` is a founder choice
  supplied in-conversation, never self-chosen.

**Stale claim recovery:** before selecting, reset any queue item with
`status: in_progress` and `claimed_by` starting `aplocal-` from a *different*
run — back to `backlog`, clear claim fields, `node kit/scripts/cwos-reconcile.js --quiet`.

**Concurrency:** the gate routes around live claims, but if another live session
shares this checkout, take a worktree for code changes
(`node kit/scripts/cwos-git.js worktree create <topic>`); workstream state is
written only from the main tree.

## Step 2: Cycle (per item, up to MAX_ITEMS)

Take the top of `eligible` (already priority-sorted). Announce one line:
`--- aplocal cycle K: WS-NNN <title> [lane/<effort>] ---`

**2a. Claim.** Item YAML: `status: in_progress`, `claimed_by: <RUN_ID>`,
`claimed_at`, `started_at`. Run `cwos-reconcile.js --quiet`. Commit the claim
(separate commit — audit trail): `aplocal: claim WS-NNN — <title> [<RUN_ID> cK]`.

**2b. Dispatch a fresh-context subagent.** ONE `general-purpose` agent per item
— this is the context-hygiene mechanism, not a parallelism mechanism. Its
prompt is self-contained (assume it knows nothing):

- The item YAML content verbatim (description, accept_criteria, files_involved).
- The binding constraint: modify ONLY files in `files_involved` or closely
  related files in the same directories; anything else is a scope violation to
  report, not commit.
- Read `.claude/rules/` files applicable to the touched area before coding.
- After changes: run the repo's declared static and behavioral verification
  commands (`npm run check` / `npm run verify` where defined, else the
  equivalents named in CLAUDE.md); include their real output in the report.
  Do NOT commit, do NOT touch `.claude/workstream/`, do NOT enter plan mode,
  do NOT ask questions — if genuinely stuck, report the blocker instead of
  improvising outside scope.
- Report back: files changed, what was done per acceptance criterion,
  verification output, any scope concern.

**2c. Verify in the dispatcher.** The subagent's report is **Inferred** until
this session observes it: run the same verification commands yourself;
`git status` to confirm no surprise files; spot-read the diff against the
declared scope. A verification failure or scope surprise is a FAIL even if
the report says success.

**2d. Close or revert.**
- PASS: item YAML `status: done`, `completed_at`, `completion_notes`
  ("Completed by <RUN_ID> cycle K, verified check+verify"),
  `completion_commit` after committing. Reconcile. Commit:
  `aplocal cK: WS-NNN done [<RUN_ID>]`. Log via
  `require('./kit/scripts/core/autopilot-log')`:
  `appendCycleLog({ts, run_id: RUN_ID, cycle: K, outcome: 'work_completed', item_id, duration_ms})`.
- FAIL: revert working changes (`git checkout -- <paths>`), release the claim
  back to `backlog`, reconcile, log `outcome: 'work_failed'` with a short
  reason, commit the state change. `error_streak++`.

**2e. Guard rails (checked every cycle).**
- 3 consecutive failures → stop and report.
- Re-run the gate between cycles; newly-red vitals or a newly-blocked gate → stop.
- MAX_ITEMS reached → stop.
- Every stop path still writes its cycle-log line first.

## Step 3: End-of-run write-back

- Cycle table + one-line evidence per closure (check/verify output observed).
- What was self-approved, under which band, with the `ai-autonomous`
  provenance understanding — the record must answer "who did this under what
  authority."
- The gate's disqualified list distilled into **Waiting on you** (decisions,
  calls, sign-offs, missing `files_involved` scopes worth the founder's ten
  seconds).
- Anything disqualified from eligibility mid-run and why.
- Commit everything (where the repo grants standing commit authority; otherwise
  leave the tree clean and report); state landed = session can end.

## What this command will NOT do

- Execute anything the gate did not emit as `eligible` — no exceptions, no
  "it's obviously fine."
- Widen its own gate (`--max-effort L`, `--override-vitals`) without the
  founder supplying that instruction in-conversation or as a recorded standing
  decision.
- Touch higher-band territory: publishing, client-facing surfaces, canonical
  rewrites, spend, external contact (the repo's pause gates, verbatim).
- Run more than one subagent at a time — serial by design; the queue's claim
  machinery, not parallel subagents, is how concurrency scales (open a second
  terminal and run `/next` or another `/autopilot-local` instead).
