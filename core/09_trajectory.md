# [09] Trajectories and Coherence

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines object identity through coherence
**Dependencies**: 00_notation, 01_universe, 02_perspective, 08_time
**Verified**: N/A (definitions)

---

REQUIRES: 00_notation, 01_universe, 02_perspective, 08_time
DEFINES: trajectory γ, coherence Coh, object O
CONTENT-TYPE: DEFINITION

## Connections

**Forward** (modules that use this):
- 16_eddies (life as coherent eddy)

**Backward** (modules this uses):
- 00_notation, 01_universe, 02_perspective, 08_time

---

## Trajectory

A **trajectory** is a connected subset of P:

```
γ ⊂ P

such that ∀ x, y ∈ γ : ∃ path in γ via Σ₁
```

Trajectories are "world-lines" embedded in U's structure.

---

## Coherence Measure

For trajectory γ and adjacent perspectives π₁ ~ π₂:

```
Coh(γ, π₁, π₂) = |A_{π₁}(γ) ∩ A_{π₂}(γ)| / max(|A_{π₁}(γ)|, |A_{π₂}(γ)|)
```

Measures how much of the trajectory's projection overlaps between perspectives.

---

## Coherent Trajectory

Trajectory γ is **coherent** w.r.t. temporal sequence T iff:

```
∀ i : Coh(γ, πᵢ, πᵢ₊₁) ≥ ξ
```

where ξ ∈ (0,1] is the coherence threshold.

---

## Coherence Regimes

| ξ value | Meaning |
|---------|---------|
| ξ = 0 | Any trajectory coherent (no identity) |
| ξ = 1 | Perfect preservation required |
| 0 < ξ < 1 | Partial preservation (realistic) |

---

## Types of Coherence Failure

**Gradual Decay**
```
Coh decreases slowly along T.
Object "ages" — identity degrades.
```

**Sudden Break**
```
Coh drops below ξ abruptly.
Object "dies" — identity discontinuity.
```

**Split (Fission)**
```
γ → γ₁, γ₂ where each γᵢ is coherent but γ is not.
One object becomes two.
```

**Merge (Fusion)**
```
γ₁, γ₂ → γ where γ is coherent but each γᵢ is not.
Two objects become one.
```

---

## Object

An **object** O is an equivalence class of trajectory-slices:

```
O = { A_π(γ ∩ U_π) | π ∈ T, Coh(γ, πᵢ, πᵢ₊₁) ≥ ξ ∀ i }
```

Objects don't move through time. Perspectives move through Π; coherent trajectories appear as persistent objects.

---

## Object Properties

For object O with trajectory γ:

```
Location:   Loc_π(O) = γ ∩ U_π
Content:    Con_π(O) = A_π(C|_γ)
Extent:     Ext_π(O) = |γ ∩ U_π|
Persistence: Per_T(O) = |{i : Coh ≥ ξ}| / |T|
```
