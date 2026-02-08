# Parameter Freeze Registry

**Created**: 2026-01-28 (Session 120 - Red Team Review)
**Purpose**: Lock ALL framework parameters — no new parameters without explicit justification
**Rule**: "Zero free parameters" must be VERIFIABLE

---

## Why This Exists

The Red Team challenged the "zero free parameters" claim. This file makes all parameters explicit so the claim can be evaluated.

---

## Frozen Parameters

### Category 1: Derived from Axioms

These parameters follow from the axioms via mathematical necessity.

| Parameter | Value | Derivation | Frozen Since | Status |
|-----------|-------|------------|--------------|--------|
| n_d | 4 | Frobenius theorem + time direction axiom | S10 | LOCKED |
| n_c | 11 | Crystal dimensions: Im_C+Im_H+Im_O = 1+3+7 | S15 | LOCKED (value); decomposition TENTATIVE (see §Tentative #2) |
| F | C | Time direction requires minimal phase structure | S5 | LOCKED |
| Aut(O) | G₂ | Mathematical fact | S1 | LOCKED |
| Aut(H) | SU(2) | Mathematical fact | S1 | LOCKED |
| Aut(C) | U(1) | Mathematical fact | S1 | LOCKED |

### Category 2: Structural Choices

These are choices made in constructing the correspondence rules.

| Parameter | Value | Justification | Frozen Since | Status |
|-----------|-------|---------------|--------------|--------|
| Automorphisms = Gauge groups | Yes | Single explicit assumption | S20 | LOCKED |
| Coupling ∝ dim(Lie algebra) | Yes | [A-COUPLING] — explicit import | S25 | LOCKED |
| Φ₆ cyclotomic | Yes | **NOT DERIVED** — appears to work | S56 | TENTATIVE |

### Category 3: Imports from Physics

These values come from measurement, not the framework.

| Parameter | Value | Source | Status |
|-----------|-------|--------|--------|
| M_Pl | 1.22 × 10¹⁹ GeV | Measurement | IMPORT |
| α (for comparison) | 1/137.036... | Measurement | IMPORT |
| m_p/m_e (for comparison) | 1836.15... | Measurement | IMPORT |

---

## Parameter Addition Protocol

**NO NEW PARAMETERS** may be added without:

1. **Explicit documentation** in this file
2. **Justification** that is NOT "it makes the formula work"
3. **Impact analysis** on existing predictions
4. **Red flag check**: Does adding this parameter smell like fitting?

### New Parameter Request Template

```markdown
### Proposed Parameter: [Name]

**Value**: [value]
**Proposed by**: Session [N]
**Justification**: [why this is needed]

**Red Flag Check**:
- [ ] Does this appear AFTER a prediction failed? (BAD)
- [ ] Is the only justification "it works"? (BAD)
- [ ] Does this connect to existing structure? (GOOD)
- [ ] Could the framework survive WITHOUT this? (TEST)

**Decision**: APPROVED / REJECTED / TENTATIVE
```

---

## Known Tentative Parameters

These parameters are used but not yet derived from first principles:

### 1. Φ₆ Cyclotomic Polynomial

**Status**: TENTATIVE
**Used in**: α correction (111 = Φ₆(11)); also appears in alpha_enhanced_prediction.py cyclotomic analysis
**Problem**: Why Φ₆ specifically? Not Φ₄, Φ₈, Φ₁₂?
**Required**: Derivation from division algebra structure
**Priority**: HIGH (see Recommendation Engine)

### 2. n_c = 11 (not 15) — Decomposition Justification

**Status**: VALUE LOCKED (11 works; 15 does not); DECOMPOSITION TENTATIVE
**Canonical form**: Im_C+Im_H+Im_O = 1+3+7 = 11 (per DEF_02C1)
**Historical form**: R+C+H+H = 1+2+4+4 = 11 (deprecated — see CR-065)
**Problem**: Why imaginary parts? Why not full dimensions R+C+H+O = 1+2+4+8 = 15?
**Required**: Rigorous derivation of why Im() rather than full dim()
**Priority**: HIGH

---

### 3. Landau Expansion Form (S132)

**Status**: TENTATIVE
**Used in**: THM_0487 (SO(11) breaking chain), crystallization dynamics
**Tag**: [A-STRUCTURAL: Landau expansion]
**Problem**: Why polynomial potential? This is a standard physics technique imported without derivation.

### 4. B_total = M_Pl^4 (S172)

**Status**: TENTATIVE
**Used in**: Democratic quartic derivation, Higgs quartic coupling
**Tag**: [A-STRUCTURAL: B_total = M_Pl^4]
**Problem**: Normalization choice. Why M_Pl^4 specifically?

### 5. Noise ∝ Unorthogonality (S134)

**Status**: TENTATIVE
**Used in**: Born rule derivation (THM_0494)
**Tag**: [A-PHYSICAL: noise proportional to unorthogonality]
**Problem**: Physical interpretation postulated, not derived from axioms.

### 6. g² ∝ Im(algebra) (Tree-Level Couplings)

**Status**: TENTATIVE
**Used in**: Tree Weinberg angle, gauge coupling ratios
**Tag**: [A-COUPLING: g² proportional to Im(algebra)]
**Problem**: Proportionality constant and functional form not derived.

---

## Parameter Count

> Updated S189 audit (CR-105): Previous count of 3 structural choices was an undercount.

| Category | Count | Notes |
|----------|-------|-------|
| Derived from axioms | 6 | Mathematically necessary |
| Structural choices | 3 | Explicit in Category 2 above |
| Imports | 3 | From measurement |
| **Tentative (original)** | **2** | **Φ₆ and n_c decomposition** |
| **Tentative (S132-S175)** | **4** | **Landau, B_total, noise, g² rule** |
| **Total structural assumptions** | **~6-8** | |

**Honest assessment**: The framework has ~6-8 structural choices that are ASSUMPTIONS, not derivations. The "zero free parameters" claim is significantly overstated. The original count of ~3 only included the oldest assumptions; at least 4 more were introduced in S132-S175 without being registered here.

**More accurate claim**: "Six to eight structural assumptions, no continuous free parameters."

---

*This registry ensures parameter discipline. No stealth parameters.*
