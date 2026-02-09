# DEF_0264 Definition: Trajectory

**Tag**: 0264
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/09_trajectory.md
**Updated**: Session 133 (CR-007: renamed symbol γ → τ_traj to resolve collision with DEF_0230)

---

## Requires

- [DEF_0202: Points P]
- [DEF_0203: Simplicial complex Σ]

## Provides

- τ_traj: Trajectory (world-line in U)

---

## Statement

A **trajectory** is a connected subset of P:

```
τ_traj ⊂ P

such that ∀ x, y ∈ τ_traj : ∃ path in τ_traj via Σ₁
```

Trajectories are "world-lines" embedded in U's structure.

---

## Notes

**Symbol history**: Previously denoted γ, renamed to τ_traj (Session 133) to avoid collision with the overlap parameter γ [DEF_0230]. The subscript "traj" distinguishes from the time scale τ₀ [AXM_0108].
