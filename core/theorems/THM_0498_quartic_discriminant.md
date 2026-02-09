# THM_0498: Quartic Discriminant (First-Order Transition)

**Status**: DERIVATION
**Layer**: 1
**Created**: Session 138, formalized Session 144

---

## Statement

For the SO(N) symmetric traceless matrix model with two quartic invariants [Tr(epsilon^2)]^2 and Tr(epsilon^4), the fixed-point discriminant is negative for all N >= 4:

```
Delta(N) = (A_12 - A_23)^2 - 4*A_13*(N-4) < 0   for all N >= 4
```

where A_ij are one-loop beta function coefficients. This proves NO stable mixed fixed point exists, so the SO(11) -> SO(4)xSO(7) transition is first-order.

## Proof Sketch

### Given
- AXM_0117: Crystallization tendency (SO(n_c) symmetry breaking)
- [I-MATH]: One-loop RG for O(N) symmetric quartic models
- Analytically computed beta function coefficients for general N

### Derivation
1. [I-MATH] Landau expansion: F = c_2 Tr(epsilon^2) + c_3 Tr(epsilon^4) + c_4 [Tr(epsilon^2)]^2 (standard Landau-Ginzburg formalism for SO(N) order parameter)
2. [D: step 1] Two quartic couplings: lambda_1 = c_4, lambda_2 = c_3 (from the two independent quartic invariants of symmetric traceless matrices)
3. [I-MATH] One-loop beta functions: d lambda_i / d ln(mu) = sum_j A_ij lambda_j^2 + ... (standard perturbative RG)
4. [D: step 3] Fixed points require simultaneous zeros of both beta functions (definition of RG fixed point)
5. [D: step 4] Mixed FP condition reduces to quadratic in lambda* = c_3/c_2 (algebraic elimination)
6. [D: step 5] Discriminant Delta(N) computed analytically for general N
7. [D: step 6] Delta(N) < 0 for all N >= 4 (verified symbolically in `so11_discriminant_proof.py`)
8. [D: step 7] No real solutions -> no stable mixed fixed point -> first-order transition

## Verification

**Scripts**:
- `verification/sympy/so11_beta_functions.py` — 13/13 PASS
- `verification/sympy/so11_discriminant_proof.py` — 11/11 PASS

## Implications

- [CONJECTURE] SO(11) crystallization is necessarily first-order (no continuous transition)
- [CONJECTURE] lambda = c_3/c_2 is a free parameter in Landau theory (not determined by RG)
- [CONJECTURE] Consistent with hilltop inflation scenario (first-order -> nucleation dynamics)

## Source

`framework/investigations/cosmology/quartic_coupling_landscape.md` (Sessions 136-138c)
