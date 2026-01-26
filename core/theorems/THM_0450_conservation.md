# THM_0450 Theorem: Information Conservation

**Tag**: 0450
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/07_information.md

---

## Requires

- [DEF_0250: Information content I_π]
- [DEF_0251: Entropy S_π]
- [DEF_0201: Universe tuple U]

## Provides

- I_π + S_π = constant

---

## Statement

**Theorem I.1 (Conservation)**

```
I_π + S_π = I_total = log₂|U|
```

Accessible + hidden = total (constant).

---

## Proof

By definition:
- U_π ∪ H_π = U (partition of U)
- U_π ∩ H_π = ∅ (disjoint)

Therefore:
|U_π| + |H_π| = |U|

Taking logs:
I_π + S_π ≤ log₂|U| (by subadditivity)
Equality holds for disjoint union.

QED
