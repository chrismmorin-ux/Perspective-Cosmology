# Cyclotomic Fields and Polynomials

## Definition

The **n-th cyclotomic field** Q(ζ_n) is obtained by adjoining a primitive n-th root of unity to Q:

```
ζ_n = e^(2πi/n) = cos(2π/n) + i sin(2π/n)
```

---

## Cyclotomic Polynomials

The **n-th cyclotomic polynomial** Φ_n(x) is the minimal polynomial of ζ_n over Q.

### Fundamental Identity

```
x^n - 1 = ∏_{d|n} Φ_d(x)
```

### First Cyclotomic Polynomials

| n | Φ_n(x) | Degree φ(n) |
|---|--------|-------------|
| 1 | x - 1 | 1 |
| 2 | x + 1 | 1 |
| 3 | x^2 + x + 1 | 2 |
| 4 | x^2 + 1 | 2 |
| 5 | x^4 + x^3 + x^2 + x + 1 | 4 |
| 6 | x^2 - x + 1 | 2 |
| 7 | x^6 + x^5 + x^4 + x^3 + x^2 + x + 1 | 6 |
| **8** | **x^4 + 1** | **4** |
| 9 | x^6 + x^3 + 1 | 6 |
| 10 | x^4 - x^3 + x^2 - x + 1 | 4 |
| 12 | x^4 - x^2 + 1 | 4 |

---

## The Crucial Case: n = 8

### Φ_8(x) = x^4 + 1

This is the polynomial that governs fourth-power arithmetic!

**Properties**:
- Irreducible over Q
- Degree = φ(8) = 4
- Splitting field = Q(ζ_8) = Q(i, √2)

**Roots**: The four 8th roots of unity not already in lower cyclotomic fields:
```
ζ_8 = (1 + i)/√2 = e^(iπ/4)
ζ_8^3 = (-1 + i)/√2
ζ_8^5 = (-1 - i)/√2
ζ_8^7 = (1 - i)/√2
```

**Remarkable fact**: [Q(ζ_8) : Q] = 4 = dim(H) (quaternions). [CONJECTURE: suggestive structural parallel — both numbers arise from independent constructions (Euler's totient vs Cayley-Dickson); causal mechanism not proven.]

---

## Connection to x^4 + y^4

In the ring Z[ζ_8], we can factor:

```
x^4 + y^4 = (x^2 + y^2 ζ_8^2)(x^2 + y^2 ζ_8^6)
          = (x^2 + iy^2)(x^2 - iy^2)
```

But over Z, x^4 + y^4 does NOT factor (for general x, y).

This is why x^4 + y^4 CAN be prime, while x^6 + y^6 cannot (it factors over Z).

---

## Prime Splitting in Cyclotomic Fields

### General Theory

For a prime p not dividing n, the factorization of p in Q(ζ_n) depends on the order of p modulo n:

Let f = ord_n(p) (smallest positive integer with p^f ≡ 1 mod n)

Then (p) splits into φ(n)/f prime ideals, each with inertia degree f.

### For Q(ζ_8):

| p mod 8 | Behavior | f |
|---------|----------|---|
| p = 2 | Ramifies | - |
| p ≡ 1 | Splits completely | 1 |
| p ≡ 3 | Two primes | 2 |
| p ≡ 5 | Two primes | 2 |
| p ≡ 7 | Two primes | 2 |

**Primes that split completely** (p ≡ 1 mod 8): 17, 41, 73, 89, 97, ...

Note: 17 = 1^4 + 2^4 is in this list!

---

## Galois Theory of Cyclotomic Fields

### Galois Group

Gal(Q(ζ_n)/Q) ≅ (Z/nZ)^×

The isomorphism sends σ_a : ζ_n ↦ ζ_n^a to the residue class of a.

### For n = 8:

Gal(Q(ζ_8)/Q) ≅ (Z/8Z)^× = {1, 3, 5, 7} ≅ Z/2Z × Z/2Z

This is the Klein four-group!

**Subfields**:
- Q(i) = fixed field of {1, 5}
- Q(√2) = fixed field of {1, 7}
- Q(√-2) = fixed field of {1, 3}

---

## Connection to Division Algebras

### Dimension Matching

| Structure | Dimension |
|-----------|-----------|
| Quaternions H | 4 |
| [Q(ζ_8) : Q] | 4 |
| Φ_8(x) degree | 4 |
| Fourth power | 4 |

**[CONJECTURE]**: These four instances of the number 4 arise from different mathematical constructions. Whether they share a common root is an open question — see `08_open_questions.md` Q12.

### Deeper Connection

The splitting of x^4 + 1 over Q(ζ_8) parallels the structure of quaternions:
- Both involve "imaginary" units satisfying x^2 = -1
- Both have dimension 4 over their base
- Both relate to rotations in 4D

**Note on group structure**: The 8th roots of unity form the cyclic group Z₈, which is abelian. The quaternion unit group {±1, ±i, ±j, ±k} forms Q₈, which is non-abelian. These groups are NOT isomorphic. However, the subgroup {1, ζ₈², ζ₈⁴, ζ₈⁶} = {1, i, -1, -i} ≅ Z₄ does embed in both, providing a partial connection:
- 1 = 1
- ζ_8^2 = i
- ζ_8^4 = -1
- ζ_8^6 = -i

---

## Factorization Behavior

### Over Q:

Φ_8(x) = x^4 + 1 is IRREDUCIBLE

### Over Q(i):

x^4 + 1 = (x^2 - i)(x^2 + i)

### Over Q(√2):

x^4 + 1 = (x^2 - √2 x + 1)(x^2 + √2 x + 1)

### Over Q(ζ_8) = Q(i, √2):

x^4 + 1 = (x - ζ_8)(x - ζ_8^3)(x - ζ_8^5)(x - ζ_8^7)

Completely splits into linear factors.

---

## Applications to Fourth-Power Primes

### Why 17, 97, 337 are Prime

These numbers equal n^4 + (n+1)^4 for n = 1, 2, 3.

Over Z, this expression cannot be factored (unlike n^6 + (n+1)^6).

The algebraic obstruction is that x^4 + 1 is irreducible over Q.

### The Pattern Breaks

At n = 5: 5^4 + 6^4 = 1921 = 17 × 113

Note that 17 | 1921. This is because 17 = 1^4 + 2^4, and there's a congruence pattern.

---

## Key Insight

**The 8th cyclotomic field Q(ζ_8) is the natural home for understanding fourth-power arithmetic.**

Its degree [Q(ζ_8) : Q] = 4 matches:
- The dimension of quaternions
- The number of division algebras
- The power in "fourth power"

This is the deepest connection between primes and division algebras.
