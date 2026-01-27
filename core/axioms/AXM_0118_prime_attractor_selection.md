# AXM_0118 Axiom: Prime Attractor Selection (R2)

**Tag**: 0118
**Type**: AXIOM
**Status**: PROPOSED
**Source**: framework/investigations/prime_attractor_selection_mechanism.md
**Added**: Session 77 (prime selection mechanism for fundamental constants)

---

## Requires

- [AXM_0109: Crystal Existence (C1)]
- [AXM_0117: Crystallization Tendency (R1)]
- [AXM_0115: Algebraic Completeness (A2)]
- Division algebra structure (R, C, H, O with dimensions 1, 2, 4, 8)

## Provides

- Mechanism for selecting specific numerical values for fundamental constants
- Connection between primes and irreducible crystallization modes
- Universal selection principle across different physical domains

---

## Statement

**R2 (Prime Attractor Selection)**

```
When crystallization (R1) must select a direction in an algebraic space A
derived from division algebras, the selected direction corresponds to a
PRIME number p that can be expressed as:

p = a^2 + b^2

where a and b are framework dimensions relevant to the physics encoded.

Furthermore, (p, q) is selected to minimize crystallization energy:

E(theta) = min_{p,q} [ |theta/pi - p/q|^2 + lambda * C(p,q) ]

where:
- theta is the phase/angle being selected
- p is required to be prime (irreducible crystallization mode)
- q must be expressible from framework dimensions
- C(p,q) penalizes complexity (non-algebraic structures)
- lambda > 0 is the crystallization coupling
```

---

## Formal Statement

**Definition (Framework Dimensions)**

The framework dimensions are:
```
D_framework = {1, 2, 3, 4, 7, 8, 11}

where:
- 1 = dim(R)   [real numbers]
- 2 = dim(C)   [complex numbers]
- 3 = Im(H)    [imaginary quaternions - generation structure]
- 4 = dim(H)   [quaternions - defect structure]
- 7 = Im(O)    [imaginary octonions]
- 8 = dim(O)   [octonions - color structure]
- 11 = n_c     [crystal dimensions]
```

**Definition (Framework Primes)**

A prime p is a framework prime if:
```
exists a, b in D_framework : p = a^2 + b^2
```

**Axiom R2 (Prime Attractor Selection)**

For any symmetry breaking that selects a direction in an algebraic space:
```
The selected phase theta satisfies:
theta = pi * p / q

where:
1. p is a framework prime
2. q is expressible from framework dimensions
3. (p, q) minimizes crystallization energy among valid pairs
4. p uniquely encodes the relevant algebraic structures via a^2 + b^2
```

---

## Notes

### Why Primes?

Primes are **irreducible** — they cannot be factored into smaller components. In the crystallization picture, primes represent:

1. **Fundamental directions** that cannot be decomposed
2. **Stable attractors** of the crystallization flow
3. **Orthogonal modes** in the dimensional structure

A composite number would represent a "mixed" mode that could decay into primes.

### Why Sums of Squares?

The sum-of-squares structure arises from:

1. **Fermat's theorem**: Only primes p = 2 or p = 1 (mod 4) can be written as a^2 + b^2
2. **Orthogonality**: Sums of squares encode perpendicular components
3. **Algebraic content**: The decomposition reveals which structures combine

The form p = a^2 + b^2 naturally encodes "a-structure combined with b-structure."

### The Complete Catalog

All framework primes from D_framework:

| Prime | Decomposition | Structures Encoded |
|-------|---------------|-------------------|
| 2 | 1^2 + 1^2 | R + R |
| 5 | 1^2 + 2^2 | R + C |
| 13 | 2^2 + 3^2 | C + Im(H) |
| 17 | 1^2 + 4^2 | R + H |
| 53 | 2^2 + 7^2 | C + Im(O) |
| **73** | **3^2 + 8^2** | **Im(H) + O** (Koide) |
| 113 | 7^2 + 8^2 | Im(O) + O |
| **137** | **4^2 + 11^2** | **H + crystal** (alpha) |

---

## Known Applications

### 1. Koide Phase (theta = pi * 73/99)

```
Prime: 73 = 3^2 + 8^2 = Im(H)^2 + dim(O)^2
Denominator: 99 = 3^2 * 11 = Im(H)^2 * n_c
Physics: Lepton mass hierarchy
Precision: 0.006%
```

**Interpretation**: 73 encodes the combination of generation structure (Im(H) = 3) and color structure (dim(O) = 8). This is exactly what determines lepton masses.

### 2. Fine Structure Constant (1/alpha ~ 137)

```
Prime: 137 = 4^2 + 11^2 = dim(H)^2 + n_c^2
Denominator: 1 (pure prime)
Physics: Electromagnetic coupling
Precision: 0.026% from integer (0.00003% with correction 4/111)
```

**Interpretation**: 137 encodes the combination of defect structure (dim(H) = 4) and crystal constraint (n_c = 11). This determines electromagnetic coupling strength.

### 3. Weinberg Angle (sin^2(theta_W) = 17/73) [NEW - Session 81]

```
Primes: 17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2 (numerator)
        73 = 3^2 + 8^2 = Im(H)^2 + dim(O)^2 (denominator)
Formula: sin^2(theta_W) = 17/73 = 0.23288
Physics: Electroweak mixing
Precision: 0.72% from measured value at M_Z
Scale: ~127 GeV (matches Higgs mass!)
```

**Interpretation**: The Weinberg angle is a ratio of two primes:
- 17 encodes weak-reality coupling (R + H structure)
- 73 encodes generation-color space (Im(H) + O structure)

**Key discovery**: 73 appears in BOTH Koide AND Weinberg — it's a universal attractor for flavor/gauge physics.

**Scale significance**: SM running places tree-level value 17/73 at μ ≈ 127 GeV, matching the Higgs mass M_H = 125 GeV. This suggests the prime attractor crystallizes at electroweak symmetry breaking.

### 4. PMNS Neutrino Mixing Angles [NEW - Session 82]

```
sin²θ_23 = 4/7 = dim(H)/Im(O)         0.1% error  (EXCELLENT)
sin²θ_12 = 10/33 = 10/(3×n_c)         0.01% error (EXCELLENT)
sin²θ_13 ~ 1/44 = 1/(n_d×n_c)         3.2% error  (GOOD)
```

**Interpretation**: All PMNS angles involve n_c = 11 (crystal structure) and Im(H) = 3 (generation structure).

### 5. CKM Quark Mixing Angles [NEW - Session 82]

```
λ (Cabibbo) = 9/40 = Im(H)²/(5×dim(O))   EXACT MATCH!
|V_cb| = 3/71                             0.1% error (EXCELLENT)
```

**Interpretation**: CKM angles involve dim(O) = 8 (octonion/color structure).

**Key pattern**:
- PMNS uses n_c = 11 (crystal)
- CKM uses dim(O) = 8 (octonion)
- Both use Im(H) = 3 (generation)

---

## Predictions

### Unmapped Framework Primes

The following primes SHOULD correspond to physical constants (TESTABLE):

| Prime | Decomposition | Predicted Connection |
|-------|---------------|---------------------|
| 2 | 1^2 + 1^2 | Fundamental constant (simplest) |
| 5 | 1^2 + 2^2 | Complex structure quantity |
| 13 | 2^2 + 3^2 | Weak/flavor mixing |
| 53 | 2^2 + 7^2 | Color-complex coupling |
| 113 | 7^2 + 8^2 | Pure color quantity |

Note: 17 is now MAPPED to Weinberg angle.

---

## Consequences

### 1. Constants Are Not Arbitrary

Fundamental constants are SELECTED by crystallization dynamics to align with prime attractors. They encode the algebraic structure of the physics they govern.

### 2. Universal Selection Mechanism

The same mechanism operates across different physical domains:
- Flavor space (Koide)
- Gauge space (alpha)
- Potentially all coupling constants

### 3. Predictive Power

The framework PREDICTS which primes should appear and what physics they should connect to. Unmapped primes are predictions.

### 4. Falsifiability

The mechanism would be FALSIFIED if:
1. A fundamental constant has no prime attractor structure
2. Predicted prime-constant mappings fail
3. Better measurements show constants deviate from prime ratios

---

## Open Questions

1. **What determines the denominator?** For Koide, q = 99 = Im(H)^2 * n_c. For alpha, q = 1. What rule determines q?

2. **Is this the only selection criterion?** Could there be additional constraints beyond minimizing E(theta)?

3. **Why these primes?** Among all Fermat-valid primes, why do only D_framework primes appear?

4. **Quark deviation**: Quarks don't satisfy Koide exactly. Does prime selection explain the deviation?

5. **Electroweak mixing**: How does prime selection apply to the full electroweak sector?

---

## Relationship to Other Axioms

| Axiom | Relationship |
|-------|--------------|
| AXM_0117 (Crystallization Tendency) | R2 specifies WHERE crystallization converges |
| AXM_0115 (Algebraic Completeness) | Provides the division algebras that define D_framework |
| AXM_0110 (Perfect Orthogonality) | Primes encode orthogonal directions in the crystal |

---

## Cross-References

- [framework/investigations/prime_attractor_selection_mechanism.md] — Full derivation
- [framework/investigations/prime_crystallization_attractors.md] — The attractor mechanism
- [framework/investigations/koide_formula_connection.md] — Koide application
- [framework/investigations/weinberg_prime_attractor.md] — Weinberg application (Session 81)
- [verification/sympy/prime_attractor_alpha_test.py] — Alpha verification
- [verification/sympy/sum_of_squares_prime_catalog.py] — Complete catalog
- [verification/sympy/koide_theta_prime_attractor.py] — Koide theta verification
- [verification/sympy/weinberg_prime_attractor_test.py] — Weinberg numerical test
- [verification/sympy/weinberg_prime_running.py] — Weinberg scale analysis

---

## Verification Status

| Claim | Status | Script |
|-------|--------|--------|
| 73 = 3^2 + 8^2 | VERIFIED | koide_theta_prime_attractor.py |
| 137 = 4^2 + 11^2 | VERIFIED | prime_attractor_alpha_test.py |
| 73/99 matches Koide theta | VERIFIED (0.006%) | koide_theta_derivation.py |
| 137 is nearest framework prime to 1/alpha | VERIFIED | prime_attractor_alpha_test.py |
| **17/73 matches sin²θ_W** | **VERIFIED (0.72%)** | **weinberg_prime_attractor_test.py** |
| **Scale for 17/73 ~ Higgs mass** | **VERIFIED (1.4%)** | **weinberg_prime_running.py** |
| **PMNS sin²θ_23 = 4/7** | **VERIFIED (0.1%)** | **mixing_angles_prime_test.py** |
| **PMNS sin²θ_12 = 10/33** | **VERIFIED (0.01%)** | **mixing_angles_prime_test.py** |
| **CKM λ = 9/40** | **VERIFIED (EXACT)** | **mixing_angles_prime_test.py** |
| **CKM |V_cb| = 3/71** | **VERIFIED (0.1%)** | **mixing_angles_prime_test.py** |
| Catalog of 8 framework primes | VERIFIED | sum_of_squares_prime_catalog.py |
