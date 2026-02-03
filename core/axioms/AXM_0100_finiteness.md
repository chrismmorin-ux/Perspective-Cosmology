# AXM_0100 Axiom: Finiteness

**Tag**: 0100
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0205: Value space V]

## Provides

- Finiteness constraint on universe

---

## Statement

**U1 (Finiteness)**

```
|P| < ∞  and  dim(V) < ∞
```

The set of points is finite, and the value space is finite-dimensional.

---

## Notes

This axiom ensures all quantities in the framework are computable.
It rules out continuous limits at the foundational level.

---

## Unification Note (Session 132)

**⚠ AXIOM STATUS QUESTION (Session 140 audit):** If finiteness follows from crystal structure, this should be a theorem (THM), not an axiom (AXM). Either: (a) remove derivation claim and keep as independent axiom, or (b) reclassify as theorem. This affects the logical foundation — see audit Issue 1.5.

Via [DEF_02B0: Universe-Crystal Correspondence]:
```
|P| = dim(V_Crystal) = n_c = 11
```

The finiteness of P (11 points) equals the finiteness of the crystal (11 dimensions).
See [DEF_02B1: Point-Basis Mapping] for the explicit bijection P ↔ B_Crystal.

---

## Assumption Classification (Session 182 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| \|P\| < ∞ | [A-AXIOM] | Independent Layer 0 assumption |
| dim(V) < ∞ | [A-AXIOM] | Independent Layer 0 assumption |
| \|P\| = n_c = 11 | [D] from DEF_02B0 + THM_0484 | Layer 1 consequence, not part of this axiom |

**Resolution of S140 audit question**: AXM_0100 remains an AXIOM (not a theorem) because:

1. **Layer independence**: AXM_0100 is Layer 0. The value n_c = 11 comes from the division algebra chain (THM_0484, Layer 1), which depends on AXM_0109, AXM_0113, AXM_0115, and AXM_0119. AXM_0100 is logically prior — it asserts finiteness BEFORE any specific dimension is derived.

2. **Logical role**: Without AXM_0100, the crystal could in principle be infinite-dimensional. AXM_0113 (finite access) constrains the access map, not dim(V_Crystal) directly. The bridge requires BOTH AXM_0100 (finiteness) and the division algebra chain (which dimensions are allowed).

3. **What AXM_0100 provides that Layer 1 doesn't**: Even if the division algebra chain fixes n_c = 11, AXM_0100 independently asserts |P| < ∞. The universe has finitely many points as a foundational postulate, not as a consequence of algebraic structure.

**Verdict**: Keep as [A-AXIOM]. The Unification Note (Session 132) shows that AXM_0100 is CONSISTENT with the division algebra chain, not DERIVED from it.

---

## Cross-References

- [DEF_02B0: Universe-Crystal Correspondence]
- [AXM_0109: Crystal Existence]
