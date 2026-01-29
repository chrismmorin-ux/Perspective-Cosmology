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
| n_c | 11 | Division algebra sum: R+C+H+H = 1+2+4+4 | S15 | LOCKED |
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
**Used in**: α correction (111 = Φ₆(11)), Weinberg angle (133 = Φ₆(12))
**Problem**: Why Φ₆ specifically? Not Φ₄, Φ₈, Φ₁₂?
**Required**: Derivation from division algebra structure
**Priority**: HIGH (see Recommendation Engine)

### 2. n_c = 11 (not 15)

**Status**: LOCKED but weakly justified
**Justification**: "O appears as H+H from internal perspective"
**Problem**: The H+H decomposition needs rigorous proof
**Required**: Literature review (Baez's "The Octonions")
**Priority**: HIGH

---

## Parameter Count

| Category | Count | Notes |
|----------|-------|-------|
| Derived from axioms | 6 | Mathematically necessary |
| Structural choices | 3 | Explicit assumptions |
| Imports | 3 | From measurement |
| **Tentative** | **2** | **Need derivation** |

**Honest assessment**: The framework has ~3 structural choices that are ASSUMPTIONS, not derivations. The "zero free parameters" claim is overstated.

**More accurate claim**: "Three explicit structural assumptions, no continuous free parameters."

---

*This registry ensures parameter discipline. No stealth parameters.*
