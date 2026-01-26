# DEF_0252 Definition: Mutual Information

**Tag**: 0252
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/07_information.md

---

## Requires

- [DEF_0250: Information content I_π]
- [DEF_0214: Accessible content U_π]

## Provides

- I(π₁ : π₂): Mutual information between perspectives

---

## Statement

For perspectives π₁, π₂:

```
I(π₁ : π₂) = I_{π₁} + I_{π₂} - I_{π₁ ∪ π₂}
           = log₂|U_{π₁}| + log₂|U_{π₂}| - log₂|U_{π₁} ∪ U_{π₂}|
```

Measures shared information.

---

## Notes

High γ ⟺ high mutual information (perspectives share access)
Low γ ⟺ low mutual information (perspectives independent)
