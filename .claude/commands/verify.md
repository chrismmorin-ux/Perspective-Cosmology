---
name: verify
description: "Self-verification — run build, tests, invariant checks, and visual verification based on what changed"
user-invocable: true
argument-hint: "[layer: build|invariants|visual|behavioral|regression|all]"
---

# /verify — Self-Verification

Verify that the system is healthy and recent changes haven't broken anything. Runs verification layers appropriate to what changed.

## Output Shape

**Verify arc:** `<scanning | layer-running | report-ready>` — `<one-clause status>` (e.g., "All N invariants checked, M PASS, K FAIL").

`<Delta line: what this invocation did — ran L layers covering F files. If clean: "Diagnostic-only — no state change.">`

`<Remainder: per-layer results table — Layer / Status / Detail — with FAIL rows highlighted at the top. Cite invariant IDs explicitly.>`

### Why these layers ran
`<Value-rationale: cite the changed-files heuristic that selected each layer, the invariant or repo_goal each layer protects, and any failure-mode token motivating coverage. If no changes: declare it.>`

**Do next:** Single-line action — `Fix FAIL items before proceeding` (or `All clear — continue current work` when all PASS).

## Steps

### 1. Determine What Changed
- Run `git diff --name-only HEAD` for unstaged changes
- Run `git diff --name-only --staged` for staged changes  
- Run `git diff --name-only HEAD~1..HEAD` for last commit
- Combine into `changed_files` list
- Categorize changes: code, tests, config, UI, data, docs

### 2. Select Verification Layers

Based on `$ARGUMENTS` or auto-detect from changes:

| If changed... | Run layers... |
|---------------|---------------|
| Any code | Build, Test, Regression |
| UI/frontend files | Build, Test, Visual, Regression |
| Data/schema files | Build, Test, Behavioral, Regression |
| Config files | Build, Behavioral |
| Tests only | Test |
| Docs only | (skip verification) |
| `$ARGUMENTS = all` | All 5 layers |
| Closing a high/critical item (or `inspection: required`) | + Independent inspection (Layer 6) — the close refuses without it |

### 3. Layer 0 — Headroom pre-flight (before any test runs)

Run this FIRST, whenever Layer 1 is selected:

```bash
node kit/scripts/cwos-headroom.js --require-gb 4
```

**Why this comes before the tests, not after.** Load contention does not announce
itself as load contention — it announces itself as a FAILING TEST, and a failing
test is believed. Measured twice, in two repos:

- `claude-poker-tracker` 2026-08-22 — the same suite on identical code reported
  5 failed, then 1, then 0, purely as a function of concurrent load.
- `ServeYourNote` 2026-08-23 — four xdist workers racing `--create-db` on a loaded
  machine tripped the 30s timeout: 2,341 then 3,868 spurious errors.

Both were debugged as product bugs before anyone measured the machine.

**On exit 1 (gate refused): do NOT run the suite, and do NOT report a test result.**
A suite run into insufficient headroom produces a number that means nothing, and
reporting it as PASS or FAIL is the actual harm. Instead:

1. `node kit/scripts/cwos-headroom.js --verbose --sessions` — see what is holding
   memory, and whether any `claude.exe` has no active CWOS session claiming it.
2. Close finished sessions, or `--apply` to reclaim what all four safety
   conditions allow.
3. Or move the run to another machine, if this fleet has one with headroom —
   `/fleet-run` from the hub. (Named as a command, not as a script path: the
   fleet runner is hub-only apparatus and is absent from every adopted repo, so
   spelling the invocation here would tell an adopter to run something they do
   not have — the exact class INV-073 gates.)

Record the headroom verdict alongside the test result — a suite that passed at
0.9 GB free and one that passed at 8 GB free are not the same evidence. If the
script is absent (older kit), skip this layer silently and note it once.

**On exit 0 (gate met): SIZE the run before starting it (WS-711).** The gate is
binary — it refuses a run that cannot fit, but it cannot size one that can. Test
runners take a worker count chosen when nobody knew six sessions would be live,
and on a loaded machine `-n 4` is not four times the throughput, it is four
processes paging. Derive the count instead:

```bash
node kit/scripts/cwos-headroom.js --require-gb 4 || exit 1
W=$(node kit/scripts/cwos-headroom.js --workers)
pytest -n "$W"                                        # pytest-xdist
# vitest --poolOptions.threads.maxThreads="$W"        # vitest
```

`--workers` prints one bare integer and nothing else, so it drops straight into a
command line. Notes that matter:

- **1 worker means run serially — it does not mean do not run.** Refusing is the
  gate's job; this verdict only degrades. The sizer never returns 0.
- **Combine it with `--require-gb` and the gate wins.** On refusal stdout stays
  empty and the exit is 1, so the runner's command line breaks loudly instead of
  running at a garbage count.
- **The per-worker cost is an estimate, not a measurement.** The default assumes
  1.5 GB per worker; nobody has measured what a worker in *your* suite actually
  costs. Once you have measured it, pass `--per-worker-gb` and the output marks
  itself `calibrated: true`. Until then it is a better guess than a hardcoded
  number, which is the honest claim.
- **Record the worker count with the result**, for the same reason the headroom
  verdict is recorded: a suite that passed at 8 workers and one that passed at 1
  are not the same evidence.

### 4. Layer 1 — Build/Test Verification

Read vital signs from `system/state.md` for the check commands to run.

Run each check command:
- Test suite (e.g., `pytest`, `npm test`, `cargo test`)
- Build (e.g., `npm run build`, `python manage.py check`)
- Lint/type check if configured

Record: pass/fail, output summary, duration.

**A crashed worker is not a test result.** Before reading pass/fail counts, scan the runner output for `node down`, `Not properly terminated`, `Killed`, `exit code 137`, or `worker ... crashed`. Any of these means a test process was killed — almost always out of memory — and the suite result is **FAIL-INFRA**: report it as that, not as N test failures and not as a pass. Re-run with fewer workers (`cwos-headroom.js --workers`) and, inside a container, check its memory limit against the worker count. Measured in ServeYourNote (WS-514 #4): a 512M container cap OOM-killed `pytest -n 4` workers, and the crashes scrolled past as noise for as long as the limit existed.

### 5. Layer 2 — Invariant Verification

Read `system/invariants.md`. For each invariant with a `check_command`:
- Run the command
- Record pass/fail
- If fail: flag with the invariant name and expected behavior

**Mode selection (WS-429 / FIND-296).** `cwos-verify.js` supports incremental
selection so it stays cheap enough to run often:
- `/verify` and `/audit` run **full mode** (`node kit/scripts/cwos-verify.js`) —
  every invariant, the authoritative pass.
- **Session start** runs **fast mode** (`--fast-mode --quiet`)
  via a SessionStart hook *where one is configured* — HomeBase today, every repo
  once ADR-064 Stage 1 ships hooks via the plugin. Where it is not, run it by
  hand or rely on `/verify`. The mode is exactly the curated `fast: true`
  subset. Silent unless a check FAILs.
  **The hook deliberately does NOT pass `--since-git-commit` (WS-811).** Unioning
  the incremental set onto the fast set pulled in 12 always-run checks on every
  session — including two that probe the network — plus a tail that grew with the
  size of your working tree: measured 1.8s bare against 23.2s unioned, under an
  8s hook timeout. The run was killed rather than reported, so those checks
  produced *absence* rather than green for weeks. They still run in the full set,
  under `/verify`, and at the release gates. `verify-perf.test.js` now reads the
  hook's real argv and timeout out of settings and asserts against those, so the
  test can no longer be green about a command nobody ships.
- `--since-git-commit [ref]` alone scopes a full-rigor run to just the
  invariants guarding changed paths — useful before a commit on a large repo.

### 6. Layer 3 — Visual Verification (UI repos only)

If the project has UI components and UI files changed:
- Use Playwright MCP to navigate to affected pages
- Take screenshots of key states
- Present screenshots to user for visual review
- Check for: layout breaks, missing elements, style regressions

If no Playwright available, note: "Visual verification skipped — no browser automation configured"

### 7. Layer 4 — Behavioral Verification

If behavioral checks are configured in `system/state.md`:
- Start the application (if not running)
- Run configured endpoint/flow checks
- Verify responses match expectations

If no behavioral checks configured, note: "Behavioral verification skipped — no checks configured"

### 8. Layer 5 — Regression Check

- Review `git diff` for unintended changes:
  - Files modified that weren't part of the current work item
  - Deleted code that shouldn't have been removed
  - New dependencies added
- Cross-reference with current work item's `files_involved` — flag any files changed that aren't listed

### 8b. Layer 6 — Independent inspection (items that require it)

Run this layer when the work closes an item whose severity is `high` or `critical`, or that carries `inspection: required`. Both close paths refuse such an item until a PASS is on record: `cwos-item.js done` and `cwos-next.js done --sprint`, which refuses the whole sprint and names each uninspected item (WS-941). The layers above are the right checklist, but the person walking it is the one who built the change. This layer hands the checklist to someone who didn't.

1. **Collect only what the inspector needs.** That is the item's `accept_criteria` (from `node kit/scripts/cwos-item.js show WS-NNN`) and the diff of the commits that implement it (`git diff <base>..<head>`). Leave out the session's reasoning, its summary, and any claim that something works.
2. **Spawn a fresh subagent** (Agent tool, general-purpose) with this brief: *"You did not write this change. For each acceptance criterion below, decide PASS or FAIL against the diff and anything you run or read in the repo. Give one line per criterion with the pointer you checked it against: a command and what it printed, or a file:line. If you cannot settle a criterion, it FAILS; say what would settle it."* Then give it the criteria and the diff range. Do not tell it what you expect it to find.
3. **Record the verdict exactly as returned.** If any criterion fails, the verdict is fail:
   ```bash
   node kit/scripts/cwos-item.js inspect WS-NNN --verdict pass|fail \
     --inspector "<subagent id>" --diff "<base>..<head>" --evidence - <<'EOF'
   <the inspector's per-criterion lines, verbatim>
   EOF
   ```
   A FAIL stays in the item file when a later PASS lands, because a failed inspection is evidence about the work.
4. **If it fails:** fix the work, then run a *new* inspector (never the same one) and record again.

**Honest limit:** independence here comes from the procedure, a fresh context with no session history, not from anything the gate can prove. What the gate does guarantee is that no required item closes without an inspection on record. The founder's escape valve is `--skip-inspection "<rationale ≥20 chars>"` on either close command, and every use is logged as an `inspection_waived` event.

### 9. Output Results

```
## Verification Results

### Summary
| Layer | Status | Details |
|-------|--------|---------|
| Headroom | PASS/REFUSED | N.N GB free of M.M GB (record it even on PASS) |
| Sizing | N worker(s) | derived from free RAM; note `calibrated: false` if the per-worker cost is still the default estimate |
| Build/Test | PASS/FAIL | X/Y tests passing, build clean |
| Invariants | PASS/FAIL | N/M invariants verified |
| Visual | PASS/FAIL/SKIP | [details] |
| Behavioral | PASS/FAIL/SKIP | [details] |
| Regression | PASS/FAIL | [details] |
| Inspection | PASS/FAIL/N-A | inspector id + verdict recorded via `cwos-item inspect` (required items only) |

### Overall: ✅ PASS / ❌ FAIL

### Failures (if any)
[detailed failure information with file paths and error messages]

### Unintended Changes (if any)
[files changed outside the current work item scope]
```

### 10. On Failure

If any layer fails:
1. Attempt auto-fix if the issue is straightforward (missing import, lint error)
2. Re-run the failed layer
3. If still failing after 1 auto-fix attempt: report to user, do NOT mark work item as done
4. Create a finding if the failure reveals a systemic issue


---

## Shadow-event envelope (ADR-018 step 1)

After your final output, run:

`node kit/scripts/cwos-event.js append command_completed --track T11:vital-signs --tag /verify --payload '{"command":"/verify"}'`

Non-fatal. Do not gate any output on the exit status.
