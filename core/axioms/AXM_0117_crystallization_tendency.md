# AXM_0117 Axiom: Crystallization Tendency (R1)

**Tag**: 0117
**Type**: AXIOM
**Status**: CANONICAL (promoted from PROPOSED, Session 178 — stable 100+ sessions, used by THM_0494/THM_0487/THM_0498)
**Source**: framework/investigations/prime_crystallization_attractors.md
**Added**: Session 73 (formalization of crystallization dynamics)

---

## Requires

- [AXM_0109: Crystal Existence (C1)]
- [AXM_0114: Tilt Possibility (P4)]
- [DEF_02A3: Tilt Matrix]

## Provides

- Tilt is dynamically unstable — tends to reduce over proper time
- Crystallization (tilt reduction) is the universal dynamical tendency of the tilt field

---

## Statement

**R1 (Crystallization Tendency)**

```
The tilt field evolves as gradient flow on a crystallization energy functional:

∂ε/∂τ = -∇_ε F[ε]

where:
- ε is the tilt matrix (measuring deviation from orthogonality)
- τ is proper time
- F[ε] is the crystallization energy (Mexican hat form):
    F(ε) = -a|ε|² + b|ε|⁴    (a, b > 0)

The functional has:
- F[0] = 0 (local maximum — ε = 0 is UNSTABLE)
- F[ε*] < 0 (global minimum at |ε*| = √(a/2b))
- d||ε||/dτ ≤ 0 only for |ε| > ε* (crystallization regime)
```

**Physical meaning**: The tilt field flows toward the equilibrium ε*, not toward zero. For |ε| > ε*, tilt decreases (crystallization). For |ε| < ε*, tilt increases (nucleation / anti-crystallization). We inhabit the |ε| > ε* regime.

---

## Formal Statement (Equilibrium Structure)

```
The crystallization energy F(ε) = -a|ε|² + b|ε|⁴ has:

1. ε = 0:   unstable maximum (nucleation point)
2. |ε| = ε* = √(a/2b):  stable equilibrium
3. ε → ∞:  energetically forbidden

The gradient flow ∂ε/∂τ = -∇_ε F drives:
- |ε| > ε* → ε* (tilt reduction = crystallization)
- |ε| < ε* → ε* (tilt growth = nucleation)
```

This resolves the nucleation paradox: ε = 0 is unstable, so nucleation (emergence of nonzero tilt) is dynamically inevitable.

---

## Notes

### Mathematical Interpretation

> **Layer purity note (Session 140 audit)**: This is a Layer 1 axiom. Physics interpretations (gravity, forces) belong in Layer 2. The mathematical content below is kept; physics applications are developed in `framework/investigations/gauge/forces_as_localized_recrystallization.md` and `framework/investigations/spacetime/gravity_as_orthogonality_reduction.md`.

The crystallization tendency states that **imperfection is unstable**. Given time, any tilted (non-orthogonal) configuration will evolve toward greater orthogonality.

### Why This Isn't Trivial

One might ask: "Why should tilt evolve toward ε*? What makes this equilibrium special?"

The answer is structural: the Mexican hat potential F(ε) = -a|ε|² + b|ε|⁴ has a unique stable equilibrium at |ε*| = √(a/2b). Any deviation from ε* creates gradients in F, and gradient flows go downhill. The equilibrium ε* is where the "cost" of maintaining tilt exactly balances the "drive" of the crystallization instability.

The instability of ε = 0 is also structural: V_Crystal with perfect orthogonality is a symmetric but **unstable** extremum. Nucleation (the emergence of tilt) is dynamically inevitable, not a special event requiring external triggering.

### Connection to Thermodynamics

This axiom is analogous to the second law:
- 2nd Law: Entropy increases (disorder increases)
- R1: Tilt flows toward equilibrium ε* (dimensional order stabilizes at a nonzero level)

Note: The analogy is imperfect. Unlike entropy (which increases monotonically), tilt flows *toward* ε* from either direction: decreasing for |ε| > ε* (crystallization regime) and increasing for |ε| < ε* (nucleation regime). The shared feature is irreversibility — both processes have a preferred direction.

These aren't contradictory:
- Thermodynamic entropy: statistical disorder in matter/energy
- Tilt: structural disorder in dimensional geometry

Tilt reduction in the |ε| > ε* regime creates local order while global entropy increases. [Layer 2 identification: tilt reduction ↔ gravitational attraction; see Physical Consequences section below.]

---

## Mathematical Consequences (Layer 1)

1. **Gradient flow dynamics**: The tilt field has well-defined autonomous dynamics with a stable equilibrium at |eps*| = sqrt(a/2b).
2. **Instability of eps = 0**: The symmetric state is an unstable maximum, not a stable ground state. Perturbations grow.
3. **Attractor structure**: The equilibrium manifold |eps| = eps* is a global attractor for initial conditions with |eps| > eps*.
4. **Prime crystallization**: Irreducible orthogonal directions (primes) emerge as stable attractors of the crystallization flow. See [prime_crystallization_attractors.md].

## Physical Consequences (Layer 2/3 — interpretation, not axiom content)

> These are Layer 2/3 interpretations, documented here for cross-referencing. See `framework/layer_2_correspondence.md`.

- **[LAYER 2] Gravity as emergent**: Tilt reduction in the spatial domain corresponds to gravitational attraction [A-PHYSICAL]. See `framework/investigations/spacetime/gravity_as_orthogonality_reduction.md`.
- **[LAYER 2] Attractor formation**: Faster crystallization regions act as gravitational attractors [A-PHYSICAL].
- **[LAYER 2] Black holes as endpoints**: Where crystallization completes (eps -> 0), horizons form [A-PHYSICAL].

---

## Assumption Classification (Session 181 Audit)

The axiom contains two levels of assumption:

| Component | Classification | Justification |
|-----------|---------------|---------------|
| Gradient flow structure | [A-AXIOM] | Autonomous dynamics for tilt field |
| Mexican hat form (quartic) | ~~**[A-STRUCTURAL]**~~ **[D with imports]** | S259: CONJ-B1 partially resolved. Quartic forced by necessity (degree >= 4 minimum for bounded SSB) + CCP smoothness (no cubic) + Thom stability + QFT power counting (d=4 marginal). Gap: CCP -> continuous transition is interpretive. |
| Coefficients a, b | **[CONJECTURE]** | Values undetermined at Layer 0. See `framework/investigations/gauge/tilt_energy_functional.md` for candidate values. |
| eps = 0 is unstable | [D] from quartic form | Follows from a > 0 in Mexican hat |

**Honest assessment**: The gradient flow is natural. ~~The quartic form is assumed as [A-STRUCTURAL].~~ **S259 update**: CONJ-B1 partially resolved -- quartic is forced by two independent routes: (a) algebraic necessity (degree >= 4 for bounded SSB) + CCP smoothness -> no cubic + Thom structural stability; (b) CCP -> n_d=4 -> 4D -> quartic marginal in QFT. Status upgraded from [A-STRUCTURAL] to [DERIVATION with imports]. Remaining gap: CCP -> continuous transition step is interpretive. See `conj_b1_quartic_truncation.py` (20/20 PASS), `conj_b1_invariant_ring.py` (6/6 PASS).

**What would fully close the gap**: Make the CCP -> continuous transition argument rigorous. This would eliminate the last interpretive step in the quartic truncation derivation.

---

## Open Questions

1. **What determines a and b?** The Mexican hat coefficients are constrained by self-consistency conditions (see DEF_02C4) but their exact values are [CONJECTURE]. Candidate values discussed in `framework/investigations/gauge/tilt_energy_functional.md`.

2. **Are there metastable states?** Can tilt get "stuck" at local minima before reaching eps*? The Mexican hat has a single minimum ring, but in multi-component tilt space there may be saddle points.

3. **Timescale?** Crystallization timescale estimated at tau ~ 1/(4a Gamma) ~ 10^-36 s (see crystallization_dynamics.md). This should connect to gravitational timescales.

4. **Connection to coupled potential?** The full two-field system has W(eps, phi) = -a g(phi) |eps|^2 + b|eps|^4 where g(phi) = 1 - phi^2/mu^2. The equilibrium eps* evolves as crystallization proceeds. See crystallization_dynamics.md.

5. **[NEW, S181; PARTIALLY RESOLVED S259] Why quartic specifically?** ~~The Mexican hat form is [A-STRUCTURAL].~~ **CONJ-B1 partially resolved (S259)**: Quartic is forced by two independent routes: (a) degree 4 is the minimum for bounded SSB + CCP smoothness forbids cubic + Thom structural stability; (b) CCP -> n_d=4 -> 4D -> quartic marginal in QFT. Status upgraded from [A-STRUCTURAL] to [DERIVATION with imports]. Remaining gap: CCP -> continuous transition step is interpretive. See `conj_b1_quartic_truncation.py` (20/20 PASS), `conj_b1_invariant_ring.py` (6/6 PASS).

---

## Relationship to Other Axioms

| Axiom | Relationship |
|-------|--------------|
| AXM_0107 (Non-negative Loss) | Both are "second law" style — irreversible tendencies |
| AXM_0114 (Tilt Possibility) | R1 says tilt exists but is unstable |
| AXM_0110 (Perfect Orthogonality) | R1 says the crystal's orthogonality is the attractor |

---

## Historical: Original Gradient Flow Formulation (Sessions 73-85)

The original formulation (prior to Session 86 revision) assumed:

```
F[ε] ≥ 0 with F[0] = 0, making ε = 0 the stable ground state.
d||ε||/dτ ≤ 0 globally (tilt monotonically non-increasing).
```

This was **superseded** because it creates the nucleation paradox: if tilt only decreases, how did ε become nonzero? The Mexican hat form F(ε) = -a|ε|² + b|ε|⁴ (adopted Session 86, promoted to canonical statement Session 178) resolves this by making ε = 0 unstable.

**See**: `framework/investigations/tilt_energy_functional.md` for the full analysis.

---

## Cross-References

- [framework/investigations/prime_crystallization_attractors.md] — full development
- [framework/investigations/gravity_as_orthogonality_reduction.md] — gravity interpretation
- [framework/investigations/forces_as_localized_recrystallization.md] — force unification
- [framework/investigations/tilt_energy_functional.md] — **NEW**: Mexican hat F(ε), nucleation resolution
