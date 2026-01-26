# LEM_0401 Lemma: Edges Non-Empty

**Tag**: 0401
**Type**: LEMMA
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [AXM_0101: Connectivity]
- [LEM_0400: Two elements]

## Provides

- Σ_1 ≠ ∅

---

## Statement

**Lemma U.2**: Σ_1 (the set of 1-simplices/edges) is non-empty.

---

## Proof

By LEM_0400: |P| ≥ 2

By AXM_0101 (Connectivity): The graph (P, Σ_1) is connected.

A connected graph on ≥ 2 vertices must have at least one edge.

Therefore Σ_1 ≠ ∅.

QED

---

## Notes

Ensures the universe has actual structure beyond isolated points.
