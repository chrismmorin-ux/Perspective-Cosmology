# THM_0461 Theorem: No Loops

**Tag**: 0461
**Type**: THEOREM
**Status**: CANONICAL (proof corrected Session 196 — uses strengthened DEF_0260)
**Source**: core/08_time.md

---

## Requires

- [AXM_0100: Finiteness] — dim(V) < infinity
- [AXM_0104: Partiality] — dim(U_pi) < dim(V) for all pi
- [DEF_0260: Temporal sequence] — directed path with Delta_I > 0 at each step
- [DEF_0227: Information loss] — Delta_I(pi_1 -> pi_2) = dim(U_{pi_1}) - dim(U_{pi_2})

## Provides

- Temporal sequences cannot loop (the directed graph restricted to temporal edges is a DAG)
- Maximum temporal sequence length is bounded by dim(V) - 1

---

## Statement

**Theorem T.2 (No Temporal Loops)**

```
No temporal sequence can form a cycle. That is, there is no temporal sequence
T = (pi_0 -> pi_1 -> ... -> pi_n) with pi_n -> pi_0 also a temporal transition.
```

---

## Proof

**Step 1**: By DEF_0260, each step in a temporal sequence satisfies Delta_I > 0 (strict). By DEF_0227:

```
Delta_I(pi_i -> pi_{i+1}) = dim(U_{pi_i}) - dim(U_{pi_{i+1}}) > 0
==>  dim(U_{pi_{i+1}}) < dim(U_{pi_i})     for each i
```

The accessible dimension strictly decreases at every step.

**Step 2**: Therefore along any temporal sequence:

```
dim(U_{pi_0}) > dim(U_{pi_1}) > dim(U_{pi_2}) > ... > dim(U_{pi_n})
```

This is a strictly decreasing sequence of non-negative integers. [AXM_0100: all dimensions finite]

**Step 3**: For a loop, we would additionally need dim(U_{pi_0}) > dim(U_{pi_n}) (from Step 2) AND dim(U_{pi_n}) >= dim(U_{pi_0}) (from the closing transition pi_n -> pi_0 having Delta_I > 0). This is a contradiction:

```
dim(U_{pi_0}) > dim(U_{pi_n}) >= dim(U_{pi_0})     Contradiction.
```

Therefore no temporal loop exists. QED

---

## Corollary T.2a: Maximum Temporal Sequence Length

```
Any temporal sequence has length at most dim(U_{pi_0}).
```

**Proof**: Each step decreases dim(U_pi) by at least 1 (strict decrease of integers). Starting from dim(U_{pi_0}) and bounded below by 0, there are at most dim(U_{pi_0}) steps. QED

**Corollary T.2b**: By AXM_0104 (partiality), dim(U_{pi_0}) < dim(V) for all perspectives. Therefore:

```
Maximum temporal sequence length < dim(V)
```

This is an absolute upper bound on temporal depth: no perspective's temporal history can exceed dim(V) - 1 steps.

---

## Corollary T.3: Entropy Cannot Cycle

```
Along any temporal sequence: S_{pi_0} < S_{pi_1} < ... < S_{pi_n}
```

Entropy strictly increases. It cannot return to a previous value.

**Proof**: S_pi = dim(V) - dim(U_pi) [THM_0450]. Since dim(U_pi) is strictly decreasing (Step 2), S_pi is strictly increasing. QED

---

## Verification

**Script**: `verification/sympy/no_loops_proof.py`
**Status**: PASS

---

## Notes

**What this theorem does NOT say**: It does NOT claim that the full directed graph G = (Pi, E) is acyclic. The directed graph CAN have cycles among perspectives with equal accessible dimension (connected by spatial transitions with Delta_I = 0). The theorem says these cycles are not temporal — no time passes along them.

**Physical interpretation**: The distinction between temporal and spatial transitions (DEF_0260) is analogous to the distinction between timelike and null/spacelike paths in general relativity. Temporal paths (strict entropy increase) define the arrow of time. Spatial paths (equal entropy) represent information-preserving connections where no time passes.

---

## Erratum (Session 196)

The original proof was logically broken in two ways:

1. **Steps 5-7 were interpretive, not mathematical**: The claim that "Delta_I = 0 means no temporal direction" contradicted DEF_0260, which defined temporal sequences as directed paths with Delta_I >= 0 (allowing Delta_I = 0).

2. **The theorem was false under the old definitions**: Concrete counterexample in R^4: perspectives pi_0 = span{e1,e2}, pi_1 = span{e2,e3}, pi_2 = span{e3,e1} form a valid directed cycle with Delta_I = 0 everywhere. This was a temporal loop under the old DEF_0260.

**Resolution**: DEF_0260 was strengthened to require Delta_I > 0 (strict) at each step of a temporal sequence. This makes the proof a clean 3-step argument using strict monotonicity of bounded integers.

---

## History

- Original: Proof with non-sequiturs in Steps 4-5 (CR-040)
- CR-040: Steps 4-5 corrected but replaced with interpretive argument (Steps 5-7)
- Session 196 (notation): Updated for revised DEF_0227, weakness noted
- Session 196 (proof): Identified counterexample; strengthened DEF_0260; complete rewrite with clean 3-step proof
