# DEF_02C2 Definition: Framework Primes

**Tag**: 02C2
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/crystallization/symmetry_breaking_chain.md
**Added**: Session 144 (formalization from S132)

---

## Requires

- [DEF_02C1: Framework dimensions (D_framework)]
- [AXM_0118: Prime attractor selection]

## Provides

- The set of 8 primary framework primes
- Classification into crystallization stages

---

## Statement

The **primary framework primes** are the primes expressible as p = a² + b² where a, b ∈ D_framework:

```
{2, 5, 13, 17, 53, 73, 113, 137}
```

| Prime | Sum of squares | Division algebra content |
|-------|---------------|------------------------|
| 2 | 1² + 1² | R² + Im(C)² |
| 5 | 1² + 2² | R² + C² |
| 13 | 2² + 3² | C² + Im(H)² |
| 17 | 1² + 4² | R² + H² |
| 53 | 2² + 7² | C² + Im(O)² |
| 73 | 3² + 8² | Im(H)² + O² |
| 113 | 7² + 8² | Im(O)² + O² |
| 137 | 4² + 11² | H² + n_c² |

### Crystallization stage assignment

| Stage | Breaking | Primes activated | Sum |
|-------|----------|-----------------|-----|
| 1 | SO(11) → SO(4)×SO(7) | 2, 5, 13, 17 | 37 |
| 2 | SO(7) → G₂ | 53, 73, 113 | 239 |
| 3 | G₂ → SU(3) | 137 | 137 |

### Level 2 framework primes (fourth-power norm forms)

Primes p = a⁴ + b⁴ = N_{Q(ζ₈)/Q}(a + bζ₈) where a, b ∈ D_framework (Session 184):

| Prime | Fourth-power form | Algebraic Content | Category |
|-------|------------------|-------------------|----------|
| 2 | 1⁴ + 1⁴ | R + R | Pure associative |
| 17 | 1⁴ + 2⁴ | R + C | Pure associative (also Level 1) |
| 97 | 2⁴ + 3⁴ | C + Im(H) | Pure associative |
| 257 | 1⁴ + 4⁴ | R + H | Pure associative (Fermat F₃) |
| 337 | 3⁴ + 4⁴ | Im(H) + H | Pure associative |
| 2417 | 2⁴ + 7⁴ | C + Im(O) | Assoc-nonassoc bridge |
| 2657 | 4⁴ + 7⁴ | H + Im(O) | Assoc-nonassoc bridge |
| 4177 | 3⁴ + 8⁴ | Im(H) + O | Assoc-nonassoc bridge |
| 14657 | 2⁴ + 11⁴ | C + n_c | Crystal bridge |
| 14897 | 4⁴ + 11⁴ | H + n_c | Crystal bridge |

Level 2 only (not reachable by Level 1): {97, 257, 337, 2417, 2657, 4177, 14657, 14897}

Key identity: a⁴ + b⁴ = N_{Q(ζ₈)/Q}(a + bζ₈) [PROVEN — I-MATH]
This is the quartic analogue of a² + b² = N_{Q(i)/Q}(a + bi).

See `foundations/prime_theory/05b_fourth_power_norm_forms.md` for full analysis.

### Legacy: Secondary framework primes (pre-S184 classification)

Primes previously classified via derived sum-of-squares representations:

- 37 = 1² + 6² (6 = C × Im(H))
- 97 = 4² + 9² (9 = Im(H)²) — NOW understood as Level 2 primary: 97 = 2⁴ + 3⁴
- 193 = 7² + 12² (12 = n_c + 1)
- 337 = 9² + 16² (9 = Im(H)², 16 = H²) — NOW understood as Level 2 primary: 337 = 3⁴ + 4⁴

---

## Dependencies

- [DEF_02C1]: D_framework provides the allowed summands
- [AXM_0118]: Prime attractor selection (crystallization selects sums-of-squares primes)
- [I-MATH: Fermat]: A prime p = a² + b² iff p = 2 or p ≡ 1 (mod 4)

## Used By

- Fine structure constant (137 = H² + n_c²)
- Koide phase denominators (73, 97)
- Weinberg angle formulas (17, 73, 97)
- Quark Koide (37, 53, 97)
- Coupling-Koide connection
- All precision numerical predictions

---

## Verification

- `verification/sympy/crystallization_ordering_SO11.py` — 15/15 PASS
- `verification/sympy/stage3_prime_selection_rule.py` — 9/9 PASS

---

## Notes

The remarkable feature is that exactly 8 primes arise, matching the total number of division algebra dimension parameters. The stage assignment follows the SO(11) crystallization chain: each stage activates the primes whose sum-of-squares components become "visible" at that symmetry breaking step.
