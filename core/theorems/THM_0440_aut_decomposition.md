# THM_0440 Theorem: Automorphism Decomposition

**Tag**: 0440
**Type**: THEOREM
**Status**: CANONICAL (promoted from SKETCH — proof completed, Session 196)
**Source**: core/06_basis_geometry.md

---

## Requires

- [AXM_0100: Finiteness] — dim(V) < ∞
- [DEF_0240: B-structure] — orthonormal basis B = {b_1, ..., b_n}
- [DEF_0241: Automorphisms of B] — Aut(B) = { T ∈ GL(V) : T(B) = B }
- [DEF_0242: Subspace decomposition] — B = B_1 ⊔ ... ⊔ B_k, V = V_1 ⊕ ... ⊕ V_k

## Provides

- Aut(B) ≅ Aut(B_1) × Aut(B_2) × ... × Aut(B_k) (group isomorphism)

---

## Statement

**Theorem B.1 (Automorphism Decomposition)**

```
Let B = B_1 ⊔ B_2 ⊔ ... ⊔ B_k be a partition of B into disjoint subsets,
with V_i = span(B_i) the corresponding orthogonal subspaces.

If each B_i is invariant under Aut(B) — i.e., for all T ∈ Aut(B) and all i:

    T(B_i) = B_i

then:
    Aut(B) ≅ Aut(B_1) × Aut(B_2) × ... × Aut(B_k)

as groups, via the restriction map.
```

---

## Proof

### Given

- B = B_1 ⊔ ... ⊔ B_k (disjoint partition) [DEF_0242]
- V = V_1 ⊕ ... ⊕ V_k where V_i = span(B_i) (orthogonal direct sum) [DEF_0242]
- Aut(B) = { T ∈ GL(V) : T(B) = B as a set } [DEF_0241]
- Aut(B_i) = { S ∈ GL(V_i) : S(B_i) = B_i as a set } [DEF_0241 applied to B_i]
- Each B_i is invariant: T ∈ Aut(B) implies T(B_i) = B_i for all i (hypothesis)

### Step 1: Define the restriction map

Define φ: Aut(B) → Aut(B_1) × ... × Aut(B_k) by:

```
φ(T) = (T|_{V_1}, T|_{V_2}, ..., T|_{V_k})
```

where T|_{V_i} is the restriction of T to V_i.

**Well-defined**: Since T(B_i) = B_i (invariance hypothesis), T maps V_i = span(B_i) to itself. So T|_{V_i}: V_i → V_i is a well-defined linear map with T|_{V_i}(B_i) = B_i, hence T|_{V_i} ∈ Aut(B_i). [I-MATH: restriction of linear map to invariant subspace]

### Step 2: φ is a group homomorphism

For T, S ∈ Aut(B):

```
φ(T ∘ S) = ((T ∘ S)|_{V_1}, ..., (T ∘ S)|_{V_k})
          = (T|_{V_1} ∘ S|_{V_1}, ..., T|_{V_k} ∘ S|_{V_k})
          = φ(T) · φ(S)
```

The second equality holds because S maps V_i to V_i (invariance), so (T ∘ S)|_{V_i} = T|_{V_i} ∘ S|_{V_i}. [I-MATH: restriction distributes over composition on invariant subspaces]

### Step 3: φ is injective

Suppose φ(T) = (id_{V_1}, ..., id_{V_k}). Then T|_{V_i} = id_{V_i} for each i.

Since V = V_1 ⊕ ... ⊕ V_k, every v ∈ V decomposes uniquely as v = v_1 + ... + v_k with v_i ∈ V_i. Then:

```
T(v) = T(v_1 + ... + v_k) = T(v_1) + ... + T(v_k) = v_1 + ... + v_k = v
```

So T = id_V. Therefore ker(φ) = {id}, and φ is injective. [I-MATH: linear map determined by action on direct sum components]

### Step 4: φ is surjective

Given (S_1, ..., S_k) ∈ Aut(B_1) × ... × Aut(B_k), define T: V → V by:

```
T(v) = S_1(v_1) + S_2(v_2) + ... + S_k(v_k)
```

where v = v_1 + ... + v_k is the unique decomposition with v_i ∈ V_i. [DEF_0242]

**T is well-defined**: The decomposition v = v_1 + ... + v_k is unique since V = V_1 ⊕ ... ⊕ V_k. [DEF_0242]

**T is linear**: For v, w ∈ V and scalar α:

```
T(αv + w) = Σ_i S_i(αv_i + w_i) = Σ_i (αS_i(v_i) + S_i(w_i)) = αT(v) + T(w)
```

[I-MATH: linearity of each S_i]

**T ∈ Aut(B)**: For any b ∈ B, we have b ∈ B_j for exactly one j. Then T(b) = S_j(b) ∈ B_j ⊆ B since S_j ∈ Aut(B_j). Therefore T(B) ⊆ B. Since T is a bijection on the finite set B (each S_j is a bijection on B_j, and the B_j are disjoint), T(B) = B. [I-MATH: bijection on finite set]

**T is invertible**: T^{-1} is constructed the same way from (S_1^{-1}, ..., S_k^{-1}). [I-MATH]

Therefore T ∈ Aut(B) and φ(T) = (S_1, ..., S_k).

### Conclusion

φ is a bijective group homomorphism, hence an isomorphism:

```
Aut(B) ≅ Aut(B_1) × Aut(B_2) × ... × Aut(B_k)   □
```

---

## Verification

**Script**: `verification/sympy/adjacency_graph_aut_decomposition_proof.py`
**Status**: PASS (isomorphism verified for concrete basis decompositions)

---

## Citation

This is a special case of the general principle that the automorphism group of a direct product (or direct sum) of structures decomposes as a product when the factors are invariant. In the finite group context, see e.g. Rotman, *An Introduction to the Theory of Groups*, Theorem 7.5 (direct product decomposition). For representations, this is the Schur-type decomposition of the commutant algebra.

---

## Notes

The hypothesis — that each B_i is invariant under Aut(B) — is the key condition. It holds in the framework because the decomposition B = B_1 ⊔ ... ⊔ B_k is determined by the crystal structure (THM_0487, SO(11) breaking chain), which is preserved by all physical automorphisms.

When the invariance condition fails (some T ∈ Aut(B) mixes different B_i), the decomposition does not hold, and Aut(B) is a larger group that permutes the blocks.

---

## History

- Original: Statement with "standard result from group theory" and no proof
- Session 140: Downgraded CANONICAL → SKETCH (no proof or citation)
- Session 196: Full four-step proof via restriction map isomorphism. Promoted SKETCH → CANONICAL.
