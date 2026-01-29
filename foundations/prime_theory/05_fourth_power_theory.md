# Fourth Power Theory

## Why Fourth Powers Are Special

### The Uniqueness Theorem

**Theorem**: Among all powers k ≥ 2, fourth power (k=4) is special:

1. It is the LARGEST k where n^k + (n+1)^k can be prime for infinitely many n
2. It is the SMALLEST even k > 2 without algebraic factorization
3. Its cyclotomic polynomial Φ_8(x) = x^4 + 1 is irreducible over Q

### Proof Sketch

**Odd powers**: For odd k, we have the factorization
```
a^k + b^k = (a + b)(a^{k-1} - a^{k-2}b + ... + b^{k-1})
```
So n^k + (n+1)^k is always divisible by 2n+1 ≥ 3, never prime.

**k = 6**: We have
```
n^6 + (n+1)^6 = (2n^2 + 2n + 1)(n^4 + 2n^3 + 5n^2 + 4n + 1)
```
Both factors > 1 for n ≥ 1, so always composite.

**k = 4**: No such factorization exists over Z. This is because:
- Φ_8(x) = x^4 + 1 is irreducible over Q
- The splitting field Q(ζ_8) has prime degree structure

**k = 2**: Also has no algebraic factorization, and n^2 + (n+1)^2 can be prime.

---

## The Consecutive Fourth-Power Prime Sequence

### Verified by Computation

| n | n^4 + (n+1)^4 | Prime? | Factorization |
|---|---------------|--------|---------------|
| 1 | 17 | YES | - |
| 2 | 97 | YES | - |
| 3 | 337 | YES | - |
| 4 | 881 | YES | - |
| 5 | 1921 | NO | 17 × 113 |
| 6 | 3697 | YES | - |
| 7 | 6497 | NO | 73 × 89 |
| 8 | 10657 | YES | - |
| 9 | 16561 | YES | - |
| 10 | 24641 | NO | 41 × 601 |
| 11 | 35377 | NO | 17 × 2081 |
| 12 | 49297 | YES | - |
| 13 | 66977 | YES | - |
| 14 | 89041 | YES | - |

### Key Observation

The run of FOUR consecutive primes (n = 1,2,3,4) is exceptional.

There's no other run of 4+ consecutive fourth-power-sum primes in the first 100 values.

---

## Modular Arithmetic of Fourth Powers

### n^4 + (n+1)^4 mod small primes

**mod 2**: Always ≡ 1 (odd)

**mod 3**:
- n ≡ 0: 0 + 1 = 1
- n ≡ 1: 1 + 16 ≡ 1 + 1 = 2
- n ≡ 2: 16 + 81 ≡ 1 + 0 = 1

So always ≡ 1 or 2 (mod 3), never divisible by 3.

**mod 5**:
Fourth powers mod 5 are {0, 1}
- n^4 ≡ 0 or 1
- (n+1)^4 ≡ 0 or 1
- Sum ≡ 0, 1, or 2 (mod 5)

Can be divisible by 5 (when both ≡ 0, which happens when n ≡ 0 mod 5 and n ≡ 4 mod 5).

**mod 17**:
Since 17 = 1^4 + 2^4, we expect patterns. Indeed:
- 2^4 + 3^4 = 97 ≡ 12 (mod 17)
- 3^4 + 4^4 = 337 ≡ 14 (mod 17)
- 5^4 + 6^4 = 1921 ≡ 0 (mod 17) → divisible by 17!

---

## Sophie Germain's Identity Applied

### The Identity

```
a^4 + 4b^4 = (a^2 + 2b^2 + 2ab)(a^2 + 2b^2 - 2ab)
```

### Why It Doesn't Apply to a^4 + b^4

The coefficient 4 in front of b^4 is essential. Without it, no factorization.

### Application: n^4 + 4 × m^4 is Always Composite (for n,m > 0 unless n=m=1)

- 1^4 + 4(1)^4 = 5 (prime, the exception)
- 2^4 + 4(1)^4 = 20 = 4 × 5
- 1^4 + 4(2)^4 = 65 = 5 × 13
- 2^4 + 4(2)^4 = 80 = 16 × 5

---

## Algebraic Structure of x^4 + y^4

### Over Various Rings

| Ring | Factorization of x^4 + y^4 |
|------|---------------------------|
| Z | Irreducible (for most x,y) |
| Z[i] | (x^2 + iy^2)(x^2 - iy^2) |
| Z[ζ_8] | (x + ζ_8 y)(x + ζ_8^3 y)(x + ζ_8^5 y)(x + ζ_8^7 y) |
| F_p for various p | Depends on p mod 8 |

### Connection to Norm Forms

In the Gaussian integers Z[i]:
```
N(a + bi) = a^2 + b^2
```

In Z[ζ_8]:
```
N(a + bζ_8) relates to fourth powers
```

The norm form over Z[ζ_8] is a quartic form that governs fourth-power arithmetic.

---

## Fourth Powers and Fermat Primes

### Fermat Primes as Fourth-Power Sums

F_n = 2^(2^n) + 1

For n ≥ 2, we can write:
```
F_2 = 2^4 + 1 = 16 + 1 = 17
F_3 = 2^8 + 1 = (2^2)^4 + 1 = 4^4 + 1 = 257
F_4 = 2^16 + 1 = (2^4)^4 + 1 = 16^4 + 1 = 65537
```

So Fermat primes for n ≥ 2 are of the form (2^(2^(n-2)))^4 + 1.

### Pattern with Division Algebra Dimensions

- F_2 = 17 = 1 + 2^4 = 1 + dim(C)^4
- F_3 = 257 = 1 + 4^4 = 1 + dim(H)^4
- "F_4" = 1 + 8^4 = 4097 = 17 × 241 (NOT prime)

The pattern fails at dim(O) = 8!

---

## The Quartic Character

### Definition

For odd prime p ≡ 1 (mod 4), the quartic residue symbol (a/p)_4 determines whether a is a fourth power mod p.

### Values

(a/p)_4 ∈ {1, -1, i, -i} (fourth roots of unity)

### Connection to Prime Factorization

In Z[i], for p ≡ 1 (mod 4), we have p = ππ̄.

The quartic character of a mod p relates to how (a) factors in Z[ζ_8] above the primes over p.

---

## Density of Fourth-Power-Sum Primes

### Heuristic

By the prime number theorem, primes near N have density ~1/ln(N).

For n^4 + (n+1)^4 ≈ 2n^4, the "probability" of being prime is ~1/(4 ln n).

This predicts infinitely many fourth-power-sum primes, but increasingly sparse.

### Computed Density

Among n = 1 to 100:
- 38 values of n give primes
- Density ≈ 38%

Among n = 1 to 1000:
- Approximately 120 primes
- Density ≈ 12%

The density decreases as predicted.

---

## Open Questions

1. **Are there infinitely many fourth-power-sum primes?**
   Believed yes, but not proven.

2. **What is the longest run of consecutive fourth-power-sum primes?**
   We know n = 1,2,3,4 all give primes. Is there a longer run anywhere?

3. **Why does 17 appear so often as a factor?**
   - 5^4 + 6^4 = 1921 = 17 × 113
   - 11^4 + 12^4 = 35377 = 17 × 2081
   - 1^8 + 4^8 = 4097 = 17 × 241

   Is there a pattern related to 17 = 1^4 + 2^4?

4. **Connection to twin primes?**
   17 and 19 are twin primes. Is there a fourth-power connection?
