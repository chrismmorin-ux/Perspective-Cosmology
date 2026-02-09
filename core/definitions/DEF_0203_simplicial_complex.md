# DEF_0203 Definition: Simplicial Complex

**Tag**: 0203
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/01_universe.md

---

## Requires

- [DEF_0200: Notation conventions]
- [DEF_0202: Points P]

## Provides

- Σ: Simplicial complex structure
- Σ_k: k-simplices

---

## Statement

**Σ** (Simplicial Complex)

```
Σ_0 = P                                    (0-simplices are points)
Σ_k = {σ ⊂ P : |σ| = k+1, all faces in Σ}  (k-simplices)
Σ = ∪_k Σ_k                                (full complex)
```

A k-simplex is a subset of k+1 points whose proper subsets (faces) are all in Σ.

---

## Notes

Closure under face-taking is enforced by axiom AXM_0103.
The 1-simplices Σ_1 form the edge set, making (P, Σ_1) a graph.
