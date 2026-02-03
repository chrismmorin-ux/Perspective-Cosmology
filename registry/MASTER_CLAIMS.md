# Master Claims Registry

> **⚠️ DEPRECATED (Session 176, 2026-02-01)**
>
> This file has been **archived** and is no longer maintained. Last substantive update: Session 102.
>
> **Superseded by**:
> - `registry/CLAIM_DEPENDENCIES.md` — dependency graph (current through S144+)
> - `registry/derivations_summary.md` — all derived constants (current through S142+)
> - `registry/FALSIFICATION_REGISTRY.md` — falsification criteria
>
> **Archived copy**: `archive/deprecated/MASTER_CLAIMS_S102.md`
>
> The combined coverage of CLAIM_DEPENDENCIES + derivations_summary fully replaces
> this file's original purpose. Maintaining a third redundant registry was causing
> sync failures (this file fell 73 sessions behind).

**Purpose**: ~~Single source of truth for ALL claims, their dependencies, and status~~
**Inspired by**: [Lean Blueprint](https://github.com/PatrickMassot/leanblueprint), [KnowTeX](https://arxiv.org/html/2601.15294)

## ~~✅ UPDATED (Session 102)~~ ❌ DEPRECATED (Session 176)

This registry covers sessions through Session 102 only. See files above for current state.

---

## How This Works

Each claim has:
- **ID**: Unique identifier (AXM/THM/DRV/CNJ prefix + number)
- **Status**: AXIOM | DERIVED | MATCHED | CONJECTURE | FALSIFIED
- **Uses**: List of claim IDs this depends on
- **Enables**: List of claim IDs that depend on this (auto-generated)
- **Verification**: Link to SymPy script or proof
- **Accuracy**: For numerical claims

When a claim's status changes, all downstream claims are flagged for review.

---

## Layer 0: Axioms (No Dependencies)

### Core Perspective Axioms

| ID | Name | Status | Uses | Session |
|----|------|--------|------|---------|
| AXM_0100 | Finiteness | AXIOM | — | — |
| AXM_0101 | Connectivity | AXIOM | — | — |
| AXM_0102 | Non-Triviality (P2) | AXIOM | — | — |
| AXM_0103 | Closure | AXIOM | — | — |
| AXM_0104 | Partiality (P1) | AXIOM | — | — |
| AXM_0105 | Locality | AXIOM | — | — |
| AXM_0106 | Non-Invertibility | AXIOM | — | S72 |
| AXM_0107 | Non-Negative Loss | AXIOM | — | — |
| AXM_0108 | Time Scale | AXIOM | — | — |

### Crystal Axioms

| ID | Name | Status | Uses | Session |
|----|------|--------|------|---------|
| AXM_0109 | Crystal Existence (C1) | AXIOM | — | S72 |
| AXM_0110 | Perfect Orthogonality (C2) | AXIOM | — | S72 |
| AXM_0111 | Crystal Completeness (C3) | AXIOM | — | S72 |
| AXM_0112 | Crystal Symmetry (C4) | AXIOM | — | S72 |
| AXM_0113 | Finite Access (P3) | AXIOM | — | S72 |
| AXM_0114 | Tilt Possibility (P4) | AXIOM | — | S72 |
| AXM_0115 | Algebraic Completeness (T0) | AXIOM | — | S72 |
| AXM_0116 | Crystal Timeless (T1) | AXIOM | — | S72 |
| AXM_0117 | Crystallization Tendency (R1) | AXIOM | [A] AXM_0109, [A] AXM_0114 | S73 |
| AXM_0118 | Prime Attractor Selection (R2) | AXIOM | [A] AXM_0109, [A] AXM_0117, [A] AXM_0115 | S77 |

---

## Layer 1: Structural Theorems

### Division Algebra Chain

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| THM_0482 | No Zero Divisors | DERIVED | [A] AXM_0106 | — | S54 |
| THM_0483 | Transition Invertibility | DERIVED | [D] THM_0482 | — | S62 |
| THM_0484 | Division Algebra Structure | DERIVED | [D] THM_0483 | — | S62 |
| THM_0485 | Complex Structure (F=C) | DERIVED | [A] AXM_0116, [D] THM_0484 | — | S44 |
| DRV_0001 | n_d = 4 | DERIVED | [D] THM_0484 (Frobenius) | exact | S62 |
| DRV_0002 | n_c = 11 | DERIVED | [D] DRV_0001 | exact | S62 |

### Quantum Mechanics Chain

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0010 | Hilbert Space Structure | DERIVED | [A] AXM_0109, [A] AXM_0110 | — | S66 |
| DRV_0011 | Unitarity | DERIVED | [D] DRV_0010 | — | S66 |
| DRV_0012 | Schrödinger Form | DERIVED | [D] DRV_0011, [D] THM_0485 | — | S66 |
| DRV_0013 | Born Rule | DERIVED | [D] THM_0430 (Overlap Symmetry) | — | S66 |

### Chirality Chain

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0020 | Chirality (φ_L selection) | DERIVED | [A] AXM_0116, [D] THM_0485 | exact | S66 |

---

## Layer 2: Numerical Predictions

### Fine Structure Constant

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0100 | 1/α main term = 137 | DERIVED | [D] DRV_0001, [D] DRV_0002, [A] AXM_0118 | exact | S44 |
| DRV_0101 | 137 = 4² + 11² is prime | VERIFIED | [D] DRV_0001, [D] DRV_0002 | exact | S77 |
| DRV_0102 | 1/α = 137 + 4/111 | DERIVED | [D] DRV_0100, [D] DRV_0103, [D] DRV_0104 | **0.27 ppm** | S80 |
| DRV_0103 | 111 = EM channels in u(n_c) | **DERIVED** | [D] DRV_0002 | exact | **S89** |
| DRV_0104 | Equal distribution (transitive) | **DERIVED** | [A] AXM_0112 | — | **S89** |

**Session 89 Key Insight (α correction COMPLETE)**:
- 111 = off-diagonal u(11) generators (110) + U(1) (1) = EM channels
- Equal distribution: U(n_c) acts transitively → no preferred channel
- Nucleation is random → defect is generic → equal distribution FORCED

### Weinberg Angle

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0110 | sin²θ_W tree = 1/4 | DERIVED | [D] THM_0485 | exact | S77 |
| DRV_0111 | sin²θ_W = 17/73 (prime) | MATCHED | [A] AXM_0118 | 0.72% | S81 |
| DRV_0112 | sin²θ_W = 123/532 | DERIVED | [D] DRV_0110 | **30 ppm** | S82 |

### Koide Formula

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0120 | Koide Q = 2/3 | DERIVED | [D] THM_0485 | exact | S73 |
| DRV_0121 | Koide θ = π×73/99 | MATCHED | [A] AXM_0118 | **0.006%** | S75 |
| DRV_0122 | Koide M = v/784 | MATCHED | [D] DRV_0001 | **0.07%** | S74 |

### Higgs VEV and Scale Ratios (Session 88 — Big Numbers)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0130 | v = M_Pl × α^8 × √(44/7) | DERIVED | [D] DRV_0102, [I] IMP_Planck | **0.034%** | S81 |
| DRV_0131 | v/m_p = 11284/43 | DERIVED | [D] DRV_0001, [D] DRV_0002 | **0.21 ppm** | **S88** |
| DRV_0132 | α_G = α^16 × (44/7) / (11284/43)² | DERIVED | [D] DRV_0102, [D] DRV_0131 | **0.068%** | **S88** |

**Session 88 Key Insight**: The "big numbers" in physics are algebraic theorems:
- M_Pl/v ~ 10^17 = 1/(α^8 × √(44/7))
- M_Pl/m_p ~ 10^19 = (11284/43)/(α^8 × √(44/7))
- 1/α_G ~ 10^38 = (11284/43)²/(α^16 × 44/7)

**Note**: ℏ is a SCALE IMPORT, not derivable. All dimensionless ratios ARE derivable.

### Mass Ratios

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0140 | m_p/m_e = 1836 + 11/72 | DERIVED | [D] DRV_0001, [D] DRV_0002, [D] DRV_0141 | **0.06 ppm** | S82 |
| DRV_0141 | 72 = QCD × gen channels | **DERIVED** | [D] DRV_0001 | exact | **S89** |

**Session 89 Key Insight (m_p/m_e correction ~60% derived)**:
- 72 = dim(su(3)) × dim(u(3)) = 8 × 9 = QCD-generation channels
- Unified pattern with α: Correction = (modes) / (Lie algebra channels)
- Gap remaining: Why n_c in numerator (not n_d like α)?

### Mixing Angles (PMNS)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0150 | PMNS sin²θ_23 = 4/7 | DERIVED | [D] DRV_0001 | **0.1%** | S82 |
| DRV_0151 | PMNS sin²θ_12 = 10/33 | DERIVED | [D] DRV_0002 | **0.01%** | S82 |
| DRV_0152 | PMNS sin²θ_13 = 1/44 | DERIVED | [D] DRV_0001, [D] DRV_0002 | 3.2% | S82 |

### Mixing Angles (CKM) — COMPLETE (S87)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0160 | CKM λ = 9/40 | DERIVED | [D] DRV_0001 | **EXACT** | S82 |
| DRV_0161 | CKM |V_cb| = 2/49 | DERIVED | [D] DRV_0001 | **~0%** | S83 |
| DRV_0162 | CKM |V_ub| = 1/262 | DERIVED | [D] DRV_0100, [D] DRV_0001, [D] DRV_0002 | **0.08%** | **S87** |
| DRV_0163 | CKM δ = π×8/21 | DERIVED | [D] DRV_0001 | **0.07%** | **S87** |

**Note**: 262 = 137 + n_c² + n_d connects |V_ub| to fine structure!

### Cosmological Parameters (S94-95)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0170 | Ω_Λ = 13/19 | DERIVED | [D] DRV_0001, [D] DRV_0002 | **0.07%** | S94 |
| DRV_0171 | Ω_m = 6/19 | DERIVED | [D] DRV_0170 | **0.16%** | S94 |
| DRV_0172 | Ω_DM/Ω_b = 49/9 | DERIVED | [D] DRV_0002 | **2.3%** | S94 |
| DRV_0173 | Λ magnitude = α^56/77 | DERIVED | [D] DRV_0102 | **2.2%** | S94 |
| DRV_0174 | m_DM = 5.11 GeV | DERIVED | [D] DRV_0172 | — | S95 |
| DRV_0175 | n_DM = n_b | DERIVED | [D] DRV_0172, [D] DRV_0174 | — | S95 |

### CMB Observables (S97-98)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0180 | δT/T = α²/3 | DERIVED | [D] DRV_0102 | **1.4%** | S97 |
| DRV_0181 | n_s = 117/121 | DERIVED | [D] DRV_0001, [D] DRV_0002 | **0.21%** | S98 |
| DRV_0182 | ℓ₁ = 220 | DERIVED | [D] DRV_0002 | **EXACT** | S98 |
| DRV_0183 | ℓ₂ = 537.8 | DERIVED | [D] DRV_0002 | **0.05%** | S98b |

### BBN Predictions (S99-101c)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0190 | Y_p = 1/4 - 1/242 | DERIVED | [D] DRV_0002, [D] DRV_0110 | **0.40%** | S99 |
| DRV_0191 | D/H = α² × 10/21 | DERIVED | [D] DRV_0102 | **0.39%** | S99 |
| DRV_0192 | T_EW/T_QCD = 8×133 | DERIVED | [D] DRV_0102 | **0.38%** | S99 |
| DRV_0193 | Li7 suppression = 1/3 | DERIVED | [D] DRV_0001 | **2.08%** | S100 |
| DRV_0194 | η = α⁴ × 3/14 | DERIVED | [D] DRV_0102 | **0.39%** | S101c |

### Crystallization Theory (S100-102)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0200 | ε* = α² | DERIVED | [D] DRV_0102 | — | S101 |
| DRV_0201 | 3+1 split from H | DERIVED | [D] DRV_0001 | — | S101 |
| DRV_0202 | Lorentz (-,+,+,+) | DERIVED | [D] DRV_0201 | — | S102 |
| DRV_0203 | Einstein equations emerge | DERIVED | [D] DRV_0202 | — | S102 |

### Hubble Constant (S101b-d)

| ID | Name | Status | Uses | Accuracy | Session |
|----|------|--------|------|----------|---------|
| DRV_0210 | H_boundary = α^28√(19/3003) | DERIVED | [D] DRV_0170, [D] DRV_0173 | **0.40%** | S101b |
| DRV_0211 | H_local/H_boundary = 13/12 | DERIVED | [D] DRV_0001 | **EXACT** | S101d |

---

## Dependency Statistics

| Category | Count | Sub-ppm | <0.1% | <1% | Exact |
|----------|-------|---------|-------|-----|-------|
| Universal Constants | 5 | 2 | 1 | 0 | 2 |
| Scale Ratios (S88) | 3 | 1 | 2 | 0 | 0 |
| Mass Ratios + Lie Algebra (S89) | 2 | 1 | 0 | 0 | 1 |
| Mixing Angles (PMNS) | 3 | 0 | 1 | 1 | 0 |
| Mixing Angles (CKM) | 4 | 0 | 3 | 0 | 1 |
| **Cosmological (S94-95)** | **6** | **0** | **1** | **3** | **0** |
| **CMB (S97-98)** | **4** | **0** | **2** | **1** | **1** |
| **BBN (S99-101c)** | **5** | **0** | **3** | **2** | **0** |
| **Crystallization (S100-102)** | **4** | — | — | — | — |
| **Hubble (S101b-d)** | **2** | **0** | **1** | **0** | **1** |
| Structural | 10 | — | — | — | — |
| **Total Numerical** | **38** | **4** | **14** | **7** | **5** |

**Session 102 Update**: Added DRV_0170-0211 for cosmology, CMB, BBN, crystallization, and Hubble

---

## How to Update

### Adding a new claim:
1. Assign ID from appropriate range
2. List all claims it USES
3. Add verification script link
4. Record session number

### When a claim changes status:
1. Update this file
2. Check all claims that USE this claim
3. Regenerate dependency graph

### ID Ranges:
- DRV_0001-0099: Structural derivations
- DRV_0100-0199: Numerical predictions
- DRV_0200-0299: Qualitative predictions
- CNJ_0800+: Conjectures (existing system)

---

## Graph Generation

Run: `python verification/sympy/generate_dependency_graph.py`

Or use the Mermaid diagram below (auto-updated).

---

*Last updated: 2026-01-28 (Session 110 — [A]/[I]/[D] annotations added)*
