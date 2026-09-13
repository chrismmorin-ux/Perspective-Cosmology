# DEF_0220 Definition: D-Compatible Edges

**Tag**: 0220
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/03_propagation.md

---

## Requires

- [DEF_0202: Points P]
- [DEF_0203: Simplicial complex Σ]
- [DEF_0212: Direction set D]

## Provides

- E_D(x): Set of D-compatible neighbors

---

## Statement

### Direction Function

For an edge {x, y} ∈ Σ₁ traversed from x:

```
direction(x→y) := y
```

That is, `direction(x→y)` denotes the neighbor reached by traversing edge {x, y} from x. Consequently, `direction(x→y) ∈ D` is equivalent to `y ∈ D`.

### D-Compatible Edges

Given direction set D at point x:

```
E_D(x) = { y ∈ P : {x,y} ∈ Σ_1 and direction(x→y) ∈ D }
       = { y ∈ P : {x,y} ∈ Σ_1 and y ∈ D }
```

The neighbors of x reachable along directions in D.

---

## Notes

This filters the simplicial neighbors by direction compatibility.
Used in defining the propagation operator.

The `direction()` function is trivial (it returns the endpoint) but is retained for readability in the propagation chain DEF_0221–DEF_0224, where "direction-compatible" is more intuitive than raw set membership.
