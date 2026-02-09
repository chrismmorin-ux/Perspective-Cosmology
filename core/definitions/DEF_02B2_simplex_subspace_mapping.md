# DEF_02B2 Definition: Simplex-Subspace Mapping

**Tag**: 02B2
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/investigations/axiom_unification.md
**Added**: Session 132 (axiom unification)

---

## Requires

- [DEF_02B0: Universe-Crystal Correspondence]
- [DEF_02B1: Point-Basis Mapping]
- [DEF_0203: Simplicial Complex Σ]

## Provides

- Correspondence between simplices and subspaces
- Geometric interpretation of combinatorial structure

---

## Statement

**Simplex-Subspace Mapping**

```
ψ: Σ → Sub(V_Crystal)
ψ(σ) = span{b_i : i ∈ σ}

where:
- Σ is the simplicial complex on P
- Sub(V_Crystal) is the set of subspaces of V_Crystal
- σ = {i_1, ..., i_k} is a (k-1)-simplex
- ψ(σ) is the k-dimensional subspace spanned by {b_{i_1}, ..., b_{i_k}}
```

---

## Properties

### Dimension Preservation
```
dim(ψ(σ)) = |σ|

A (k-1)-simplex maps to a k-dimensional subspace.
```

### Face Correspondence
```
τ ⊂ σ ⟹ ψ(τ) ⊂ ψ(σ)

Faces of a simplex correspond to subspaces of the subspace.
```

### Intersection Correspondence
```
ψ(σ ∩ τ) = ψ(σ) ∩ ψ(τ)

Simplex intersection corresponds to subspace intersection.
```

### Orthogonality from Disjointness
```
σ ∩ τ = ∅ ⟹ ψ(σ) ⟂ ψ(τ)

Disjoint simplices span orthogonal subspaces.
```

---

## Examples

| Simplex | Dimension | Subspace |
|---------|-----------|----------|
| {1} | 0-simplex (vertex) | span{b_1} = 1D line |
| {1, 2} | 1-simplex (edge) | span{b_1, b_2} = 2D plane |
| {1, 2, 3} | 2-simplex (triangle) | span{b_1, b_2, b_3} = 3D space |
| {1, ..., 4} | 3-simplex (tetrahedron) | span{b_1, ..., b_4} = 4D (spacetime!) |

---

## Connection to Adjacency

Two points p, q are **adjacent** (connected by an edge) iff:
```
{p, q} ∈ Σ₁  ⟺  ∃ π : b_p, b_q ∈ V_π with ε_pq ≠ 0
```

Adjacency means: some perspective sees both directions as non-orthogonal (tilted).

---

## Connection to Tilt

The tilt matrix ε encodes which simplices are "active" under a perspective:
```
σ ∈ Σ is "seen" by π  ⟺  ψ(σ) ⊂ V_π  ⟺  ε_ij defined for all i,j ∈ σ
```

---

## Physical Interpretation

The simplicial complex Σ encodes which subspaces are **accessible together**:
- Vertices: Individual crystal directions
- Edges: Pairs of directions that can be co-accessed
- Higher simplices: Multi-dimensional accessible subspaces

The maximum simplex dimension corresponds to the perspective dimension dim(V_π).

---

## Notes

This mapping shows that:
1. Combinatorial structure (Σ) encodes geometric structure (subspaces)
2. The simplicial complex is determined by perspective accessibility
3. Tilt creates the "edges" — without tilt, all directions are independent (no edges)

---

## Cross-References

- [DEF_02B0: Universe-Crystal Correspondence]
- [DEF_02B1: Point-Basis Mapping]
- [DEF_02A3: Tilt Matrix]
- [AXM_0114: Tilt Possibility]
