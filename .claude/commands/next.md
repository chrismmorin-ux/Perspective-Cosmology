---
name: next
description: "Compose and execute sprint-based work — batches of prioritized items approved as a unit"
user-invocable: true
---

# /next — Sprint-Based Work

Composes a sprint (coherent batch, approved once) and executes it. The ADR-037 Phase 2 CLI quartet (cwos-next + cwos-pulse + cwos-audit + cwos-token-budget) does the deterministic work; this skeleton orchestrates the human-in-the-loop approval. **Why these formulas:** `docs/guides/next-command-pedagogy.md`.

## Output Shape

**Sprint arc:** `<active | proposed | resuming | picked-up>` — `<one-clause status>`.
`<Delta line: what this invocation did — composed a new sprint, resumed an active one, picked up a pooled sprint, or executed N items.>`
`<Remainder: the Items table — # / Title / Mode / Effort / Decisions Needed — never prose-only.>`
`<Parallel line (ADR-067), whenever gate reported a non-empty sprint_pool or compose offered parallel_batches: "Parallel: N pooled sprint(s) ready — another terminal running /next picks one up." Capacity nobody surfaces does not exist for the founder; this line is mandatory when the data is non-empty.>`

### Why this sprint?
`<Value-rationale: program_focus, context boost, dependency cluster, fleet-rotation. Reference repo_goal, an invariant, or a finding ID. If no token applies: "(No captured repo goal yet — Value falls back to operational context.)">`

**Do next:** Numbered options — `1. Approve` / `2. Tighten the plan` / `3. Adjust manually`.

## Step 1: Gate

```bash
node kit/scripts/cwos-next.js gate
```

Exits 0 (clean), 1 (blocked), 2 (invalid arg). JSON output. If `result.active_sprint` is non-null, jump to **Step 6** and resume — **unless `active_sprint.stale` is true** (WS-529: approved, zero items done, older than 7 days). A stale sprint never resumes silently: surface *"Resuming SPR-N — approved `age_days`d ago with zero progress"* and offer **1. Resume** (Step 6 as normal) / **2. Abandon and compose fresh** (cancel per Step 7 — sprint → abandoned, pending items → backlog — then continue to Step 2). This is what keeps a fossil sprint from permanently answering "what's next": 14 of them once stacked up invisibly behind exactly this resume path. If `result.blocked` is true, surface `result.sprint_blocks[]` + `result.drift_items[]` + `result.token_budget.note` verbatim and stop. **Exception — `checkout-shared-with-live-session` self-resolves (founder mandate, 2026-09-01, via melody-hill):** do NOT stop to ask. Taking a worktree is the session's own decision: run `node kit/scripts/cwos-git.js worktree create <topic>`, do ALL subsequent code work in the new tree, re-run the gate from inside it, and continue the flow — telling the founder in one line: *"N live sessions share this checkout — took worktree wt-<topic> and continued."* Stop on this block only if worktree creation itself fails, or the founder has already claimed this tree in the conversation (then the Step 7 escape valve is theirs to invoke). Stopping to ask permission for the worktree is the failure mode this exception exists to end — the founder cannot adjudicate tree ownership faster than the session can make the question moot. Block entries carry a `reason:` discriminator — `first-run-required` (WS-365: an active/critical block_sprint:true program has never been run; surface the `hint:` and direct the founder to `/pulse run <program> <protocol>`) or no reason field (stale protocol from cadence check). Founder may unblock a token-budget block via `--override-token-budget "<rationale ≥20 chars>"` (Step 7).

**Phantom sprints (WS-568).** `result.phantom_sprints[]` is the COMPLETE set of sprints that still look resumable (`approved`/`active`, no `completed_at`) but have no work left — every item they name is already closed in the queue, usually shipped under a later sprint. Each entry carries `id`, `title`, `status`, `item_count`, `items_closed`, `approved_at`, `age_days`, `evidence` (`queue` = item ids resolved against the queue; `counts` = index-only record) and `reason: all_items_closed`; the list is newest first. `active_sprint.phantom` says whether the sprint you are about to resume is one of them. Detection only — gate closes nothing.

If the list is non-empty, surface it as ONE batch and close it in ONE action, never one per invocation: *"3 sprints are empty shells — SPR-028, SPR-026, SPR-019 (all items already done). Close all three?"* On approval run `node kit/scripts/cwos-next.js done --sprint SPR-NNN` for each, then continue. This is pure bookkeeping — expect zero `item_closed` events — and it is idempotent, so a repeat is harmless. If `active_sprint.phantom` is true, do NOT resume it: close it with the rest and continue to Step 2. `paused` sprints never appear here; they are parked on purpose. Before this, gate returned one resumable sprint and exited, so three phantoms cost three round trips of gate → done → gate to walk down (ServeYourNote, 2026-08-02).

**Dispatch pool (ADR-067).** `result.sprint_pool[]` is every open sprint awaiting pickup — `dispatch: pooled` (deliberately unclaimed at approval) plus `orphaned: true` entries (claimed sprints whose session died). Sprints are owner-scoped now: `active_sprint` is only ever THIS session's sprint or a legacy (pre-ADR-067) sprint, so a peer's open sprint no longer stops composition. Render the pool on EVERY invocation it is non-empty:

- If this session has its own `active_sprint`, one line: *"Parallel: N pooled sprint(s) ready — another terminal running /next picks one up."*
- If this session has NO active sprint and the pool is non-empty, offer pickup FIRST, before composing: *"SPR-NNN is pooled and ready (K items): pick it up, or compose fresh?"* On pickup, run `node kit/scripts/cwos-next.js gate --pickup` — it leases the top pooled sprint to this session, claims its items, emits `sprint_claimed`, and returns it as `result.active_sprint` with `result.pickup` naming what was claimed; then jump to **Step 6**. `pickup.items_unclaimed` non-empty = say so (another session raced us to those items).
- Any entry with `stale_pool: true` (older than 2 days, unpicked) gets surfaced for a decision, same shape as a stale sprint: *"SPR-NNN has waited in the pool Nd — release it back to backlog?"* Release = cancel per Step 7 (sprint → abandoned, items → backlog).
- A second session working the same repo should take its own tree for code: `node kit/scripts/cwos-git.js worktree create <topic>` (code in the worktree, workstream state in the main tree — `docs/worktree-isolation.md`).

**Concurrency conditioning (WS-564).** `result.session` carries `claim_conflicts` together with the state that produced it: `conflicts_conditioning` (`known` | `unknown`), `registry: {ok, reason}`, `live_sessions[]`, `stale_active[]`. An empty `claim_conflicts` means two opposite things and you must say which:

ADR-067 changed what a conflict DOES: composition now routes around held items (the shared eligibility filter excludes them from candidates and compose), so `claimed-by-other-session` entries in `sprint_blocks[]` arrive with `advisory: true` and no longer block. Report them as information — *"WS-301 is held by ses-… (routed around)"* — never as a stop.

- `conflicts_conditioning: "known"` — report it plainly, naming live peers if any: *"No conflicts. 2 other sessions live (ses-… holds WS-301)."*
- `conflicts_conditioning: "unknown"` — do NOT say "no conflicts". Say liveness could not be determined, quote `registry.reason`, and surface the `claim-conflicts-unknown` block entry. This is the state that let a session claim WS-312 and have the claim expire under it 90 minutes later while it was still working.

Always surface `stale_active[]` when non-empty — records that say active but stopped heartbeating are what makes every concurrency signal unusable in both directions. One line: *"N stale session records hold claims — clear with `node kit/scripts/cwos-session-recovery.js --auto`."*

**Cross-branch drift (WS-694).** A `drift_items[]` entry with `kind: item_closed_on_unmerged_ref` means the item was closed by an event that exists **in git but not in this working tree's event log** — the closure lives on a ref not merged into HEAD. This blocks, and is deliberately NOT auto-healed: an unmerged branch is not authority to close an item. Surface the entry with its `ref`, and offer merging that ref or reopening the item. Only repos that TRACK `.claude/workstream/events/` can hit this — there the log forks with the branch, which is how ServeYourNote's `/next` came to compose SPR-034 out of eight items where five were already shipped while the healer reported `drift_detected: false`. If the founder judges the ref is junk, the escape valve is `gate --override-cross-branch-drift "<rationale ≥20 chars>"` (logs `cross_branch_drift_acknowledged`); it waives the block for that invocation and does **not** close anything. A companion `[event-log-tracked]` warning names the underlying condition — advisory only, since whether to track the log is each repo's own call.

If `result.drift_auto_reconciled` is non-empty (advisory; never blocks), surface a one-line summary before continuing — e.g., `Auto-reconciled 1 item: WS-XXX (closed by event ev-...)`. Per ADR-045, drift between the canonical event log and queue YAMLs is healed inline; the founder gets visibility, not a stop.

**Sweep freshness — the stale branch outranks every other (WS-809).** All four
digests below carry `stale`, `cadence_minutes` and `stale_after_hours` alongside
`swept_at` and `age_hours`. `stale` has THREE values and each gets its own render:

| `stale` | Meaning | Render |
|---|---|---|
| `null` | `swept_at` is missing or unparseable | the per-digest **age UNKNOWN** line below |
| `false` | swept within `stale_after_hours` | the normal empty/non-empty lines below |
| `true` | **the sweep has stopped** | the SWEEP IS DOWN form, described here |

When `stale` is true, that branch is taken FIRST — before empty/non-empty, before
`repos_errored` or `gaps` — so a dead sweep can never fall through to a quiet
line. The form, for every lane:

> `<Lane>: SWEEP IS DOWN — last swept <age_hours>h ago, cadence is <cadence_minutes> min. Contents below are <age> stale and cannot be trusted. Check Fleet-SessionSweep on the node that runs it.`

then render the lane's usual contents anyway, each suffixed `— as of <age> ago`
so nobody reads them as current. Say the age AND the cadence: the gap between
them is the whole finding.

**Why this branch exists.** Fleet-SessionSweep is the 15-minute task that drains
all four lanes, and it lived on exactly one node. When the G16 shipped to Dell on
2026-09-02 the sweep left with it, and for six days every session read
`Maintenance: clean, last swept 144h ago.` — a calm, well-formed sentence with
nineteen findings, seven of them high, sitting unswept behind the word "clean".
The age was always in the digest. Nothing judged it. If any lane reads SWEEP IS
DOWN, treat every other lane's contents as equally suspect and say so once.

**Friction digest (WS-579).** `result.friction_digest` is null in adopted repos — render nothing. When non-null (the hub), render it EVERY invocation, including a sprint resume, and ALWAYS with its age — never contents without freshness (an empty digest and a dead drainer are otherwise indistinguishable):

- `stale: true`: the SWEEP IS DOWN form above, then the component lines suffixed `— as of Xh ago`.
- Non-empty: `Friction: N events, M components, last drained Xh ago` plus one line per `recurring: true` component: `<component> — E events, R repos, high, oldest Dd` .
- Empty inbox: `Friction: nothing new, last drained Xh ago.`
- `swept_at` null: `Friction: inbox present but sweep age UNKNOWN — check the Fleet-SessionSweep task.` (This is the loud state, not the quiet one.)
- `repos_errored > 0`: append ` (digest conditioned: K repo(s) failed to scan)`.

The digest NEVER blocks (founder decision, WS-567 synthesis §6.2) — it is one line of visibility, not a gate.

**Request digest (WS-699).** `result.request_digest` is null in adopted repos — render nothing. When non-null (the hub), render it EVERY invocation, including a sprint resume, and ALWAYS with age:

- `stale: true`: the SWEEP IS DOWN form above — and say plainly that the day counts below are floors, since nothing has been collected since the sweep stopped.
- Non-empty: `Requests: N open from M repo(s), last swept Xh ago` plus one line per `repos[]` entry, oldest first: `<repo> — K open, oldest Dd, <categories>`.
- Empty: `Requests: none open, last swept Xh ago.`
- `swept_at` null: `Requests: inbox present but sweep age UNKNOWN — check the Fleet-SessionSweep task.` (The loud state.)

These are peer repos waiting on an answer from HomeBase, carried by the courier's return leg. **Lead with the oldest, and say the number of days out loud** — the failure this lane exists to end is a repo waiting 101 days while nothing rendered the fact that it was waiting. Advisory; never blocks.

**Divergence digest (WS-814).** `result.divergence_digest` is null in adopted repos — render nothing. When non-null (the hub), render it EVERY invocation, including a sprint resume, and ALWAYS with age:

- `stale: true`: the SWEEP IS DOWN form above, then the `top[]` lines suffixed `— as of Xh ago`.
- Non-empty: `Divergence: N file(s) across M repo(s) changed from the kit, last swept Xh ago` plus one line per `top[]` entry, largest first: `<repo>/<file> +K lines — their <WS-ids>`.
- Empty: `Divergence: no repo has changed a kit file, last swept Xh ago.`
- `swept_at` null: `Divergence: lane present but sweep age UNKNOWN — check the Fleet-SessionSweep task.` (The loud state.)
- `errors > 0`: append ` (K repo(s) could not be judged)`.

**Lead with `their_items` when present, and say the item id out loud.** A line reading "cwos-session-recovery.js +352 lines" is a curiosity; the same line reading "+352 lines — their WS-618" is a backport brief, because that id is where the diagnosis already lives. An entry with no item is still worth rendering — nobody having filed it is exactly as much of a problem — but say `no item names it` rather than leaving the field blank.

**This never blocks.** A diverged repo is a standing condition, not a new event: it will still be diverged tomorrow, and a gate that stopped on it would stop forever. Advisory, one line, same as friction and maintenance.

**Why the lane exists.** HomeBase had three courier lanes and every one carried telemetry UP — friction, requests, maintenance. None carried a fix BACK. Claude-Poker-Tracker diagnosed and fixed two real defects in HomeBase's own kit and wrote, on 2026-08-21, "The fix belongs upstream and should land in HomeBase, then flow back." It did not, for eighteen days, because there was nowhere to put it. The friction lane DID fire on one of them and delivered "Recurring friction: cwos-session-recovery — 2 event(s) across 2 repo(s)" — the signal, without the answer. From the hub a recurrence stub and a solved problem look identical, which is what this line is for.


**Maintenance digest (ADR-066).** `result.maintenance_digest` is null in adopted repos — render nothing. When non-null (the hub), render one line EVERY invocation, always with age:

- `stale: true`: the SWEEP IS DOWN form above. **This is the lane the branch was built for** — never render `clean` when the sweep is down; a zero here means nothing was looked at, not that nothing is wrong.
- `Maintenance: N finding(s) (X high+), last swept Yh ago` — plus one line per `top[]` entry: `[severity] <node>/<surface>: <title>`.
- Zero open findings: `Maintenance: clean, last swept Yh ago.`
- `swept_at` null: `Maintenance: sweep age UNKNOWN — check the Fleet-SessionSweep task's third action.` (The loud state — an empty findings list and a dead sweep must never render identically.)
- `gaps > 0`: append ` (K source(s) could not be checked)` — a sweep that failed to check something must never read as clean.

Same contract as the friction digest: advisory, never blocks.

## Step 2: Candidates

```bash
node kit/scripts/cwos-next.js candidates --limit 30
```

Returns ranked JSON `{saturated_classes, last_anchor_classes, candidates: [...]}`. Source-class damping + soft-block damping applied inline. No AI judgment in the read path.

## Step 2b: Engine-promoted items pending approval (WS-489)

Scan `.claude/workstream/queue/WS-*.yaml` for a top-level `review: pending` line (`grep -l "^review: " …` — the field is NOT mirrored to state/queue.json, so this is a legitimate file read, exempt from Prohibited Reads). If any exist, surface them BEFORE the sprint preview as one batch:

```
Engine findings awaiting your yes/no (from <engine> <run-id>):
  - WS-NNN [critical, 70] <title> — from FIND-NNN
  - WS-NNN [high, 55] <title> — from FIND-NNN
Keep all / dismiss some / decide per item?
```

One word per item, no re-scoping. **Keep** = remove the `review: pending` line from the WS YAML (it becomes a normal backlog candidate). **Dismiss** = set `status: dismissed` and remove the `review:` line. **For a friction-recurrence item (`source.command: friction-sweep`), the dismiss IS a decline (WS-581):** ask the founder for a one-clause reason, then decline the component through the fleet-hub friction sweep — that delivers `friction_declined` to the originating repos and stops the component re-promoting. A dismissal without the decline resurrects every 15 minutes. **For a repo-request item (`source.command: request-sweep`, WS-699), the dismiss is likewise a decline:** these arrive from a peer repo through the courier's return leg, so ask for the one-clause reason and decline it — that delivers `request_declined` into the asking repo's own event log and ledgers the hash so the sweep stops re-promoting it. The reason text is the entire difference between a no and being ignored, which is the failure this lane exists to end; in HomeBase the decline is `cwos-friction-sweep --decline-request <hash|repo> --reason "<reason>"`. Closing such an item normally (rather than dismissing) delivers `request_accepted` on its own via `lib/item-closure.js` — no extra step. **Both decline branches are fleet-hub only:** the sweep promotes recurrence items into HomeBase (`applyRecurrence(homeBase, …)`), so no adopted repo can hold one, and the declining script is deliberately not shipped — adopted repos only ever WRITE friction, via `cwos-capture`. In HomeBase, the decline is `cwos-friction-sweep --decline-component <component> --reason "<reason>"` (WS-639: naming the full `node kit/scripts/…` invocation here would make a shipping command instruct an adopter to run a script it does not have — the exact class INV-073 gates). The reconcile pass inside this command's normal flow emits the T6 events that re-materialize state. Ranking note if asked why a kept critical item ranks below expectations: engine-promoted items carry `source.engine`, classify as `engine-finding`, and take the 0.7× saturation damping when that class anchored 2 of the last 3 sprints — deliberate anti-flood, not a bug. If no `review: pending` items exist, skip this step silently.

## Step 3: Compose

```bash
node kit/scripts/cwos-next.js compose --human
```

The `--human` output IS the sprint preview — render as-is, don't rewrite. Includes items table, decisions needed, composition_notes (anchor + damping fires + fleet-rotation override), inline anti-goal cross-check, Decision #8 footer verbatim. Soft-blocked candidates appear as:

```
Deferred (unmet prereq):
  - WS-NNN (was P=X, soft-blocked → Y): <note text>
```

## Step 4: Approval

When compose's output contains a non-empty `parallel_batches` (the `--human` render shows a **Parallel capacity** section), the pool approval IS option 1 — an opt-in flag the founder never sees changes nothing (ADR-067):

```
Options:
  1. Approve including parallel batches — this session starts the sprint; N more sprint(s)
     go to the pool. Open another terminal and run /next to put a second session on one.
  2. Approve this session's sprint only
  3. Tighten the plan before starting (~2 min)
  4. Adjust manually or pick a different focus
  [5. Approve with EXEMPTION — only shown when Step 4a found matches]
```

With no parallel batches, the options keep their classic shape:

```
Options:
  1. Approve (yes)
  2. Tighten the plan before starting (~2 min)
  3. Adjust manually or pick a different focus
  [4. Approve with EXEMPTION — only shown when Step 4a found matches]
```

If the anti-goal cross-check (rendered by `compose --human`) surfaced matches, option 4 MUST appear verbatim:

```
4. Approve with EXEMPTION — accept the constitutional risk; founder provides a reason that gets recorded in the sprint YAML
```

If founder picks option 4, prompt for the exemption reason (free text, **≥ 20 characters** — the script refuses shorter). Pass it to Step 5's approve alongside `--sprint-file`: `cwos-next.js approve --sprint-file <path> --exemption-reason "<text>"`. That sets `anti_goal_check.status: exempted` and writes `exemption_reason` into the sprint YAML. The flag is only accepted when the cross-check actually found matches. INV-038 verifies post-WS-227 sprints stay accountable.

If option 2 (tighten): route to `decision-enhance` (if any item has `decision_flags`) or `sprint-enhance`. If any sprint item is plan-first, also offer any engine returned by `node kit/scripts/core/cwos-choice-point.js plan_doc` as a corrective-pass option on that item's plan once it exists (WS-479 surfacing; empty output = no offer). Re-present the refined sprint here. If option 3 (adjust): ask what to change, recompose.

## Step 5: Approve

```bash
node kit/scripts/cwos-next.js approve --sprint-file <compose-output.json> [--with-pool]
```

Writes sprint YAML, updates indexes, claims items, emits `sprint_approved` event with two-field provenance per ALTERATION-5: `{authorized_by: "founder" | "ai-autonomous", composed_by: "cli-deterministic"}`.

`--with-pool` (Step 4 option 1, ADR-067): also mints each composed parallel batch as its own `dispatch: pooled` sprint — deliberately unclaimed, awaiting any session's `gate --pickup` — one `sprint_approved` event each with `dispatch: pooled`. The result's `pooled: [SPR-…]` names them; close the approval message with the two-keystroke instruction: *"Open another terminal, run /next — it offers SPR-NNN for pickup."* A batch whose own anti-goal pass matches is SKIPPED with a stderr note (the exemption conversation belongs to a primary approval, not to pool minting).

## Step 6: Execute (per item)

For each item in order, announce: `--- Item N of M: <title> [<mode label>] ---`.

**`mode: execute`** — make changes, run verification (tests + lint from vital signs). Pass → continue with one-line completion note. Fail → offer Fix / Skip / Stop.

**`mode: plan-first`** — call `EnterPlanMode`, design with item's `decision_flags` called out, ask founder for decisions on each. On approval, `ExitPlanMode` and execute. If the plan-surface hook is configured in this repo (PostToolUse, WS-479 — hooks are HomeBase-only until ADR-064 Stage 1 ships them via the plugin), it fires on ExitPlanMode approval: relay its choice-point offer to the founder verbatim rather than swallowing it, since the logged offer is the surfacing event. If no such offer appears, proceed — its absence is not a failure. Same completion/failure flow.

After all items done:

```bash
node kit/scripts/cwos-next.js done --sprint SPR-NNN
```

Per ADR-045 / DEC-034: writes `status: done` + `completed_at` + `completion_commit` + `closed_by_event` to each non-skipped queue YAML, emits one `item_closed` event per item on track `T6:workstream` (so the workstream + sprints reducers re-materialize state/*.json), then emits `sprint_completed` on `T6:workstream-rebalance`. Idempotent — re-running emits zero new events for already-closed items. Then recomputes program health via the canonical formula and runs `cwos-reconcile.js --quiet`.

WS-310 Phase C: any closing item with a `finding_id: FIND-NNN` field also triggers an inline auto-resolved write — appends a `useful / auto-resolved` entry to the calibration feedback log (`findings-feedback.yaml`), refreshes the content_hash via `cwos-findings-feedback-validate.js --update`, and appends a `was_real` entry to `finding-lifecycle.yaml`. The directory for both is resolved per repo scope by `lib/auto-resolved.js` via `resolveEvolutionDir` (the HomeBase evolution apparatus dir, or `.claude/workstream/` in adopted repos). Failures here are surfaced as warnings only; they never block `item_closed` or `sprint_completed`.

## Step 7: Edge cases

| Situation | What to do |
|-----------|------------|
| Session ends mid-sprint | Sprint stays `active`; gate detects it on next `/next` and resumes Step 6 |
| Founder wants a second session on the queue | Open another terminal, run `/next` — with a pool it offers pickup; without one it composes independent work (claimed items are routed around). Code work in the second session takes a worktree: `cwos-git.js worktree create <topic>` |
| Session dies holding a picked-up sprint | Its sprint reappears in `sprint_pool` as `orphaned: true` once liveness lapses; any session's `gate --pickup` adopts it (item leases transfer via steal-if-stale) |
| Pooled sprint unpicked > 2 days (`stale_pool: true`) | Offer "release back to backlog" — cancel per this table's cancel row |
| Checkout-shared hazard blocks and the peer is truly this founder's own other window | `node kit/scripts/cwos-next.js gate --override-checkout-shared "<rationale ≥20 chars>"` (logs `checkout_shared_acknowledged`) |
| User says "skip [item]" | Sprint item → `skipped`; queue item → released to `backlog` |
| User says "cancel sprint" | Sprint → `abandoned`; pending items → `backlog` (done items stay done) |
| User says "just one item" | Present top 3 candidates from `candidates` output, user picks one |
| ≥5 execute-only items | Tip: "Run `/autopilot Nh` for unattended execution" |
| Queue empty after gate | "All programs at target health. To push further: `/pulse escalate <prog> critical`, `/engine product-ideation`" |
| No sprint-index.yaml | Create empty file, proceed (backward compat) |
| Cross-branch drift blocks (`item_closed_on_unmerged_ref`) | Merge the ref that holds the closure, or reopen the item. If that ref is abandoned: `node kit/scripts/cwos-next.js gate --override-cross-branch-drift "<rationale ≥20 chars>"` — waives the block for this invocation only and closes nothing (logs `cross_branch_drift_acknowledged`) |
| Token-budget block fires | `node kit/scripts/cwos-next.js gate --override-token-budget "<rationale ≥20 chars>"` (logs `budget_regression_acknowledged` event) |
| `approve: sprint file is stale` error | Re-run `cwos-next.js compose` to atomically refresh `.claude/.tmp-sprint.json`, then retry approve. For recovery cases (approving an older composition deliberately), pass `--force-stale` — emits a `force_stale_approve` event for audit. Default freshness window: 5 min; env-tunable via `CWOS_NEXT_FRESHNESS_MS`. |
| `approve: sprint includes already-done items` error | Recompose to refresh the candidate ranking; `cwos-next.js compose` reads current `state/queue.json` so done items won't reappear. `--force-stale` also bypasses this check (same event marker). |

## Prohibited Reads

After gate + candidates + compose complete, the AI MUST NOT re-read these (the CLI envelope captured them): `.claude/workstream/queue-index.yaml`, `.claude/workstream/sprint-index.yaml`, `.claude/workstream/queue/WS-*.yaml` (except items being executed in Step 6), `.claude/workstream/findings-index.yaml`, `.cwos-config.yaml`, `system/context.md`. Re-reads defeat ADR-037's token-savings goal; future INV-cli-envelope-consumed-completely (WS-271) routes violations to prog-kit-quality.

## CLI-absent fallback

If `kit/scripts/cwos-next.js` is missing (older kit): "cwos-next.js not found — run `/fleet-update` to install the CWOS CLI quartet. Inline algorithm details: `docs/guides/next-command-pedagogy.md`."

## Shadow-event envelope

`node kit/scripts/cwos-event.js append command_completed --track T10:compose-sprint --tag /next --payload '{"command":"/next"}'` — non-fatal; never gate output on it.
