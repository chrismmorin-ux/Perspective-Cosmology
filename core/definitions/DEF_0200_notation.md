# DEF_0200 Definition: Notation Conventions

**Tag**: 0200
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/00_notation.md

---

## Requires

- [none]

## Provides

- Standard symbolic conventions for the framework
- Set notation: P, Σ, Σ_k, V, B
- Map notation: Γ, C, A, Π_p, P_D
- Parameter notation: γ, μ, n
- Index conventions: i,j,k (general), p,q,r (points), σ,τ (simplices), b_i (basis)

---

## Statement

### Sets

| Symbol | Meaning |
|--------|---------|
| P | Set of points |
| Σ | Simplicial complex |
| Σ_k | k-simplices |
| V | Value space (vector space) |
| B | Orthonormal basis of V |

### Maps

| Symbol | Signature | Meaning |
|--------|-----------|---------|
| Γ | Σ → [0,1] | Connectivity weights |
| C | P → V | Content assignment |
| A | U → U_π | Access map |
| Π_p | V → V_p | Projection to receptive subspace |
| P_D | V^P → V^P | Propagation operator |

### Perspective

| Symbol | Meaning |
|--------|---------|
| π | A perspective triple (p, D, A) |
| Π | Set of all perspectives |
| p | Anchor point |
| D | Direction set |
| U_π | Accessible content from π |
| H_π | Hidden content from π |

### Parameters

| Symbol | Range | Meaning |
|--------|-------|---------|
| γ | [0,1] | Overlap parameter |
| μ | [0,1] | Normalized overlap |
| n | N | Dimension count |

### Conventions

1. All vector spaces are finite-dimensional over R or C
2. All sets are finite unless stated otherwise
3. |X| denotes cardinality of set X
4. dim(V) denotes dimension of vector space V
5. ⟨·,·⟩ denotes inner product
6. ||v|| = sqrt(⟨v,v⟩) denotes norm

---

## Notes

This file establishes symbolic conventions used throughout the framework.
No mathematical claims are made here.
