# AXM_0101 Axiom: Connectivity

**Tag**: 0101
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0203: Simplicial complex Σ]

## Provides

- Graph connectivity of universe

---

## Statement

**U2 (Connectivity)**

```
The graph (P, Σ_1) is connected
```

Any two points can be reached via a path of 1-simplices (edges).

---

## Notes

This ensures the universe is a single connected component.
Combined with finiteness, any point is reachable in finitely many steps.

---

## Unification Note (Session 132)

**⚠ AXIOM STATUS QUESTION (Session 140 audit):** If connectivity follows from AXM_0114 + AXM_0104 + AXM_0113, this should be a theorem (THM), not an axiom (AXM). Either: (a) remove derivation claim and keep as independent axiom, or (b) reclassify as theorem. This affects the logical foundation — see audit Issue 1.5.

Under [DEF_02B2: Simplex-Subspace Mapping], connectivity follows from:

1. Tilt Possibility (AXM_0114): Some perspectives have ε_ij ≠ 0
2. Partiality (AXM_0104): Every perspective accesses multiple directions
3. Finite Access (AXM_0113): 0 < dim(V_π) < n_c

Therefore: Overlapping accessible subspaces create a connected graph on P.

The edges Σ₁ correspond to pairs of basis vectors that can be co-accessed with non-zero tilt.

---

## Assumption Classification (Session 189 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| (P, Σ₁) is connected | [A-AXIOM] | Independent Layer 0 assumption |

**Resolution of S140 audit question**: AXM_0101 remains an AXIOM (not a theorem) because:

1. **Layer independence**: AXM_0101 is Layer 0. The derivation sketch in the Unification Note uses AXM_0114 (Tilt Possibility), AXM_0104 (Partiality), and AXM_0113 (Finite Access) — all Layer 0/1 axioms that are logically *subsequent* in the numbering and conceptually independent. AXM_0101 asserts connectivity BEFORE crystal structure is introduced.

2. **Consistency, not derivability**: The Unification Note (Session 132) shows that connectivity is CONSISTENT with the crystal axioms via DEF_02B2, not DERIVED from them. The crystal axioms assume an already-connected universe when they introduce V_Crystal.

3. **What AXM_0101 provides that later axioms don't**: Without AXM_0101, one could have a finite simplicial complex (AXM_0100) with multiple disconnected components. The crystal axioms constrain the inner product structure but do not prevent disconnected components at the graph level.

**Verdict**: Keep as [A-AXIOM]. The Unification Note shows consistency with the crystal framework, not derivation from it. This parallels AXM_0100's resolution (Session 182).

---

## Cross-References

- [DEF_02B2: Simplex-Subspace Mapping]
- [AXM_0114: Tilt Possibility]
- [AXM_0100: Finiteness] — parallel resolution of same S140 audit question
