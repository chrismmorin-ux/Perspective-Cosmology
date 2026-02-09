# THM_0450 Theorem: Information Conservation

**Tag**: 0450
**Type**: THEOREM
**Status**: CANONICAL (proof corrected Session 196 — dimension form replaces cardinality form)
**Source**: core/07_information.md

---

## Requires

- [AXM_0100: Finiteness] — dim(V) < infinity
- [DEF_0214: Accessible content U_pi] — U_pi = im(A), a subspace of V
- [DEF_0215: Hidden content H_pi] — complement of accessible content
- [DEF_0240: B-structure] — orthonormal basis B gives V an inner product

## Provides

- I_pi + S_pi = dim(V) (dimension conservation)
- dim(V) is constant across all perspectives

---

## Statement

**Theorem I.1 (Information Conservation)**

Define for each perspective pi:

```
I_pi = dim(U_pi)              (accessible information)
S_pi = dim(V) - dim(U_pi)     (hidden information / entropy)
```

Then:

```
I_pi + S_pi = dim(V)     for all pi in Pi
```

The total information capacity dim(V) is constant across all perspectives. Each perspective merely determines how that total is partitioned between accessible and hidden.

---

## Proof

### Given

- V is a finite-dimensional vector space [AXM_0100]
- U_pi is a subspace of V [DEF_0214: U_pi = im(A)]
- I_pi = dim(U_pi) and S_pi = dim(V) - dim(U_pi) are defined above

### Derivation

```
I_pi + S_pi = dim(U_pi) + (dim(V) - dim(U_pi)) = dim(V)
```

This holds for every pi in Pi. Since dim(V) depends only on V (a property of the universe, not the perspective), the sum is constant across all perspectives. QED

---

## Consequences

### Monotonicity tradeoff (used by THM_0451)

Since I_pi + S_pi = dim(V) = constant:

```
I_{pi_2} < I_{pi_1}  <==>  S_{pi_2} > S_{pi_1}
```

A decrease in accessible information implies an increase in hidden information, and vice versa. This is the foundation of the second law (THM_0451).

### Bound on the product I * S

By AM-GM: for non-negative integers I, S with I + S = n:

```
I * S <= (n/2)^2     with equality iff I = S = n/2
```

The "most balanced" perspective (maximizing I * S) has equal accessible and hidden dimensions. This is achievable only when dim(V) is even.

---

## Relationship to orthogonal decomposition

When V has an inner product (from the B-structure, DEF_0240), U_pi has an orthogonal complement U_pi^perp with:

```
V = U_pi  direct_sum  U_pi^perp
dim(U_pi) + dim(U_pi^perp) = dim(V)
```

This is the dimension formula for orthogonal complements [I-MATH]. In this setting, S_pi = dim(U_pi^perp): the hidden information equals the dimension of the orthogonal complement.

**Note on DEF_0215**: The current DEF_0215 defines H_pi = U \ U_pi (set complement), which is NOT a subspace. In the vector space model, the appropriate "hidden subspace" is U_pi^perp (the orthogonal complement). This distinction does not affect the conservation law but matters for structural properties of H_pi. DEF_0215 may warrant a future update.

---

## Verification

**Script**: `verification/sympy/conservation_second_law_proof.py`
**Status**: PASS

---

## Notes

**Erratum (Session 196)**: The original theorem stated conservation in cardinality form: |U_pi| + |H_pi| = |U|. This had two problems:

1. **Type confusion**: U_pi is a subspace of a vector space, so |U_pi| (cardinality) is uncountably infinite for any non-trivial subspace of R^n. The theorem should use dim (dimension), not |.| (cardinality).

2. **Information-theoretic form**: The original defined I_pi = log_2 |U_pi|, which is undefined (log of infinity) in the continuous vector space model. The corrected form uses I_pi = dim(U_pi), which equals log_q |U_pi| in the finite field model (V over F_q) and is well-defined in all settings.

The corrected dimension form is both cleaner and compatible with the rest of the framework (DEF_0227 uses dim, not cardinality).

---

## History

- Original: Cardinality form with log-additive information measures
- Session 133: CR-009 fixed cardinality vs log distinction (but kept cardinality)
- Session 196: Corrected to dimension form; identified type confusion; noted DEF_0215 issue
