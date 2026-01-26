# THM_0460 Theorem: Hidden Accumulation

**Tag**: 0460
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/08_time.md

---

## Requires

- [DEF_0261: Cumulative hidden content]
- [AXM_0107: Non-negative loss]

## Provides

- Hidden content is monotonically non-decreasing

---

## Statement

**Theorem T.1 (Hidden Accumulation)**

```
H(T, n) ⊆ H(T, n+1)
```

Hidden content accumulates. Once hidden, structure cannot return to accessibility.

---

## Proof

By definition, H(T, n+1) = H(T, n) ∪ H_{π_{n+1}}

Since union only adds elements: H(T, n) ⊆ H(T, n+1)

QED

---

## Notes

This is the arrow of time expressed mathematically.
