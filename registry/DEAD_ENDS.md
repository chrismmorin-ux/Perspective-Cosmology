# Dead Ends Registry

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Document failed approaches and what we learned from them
**Rule**: Every significant failure deserves documentation

---

## Why This Exists

The Red Team identified survivorship bias: we see successes but not failures. This file corrects that by documenting approaches that DIDN'T work.

**Failures are data. Document them.**

---

## Major Dead Ends

### DE-001: Weinberg Angle as sin²(θ_W) = 2/25

| Field | Value |
|-------|-------|
| **Proposed** | Early sessions (~S30-40) |
| **Formula** | sin²(θ_W) = 2/25 = 0.08 |
| **Measured** | sin²(θ_W) ≈ 0.223 |
| **Error** | 65% (catastrophic) |
| **Lesson** | Simple ratios insufficient; need more sophisticated structure |
| **Replacement** | cos(θ_W) = 171/194 (different observable, different structure) |
| **Status** | FALSIFIED — moved to `claims/FALSIFIED.md` |

---

### DE-002: Direct Cosmological Constant from α

| Field | Value |
|-------|-------|
| **Proposed** | ~S70 |
| **Formula** | Λ ~ α⁴ × M_Pl⁴ |
| **Result** | Off by 10¹¹⁷ orders of magnitude |
| **Lesson** | Naive dimensional analysis fails for Λ; crystallization ground state ≠ cosmological constant |
| **Current approach** | Λ emerges from crystallization dynamics, not simple scaling |
| **Status** | ABANDONED |

---

### DE-003: CKM Angles as Simple π Fractions

| Field | Value |
|-------|-------|
| **Proposed** | ~S50 |
| **Hypothesis** | CKM angles should be simple fractions of π |
| **Result** | Only Cabibbo angle works (~π/14); others fail badly |
| **Lesson** | CKM structure more complex than simple geometric ratios |
| **Status** | PARTIAL — Cabibbo relation kept, others abandoned |

---

### DE-004: n_c = 15 (Full Division Algebra Sum)

| Field | Value |
|-------|-------|
| **Hypothesis** | n_c = R + C + H + O = 1 + 2 + 4 + 8 = 15 |
| **Problem** | Predictions worse with n_c = 15 vs n_c = 11 |
| **Resolution** | O decomposes as H + H from internal perspective → n_c = 11 |
| **Lesson** | The "obvious" algebraic choice isn't always correct |
| **Status** | RESOLVED — n_c = 11 adopted with justification |

---

### DE-005: Higgs Mass from Simple Ratio

| Field | Value |
|-------|-------|
| **Proposed** | ~S60 |
| **Formula** | m_H = v × (simple fraction) |
| **Problem** | Multiple fractions give ~1% accuracy; none stood out |
| **Resolution** | m_H = v × 121/238 emerges from electroweak sector completion |
| **Lesson** | Higgs mass requires full electroweak context |
| **Status** | RESOLVED — better derivation found in S111 |

---

### DE-006: Hilltop mu^2 = H^4(H+R)/Im_O = 1280/7 (with phi_CMB = mu/sqrt(5))

| Field | Value |
|-------|-------|
| **Proposed** | Session 127 |
| **Formula** | mu^2/M_Pl^2 = H^4(H+R)/Im_O = 256 * 5 / 7 = 1280/7 ~ 182.86 |
| **phi_CMB** | mu/sqrt(5) (INCORRECT for r = 1 - n_s) |
| **Problem** | This phi_CMB gives eta/eps = -4, not -5; N = 36.76 e-folds |
| **Error** | Wrong phi_CMB location for desired r = 1 - n_s relation |
| **Why it failed** | Session 127 incorrectly assumed phi_CMB = mu/sqrt(5) for eta/eps = -5. The actual requirement is phi_CMB = mu/sqrt(6). |
| **Verification** | `hilltop_efold_calculation.py`, `hilltop_correct_conditions.py` |
| **Lesson** | Check eta/eps ratio calculation carefully. The error propagated through S127-S129 early. |
| **Correct solution** | mu^2 = (C+H)*H^4/Im_O = 1536/7 at phi_CMB = mu/sqrt(6) gives N = 52, eta/eps = -5 |
| **Status** | SUPERSEDED by correct solution (Session 129 continuation) |

**Note**: The "r = 1 - n_s" relation is NOT falsified — only the specific mu^2/phi_CMB combination was wrong. With the corrected values, r = 1 - n_s = 0.035 is VERIFIED.

---

## Pattern Analysis of Failures

### What Tends to Fail

1. **Simple ratios for precision values** — Nature is more subtle
2. **Naive dimensional analysis** — Right units ≠ right physics
3. **Ignoring substructure** — O ≠ O when viewed internally
4. **One-parameter fits** — Need structural depth

### What Tends to Work

1. **Multi-step derivations** — Structure builds on structure
2. **Cyclotomic polynomials** — Phi_6 appears repeatedly
3. **Same numbers across domains** — Coherence as evidence
4. **Corrections that have interpretations** — Not arbitrary adjustments

---

### DE-007: Naive Goldstone = Gauge Boson Identification (12 = 12)

| Field | Value |
|-------|-------|
| **Proposed** | Session 132 |
| **Formula/Hypothesis** | 12 Goldstone modes from U(4)→U(1)^4 ARE the 12 SM gauge bosons |
| **Result** | Generator types don't match: coset has 12 off-diagonal, SM has 8 off-diag + 4 diagonal |
| **Error** | Structural mismatch (not just numerical) |
| **Lesson** | Dimensional coincidences are necessary but not sufficient. Must check generator TYPES, not just counts. |
| **Replacement** | Pati-Salam SU(4) from 4×4 tilt matrix (same n_d = 4, different mechanism) |
| **Status** | FALSIFIED — but led to stronger Pati-Salam connection |
| **Script** | `verification/sympy/goldstone_gauge_analysis.py` (8/8 PASS) |

**What went right**: The speculation was properly tagged [SPECULATION] and immediately tested. Self-correction within the same session demonstrates healthy methodology.

---

### DE-008: Tilt Quartic Coupling b = M_Pl^4

| Field | Value |
|-------|-------|
| **Proposed** | Session 132 |
| **Formula/Hypothesis** | b = M_Pl^4 (Planck-scale quartic coupling in tilt potential W = -a|eps|^2 + b|eps|^4) |
| **Result** | Condensate energy a^2/(4b) = alpha^4 M_Pl^4 ~ 2.8e-9 exceeds V_0 ~ 1.3e-9 M_Pl^4. Turns hilltop into local minimum, destroying inflation. |
| **Error** | 4.3x too large (b_max = 0.23 M_Pl^4) |
| **Lesson** | The Mexican hat depth must be shallower than the inflationary hilltop. Self-consistency of the two-field system constrains b. |
| **Replacement** | b = alpha * M_Pl^4 = M_Pl^4/137 (condensate is 1.6% of V_0, hilltop preserved) |
| **Status** | FALSIFIED -- Session 133 self-consistency analysis |
| **Script** | `verification/sympy/veff_landscape_tension.py` (12/12 PASS), `veff_resolution_b_constraint.py` (10/10 PASS) |

**What went right**: The tension was flagged as an OPEN QUESTION in Session 132 (Part 7b of crystallization_dynamics.md). Session 133 quantified it, confirmed it's real, and found the resolution. The corrected b = alpha M_Pl^4 preserves eps* = alpha, all CMB predictions, and the g(phi) unification while making the condensate sub-dominant.

**Key constraint discovered**: b < V_0/(2*alpha^4) ~ 0.23 M_Pl^4 (inflationary self-consistency).

---

### DE-009: Democratic Superposition as Photon Identification (Sub-problem B)

| Field | Value |
|-------|-------|
| **Proposed** | Session 141 (as Sub-problem B of Step 5 gap closure) |
| **Formula/Hypothesis** | The photon is the democratic superposition (1/sqrt(N_I)) * sum of all 137 interface modes. When ε acquires a VEV, only this combination remains massless. |
| **Result** | FUNDAMENTAL OBSTRUCTION. Democratic coupling requires ε* ∝ I (identity VEV), which preserves ALL symmetry and breaks NOTHING. Any VEV that breaks U(4)×U(11) → SM treats generators unequally by construction. |
| **Error** | Structural (not numerical) — the two requirements are logically contradictory |
| **Lesson** | In standard gauge theory, the Higgs mechanism ALWAYS distinguishes broken from unbroken generators. The photon is a SPECIFIC generator (Q = T³ + Y/2 in the SM), not a democratic superposition. The "dilution" picture for α = 1/N_I is incompatible with gauge symmetry breaking. |
| **What it DOES confirm** | The breaking U(4)×U(11) → SU(3)×SU(2)×U(1) gives exactly 125 broken + 12 unbroken generators (125 = 56 + 41 + 28). This strengthens the SM gauge group derivation. |
| **Replacement** | Sub-problems A (KK/induced) and C (normalization) remain open. Also: the framework may not be a standard gauge theory — the coupling may arise from a different mechanism entirely. |
| **Status** | FALSIFIED — Session 145 analysis |
| **Script** | `verification/sympy/symmetry_breaking_photon_analysis.py` (16/16 PASS) |

**Key insight**: The obstruction is structural, not technical. More work cannot fix it within the standard Higgs mechanism. Either the framework requires a non-standard coupling mechanism (not Higgs), or α = 1/137 arises from normalization (Sub-problem C) or compactification (Sub-problem A), not from symmetry breaking.

**Positive result**: The 137 → 12 breaking IS confirmed with correct generator counting: 56 (cross-block) + 41 (U(7) → SU(3)) + 28 (defect-crystal) = 125. The number 41 matches the Goldstone count from Session 132b.

---

## Template for New Dead Ends

```markdown
### DE-XXX: [Descriptive Title]

| Field | Value |
|-------|-------|
| **Proposed** | Session [N] |
| **Formula/Hypothesis** | [what was tried] |
| **Result** | [what happened] |
| **Error** | [how wrong] |
| **Lesson** | [what we learned] |
| **Status** | ABANDONED / RESOLVED / PARTIAL |
```

---

### DE-010: Alpha from Sigma Model f^2 = 1/N_I (S149)

| Field | Value |
|-------|-------|
| **Proposed** | Session 147 |
| **Idea** | In HLS formalism, alpha = f^2 * a with a=1 (KSRF). Need f^2 = 1/N_I. |
| **Problem** | Crystallization VEV gives f^2 ~ 10^2, not 1/137. Off by factor ~2*10^6. |
| **Lesson** | The crystallization potential's VEV is set by mu^2/(2b), which is O(1) in Planck units — nowhere near 1/137. |
| **Status** | FALSIFIED (S149) — `alpha_step5_three_paths.py` Section 4 |

### DE-011: Alpha from UV Democracy + RG Running (S148-149)

| Field | Value |
|-------|-------|
| **Proposed** | Session 148 |
| **Idea** | All 137 modes have coupling 1/137 at UV scale; SM running brings it to 1/137.036 at low energy. |
| **Problem** | 1/alpha = 137 is the IR value. QED screening makes 1/alpha DECREASE at higher energy. Running goes the wrong direction. For 4/111 to come from running, UV scale would be ~0.524 MeV (barely above m_e) — unphysical. |
| **Lesson** | The formula 137 + 4/111 must be structural, not dynamical RG running. |
| **Status** | FALSIFIED (S149) — `alpha_step5_three_paths.py` Section 5 |

---

## Statistics

| Metric | Value |
|--------|-------|
| Total documented dead ends | 11 |
| Estimated undocumented (early sessions) | ~20-30 |
| Dead ends leading to better approaches | 5/11 (45%) |
| — Resolved (found better formula) | DE-001, DE-004, DE-005 |
| — Superseded (corrected version found) | DE-006, DE-008 |
| Cleanly falsified (structural obstruction) | DE-009, DE-010, DE-011 |
| Abandoned (no replacement) | DE-002, DE-003 (partial), DE-007 |

*Updated 2026-02-02.*

---

*Failures teach as much as successes. Document them.*
