# Tilt Gradient Kinetic Term (Formal)

**Status**: CANONICAL (formal statement)
**Confidence**: [DERIVATION] — structure; [CONJECTURE] — physical role
**Created**: 2026-01-30
**Source**: alpha_mechanism_exploration Step 8b; alpha_mechanism_derivation Option B
**Purpose**: Formal statement of the tilt field gradient kinetic term used in the alpha mechanism derivation

---

## Requires

- [DEF_02A3: Tilt Matrix] — ε_ij = ⟨π(b_i), π(b_j)⟩ − δ_ij
- [DEF_02B3: Interface Mode Count] — N_I = n_d² + n_c²
- [THM_0485: Complex Structure (F = C)] — crystal as complex inner product space
- Tilt field ε(x) promoted to local field (see tilt_topology_point_emergence)

## Provides

- Formal kinetic term S_kin for ε(x)
- Equal weight per interface mode (from U(n_d)×U(n_c) invariance)
- Coefficient N_I/2 for democratic combination (used in alpha mechanism derivation)

---

## Statement

### 1. Tilt field [DEFINITION]

The **tilt field** ε(x) is the promotion of the tilt matrix to a local field on the observable manifold M:

```
ε(x) : M → Herm(n_d) ⊕ Herm(n_c)

where:
  M = observable manifold (physical space)
  Herm(n) = {X ∈ M_n(ℂ) : X† = X}
  dim_ℝ(Herm(n_d) ⊕ Herm(n_c)) = n_d² + n_c² = N_I  [DEF_02B3]
```

### 2. Gradient kinetic term [DERIVATION]

The **tilt gradient kinetic term** is

```
S_kin = (κ/2) ∫_M d⁴x Tr[(∂_μ ε)(∂^μ ε)]
```

where κ is a dimensionless constant (absorbed into field normalization; set κ = 1 by convention).

**In orthonormal generator basis**: Let {T^a} be an orthonormal basis of u(n_d) ⊕ u(n_c) with Tr(T^a T^b) = δ^{ab}. Write ε = Σ_{a=1}^{N_I} ε_a T^a with ε_a real. Then

```
Tr[(∂_μ ε)(∂^μ ε)] = Σ_{a=1}^{N_I} (∂_μ ε_a)(∂^μ ε_a)
```

So

```
S_kin = (1/2) Σ_{a=1}^{N_I} ∫_M d⁴x (∂_μ ε_a)(∂^μ ε_a)
```

**Equal weight per a** [DERIVATION]: The Killing form (or trace inner product) on u(n_d) ⊕ u(n_c) is the unique (up to scale) U(n_d)×U(n_c)-invariant bilinear. So all N_I directions have the same coefficient; no preferred generator.

### 3. Single field on all channels [DERIVATION]

The photon (or the massless U(1) mode) is the **single** gauge field that couples to **all** N_I interface channels. So the same field ε (or its phase θ) lives on every channel: ε_a = ε for all a. Then ∂_μ ε_a = ∂_μ ε for all a, and

```
Σ_{a=1}^{N_I} (∂_μ ε_a)(∂^μ ε_a) = N_I (∂_μ ε)(∂^μ ε)
```

So

```
S_kin = (1/2) Σ_a (∂_μ ε_a)² = (N_I/2) ∫_M d⁴x (∂_μ ε)(∂^μ ε)
```

**Result**: The coefficient in front of (∂_μ ε)² for the single field ε that lives on all N_I channels is **N_I/2**. After gauging (promoting phase to gauge field A_μ), the photon kinetic term has coefficient **N_I/4** in front of F_μν F^μν (N_I copies of (1/4) F²), hence 1/g² = N_I ⇒ g² = 1/N_I [see alpha_mechanism_derivation Option B].

---

## Tags

| Claim | Tag | Note |
|-------|-----|------|
| ε(x) : M → Herm(n_d) ⊕ Herm(n_c) | [DEFINITION] | From tilt_topology_point_emergence |
| S_kin = (κ/2) ∫ Tr[(∂ε)(∂ε)] | [DERIVATION] | Natural kinetic term for Hermitian field |
| Tr[(∂ε)(∂ε)] = Σ_a (∂ε_a)² in orthonormal basis | [DERIVATION] | Linear algebra |
| Equal weight per a | [DERIVATION] | U(n_d)×U(n_c) invariance of Killing form |
| Democratic coefficient N_I/2 | [DERIVATION] | Σ_a (∂ε_a)² = N_I (∂ε_EM)² |
| g² = 1/N_I from gauging | [DERIVATION] | alpha_mechanism_derivation Step 5B |

---

## Cross-References

- [DEF_02B3: Interface Mode Count] — N_I
- [framework/investigations/alpha/alpha_mechanism_derivation.md] — Option B (normalization from kinetic term)
- [framework/investigations/spacetime/tilt_topology_point_emergence.md] — ε(x), dim = 137
- [framework/investigations/gauge/tilt_energy_functional.md] — F(ε) potential; S_kin is gradient part
