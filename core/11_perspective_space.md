# Perspective Space Structure

REQUIRES: 00_notation, 01_universe, 02_perspective
DEFINES: Π structure, d_Π metric, subspaces of Π, measure ν
STATUS: DEFINITION

---

## Π Inherits Structure from U

```
Π = { π = (p, D, A) : p ∈ P, D valid, A consistent }
```

---

## Point Structure

Each π ∈ Π is anchored at some p ∈ P.

```
anchor: Π → P
anchor(π) = p
```

---

## Metric Structure

Distance on Π:

```
d_Π(π₁, π₂) = α · d_P(p₁, p₂) + β · d_D(D₁, D₂) + γ · d_A(A₁, A₂)
```

where:
- d_P = distance between anchors (from Γ-structure)
- d_D = angular distance between direction sets
- d_A = difference in access maps
- α, β, γ = weighting parameters

---

## Topology

Π inherits topology from d_Π:
- Open sets defined by metric balls
- Convergence, continuity well-defined

---

## Measure on Π

**Counting Measure** (finite Π):
```
ν(S) = |S|  for S ⊆ Π
```

All perspectives weighted equally.

**Uniform Measure** (continuous approximation):
```
ν = normalized Lebesgue measure
ν(Π) = 1
```

**Weighted Measure** (optional):
```
dν(π) = w(π) dπ

where w could be |U_π|, connectivity, etc.
```

---

## Integration over Π

For f: Π → ℝ:

```
⟨f⟩_Π = (1/|Π|) Σ_{π ∈ Π} f(π)
```

Average of f over all perspectives.

---

## Subspaces of Π

```
Π_p = { π ∈ Π | anchor(π) = p }     (anchored at p)
Π_D = { π ∈ Π | direction(π) = D }  (fixed direction)
Π_high = { π | S(π) > threshold }    (high entropy)
Π_low = { π | S(π) < threshold }     (low entropy)
Π_∂ = { π | anchor(π) ∈ ∂U }        (boundary)
```

---

## Perspectival Variance

```
Var(U) = ⟨d(U_{π₁}, U_{π₂})⟩_{Π×Π}
       = (1/|Π|²) Σ_{π,π'} d(U_π, U_{π'})
```

Measures how much perspectives differ.

**Var(U) = 0 ⟺ crystalline** (all perspectives equivalent)
