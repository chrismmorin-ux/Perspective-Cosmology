# [07] Information Structure

**Status**: CANONICAL
**Confidence**: [AXIOM] — defines information measures
**Dependencies**: 00_notation, 02_perspective, 04_adjacency
**Verified**: N/A (definitions, standard information theory)

---

REQUIRES: 00_notation, 02_perspective, 04_adjacency
DEFINES: I_π, ΔI, entropy, information bounds
CONTENT-TYPE: DEFINITION + THEOREM

## Connections

**Forward** (modules that use this):
- 10_entropy (entropy refined)

**Backward** (modules this uses):
- 00_notation, 02_perspective, 04_adjacency

---

## Information Content

**I_π** (Information in perspective π)

```
I_π = log₂|U_π|
```

Bits required to specify accessible content.

---

## Information Change

For transition π₁ → π₂:

**ΔI (Information Loss)**
```
ΔI(π₁ → π₂) = I_{π₁} - I_{π₁ ∩ π₂}
```

where I_{π₁ ∩ π₂} = log₂|U_{π₁} ∩ U_{π₂}|

**ΔI' (Information Gain)**
```
ΔI'(π₁ → π₂) = I_{π₂} - I_{π₁ ∩ π₂}
```

---

## Net Change

```
ΔI_net = ΔI' - ΔI = I_{π₂} - I_{π₁}
```

---

## Entropy

**S_π (Entropy of perspective)**
```
S_π = log₂|H_π| = log₂|U \ U_π|
```

Hidden content entropy.

---

## Theorems

**Theorem I.1 (Conservation)**
```
I_π + S_π = I_total = log₂|U|
```

Accessible + hidden = total (constant).

**Theorem I.2 (Second Law)**
```
Valid transitions satisfy ΔI ≥ 0.
Equivalently: S increases or stays constant.
```

(From Adj.1 in 04_adjacency)

**Theorem I.3 (Bounds)**
```
0 ≤ I_π ≤ I_total
0 ≤ S_π ≤ I_total
```

---

## Mutual Information

For perspectives π₁, π₂:

```
I(π₁ : π₂) = I_{π₁} + I_{π₂} - I_{π₁ ∪ π₂}
           = log₂|U_{π₁}| + log₂|U_{π₂}| - log₂|U_{π₁} ∪ U_{π₂}|
```

Measures shared information.

---

## Connection to γ

```
γ = |U_{π₁} ∩ U_{π₂}| / |U_{π₁} ∪ U_{π₂}|
```

High γ ⟺ high mutual information (perspectives share access)
Low γ ⟺ low mutual information (perspectives independent)
