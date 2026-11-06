---
name: get-to-work
description: "Use when the founder says 'get to work' (or 'keep going', 'go'): lean start, then run this session as an orchestrator — take the next topic, hand it to a bounded Opus worker with a self-contained brief, verify, close, move to the next topic"
user-invocable: true
argument-hint: "[a topic to start with] | [max topics, default 6]"
---

# /get-to-work — Orchestrate Until the Allowed Work Runs Out

The founder said go. This session is now the **orchestrator**. It keeps the context,
makes the calls, writes the briefs, verifies, commits and closes. **Workers**
(`.claude/agents/worker.md`) do the bounded hands-on work. A worker starts with a fresh
context and does not see this conversation or CLAUDE.md, so its brief is everything it
knows. The loop runs topic after topic. It never waits on an answer while other allowed
work exists: questions batch into "Waiting on you". Durable state lives in the repo
(queue, sprint, commits, deferrals), so a fresh session saying "get to work" picks up
where this one stopped.

## Output Shape

**Working:** `<topic K of up to N>` — `<one-clause status>`.

`<One line per closed topic: ✓ WS-NNN title — evidence observed (tests/verify) — commit sha.>`
`<One line per parked topic: ⏸ WS-NNN title — why — what it waits on.>`

### Waiting on you
`<Every question, approval and blocked item, each with 2 options and a recommendation. Always render, even "nothing".>`

**Do next:** numbered options (usually `1. Keep going` / `2. Answer the waiting items` / `3. Stop here`).

## Step 0: Start lean (two commands, no file surveys)

Do NOT run `/session-start`'s full path and do not read `system/` files up front.
Parse the argument: text = the first topic; an integer 1–10 = MAX_TOPICS; default 6.

```bash
node kit/scripts/cwos-next.js gate          # sprint, pool, blocks, claim conflicts
node kit/scripts/cwos-autonomous-gate.js    # work eligible with no founder decision
```

Apply `/next` Step 1 to the gate result with one change: **no question stops the loop.**
- A real block (red gate, drift, token budget) stops the run. Report it.
- `checkout-shared` self-resolves into a worktree exactly as `/next` says. Its path is
  the **WORKDIR** for every brief from then on.
- A stale sprint, phantom sprints and a stale pool are questions for the founder. Put
  them under "Waiting on you" with `/next`'s options, and carry on with other allowed
  work. Do not resume a stale sprint until answered.

Read a `system/` file only when a gate result points at it. Tell the founder in one line
what you found and that you are orchestrating, e.g. *"Resuming SPR-41 (3 left), then 2
eligible items. Workers on Opus."*

## Step 1: Take the next topic

Take the first that applies. A topic is one queue item, or one task the founder named.

1. **A task the founder named** in the argument or the conversation. Naming it approves
   *doing* it. It does not approve deciding what the founder has not decided. "What this
   command will NOT do" and parking still apply.
2. **This session's active sprint** (not stale) has an unfinished item. Already approved.
3. **A pooled sprint** is waiting and this session has none. `cwos-next.js gate --pickup`.
   Pooled sprints were approved when composed, and "get to work" is the go-ahead to take
   one. That is the one deliberate difference from `/next`, which offers before pickup.
4. **The autonomous gate's top `eligible` item.** It needs no founder decision by construction.
5. **Nothing left.** Compose (`cwos-next.js compose --human`). If the founder is present,
   ask for approval once (`/next` Steps 4–5) and continue on approval. Otherwise put the
   proposal under "Waiting on you" and stop.

Sprint items are already claimed. Claim any other item with `/workstream claim WS-NNN`.
Announce: `--- Topic K: WS-NNN <title> ---`.

**`mode: plan-first` items are never sent to a worker.** The orchestrator designs, puts
the item's `decision_flags` questions to the founder (batched into "Waiting on you"), and
parks the item until they are answered. Only the approved plan's execution is dispatched.

## Step 2: Decide who does it

Ask: would doing this myself put more into my context than the brief costs to write?

| Work | Who | Model |
|---|---|---|
| Trivial: 1 file, ~20 lines, no investigation | orchestrator, directly | — |
| Finding things across many files | `Explore` agent | `haiku` (search) / `sonnet` (synthesis) |
| Implementation, investigation, writing, analysis | `worker` | `opus` |
| Mechanical bulk edits on a fixed pattern | `worker` | `sonnet` |
| Design calls, product choices, anything the founder must weigh | orchestrator | — |

**Every dispatch passes `model` explicitly.** Never let a worker inherit this session's
model. If the repo keeps a routing ledger, its tier for the task class wins. `fable` is
used only when the founder asks or the ledger marks the class Fable-only. If Fable is
unavailable or rate-limited, use `opus` and say so in the topic line.

**Workers run one at a time.** Step 5's check attributes changes to the worker in
flight, so two workers at once would blur it. Only `Explore` agents, which cannot write,
may run in parallel (up to 3) alongside a worker.

## Step 3: Write the brief (the worker knows nothing you know)

The brief is the only bridge from your context to the worker's. A decision made in
conversation, a gate finding, or a constraint the founder stated reaches the worker only
if it is written here. Pass paths, not file contents. Target under 60 lines.

Before writing it, run the VERIFY WITH commands once yourself. Their failures now are the
BASELINE, so the worker can tell its breakage from what was already broken.

```
You are a worker dispatched by /get-to-work. Your definition's rules override the repo's CLAUDE.md.
WORKDIR: <absolute path — the main tree, or the worktree from Step 0>
GOAL: <one sentence — the outcome, not the activity>
WHY: <why this matters now; what the founder said that shapes it, quoted if short>
CONTEXT YOU CANNOT SEE: <decisions already made, prior attempts and why they failed,
  related items, the conventions that bite here (you do not get CLAUDE.md)>
SCOPE — may change: <paths>   may create: <new paths, or "none">   may read: <paths or "anything">
DONE WHEN: <checkable criteria, one per line — copy the item's accept_criteria>
VERIFY WITH: <exact commands; kit state scripts other than read-only ones are refused to workers>
BASELINE: <failures VERIFY WITH already shows before your change, or "all pass">
DO NOT: <job-specific traps: files that look related but are not, approaches already rejected>
BUDGET: ~60 turns. If it is bigger, do the first coherent part and report the rest.
```

## Step 4: Dispatch

From WORKDIR:

```bash
node kit/scripts/cwos-worker-guard.js snapshot     # HEAD, branch, stash, dirty-file hashes; arms the write ledger
```

Then `Agent(subagent_type: "worker", model: "<from Step 2>", description: "WS-NNN <3-5 words>", prompt: <brief>)`.

The worker definition carries the limits: a tool allowlist (no Agent, Skill, publishing
or scheduling), a 60-turn cap, no CLAUDE.md, and a PreToolUse hook that refuses git
writes, gh publishing, workstream-state scripts and protected-path writes. If a worker
returns `partial` because it hit its turn cap, either continue it once with `SendMessage`
and a sharpened instruction, or split the job. Do not just retry.

## Step 5: Verify — the report is a claim until you observe it

1. From WORKDIR: `node kit/scripts/cwos-worker-guard.js delta <SCOPE paths, including may-create>`.
   It compares with the snapshot. It offers a revert only for files the worker's own
   edits wrote, which the hook recorded. Peers keep working in a shared checkout, so
   nothing else is ever offered.
   - **CLEAN:** continue.
   - **Worker wrote outside scope, new since dispatch:** run the revert lines it prints.
     The topic failed, even if the report says done.
   - **Worker wrote outside scope into an already-dirty file:** never revert, because
     someone else's work is in it. Park the topic and put it under "Waiting on you".
   - **Changed by someone, not a worker edit** (the header then reads "CLEAN for the
     worker's own edits — N change(s) made outside them"): a live peer, or the worker's
     shell commands. The hook records only Edit/Write, so a `sed -i`, `cp` or script the
     worker ran lands here, even outside SCOPE. CLEAN does not vouch for these. Judge
     ownership file by file. Never revert blindly.
   - **HEAD, branch or stash moved:** check `git reflog -5`. A peer's commit is fine, so
     continue. A commit or stash from the worker means it got past its limits: stop the
     loop and report.
   - A worker that ignored WORKDIR edited a different tree, and the delta cannot see
     that. Its report's CHANGED list will not match the delta's in-scope list, so treat
     that mismatch as a failure.
2. Re-run every VERIFY WITH command yourself and compare with BASELINE.
3. Read the in-scope diff: enough to confirm each DONE WHEN item. Not the whole files.
4. `DECISIONS NEEDED` that change user-visible behavior go to "Waiting on you". Do not
   decide them yourself unless the founder already did in this conversation.
5. A `high`/`critical` item, or one with `inspection: required`, closes only on
   `/verify` Layer 6's independent inspection (WS-941).

## Step 6: Close, then go straight to the next topic

- **Pass:** stage exactly the in-scope files the delta listed:
  `node kit/scripts/cwos-git.js stage <those paths>`. Commit if the repo grants standing
  commit authority (its CLAUDE.md git policy); otherwise leave them staged and say so.
  Close the item: `/workstream done`, or `cwos-next.js done --sprint` when the sprint's
  last item lands. Capture any implicit decision with `cwos-capture.js decision`. Print
  the ✓ line. Back to Step 1.
- **Fail:** retry once, and only with a brief that adds what the failure taught. A
  second failure means revert per the delta, then park.
- **Needs a founder decision:** finish what does not depend on it, then park the rest.
- **Park = durable,** so no session re-picks it:
  `node kit/scripts/cwos-item.js defer WS-NNN --reason "<why>" --until "<what unblocks it>"`.
  Release any sprint claim the same way `/next` Step 7 skips an item. Print the ⏸ line,
  put the question under "Waiting on you", and go back to Step 1.

## Stop when

- MAX_TOPICS are closed or parked.
- Step 1 finds nothing allowed, and the approval question has been asked or recorded.
- 2 topics in a row failed. Something systemic is wrong, so say what.
- A gate turns red between topics. Re-run `cwos-next.js gate` after each close.
- The delta shows the worker moved HEAD, the branch or the stash.
- This session's context is heavy, about two-thirds used. Close or park the current
  topic, then tell the founder: *"Context is heavy — `/clear` and say 'get to work' to
  continue."* Restarting is cheap because state is on disk.

## End of run

1. The topic lines, already printed. Do not repeat a recap of steps.
2. **Waiting on you**, always rendered.
3. One line of model use from the harness, not from memory:
   `node kit/scripts/cwos-dispatch-ledger.js report --since <run start ISO>`. Flag any
   dispatch that ran on a different model than requested.

## What this command will NOT do

- Decide product, pricing, legal, money or other irreversible questions. Those park.
- Widen the autonomous gate (`--max-effort L`, `--override-vitals`) unless the founder
  says so in this conversation.
- Let a worker commit, push, close items or write workstream state. The orchestrator
  does all of that after verifying.
- Accept a worker's "done" without the delta check and re-running its verification.
- Revert a file that was dirty before the worker started.
