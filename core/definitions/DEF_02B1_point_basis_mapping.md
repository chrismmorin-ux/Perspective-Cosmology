# DEF_02B1 Definition: Point-Basis Mapping

**Tag**: 02B1
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/axiom_unification.md
**Added**: Session 132 (axiom unification)

---

## Requires

- [DEF_02B0: Universe-Crystal Correspondence]
- [DEF_0202: Points P]
- [DEF_0207: Orthonormal Basis]

## Provides

- Explicit bijection between points and basis vectors
- Content map as basis assignment

---

## Statement

**Point-Basis Mapping**

```
φ: P → B_Crystal
φ(p) = b_p

where:
- P = {1, 2, ..., n_c} is the set of points (|P| = n_c = 11)
- B_Crystal = {b_1, b_2, ..., b_{n_c}} is the orthonormal basis
- φ is a bijection (one-to-one correspondence)
```

---

## Properties

### Bijection
```
φ is bijective: |P| = |B_Crystal| = n_c = 11
```

### Content Identification
```
C(p) := φ(p) = b_p

The content of point p IS the basis vector b_p.
```

### Index Preservation
```
φ(i) = b_i for i = 1, ..., n_c

Points are naturally indexed by their basis vector index.
```

---

## Notes

> **Layer 0 purity note (Session 140 audit)**: Physical role assignments (Im(C)→1, Im(H)→3, Im(O)→7 direction interpretation) moved to Layer 2. The algebraic decomposition n_c = 1+3+7 = 11 is derived in THM_0484 (division algebra structure). See `framework/layer_2_correspondence.md` for physical correspondence.

This definition makes explicit what was implicit:
- "Points" are not physical locations in space
- "Points" are fundamental algebraic directions
- The universe's structure IS the crystal's structure

---

## Cross-References

- [DEF_02B0: Universe-Crystal Correspondence]
- [DEF_02B2: Simplex-Subspace Mapping]
- [verification/sympy/nc_11_rigorous_derivation.py]
