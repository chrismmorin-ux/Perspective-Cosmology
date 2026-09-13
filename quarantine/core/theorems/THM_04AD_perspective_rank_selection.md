# THM_04AD: Perspective Rank Selection (n_d = 4)

**Tag**: 04AD
**Type**: THEOREM
**Status**: DERIVATION
**Created**: Session 188
**Layer**: 1 (uses Layer 0 axioms + I-MATH)

---

## Requires

- [THM_04AC: Evaluation-Induced Perspective] — perspectives exist for any rank k
- [THM_0484: Division Algebra Structure] — defect is a division algebra
- [AXM_0119: Transition Linearity] — transitions are associative
- [AXM_0117: Crystallization Tendency] — maximality selection
- [THM_04AB: Automorphism Independence] — n_c = 11
- [I-MATH: Frobenius theorem] — associative division algebras: dim in {1, 2, 4}
- [I-MATH: G_2 irreducibility] — G_2 = Aut(O) acts irreducibly on Im_O = R^7
- [I-MATH: SO(3) irreducibility] — Aut(H) = SO(3) acts irreducibly on Im_H = R^3

## Provides

- Derivation of n_d = 4 from evaluation map + algebra + irreducibility + maximality
- Elimination of k = 2 by irreducibility constraints (not just maximality)
- Connection between THM_04AC (perspectives exist) and THM_0484 (algebra constrains rank)
- The 4 + 7 = 11 decomposition as a consequence of the selection chain
- Further axiom reduction: k = 4 is derived, not assumed

---

## Statement

**Theorem (Perspective Rank Selection)**

For V_Crystal with dim = n_c = 11 [THM_04AB]:

**(a) Existence**: The evaluation map forces rank-k perspectives to exist for all k in {1, ..., 10} [THM_04AC].

**(b) Algebraic constraint**: The Frobenius theorem restricts the rank to k in {1, 2, 4} [THM_0484, AXM_0119, I-MATH].

**(b') Irreducibility constraint**: G_2 irreducibility forces Im_O into the hidden space; SO(3) irreducibility of Im_H then eliminates k = 2, leaving k in {1, 4} [I-MATH: G_2 acts irreducibly on R^7, SO(3) on R^3].

**(c) Selection**: Among {1, 4}, the crystallization tendency [AXM_0117] selects the maximum: k = 4.

**Result**: n_d = dim(H) = 4, with complementary hidden dimension n_c - n_d = 7 = dim(Im_O).

---

## Proof

### Part (a): Perspectives exist for all k

By THM_04AC, for dim(V_Crystal) = 11 >= 2, any set of k linearly independent vectors (1 <= k <= 10) induces a rank-k orthogonal projection satisfying P1, P2, and P3. This is unconditional — it follows from n^2 = 121 > 11 = n (evaluation map kernel is non-trivial). QED (a).

### Part (b): Frobenius constrains k to {1, 2, 4}

1. By THM_0484, the transition algebra T is a finite-dimensional division algebra over R.

2. By AXM_0119, transitions are R-linear maps on V_Crystal, and composition of linear maps is associative [I-MATH]. Therefore T is an **associative** division algebra.

3. By the Frobenius theorem [I-MATH, 1878]: the only associative division algebras over R are R (dim 1), C (dim 2), and H (dim 4).

4. The defect space V_pi = im(pi) must carry the structure of T. Therefore dim(V_pi) = k in {1, 2, 4}.

5. **Why not k = 8 (octonions)?** The octonions O are a normed division algebra (Hurwitz) but are **non-associative**: (ab)c != a(bc) for generic a, b, c in O [I-MATH]. Since AXM_0119 requires associativity, O is excluded. QED (b).

### Part (b'): Irreducibility eliminates k = 2

The Frobenius constraint alone allows k in {1, 2, 4}. Division algebra subspace irreducibility eliminates k = 2:

1. **G_2 forces Im_O into hidden space.** By AXM_0115, V_Crystal supports octonionic structure. G_2 = Aut(O) acts irreducibly on Im_O = R^7 [I-MATH]. Therefore Im_O cannot be split across the defect/hidden boundary -- it lies entirely in one or the other. Since O is non-associative and the defect must support associative transitions (AXM_0119), Im_O is forced into the hidden space. Result: hidden >= 7, defect <= 4.

2. **SO(3) forces a binary choice.** Similarly, Aut(H) = SO(3) acts irreducibly on Im_H = R^3 [I-MATH]. So Im_H is entirely in defect or entirely in hidden.

3. **Case A (Im_H in defect):** defect contains the 3-dim Im_H, so defect >= 3. Combined with Frobenius: k in {1, 2, 4} and k >= 3, giving **k = 4 uniquely**.

4. **Case B (Im_H in hidden):** hidden contains Im_O(7) + Im_H(3) = 10 dims. So defect <= 11 - 10 = 1. Combined with Frobenius: **k = 1 uniquely**.

5. **k = 2 is eliminated.** For k = 2: defect = 2, hidden = 9. Im_H(3-dim) cannot fit in defect(2-dim). And Im_H(3) + Im_O(7) = 10 cannot fit in hidden(9). Neither case works. k = 2 is inconsistent with irreducibility.

Result: k in {1, 4}. This is a **binary** choice, not ternary. QED (b').

### Part (c): Maximality selects k = 4

1. By AXM_0117 (Crystallization Tendency), the system tends toward configurations with maximal crystallization. A larger defect dimension means more of V_Crystal is experientially accessible.

2. Among k in {1, 4}, the maximum is k = 4 = dim(H).

3. This corresponds to Case A: Im_H in defect, Im_O in hidden.

4. The complementary hidden space has dim = 11 - 4 = 7 = dim(Im_O), which naturally carries the imaginary octonionic structure.

5. The defect decomposes as Im_C(1) + Im_H(3) = R + R^3 = 4, providing the algebraic basis for 1+3 = time + space. QED (c).

---

## The Three-Step Selection

```
Step 1 (THM_04AC):        k in {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}   [all allowed]
Step 2 (Frobenius):       k in {1, 2, 4}                           [algebra filter]
Step 3 (Irreducibility):  k in {1, 4}                              [G_2 + SO(3) filter]
Step 4 (Maximality):      k = 4                                    [selected]
```

The evaluation map provides the menu of possible perspectives. Frobenius eliminates non-division-algebra ranks. G_2 and SO(3) irreducibility eliminate k = 2. Maximality picks between the two survivors.

---

## Dimensional Accounting

| k | Algebra | Defect | Hidden | Gr(k,11) dim | Status |
|---|---------|--------|--------|--------------|--------|
| 1 | R | 1 | 10 | 10 | Allowed (Case B) |
| 2 | C | 2 | 9 | 18 | **Eliminated** (irreducibility) |
| 4 | H | 4 | 7 | 28 | **SELECTED** (Case A) |
| 8 | O | 8 | 3 | 24 | Eliminated (non-associative) |

**Why k = 2 fails**: Im_H = R^3 cannot fit in 2-dim defect. And Im_H(3) + Im_O(7) = 10 cannot fit in 9-dim hidden. Both placements of Im_H are impossible for k = 2.

k = 4 also gives the largest Grassmannian dimension (28) among the surviving values, providing a secondary information-theoretic argument.

---

## Axiom Economy

### Before (pre-THM_04AC/04AD)

| Axiom | Role |
|-------|------|
| AXM_0104 (P1) | Partiality — independent axiom |
| AXM_0102 (P2) | Non-triviality — independent axiom |
| AXM_0113 (P3) | Finite access — independent axiom |
| n_d = 4 | Separate structural assumption |

### After (with THM_04AC + THM_04AD)

| Axiom | Role |
|-------|------|
| AXM_0115 | Algebraic completeness (gives n_c = 11 via THM_04AB) |
| AXM_0119 | Transition linearity (associativity) |
| AXM_0117 | Crystallization tendency (maximality) |

P1, P2, P3: **become theorems** (from THM_04AC)
k = 4: **becomes derived** (from THM_04AD)

This reduces the axiom count by consolidation: three perspective axioms and one structural assumption are replaced by consequences of algebraic structure.

---

## Corollary: SO(8) Triality from Cross-Term

For k = 4, n = 11, the evaluation kernel cross-term has a remarkable property:

```
dim(Hom(W^perp, W)) = 7 * 4 = 28 = dim(so(8))
```

This match is **unique to k = 4** among the Frobenius-allowed values:
- k = 1: Hom(10, 1) = 10, no Lie algebra match
- k = 2: Hom(9, 2) = 18, no Lie algebra match
- k = 4: Hom(7, 4) = 28 = dim(so(8)) **[MATCH]**

SO(8) is the unique rotation group with **triality** — three equivalent 8-dim representations. G_2 = Aut(O) is the common stabilizer of the triality automorphisms, with dim(G_2) = 14 = 28 - 14.

**Moment map confirmation** (THM_04B6, S278): The G_2 moment map on Gr(4,11) has zero locus of codimension 11 = n_c, decomposing 28 = 17 + 11. Symplectic reduction gives dim = 3 = Im_H. This independently confirms that k = 4 produces a Grassmannian whose geometry self-referentially encodes the crystal dimension.

This provides a secondary (and arguably deeper) reason k = 4 is special: it is the only Frobenius-allowed value where the kernel cross-term carries the structure of a Lie algebra with triality, connecting the hidden space to octonionic automorphisms.

**Status**: [DERIVATION] for the dimensional match, [CONJECTURE] for the full SO(8) -> G_2 -> SU(3) breaking chain.

**Verification**: `verification/sympy/hidden_space_structure.py` (5/5 PASS)

---

## What This Does Not Prove

| Question | Status |
|----------|--------|
| Why AXM_0117 selects k = max rather than some other value | Open — AXM_0117 is an axiom |
| The 3+1 split of k = 4 into time + space | Layer 2 — requires physical interpretation |
| Lorentz signature | Not derived from algebra alone |
| Why AXM_0115 holds (algebraic completeness) | Open — AXM_0115 is an axiom |

---

## Verification

**Script 1**: `verification/sympy/perspective_rank_selection.py`
**Tests**: 6/6 PASS

| Test | Description | Result |
|------|-------------|--------|
| 1 | All k from 1-10 give valid perspectives | PASS (10/10) |
| 2 | Frobenius constraint: k in {1, 2, 4} | PASS |
| 3 | Maximality selects k = 4, hidden = 7 | PASS |
| 4 | Complete chain verification | PASS (6/6) |
| 5 | Information-theoretic comparison | PASS |
| 6 | Two-step selection theorem | PASS (4/4) |

**Script 2**: `verification/sympy/rank_selection_tightened.py`
**Tests**: 5/5 PASS

| Test | Description | Result |
|------|-------------|--------|
| 1 | G_2 irreducibility forces Im_O into hidden | PASS |
| 2 | SO(3) constrains Im_H placement (binary choice) | PASS |
| 3 | Composition blindness from evaluation map | PASS |
| 4 | Restricted observable algebra End(W) = 16-dim | PASS |
| 5 | k = 2 eliminated; only {1, 4} survive | PASS |

---

## Assumption Classification

| Component | Classification | Notes |
|-----------|---------------|-------|
| Evaluation map construction | [THEOREM] THM_04AC | Proven, CANONICAL |
| Division algebra structure | [THEOREM] THM_0484 | Proven from AXM_0119 |
| Frobenius theorem | [I-MATH] | 1878, standard |
| Associativity (AXM_0119) | [AXIOM] | Layer 1 |
| Maximality (AXM_0117) | [AXIOM] | Layer 1 |
| n_c = 11 (THM_04AB) | [THEOREM] from AXM_0115 | DERIVATION |

**Weakest link**: AXM_0117 (crystallization tendency) is the axiom that selects k = 4 over k = 1. Without it, we can only prove k in {1, 4}. Note that the choice is now binary (not ternary): irreducibility arguments eliminate k = 2 independently of AXM_0117.

---

## Cross-References

- [THM_04AC: Evaluation-Induced Perspective] — perspectives exist
- [THM_0484: Division Algebra Structure] — defect algebra constraint
- [THM_04A0: Associativity Filter] — defect = H (related result)
- [THM_04AB: Automorphism Independence] — n_c = 11
- [AXM_0117: Crystallization Tendency] — maximality selection
- [AXM_0119: Transition Linearity] — associativity
- `foundations/spacetime_from_associativity.md` — physical interpretation
- [THM_04B6: Moment Map Codimension] — codim = n_c on Gr(4,11), geometric self-reference
