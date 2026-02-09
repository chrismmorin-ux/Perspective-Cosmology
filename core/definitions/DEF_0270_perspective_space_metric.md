# DEF_0270 Definition: Perspective Space Metric

**Tag**: 0270
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/11_perspective_space.md

---

## Requires

- [DEF_0216: Perspective space Π]

## Provides

- d_Π: Metric on perspective space

---

## Statement

Distance on Π:

```
d_Π(π₁, π₂) = α · d_P(p₁, p₂) + β · d_D(D₁, D₂) + γ · d_A(A₁, A₂)
```

where:
- d_P = distance between anchors (from Γ-structure)
- d_D = angular distance between direction sets
- d_A = difference in access maps
- α, β, γ = weighting parameters

---

## Notes

The metric inherits structure from U through the component distances.
