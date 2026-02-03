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
| `05b_fourth_power_norm_forms.md` | **KEY**: a⁴+b⁴ as cyclotomic norm form (S184) |
| `06_reciprocity_laws.md` | Quadratic and higher reciprocity |
| `07_prime_distribution.md` | Density theorems and splitting |
| `08_open_questions.md` | Unsolved problems and conjectures |
| ~~`09_session_125_findings.md`~~ | Moved → `framework/investigations/primes/session_125_cosmological_primes.md` (S140 audit: physics content) |
| ~~`10_session_126_findings.md`~~ | Moved → `framework/investigations/primes/session_126_density_primes.md` (S140 audit: physics content) |
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

### Key Primes from Fourth-Power Sums (= Z[ζ₈] Norm Values)

**Identity (S184)**: a⁴ + b⁴ = N_{Q(ζ₈)/Q}(a + bζ₈) — quartic analogue of a² + b² = N_{Q(i)/Q}(a + bi)

**Pure associative** (a, b ∈ {1,2,3,4}):
| Formula | Value | Type |
|---------|-------|------|
| 1^4 + 2^4 | 17 | Fermat prime F_2 |
| 2^4 + 3^4 | 97 | Quartan prime (CR-061 resolved) |
| 3^4 + 4^4 | 337 | Quartan prime |
| 1^4 + 4^4 | 257 | Fermat prime F_3 |

**Bridge (cross associative/non-associative boundary)**:
| Formula | Value | Cosmological Use |
|---------|-------|------------------|
| 2^4 + 7^4 | 2417 | l_1 = 2417/11 |
| 4^4 + 7^4 | 2657 | Omega_m ~ 2657/42 |
| 3^4 + 8^4 | 4177 | l_1 = 4177/19, H_0 = 4177/62 |

**Crystal bridge** (involving n_c = 11):
| Formula | Value | Use |
|---------|-------|-----|
| 2^4 + 11^4 | 14657 | Unmapped |
| 4^4 + 11^4 | 14897 | Unmapped |

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

**[CONJECTURE]**: This may reflect deep algebraic structure (causal mechanism not proven):
1. ~~Fourth power is the largest k where n^k + (n+1)^k can be prime~~ **Corrected (S189)**: n^k + (n+1)^k can be prime for all k = 2^m. k=4 is special for having the densest consecutive prime run (n=1,2,3,4 all prime — unique among all k).
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

*Last updated: 2026-01-30 (Session 136: auditor tags added)*
