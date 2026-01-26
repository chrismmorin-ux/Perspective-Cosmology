# [10] Entropy

**Status**: CANONICAL
**Confidence**: [AXIOM] + [THEOREM] — entropy definition + Second Law proof
**Dependencies**: 00_notation, 02_perspective, 04_adjacency, 06_basis_geometry
**Verified**: N/A (definitions) / YES for Second Law (logical proof)

---

REQUIRES: 00_notation, 02_perspective, 04_adjacency, 06_basis_geometry
DEFINES: S(π), entropy increase, entropy bounds
CONTENT-TYPE: DEFINITION + THEOREM

## Connections

**Forward** (modules that use this):
- 14_dimensional_stability, 16_eddies

**Backward** (modules this uses):
- 00_notation, 02_perspective, 04_adjacency, 06_basis_geometry, 07_information

---

## Entropy Defined

**S(π)** (Entropy at perspective π)

```
S(π) = log |{ u ∈ U | A_π(u) = A_π(u') for some u ≠ u' }|
```

The log of how many global states are indistinguishable from current accessible state.

**Equivalently:**
```
S(π) ∝ |B_hidden(π)|

where B_hidden(π) = { b ∈ B | b ∈ H_π }
```

Entropy counts hidden basis dimensions.

---

## Entropy Increase

**Theorem E.1 (Second Law)**
```
For valid directed adjacency π₁ → π₂:

S(π₂) ≥ S(π₁)
```

Proof:
1. Valid adjacency requires |H_{π₂}| ≥ |H_{π₁}|
2. Hidden content includes hidden dimensions
3. More hidden dimensions → more indistinguishable states
4. Therefore S(π₂) ≥ S(π₁)
QED

---

## Two Sources of Increase

1. **Projection loss**: Stable dimensions becoming hidden
2. **Redundancy collapse**: Unstable dimensions revealed as reducible

Both contribute. Neither reverses along valid adjacency.

---

## Entropy Bounds

```
S_min ≤ S(π) ≤ S_max
```

Bounds are U-specific, depending on:
- Number of basis dimensions
- Structure of Π
- Minimum/maximum accessible configurations

---

## Connection to Information

From 07_information:

```
I_π + S_π = I_total = constant
```

Entropy is the complement of accessible information.

---

## Entropy as Perspectival Footprint

```
Every act of access leaves collapsed dimensions behind.
Entropy is the cumulative record of perspectival projection.
```

Entropy increases because perspective only collapses structure — it never restores it.
