# DEF_0227 Definition: Information Loss

**Tag**: 0227
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0214: Accessible content U_π]
- [DEF_0225: Adjacency relation ~]

## Provides

- ΔI: Information loss in transition

---

## Statement

**Information loss** in transition π₁ → π₂:

```
ΔI(π₁ → π₂) = dim(U_{π₁}) - dim(U_{π₁} ∩ U_{π₂})
```

Measures how much of π₁'s accessible content becomes inaccessible.

---

## Notes

Information loss is always non-negative when transitions are valid (AXM_0107).
