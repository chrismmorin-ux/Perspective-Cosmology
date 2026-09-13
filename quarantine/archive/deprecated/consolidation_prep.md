# Document Consolidation Prep (Full Reference)

**Created**: 2026-01-26
**Purpose**: Complete analysis of all investigation documents for thread migration

---

## Cluster A: Alpha-137

### 1. tilt_alpha_connection.md

**Atomic Units**:
- DEF_02A2: Tilt Matrix (ε_ij = ⟨π(b_i), π(b_j)⟩ - δ_ij) — NEW
- DRV_0A00: α = 1/(n_d² + n_c²) via U(n) generator counting — NEW
- CNJ_0803: Weinberg angle as literal tilt angle — NEW

**Continuation**: Established α = 1/137 as 1/(tilt parameters). Next: derive specific ε_ij for masses/mixing, explain why EM has this structure, check weak/strong.

**Work Items**: Derive why EM has n²+m² (5), connect θ_W to tilt (4), check other couplings (3), formalize tilt definition (2)

**Adjacent**: alpha_crystal_interface.md, pi_derivation_attempt.md — SHOULD MERGE

---

### 2. alpha_137_session_34_notes.md

**Atomic Units**:
- THM_0481: Grassmannian identity Gr(k,n) + SO(k) + SO(n-k) = C(n,2) — NEW
- DRV_0A01: 55 = configuration space dimension (three interpretations) — NEW

**Continuation**: 55 fully derived geometrically. Division algebra gap **PARTIALLY RESOLVED (S54)**: no-zero-divisors derived from perspective definition. Remaining: invertibility.

**Work Items**: ~~Close division algebra gap (5)~~ DONE (S54), investigate n_c derivation (4), formalize 137 = coupling (3), add Grassmannian theorem (2)

**Adjacent**: associativity_derivation.md, tilt_alpha_connection.md

---

### 3. pi_derivation_attempt.md

**Atomic Units**:
- DRV_0A02: |Π| = k^(n choose 2) from edge-labelings of K_n — NEW
- DRV_0A03: Perspectives = tilt configurations (137^55) — NEW

**Continuation**: Structure |Π| = 137^55 justified. Next: derive tilt quantization (why 137 discrete states), prove tilt↔perspective bijection.

**Work Items**: Derive 137 states per pair (5), prove bijection (4), test dimensional reduction (3), document edge-labeling (2)

**Adjacent**: dark_sections_and_pi_formula.md, alpha_crystal_interface.md

---

### 4. associativity_derivation.md

**Atomic Units**:
- THM_0482: Hurwitz theorem (standard)
- DRV_0A04: Time → associativity → n_d ≤ 4 — NEW (PARTIAL)

**Continuation**: Division algebra gap **PARTIALLY RESOLVED (S54)**: no-zero-divisors derived from perspective definition ("can't see subset of zero"). Remaining gap: invertibility (plausible but not proven).

**Work Items**: ~~Close division algebra gap (5)~~ MOSTLY DONE (S54), explore spinor alternatives (4), ~~consider [A-DIV] axiom (3)~~ REDUCED, document evidence (2)

**GAP**: REDUCED — only invertibility remains unproven. See `framework/investigations/perspective_foundations_and_zero_divisors.md`

---

### 5. alpha_crystal_interface.md

**Atomic Units**:
- CNJ_0804: 0.036 correction mechanisms — NEW
- DRV_0A05: Running via spectral dimension reduction — NEW

**Continuation**: Running model (4→2, 11→6) gives correct direction. Next: derive 11→6 at GUT, connect to β-function.

**Work Items**: Derive 11→6 reduction (4), connect to β-function (4), derive 0.036 (3), merge with tilt_alpha (2)

**Adjacent**: tilt_alpha_connection.md — HEAVY OVERLAP, MERGE

---

## Cluster B: Dark Sector

### 6. dark_sector_from_partiality.md

**Atomic Units**:
- DRV_0A06: 58 + 79 = 137 channel counting — NEW
- CNJ_0805: 49 hidden vectors = SU(7) × U(1) — NEW
- CNJ_0806: 16 hidden fermions = SO(10) spinor — NEW
- DRV_0A07: 79/137 ≈ 1/√3 — NEW

**Continuation**: P1 guarantees hidden content. Next: derive 1/√3 geometrically, check SU(7) anomaly cancellation, propose observable.

**Work Items**: Derive 1/√3 (5), check anomalies (4), propose observable (4), connect to Λ (3)

---

### 7. dark_sections_and_pi_formula.md

**Atomic Units**:
- DRV_0A08: 55 = 6 Light + 21 Dark + 28 Twilight — NEW
- CNJ_0807: Twilight mediates dark-light coupling — NEW

**Continuation**: Pair decomposition gives Dark/Light ≈ 3.5:1. Next: model twilight physics, derive f = 0.113.

**Work Items**: Model twilight physics (4), derive f = 0.113 (4), SO(8) connection? (3), test ratio (2)

---

### 8. continuous_visibility_model.md

**Atomic Units**:
- DEF_02A3: Visibility v_i(π) = ||Proj_{V_π}(b_i)||² — NEW
- THM_0483: v_i = cos²(θ_i) — NEW
- DRV_0A09: α depends on Σv_i only — NEW

**Continuation**: Visibility formalism complete. Next: derive dynamics, analyze stability of binary split.

**Work Items**: Derive dv_i/dt (4), analyze bistability (4), derive f = 0.113 (3), connect to compactification (2)

---

### 9. perspective_mutations.md

**Atomic Units**:
- DEF_02A4: Mutation = (π₁, π₂) where adjacent — NEW
- THM_0484: Mutation Conservation dim(Lost) = dim(Gained) — NEW
- CNJ_0808: Antisymmetry forces visibility — NEW
- CNJ_0809: Λ ~ 1/|Π| — NEW

**Continuation**: Mutation formalism plus visibility hypothesis. Next: derive antisymmetry→visibility, investigate mutation algebra.

**Work Items**: Derive antisymmetry→visibility (4), mutation algebra (4), derive 1/√3 (3), formalize Λ connection (3)

---

## Cluster C: Primes

### 10. BREAKTHROUGH_primes_as_perfect_separation.md

**Atomic Units**:
- CNJ_0810: Primes = irreducible orthogonal dimensions — NEW
- CNJ_0811: Physics = tilt measurement — NEW

**Continuation**: "Primes = perfect separation, physics = imperfect." Next: derive distribution, connect tilts to couplings.

**Work Items**: Derive distribution (3), connect tilts to α (3), formalize theorem (2), twin primes (2)

---

### 11. perspective_connection.md

**Atomic Units**:
- THM_0485: φ: (N⁺, ×) → V_Crystal isomorphism — NEW
- THM_0486: Squarefree = binary vectors — NEW
- DRV_0A10: Multiplication from C2 + Π2 + T1 — NEW

**Continuation**: Formal isomorphism verified. Next: explain ordering, investigate density.

**Work Items**: Explain ordering (4), density interpretation (3), formalize theorems (2), classic problems (1)

---

## Foundation

### 12. layer_0_pure_axioms.md

**Existing Gaps**: 1 (points), 2 (global/local tilt), 3 (time direction), 4 (why perspective), 5 (measure on Π)

**New Gaps to Add**:
- Gap 6: Division algebra (n_d = 4)
- Gap 7: Why n_c = 11
- Gap 8: Tilt quantization
- Gap 9: Visibility dynamics

**Work Items**: Close Gap 6 (5), close Gap 1 (5), add new gaps (4), investigate quantization→points (3)

---

## Complete Work Item Queue

### Score 5 (Critical)
| ID | Item | Thread |
|----|------|--------|
| W-001 | Close division algebra gap | alpha_137 |
| W-002 | Point emergence from continuous space | foundation |
| W-003 | Derive 137 states per pair | alpha_137 |

### Score 4 (High)
| ID | Item | Thread |
|----|------|--------|
| W-004 | Derive 1/√3 hidden fraction | dark_sector |
| W-005 | Derive visibility dynamics | dark_sector |
| W-006 | Derive antisymmetry → visibility | mutations |
| W-007 | Explain prime ordering | primes |
| W-008 | Prove tilt↔perspective bijection | alpha_137 |
| W-009 | Derive 11→6 reduction | alpha_137 |
| W-010 | Check SU(7) anomalies | dark_sector |

### Score 3 (Medium)
| ID | Item | Thread |
|----|------|--------|
| W-011 | Model twilight physics | dark_sector |
| W-012 | Mutation algebra structure | mutations |
| W-013 | Connect Λ ~ 1/|Π| | dark_sector |
| W-014 | Formalize Mult Emergence | primes |
| W-015 | Derive f = 0.113 | dark_sector |

### Score 2 (Low)
| ID | Item | Thread |
|----|------|--------|
| W-016 | Formalize tilt definition | alpha_137 |
| W-017 | Document edge-labeling | alpha_137 |
| W-018 | Test dark matter ratio | dark_sector |
| W-019 | Connect to compactification | dark_sector |

---

## Merge Recommendations

1. **tilt_alpha_connection.md + alpha_crystal_interface.md** → threads/alpha_137/THREAD.md
2. **BREAKTHROUGH + perspective_connection.md** → threads/primes_orthogonality/THREAD.md
3. **Session notes** → extract permanent content, archive rest
