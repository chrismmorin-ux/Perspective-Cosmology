# Scheme Selection Principle

**Status**: DERIVATION
**Created**: Session 96, 2026-01-27
**Confidence**: [DERIVATION] — Pattern identified with physical justification

## Summary

The renormalization scheme determines which division algebra structure appears in the formula for the weak mixing angle:

| Scheme | Physical content | Algebraic structure | Formula |
|--------|-----------------|---------------------|---------|
| **On-shell** | Pole masses (Higgs sector) | H-based PRIME | cos(θ_W) = 171/(2×97) |
| **MS-bar** | Running (all loops) | O-based PRODUCT | sin²(θ_W) = 123/(4×133) |

## The Core Finding

### On-Shell Scheme

**Definition**: cos(θ_W) = M_W / M_Z (physical pole masses)

**Formula**: cos(θ_W) = 171/194 = 171/(2×97)

**Algebraic structure**:
- 97 = 4² + 9² = H² + Im_H⁴
- 97 is PRIME (sum of two squares)
- This is H-BASED (quaternionic/Higgs sector)

**Precision**: 93 ppm

### MS-Bar Scheme

**Definition**: sin²(θ_W) = g'²/(g² + g'²) at scale M_Z

**Formula**: sin²(θ_W) = 123/532 = 123/(4×7×19)

**Algebraic structure**:
- 532 = n_d × Im_O × (n_c + O) = 4 × 7 × 19
- 133 = Im_O × (n_c + O) = 7 × 19
- This is O-BASED (octonionic/color sector)

**Precision**: 73 ppm

## Physical Basis

### Why On-Shell Uses H-Based Primes

1. On-shell quantities are defined at the **pole** of the propagator
2. A pole is a singular, irreducible point in the complex plane
3. Physical masses come from the **Higgs mechanism**
4. Higgs is an SU(2) doublet → quaternionic structure
5. No color in tree-level mass formulas

**Correspondence**: POLE (irreducible) ←→ PRIME (irreducible in ℤ)

### Why MS-Bar Uses O-Based Products

1. MS-bar subtracts divergences at a running scale μ
2. Running integrates over **all virtual particles**
3. Includes quarks → color (octonionic) structure
4. Decomposes into contributions from different loops
5. Each loop type contributes a factor

**Correspondence**: RUNNING (sum of loops) ←→ PRODUCT (sum of factors)

## The Algebraic Correspondence

```
POLE (singular, fixed)   ←→   PRIME (irreducible)
RUNNING (flow, virtual)  ←→   PRODUCT (factorizable)
```

This is not arbitrary — it reflects the mathematical structure of each scheme:
- Poles cannot be decomposed into "simpler" poles
- Primes cannot be factored in ℤ
- Running sums over particle species
- Products decompose into dimension factors

## The Three Koide Primes

The same primes that govern Koide mass phases also appear in gauge couplings:

| Prime | Decomposition | Division algebra | Gauge role |
|-------|--------------|------------------|------------|
| 37 | 1² + 6² | R-based | In 111 = 3×37 (α correction channels) |
| 53 | 2² + 7² | C+O-based | In 212 = 4×53 (α_s denominator) |
| 97 | 4² + 9² | H-based | In 194 = 2×97 (on-shell θ_W) |

**Key insight**: Each prime encodes which division algebra dominates:
- 37: Real structure (down-type Yukawas via Higgs conjugate)
- 53: EM + color (QCD mixing)
- 97: Quaternionic (up-type Yukawas, weak/Higgs sector)

## Supporting Evidence

### Fine Structure Constant α

At q² = 0 (a pole value):
- 1/α = 137 + 4/111
- 137 = 4² + 11² = H² + n_c² (H-BASED PRIME)
- BASE is prime (pole), corrections through 111 channels (running)

### Koide Theta

Fixed mass eigenvalue structure:
- θ = π × 73/99
- 73 = 3² + 8² = Im_H² + O² (PRIME)
- 99 = 9 × 11 = Im_H² × n_c (product normalization)

### Strong Coupling α_s

At M_Z (running value):
- α_s = 25/212 = 25/(4 × 53)
- 53 = 2² + 7² = C² + Im_O²
- Contains Im_O (color sector) as expected for QCD

### Proton-Electron Mass Ratio

Pole masses with QCD corrections:
- m_p/m_e = 1836 + 11/72
- Base 1836 is exact (pole structure)
- Correction 72 = 8 × 9 = O × Im_H² (QCD channels)

## Predictions

If this principle is correct:

1. **Other on-shell quantities** should use H-based primes
2. **Other MS-bar quantities** should use O-based products
3. **Mixed quantities** (pole + running corrections) should show both

## Verification

**Script**: `verification/sympy/scheme_selection_principle.py`
**Status**: ALL TESTS PASS

## Open Questions

1. Can this principle predict which scheme a given experiment uses?
2. Is there a deeper mathematical theorem relating poles to primes?
3. How does this connect to the gap 23 = 194 - 171 = n_c + 3H?

## Dependencies

**Uses**:
- [A-AXIOM] Division algebra dimensions: R=1, C=2, H=4, O=8
- [D] n_c = 11 from crystallization
- [A-IMPORT] M_W = 80.3692 GeV, M_Z = 91.1876 GeV (PDG 2024)
- [A-IMPORT] sin²(θ_W) = 0.23122 MS-bar at M_Z (PDG 2024)

**Used by**:
- Understanding of gauge coupling unification
- Predictions for other electroweak observables
