# Notation and Conventions

REQUIRES: none
DEFINES: symbolic conventions
STATUS: CONVENTION

---

## Sets

| Symbol | Meaning |
|--------|---------|
| P | Set of points |
| Σ | Simplicial complex |
| Σ_k | k-simplices |
| V | Value space (vector space) |
| B | Orthonormal basis of V |

## Maps

| Symbol | Signature | Meaning |
|--------|-----------|---------|
| Γ | Σ → [0,1] | Connectivity weights |
| C | P → V | Content assignment |
| A | U → U_π | Access map |
| Π_p | V → V_p | Projection to receptive subspace |
| P_D | V^P → V^P | Propagation operator |

## Perspective

| Symbol | Meaning |
|--------|---------|
| π | A perspective triple (p, D, A) |
| Π | Set of all perspectives |
| p | Anchor point |
| D | Direction set |
| U_π | Accessible content from π |
| H_π | Hidden content from π |

## Parameters

| Symbol | Range | Meaning |
|--------|-------|---------|
| γ | [0,1] | Overlap parameter |
| μ | [0,1] | Normalized overlap |
| n | ℕ | Dimension count |

## Indices

- i, j, k: general indices
- p, q, r: points in P
- σ, τ: simplices in Σ
- b_i: basis vectors in B

## Conventions

1. All vector spaces are finite-dimensional over ℝ or ℂ
2. All sets are finite unless stated otherwise
3. |X| denotes cardinality of set X
4. dim(V) denotes dimension of vector space V
5. ⟨·,·⟩ denotes inner product
6. ||v|| = √⟨v,v⟩ denotes norm
