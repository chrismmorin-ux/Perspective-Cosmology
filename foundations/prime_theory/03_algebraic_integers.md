# Algebraic Integers and Prime Factorization

## Gaussian Integers Z[i]

### Definition

Z[i] = {a + bi : a, b ∈ Z}

These are complex numbers with integer real and imaginary parts.

### Properties

- **Norm**: N(a + bi) = a^2 + b^2
- **Units**: {1, -1, i, -i}
- **Ring structure**: Euclidean domain, hence UFD (unique factorization)

### Prime Factorization in Z[i]

| Rational prime p | Behavior in Z[i] |
|------------------|------------------|
| p = 2 | 2 = -i(1+i)^2 (ramifies) |
| p ≡ 1 (mod 4) | p = ππ̄ (splits) |
| p ≡ 3 (mod 4) | p remains prime (inert) |

**Examples**:
- 5 = (2+i)(2-i)
- 13 = (3+2i)(3-2i)
- 17 = (4+i)(4-i)
- 3 remains prime
- 7 remains prime

### Connection to Two Squares

p = a^2 + b^2 ⟺ p splits in Z[i] ⟺ p = 2 or p ≡ 1 (mod 4)

---

## Eisenstein Integers Z[ω]

### Definition

Let ω = e^(2πi/3) = (-1 + √-3)/2, a primitive cube root of unity.

Z[ω] = {a + bω : a, b ∈ Z}

### Properties

- **Norm**: N(a + bω) = a^2 - ab + b^2
- **Units**: {±1, ±ω, ±ω^2} (6th roots of unity)
- **Ring structure**: Euclidean domain, hence UFD

### Prime Factorization in Z[ω]

| Rational prime p | Behavior in Z[ω] |
|------------------|------------------|
| p = 3 | 3 = -ω^2(1-ω)^2 (ramifies) |
| p ≡ 1 (mod 3) | p = ππ̄ (splits) |
| p ≡ 2 (mod 3) | p remains prime (inert) |

**Examples**:
- 7 = (3+ω)(2-ω) = (3+ω)(3+ω^2)
- 13 = (4+ω)(3-ω)
- 2 remains prime
- 5 remains prime

### Connection to Cubic Reciprocity

Eisenstein integers are the natural setting for cubic reciprocity, just as Gaussian integers are for quadratic reciprocity.

---

## Quaternionic Integers (Hurwitz Quaternions)

### Definition

The Hurwitz quaternions are:

H = {a + bi + cj + dk : a,b,c,d ∈ Z or all in Z + 1/2}

These include both "integer" quaternions and "half-integer" quaternions where all four components are half-integers.

### Properties

- **Norm**: N(q) = a^2 + b^2 + c^2 + d^2
- **Units**: 24 elements (the binary tetrahedral group)
- **Ring structure**: Left and right Euclidean domain

### Lagrange's Four Squares Theorem

Every positive integer is a sum of four squares:
n = a^2 + b^2 + c^2 + d^2

This is equivalent to: every positive integer is the norm of a Hurwitz quaternion.

### Prime Factorization

In Hurwitz quaternions, every rational prime p factors as:
- p = ππ̄ where π is a Hurwitz prime with N(π) = p

This is fundamentally different from Z[i] where primes ≡ 3 (mod 4) remain prime.

---

## General Algebraic Integers

### Definition

An algebraic integer is a root of a monic polynomial with integer coefficients.

**Examples**:
- √2 is algebraic integer (root of x^2 - 2)
- (1 + √5)/2 = φ is algebraic integer (root of x^2 - x - 1)
- ζ_n is algebraic integer (root of x^n - 1)

### Ring of Integers

For a number field K, its ring of integers O_K is the set of all algebraic integers in K.

| Field K | Ring of Integers O_K |
|---------|---------------------|
| Q | Z |
| Q(i) | Z[i] |
| Q(ω) | Z[ω] |
| Q(√2) | Z[√2] |
| Q(√5) | Z[(1+√5)/2] |
| Q(ζ_n) | Z[ζ_n] |

### Unique Factorization Failure

Not all rings of integers are UFDs!

**Example**: In Z[√-5]:
- 6 = 2 × 3 = (1+√-5)(1-√-5)
- Neither 2, 3, (1+√-5), nor (1-√-5) factors further
- Two fundamentally different factorizations!

This failure motivated Kummer's ideal numbers and Dedekind's ideal theory.

---

## Ideal Factorization

### Dedekind's Theorem

In any ring of integers O_K, every nonzero ideal factors UNIQUELY as a product of prime ideals.

### Ramification, Splitting, Inertia

For a prime p and extension K/Q with [K:Q] = n:

(p) = P_1^{e_1} ... P_g^{e_g}

where each P_i is a prime ideal with residue degree f_i = [O_K/P_i : Z/pZ].

**Fundamental identity**: Σ e_i f_i = n

| Behavior | Description |
|----------|-------------|
| p splits completely | g = n, all e_i = f_i = 1 |
| p is inert | g = 1, e = 1, f = n |
| p ramifies | some e_i > 1 |

---

## Connection to Division Algebras

### Dimension Progression

| Ring | Dimension | Properties |
|------|-----------|------------|
| Z | 1 | Ordered, UFD |
| Z[i] | 2 | UFD, loses ordering |
| Hurwitz H | 4 | Left/right Euclidean, non-commutative |
| Octonionic? | 8 | No good integer ring (non-associative) |

The progression mirrors the division algebras:
- R → C → H → O
- Z → Z[i] → Hurwitz → ???

### Why No Octonionic Integers?

The octonions are not associative, so there's no good notion of "integer subring" that preserves the multiplication structure nicely.

This may explain why dimension 8 patterns differ from dimensions 1, 2, 4.

---

## Key Primes in Each Ring

### Gaussian Primes that are also rational primes:
3, 7, 11, 19, 23, 31, ... (all ≡ 3 mod 4)

### Eisenstein Primes that are also rational primes:
2, 5, 11, 17, 23, 29, ... (all ≡ 2 mod 3)

### Common to both:
11, 23, 47, 59, 71, 83, ... (≡ 3 mod 4 AND ≡ 2 mod 3, i.e., ≡ 11 mod 12)

These are the "most prime" primes - they remain prime in both extensions.
