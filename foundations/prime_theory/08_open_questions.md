# Open Questions in Prime Theory

## Classical Unsolved Problems

### 1. Twin Prime Conjecture

**Statement**: There are infinitely many primes p such that p + 2 is also prime.

**Status**: Open. Best result: Zhang (2013) proved bounded gaps exist; Maynard reduced gap to 246.

**Relevance**: Pairs of fourth-power-sum primes?

---

### 2. Goldbach Conjecture

**Statement**: Every even integer ≥ 4 is the sum of two primes.

**Status**: Open. Verified computationally to 4 × 10^18.

---

### 3. Riemann Hypothesis

**Statement**: All non-trivial zeros of ζ(s) lie on Re(s) = 1/2.

**Status**: Open. Millennium Prize problem ($1M).

**Relevance**: Controls error terms in prime counting.

---

### 4. Legendre's Conjecture

**Statement**: There is always a prime between n² and (n+1)².

**Status**: Open. Implied by Cramér's conjecture.

---

## Questions Specific to Fourth Powers

### 5. Infinitude of Fourth-Power-Sum Primes

**Question**: Are there infinitely many n such that n⁴ + (n+1)⁴ is prime?

**Status**: Believed yes, but unproven.

**Evidence**: Heuristics predict density ~1/(4 ln n), consistent with data.

---

### 6. Longest Consecutive Run

**Question**: Is n = 1, 2, 3, 4 the longest sequence of consecutive n where n⁴ + (n+1)⁴ is all prime?

**Status**: Unknown. No longer run found in first 10,000 values.

**Significance**: Four consecutive primes is already exceptional.

---

### 7. The Factor 17 Pattern

**Question**: Why does 17 = 1⁴ + 2⁴ appear so often as a factor?

**Observation**:
- 5⁴ + 6⁴ = 1921 = 17 × 113
- 11⁴ + 12⁴ = 35377 = 17 × 2081
- 1⁸ + 2⁸ = 257, but 1⁸ + 4⁸ = 4097 = 17 × 241

**Explanation**: n⁴ + (n+1)⁴ ≡ 0 (mod 17) when n ≡ 1 or 5 (mod 17).

But the deeper question: why this particular congruence pattern?

---

### 8. Higher-Power Generalizations

**Question**: For which powers k are there infinitely many primes n^k + (n+1)^k?

**Known**:
- k odd: Never prime (divisible by 2n+1)
- k = 6: Always factors algebraically
- k = 2, 4: Both believed to have infinitely many primes

**Open**: Is k = 4 "more special" than k = 2?

---

## Questions Connecting Primes and Division Algebras

### 9. The Octonionic Barrier (PARTIALLY RESOLVED - S125)

**Observation**: Pure octonionic patterns fail:
- 7⁴ + 8⁴ = 6497 = 73 × 89 (not prime)
- 1⁴ + 8⁴ = 4097 = 17 × 241 (not prime)

**HOWEVER**: Three "bridge primes" connect associative to non-associative:
- 2417 = 2⁴ + 7⁴ (dim(C) + Im(O))
- 2657 = 4⁴ + 7⁴ (dim(H) + Im(O))
- 4177 = 3⁴ + 8⁴ (Im(H) + dim(O))

**Refined Question**: Why do bridges require at least one associative dimension?

**Speculation**: Non-associativity only fully "blocks" when BOTH dimensions are non-associative. Hybrid combinations inherit partial protection from the associative partner.

---

### 10. The Consecutive Prime Sequence

**Observation**: 1, 2, 3, 4 giving three consecutive fourth-power primes uses exactly:
- dim(R) = 1
- dim(C) = 2
- Im(H) = 3
- dim(H) = 4

**Question**: Is this exhaustion of "associative dimensions" necessary for the consecutive prime pattern?

**Note**: The sequence extends to n = 4 (giving 881 prime), but 5 is not a division algebra dimension.

---

### 11. Fermat Primes and Division Algebras

**Observation**:
- F₂ = 17 = 1⁴ + 2⁴ = 1 + dim(C)⁴
- F₃ = 257 = 1⁴ + 4⁴ = 1 + dim(H)⁴
- F₄ = 65537 = 1⁴ + 16⁴ (16 is not a div alg dim)
- "F₅" would need 1 + 256⁴ (composite)

**Question**: Is there a deep reason Fermat primes align with division algebra dimensions for F₂, F₃?

---

### 12. The Cyclotomic Connection

**Observation**: deg(Φ₈) = φ(8) = 4 = dim(H)

The 8th cyclotomic polynomial governs fourth-power arithmetic, and its degree equals the quaternion dimension.

**Question**: Is this coincidence, or does dim(H) = 4 fundamentally determine quartic number theory?

---

## Computational Challenges

### 13. Large Fourth-Power Primes

**Question**: What is the largest known prime of the form n⁴ + (n+1)⁴?

**Challenge**: For n ~ 10^6, the number is ~2 × 10^24, requiring sophisticated primality testing.

---

### 14. Gaps in Fourth-Power-Sum Primes

**Question**: What is the distribution of gaps between consecutive n values giving primes?

**Data needed**: Systematic computation to large n.

---

## Theoretical Questions

### 15. Algebraic Characterization

**Question**: Can we characterize exactly which integers of the form a⁴ + b⁴ are prime?

**Partial answer**: Must have gcd(a,b) = 1 and a⁴ + b⁴ not divisible by any small prime with specific congruence properties.

---

### 16. Connection to Motives

**Question**: Do fourth-power-sum primes have special properties in the theory of motives?

**Context**: Motives are a deep framework unifying algebraic geometry and number theory.

---

### 17. Quaternionic L-functions

**Question**: Is there a natural L-function attached to the sequence of fourth-power-sum primes?

**Speculation**: The connection to quaternions suggests there might be an automorphic interpretation.

---

## For Perspective Cosmology Framework

### 18. Physical Interpretation

**Question**: If n⁴ + (n+1)⁴ primes arise from division algebra dimensions, what is the physics interpretation?

**Current understanding**:
- 17 appears in electroweak formulas
- 97 and 337 may encode other gauge structure
- The pattern 1→2→3→4 mirrors the associative algebra sequence

---

### 19. Prediction Power

**Question**: Can the framework predict new primes or prime patterns?

**Test**: If the consecutive pattern is essential, what does it predict about future discoveries?

---

### 20. Uniqueness

**Question**: Is the division-algebra-to-prime correspondence unique?

Are there other "natural" integer sequences that produce the same primes 17, 97, 337?

**Known alternatives**:
- 17 = 2^4 + 1 (Fermat)
- 97 is the 25th prime
- 337 is the 68th prime

But the fourth-power-sum structure seems unique.

---

## Priority for Investigation

| Question | Priority | Difficulty | Relevance |
|----------|----------|------------|-----------|
| 9. Octonionic barrier | HIGH | MEDIUM | Direct framework test |
| 10. Consecutive pattern | HIGH | MEDIUM | Core observation |
| 11. Fermat alignment | MEDIUM | LOW | Adds depth |
| 12. Cyclotomic connection | HIGH | MEDIUM | Explains "why 4" |
| 7. Factor 17 pattern | LOW | LOW | Side observation |
| 6. Longest run | LOW | HIGH | Computational |

---

*This document should be updated as questions are resolved or new ones arise.*
