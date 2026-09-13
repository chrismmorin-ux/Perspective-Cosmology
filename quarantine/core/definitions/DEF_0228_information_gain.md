# DEF_0228 Definition: Information Gain

**Tag**: 0228
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0214: Accessible content U_π]
- [DEF_0225: Adjacency relation ~]

## Provides

- ΔI': Information gain in transition

---

## Statement

**Information gain** in transition π₁ → π₂:

```
ΔI'(π₁ → π₂) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂})
```

Measures how much new content π₂ accesses that π₁ didn't.

---

## Notes

Information gain and loss together characterize the full change in access.
