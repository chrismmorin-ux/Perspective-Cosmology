# THM_0452 Theorem: Information Bounds

**Tag**: 0452
**Type**: THEOREM
**Status**: CANONICAL
**Source**: core/07_information.md

---

## Requires

- [DEF_0250: Information content I_π]
- [DEF_0251: Entropy S_π]

## Provides

- Bounds on I_π and S_π

---

## Statement

**Theorem I.3 (Bounds)**

```
0 ≤ I_π ≤ I_total
0 ≤ S_π ≤ I_total
```

---

## Proof

Since |U_π| ≥ 1 (non-empty) and |U_π| ≤ |U|:
0 ≤ log₂|U_π| ≤ log₂|U|

Similarly for |H_π|.

QED
