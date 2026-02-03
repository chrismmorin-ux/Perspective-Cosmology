# THM_04A0: Associativity Filter (Defect = H)

**Status**: DERIVATION
**Layer**: 1
**Created**: Session 66, formalized Session 144
**Updated**: Session 181 (G-004 resolved via AXM_0119; promoted SKETCH -> DERIVATION)

---

## Statement

Directed time (T1) requires associativity for unambiguous transition composition:

```
(T_a o T_b) o T_c = T_a o (T_b o T_c)
```

By Hurwitz's theorem [I-MATH], the normed division algebras are R(1), C(2), H(4), O(8). Only R, C, H are associative. The defect must use the maximal associative algebra:

```
Defect structure = H (quaternions, dim = 4)
Crystal complement = Im(C) + Im(H) + Im(O) (dim = 1 + 3 + 7 = 11 = n_c)  [CANONICAL: per CR-010/AXM_0118]
```

This forces n_d = 4 and n_c = 11. [DERIVATION: n_d = 4 from Frobenius maximality; n_c = 11 from complement counting. "Spacetime dimensions" and "crystal dimensions" are Layer 2 identifications — see [A-PHYSICAL] in Implications.]

## Proof Sketch

### Given
- AXM_0116 (T1): Crystal is timeless; time exists only in defect (directed sequences)
- AXM_0119: Transition linearity (gives associativity)
- THM_0484: Transitions form a division algebra
- [I-MATH]: Frobenius classification of associative division algebras
- [I-MATH]: Associativity of R, C, H; non-associativity of O

### Derivation
1. T1: Time = directed sequences of transitions
2. Directed sequences require unambiguous ordering: (a o b) o c = a o (b o c)
3. THM_0484: Transition algebra is a division algebra
4. Hurwitz: normed division algebras = {R, C, H, O}
5. Associative division algebras = {R, C, H} (O fails associativity)
6. Maximum dimension for defect = dim(H) = 4
7. Complement: crystal uses imaginary parts Im(C) + Im(H) + Im(O), dim = 1 + 3 + 7 = 11  [CANONICAL: per CR-010/AXM_0118]

**Gap**: Step 6 assumes maximal choice; formally need to show H is selected over R and C (argument: maximal dimension maximizes crystallization modes, per AXM_0117).

## Verification

Group-theoretic theorem; no numerical verification needed. The Hurwitz classification is a standard mathematical result.

## Implications

> **[LAYER 2/3 CORRESPONDENCE]**: Physical interpretation requires Layer 2 correspondence rules. The algebra filter is Layer 1 mathematics; identification with spacetime and gauge groups is Layer 2/3.

- [LAYER 2] Spacetime is 4-dimensional because the defect is quaternionic [A-PHYSICAL]
- [LAYER 1] n_c = 11 because the crystal gets the remaining algebra dimensions
- [LAYER 2/3] SM gauge group SU(3) × SU(2) × U(1) follows from this split [A-PHYSICAL]

## Source

`framework/investigations/gauge/gauge_from_division_algebras.md` (Section 5.3)
