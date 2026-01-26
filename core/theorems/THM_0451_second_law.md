# THM_0451 Theorem: Second Law

**Tag**: 0451
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/07_information.md

---

## Requires

- [DEF_0227: Information loss ΔI]
- [AXM_0107: Non-negative loss]

## Provides

- Entropy increases along valid transitions

---

## Statement

**Theorem I.2 (Second Law)**

```
Valid transitions satisfy ΔI ≥ 0.
Equivalently: S increases or stays constant.
```

---

## Proof

From AXM_0107 (Non-Negative Loss):
ΔI(π₁ → π₂) ≥ 0

By THM_0450 (Conservation):
I_π + S_π = constant

If I decreases (ΔI > 0), then S must increase.

QED

---

## Notes

This is the perspective framework's version of the second law of thermodynamics.
