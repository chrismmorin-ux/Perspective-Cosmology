# THM_0461 Theorem: No Loops

**Tag**: 0461
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/08_time.md

---

## Requires

- [AXM_0100: Finiteness]
- [DEF_0260: Temporal sequence]
- [THM_0460: Hidden accumulation]

## Provides

- Temporal sequences cannot loop

---

## Statement

**Theorem T.2 (No Loops)**

```
In finite U with finite B, temporal sequences cannot loop.
```

---

## Proof

1. Valid adjacency requires |H_{π₂}| ≥ |H_{π₁}| (from AXM_0107)
2. To loop πₙ → π₀ requires |H_{π₀}| ≥ |H_{πₙ}| ≥ ... ≥ |H_{π₀}|
3. This forces |H_{πᵢ}| = |H_{πⱼ}| for all i, j
4. No information loss ⟹ no distinction between perspectives
5. A chain with no distinction is a point, not a sequence

QED

---

## Notes

**Corollary T.3**: Entropy cannot cycle. It flows in one direction.
