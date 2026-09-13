# Prediction Roadmap

**Created**: 2026-01-26
**Purpose**: Multi-stage plan to develop the framework's most pronounced, testable predictions
**Status**: ACTIVE

---

## Executive Summary

The framework claims to derive significant Standard Model features from a single axiom (T1: directed time). Sessions 44-49 produced an impressive derivation chain, but:

1. **The derivation chain needs audit** — some steps may be weaker than claimed
2. **Layer 3 (predictions) is outdated** — doesn't reflect recent breakthroughs
3. **Testability is limited** — most "predictions" are retrodictions of known physics
4. **One unique prediction exists** — sin²θ_W = 1/4 at ~200 TeV

This roadmap charts the path from current state to physicist-ready predictions.

---

## Current State (Session 49)

### What's Claimed as Derived from T1

| Claim | Confidence | Matches? |
|-------|------------|----------|
| F = C (complex structure) | DERIVATION | N/A |
| n_d = 4, n_c = 11 | DERIVATION | Yes |
| α = 1/137 | DERIVATION | Yes (0.07%) |
| G_SM = SU(3) × SU(2) × U(1) | DERIVATION | Yes |
| dim(G_SM) = 12, rank = 4 | DERIVATION | Yes |
| sin²θ_W = 1/4 @ ~200 TeV | DERIVATION | Matches running |
| Chirality (left-handed) | DERIVATION | Yes |
| Parity violation | DERIVATION | Yes |
| Fermion count = 15/gen | DERIVATION | Yes |

### Key Gaps

| Gap | Impact | Status |
|-----|--------|--------|
| Hypercharge values | HIGH | NOT ATTEMPTED |
| Generation count = 3 | HIGH | CONJECTURE only |
| Mass hierarchy | VERY HIGH | NOT ATTEMPTED |
| CKM/PMNS angles | HIGH | NOT ATTEMPTED |
| CP violation | MEDIUM | SPECULATION |

### Documents Needing Update

- `framework/layer_3_predictions.md` — outdated, doesn't reflect S44-49
- `registry/RESEARCH_NAVIGATOR.md` — needs prediction focus added

---

## Stage 1: Audit and Consolidation

**Goal**: Verify the claimed derivation chain is solid before building on it

### 1.1 Derivation Chain Audit

**Task**: Walk through each step of the T1 → SM derivation chain

| Step | Claim | Audit Question |
|------|-------|----------------|
| T1 → antisymmetry needed | "Directed sequences need antisymmetric structure" | Is this proven or plausible? |
| Antisymmetry → F = C | "Only complex inner products have antisymmetric part" | Mathematical fact ✓ |
| F = C → U(n) not O(n) | "Complex structure gives unitary symmetry" | Mathematical fact ✓ |
| Associativity → H for defect | "Time requires path independence = associativity" | Is this proven or plausible? |
| Division algebras → gauge groups | "C→U(1), H→SU(2), O+F=C→SU(3)" | Verify mechanism |
| Im_C/Im_H → sin²θ_W | "Coupling ratio from imaginary dimensions" | What justifies this? |

**Deliverable**: Honest assessment with each step marked PROVEN / ARGUED / ASSUMED

### 1.2 Verification Script Audit

**Task**: Run all verification scripts, document results

```
verification/sympy/
├── weinberg_angle_running.py       → RUN, document result
├── chirality_quaternion_analysis.py → RUN, document result
├── gauge_dimension_rank_analysis.py → RUN, document result
├── octonion_su3_decomposition.py   → RUN, document result
└── [all others]                    → RUN, document results
```

**Deliverable**: Verification status table (PASS/FAIL/NEEDS_REVIEW)

### 1.3 Layer 3 Update

**Task**: Rewrite Layer 3 to reflect Sessions 44-49 findings

**Deliverable**: Updated `layer_3_predictions.md`

### Stage 1 Checkpoint

**Questions to answer before proceeding**:
1. Is the T1 → F = C step rigorous or hand-wavy?
2. Is the associativity argument for H solid?
3. Are all verification scripts passing?
4. What's the weakest link in the chain?

**Decision point**: If chain is solid → Stage 2. If chain has gaps → fix first.

---

## Stage 2: Hypercharge Derivation

**Goal**: Derive SM hypercharge assignments from division algebra structure

### 2.1 Research Phase

**Task**: Investigate how hypercharge could emerge from structure

**Key questions**:
- What are the SM hypercharge values? (Y = -1, 2/3, -1/3, 1/6, -1/2, 1)
- Pattern: All multiples of 1/6. Why 1/6?
- Does 1/6 relate to division algebra structure?
- How do C, H, O contributions combine to give Y?

**Existing work to review**:
- `fermion_multiplets_from_division_algebras.md`
- Literature on division algebras and SM (Furey, Baez, etc.)

### 2.2 Derivation Attempt

**Task**: Attempt to derive Y values from geometry

**Possible approaches**:
1. Y from Cayley-Dickson depth structure
2. Y from imaginary dimension ratios
3. Y from interface coupling geometry
4. Y from representation theory of division algebra automorphisms

### 2.3 Verification

**Task**: If derivation found, verify computationally

**Deliverable**: Either:
- Derivation with verification script, OR
- Documented failure with lessons learned

### Stage 2 Checkpoint

**Questions to answer**:
1. Did hypercharge derivation succeed?
2. If yes: How strong is it? Any free parameters?
3. If no: What did we learn? What's missing?

**Decision point**:
- Success → Major result, document thoroughly, proceed to Stage 3
- Failure → Pivot to Stage 2B (alternative predictions) or Stage 4 (cosmology)

---

## Stage 2B: Alternative Prediction Targets (if Stage 2 fails)

### Option 2B.1: Generation Count

**Goal**: Derive why 3 generations, not 2 or 4

**Current conjecture**: 3 = dim(Im_H)

**Task**: Make this rigorous or find alternative

### Option 2B.2: 200 TeV Physics

**Goal**: Explore what else happens at the "interface scale"

**Questions**:
- Is 200 TeV a phase transition?
- New particles predicted?
- Symmetry restoration?

### Option 2B.3: Mass Ratios

**Goal**: Any handle on fermion mass hierarchy?

**This is very hard** — may not be tractable

---

## Stage 3: Prediction Sharpening

**Goal**: Make the most testable prediction as precise as possible

### 3.1 sin²θ_W = 1/4 Analysis

**Task**: Full analysis of the Weinberg angle prediction

**Questions**:
- Exactly what does the framework predict?
- At what scale? (Currently: ~188-200 TeV)
- What's the uncertainty?
- How does this compare to GUT predictions?
- What would FCC-hh actually measure?

### 3.2 Auxiliary Predictions

**Task**: What else follows from sin²θ_W = 1/4?

**Possibilities**:
- Relation to other mixing angles?
- Implications for electroweak symmetry breaking?
- Connection to Higgs sector?

### 3.3 Falsification Criteria

**Task**: State precisely what would falsify the prediction

**Deliverable**: Clear falsification statement

### Stage 3 Checkpoint

**Questions**:
1. Is the prediction sharp enough to be tested?
2. What precision is needed to distinguish from alternatives?
3. When could this realistically be tested?

---

## Stage 4: Cosmological Predictions

**Goal**: Explore predictions in cosmology domain

### 4.1 Dark Sector

**Current state**: 58/79 visible/dark split mentioned but not developed

**Task**: Develop this into quantitative prediction

### 4.2 Cosmological Constant

**Task**: Can |Π| or perspective structure predict Λ?

### 4.3 Early Universe

**Task**: What does perspective framework say about inflation, baryogenesis?

---

## Stage 5: Documentation for External Review

**Goal**: Package findings for physicist evaluation

### 5.1 One-Page Summary

**Task**: Distill to single page with:
- Core claim
- Main derivation
- Key prediction
- What would falsify it

### 5.2 Technical Document (10-15 pages)

**Task**: Full but focused presentation
- Axioms (1 page)
- Derivation chain (5 pages)
- Predictions with confidence levels (3 pages)
- Comparison to other approaches (2 pages)
- Open questions (2 pages)

### 5.3 Response to Anticipated Objections

**Task**: Pre-answer likely criticisms
- "This is just numerology"
- "Division algebras have been tried before"
- "No new testable predictions"
- "Circular reasoning"

---

## Timeline and Priorities

### Immediate (Next 1-2 Sessions)

1. **Stage 1.1**: Audit derivation chain
2. **Stage 1.2**: Run verification scripts
3. **Stage 1.3**: Update Layer 3

### Near-Term (Sessions 3-5)

4. **Stage 2**: Attempt hypercharge derivation
5. **Stage 2 Checkpoint**: Assess results

### Medium-Term (Sessions 6-10)

6. **Stage 3**: Sharpen predictions
7. **Stage 4**: Explore cosmological domain
8. **Stage 5**: Prepare external documentation

---

## Success Criteria

### Minimum Success (Framework is "interesting")

- [ ] Derivation chain audited, weakest links identified
- [ ] At least one unique testable prediction clearly stated
- [ ] Layer 3 accurately reflects current state
- [ ] Falsification criteria explicit

### Target Success (Framework is "compelling")

- [ ] All of minimum, plus:
- [ ] Hypercharge values derived OR clear reason why not
- [ ] sin²θ_W prediction fully developed with uncertainty
- [ ] Comparison to GUT/other approaches favorable
- [ ] External-ready documentation complete

### Stretch Success (Framework demands attention)

- [ ] All of target, plus:
- [ ] Mass hierarchy insight (even partial)
- [ ] Generation count derived
- [ ] Novel cosmological prediction

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Derivation chain has fatal flaw | MEDIUM | HIGH | Audit thoroughly in Stage 1 |
| Hypercharge derivation fails | HIGH | MEDIUM | Have Stage 2B alternatives ready |
| 200 TeV untestable for decades | HIGH | MEDIUM | Seek nearer-term predictions |
| Framework is sophisticated numerology | MEDIUM | FATAL | Honest assessment, falsification criteria |
| Better framework exists in literature | LOW | HIGH | Literature review |

---

## Files to Track

| File | Purpose | Update Frequency |
|------|---------|------------------|
| This file | Master roadmap | Each stage completion |
| `session_log.md` | Work history | Every session |
| `layer_3_predictions.md` | Prediction status | After Stage 1.3, then as needed |
| `registry/RESEARCH_NAVIGATOR.md` | Current priorities | As priorities shift |

---

**Next Action**: Begin Stage 1.1 (Derivation Chain Audit)

