# Prime Number Theory Knowledge Base

**Purpose**: Comprehensive reference for advanced prime number theory, especially connections to division algebras, cyclotomic fields, and algebraic number theory.

**Usage**: Invoke `/prime-expert` to bring this knowledge into conversation.

---

## Contents

| File | Topic |
|------|-------|
| `01_fundamental_theorems.md` | Core theorems and identities |
| `02_cyclotomic_fields.md` | Cyclotomic polynomials and fields |
| `03_algebraic_integers.md` | Gaussian, Eisenstein, and general algebraic integers |
| `04_division_algebra_connections.md` | Links between primes and R, C, H, O |
| `05_fourth_power_theory.md` | Why fourth powers are special |
| `06_reciprocity_laws.md` | Quadratic and higher reciprocity |
| `07_prime_distribution.md` | Density theorems and splitting |
| `08_open_questions.md` | Unsolved problems and conjectures |
| `09_session_125_findings.md` | Bridge primes and cosmology (NEW) |
| `PROJECT_PRIME_PATTERN_AUDIT.md` | Systematic review project (PROPOSED) |

---

## Quick Reference

### The Four Normed Division Algebras (Hurwitz Theorem)

| Algebra | Dim | Im Dim | Properties |
|---------|-----|--------|------------|
| R (reals) | 1 | 0 | Ordered, commutative, associative |
| C (complex) | 2 | 1 | Commutative, associative |
| H (quaternions) | 4 | 3 | Associative, non-commutative |
| O (octonions) | 8 | 7 | Non-associative, alternative |

### Key Primes from Fourth-Power Sums

**Consecutive (gap=1)**:
| Formula | Value | Type |
|---------|-------|------|
| 1^4 + 2^4 | 17 | Fermat prime F_2 |
| 2^4 + 3^4 | 97 | Prime |
| 3^4 + 4^4 | 337 | Prime |
| 1^4 + 4^4 | 257 | Fermat prime F_3 |

**Bridge (cross associative/non-associative boundary)**:
| Formula | Value | Cosmological Use |
|---------|-------|------------------|
| 2^4 + 7^4 | 2417 | l_1 = 2417/11 |
| 4^4 + 7^4 | 2657 | Omega_m ~ 2657/42 |
| 3^4 + 8^4 | 4177 | l_1 = 4177/19, H_0 = 4177/62 |

### Fermat Primes

F_n = 2^(2^n) + 1

| n | F_n | Prime? |
|---|-----|--------|
| 0 | 3 | Yes |
| 1 | 5 | Yes |
| 2 | 17 | Yes |
| 3 | 257 | Yes |
| 4 | 65537 | Yes |
| 5+ | ... | All known are composite |

---

## Key Insight for Perspective Cosmology

The consecutive fourth-power primes 17, 97, 337 use exactly the dimensions:
- dim(R) = 1
- dim(C) = 2
- Im(H) = 3
- dim(H) = 4

These are the **associative** division algebra dimensions. The pattern breaks at octonions (non-associative).

This is NOT coincidence but reflects deep algebraic structure:
1. Fourth power is the largest k where n^k + (n+1)^k can be prime
2. The 8th cyclotomic polynomial Phi_8(x) = x^4 + 1 has degree phi(8) = 4 = dim(H)
3. Splitting of primes in Q(zeta_8) connects to quaternionic structure

### Dimension-Observable Correspondence (Session 125)

Different dimensions govern different physics domains:

| Dimension | Domain | Examples |
|-----------|--------|----------|
| Im_H = 3 | Expansion | H_0, r_s, horizons |
| n_c = 11 | Oscillation | l_1, acoustic peaks |
| Im_O = 7, O = 8 | Inventory | Omega_m, Omega_L |

Crossover: z_star = (Im_H * n_c)^2 = 33^2 = 1089

---

## Sources and Further Reading

- [Cyclotomic Fields - Wikipedia](https://en.wikipedia.org/wiki/Cyclotomic_field)
- [Hurwitz's Theorem - Wikipedia](https://en.wikipedia.org/wiki/Hurwitz%27s_theorem_(composition_algebras))
- [Sophie Germain Identity - Brilliant](https://brilliant.org/wiki/sophie-germain-identity/)
- [Fermat's Two Squares Theorem - Wikipedia](https://en.wikipedia.org/wiki/Fermat%27s_theorem_on_sums_of_two_squares)
- [Keith Conrad's Cyclotomic Extensions](https://kconrad.math.uconn.edu/blurbs/galoistheory/cyclotomic.pdf)

---

*Last updated: 2026-01-28*
