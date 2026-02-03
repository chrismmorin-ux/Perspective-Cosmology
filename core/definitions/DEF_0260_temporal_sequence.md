# DEF_0260 Definition: Temporal Sequence

**Tag**: 0260
**Type**: DEFINITION
**Status**: CANONICAL
**Source**: core/08_time.md
**Updated**: Session 196 (strengthened to require strict information loss; spatial transitions distinguished)

---

## Requires

- [DEF_0216: Perspective space Pi]
- [DEF_0225: Adjacency relation ~]
- [DEF_0227: Information loss Delta_I]
- [AXM_0107: Non-negative loss]

## Provides

- T: Temporal sequence through Pi
- Distinction between temporal and spatial transitions

---

## Statement

A **temporal sequence** is a directed path through Pi with strict information loss at each step:

```
T = (pi_0 -> pi_1 -> pi_2 -> ... -> pi_n)

where for each i:
  (a)  pi_i ~ pi_{i+1}                    (adjacent)
  (b)  Delta_I(pi_i -> pi_{i+1}) > 0      (strict information loss)
```

Condition (b) means dim(U_{pi_{i+1}}) < dim(U_{pi_i}): accessible dimension strictly decreases at each step.

---

## Temporal vs Spatial Transitions

The directed graph G = (Pi, E) from THM_0421 contains two types of edges:

| Type | Condition | Physical meaning |
|------|-----------|-----------------|
| **Temporal** | Delta_I > 0 (strict) | Time passes; entropy increases |
| **Spatial** | Delta_I = 0 | No time passes; lateral movement at same information level |

Both types are valid directed edges (Delta_I >= 0, satisfying AXM_0107). Temporal sequences use only temporal edges. Spatial edges connect perspectives that have the same accessible dimension but different accessible content.

---

## Notes

**Key Insight:**
```
Time is not a dimension of U.
Time is a directed path through Pi with STRICT information loss at each step.
```

**Analogy**: In general relativity, both timelike and null geodesics are valid paths in spacetime. Timelike geodesics represent the passage of time (proper time increases); null geodesics represent light propagation (no proper time passes). Similarly, temporal transitions (Delta_I > 0) represent the passage of time, while spatial transitions (Delta_I = 0) represent information-preserving connections.

---

## Erratum (Session 196)

The original definition required only "valid directed adjacency" at each step, which includes transitions with Delta_I = 0. This made temporal loops possible: a cycle of distinct perspectives all having the same accessible dimension satisfies Delta_I = 0 at every step and constitutes a valid directed path.

**Counterexample (old definition)**: In R^4, the perspectives pi_0 = span{e1,e2}, pi_1 = span{e2,e3}, pi_2 = span{e3,e1} form a cycle with Delta_I = 0 everywhere — a valid temporal loop under the old definition, contradicting THM_0461.

The corrected definition requires Delta_I > 0 (strict), which excludes such cycles and makes THM_0461 provable.
