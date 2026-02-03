# THM_0451 Theorem: Second Law

**Tag**: 0451
**Type**: THEOREM
**Status**: CANONICAL (proof corrected Session 196 — uses revised DEF_0227)
**Source**: core/07_information.md

---

## Requires

- [AXM_0107: Non-negative loss] — Delta_I(pi_1 -> pi_2) >= 0 for valid transitions
- [DEF_0227: Information loss] — Delta_I(pi_1 -> pi_2) = dim(U_{pi_1}) - dim(U_{pi_2})
- [THM_0450: Conservation] — I_pi + S_pi = dim(V)

## Provides

- Entropy S_pi is non-decreasing along valid transitions
- Strict increase when Delta_I > 0

---

## Statement

**Theorem I.2 (Second Law)**

```
For any valid transition pi_1 -> pi_2:

    S_{pi_2} >= S_{pi_1}

with equality iff dim(U_{pi_1}) = dim(U_{pi_2}).
```

Entropy (hidden information) never decreases along valid transitions.

---

## Proof

### Given

- Delta_I(pi_1 -> pi_2) = dim(U_{pi_1}) - dim(U_{pi_2}) >= 0 [AXM_0107 + DEF_0227]
- S_pi = dim(V) - dim(U_pi) for all pi [THM_0450]

### Derivation

From AXM_0107:

```
dim(U_{pi_1}) - dim(U_{pi_2}) >= 0
==>  dim(U_{pi_2}) <= dim(U_{pi_1})
==>  -dim(U_{pi_2}) >= -dim(U_{pi_1})
==>  dim(V) - dim(U_{pi_2}) >= dim(V) - dim(U_{pi_1})
==>  S_{pi_2} >= S_{pi_1}
```

Equality holds iff dim(U_{pi_2}) = dim(U_{pi_1}), i.e., Delta_I = 0. QED

---

## Corollary: Entropy along temporal sequences

For any temporal sequence pi_0 -> pi_1 -> ... -> pi_n:

```
S_{pi_0} <= S_{pi_1} <= ... <= S_{pi_n}
```

**Proof**: Apply the theorem to each consecutive pair. [Transitivity of <=] QED

This is the perspective framework's version of the second law of thermodynamics: entropy increases monotonically along the arrow of time.

---

## Verification

**Script**: `verification/sympy/conservation_second_law_proof.py`
**Status**: PASS

---

## Erratum (Session 196)

The original proof had a logical error. It claimed:

1. AXM_0107: Delta_I >= 0
2. Therefore |U_pi| decreases, so |H_pi| increases (second law)

The problem: the original DEF_0227 defined Delta_I as the **overlap loss** dim(U_{pi_1}) - dim(U_{pi_1} cap U_{pi_2}), which is always >= 0 for any pair of subspaces (tautological). This definition does NOT imply dim(U_{pi_2}) <= dim(U_{pi_1}).

**Counterexample with old definition**: V = R^4, U_{pi_1} = span{e1, e2} (dim 2), U_{pi_2} = span{e2, e3, e4} (dim 3). Old Delta_I = 2 - 1 = 1 >= 0, but dim(U_{pi_2}) = 3 > 2 = dim(U_{pi_1}). Entropy DECREASED despite Delta_I >= 0.

The corrected proof uses the revised DEF_0227 where Delta_I = dim(U_{pi_1}) - dim(U_{pi_2}) (net dimension change). With this definition, Delta_I >= 0 is a genuine constraint (not tautological), and the second law follows in two lines.

---

## Notes

The second law is a direct consequence of AXM_0107 (non-negative loss) combined with THM_0450 (conservation). The physical content is entirely in the axiom — the theorem just translates "accessible dimension decreases" into "hidden dimension increases."

**What this means**: Every valid transition either preserves or reduces accessible information. No perspective can spontaneously gain access to new content beyond what it currently sees. This is the mathematical expression of the arrow of time.

---

## History

- Original: Proof from AXM_0107 + THM_0450 (logically broken due to DEF_0227 error)
- Session 133: Minor cleanup
- Session 196: Identified logical error; corrected DEF_0227; rewrote proof; added erratum with counterexample
