# IMP_0607 Import: Weinberg Angle at GUT Scale

**Tag**: 0607
**Type**: IMPORT
**Status**: ACTIVE
**Source**: framework/layer_2_correspondence.md

---

## Requires

- [IMP_0602: Color charge n_color]
- [IMP_0603: Weak isospin n_weak]

## Provides

- sin²θ_W(GUT) = 3/8

---

## Statement

**I-STRUCT-2**: The Weinberg angle at GUT scale is 3/8.

**Running:**
```
sin²θ_W(M_GUT) = 3/8 = 0.375
sin²θ_W(M_Z) ≈ 0.231 (after RG running)
```

---

## Justification

- GUT theories (SU(5), SO(10)) predict this
- Hypercharge normalization in SU(5): Y = √(3/5) × Y_SM
- Running to low energy gives ~0.23

---

## Classification

**TESTABLE** — could potentially derive from dimension counting.

---

## Notes

Possible perspective derivation:
sin²θ_W = f(n_weak, n_color, n_EM)?

A formula like n_weak²/(n_weak² + n_color²) = 4/13 ≈ 0.31 doesn't match.
The correct derivation is unknown.
