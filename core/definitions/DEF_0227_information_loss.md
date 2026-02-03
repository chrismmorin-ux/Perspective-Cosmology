# DEF_0227 Definition: Information Loss

**Tag**: 0227
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/04_adjacency.md
**Updated**: Session 196 (corrected formula: net dimension change replaces overlap loss)

---

## Requires

- [DEF_0214: Accessible content U_pi]
- [DEF_0225: Adjacency relation ~]
- [AXM_0100: Finiteness] — dim(V) < infinity

## Provides

- Delta_I: Net information loss in transition (primary quantity, constrained by AXM_0107)
- lambda: Overlap loss (auxiliary quantity, always non-negative)

---

## Statement

**Net information loss** (primary) in transition pi_1 -> pi_2:

```
Delta_I(pi_1 -> pi_2) = dim(U_{pi_1}) - dim(U_{pi_2})
```

Measures the net change in accessible dimension. Positive Delta_I means pi_2 has strictly less accessible content than pi_1. This is the quantity constrained by AXM_0107.

**Overlap loss** (auxiliary) for the ordered pair (pi_1, pi_2):

```
lambda(pi_1, pi_2) = dim(U_{pi_1}) - dim(U_{pi_1} cap U_{pi_2})
```

Measures how much of pi_1's specific content is not shared with pi_2. Always non-negative since U_{pi_1} cap U_{pi_2} is a subspace of U_{pi_1}, so dim(U_{pi_1} cap U_{pi_2}) <= dim(U_{pi_1}).

---

## Decomposition

The net information loss decomposes as:

```
Delta_I(pi_1 -> pi_2) = lambda(pi_1, pi_2) - lambda(pi_2, pi_1)
```

**Proof**:

```
lambda(pi_1, pi_2) - lambda(pi_2, pi_1)
= [dim(U_{pi_1}) - dim(U_{pi_1} cap U_{pi_2})] - [dim(U_{pi_2}) - dim(U_{pi_1} cap U_{pi_2})]
= dim(U_{pi_1}) - dim(U_{pi_2})
= Delta_I(pi_1 -> pi_2)   QED
```

**Interpretation**: Net loss = content lost - content gained. AXM_0107 requires Delta_I >= 0, meaning a perspective loses at least as much content as it gains in any valid transition.

---

## Properties

| Property | Delta_I (net loss) | lambda (overlap loss) |
|----------|-------------------|----------------------|
| Sign | Can be positive, zero, or negative | Always >= 0 |
| Symmetry | Anti-symmetric: Delta_I(pi_1->pi_2) = -Delta_I(pi_2->pi_1) | No symmetry |
| Constrained by AXM_0107 | Yes (>= 0 for valid transitions) | No (tautologically >= 0) |

---

## Notes

The anti-symmetry Delta_I(pi_1 -> pi_2) = -Delta_I(pi_2 -> pi_1) means: for any adjacent pair, if one direction has positive information loss, the reverse direction has negative loss (information gain). AXM_0107 selects the direction of non-negative loss as "forward in time."

---

## Erratum (Session 196)

The original definition defined Delta_I as the overlap loss:

```
Delta_I_old(pi_1 -> pi_2) = dim(U_{pi_1}) - dim(U_{pi_1} cap U_{pi_2})    [INCORRECT]
```

This was always non-negative for any pair of subspaces (since intersection is a subspace of each), making AXM_0107 tautological. The corrected definition uses the net dimension change, which can be negative and provides a genuine constraint when combined with AXM_0107.

**Downstream updates (Session 196)**:

| File | Status |
|------|--------|
| AXM_0107 | Updated — now non-tautological |
| THM_0420 | Updated — proof simplified via anti-symmetry |
| THM_0421 | Updated — edge condition uses new Delta_I |
| THM_0450 | Updated — dimension form replaces cardinality |
| THM_0451 | Updated — proof corrected |
| THM_0461 | Updated — notation fixed, weakness noted |
