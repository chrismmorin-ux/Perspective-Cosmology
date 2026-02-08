# Quality Engine

You are the QUALITY ENGINE for Perspective Cosmology. Your job is to systematically
improve the rigor, consistency, and completeness of this repository.

## Execution Model

Run six phases sequentially. Each phase uses subagents for parallel scanning.
After each phase, write findings to the report file before proceeding.

**Report file**: `.quality/report.md` (overwrite each run)
**History file**: `.quality/history.md` (append summary after each run)

Before starting: Read `.quality/report.md` if it exists — note previous issue counts for trend tracking.

## Phase 1: STRUCTURAL SCAN (Auto-fixable)

Launch subagents to check in parallel:

### 1.1 Broken References
- Scan all .md files for `[text](path)` links — verify targets exist
- Scan for `DEF_XXXX`, `AXM_XXXX`, `THM_XXXX`, `LEM_XXXX` references — verify referenced files exist in `core/`
- Scan for `verification/sympy/*.py` references — verify scripts exist
- **Auto-fix**: Remove broken links, flag missing targets

### 1.2 Missing Headers
- All `core/axioms/`, `core/definitions/`, `core/theorems/` files must have Status field
- All `framework/investigations/` files must have Status, Created, Last Updated fields
- All `sessions/S*.md` files must have date and focus
- **Auto-fix**: Add missing header fields with UNKNOWN/TODO values

### 1.3 Orphaned Files
- Files in `framework/investigations/` not listed in `_INDEX.md`
- Verification scripts not referenced from any .md file
- Session files not listed in `sessions/INDEX.md`
- **Report**: List orphans for manual triage

### 1.4 Size Violations
- Any .md file > 30KB in `framework/investigations/`
- Any .md file > 10KB in `sessions/`
- Any .py file > 20KB in `verification/sympy/`
- Any registry file > 15KB
- **Report**: List violations with current sizes

After auto-fixes, re-scan once. Report remaining issues.

## Phase 2: CONTENT SCAN (Report + Suggest)

### 2.1 Untagged Claims
- Scan `core/theorems/` and `framework/investigations/` for claims without confidence tags
- Look for statements like "X = Y" or "this implies" without [THEOREM], [DERIVATION], [CONJECTURE], etc.
- **Report**: File, line range, suggested tag

### 2.2 Unverified Calculations
- Scan for numerical values (especially with approximate-equals, =, ppm, %) without script references
- Cross-check: does the referenced script exist?
- **Report**: Unverified calculations with suggested script names

### 2.3 Incomplete Derivation Chains
- Scan for derivations missing [A]/[I]/[D] tags
- Check that every [I] import is acknowledged explicitly
- **Report**: Incomplete chains with what's missing

### 2.4 Stale Content Detection
- Files in `framework/investigations/` with Status: ACTIVE but no session reference in last 20 sessions
- Registry files referencing sessions more than 30 sessions old without updates
- Files in `archive/deprecated/` still referenced from active files (zombie references)
- **Report**: Stale files with suggested status change
- **Handoff**: Files flagged here feed into Phase 5 for lifecycle triage

## Phase 3: CONSISTENCY SCAN (Judgment Required)

### 3.1 Status Mismatches
- Theorem says PROVEN but investigation says CONJECTURE
- Investigation says CANONICAL but no verification script passes
- Claim tier doesn't match derivation confidence

### 3.2 Dependency Violations
- A depends on B, but B's status is lower confidence than A
- Circular dependencies in derivation chains
- Claims referencing deprecated/archived axioms

### 3.3 Layer Purity
- Layer 0 files (core/axioms) referencing physics values
- Layer 1 files importing without [A-IMPORT] tags
- Cross-layer contamination

### 3.4 Terminology Consistency
- Same concept called different names in different files
- Inconsistent notation (n_c vs N_c vs nc)

## Phase 5: FILE LIFECYCLE SCAN (Deprecation & Consolidation)

This phase identifies outdated, redundant, and orphaned files — and ensures safe deprecation
by verifying critical content is preserved before any file is archived or removed.

### 5.1 Superseded Content Detection
Scan for files whose content has been corrected, overturned, or replaced:

- **Falsified claims still live**: Cross-reference `registry/FALSIFICATION_REGISTRY.md` — any
  investigation or theorem file still containing falsified results (F-1 through F-N) without
  clear "[FALSIFIED]" or "[SUPERSEDED]" markers
- **Corrected information**: Files referencing old values/formulas that were updated in later
  sessions (check session files for "corrects S{N}", "supersedes", "replaces", "was wrong")
- **Outdated status**: Files with Status: ACTIVE or CANONICAL whose key claims were later
  demoted, qualified, or overturned (cross-ref with `claims/` tier changes)
- **Stale session references**: Investigation files whose "Last Updated" session is >30 sessions
  old AND whose topic has had significant developments since (check session INDEX for activity)
- **Report**: File, what's outdated, where the correction lives, severity (HIGH if actively misleading)

### 5.2 Redundancy & Overlap Detection
Find files covering the same ground that should be merged:

- **Same-topic duplicates**: Multiple investigation files in the same subdirectory covering
  overlapping scope (e.g., two alpha files both deriving the same formula)
- **Split content**: Information about one topic scattered across 3+ files where a single
  consolidated file would be clearer
- **Superseded investigations**: Earlier investigation files whose results are fully captured
  in a later, more complete investigation
- **Parallel derivations**: Multiple derivation files reaching the same result via different
  paths — flag for consolidation (keep best, reference alternatives)
- **Report**: File pairs/groups, overlap description, recommended merge target, merge priority

### 5.3 Deprecation Candidates
Identify files ready for archival:

- **Zero inbound references**: Files not referenced from ANY other .md file, not in any index,
  and not in any session file from the last 30 sessions
- **Fully captured elsewhere**: Investigation files whose key results are ALL present in
  theorems, definitions, or more authoritative investigation files
- **Dead-end investigations**: Files with Status: ARCHIVED or QUARANTINE that still live in
  active directories instead of `archive/`
- **Obsolete scripts**: Verification scripts that test claims no longer in the framework,
  or that duplicate another script's coverage
- **Empty or stub files**: Files with <20 lines of actual content (excluding headers/boilerplate)
- **Report**: File, reason for deprecation, what (if anything) needs extraction first

### 5.4 Safe Archive Protocol
For EVERY file flagged by 5.1-5.3, before recommending archive/deletion:

1. **Content audit**: List every unique claim, formula, or insight in the candidate file
2. **Coverage check**: For each item, verify it exists in the proposed merge target or
   another authoritative file (cite specific file + section)
3. **Gap identification**: Flag any content that exists ONLY in the candidate file —
   this MUST be migrated before archival
4. **Migration checklist**: Generate a concrete list:
   ```
   [ ] Migrate: [specific content] → [target file, section]
   [ ] Migrate: [specific content] → [target file, section]
   [ ] Verify: [content] already in [file] (confirmed: yes/no)
   [ ] Archive: Move [file] → archive/deprecated/[file]
   ```
5. **Dependency check**: Verify no other files will have broken references after archival
6. **Report**: Migration checklist per file, with READY/BLOCKED status
   - READY = all unique content confirmed migrated or duplicated elsewhere
   - BLOCKED = has unique content not yet captured; list what needs migration

**CRITICAL**: Never recommend archiving a file whose unique content hasn't been preserved.
The goal is zero information loss during consolidation.

### 5.5 Lifecycle Summary Table
Produce a summary in the report:

```markdown
| File | Issue | Severity | Action | Status |
|------|-------|----------|--------|--------|
| path/to/file.md | Superseded by S258 results | HIGH | Merge into [target] | BLOCKED: 2 items need migration |
| path/to/old.md | Zero references, dead-end | LOW | Archive | READY |
```

Severity guide:
- **CRITICAL**: File contains actively misleading/wrong information still referenced by others
- **HIGH**: Outdated content that could confuse future sessions
- **MEDIUM**: Redundant file adding clutter but not causing harm
- **LOW**: Minor cleanup opportunity

---

## Phase 4: INVESTIGATION PRIORITIZATION

### Scoring Formula

For each open investigation or proposed new investigation:

```
Priority = (D x G x F) / E

D = Dependency count (how many other claims depend on resolving this)
    Count references to this investigation from other files. Scale: 1-10

G = Gap severity (how far from rigorous is the current state)
    SPECULATION=5, CONJECTURE=4, SKETCH=3, DERIVATION=2, THEOREM=1. Scale: 1-5

F = Falsifiability (does resolving this create testable predictions?)
    Creates blind prediction=3, constrains parameters=2, internal only=1. Scale: 1-3

E = Effort (estimated sessions to make progress)
    Scale: 1-5
```

### Primary Source: Exploration Queue

Read `registry/EXPLORATION_QUEUE.md` as the **primary source** of open research questions.

1. Score all OPEN items with D x G x F / E
2. Write numeric scores into Active Queue Priority column
3. Write the **Scored View** section in EXPLORATION_QUEUE.md (ranked top 10)
4. Add new EQ entries for session questions not yet tracked
5. Move resolved items to Recently Resolved
6. Check BLOCKED items — unblock any whose blockers are resolved

### Supplementary Sources
1. `registry/FORMALIZATION_QUEUE.md` — move misplaced research questions to EQ
2. Findings from Phases 1-3 of this scan
3. `topics/` files with open paths not yet tracked as EQ items
4. `registry/emerging_patterns.md` — score 4+ items get promoted to EQ entries
5. Dead ends that might be unblocked by new results

### Output: registry/INVESTIGATION_PRIORITIES.md
Ranked list with full justifications and session allocation suggestions. Overwrites previous version. Sourced from the exploration queue but includes richer detail (justifications, allocation).

## Phase 6: HALLUCINATION & INTEGRITY SCAN

Systematic detection of LLM hallucination patterns. Based on the S287 audit methodology
that identified 1 CRITICAL + 6 HIGH issues. This phase catches errors that computational
verification alone cannot detect — precision inflation, post-hoc fitting disguised as
prediction, hidden circularity, and confidence tag inflation.

Reference: `registry/HALLUCINATION_LOG.md` for prior findings (HP-001 through HP-011).

### 6.1 Script Execution Health

Run ALL verification scripts and measure pass rates. Compare to baseline.

- Execute every `.py` file in `verification/sympy/` with a timeout (90s default)
- Classify results: OK (no errors, no FAIL), HAS_FAIL (runs but has FAIL tests), ERROR (runtime crash), TIMEOUT
- Compare pass rate to previous run (baseline: 99.8% run rate, 92.1% all-PASS as of S289)
- Flag any NEW errors or regressions since last run
- Check for Windows cp1252 Unicode encoding errors (should be 0 after S289 purge)
- **Report**: Pass rate, error count, regression list, comparison to baseline

### 6.2 Precision Language Audit

Detect the 5 systemic inflation patterns identified in S287:

**Pattern 1: "EXACT" inflation**
- Scan all `.md` files for "EXACT", "exact match", "exact identity", "exactly"
- For each occurrence: is it a proven mathematical identity, or an approximate numerical agreement?
- Mathematical identities (e.g., "28 = 4 * 7") → OK
- Numerical agreements → Flag. Should use "within N ppm" or "matches to N sigma"
- **Auto-flag**: Any "EXACT" within 3 lines of a ppm/sigma/% value

**Pattern 2: Hidden free parameters ("0.00 sigma")**
- Scan for "0.00 sigma", "zero sigma", "0.0 sigma", "perfect match", "exact agreement"
- For each: how many free parameters were used? Was the coefficient predicted or extracted?
- A 1-parameter fit to 1 data point ALWAYS gives 0.00 sigma — this is not a prediction
- **Auto-flag**: Any "0.00 sigma" claim. Cross-check against `registry/HALLUCINATION_LOG.md` HP-005

**Pattern 3: Post-hoc fitting with prediction language**
- Scan for "predicts", "predicted", "framework predicts" near quantities that were discovered by search
- Cross-reference with `registry/FORMULA_SEARCH_LOG.md` — if a formula was found by search,
  it should say "framework yields" or "matches", not "predicts"
- **Auto-flag**: "predicts" + any formula in the search log

**Pattern 4: Identification masquerading as derivation**
- Scan for "[DERIVATION]" or "[THEOREM]" near statements like "X = Y" where Y is an observed
  SM value tagged [A-IMPORT]
- The framework derives X; observing X = Y is a *prediction*, not a *derivation of Y*
- **Auto-flag**: [DERIVATION] within 5 lines of [A-IMPORT]

**Pattern 5: Correlated claims as independent evidence**
- Scan `claims/TIER_1_SIGNIFICANT.md` and `claims/TIER_2_NOTABLE.md`
- For each claim, check `registry/CLAIM_DEPENDENCIES.md` — do multiple claims share the
  same derivation root? If so, they are NOT independent evidence
- **Report**: Dependency clusters (claims that rise or fall together)

### 6.3 CODATA & Constants Consistency

Ensure all scripts use the same physical constants.

- Verify `verification/sympy/framework_constants.py` exists and contains current CODATA values
- Scan all `.py` files for hardcoded alpha values (137.035999...) — must match framework_constants.py
- Scan for hardcoded sin^2(theta_W), m_p/m_e, and other physical constants — flag any that
  don't import from framework_constants.py
- Check that markdown precision claims (ppm values) are consistent with the CODATA version
  used in the corresponding verification script
- **Report**: Scripts with non-standard constants, version mismatches

### 6.4 Confidence Tag Validation

Check that [THEOREM] tags are earned, not inflated.

- Scan all [THEOREM]-tagged claims in `core/theorems/` and `framework/investigations/`
- For each: trace the dependency chain. Does it depend on any [DERIVATION], [CONJECTURE],
  or [SPECULATION]-level result?
- If yes: the claim inherits the LOWEST confidence in its chain — flag for downgrade
- Special cases:
  - Computational exhaustion (checked all N cases) → [DERIVATION, computational], not [THEOREM]
  - Depends on THM_0487 (breaking chain, [DERIVATION]) → inherits [DERIVATION]
  - Depends on THM_0494 (Born rule, [DERIVATION]) → inherits [DERIVATION]
- **Report**: Over-tagged claims with recommended downgrades and dependency chains

### 6.5 Circularity Detection

Detect circular reasoning in derivation chains.

- Build a dependency graph from [A]/[I]/[D] tags and `registry/CLAIM_DEPENDENCIES.md`
- Check for cycles: A depends on B depends on A
- Known resolved circularities (F=C via CCP, S251-S255): mark as RESOLVED
- Known active warnings (eps*=alpha^2): verify [CIRCULAR WARNING] label is present
- Scan for axioms justified by their own consequences ("we chose X because it gives Y,
  and Y confirms X was right")
- **Report**: Circular chains found, resolution status

### 6.6 Hallucination Risk Scoring (HRS)

For the top 10 highest-precision claims (lowest ppm), compute the Hallucination Risk Score:

```
HRS = sum of applicable:
  +2  Matches known value (could be reverse-engineered)
  +2  "It can be shown" language without intermediate steps
  +3  No intermediate steps shown
  +2  Seems "too good" (sub-ppm with zero free parameters)
  -2  Multiple independent verifications exist
  -2  Clear derivation chain with all steps documented
  -1  Sensitivity analysis performed (result changes with input perturbation)
```

- HRS >= 4: HIGH RISK — requires multi-path verification before accepting
- HRS 2-3: MODERATE — note for monitoring
- HRS <= 1: LOW — well-defended
- **Report**: Top 10 claims with HRS scores, flags for any >= 4

### 6.7 New Hallucination Pattern Detection

Check for patterns not yet in the log:

- Scan session files from last 10 sessions for any caught errors, corrections, or retractions
- Look for "CORRECTED", "RETRACTED", "was wrong", "supersedes" in recent sessions
- For each: was it logged in `registry/HALLUCINATION_LOG.md`? If not, flag for logging
- Look for HRS-worthy claims that bypassed the skepticism checklist
- **Report**: Unlogged corrections, new pattern candidates

---

## Phase 7: PROPAGATION DEBT DETECTION

Detects when framework changes haven't been propagated to all referencing documents. Major
results (resolved conjectures, retracted claims, updated counts) create "propagation debt" —
stale references across the repo that mislead readers and future sessions.

**Reference file**: `registry/PROPAGATION_MANIFEST.md` — tracks key facts and their current values.

### 7.1 Trigger Detection (from recent sessions)

Scan session files from the last 10 sessions for propagation triggers:

**Trigger Type A: Status Changes**
- CONJ -> THEOREM/DERIVATION (grep for "RESOLVED", "PROVEN", "upgraded")
- ACTIVE -> CANONICAL (grep for "CANONICAL", "promoted")
- Any status -> RETRACTED (grep for "RETRACTED", "retracted")
- Any status -> FALSIFIED (grep for "FALSIFIED")
- CONJECTURE -> A-STRUCTURAL (grep for "upgraded", "A-STRUCTURAL")

**Trigger Type B: Numeric Changes**
- IRA count changes (grep for "IRA.*count.*->", "IRA.*\d+.*->.*\d+")
- Prediction count changes (grep for "predictions.*\d+")
- Script/test count changes (grep for "scripts.*\d+", "tests.*\d+")
- Probability assessment changes (grep for "\d+-\d+%")

**Trigger Type C: Formula/Value Changes**
- Coefficient changes (grep for "C\s*=.*->", "coefficient.*changed")
- Euler characteristic corrections (grep for "chi.*=", "Euler.*=")
- Topological corrections (grep for "H_2.*=", "b_2.*=")

**Trigger Type D: Resolution Events**
- EQ items resolved (grep for "EQ-\d+.*RESOLVED")
- Conjectures resolved (grep for "CONJ-[A-Z]\d+.*RESOLVED")
- Open questions answered (grep for "Open.*Q.*RESOLVED", "gap.*closed")

For each trigger found, extract: {what changed, old value, new value, session number}.

### 7.2 Manifest Validation

Read `registry/PROPAGATION_MANIFEST.md` and for each active entry:

1. **Grep for old value**: Search all .md files (excluding sessions/S*.md) for the OLD value
2. **Classify each hit**:
   - STALE: File uses old value without noting it's historical → needs update
   - HISTORICAL: Session file or archive file using old value in historical context → OK
   - QUALIFIED: File uses old value but notes it was superseded → OK
3. **Score severity**:
   - CRITICAL: Publications, claims, or core files with stale values
   - HIGH: Active investigation or registry files with stale values
   - MEDIUM: Topic files or framework summaries with stale values
   - LOW: Archive files or session files with stale values

### 7.3 Cross-Document Reference Staleness

For each propagation item in the manifest, check cross-references:

- Does `registry/CLAIM_DEPENDENCIES.md` reflect the current status?
- Does `framework/MATHEMATICAL_PERIODIC_TABLE.md` have current counts?
- Do `publications/` files match current assessments?
- Do `claims/` files reflect current tier assignments?
- Does `sessions/INDEX.md` active topics table have current state?
- Does `registry/EXPLORATION_QUEUE.md` reflect resolved items?

### 7.4 Propagation Completeness Score

For each manifest entry, compute:

```
Completeness = (files_updated) / (files_updated + files_stale) × 100%

Overall Score = mean(Completeness) across all active entries
```

Target: 95%+ completeness on all entries, 100% on CRITICAL entries.

### 7.5 Auto-Generate Propagation Checklist

For each entry with completeness < 100%, output:

```markdown
### PROP-NNN: [Description] (Session SX -> SY)
Old value: [old]
New value: [new]
Files needing update:
- [ ] path/to/file.md (line ~N): "old text" -> "new text"
- [ ] path/to/file2.md (line ~M): "old text" -> "new text"
Severity: CRITICAL/HIGH/MEDIUM/LOW
```

### 7.6 Session Workflow Compliance

Check that recent sessions followed propagation protocol:

- Did the session file list propagation triggers? (look for "Propagation" section)
- Were manifest entries created for status changes?
- Were key cross-references updated in the same session?
- Flag sessions that made major changes without propagation notes

---

## Report Format

Write to `.quality/report.md`:

```markdown
# Quality Engine Report
**Run date**: [date]
**Run number**: [N] (increment from history)
**Previous issues**: [count from last run, or "first run"]
**Current issues**: [count this run]
**Trend**: IMPROVING / STABLE / DEGRADING / FIRST RUN

## Summary
- Phase 1 (Structural): [N] issues ([M] auto-fixed)
- Phase 2 (Content): [N] issues
- Phase 3 (Consistency): [N] issues
- Phase 4: [N] investigations scored
- Phase 5 (Lifecycle): [N] files flagged ([M] READY for archive, [K] BLOCKED pending migration)
- Phase 6 (Hallucination): Script health [pass%], [N] precision flags, [M] tag downgrades, [K] circularity warnings
- Phase 7 (Propagation): [N] manifest entries, [M] stale references, completeness [X]%

## Critical Issues (Must Fix)
[Top 5 most impactful issues]

## Investigation Priorities (Top 10)
| Rank | Investigation | Score | D | G | F | E | Next Action |
|------|--------------|-------|---|---|---|---|-------------|

## Full Findings
### Phase 1: Structural
[detailed findings]

### Phase 2: Content
[detailed findings]

### Phase 3: Consistency
[detailed findings]

### Phase 6: Hallucination & Integrity
#### Script Health
[pass rate, error count, regressions]

#### Precision Language
[EXACT inflation, 0.00 sigma flags, post-hoc language, identification-as-derivation]

#### Constants Consistency
[CODATA version mismatches, hardcoded values]

#### Confidence Tag Validation
[THEOREM downgrades needed, dependency chains]

#### Circularity
[circular chains found, resolution status]

#### HRS Top 10
| Rank | Claim | Precision | HRS | Flags |
|------|-------|-----------|-----|-------|

#### New Patterns
[unlogged corrections, new hallucination pattern candidates]

### Phase 7: Propagation Debt
#### Manifest Status
[N entries tracked, M with 100% completeness, K with stale references]

#### Propagation Checklist
[PROP items with file lists and recommended changes]

#### Completeness Score
[Overall propagation completeness percentage]

#### Session Compliance
[Recent sessions checked for propagation protocol adherence]

### Phase 5: File Lifecycle
#### Superseded Content
[files with outdated/corrected information]

#### Redundancy & Overlap
[file groups that should be merged]

#### Deprecation Candidates
[files ready for archive]

#### Migration Checklists
[per-file checklists for BLOCKED items]

#### Lifecycle Summary
| File | Issue | Severity | Action | Status |
|------|-------|----------|--------|--------|
[lifecycle table]

## Proposed Next Actions
1. [Highest-leverage fix]
2. [Second-highest]
3. [Third]
```

After writing the report, append a summary line to `.quality/history.md`:

```markdown
## Run [N] — [date]
Issues: [total]. Structural: [n] ([m] fixed). Content: [n]. Consistency: [n]. Lifecycle: [n] ([m] READY, [k] BLOCKED). Hallucination: [n] flags, scripts [pass%]. Propagation: [n] entries, [m] stale, completeness [x]%. Top priority: [name].
```

## Subagent Usage

Use Task tool with subagent_type for parallel scanning:
- Phase 1: Launch 2-3 Explore agents scanning different file sets simultaneously
- Phase 2: Launch 2 agents (content checks + script cross-references) simultaneously
- Phase 3: Launch 1-2 agents (consistency + dependency analysis)
- Phase 4: Launch 1 agent (scoring + ranking)
- Phase 5: Launch 2-3 agents in parallel:
  - Agent 1: Superseded content scan (cross-ref falsification registry, session corrections, claim demotions)
  - Agent 2: Redundancy scan (same-directory overlap, split content, parallel derivations)
  - Agent 3: Deprecation candidates + safe archive protocol (zero-reference check, coverage audit, migration checklists)
- Phase 6: Launch 3 agents in parallel:
  - Agent 1 (Bash): Run all verification scripts, collect pass/fail/error counts (6.1, 6.3)
  - Agent 2 (Explore): Precision language scan — grep for "EXACT", "0.00 sigma", "predicts", hidden parameter patterns (6.2)
  - Agent 3 (Explore): Confidence tag validation + circularity detection — trace THEOREM dependency chains, check for cycles (6.4, 6.5)
  - Then sequentially: HRS scoring for top 10 claims (6.6) and new pattern detection from recent sessions (6.7)
- Phase 7: Launch 2 agents in parallel:
  - Agent 1 (Explore): Trigger detection — scan last 10 session files for status changes, retractions, count changes, resolutions (7.1)
  - Agent 2 (Explore): Manifest validation — read PROPAGATION_MANIFEST.md, grep for old values across repo, classify hits as STALE/HISTORICAL/QUALIFIED (7.2, 7.3)
  - Then sequentially: Compute completeness scores (7.4), generate propagation checklist (7.5), check session compliance (7.6)

Keep main context clean — subagents do the heavy lifting. Collect their results and synthesize into the report.

## Iterative Design

The engine is designed for repeated runs:
- Each run produces a report comparing to previous runs
- Auto-fixes in Phase 1 may surface new Phase 2/3 issues
- Investigation priorities shift as issues are resolved
- History file tracks improvement over time
- Re-run after any major documentation session
