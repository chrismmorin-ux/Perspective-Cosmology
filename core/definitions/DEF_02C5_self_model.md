# DEF_02C5 Definition: Self-Model of a Perspective

**Tag**: 02C5
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/layer_0_pure_axioms.md (v2.4)
**Added**: Session 188 (formalization of Godel/self-inaccessibility connection)

---

## Requires

- [DEF_0210: Perspective pi]
- [AXM_0104: Partiality (P1)]
- [AXM_0113: Finite Access (P3)]

## Provides

- Formal definition of how a perspective models itself
- Foundation for THM_04A7 (Self-Model Incompleteness)

---

## Statement

Given a perspective pi (an orthogonal projection operator on V_Crystal), the **self-model** is:

```
M_pi := pi|_{V_pi} : V_pi -> V_pi
```

where V_pi = im(pi) is the accessible subspace.

### Explicit Form

Since pi is an orthogonal projection with im(pi) = V_pi:

```
For any v in V_pi:  pi(v) = v     (pi acts as identity on its image)

Therefore:          M_pi = id|_{V_pi}  (the identity map on V_pi)
```

### Interpretation

The self-model captures what perspective pi "knows about itself" using only information available within its accessible subspace V_pi. Because pi acts as the identity on V_pi, the self-model is trivially the identity — it sees the accessible part as-is but has no representation of what it cannot access.

---

## Properties

**(i)** M_pi is well-defined: pi maps V_pi to V_pi (since pi^2 = pi implies pi(V_pi) = V_pi).

**(ii)** M_pi = id|_{V_pi}: For any v in V_pi, pi(v) = v (projection is identity on its image).

**(iii)** M_pi is trivially linear and bounded.

**(iv)** M_pi captures pi's action on V_pi but has no representation of pi's action on ker(pi) = V_pi^perp.

---

## Layer

**Layer 0** (pure perspective) — uses only the projection formulation, no physics.

---

## Dependencies

- **Uses**: DEF_0210 (perspective), AXM_0104 (partiality ensures V_pi proper subspace)
- **Used by**: THM_04A7 (Self-Model Incompleteness), DEF_02C6 (Incompleteness Gap)

---

## Assumption Classification

| Component | Classification | Notes |
|-----------|---------------|-------|
| pi is orthogonal projection | [A-AXIOM] | From DEF_0210 (projection formulation) |
| V_pi = im(pi) | [D] | Standard linear algebra |
| M_pi = id on V_pi | [D] | Follows from pi^2 = pi |

---

## Cross-References

- [AXM_0109: Crystal Existence (C1)]
- [DEF_02C6: Incompleteness Gap]
- [THM_0410: Self-Inaccessibility]
- [THM_04A7: Self-Model Incompleteness]
