# Time as Path

REQUIRES: 00_notation, 02_perspective, 04_adjacency
DEFINES: temporal sequence T, arrow of time, no-loop theorem
STATUS: DEFINITION + THEOREM

---

## Temporal Sequence

A **temporal sequence** is a directed path through Π:

```
T = (π₀ → π₁ → π₂ → ... → πₙ)

where each πᵢ → πᵢ₊₁ is valid directed adjacency
```

---

## Key Insight

```
Time is not a dimension of U.
Time is a directed path through Π.
```

---

## Arrow of Time

The arrow emerges from monotonic information loss:

```
H(T, n) = ⋃ᵢ₌₀ⁿ H_πᵢ  (cumulative hidden content)
```

**Theorem T.1 (Hidden Accumulation)**
```
H(T, n) ⊆ H(T, n+1)
```

Hidden content accumulates. Once hidden, structure cannot return to accessibility.

---

## No-Loop Theorem

**Theorem T.2 (No Loops)**
```
In finite U with finite B, temporal sequences cannot loop.
```

Proof:
1. Valid adjacency requires |H_{π₂}| ≥ |H_{π₁}|
2. To loop πₙ → π₀ requires |H_{π₀}| ≥ |H_{πₙ}| ≥ ... ≥ |H_{π₀}|
3. This forces |H_{πᵢ}| = |H_{πⱼ}| for all i, j
4. No information loss ⟹ no distinction between perspectives
5. A chain with no distinction is a point, not a sequence
QED

**Corollary T.3**
```
Entropy cannot cycle. It flows in one direction.
```

---

## Termination Conditions

Any temporal sequence must eventually:

**Option 1: Terminate**
```
Reach πₜ where no valid adjacency πₜ → π' exists.
All accessible structure has been projected away.
```

**Option 2: Stabilize**
```
Reach crystalline region: ∀ π, π' : U_π ≅ U_{π'}
Time "stops" because nothing distinguishes moments.
```

---

## Boundary States

**Minimum entropy (origin)**
- Maximum accessible dimensions
- Maximum distinguishability

**Maximum entropy (terminus)**
- Minimum accessible dimensions
- Maximum indistinguishability
