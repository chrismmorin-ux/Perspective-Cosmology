# [05] Overlap Parameter

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines key parameter γ (Jaccard index)
**Dependencies**: 00_notation, 02_perspective, 04_adjacency
**Verified**: N/A (definitions)

---

REQUIRES: 00_notation, 02_perspective, 04_adjacency
DEFINES: γ, μ, overlap regimes
CONTENT-TYPE: DEFINITION

## Connections

**Forward** (modules that use this):
- 08_time, 18_dynamics, physics/quantum_limit, physics/gravity_limit

**Backward** (modules this uses):
- 00_notation, 02_perspective, 04_adjacency

---

## Definition

For adjacent perspectives π₁ ~ π₂:

**γ (Overlap Parameter)**
```
γ(π₁, π₂) = |U_{π₁} ∩ U_{π₂}| / |U_{π₁} ∪ U_{π₂}|
```

Jaccard index of accessible content.

**Range**: γ ∈ [0, 1]
- γ = 0: disjoint access (no overlap)
- γ = 1: identical access (same perspective)

---

## Normalized Overlap

**μ (Normalized)**
```
μ = (γ - γ_min) / (γ_max - γ_min)
```

Rescaled to [0, 1] within the framework's actual range.

---

## Overlap Regimes

**High-γ Regime** (γ → 1)
```
Perspectives nearly coincide.
Transitions preserve most information.
```

**Low-γ Regime** (γ → 0)
```
Perspectives barely overlap.
Transitions change most accessible content.
```

**Intermediate-γ Regime**
```
Partial overlap.
Neither limit dominates.
```

---

## Theorems

**Theorem Ov.1 (Symmetry)**
```
γ(π₁, π₂) = γ(π₂, π₁)
```

**Theorem Ov.2 (Bounds)**
```
0 ≤ γ ≤ 1
```

**Theorem Ov.3 (Transitivity Bound)**
```
If π₁ ~ π₂ and π₂ ~ π₃, then:
γ(π₁, π₃) ≥ γ(π₁, π₂) + γ(π₂, π₃) - 1
```

(Triangle inequality in Jaccard form)

---

## Local vs Global γ

**Local γ**: Between adjacent perspectives (as above)

**Global γ**: Average over all perspective pairs
```
γ_global = (1/|pairs|) Σ_{π₁~π₂} γ(π₁, π₂)
```

Characterizes the "overlap density" of U.
