# LEM_0402 Lemma: Basis Decomposition

**Tag**: 0402
**Type**: LEMMA
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0206: Content map C]
- [DEF_0207: Orthonormal basis B]

## Provides

- Unique decomposition of C(p) in basis B

---

## Statement

**Lemma U.3**: Any C(p) decomposes uniquely in B.

```
C(p) = Σᵢ cᵢ(p) bᵢ  where cᵢ(p) = ⟨C(p), bᵢ⟩
```

---

## Proof

Since B is an orthonormal basis of V:
1. B spans V, so C(p) ∈ V can be written as a linear combination of basis vectors
2. Orthonormality gives the coefficient formula: cᵢ(p) = ⟨C(p), bᵢ⟩
3. Uniqueness follows from linear independence of B

QED

---

## Notes

This is a standard result from linear algebra.
The coefficients cᵢ(p) represent "how much of basis direction bᵢ" exists at point p.
