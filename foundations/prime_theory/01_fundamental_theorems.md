# Fundamental Theorems of Prime Number Theory

## 1. Fundamental Theorem of Arithmetic

Every integer greater than 1 either is a prime number itself or can be represented as the product of prime numbers, and this representation is unique up to the order of the factors.

**Implication**: Primes are the "atoms" of arithmetic.

---

## 2. Fermat's Two Squares Theorem

An odd prime p can be expressed as p = a^2 + b^2 for integers a, b if and only if p ≡ 1 (mod 4).

**Examples**:
- 5 = 1^2 + 2^2 (5 ≡ 1 mod 4)
- 13 = 2^2 + 3^2 (13 ≡ 1 mod 4)
- 17 = 1^2 + 4^2 (17 ≡ 1 mod 4)

**Primes ≡ 3 (mod 4)** cannot be written as sum of two squares:
- 3, 7, 11, 19, 23, 31, ...

**Connection to Gaussian integers**: p ≡ 1 (mod 4) iff p splits in Z[i].

---

## 3. Sophie Germain's Identity

```
a^4 + 4b^4 = (a^2 + 2b^2 + 2ab)(a^2 + 2b^2 - 2ab)
```

**Key consequence**: For positive integers a, b > 1, a^4 + 4b^4 is ALWAYS composite.

**Special case**: 1^4 + 4(1)^4 = 5 is the ONLY prime of this form.

**Application**: n^4 + 4^n is never prime for n > 1.
- If n even: n^4 + 4^n is even
- If n odd: Apply Sophie Germain with a = n, b = 2^((n-1)/2)

---

## 4. Hurwitz's Theorem (1923)

The only normed division algebras over R are:
1. R (dimension 1)
2. C (dimension 2)
3. H quaternions (dimension 4)
4. O octonions (dimension 8)

**Proof approaches**:
- Original: Algebraic (composition algebras)
- Topological: Adams' theorem on Hopf invariant one
- Clifford algebras: Bott periodicity

**Why these dimensions?** The Cayley-Dickson construction doubles dimension but loses properties:
- R → C: Lose ordering
- C → H: Lose commutativity
- H → O: Lose associativity
- O → Sedenions: Lose division (zero divisors appear)

---

## 5. Fermat's Last Theorem (Wiles, 1995)

For n > 2, the equation a^n + b^n = c^n has no positive integer solutions.

**Special case n = 4**: Proved by Fermat himself using infinite descent.

a^4 + b^4 = c^4 has no solutions.

**Relevance**: Constrains what fourth-power sums can equal.

---

## 6. Prime Number Theorem

Let π(x) = number of primes ≤ x. Then:

```
π(x) ~ x / ln(x)
```

as x → ∞.

**Density**: Primes become sparser but never run out.

---

## 7. Dirichlet's Theorem on Primes in Arithmetic Progressions

For coprime a, d, there are infinitely many primes p ≡ a (mod d).

**Example**: Infinitely many primes ≡ 1 (mod 4) and infinitely many ≡ 3 (mod 4).

---

## 8. Chebotarev Density Theorem

In a Galois extension L/K, primes splitting in a specific way have a well-defined density determined by the Galois group structure.

**Special case**: For Q(i)/Q, primes splitting completely (p ≡ 1 mod 4) have density 1/2.

---

## 9. Waring's Problem (Hilbert, 1909)

For every positive integer k, there exists a number g(k) such that every positive integer is the sum of at most g(k) k-th powers.

| k | g(k) |
|---|------|
| 2 | 4 (Lagrange) |
| 3 | 9 |
| 4 | 19 |

**For fourth powers**: Every positive integer is the sum of at most 19 fourth powers.

---

## 10. The abc Conjecture

For coprime positive integers a + b = c, define rad(n) = product of distinct prime factors.

The conjecture states that for any ε > 0, there are only finitely many (a,b,c) with:
```
c > rad(abc)^(1+ε)
```

**Status**: Claimed proved by Mochizuki (2012), still debated.

**Relevance**: Would imply Fermat's Last Theorem and much more.
