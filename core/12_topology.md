# Topology and Boundary

REQUIRES: 00_notation, 01_universe
DEFINES: shape of U, ∂U, boundary perspectives, permeability
STATUS: DEFINITION

---

## U as a Thing

U is not merely a set — it has **shape**.

The topology determines:
- What anchor points P exist
- How connectivity Γ works
- Where natural edges form
- Structure of Π

---

## Shape Categories

| Type | Properties | Π implications |
|------|------------|----------------|
| Sphere-like | No edges, uniform curvature | Smooth connectivity |
| Polytope-like | Faces, edges, vertices | Singularities in adjacency |
| Toroidal | Closed loops, holes | Chains can wrap (not reverse) |
| Fractal | Self-similar, complex boundary | Rich local structure |

---

## Boundary

If U is finite and closed:

```
∂U = { p ∈ P | p has incomplete neighborhood in Γ }
```

The boundary is where U's internal structure meets its limit.

---

## Boundary Perspectives

```
π_∂ = (p, D, A) where p ∈ ∂U or p Γ-adjacent to ∂U
```

Boundary perspectives have constrained access:
- Some directions in D point "outward"
- Projection outward yields no content or uniform content

---

## Three Boundary Behaviors

**Outward Projection** (escape attempt)
```
π at ∂U attempts to access exterior.

If exterior crystalline: returns uniform content, opaque
If exterior void: returns null, absolute limit
```

**Inward Projection** (invasion)
```
"Outside" attempts to access interior.

If outside crystalline: no perspectives exist there
If outside void: no anchor points, undefined
```

**Parallel Projection** (edge-skating)
```
π moves along ∂U without crossing.

Experiences:
- Extreme projection loss
- High entropy
- Maximum hiddenness
```

---

## Permeability

```
P(∂U) ∈ { impermeable, semi-permeable, permeable }
```

| Type | Meaning |
|------|---------|
| Impermeable | No π crosses ∂U either direction |
| Semi-permeable | Information flows one way only |
| Permeable | Perspectives can cross (requires Var > 0 outside) |

---

## Conjecture

If U is the only region with Var > 0, then ∂U is effectively impermeable.

Perspective cannot cross into regions without perspective.
