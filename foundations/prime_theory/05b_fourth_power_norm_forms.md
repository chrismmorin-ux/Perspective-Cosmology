# Fourth-Power Primes as Cyclotomic Norm Forms

**Status**: DERIVATION (mathematics proven; framework significance conjectured)
**Created**: Session 184
**Last Updated**: Session 184

---

## Plain Language

When you multiply a complex number (a + bi) by its conjugate (a - bi), you get a² + b². This is the "norm" of the complex number, and Fermat's famous theorem says a prime can be written as a² + b² exactly when it's 1 more than a multiple of 4.

There's a less well-known but equally rigorous number system — the 8th cyclotomic integers Z[ζ₈] — where the analogous norm gives a⁴ + b⁴. Just as the Gaussian integers Z[i] govern which primes are sums of two squares, the 8th cyclotomic integers govern which primes are sums of two fourth powers.

This means the framework's sum-of-squares primes and its fourth-power primes are NOT two separate phenomena. They are two levels of a single mathematical structure: **cyclotomic norm forms evaluated at framework dimension inputs**.

**One-sentence version**: a⁴ + b⁴ is the norm form from Q(ζ₈) just as a² + b² is the norm form from Q(i), unifying both types of framework primes under one algebraic principle.

---

## The Key Identity

### Statement [THEOREM — proven, verified]

Let ζ₈ = e^{2πi/8} be a primitive 8th root of unity. Then:

```
N_{Q(ζ₈)/Q}(a + b·ζ₈) = (a + b·ζ₈)(a + b·ζ₈³)(a + b·ζ₈⁵)(a + b·ζ₈⁷) = a⁴ + b⁴
```

This is the **exact quartic analogue** of the Gaussian integer norm:

```
N_{Q(i)/Q}(a + b·i) = (a + bi)(a - bi) = a² + b²
```

### Why It Works

- Φ₈(x) = x⁴ + 1 is the 8th cyclotomic polynomial [I-MATH]
- The Galois group Gal(Q(ζ₈)/Q) ≅ (Z/8Z)* = {1, 3, 5, 7} ≅ Z/2 × Z/2 (Klein four-group) [I-MATH]
- The norm is the product over all Galois conjugates [I-MATH]
- Setting up N(a + bζ₈) = b⁴ · Φ₈(a/b) = b⁴ · ((a/b)⁴ + 1) = a⁴ + b⁴ [I-MATH]

### Verification

**Script**: `verification/sympy/fourth_power_norm_form_catalog.py` — 20/20 PASS

Verified numerically for all framework dimension pairs:
- N(1 + 2·ζ₈) = 17 = 1⁴ + 2⁴ ✓
- N(2 + 3·ζ₈) = 97 = 2⁴ + 3⁴ ✓
- N(3 + 4·ζ₈) = 337 = 3⁴ + 4⁴ ✓
- N(1 + 4·ζ₈) = 257 = 1⁴ + 4⁴ ✓
- (and all others)

---

## The Norm Form Hierarchy

### Two Levels of the Same Structure

| Level | Ring | Norm Form | Cyclotomic Poly | Field Degree | Prime Condition |
|-------|------|-----------|-----------------|--------------|-----------------|
| 1 | Z[i] = Z[ζ₄] | a² + b² | Φ₄(x) = x² + 1 | 2 | p ≡ 1 mod 4 |
| 2 | Z[ζ₈] | a⁴ + b⁴ | Φ₈(x) = x⁴ + 1 | 4 | p ≡ 1 mod 8 (necessary) |

### General Pattern [I-MATH]

For even n, the restricted norm from Q(ζₙ) is:

```
N_{Q(ζₙ)/Q}(a + b·ζₙ) = b^{φ(n)} · Φₙ(a/b)
```

Other cyclotomic norms for reference:

| n | Ring | Norm N(a + bζₙ) | Field Degree |
|---|------|-----------------|--------------|
| 3 | Z[ω] | a² − ab + b² | 2 |
| 4 | Z[i] | a² + b² | 2 |
| 5 | Z[ζ₅] | a⁴ − a³b + a²b² − ab³ + b⁴ | 4 |
| 8 | Z[ζ₈] | **a⁴ + b⁴** | 4 |
| 12 | Z[ζ₁₂] | a⁴ − a²b² + b⁴ | 4 |

The n = 8 case is special because Φ₈(x) = x⁴ + 1 has **no cross-terms** — it is a pure sum of fourth powers.

---

## Properties of Fourth-Power Primes (Quartan Primes)

### OEIS A002645

The sequence of primes of the form a⁴ + b⁴ (quartan primes):
```
2, 17, 97, 257, 337, 641, 881, 1297, 2417, 2657, 3697, 4177, 4721, 6577, ...
```

### Proven Properties

1. **Necessary condition**: All odd quartan primes satisfy p ≡ 1 (mod 16) [PROVEN — fourth powers are 0 or 1 mod 16; for odd sum, one input is even, one odd, giving 0+1 = 1 mod 16]

2. **All split completely in Q(ζ₈)**: Since p ≡ 1 mod 8 is necessary for odd quartan primes, and primes split completely in Q(ζₙ) iff p ≡ 1 mod n [PROVEN — cyclotomic decomposition law]

3. **Φ₈(x) = x⁴ + 1 is reducible mod every prime**: Unlike most irreducible polynomials over Z, x⁴ + 1 factors mod p for ALL primes p. This is because the Galois group Z/2×Z/2 has no element of order 4, so no prime can be inert. [PROVEN]

4. **Z[ζ₈] has class number 1**: So all ideals are principal, and norm representations are well-behaved. [PROVEN]

5. **No complete characterization**: Unlike Fermat's theorem for a² + b² (p = 1 mod 4 is necessary AND sufficient), there is NO known simple characterization of which primes are a⁴ + b⁴. Tsunekawa (1960): "Problems concerning the sum of two fourth powers of integers seem to be so difficult that little has been known." [OPEN]

6. **Infinitude conjectured but unproven**: The Bateman-Horn conjecture predicts infinitely many, but this is not proven. The proven Friedlander-Iwaniec theorem (1998) establishes infinitely many primes a² + b⁴, a broader class. [CONJECTURED]

---

## CR-061 Resolution: Why 97 Belongs

### The Problem

97 appears in Tier 1 claims:
- cos θ_W = 171/194 = 171/(2 × 97) at 3.75 ppm
- m_B0/Σ⁻ = 97/22 at 1.1 ppm

But 97 is NOT in the current AXM_0118 catalog because:
- 97 = 4² + 9² requires 9, which is NOT in D_framework = {1,2,3,4,7,8,11}

### The Resolution

97 = 2⁴ + 3⁴ = dim(C)⁴ + Im(H)⁴

Both 2 and 3 ARE direct framework dimensions. The fourth-power representation uses **more fundamental** inputs than the sum-of-squares representation.

### Key Identity

The same numerical values serve both representations:
```
2⁴ = 16 = 4²    (dim(C)⁴ = dim(H)²)
3⁴ = 81 = 9²    (Im(H)⁴ = (Im(H)²)²)
```

So 97 = 2⁴ + 3⁴ = 4² + 9². The fourth-power form is primary; the sum-of-squares form is derivative.

---

## The Unified Framework Prime Catalog

### Level 1: Sum-of-Squares Primes (8 primes — current AXM_0118)

| Prime | a² + b² | Algebraic Content |
|-------|---------|-------------------|
| 2 | 1² + 1² | R + Im(C) |
| 5 | 1² + 2² | R + C |
| 13 | 2² + 3² | C + Im(H) |
| 17 | 1² + 4² | R + H |
| 53 | 2² + 7² | C + Im(O) |
| 73 | 3² + 8² | Im(H) + O |
| 113 | 7² + 8² | Im(O) + O |
| 137 | 4² + 11² | H + n_c |

### Level 2: Fourth-Power Primes (10 primes — NEW)

| Prime | a⁴ + b⁴ | Algebraic Content | Category |
|-------|---------|-------------------|----------|
| 2 | 1⁴ + 1⁴ | R + R | Pure associative |
| 17 | 1⁴ + 2⁴ | R + C | Pure associative |
| 97 | 2⁴ + 3⁴ | C + Im(H) | Pure associative |
| 257 | 1⁴ + 4⁴ | R + H | Pure associative |
| 337 | 3⁴ + 4⁴ | Im(H) + H | Pure associative |
| 2417 | 2⁴ + 7⁴ | C + Im(O) | Assoc-nonassoc bridge |
| 2657 | 4⁴ + 7⁴ | H + Im(O) | Assoc-nonassoc bridge |
| 4177 | 3⁴ + 8⁴ | Im(H) + O | Assoc-nonassoc bridge |
| 14657 | 2⁴ + 11⁴ | C + n_c | Crystal bridge |
| 14897 | 4⁴ + 11⁴ | H + n_c | Crystal bridge |

### Overlap and Complement

- **In both catalogs**: {2, 17}
- **Level 1 only**: {5, 13, 53, 73, 113, 137}
- **Level 2 only**: {97, 257, 337, 2417, 2657, 4177, 14657, 14897}
- **Unified total**: 16 primes

---

## The Associative Pattern

### Consecutive Fourth-Power Primes

| n | n⁴ + (n+1)⁴ | Prime? | Framework Dimensions |
|---|-------------|--------|---------------------|
| 1 | 17 | YES | dim(R), dim(C) — BOTH in D_fw |
| 2 | 97 | YES | dim(C), Im(H) — BOTH in D_fw |
| 3 | 337 | YES | Im(H), dim(H) — BOTH in D_fw |
| 4 | 881 | YES | dim(H), 5 — 5 NOT in D_fw |
| 5 | 1921 = 17×113 | NO | — |
| 7 | 6497 = 73×89 | NO | Im(O), dim(O) — COMPOSITE despite BOTH in D_fw |

### Observations

1. **n = 1,2,3**: All prime, using exactly {1,2,3,4} = the **associative** dimensions
2. **n = 4**: Still prime (881), but 5 ∉ D_framework — exits the framework
3. **n = 7**: Both 7 and 8 are framework dimensions, but 7⁴ + 8⁴ = 6497 is COMPOSITE
4. **The pure non-associative case always fails**: 7⁴ + 8⁴, 7⁴ + 7⁴, 8⁴ + 8⁴ are all composite
5. **Bridge primes require one associative dimension**: All three bridge primes (2417, 2657, 4177) have one input from {1,2,3,4} and one from {7,8}

### Interpretation [CONJECTURE]

The consecutive prime pattern n⁴ + (n+1)⁴ produces primes exactly through the associative dimensions. The non-associative octonion dimensions cannot sustain pure fourth-power primes, but can form "bridges" when partnered with an associative dimension. This mirrors the algebraic property: associativity enables the ring structure needed for clean norm arithmetic.

---

## Relationship to Q(ζ₈) and Quaternions

### The Shared "4"

Three independent mathematical constructions produce the number 4:
1. **dim(H) = 4**: Cayley-Dickson doubling (2² = 4)
2. **deg(Φ₈) = φ(8) = 4**: Euler's totient function
3. **[Q(ζ₈) : Q] = 4**: Field extension degree

### Known Connection [PROVEN]

Q(ζ₈) = Q(i, √2) contains Q(i) as a subfield. Q(i) splits the Hamilton quaternion algebra H = (−1,−1)_Q. Therefore Q(ζ₈) also splits H.

The full norm of Q(ζ₈)/Q factors through Q(i):

```
N_{Q(ζ₈)/Q}(α) = N_{Q(i)/Q}(N_{Q(ζ₈)/Q(i)}(α))
```

For the general element α = a + bζ₈ + cζ₈² + dζ₈³:
```
N(α) = (a² − c² + 2bd)² + (2ac − b² + d²)²
```

This is always a **sum of two squares** — reflecting the tower Q ⊂ Q(i) ⊂ Q(ζ₈).

### Unknown Connection [OPEN]

Whether the shared "4" among dim(H), deg(Φ₈), and [Q(ζ₈):Q] has a common root beyond being independently derived as "4" is an **open mathematical question**. No theorem in current mathematics establishes a causal link.

---

## Implications for AXM_0118

### Current State

AXM_0118 defines framework primes as p = a² + b² with a, b ∈ D_framework. This produces 8 primes. The prime 97 (used in Tier 1 claims) is NOT in this catalog.

### Proposed Generalization

**Cyclotomic Norm Form Principle**: Framework primes are primes p expressible as cyclotomic norms N_{Q(ζₙ)/Q}(a + b·ζₙ) with a, b ∈ D_framework, for n ∈ {4, 8}.

- **n = 4** (Level 1): N(a+bi) = a² + b² → 8 primes
- **n = 8** (Level 2): N(a+bζ₈) = a⁴ + b⁴ → 10 primes
- **Unified**: 16 primes total

### Why Only n = 4 and n = 8?

- **n = 4**: Q(ζ₄) = Q(i) — the complex numbers, F = C in the framework
- **n = 8**: Q(ζ₈) has degree 4 = dim(H) — the quaternionic extension
- **n = 3**: Would give a² − ab + b² (Eisenstein primes) — not evidenced in the framework
- **n = 5, 7, ...**: Higher cyclotomic norms have cross-terms; no evidence these appear

The restriction to n = 4 and n = 8 corresponds to the two cyclotomic fields whose restricted norm forms are **pure power sums** (no cross-terms).

### Assumption Classification

| Component | Classification | Status |
|-----------|---------------|--------|
| Norm identity N(a+bζ₈) = a⁴+b⁴ | [I-MATH] | PROVEN — algebraic number theory |
| Z[ζ₈] has class number 1 | [I-MATH] | PROVEN |
| Quartan primes satisfy p ≡ 1 mod 16 | [I-MATH] | PROVEN |
| Level 2 catalog (10 primes) | [DERIVATION] | Pure number theory, verified |
| Selection of n = 4, 8 | [D] AXM_0120 (CCP) | RESOLVED S252: CCP forces D_fw = {R,C,H,O} → dims 4, 8 |
| Physical significance of Level 2 | [CONJECTURE] | Pattern matching, no mechanism |

---

## What Would Falsify This

1. If 97 turns out NOT to be physically significant (other formulas for θ_W or m_B0/Σ⁻ work better)
2. If Level 2 primes other than 97 and 337 have no physical applications
3. If primes from n = 3 or n = 5 cyclotomic norms appear in the framework (would require further generalization)
4. If 257, 2417, 2657, 4177 make no physical predictions (would weaken the "unmapped primes predict undiscovered constants" claim)

---

## References

- OEIS A002645: Quartan primes (primes of the form x⁴ + y⁴)
- Friedlander & Iwaniec, "The polynomial X² + Y⁴ captures its primes" (Annals of Mathematics, 1998)
- Tsunekawa, "Sum of two fourth powers of integers" (Nagoya Math. J., 1960)
- Conrad, "Cyclotomic Extensions" (UConn lecture notes)
- Bateman & Horn, "A heuristic asymptotic formula" (Math. Comp., 1962)
- Green & Sawhney, "Primes of the form p² + nq²" (arXiv:2410.04189, 2024)

---

## Verification

**Script**: `verification/sympy/fourth_power_norm_form_catalog.py`
**Tests**: 20/20 PASS
**Created**: Session 184
