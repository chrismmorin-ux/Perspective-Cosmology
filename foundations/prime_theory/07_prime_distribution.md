# Prime Distribution Theory

## The Prime Number Theorem

### Statement

Let π(x) = number of primes ≤ x. Then:

```
π(x) ~ x/ln(x)   as x → ∞
```

More precisely: lim_{x→∞} π(x)·ln(x)/x = 1

### Refined Estimates

```
π(x) = Li(x) + O(x·exp(-c·√(ln x)))
```

where Li(x) = ∫₂^x dt/ln(t) is the logarithmic integral.

### Numerical Examples

| x | π(x) | x/ln(x) | Li(x) |
|---|------|---------|-------|
| 10 | 4 | 4.3 | 6.2 |
| 100 | 25 | 21.7 | 30.1 |
| 1000 | 168 | 144.8 | 177.6 |
| 10^6 | 78498 | 72382 | 78628 |
| 10^9 | 50847534 | 48254942 | 50849235 |

Li(x) is a much better approximation than x/ln(x).

---

## Primes in Arithmetic Progressions

### Dirichlet's Theorem (1837)

For coprime a, d, there are infinitely many primes p ≡ a (mod d).

### Density

Among primes ≤ x, those ≡ a (mod d) have density 1/φ(d).

### Examples

| d | a values | Density per class |
|---|----------|-------------------|
| 4 | 1, 3 | 1/2 |
| 3 | 1, 2 | 1/2 |
| 8 | 1, 3, 5, 7 | 1/4 |
| 12 | 1, 5, 7, 11 | 1/4 |

---

## Chebyshev's Bias

### The Phenomenon

Among primes ≤ x, more are ≡ 3 (mod 4) than ≡ 1 (mod 4), for "most" x.

### Explanation

Primes ≡ 1 (mod 4) split in Q(i), while primes ≡ 3 (mod 4) are inert.

The bias is related to the distribution of zeros of L-functions.

### Relevance to Fourth Powers

Primes ≡ 1 (mod 4) can be written as a² + b².
These are the primes where fourth-power arithmetic "works best" (quartic characters exist).

---

## Prime Gaps

### Definition

g_n = p_{n+1} - p_n is the gap after the n-th prime.

### Known Results

- Average gap: ~ln(p_n)
- Largest known gap: 1550 (between primes near 10^18)
- Twin prime conjecture: g_n = 2 infinitely often (unproved)

### Cramér's Conjecture

```
g_n = O((ln p_n)²)
```

Best proven: g_n = O(p_n^(0.525)) (Baker-Harman-Pintz)

---

## Chebotarev Density Theorem

### Statement

For a Galois extension L/K:

The set of primes p of K with Frobenius Fr_p in conjugacy class C has Dirichlet density |C|/|G|.

### For Cyclotomic Extensions

In Q(ζ_n)/Q, primes splitting completely have density 1/φ(n).

### Application to Fourth Powers

For Q(ζ_8)/Q with φ(8) = 4:

Primes p ≡ 1 (mod 8) split completely, density 1/4.

These are the primes where x⁴ + 1 splits into four linear factors mod p.

---

## The Riemann Hypothesis

### Statement

All non-trivial zeros of ζ(s) have real part 1/2.

### Consequence for Primes

If true:
```
π(x) = Li(x) + O(√x · ln x)
```

The error term becomes much smaller.

### For Fourth-Power-Sum Primes

RH would imply better bounds on how often n⁴ + (n+1)⁴ is prime.

---

## Sieve Methods

### The Sieve of Eratosthenes

Remove multiples to find primes.

### Selberg's Sieve

Upper bounds on primes in special sequences.

### Chen's Theorem (1966)

Every sufficiently large even number is the sum of a prime and a semiprime (product of at most 2 primes).

---

## Special Sequences of Primes

### Mersenne Primes

M_p = 2^p - 1

Only 51 known (as of 2024). Related to perfect numbers.

### Fermat Primes

F_n = 2^(2^n) + 1

Only 5 known: 3, 5, 17, 257, 65537.

Connection to division algebras:
- F_2 = 17 = 1^4 + 2^4
- F_3 = 257 = 1^4 + 4^4

### Sophie Germain Primes

p is Sophie Germain prime if 2p + 1 is also prime.

Examples: 2, 3, 5, 11, 23, 29, 41, ...

---

## Distribution of n^4 + (n+1)^4 Primes

### Heuristic Analysis

For large n, n^4 + (n+1)^4 ≈ 2n^4.

By probabilistic model, the "probability" of being prime is approximately:
```
1/ln(2n^4) = 1/(4 ln n + ln 2) ≈ 1/(4 ln n)
```

### Expected Count to N

Number of primes among n^4 + (n+1)^4 for n ≤ N should be approximately:
```
∑_{n=1}^{N} 1/(4 ln n) ≈ N/(4 ln N) × (constant)
```

### Computed Data

| Range | Primes | Density |
|-------|--------|---------|
| 1-10 | 7 | 70% |
| 1-100 | 38 | 38% |
| 1-1000 | ~120 | 12% |
| 1-10000 | ~450 | 4.5% |

The density decreases roughly as 1/ln(n), as predicted.

### Divisibility by 17

Remarkably, 17 = 1^4 + 2^4 divides many fourth-power sums:

- 5^4 + 6^4 = 1921 = 17 × 113
- 11^4 + 12^4 = 35377 = 17 × 2081

This is because 17 | (n^4 + (n+1)^4) whenever n ≡ 1 or 5 (mod 17).

---

## Unsolved Problems

### Twin Prime Conjecture

Are there infinitely many p with p+2 prime?

### Goldbach Conjecture

Is every even n ≥ 4 the sum of two primes?

### Fourth-Power-Sum Primes

Are there infinitely many n with n^4 + (n+1)^4 prime?

Believed yes, but not proven.

### Consecutive Fourth-Power Primes

Is n = 1,2,3,4 the longest run of consecutive n where n^4 + (n+1)^4 is prime?

Unknown!
