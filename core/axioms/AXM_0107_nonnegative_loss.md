# AXM_0107 Axiom: Non-Negative Loss

**Tag**: 0107
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0225: Adjacency relation ~]
- [DEF_0227: Information loss ΔI]

## Provides

- Valid transitions have non-negative information loss

---

## Statement

**Axiom Adj.1 (Non-Negative Loss)**

```
Valid adjacency π₁ ~ π₂ requires ΔI(π₁ → π₂) ≥ 0
```

This defines a direction on adjacency: "time" flows toward non-decreasing hidden content.

---

## Notes

This axiom is the source of time's arrow in the framework.
It ensures transitions cannot spontaneously decrease hidden content.
