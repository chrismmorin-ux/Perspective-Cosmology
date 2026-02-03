# Recommendation Engine — FROZEN

**FROZEN at Session 131.** This file is preserved as a historical snapshot. It is no longer read at session start or updated at session end.

**For current work backlog**: Read `sessions/INDEX.md` instead.

---

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Updated**: 2026-01-29 (Session 131)
**Purpose**: Historical snapshot (was: master project queue)

---

## How This Works

Each session, Claude reads this file and recommends the TOP PRIORITY based on:
1. Impact on "derivation vs discovery" question
2. Feasibility with current tools
3. Time since last progress
4. Dependencies resolved

## Project Categories

| Category | Focus | Examples |
|----------|-------|----------|
| **CORE** | Complete the derivation chain | Gauge groups, 1836 rigor |
| **EXTEND** | New physics domains | Neutrinos, gravity, CKM |
| **DEEPEN** | Understand patterns | Fourth-power primes, 200 family |
| **EXPERIMENTAL** | Contact with measurement | Dark matter, CMB-S4 |
| **META** | Framework validation | LLM challenge, expert review |

---

## Current Priority Stack

**Last Updated**: 2026-01-28

### PRIORITY 1: LLM Derivation Challenge ✅ PARTIAL (Test 1 Complete)

**What**: Test if GPT-4/other LLMs derive same numbers from axioms alone
**Why**: Directly tests reproducibility without target knowledge
**Status**: **TEST 1 COMPLETE — FULL SUCCESS**

**Results** (Session 128):
- Claude subagent derived n_d=4, n_c=11, 137 from axioms alone
- Valid mathematical reasoning (Frobenius theorem, imaginary dimension counting)
- Self-corrected on n_c interpretation (initially tried 4, corrected to 11)

**Remaining**:
- [ ] Run GPT-4 external test (true independence)
- [ ] Run Gemini/Llama tests
- [ ] Update probability estimates if external tests succeed

**Results file**: `registry/llm_challenge/results/SUMMARY.md`
**Axiom document**: `framework/axioms_for_llm_challenge.md`

**Significance**: Internal test is ENCOURAGING but not conclusive. External tests needed.

---

### PRIORITY 2: Φ₆ Cyclotomic Derivation ✅ RESOLVED

**What**: Derive WHY Φ₆ specifically (not Φ₄, Φ₈, etc.)
**Why**: Was the weakest link in alpha derivation
**Status**: **RESOLVED** (Session 121)

**Resolution**:
1. Φ₆ **EMERGES** from Lie algebra generator counting (not chosen)
2. EM channels = n² - n + 1 = Φ₆(n) by mathematical identity
3. **NEW**: Identity Φ₆(n) = Φ₃(n-1) connects to quaternionic structure (3 = Im_H)
4. Division algebra connection: 6 = C × Im_H = 2 × 3

**Verification**: `verification/sympy/phi6_lie_algebra_connection.py` — ALL TESTS PASS

**Remaining**: Why u(n) symmetry for the crystal? (This is at the level of "why does physics work this way?" — applies to all of physics)

---

### PRIORITY 3: n_c = 11 Rigorous Derivation ✅ RESOLVED

**What**: Find rigorous justification for n_c = 11
**Why**: n_c = 11 is foundational; needed rigorous derivation
**Status**: **RESOLVED** (Session 123)

**Resolution**:
1. n_c = Im_C + Im_H + Im_O = 1 + 3 + 7 = 11 (total imaginary dimensions)
2. Equivalently: R + C + H + O - 4 = 15 - 4 = 11 (remove shared real axes)
3. Key insight: n_c + n_d = 11 + 4 = 15 = total division algebra dimension
4. The "-4" is NOT arbitrary: removes real axis counted 4 times

**Verification**: `verification/sympy/nc_11_rigorous_derivation.py` — 9/9 PASS

---

### PRIORITY 4: Gauge Groups from Division Algebras ✅ RESOLVED

**What**: Derive SU(3)×SU(2)×U(1) from division algebra structure
**Why**: Completes chain "Observation → Standard Model gauge group"
**Status**: **RESOLVED** (Session 124)

**Resolution**:
1. **Two mechanisms identified**: Unit elements (for C, H) vs Automorphisms (for O)
2. C → U(1): Unit complex numbers form circle group
3. H → SU(2): Unit quaternions form 3-sphere ≅ SU(2) (explicit matrix isomorphism)
4. O → SU(3): Aut(O) = G_2, stabilizer under F=C is SU(3)
5. Full derivation chain: T1 → F=C → Division algebras → SM gauge group
6. **Key insight**: Gauge transformations must compose associatively, so:
   - Associative algebras: use unit elements (form Lie group)
   - Non-associative O: use automorphisms (G_2 is associative by construction)

**Verification**: `verification/sympy/gauge_group_from_division_algebras_rigorous.py` — 11/11 PASS

**Imports**: None — only mathematical facts (Hurwitz theorem, Lie group theory)

---

### PRIORITY 5: 1836 Derivation with Same Rigor as 137 ✅ RESOLVED

**What**: Rigorous derivation of m_p/m_e = 1836 + 11/72
**Why**: Second sub-ppm prediction needs same chain quality as alpha
**Status**: **RESOLVED** (Session 124)

**Resolution**:
1. **Key insight**: 153 = Im_H² + dim_SM² = 9 + 144 (purely dimensional!)
2. **12 = dim(SM gauge)** — From Session 124 gauge derivation
3. **1836 = 12 × 153** — Gauge dimension × interaction channels
4. **11/72 = n_c/(O × Im_H²)** — Crystal correction
5. **Full chain**: T1 → Division algebras → Gauge dim → m_p/m_e

**Verification**: `verification/sympy/proton_electron_ratio_rigorous.py` — 11/11 PASS

**Error**: 0.057 ppm (sub-ppm verified)

---

### PRIORITY 6: Blind Prediction Practice [META]

**What**: Derive predictions for quantities you don't know, then check
**Why**: Only way to establish genuine predictive power
**Feasibility**: HIGH — discipline issue
**Impact**: Accumulates over time
**Status**: ONGOING
**Category**: META

**Action Steps**:
1. Identify poorly-measured or unmemorable quantities
2. Derive framework prediction FIRST
3. Look up measurement AFTER
4. Log results in BLIND_PREDICTIONS.md

**Success Criterion**: Track record of predictions (aim for 70%+ hit rate)

---

## Future Project Queue

### HIGH PRIORITY (Next 10 Sessions)

| ID | Project | Category | Impact | Feasibility |
|----|---------|----------|--------|-------------|
| F1 | Fourth-power prime hierarchy (17→97→337) | DEEPEN | HIGH | HIGH |
| F2 | Running couplings unification | CORE | VERY HIGH | MEDIUM |
| F3 | Complete dark matter package | EXPERIMENTAL | VERY HIGH | HIGH |
| F4 | Derive G (Newton's constant) | EXTEND | VERY HIGH | LOW |
| F5 | The "200 family" pattern | DEEPEN | MEDIUM | HIGH |
| F6 | Axiomatic derivation of b (tilt quartic coupling) | CORE | HIGH | MEDIUM | **PARTIAL** (S138: λ free at 1-loop RG AND CW; disc<0 PROVEN ∀N≥4; quartic selects (5,6) not (4,7); **cubic Tr(φ³) required** for (4,7) selection; need cubic coupling mechanism) |

### MEDIUM PRIORITY (Sessions 10-25)

| ID | Project | Category | Impact | Feasibility |
|----|---------|----------|--------|-------------|
| M1 | Neutrino masses from octonions | EXTEND | VERY HIGH | LOW |
| M6 | QCD string tension from O-channel Casimir | PARTIALLY RESOLVED | HIGH | MEDIUM | S152: 6 findings (30/30 PASS). Beta coefficients = framework numbers. Luscher = piC/(O*Im_H). sqrt(sigma)=8m_p/17 [CONJECTURE, HRS=5]. Constituent decomposition found but not derivable from QCD dynamics. Open: lattice test of 17/24, 24 double-appearance connection. |
| M7 | Tilt field Casimir between black hole horizons | EXTEND | MEDIUM | LOW | S150: eps=0 at horizons = Dirichlet BC for tilt. Planck-scale effect. |
| M2 | CKM/PMNS mixing angles | EXTEND | VERY HIGH | LOW |
| M3 | Proton lifetime prediction | EXTEND | HIGH | MEDIUM |
| M4 | Octonion Fano plane → 3 generations | DEEPEN | HIGH | MEDIUM |
| M5 | CMB-S4 specific predictions | EXPERIMENTAL | HIGH | MEDIUM |

### LONG-TERM (Sessions 25+)

| ID | Project | Category | Impact | Feasibility |
|----|---------|----------|--------|-------------|
| L1 | Complete QFT Lagrangian from crystallization | EXTEND | VERY HIGH | LOW |
| L2 | Black hole entropy from perspective | EXTEND | HIGH | LOW |
| L3 | Quantum gravity emergence | EXTEND | VERY HIGH | VERY LOW |
| L4 | Expert review and publication | META | VERY HIGH | MEDIUM |

---

## Priority Selection Algorithm

When starting a session, select priority based on:

```
IF (LLM_DERIVATION_CHALLENGE not done) AND (time available > 2 hours):
    → PRIORITY 1
ELSE IF (Φ₆ derivation has new leads):
    → PRIORITY 2
ELSE IF (literature review possible):
    → PRIORITY 3
ELSE IF (computation session):
    → PRIORITY 4
ELSE:
    → PRIORITY 5 (always applicable)
```

---

## Completed Priorities (Archive)

Move completed items here with date and outcome.

| Priority | Completed | Outcome |
|----------|-----------|---------|
| Φ₆ Cyclotomic Derivation | Session 122 | Emerges from Lie algebra structure, not chosen |
| n_c = 11 Rigorous Derivation | Session 123 | Total imaginary dimensions: Im_C + Im_H + Im_O |
| n_d = 4 Rigorous Derivation | Session 123 | From associativity + Frobenius theorem |
| Unified Derivation Chain | Session 123 | Observation → 137 complete (18/18 tests) |
| **Gauge Groups from Div Algebras** | **Session 124** | **T1 → SM gauge group complete (11/11 tests)** |
| **1836 Derivation Rigor** | **Session 124** | **T1 → m_p/m_e = 1836.153 complete (11/11 tests, 0.057 ppm)** |
| **Crystallization n_s Derivation** | **Session 127-129** | **n_s = 193/200 survives; r = 1 - n_s falsified; mu^2 = 250 candidate** |
| **V_eff Self-Consistency** | **Session 133** | **b = M_Pl^4 falsified; b < 0.23 M_Pl^4 required; b = alpha M_Pl^4 resolves tension (22/22 tests)** |
| **Born Rule from Crystallization** | **Session 134** | **P(k)=\|c_k\|² from martingale on pure state manifold (12/12 tests). One [A-PHYSICAL] assumption.** |

---

## Deferred Priorities

Items that were deprioritized and why.

| Item | Reason Deferred | Revisit When |
|------|-----------------|--------------|
| SO(3)/SO(2) sigma model | Requires more physics background | After literature review |
| Expert outreach | Need better materials first | After LLM challenge results |
| Translation guide | Lower impact than core derivations | After Priorities 1-4 |

---

## Session Start Protocol

1. Read this file
2. Check status of current top priority
3. Recommend to user: "Top priority is [X]. Shall we work on this?"
4. If user agrees, proceed
5. If user has different goal, accommodate but note deviation

---

## Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Priorities completed | **9** (P1 partial) | 10 |
| Active priorities | 2 (LLM external, CMB Phase 5) | — |
| Future projects queued | 15 | 20+ |
| Blind predictions logged | **16** (7 original + 2 S124 + 7 S138b) | 20 |
| Expert responses received | 0 | 1 |
| CMB Plan phases complete | **4 of 6** (Phase 4 ALL DONE) | 6 |

---

## Adding New Projects

When a new project idea arises:

1. **Categorize**: CORE / EXTEND / DEEPEN / EXPERIMENTAL / META
2. **Assess Impact**: How much does this advance the framework?
3. **Assess Feasibility**: Can we do this with current tools?
4. **Add to Queue**: Put in HIGH/MEDIUM/LONG-TERM based on priority
5. **Update Metrics**: Increment "Future projects queued"

---

*This engine ensures systematic progress on the most impactful work.*
*Last updated: Session 133*
