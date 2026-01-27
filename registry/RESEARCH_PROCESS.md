# Research Process Guide

**Created**: 2026-01-27
**Purpose**: Define how insights flow through the framework — from speculation to theorem

---

## Overview

```
RAW INSIGHT
    ↓ capture
emerging_patterns.md [scored, timestamped]
    ↓ mature (score ≥ 4)
Investigation document [ACTIVE]
    ↓ formalize
Core definition (DEF_xxxx) or claim (CLAIM-xx)
    ↓ verify
SymPy script [PASS/FAIL]
    ↓ integrate
Four-layer structure (Layer 0-3)
    ↓ publish
CANONICAL status
```

---

## Stage 1: Capture (emerging_patterns.md)

### When to capture
- Any insight that seems potentially significant
- Even half-formed ideas worth remembering
- Connections between existing concepts

### How to capture
```markdown
### [DATE] [One-line summary]
**Thread**: [alpha_137 | dark_sector | primes | mutations | gauge | foundation]
**Score**: [1-5]
**Sessions since capture**: 0
**Insight**: [2-3 sentences]
**Next**: [Verification path]
```

### Scoring guide
| Score | Meaning | Example |
|-------|---------|---------|
| 1 | Vague speculation | "Maybe consciousness is recursive" |
| 2 | Interesting but unclear path | "Primes might relate to dimensions" |
| 3 | Plausible with some support | "n_d = 4 may be contingent" |
| 4 | Likely significant, clear next step | "Antisymmetric creates dimensions" |
| 5 | Breakthrough imminent | Ready for immediate investigation |

### Aging protocol
- Sessions 0-2: Normal
- Sessions 3-4: Must review
- Sessions 5+: **STALE** — decide: promote, archive, or explicitly keep

---

## Stage 2: Investigation (framework/investigations/)

### When to create investigation
- Pattern reaches score 4+ with clear path
- Connects to Top 4 avenues
- Has verification strategy

### Investigation template
```markdown
# Investigation: [Title]

**Status**: ACTIVE | COMPLETE | QUARANTINE
**Thread**: [thread]
**Started**: [date, session]
**Last Updated**: [date, session]

## Question
[What are we trying to answer?]

## Key Insight
[Core idea being investigated]

## Derivation Attempt
[The argument, with explicit steps]

## Gaps and Assumptions
[What's assumed, what's proven]

## Verification
[Links to scripts, pass/fail status]

## Outcome
[When complete: BREAKTHROUGH | NEAR-MISS | DEAD-END | ANOMALY]

## Next Steps
[What follows from this]
```

### Status definitions
| Status | Meaning | Next Action |
|--------|---------|-------------|
| ACTIVE | Under development | Continue work |
| COMPLETE | Derivation finished | Promote to core/ |
| QUARANTINE | Blocked, uncertain | Analyze gap |
| ARCHIVE | Dead end | Document lessons |

---

## Stage 3: Formalization (core/ and claims)

### CRITICAL: Keep Formal and Living Documents in Sync

**Problem discovered (S69)**: `layer_0_pure_axioms.md` evolved but `core/axioms/` didn't keep up.
This caused AXM_0106 (Non-Invertibility) to contradict derived invertibility from T0!

**Rule**: When layer_0_pure_axioms.md changes, core/axioms/ MUST be updated in the SAME SESSION.

### When to formalize
- Investigation reaches COMPLETE status
- Verification script passes
- Gaps documented and acceptable
- **Axiom changes in layer_0** → Immediate formalization required

### Formalization types

**Axiom (AXM_xxxx)**: Foundational assumption
- Location: `core/axioms/`
- Requirements: Explicit statement, justification, alternatives listed
- **SYNC**: Must match layer_0_pure_axioms.md exactly

**Definition (DEF_xxxx)**: Mathematical object
- Location: `core/definitions/`
- Requirements: Precise statement, examples, properties

**Theorem (THM_xxxx)**: Proven result
- Location: `core/theorems/`
- Requirements: Statement, proof sketch, verification script
- **When DERIVED status assigned**: Create THM file immediately

**Derivation (DRV_xxxx)**: Physics derivation with imports
- Location: `physics/derivations/`
- Requirements: Derivation chain, imports listed, verification script

**Claim (CLAIM-xx)**: Framework prediction
- Location: `registry/CLAIM_DEPENDENCIES.md`
- Requirements: Dependencies, verification, confidence level

### Formalization Checklist

When a theorem is marked DERIVED:
- [ ] Create THM_xxxx file in core/theorems/
- [ ] Add to tag_registry.md
- [ ] Link verification script
- [ ] Update DERIVATION_CHAIN_AUDIT if relevant
- [ ] Add to CLAIM_DEPENDENCIES

When an axiom changes:
- [ ] Update layer_0_pure_axioms.md
- [ ] Update corresponding AXM_xxxx file (or create if new)
- [ ] Check for contradictions with existing axioms
- [ ] Update tag_registry.md
- [ ] Run affected verification scripts

---

## Stage 4: Verification (verification/sympy/)

### Verification is NON-NEGOTIABLE

Every numerical claim must have a script that:
1. Computes the claimed value
2. Reports PASS/FAIL with tolerance
3. Documents what it does and doesn't prove

### Script template
```python
"""
Verification: [CLAIM-XX or claim description]
Dependencies: [list of assumptions]
Expected: [value]
Tolerance: [acceptable error]
"""

# Import and compute

# Report
print("=== VERIFICATION RESULT ===")
print(f"Claim: [description]")
print(f"Computed: {value}")
print(f"Expected: {expected}")
print(f"Error: {error}%")
print(f"Status: {'PASS' if error < tolerance else 'FAIL'}")
```

### Verification status flow
```
NEW → READY → RUN → PASS/PARTIAL/FAIL
```

### Update VERIFICATION_STATUS.md
After running scripts, update:
- Script result (PASS/PARTIAL/FAIL)
- Date last run
- Notes on what it proves vs. assumes

---

## Stage 5: Integration (Four-Layer Structure)

### Layer 0: Pure Axioms (framework/layer_0_pure_axioms.md)
**Contains**: Only framework axioms, NO physics
**Add to**: When new axiom identified and justified

### Layer 1: Mathematics (framework/layer_1_mathematics.md)
**Contains**: What follows mathematically from Layer 0
**Add to**: When theorem proven from axioms alone

### Layer 2: Correspondence (framework/layer_2_correspondence.md)
**Contains**: How we map math to physics (explicit imports)
**Add to**: When new correspondence rule established

### Layer 3: Predictions (framework/layer_3_predictions.md)
**Contains**: What the combined system predicts
**Add to**: When new testable prediction derived

---

## Stage 6: Publication (CANONICAL status)

### CANONICAL requirements
- [ ] All dependencies documented
- [ ] Verification script passes
- [ ] Gaps explicitly listed
- [ ] Falsification criterion in registry
- [ ] Integrated into appropriate layer

### CANONICAL review checklist
1. Read the claim
2. Trace every dependency
3. Run verification script
4. Confirm no hidden assumptions
5. Check falsification criterion exists
6. Update STATUS_DASHBOARD

---

## Cross-Cutting Processes

### Session Start Protocol
1. Read `registry/STATUS_DASHBOARD.md`
2. Check `registry/RESEARCH_NAVIGATOR.md` for priorities
3. Review `registry/emerging_patterns.md` for stale patterns
4. Check `verification/VERIFICATION_STATUS.md` for failed scripts
5. Begin work on selected avenue

### Session End Protocol
1. Capture any new insights in `emerging_patterns.md`
2. Update STATUS_DASHBOARD summary
3. Update `session_log.md`
4. Note what's ready for next session

### Periodic Maintenance (every 5 sessions)
1. Review all emerging patterns — promote or archive stale ones
2. Check investigation status — any stuck?
3. Verify verification scripts still pass
4. Update CLAIM_DEPENDENCIES if any changes
5. Review FALSIFICATION_REGISTRY for new criteria

---

## Decision Trees

### "I have a new insight"
```
Is it related to an active investigation?
├── YES → Add to that investigation document
└── NO → Add to emerging_patterns.md with score
         ├── Score ≥ 4? → Consider immediate investigation
         └── Score < 4? → Monitor for development
```

### "An investigation seems complete"
```
Is there a verification script?
├── NO → Write one first
└── YES → Does it pass?
          ├── NO → Fix or document why it can't pass
          └── YES → Are all dependencies documented?
                    ├── NO → Document them
                    └── YES → Promote to COMPLETE status
                              → Add to CLAIM_DEPENDENCIES
                              → Add falsification criterion
                              → Integrate into layer structure
```

### "A verification script fails"
```
Is the failure fundamental?
├── YES → Mark claim as FALSIFIED
│         → Document in FALSIFICATION_REGISTRY
│         → Update CLAIM_DEPENDENCIES
│         → Archive investigation
└── NO → Is it fixable?
         ├── YES → Fix and re-run
         └── NO → Mark as PARTIAL, document gap
```

### "I found a contradiction"
```
Does it contradict an axiom?
├── YES → CRITICAL — stop and analyze
│         → Is the axiom wrong, or the derivation?
│         → Document in issues_log.md as CRITICAL
└── NO → Does it contradict a derived claim?
         ├── YES → Check derivation chain
         │         → Find the error
         │         → Update all affected claims
         └── NO → Is it contradiction with observation?
                  ├── YES → Framework may be falsified
                  │         → Document carefully
                  └── NO → May be misunderstanding — clarify
```

---

## File Quick Reference

| Stage | Primary File | Support Files |
|-------|--------------|---------------|
| Capture | `emerging_patterns.md` | — |
| Investigate | `framework/investigations/` | `RESEARCH_NAVIGATOR.md` |
| Formalize | `core/` | `CLAIM_DEPENDENCIES.md` |
| Verify | `verification/sympy/` | `VERIFICATION_STATUS.md` |
| Integrate | `framework/layer_*.md` | `tag_registry.md` |
| Publish | — | `STATUS_DASHBOARD.md` |

---

## Red Flags

### Process failures that signal problems

| Red Flag | Meaning | Action |
|----------|---------|--------|
| Pattern aging >5 sessions | Insight stalling | Force decision |
| Investigation stuck >10 sessions | May be dead end | Quarantine or archive |
| Claim without verification | Risk of false confidence | Write script |
| Claim without falsification | Risk of unfalsifiability | Add criterion |
| Dependency not traced | Hidden assumptions | Map dependencies |
| Dashboard outdated | Session start failure | Update immediately |

---

*This process should be followed automatically by Claude. User focuses on physics; Claude handles organization.*
