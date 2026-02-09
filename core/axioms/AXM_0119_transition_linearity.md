# AXM_0119 Axiom: Transition Linearity

**Tag**: 0119
**Type**: AXIOM
**Status**: PROPOSED
**Source**: Session 181 (Phase 0 of Rigorous Formalization)
**Added**: Session 181

---

## Requires

- [AXM_0109: Crystal Existence] -- V_Crystal is an inner product space
- [AXM_0115: Algebraic Completeness] -- transition algebra exists

## Provides

- Transition algebra is a subalgebra of End_R(V_Crystal)
- Associativity follows automatically (composition of linear maps)
- Foundation for Frobenius theorem application (THM_0484)

---

## Statement

**AXM_0119 (Transition Linearity)**

```
Transitions between perspectives act as R-linear maps on V_Crystal.

That is: the transition algebra T is a subalgebra of End_R(V_Crystal),
the algebra of R-linear endomorphisms of V_Crystal.

Formally: For every transition T in T and every u, v in V_Crystal, a, b in R:

  T(au + bv) = aT(u) + bT(v)
```

---

## Motivation

### Why This Axiom Is Needed

The framework derives 5 of 8 division algebra properties from the existing 19 axioms:

| Property | Status | Source |
|----------|--------|--------|
| Composition (closure) | DERIVED | AXM_0115(a) |
| Identity | DERIVED | AXM_0115(b) |
| No zero divisors | DERIVED | THM_0482 |
| Invertibility | DERIVED | THM_0483 |
| Finite dimension | AXIOM | AXM_0113 |
| **Associativity** | **GAP (G-004)** | Not derivable |
| Alternativity | Not investigated | Not derivable |
| Multiplicative norm | Not investigated | No norm axiom |

Without associativity (or alternativity, or a multiplicative norm), the transition algebra is only constrained by the Bott-Milnor-Kervaire theorem to have dimension in {1, 2, 4, 8}, with infinitely many non-isomorphic possibilities in each dimension. This is insufficient for the framework's needs.

### Why Linearity (Not Bare Associativity)

Three strategies were attempted to derive associativity from existing axioms:

1. **From AXM_0115 group structure**: FAILS. AXM_0115 gives a loop, not a group.
2. **From linear map composition**: POTENTIALLY SUCCEEDS -- but only if transitions are linear.
3. **From algebraic properties alone**: FAILS. Octonions are a counterexample.

Asserting linearity is **stronger** than asserting associativity, but it is also:
- More natural: V_Crystal is already a vector space (AXM_0109)
- More informative: it constrains how transitions act, not just that they compose nicely
- More connected to physics: linear quantum mechanics follows naturally

### Why Not Bare Associativity?

Adding "T is associative" as a standalone axiom would close G-004 but provides less structure. Linearity gives associativity *plus* the representation-theoretic framework that the rest of the theory uses. It is also closer to what the framework implicitly assumes.

### Honest Assessment

This axiom is [A-STRUCTURAL]: a mathematical choice that constrains the framework. It cannot be derived from more primitive perspective axioms. The strongest justification is that the framework already uses V_Crystal as a vector space and implicitly treats transitions as linear maps.

**What this does NOT resolve**: The "transition vs. discovery" problem. Linearity is a choice. Non-linear transition theories might also exist but would produce different physics.

---

## Status Note (Session 189 Audit)

AXM_0119 is currently PROPOSED. The question is whether promotion to CANONICAL is warranted.

**Case for promotion**: AXM_0119 is used by THM_0484, THM_04A0, THM_0485, and all downstream numerical predictions. It has been stable since S181, with no challenges to its validity. Its documentation (motivation, alternatives considered, honest assessment) is thorough.

**Case for keeping PROPOSED**: AXM_0119 was added in S181 (~8 sessions ago). For comparison, AXM_0117 was promoted PROPOSED→CANONICAL in S178 after ~100 sessions of stable use. AXM_0119 has not yet reached that maturity threshold.

**Verdict**: Retain PROPOSED for now. Revisit for promotion after ~20 sessions of stable use (approximately S200). The axiom's documentation and usage pattern are consistent with eventual CANONICAL status.

---

## Consequences

### Immediate

1. **Associativity** follows: T is contained in End_R(V_Crystal), and composition of linear maps is associative.
2. **G-004 is CLOSED**: The gap that blocked THM_0484 is resolved.
3. **THM_0484 upgraded**: Division algebra structure becomes unconditional THEOREM (conditional on AXM_0119 instead of [A-STRUCTURAL: Associativity]).
4. **Frobenius applies**: T ∈ {R, C, H} (finite-dimensional associative division algebra)

### Downstream

- THM_04A0 (defect = H): Now has clean derivation chain
- THM_0485 (F = C): Unchanged
- AXM_0118 (n_c = 11): Unchanged
- THM_0491 (Hilbert space): Strengthened
- All numerical predictions: Unchanged

### What Changes in Axiom Count

Previous: 19 axioms + 1 structural assumption [A-STRUCTURAL: Associativity] (implicit)
New: 20 axioms (AXM_0119 makes the implicit assumption explicit)

This is an increase in axiom count but a DECREASE in hidden assumptions. Net honesty improves.

---

## Layer

**Layer 1** (mathematical consequence of Layer 0 structure)

AXM_0119 concerns the mathematical structure of the transition algebra, not physical interpretation.

---

## Alternatives Considered

| Alternative | Verdict | Why Rejected |
|-------------|---------|--------------|
| Prove associativity from axioms | FAILED | No proof strategy succeeded |
| Add bare associativity axiom | POSSIBLE | Weaker than linearity; provides less structure |
| Add alternativity axiom | POSSIBLE | Gives R,C,H,O not R,C,H; need extra work for n_d=4 |
| Add multiplicative norm axiom | POSSIBLE | Metric condition; harder to motivate from perspective |
| Accept BMK only (no new axiom) | POSSIBLE | Too weak; only gives dimensions, not specific algebras |

---

## Verification

- `verification/sympy/associativity_vs_alternativity.py` -- 11/11 PASS
  Documents the analysis leading to this axiom

---

## Cross-References

- [AXM_0109: Crystal Existence] -- V_Crystal is a vector space
- [AXM_0113: Finite Access] -- finite dimension
- [AXM_0115: Algebraic Completeness] -- transition algebra
- [THM_0482: No Zero Divisors] -- derived property
- [THM_0483: Transition Invertibility] -- derived property
- [THM_0484: Division Algebra Structure] -- now unconditional with this axiom
- [THM_04A0: Associativity Filter] -- defect = H follows
