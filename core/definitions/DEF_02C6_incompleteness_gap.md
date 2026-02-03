# DEF_02C6 Definition: Incompleteness Gap

**Tag**: 02C6
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: framework/layer_0_pure_axioms.md (v2.4)
**Added**: Session 188 (formalization of Godel/self-inaccessibility connection)

---

## Requires

- [DEF_0210: Perspective pi]
- [AXM_0104: Partiality (P1)]
- [AXM_0102: Non-Triviality (P2)]
- [AXM_0109: Crystal Existence (C1)]

## Provides

- Formal definition of the subspace invisible to a perspective
- Clean orthogonal decomposition V_Crystal = V_pi + G_pi
- Foundation for THM_0410, THM_04A7, THM_04A9

---

## Statement

Given a perspective pi (an orthogonal projection on V_Crystal), the **incompleteness gap** is:

```
G_pi := ker(pi) = V_pi^perp = {v in V_Crystal : pi(v) = 0}
```

This is the subspace of V_Crystal that is entirely invisible to perspective pi.

### Key Properties

**(i) Non-trivial gap**: G_pi != {0}.

```
Proof: By AXM_0104 (Partiality), V_pi = im(pi) is a PROPER subspace of V_Crystal.
Therefore V_pi^perp != {0}.  [I-MATH: orthogonal complement of proper subspace]
```

**(ii) Orthogonal decomposition**: V_Crystal = V_pi + G_pi (direct sum).

```
Proof: Standard for orthogonal projections.
For any v in V_Crystal: v = pi(v) + (v - pi(v)).
pi(v) in V_pi, and (v - pi(v)) in ker(pi) = G_pi.
The sum is direct because V_pi intersect G_pi = {0}.  [I-MATH]
```

**(iii) Dimensional accounting**:

```
dim(G_pi) = dim(V_Crystal) - dim(V_pi) > 0
```

By AXM_0104, dim(V_pi) < dim(V_Crystal), so dim(G_pi) >= 1.
By AXM_0102 (Non-Triviality), dim(V_pi) >= 1, so dim(G_pi) <= dim(V_Crystal) - 1.

Combined: 1 <= dim(G_pi) <= dim(V_Crystal) - 1.

---

## Interpretation

The incompleteness gap is the precise mathematical object capturing the idea that every perspective has blind spots. It is:

- **Well-defined**: G_pi is a specific subspace, not a vague notion
- **Non-empty**: Guaranteed by the Partiality axiom
- **Complementary**: What one perspective misses, another may see
- **Non-paradoxical**: The decomposition V_Crystal = V_pi + G_pi is clean — no Russell-type paradox arises because pi is an operator ON V_Crystal, not an element OF V_pi

---

## Layer

**Layer 0** (pure perspective) — uses only the projection formulation, no physics.

---

## Dependencies

- **Uses**: DEF_0210, AXM_0104, AXM_0102, AXM_0109
- **Used by**: THM_0410 (Self-Inaccessibility), THM_04A7 (Self-Model Incompleteness), THM_04A9 (Non-Paradoxical Gap)

---

## Assumption Classification

| Component | Classification | Notes |
|-----------|---------------|-------|
| G_pi = ker(pi) | [D] | Standard definition for projection operators |
| G_pi != {0} | [D] from AXM_0104 | Partiality ensures proper subspace |
| Direct sum decomposition | [I-MATH] | Orthogonal decomposition theorem |
| dim(G_pi) > 0 | [D] | From dim(V_pi) < dim(V_Crystal) |

---

## Cross-References

- [DEF_02C5: Self-Model]
- [THM_0410: Self-Inaccessibility]
- [THM_04A7: Self-Model Incompleteness]
- [THM_04A9: Non-Paradoxical Gap]
- [AXM_0113: Finite Access]
