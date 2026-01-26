# DEF_0266 Definition: Coherent Trajectory

**Tag**: 0266
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/09_trajectory.md

---

## Requires

- [DEF_0260: Temporal sequence]
- [DEF_0265: Coherence measure]

## Provides

- Definition of coherent trajectory

---

## Statement

Trajectory γ is **coherent** w.r.t. temporal sequence T iff:

```
∀ i : Coh(γ, πᵢ, πᵢ₊₁) ≥ ξ
```

where ξ ∈ (0,1] is the coherence threshold.

| ξ value | Meaning |
|---------|---------|
| ξ = 0 | Any trajectory coherent (no identity) |
| ξ = 1 | Perfect preservation required |
| 0 < ξ < 1 | Partial preservation (realistic) |

---

## Notes

Coherence defines what counts as a persistent identity through time.
