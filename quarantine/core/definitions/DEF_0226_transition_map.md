# DEF_0226 Definition: Transition Map

**Tag**: 0226
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/04_adjacency.md
**Updated**: Session 133 (CR-004: clarified preimage notation)

---

## Requires

- [DEF_0213: Access map A]
- [DEF_0225: Adjacency relation ~]
- [AXM_0106: Non-Invertibility] — A is not invertible; preimage selection required

## Provides

- T_{12}: Transition map between perspectives

---

## Statement

For adjacent π₁ ~ π₂:

**T_{12}: U_{π₁} → U_{π₂}**

```
T_{12}(x) = A_{π₂}(σ_{π₁}(x))

where σ_{π₁}: U_{π₁} → U is a preimage selector:
  σ_{π₁}(x) ∈ A_{π₁}⁻¹({x}) = { u ∈ U : A_{π₁}(u) = x }
```

**Note on notation**: The preimage set `A_{π₁}⁻¹({x})` denotes the set-theoretic preimage (the fiber over x), **not** a function inverse. By [AXM_0106], A_{π₁} is non-invertible, so the preimage set generally has |A_{π₁}⁻¹({x})| > 1. The selector σ_{π₁} chooses one element from this set.

---

## Notes

The transition map is how information transforms between perspectives.

**Non-determinism**: The choice of preimage selector σ_{π₁} introduces non-determinism. Different selections yield different transition maps, all equally valid. This is a feature, not a bug — it reflects the fundamental information loss inherent in perspective [AXM_0106].

**Well-definedness**: Despite the non-determinism in σ, the *existence* of valid transitions between adjacent perspectives is guaranteed. The set of valid transitions forms the transition algebra 𝒯 [THM_0484].
