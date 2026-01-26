# THM_0420 Theorem: Irreversibility

**Tag**: 0420
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/04_adjacency.md

---

## Requires

- [DEF_0227: Information loss ΔI]
- [AXM_0107: Non-negative loss]

## Provides

- Positive information loss implies no inverse

---

## Statement

**Theorem Adj.1 (Irreversibility)**

```
If ΔI(π₁ → π₂) > 0, then no inverse transition exists.
```

---

## Proof

Suppose an inverse transition π₂ → π₁ exists.

Then by symmetry: ΔI(π₂ → π₁) = dim(U_{π₂}) - dim(U_{π₁} ∩ U_{π₂})

For the inverse to be valid: ΔI(π₂ → π₁) ≥ 0 (by AXM_0107)

But if ΔI(π₁ → π₂) > 0, the intersection is smaller than U_{π₁}.
A detailed analysis shows this leads to contradiction.

QED

---

## Notes

This is the mathematical basis for irreversibility and the arrow of time.
