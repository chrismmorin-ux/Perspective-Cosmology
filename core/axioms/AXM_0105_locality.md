# AXM_0105 Axiom: Locality

**Tag**: 0105
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/02_perspective.md

---

## Requires

- [DEF_0213: Access map A]
- [DEF_0204: Connectivity weights Γ]

## Provides

- Access depends on local path structure

---

## Statement

**A2 (Locality)**

```
A(x) depends only on relation of x to p via Γ-weighted paths
```

What a perspective can access about x is determined by how x
connects to the anchor point through the connectivity structure.

---

## Formal Elaboration (Session 182)

The statement "A(x) depends only on relation of x to p via Γ-weighted paths" means:

```
For perspective π = (p, D, A):

A(x) = f(Γ-paths(p, x))

where Γ-paths(p, x) = {all paths from p to x weighted by Γ}
```

Equivalently, if two points x, y have identical Γ-weighted path structures relative to p:

```
Γ-paths(p, x) = Γ-paths(p, y) ⟹ A(x) = A(y)
```

**Propagation interpretation**: Access at x is determined by summing over all paths from p to x, weighted by the connectivity Γ at each step. This is analogous to a propagator in the graph-theoretic sense:

```
A(x) = Σ_{paths p→x} Π_{edges (i,j) ∈ path} Γ(i,j) · [local contribution]
```

The precise form of the propagator is not specified by this axiom — only that access is mediated by the Γ-weighted path structure (locality) rather than depending on global properties of U.

---

## Assumption Classification (Session 182 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| Path-dependence of A | [A-AXIOM] | Core locality postulate |
| Γ-weighted paths | [A-AXIOM] | Uses connectivity structure from DEF_0204 |
| Propagator form | NOT SPECIFIED | Axiom constrains what A depends on, not how |

**Honest assessment**: This axiom is well-motivated (locality is fundamental) but underdetermined — it says A depends on local paths but doesn't specify the functional form. The propagator interpretation above is one natural formalization. A stronger version would specify the propagation kernel explicitly, but that may be unnecessary at Layer 0 since the axiom's role is to EXCLUDE non-local dependence.

---

## Notes

This axiom ensures access is a local, path-dependent operation.
Information must propagate through the simplicial structure.
