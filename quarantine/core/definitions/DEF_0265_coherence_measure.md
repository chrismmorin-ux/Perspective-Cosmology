# DEF_0265 Definition: Coherence Measure

**Tag**: 0265
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/09_trajectory.md

---

## Requires

- [DEF_0213: Access map A]
- [DEF_0225: Adjacency relation ~]
- [DEF_0264: Trajectory]

## Provides

- Coh: Coherence measure for trajectories

---

## Statement

For trajectory τ_traj and adjacent perspectives π₁ ~ π₂:

```
Coh(τ_traj, π₁, π₂) = |A_{π₁}(τ_traj) ∩ A_{π₂}(τ_traj)| / max(|A_{π₁}(τ_traj)|, |A_{π₂}(τ_traj)|)
```

Measures how much of the trajectory's projection overlaps between perspectives.

---

## Notes

High coherence means the trajectory "looks the same" from both perspectives.
