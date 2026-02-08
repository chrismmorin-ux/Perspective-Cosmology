# Division Algebras and Prime Numbers

## The Four Division Algebras

### Hurwitz's Theorem (1898; published posthumously 1923)

The only normed division algebras over R are:

| Algebra | Symbol | Dim | Im Dim | Key Property Lost |
|---------|--------|-----|--------|-------------------|
| Reals | R | 1 | 0 | (none - baseline) |
| Complex | C | 2 | 1 | Ordering |
| Quaternions | H | 4 | 3 | Commutativity |
| Octonions | O | 8 | 7 | Associativity |

### Cayley-Dickson Construction

Each algebra is built from the previous by "doubling":
```
C = R ⊕ Ri       (a,b) * (c,d) = (ac - d̄b, da + bc̄)
H = C ⊕ Cj
O = H ⊕ Hl
```

After octonions, the construction produces **zero divisors** (sedenions have ab = 0 with a,b ≠ 0).

---

## Dimension Sets

### Full Dimensions: {1, 2, 4, 8}

These are the algebra dimensions: 2^0, 2^1, 2^2, 2^3

### Imaginary Dimensions: {0, 1, 3, 7}

These are 2^n - 1 for n = 0, 1, 2, 3

### Combined Set: {0, 1, 2, 3, 4, 7, 8}

All dimensions appearing in division algebra structure.

### Consecutive Subset: {1, 2, 3, 4}

This is {dim(R), dim(C), Im_H, dim(H)} - the ASSOCIATIVE dimensions plus Im_H.

---

## Fourth-Power Primes from Division Algebra Dimensions

> **Note on "Interpretation" column**: The entries describe the division algebra dimension labels for the input values a, b. Since {1,2,3,4,7,8} ARE the division algebra dimensions, these are descriptions (tautologies), not derivations. [MATHEMATICAL FACT: primality results] [CONJECTURE: physical significance of interpretations]

### All Primes of Form a^4 + b^4 with a,b ∈ {1,2,3,4,7,8}:

| a | b | a^4 + b^4 | Prime? | Interpretation |
|---|---|-----------|--------|----------------|
| 1 | 1 | 2 | Yes | 2 × dim(R)^4 |
| 1 | 2 | 17 | Yes | dim(R) + dim(C) |
| 1 | 3 | 82 | No | |
| 1 | 4 | 257 | Yes | dim(R) + dim(H), Fermat F_3 |
| 1 | 7 | 2402 | No | |
| 1 | 8 | 4097 | No | 17 × 241 |
| 2 | 2 | 32 | No | |
| 2 | 3 | 97 | Yes | dim(C) + Im_H |
| 2 | 4 | 272 | No | |
| 2 | 7 | 2417 | Yes | dim(C) + Im_O |
| 2 | 8 | 4112 | No | |
| 3 | 3 | 162 | No | |
| 3 | 4 | 337 | Yes | Im_H + dim(H) |
| 3 | 7 | 2482 | No | |
| 3 | 8 | 4177 | Yes | Im_H + dim(O) |
| 4 | 4 | 512 | No | |
| 4 | 7 | 2657 | Yes | dim(H) + Im_O |
| 4 | 8 | 4352 | No | |
| 7 | 7 | 4802 | No | |
| 7 | 8 | 6497 | No | 73 × 89 |
| 8 | 8 | 8192 | No | |

### The Eight Primes:
2, 17, 97, 257, 337, 2417, 2657, 4177

---

## The Consecutive Pattern

### n^4 + (n+1)^4 for n = 1, 2, 3:

| n | n^4 + (n+1)^4 | Dim Interpretation |
|---|---------------|-------------------|
| 1 | 17 | dim(R)^4 + dim(C)^4 |
| 2 | 97 | dim(C)^4 + Im_H^4 |
| 3 | 337 | Im_H^4 + dim(H)^4 |

All three are prime! This uses exactly {1, 2, 3, 4}.

### The Pattern Extends (but leaves division algebras):

| n | n^4 + (n+1)^4 | Prime? |
|---|---------------|--------|
| 4 | 881 | Yes |
| 5 | 1921 = 17 × 113 | No |

The run of 4 consecutive fourth-power primes is exceptional.

### The Pattern Breaks at Octonions:

7^4 + 8^4 = 6497 = 73 × 89

The "gap" from 4 to 7 (skipping 5, 6) correlates with compositeness.

---

## Why Fourth Powers?

### Algebraic Factorization Obstruction

For odd k: a^k + b^k = (a+b)(a^{k-1} - a^{k-2}b + ... + b^{k-1})

So n^k + (n+1)^k is divisible by 2n+1, never prime for n ≥ 1.

For k = 6: n^6 + (n+1)^6 = (2n^2 + 2n + 1)(quartic)

For k = 4: NO algebraic factorization over Z!

**Correction (Session 189 audit)**: The claim "k=4 is the largest power" is **false**. For k=8: 1⁸+2⁸ = 257 (prime). For k=16: 1¹⁶+2¹⁶ = 65537 (prime). In general, n^k + (n+1)^k is algebraically irreducible over Z iff k is a power of 2 (k = 2, 4, 8, 16, ...).

**Correct conclusion**: k = 4 is special among powers of 2 for:
1. **Consecutive-prime density**: n = 1,2,3,4 all give primes (unique run of 4)
2. **Cyclotomic connection**: Φ₈(x) = x⁴+1, degree = dim(H) = 4
3. **Norm form**: Q(ζ₈) norm forms connect to quaternionic structure

### Cyclotomic Connection

The 8th cyclotomic polynomial Φ_8(x) = x^4 + 1

- Degree = φ(8) = 4
- Splitting field Q(ζ_8) has degree 4
- dim(H) = 4

These three instances of 4 arise from independent mathematical constructions (Euler's totient, field extension degree, Cayley-Dickson). [CONJECTURE: suggestive structural parallel — causal mechanism not proven.]

---

## Fermat Primes and Division Algebras

### Fermat Numbers: F_n = 2^(2^n) + 1

| n | F_n | Prime? | Division Algebra Connection |
|---|-----|--------|----------------------------|
| 0 | 3 | Yes | |
| 1 | 5 | Yes | |
| 2 | 17 | Yes | 1^4 + dim(C)^4 = 1^4 + 2^4 |
| 3 | 257 | Yes | 1^4 + dim(H)^4 = 1^4 + 4^4 |
| 4 | 65537 | Yes | 1^4 + 16^4 (but 16 not a div alg dim) |

### The Fermat-Division Algebra Pattern:

F_2 = 17 = 1^4 + 2^4 = dim(R)^4 + dim(C)^4
F_3 = 257 = 1^4 + 4^4 = dim(R)^4 + dim(H)^4

Also: F_3 = 1^8 + 2^8 = dim(R)^8 + dim(C)^8 (since 4^4 = 2^8)

---

## Hopf Fibrations and Primes

### The Hopf Maps

The only sphere fibrations S^n → S^m are:

| Fibration | Fiber | Total | Base | Division Algebra |
|-----------|-------|-------|------|------------------|
| S^0 → S^1 → S^1 | - | - | - | R |
| S^1 → S^3 → S^2 | C | H | C | C |
| S^3 → S^7 → S^4 | H | O | H | H |
| S^7 → S^15 → S^8 | O | Sedenions | O | O |

(The last one exists as a map but sedenions aren't a division algebra.)

### Adams' Theorem

The only values of n for which S^{n-1} admits a division algebra structure are n = 1, 2, 4, 8.

This is the topological proof of Hurwitz's theorem!

---

## The Deep Connection

### Why do primes, division algebras, and fourth powers interrelate?

1. **Norm forms**: In each division algebra, the norm N(x) = x x̄ is a sum of squares form:
   - R: N(a) = a^2
   - C: N(a+bi) = a^2 + b^2
   - H: N(a+bi+cj+dk) = a^2 + b^2 + c^2 + d^2
   - O: Similar with 8 squares

2. **Prime representation**: These norm forms determine which primes can be represented.

3. **Fourth power universality**: Every integer is a sum of 19 fourth powers (Waring).
   The number 19 relates to the structure of fourth-power representations.

4. **Cyclotomic bridge**: The 8th cyclotomic field connects:
   - Fourth powers (x^4 + 1 = Φ_8(x))
   - Quaternion dimension (degree 4)
   - Prime splitting patterns

---

## The Bridge Primes (Session 125 Discovery)

Three primes connect associative dimensions {1,2,3,4} to non-associative dimensions {7,8}. [MATHEMATICAL FACT: primality verified] [CONJECTURE: physical significance]

| Prime | Formula | Interpretation |
|-------|---------|----------------|
| 2417 | 2^4 + 7^4 | dim(C) + Im_O |
| 2657 | 4^4 + 7^4 | dim(H) + Im_O |
| 4177 | 3^4 + 8^4 | Im_H + dim(O) |

All three bridge primes involve Im_O = 7 or dim(O) = 8.

The "pure octonionic" combination 7^4 + 8^4 = 6497 = 73 × 89 remains composite.

**Observation** [CONJECTURE]: The bridge requires at least one associative dimension. The fully non-associative case fails. (Based on 3 data points; not a theorem.)

---

## The 17 Divisibility Pattern

17 = 1^4 + 2^4 divides n^4 + (n+1)^4 when n ≡ {1, 5, 11, 15} (mod 17).

Notably: 1^4 + 8^4 = 4097 = 17 × 241

The first fourth-power prime (17) "blocks" the octonionic Fermat pattern!

---

## Speculation: Why the Octonionic Barrier? [SPECULATION]

The octonions are non-associative. This breaks:
- Ring structure (no good "integer" subring)
- Matrix representation (can't embed in matrices)
- Galois theory (relies on group structure)

Perhaps this is why:
- 7^4 + 8^4 = 6497 is composite (pure octonionic fails)
- The consecutive prime pattern stops at dim(H) = 4
- There are no Fermat primes 1 + dim(O)^4 = 1 + 8^4 = 4097 = 17 × 241
- Bridge primes exist but require one associative dimension

The associativity of quaternions may be essential for the prime patterns we observe.
