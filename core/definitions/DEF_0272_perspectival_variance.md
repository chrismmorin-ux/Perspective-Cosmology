# DEF_0272 Definition: Perspectival Variance

**Tag**: 0272
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/11_perspective_space.md

---

## Requires

- [DEF_0214: Accessible content U_π]
- [DEF_0271: Measure on Π]

## Provides

- Var(U): Perspectival variance

---

## Statement

```
Var(U) = ⟨d(U_{π₁}, U_{π₂})⟩_{Π×Π}
       = (1/|Π|²) Σ_{π,π'} d(U_π, U_{π'})
```

Measures how much perspectives differ.

**Critical property:**
```
Var(U) = 0 ⟺ crystalline (all perspectives equivalent)
```

---

## Notes

Perspectival variance is the key diagnostic for crystallinity.
