# AXM_0106 Axiom: Non-Invertibility of Access Map

**Tag**: 0106
**Type**: AXIOM
**Status**: CANONICAL
**Source**: core/02_perspective.md
**Clarified**: Session 72

---

## Requires

- [DEF_0213: Access map A]

## Provides

- Access map A is not injective (information loss)

---

## Statement

**A3 (Non-Invertibility of Access Map)**

```
The ACCESS MAP A is not injective: ∃ x ≠ y with A(x) = A(y)
```

Different global states can appear the same from a perspective.

---

## IMPORTANT CLARIFICATION (Session 72)

This axiom is about the **ACCESS MAP** (A: global state → appearance), NOT about **TRANSITIONS** (T: perspective → perspective).

| Concept | Invertible? | Why |
|---------|-------------|-----|
| Access map A | NO | Information loss when viewing |
| Transitions T | YES | By AXM_0115 (T0) |

These are DIFFERENT concepts that are BOTH true:
- A is many-to-one (multiple states → same appearance)
- T is invertible (can go from π₁ to π₂ and back)

See [THM_0483: Transition Invertibility] for the distinct concept.

---

## Notes

This axiom says information is lost in access.
Multiple underlying realities can produce the same appearance.
This is related to holographic principles and measurement limits.

---

## Cross-References

- [THM_0411: Non-Invertibility of Access] — confirms A_π is not invertible
- [AXM_0115: Algebraic Completeness (T0)] — transitions ARE invertible (different concept)
- [THM_0483: Transition Invertibility] — transitions have inverses
