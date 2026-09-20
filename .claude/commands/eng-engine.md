---
name: eng-engine
description: "Multi-persona engineering roundtable — 6 expert agents perform adversarial technical audit with cross-critique and facilitated synthesis"
procedure: agent-dispatch
extends: context-gather
user-invocable: false
default_mode: decide
model_tiers:
  expert: sonnet        # Phase 1 parallel research scans — detection parity with Opus (BM-004)
  cross_critic: opus    # Phase 2 — highest-leverage phase (floor: sonnet)
  synthesis: opus       # Phase 3 facilitator/briefing (floor: sonnet, never haiku)
failed_states_seed:
  - "Compliance over value"
  - "Self-aggrandizing complexity"
---

# Engineering Roundtable

You are orchestrating a multi-expert engineering panel. This is NOT brainstorming — it is rigorous, adversarial, systems-level analysis.

## Focus Area

$ARGUMENTS

If no argument given, default to "full" (entire codebase).

---

## Intent Contract (ADR-038)

Before research, read the contract from the loaded envelope. **Read pattern (specified to satisfy INV-cli-envelope-consumed-completely):** the `cwos-frame.js confirm` step of `/engine` (Step 3) already produced the envelope — a JSON object carrying `contract_id`, `event_id`, and the full `contract` (`mode`, `readiness`, `success_shape`, `scope_ceiling`, `stretch`, and `failed_states_seed` when present). **Read those fields directly from that confirm output — do NOT scan the event log for them** (the scan re-derives data you were already handed; on a long-lived repo it is the single largest token cost of the run). Do NOT re-read `system/` files, `engines/registry.yaml`, or other engine MD files — the envelope is the source of truth.

**Fallback only** (confirm envelope genuinely absent — e.g. a `--retry` resume or a pre-ADR-038 kit): scan `.claude/workstream/events/*.jsonl` for the `engine_intent_recorded` event, but bounded: take only the **newest 7 day-files** (filenames are `YYYY-MM-DD.jsonl`, sorted descending), parse each line as JSON, filter `payload.type === 'engine_intent_recorded'`, match `payload.engine === 'eng-engine'` AND `payload.target === <target>`, and **early-exit on the first match** within the 5-minute look-back window. Never scan archived chunks under `events/archive/`.

The contract carries five fields the engine MUST honor:

- **`mode`** — output shape. Frontmatter declares `default_mode: decide` so cwos-frame.js can pre-fill. Specializations:
  - `decide` (default): adversarial audit + ranked findings + RICE scoring + ranked weak points (the standard six-phase output below).
  - `build-best`: commit to one direction; the Synthesis phase produces concrete remediation work items in the briefing instead of a comparison table; rank by sequencing not severity.
  - `mockup`: low-fidelity sketch of recommended architecture; skip RICE scoring; skip work-item creation; produce ASCII/diagrammed structure only.
  - `explore`: surface adjacent improvements + non-obvious feedback loops; do not prioritize; emphasize Phase 2 cross-critic's "Missing dimension" + "Shared blind spot" outputs.
- **`stretch`** — when `true`, the experts AND the cross-critic question the AS-N tags + constraints already loaded in the envelope; surface where current state is load-bearing vs. inertial; treat `system/intention.md` Failed States as falsifiables, not fixed targets. When `false` (default), honor loaded state and apply it. **Stretch MUST NOT re-read `system/` files** — INV-cli-envelope-consumed-completely applies; question what's already in the envelope.
- **`success_shape`** — the structured target the briefing phase MUST honor. The Briefing's `Contract Alignment` block reports which `success_shape` items were hit vs. departed-from with reason.
- **`scope_ceiling`** — items listed here are out-of-bounds. Do not spend cycles on them; the briefing's `Contract Alignment` block reports compliance.
- **`failed_states_seed`** (WS-296 / FIND-129) — Failed-State excerpts injected from `system/intention.md` at compose time so the cross-critic can run its constitutional check without re-reading `system/`. Shape: `{ section_hash, source_path, states: [{name, content, position_at_compose, content_hash}] }`. Matched BY NAME (not index) so renumbering doesn't silently rewire the prompt. The `section_hash` lets the cross-critic detect that the source moved between compose and consumption (refresh required).

---

## Additional Context

After the base context gather, also read:

1. `system/failures.md` — known failure modes (check for recurrence)
2. `.claude/workstream/queue/` — scan for existing work items (avoid duplicates)
3. Run `git diff --stat HEAD~5` — recent change surface area

4. **Allocate `run_id` atomically** via the deterministic CLI (WS-311 AC e — never compute from prose; concurrent runs collide):

   ```bash
   node kit/scripts/cwos-engine-manifest.js allocate-run-id
   # → { "ok": true, "run_id": "run-018", ... }
   ```

5. Set `run_workspace` = `.claude/workstream/runs/<run_id>/artifacts/` (using the `run_id` returned by the allocator)
6. Create phase directories: `run_workspace/phase-1/`, `run_workspace/phase-2/`, `run_workspace/phase-3/`

---

## Agents

Launch ALL 6 expert agents in parallel. Each agent has its own persona definition in `.claude/agents/`.

Briefing discipline (R1, see `engines/base/context-gather.md`): each fork is a separate API call with no shared cache, so the dispatch prompt is **paths + a tight question + an output shape** — no conversational re-orientation. You loaded `system/` once in Phase 0; do not re-paste it into the briefing. Where a fork needs a specific invariant or decision, cite the **ID** (the agent def greps the catalog for it rather than re-reading the full file). The cross-critic block below is the R3 exception — its verbosity is load-bearing and stays verbatim.

For each agent, pass this briefing in the prompt:

> **Focus area:** [the focus area from arguments or "full"]
>
> Read the context files listed in your agent definition (lens-scoped — do not re-read the full `system/` set), then analyze the focus area through your expert lens. Produce your structured output (Key Concerns, Hidden Risks, Likely Missing Elements, Dangerous Assumptions). Be specific — reference file paths and line numbers. Do NOT propose solutions yet.

The 6 agents to launch:

1. **architect** — architecture, invariants, coupling, module boundaries
2. **senior-engineer** — implementation quality, maintainability, testing, DX
3. **failure-engineer** — failure modes, edge cases, cascading failures, data corruption
4. **performance-engineer** — latency, throughput, resource usage, scalability
5. **security-engineer** — attack surface, trust boundaries, data protection
6. **product-ux** — user experience, accessibility, usability, consistency

---

## Cross-Critique

The cross-critique is the highest-leverage quality lever in this engine — `project_engine_benchmarks` measured a +0.98 quality lift "for free." But cross-critic prompts that are too generic flatline into formulaic boilerplate; the same six bullets get rephrased per run instead of producing genuine adversarial pressure (FAIL-014). The block below is intentionally structured + seeded with blind context to force divergence.

> You are the Cross-Critic. You have received independent analyses from the expert agents listed below. **Your output must be adversarial, not aggregating.** If your output reads like a summary of the expert findings, you've failed.
>
> **Mandatory checklist** — your response must address each of the following explicitly. If a section is genuinely empty, write "None — verified by [reasoning]." Do not omit a section.
>
> 1. **Wrongness audit.** For each expert, name ≥1 specific claim that is wrong, weakly-supported, or unjustified. Cite file path + line. If you can't find one for an expert, that expert was either right OR you didn't read carefully — assume the latter unless you can demonstrate otherwise.
> 2. **Missing dimension.** Identify ≥1 dimension that no expert examined. Examples of dimensions experts often skip: time-to-detect (not just severity), cost-of-being-wrong (not just probability), recovery cost (not just failure cost), founder cognitive load (not just code complexity), drift over time (not just current state). Frame the dimension you bring as one that *must* be addressed for the audit to be complete.
> 3. **Severity recalibration.** Find ≥1 finding where two experts implicitly disagreed on severity. Force the disagreement explicit: "X rated this high; Y rated the same surface medium. The right answer is [pick] because [evidence]."
> 4. **Shared blind spot.** What did *all* experts miss? This is the question with the highest expected value. Common shared blind spots in this codebase: failure modes that span multiple personas' boundaries; assumptions about how the founder will use the output; non-obvious feedback loops (e.g. an engine that improves the system in a way that makes future runs harder).
> 5. **Alteration mandate.** You must alter ≥10% of the findings: at least one finding modified (severity / scope / wording), one removed (duplicate / wrong), one added (the missing dimension you named in #2). If the input has 8 findings, that's at minimum 1 modified + 1 removed + 1 added. Document each alteration as a separate diff entry.
> 6. **Blind-context seed.** Address the constitutional anchors the experts did NOT see: read `contract.failed_states_seed.states` from the loaded `engine_intent_recorded` event payload (compose-time injection per WS-296 / FIND-129 — do NOT re-read `system/intention.md`; INV-cli-envelope-consumed-completely applies). Each entry has `{name, content, position_at_compose, content_hash}`. For each finding the experts produced, ask: "If this finding gets resolved, does it move the system toward any of these Failed States, or away from them?" Surface any finding that, while technically correct, would push the system toward `Self-aggrandizing complexity`. Mark these `direction: away-from-goal` in the alteration diff. **Integrity check:** if `failed_states_seed` is absent or `section_hash` is missing, treat as a contract violation — flag in alteration diff and proceed without the constitutional check rather than re-reading `system/`.
>
> Be ruthless. The value is in the spaces BETWEEN their analyses, and in the constitutional check the experts didn't run. The synthesis phase reads your output and trusts it — if you boilerplate, the entire run flatlines.

---

## Synthesis

> Here are the expert analyses and the cross-critique results (read from run artifacts). Perform synthesis:
>
> Phase 3: Consensus areas, key disagreements, unknowns, ranked weak points, forced resolution of all disagreements.
>
> Phase 4: Top risks, structural improvements, work item proposals (YAML format for workstream queue), system model updates, state update recommendations.
>
> De-duplicate against existing queue items using `.claude/workstream/queue-index.yaml`.
> Dedup key algorithm: lowercase kebab-case of `{engine}-{category}-{file-path}-{line-range}`.
>
> Every work item must include: title, type, priority_score (RICE), category, program, description, accept_criteria, effort, files_involved.
>
> **WS-id allocation (WS-040):** allocate every new work item's id via `node kit/scripts/cwos-next.js allocate-ws-id` — call it once per id, in order. Do NOT compute the next id by eyeballing the active-queue max: that scan misses `queue/archive/` and re-issues retired ids, which lets reconcile force-complete the new item (the SPR-018 / WS-033 incident). The CLI scans queue + archive + index.
>
> Additionally, look for patterns across findings that suggest structural responses rather than individual fixes. When you see 3+ findings clustering around a theme, propose a strategy recommendation (new program, engine, invariant, or architecture change) instead of — or in addition to — individual work items. Include the list of finding IDs that support each recommendation.
>
> **Blindspot tagging:** Set `blindspot: true` on any finding generated during a `blind_spot`, `meta-engine`, or `challenge` protocol, OR whenever the finding represents a structural gap that normal checks by definition would miss. Blindspot findings bypass the per-run `finding_cap` (defined at `/engine` Step 5.5) so constitutional blind-spot protocols always surface their full set, even on noisy days.
>
> **Adopter-value gate (kit-quality runs only — WS-436 / INV-053):**
>
> The compose-time `failed_states_seed` injection (WS-296) gives the cross-critic the constitutional check. Synthesis applies the second pass: gate every candidate finding on adopter value before filing.
>
> 1. For each candidate finding, classify `adopter_value_relation`. The four legal values:
>    - **`yes`** — resolving this directly moves an adopter toward their goal (e.g. fixing a /adopt prompt the founder sees, a bug in an engine output adopters rely on).
>    - **`enables-yes`** — resolving this unblocks future adopter-value work (infrastructure, a fix that lets a `yes`-class finding be addressed, a regression-prevention guard for a founder-facing surface).
>    - **`no-but-mitigates-data-loss`** — defensive only; prevents data corruption / regression that would otherwise silently destroy adopter work.
>    - **`no`** — internal CWOS bookkeeping only (kit-internal audit, cosmetic refactors, drift cleanup with no adopter-touch path).
> 2. Pair the classification against the failed_states_seed direction tags loaded from the contract envelope. Findings tagged toward-failed-states (e.g. `Self-aggrandizing complexity`) get `adopter_value_relation: no` unless the synthesis briefing includes an explicit override rationale.
> 3. Findings with `adopter_value_relation: no` are filed with `status: blocked` and `blocked_by_note: "adopter-value gate"` — preserved for audit but NOT auto-promoted to the workstream queue. They never become WS-NNN items unless the founder explicitly unblocks them.
> 4. To override: include `adopter_value_override_rationale: <one sentence why this internal-only finding still merits queue resources>` on the finding YAML. Override surfaces in /pulse as a flagged event so drift is visible.
> 5. Every finding YAML filed by a kit-quality run MUST include `adopter_value_relation` and `detected_at`. `cwos-verify.js --only INV-053` enforces this on findings with `detected_at >= 2026-05-14`; pre-cutover findings are exempt (handled by the one-shot back-tag script).

---

## Protocol Reflection (Deep Runs Only)

**Activation:** This phase runs ONLY for deep protocol runs — `blind_spot`, `meta-engine`, or `challenge` protocols. Skip for `baseline`, `delta`, and `sweep`. This section is invoked by the agent-dispatch procedure's Phase 6d (Optimization Epilogue).

> You just completed a deep analysis run. Now step back and evaluate the PROCESS, not the product.
>
> Read the cross-critic's `shared_blind_spots` and `severity_recalibrations` from phase-2.
> Read the facilitator's findings from phase-3.
>
> Answer these questions:
>
> 1. **Prompt gaps:** Did any expert consistently miss a category of issue? What prompt addition would have caught it?
> 2. **Missing context:** Was external information (web research, user feedback, production data) manually injected that should be a standard protocol step?
> 3. **Severity calibration:** Did the cross-critic recalibrate 2+ findings in the same direction? What does that pattern say about the expert prompts?
> 4. **Structural blind spots:** Did all 6 experts share a blind spot? What does that reveal about the persona set — is a 7th persona needed, or do existing personas need broader scope?
> 5. **Protocol coverage:** Did the protocol's focus questions miss an important dimension? What question should be added?
>
> Produce a `protocol-feedback.yaml` artifact in `run_workspace/phase-3/` using the schema defined in `engines/standard/optimization-feedback.md`. Extract individual signals and write to `.claude/workstream/optimization-index.yaml`.
>
> **Rules:**
> - Only propose changes supported by evidence from THIS run — not speculation
> - Proposed prompt text must be specific enough to copy-paste into the engine or protocol definition
> - If no improvements are warranted, write `no_changes_needed: true` and explain why

---

## Finding Schema (required fields)

Every finding YAML emitted by this engine MUST include:

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `FIND-NNN` |
| `title` | string | Founder-readable one-liner |
| `engine` | string | The engine name (e.g., `eng-engine`) |
| `severity` | enum | `critical \| high \| medium \| low` (lowercase) |
| `status` | string | `open` at emission time |
| `adopter_detection` | enum | **REQUIRED** (INV-058 / WS-435). One of: `silent \| ai-visible \| founder-visible`. See [Detectability](#detectability) below. |
| `absence_evidence` | string | **REQUIRED when the finding asserts that something does not exist** (INV-088 / WS-701). Names the search that established the negative. See [Absence Claims](#absence-claims) below. |

Optional but recommended:

| Field | Type | Notes |
|-------|------|-------|
| `failure_mode_tags` | list | Subset of {`data-loss`, `trust-corruption`, `regression`, `ux-degradation`, `performance`, `security`}. Drives the silent-only severity escalation rule. |
| `created_at` | date | ISO date the finding was emitted |
| `program` | string | Program this finding rolls up to |

Validation: `node kit/scripts/cwos-finding-validate.js --all` (CI-friendly, exits 1 on any post-2026-05-15 INV-058 violation).

### Detectability

The `adopter_detection` field models whether a founder would actually see the failure if it fired in an adopted repo. Findings without this dimension systematically undercount the silent-only class — the failure mode that most damages founder trust (per `feedback_homebase_makes_repo_better`).

- `silent` — Failure mode is invisible to the founder. Only detectable from HomeBase by inspecting state files, evidence, or running diagnostics. The dangerous class: the founder believes the system is working until a downstream artifact surfaces months later.
- `ai-visible` — AI assistant sees the failure (crash, exception, error log) and will surface it conversationally, but the founder won't catch it without AI mediation.
- `founder-visible` — The founder directly observes the failure (UI error, missing artifact, broken feature) without needing AI to interpret.

### Absence Claims

**A grep that misses is indistinguishable from a grep that finds nothing.**

If your finding says a thing does not exist — no such config, nothing reads this
field, the file is absent, the handler is never called — then the finding is only
as good as the search behind it. State that search in `absence_evidence`:

```yaml
absence_evidence: |
  rg -n "application_fee_amount" across the whole repo, no path or glob filter.
  Positive control: the same search finds 14 hits for "transfer_data", so the
  instrument works and the term is genuinely unused.
```

Three things make it real evidence rather than paperwork:

1. **The command actually run** — not "I searched", but the invocation.
2. **Its scope** — a depth bound, a path filter, or a `--glob` is the whole
   question. On 2026-08-22 a `find -maxdepth 3` reported `engines/registry.yaml`
   ABSENT from a repo where it sat at depth 4, and the false claim reached a
   founder-facing envelope.
3. **A positive control** — search the same way for something you know is there.
   If the control comes back empty, the instrument is the problem, not the world.

Where a control is awkward, **check the outcome instead of the path**: does the
thing that would consume the missing artifact actually resolve? That is what
falsified the 2026-08-22 claim — the receiving session asked whether the 29
`skill_path` entries resolved, rather than re-running the search.

The detector reads your `title` and `description` for existence-negative
phrasing, so it is heuristic and it will occasionally misfire. The opt-out is one
line — `absence_claim: false` declares "this is not an existence claim" and
clears the gate. Use it freely; a false positive should cost a line, never a
build. Validation: `node kit/scripts/cwos-finding-validate.js --all`.

---

## Severity Map

| Internal Level | Founder Label | Criteria |
|----------------|---------------|----------|
| CRITICAL | **Fix before you ship** | Security vulnerability, data corruption risk, system down |
| HIGH | **Fix this week** | Significant bug, architectural violation, test gap in critical path |
| MEDIUM | **Worth improving** | Code quality issue, minor bug, maintainability concern |
| LOW | **Nice to have** | Style issue, minor improvement, documentation gap |

Use the "Founder Label" in all default output. The internal level is used for RICE scoring and work item classification only.

### Silent-Only Severity Escalation (REC-001)

When `adopter_detection == "silent"` AND `failure_mode_tags` contains either `data-loss` or `trust-corruption`, severity is automatically escalated by one tier (low → medium → high → critical, capped). The validator's `--apply-escalation` mode performs the rewrite and stamps `severity_escalated_from: <original>` for audit.

Rationale: a silent failure that corrupts data or erodes trust is structurally worse than a loud one — the founder loses ground without knowing. Escalating brings the tier in line with the actual blast radius.

---

## Briefing Template (Founder-Native Default)

```
## What I Found

### Launch Readiness: [SAFE / CAUTION / NOT SAFE]
[One sentence: can you ship today based on what I found?]
- SAFE: No critical or high-severity issues found
- CAUTION: High-severity issues found but manageable — not blocking launch
- NOT SAFE: Critical issues that must be fixed before shipping

### Detectability Summary
Findings by detectability: [N silent / N ai-visible / N founder-visible]
[If silent > 0]: "N findings would fire silently in an adopted repo — the founder would not see them without HomeBase inspection. See `--technical` for the list."
[If any escalated]: "N findings were severity-escalated under REC-001 (silent-only + data-loss/trust-corruption)."

### Top 3 Things That Matter
1. **[title]** — [one sentence: what's wrong and what it means for your users/business]
   Urgency: [Fix before you ship / Fix this week / Worth improving / Nice to have]

2. **[title]** — [one sentence]
   Urgency: [label]

3. **[title]** — [one sentence]
   Urgency: [label]

[If more findings exist: "Plus N more items added to your work queue — run /status to see them all."]
[If any findings are premature for current milestone: "Items marked * become relevant at M[N]"]

### What Needs Your Decision
[Only shown if any items need user input — in plain language, not technical jargon]

### What I Did
- Created N work items in your queue
- [Any system updates: invariants, failures recorded]

### Contract Alignment
- mode: <honored | departed (reason)>
- stretch: <honored | departed (reason)>
- success_shape: <honored — list which target items hit | departed (reason)>
- scope_ceiling: <PASS/PARTIAL/FAIL — {tokens_derived} of {ceiling} tokens ({ratio}%, source={artifact_size_proxy|command_telemetry_stamped}); items skipped: [list]>
                 <if data missing: BLOCKED — tokens_derived unavailable for this run>

> Source the scope_ceiling line from the `engine_contract_verified` event for this run (read; do not re-derive). WS-309 stamps `tokens_derived` on `engine_run_completed`; the verifier emits the verdict.

### What To Do Next
[Single action, framed as outcome: "Fix the auth bug so users can log in reliably" not "Address WS-042"]

### Was this useful?

Reply **yes**, **no**, or **some** (and list which findings seemed off — paste `FIND-NNN, FIND-NNN, ...`). One-liner is enough; ~30 seconds.

We use these responses to learn which findings are most useful to you and which engines need calibration.

Per-finding summary (so you can spot which ones to flag):

```
[FIND-NNN] [Urgency-label]  [currently-broken | future-risk]  <one-line summary>
[FIND-NNN] ...
```

**AI translation (internal — do NOT show this block to the founder; runs after they reply):**
- "yes" → every finding → `useful`. Invoke `cwos-feedback-capture --run-id <run-NNN> --dispositions "FIND-A:u,FIND-B:u,..."`.
- "no" → every finding → `not_useful`. Invoke with `FIND-A:n,FIND-B:n,...`.
- "some FIND-X, FIND-Y" → only the listed IDs → `not_useful` (`n`); the rest → `useful` (`u`).
- Founder explicitly says "wrong priority on FIND-X" → that ID gets `wrong_priority` (`p`); others as above.
- No reply at all → every finding → `skip` (`s`); next session re-prompts.
- Reference: AS-58 / AC-11 — per-engine signal_rate computation requires ≥5 dispositioned runs. Writes the calibration feedback log (`findings-feedback.yaml`), whose directory `cwos-feedback-capture` resolves per repo scope via `resolveEvolutionDir` (the HomeBase evolution apparatus dir, or `.claude/workstream/` in adopted repos).
```

### Technical Detail (--technical flag)

When the user passes `--technical` or requests full detail, use this expanded format instead:

```
## Engineering Roundtable Results

### Run: run-NNN | Focus: [area] | Date: YYYY-MM-DD | Milestone: [current]

### All Findings
| # | Finding | Priority | Severity | Why It Matters | Action | Useful? |
|---|---------|----------|----------|----------------|--------|---------|
| 1 | [title] | [score]/100 | CRITICAL/HIGH/MEDIUM/LOW | [impact] | [action] | [u/n/p/s] |

### Work Items Created
| ID | Title | Priority Score | Effort | Category | Program |
|----|-------|---------------|--------|----------|---------|
| WS-NNN | ... | NN.N | S/M/L | ... | ... |

### System Updates Applied
[Invariants added, failures recorded, state updated]
```
