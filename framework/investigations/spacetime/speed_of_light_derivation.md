# Speed of Light: Derivation from Crystallization

**Status**: ACTIVE
**Created**: Session 183, 2026-02-01
**Last Updated**: Session 183, 2026-02-01

---

## Plain Language

The speed of light isn't something the framework puts in by hand — it falls out of the axioms.

The Crystal is a perfectly symmetric mathematical space. Every direction in it is identical. When perspective breaks this symmetry and crystallization picks a "time direction," the resulting physics must respect the original symmetry in one crucial way: the magnitude of the metric is the same in every direction. Only the sign changes (negative for time, positive for space).

This means the ratio of "time units" to "space units" is exactly 1. That ratio IS c, the speed of light, in natural units. The number 299,792,458 m/s tells you about our meter and second, not about physics.

Light (photons) are the massless ripples in the crystallized vacuum — the angular wobbles of the order parameter. They propagate at exactly this maximum speed. Massive particles propagate slower. Nothing exceeds it, because the wave equation that governs these ripples is hyperbolic (has a finite propagation speed built in).

**One-sentence version**: c = 1 in natural units because the Crystal's inner product is isotropic, and crystallization only changes the sign of one direction, not its magnitude.

---

## Question

Can the speed of light c be derived from the framework axioms, rather than assumed?

## Answer

**Yes**, with confidence [DERIVATION]. The framework derives:

| Property | Status | Key Input |
|----------|--------|-----------|
| c is finite | [DERIVATION] | Lorentzian signature => hyperbolic PDE => finite speed |
| c is isotropic | [DERIVATION] | Crystal symmetry C4 => no preferred spatial direction |
| c is observer-independent | [DERIVATION] | Crystal uniqueness C1 => metric independent of perspective |
| c = 1 in natural units | [DERIVATION] | Crystal isotropy C2 preserved through Wick rotation |
| c = Goldstone wave speed | [DERIVATION] | Symmetry breaking + Goldstone theorem |
| Numerical value in SI | NOT DERIVABLE | Unit convention (since 1983, meter defined via c) |

---

## Complete Derivation Chain

### Step 1: Crystal metric is isotropic [D: from AXM_0109, AXM_0110, AXM_0112]

V_Crystal has inner product `<b_i, b_j> = delta_ij` (C2/AXM_0110). Crystal symmetry (C4/AXM_0112) guarantees no direction is distinguished. The metric in any orthonormal basis is `g = diag(1, 1, ..., 1)`.

### Step 2: Defect space = H [D: from THM_0484, THM_0485]

The transition algebra is a finite-dimensional associative division algebra (THM_0484). Frobenius theorem [I-MATH] restricts to {R, C, H}. F = C (THM_0485) gives defect space H with dim = 4.

The quaternion inner product `<q1, q2> = Re(q1* q2)` is isotropic: `|1|^2 = |i|^2 = |j|^2 = |k|^2 = 1`. The metric on H inherited from V_Crystal is `g_H = diag(1, 1, 1, 1)`.

### Step 3: H = R + Im(H) = 1 time + 3 space [D: algebraic]

The quaternion algebra distinguishes R from Im(H) by the sign of the square: `1^2 = +1` while `i^2 = j^2 = k^2 = -1`. This is algebraic structure, not an assumption. It gives 1 + 3 = 4 dimensions.

### Step 4: Crystallization gradient identifies R with time [A-PHYSICAL]

AXM_0117 defines gradient flow `d(eps)/d(tau) = -nabla_eps F[eps]`, which picks a preferred direction. The identity element 1 in H = the identity transition (no spatial displacement). Gradient flow = evolution along the identity direction.

**Gap G6**: The identification R = time is motivated but not rigorously proven. The argument that the gradient flow must align with the identity element needs further formalization.

### Step 5: Gradient flow = Euclidean equation of motion [D: from AXM_0117]

The gradient flow `d(eps)/d(tau_E) = -V'(eps)` is the first-order (overdamped) version of the Euler-Lagrange equation from the Euclidean action:

```
S_E = integral [ (1/2)(d_E eps)^2 + V(eps) ] d^4 x_E
```

The Euclidean metric in S_E is `g_E = diag(1, 1, 1, 1)` — the quaternion metric from Step 2.

### Step 6: Wick rotation gives Lorentzian signature [D + I-MATH]

**Import** [I-MATH: Wick rotation]: For polynomial actions, analytic continuation `tau_E -> it` gives the Lorentzian action. The substitution `d/d(tau_E) = (1/i)(d/dt)` gives `(d/d tau_E)^2 -> -(d/dt)^2`.

```
g_E = diag(+1, +1, +1, +1)    [Euclidean, isotropic]
            |
     Wick rotation (tau_E -> it)
            |
            v
g_L = diag(-1, +1, +1, +1)    [Lorentzian, Minkowski]
```

**Critical for c**: Wick rotation changes the SIGN of the time component but NOT the MAGNITUDE. Since `g_E` is isotropic (all entries = 1), after Wick rotation `|g_L[0,0]| = |g_L[1,1]| = 1`. Therefore `c^2 = |g_tt|/|g_xx| = 1`, so **c = 1**.

### Step 7: Proof by contradiction that c = 1 [D]

Suppose c != 1. Then `g_L = diag(-c^2, 1, 1, 1)`. Reversing Wick rotation: `g_E = diag(c^2, 1, 1, 1)`. But `g_E` must be the Crystal metric restricted to H, which is `diag(1,1,1,1)` by Step 1. The entry `g_E[0,0] = c^2 != 1` contradicts `<1,1> = 1` from C2. **Contradiction. QED.**

### Step 8: Goldstone modes from symmetry breaking [D + I-MATH]

The Mexican hat potential V = -a|eps|^2 + b|eps|^4 has continuous rotational symmetry broken by crystallization (eps -> eps*). **Import** [I-MATH: Goldstone theorem]: Each broken continuous symmetry gives a massless boson.

Decompose: eps = rho * n_hat. The radial mode rho is massive (m^2 = 4a). The angular modes n_hat are massless (Goldstone).

### Step 9: Massless wave equation with speed c [D]

The Goldstone Lagrangian:
```
L = (f^2/2) eta^{mu nu} (d_mu phi)(d_nu phi)
```

Euler-Lagrange: `Box(phi) = -(d^2/dt^2) phi + nabla^2 phi = 0`

Plane wave substitution: `omega^2 = k^2`, giving `v = omega/k = 1 = c`.

### Step 10: Hyperbolicity gives finite speed [D + I-MATH]

**Import** [I-MATH: PDE classification]: The Lorentzian wave operator is hyperbolic. Hyperbolic PDEs have finite propagation speed. The principal symbol `sigma(xi) = -xi_0^2 + xi_1^2 + xi_2^2 + xi_3^2` has null directions (e.g., xi = (1,1,0,0)), confirming hyperbolicity.

Contrast: gradient flow (parabolic) has infinite signal speed. The Wick rotation converts parabolic -> hyperbolic, which is HOW finiteness of c enters.

---

## The Two Dynamics Distinction

| Property | Order Parameter eps | Goldstone Modes phi |
|----------|-------------------|-------------------|
| Equation | d(eps)/d(tau) = -V'(eps) | Box(phi) = 0 |
| Order | First (gradient flow) | Second (wave) |
| Type | Parabolic (diffusive) | Hyperbolic (wavelike) |
| Speed | No finite propagation speed | Propagation at c |
| Physics | Crystallization relaxation | Light, gravity |

The user's intuition "c = speed of crystallization" is correct in this sense: **c is the speed at which perturbations of the crystallized vacuum propagate**. These perturbations (Goldstone modes) ARE crystallization degrees of freedom — the angular wobbles of the order parameter around its equilibrium direction.

The order parameter magnitude eps itself relaxes diffusively, without a finite propagation speed. But all physical propagation (including crystallization front expansion during the Big Bang) is bounded by c from the Lorentz structure.

---

## 3D Observation and Huygens' Principle

The observer's 3 spatial dimensions come from Im(H) = 3. This gives a bonus result: **Huygens' principle holds in 3 spatial dimensions**.

Huygens' principle (sharp propagation only on the light cone, no afterglow) holds if and only if the number of spatial dimensions is odd and >= 3. Since Im(H) = 3 is odd, signals propagate as sharp wavefronts at exactly ct.

| d_space | Source | Huygens? | Signal character |
|---------|--------|----------|-----------------|
| 1 | Im(C) | No | Signal + tail |
| 3 | Im(H) | **Yes** | Sharp wavefront |
| 7 | Im(O) | Yes | Sharp wavefront |

This means c is a CLEAN causal boundary in our 3+1 spacetime — a flash at the origin arrives at exactly t = r/c, not smeared out over time.

---

## Gap Accounting

| Gap | Status | Description | Shared? |
|-----|--------|-------------|---------|
| G1 | CLOSED | H inherits Crystal metric | — |
| G2 | CLOSED | Gradient flow = Euclidean EOM | — |
| G3 | CLOSED | Wick rotation applies (polynomial potential) | — |
| G4 | OPEN | Discrete-to-continuum transition | Yes (all continuum physics) |
| G5 | OPEN | Finiteness from discrete structure (depends on G4) | Yes |
| G6 | PARTIAL | R = time direction in H | Shared with Lorentz derivation |

**Honest assessment**: The core argument (c = 1 from isotropy) is strong. The weakest link is G6 (why R = time). Gaps G4 and G5 affect all continuum physics in the framework, not just the c derivation.

---

## Imports

| Import | Source | Standard? | Used in step |
|--------|--------|-----------|-------------|
| Frobenius theorem | Frobenius 1878 | Textbook | 2 |
| Wick rotation | Osterwalder-Schrader 1973 | Standard QFT | 6 |
| Goldstone theorem | Goldstone 1961 | Standard QFT | 8 |
| PDE classification | Courant-Hilbert | Textbook PDE | 10 |
| Huygens principle | Hadamard 1923 | Textbook PDE | 12 |

All imports are standard mathematics or established physics results with rigorous proofs.

---

## Falsification Criteria

1. **If the Lorentz signature derivation is wrong**: c would not emerge. This would require either the Crystal metric to be non-isotropic or the Wick rotation to fail.

2. **If the Goldstone construction fails**: Massless modes might not exist. This would require the symmetry breaking pattern to not produce Goldstone bosons (possible if the symmetry is gauged — but then the Goldstone bosons become the longitudinal modes of massive gauge bosons, and the REMAINING massless gauge bosons still propagate at c).

3. **If c were measured to be anisotropic**: The Crystal isotropy axiom C2/C4 would be falsified. Current experimental bounds on anisotropy are < 10^-18 (Michelson-Morley type experiments).

---

## Verification

**Script**: `verification/sympy/speed_of_light_from_crystallization.py`
**Tests**: 21/21 PASS
**Gaps**: 2 OPEN, 1 PARTIAL, 3 CLOSED
**Imports**: 5 [I-MATH]

---

## Dependencies

- **Uses**: AXM_0109, AXM_0110, AXM_0112, AXM_0113, AXM_0117, AXM_0119, THM_0484, THM_0485
- **Used by**: All derivations involving propagation speeds, Lorentz invariance, causality

---

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 183 | Full derivation from axioms | c = 1 from Crystal isotropy + Wick rotation. 21/21 PASS. 3 open gaps identified. |
