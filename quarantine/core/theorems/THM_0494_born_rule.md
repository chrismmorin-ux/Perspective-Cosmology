# THM_0494: Born Rule from Crystallization

**Status**: SKETCH → DERIVATION (CR-035 resolved Session 169, uniqueness + robustness Session 173)
**Layer**: 1
**Created**: Session 134, formalized Session 144, noise gap closed Session 169, uniqueness proven Session 173

---

## Statement

The Born rule P(k) = |c_k|^2 emerges from crystallization dynamics:

```
Given: state |psi> = sum_k c_k |k> in crystallization potential W(epsilon)
Then: collapse probability to eigenstate |k> equals |c_k|^2
```

## Proof

### Given
- THM_0491: V_pi is Hilbert space (C^n)
- THM_0493: Evolution is unitary (d|psi> = i dH |psi>)
- AXM_0117: Crystallization tendency (W = -a|epsilon|^2 + b|epsilon|^4)
- AXM_0112: Crystal symmetry (SO(n_c) symmetric noise)

### Derivation

**Step 1** [D from AXM_0117]: W is CONSTANT on the pure state manifold.
  Tr(rho^2) = 1 for all pure states, so W = -a + b = const.
  Therefore dW/dp_k = 0: **zero potential drift** for populations p_k = |c_k|^2.

**Step 2** [D from THM_0493]: Norm-preserving perturbations have the form d|psi> = i dH |psi> where dH is Hermitian. This is the unique structure consistent with unitary evolution.

**Step 3** [D from AXM_0112 + I-MATH]: Crystal symmetry forces noise to be phase-symmetric:
  - E[dH_{jk}] = 0 (zero mean)
  - E[|Re(dH_{jk})|^2] = E[|Im(dH_{jk})|^2] = sigma^2 (equal variance)
  - E[Re(dH_{jk}) * Im(dH_{jk})] = 0 (independent real/imaginary parts)

**Step 4** [I-MATH]: Perturbation analysis. Population change from off-diagonal terms:
  dp_k = -2 * sum_{j != k} Im(dH_{jk} * c_k* * c_j)
  Diagonal elements dH_{kk} contribute ZERO to dp_k (pure phase rotation: 2*p*Re(i*h) = 0).

**Step 5** [D from Steps 1-4]: Combining zero drift with phase-symmetric noise:
  - E[dp_k] = 0  (**zero drift** — populations are martingales)
  - Var(dp_k) = 4*sigma^2 * p_k*(1-p_k)  (**Wright-Fisher noise**)
  - Cov(dp_j, dp_k) = -4*sigma^2 * p_j*p_k  for j != k

  The noise sigma^2(p) = p(1-p) is DERIVED, not assumed. It follows from:
  (a) Norm preservation (Hermitian dH)
  (b) Phase symmetry (crystal symmetry AXM_0112)
  (c) Only off-diagonal elements contribute (diagonal = phase rotation)

**Step 6** [I-MATH]: dp_k = sqrt(p_k(1-p_k)) dB_k is a bounded martingale on [0,1].
  Absorbing boundaries at p_k = 0 and p_k = 1 (pure states).

**Step 7** [I-MATH]: By the optional stopping theorem: E[p_k(T)] = p_k(0) = |c_k|^2.
  Since p_k(T) in {0, 1}: P(p_k(T) = 1) = p_k(0) = |c_k|^2.

**Step 8** [D]: P(collapse to |k>) = |c_k|^2. **This is the Born rule.**

### Three-Layer Derivation Structure

| Layer | Result | Session | Script |
|-------|--------|---------|--------|
| **Existence** | WF noise arises from Hermitian perturbation + phase symmetry | S169 | `wright_fisher_from_geometry.py` (11/11 PASS) |
| **Uniqueness** | WF is the ONLY face-invariant exchangeable degree-2 diffusion on the simplex | S173 | `wf_uniqueness_born_rule.py` (37/37 PASS) |
| **Robustness** | Born rule holds for ANY noise amplitude h(p), not just WF-specific | S173 | `wf_uniqueness_born_rule.py` (37/37 PASS) |

**Uniqueness Theorem** [D from AXM_0110 + AXM_0112 + I-MATH]:
The most general degree-2 covariance on the n-simplex has 8 free parameters (3 diagonal, 5 off-diagonal). Exchangeability reduces to 3; the simplex constraint sum_k dp_k = 0 reduces to 2 (C, D). Face invariance (AXM_0110: when p_k = 0, component k decouples) forces D = 0. The surviving one-parameter family is Sigma_{ij} = C * p_i(delta_{ij} - p_j), which is Wright-Fisher up to overall scale.

**Robustness Theorem** [I-MATH]:
For any zero-drift diffusion dp_k = h(p_k) dB_k with absorbing faces, the exit probability u(p) = p satisfies the backward Kolmogorov equation regardless of h(p). This follows because u'' = 0 has solution u(p) = p for any diffusion coefficient. The Born rule therefore holds for the entire family of face-invariant exchangeable diffusions, not just the specific WF covariance.

**Degree-3 corrections** [I-MATH]:
A face-invariant exchangeable degree-3 covariance exists: Sigma_{ii}^(3) = eps * p_i(2p_i^2 - p_i - s_2), Sigma_{ij}^(3) = eps * p_i p_j(p_i + p_j). This correction does NOT affect the Born rule (robustness theorem applies).

### Gaps Resolved
- ~~Noise model sigma^2 = p(1-p) is physically motivated but not rigorously derived from axioms~~ **RESOLVED Session 169**: Derived from THM_0493 + AXM_0112 via perturbation analysis.
- ~~Uniqueness: is WF the only possibility?~~ **RESOLVED Session 173**: WF is the unique degree-2 face-invariant exchangeable covariance on the simplex (up to scale).
- ~~Robustness: does the Born rule depend on the specific noise form?~~ **RESOLVED Session 173**: Born rule holds for ANY noise amplitude via u'' = 0 argument.

### Remaining Gap
- ~~THM_0491 (Hilbert space) and THM_0493 (unitary evolution) are themselves SKETCH status.~~ **RESOLVED Session 172+**: THM_0491 promoted to CANONICAL (proof complete). THM_0493 promoted to DERIVATION (CR-037 continuity gap resolved via automatic continuity in finite dimensions). Script `hilbert_unitary_chain.py` (18/18 PASS).
- **ℏ value**: The Schrödinger equation form is derived; the constant ℏ is empirical [A-IMPORT].
- **Norm = probability**: The identification ||ψ||² = probability is [A-PHYSICAL], not derived.

## Geometric Insight

The Wright-Fisher noise sigma^2 = p(1-p) is proportional to the Fubini-Study inverse metric g^{pp} = 4p(1-p). This means: the noise "knows about" the geometry of state space. It is the unique diffusion that respects the natural metric on CP^{n-1}.

The Born rule probabilities are determined by the GEOMETRY of Hilbert space, not by an independent postulate.

## Dependencies

| Dependency | Type | Role |
|-----------|------|------|
| THM_0491 | [D] | V_pi is Hilbert space |
| THM_0493 | [D] | Unitary evolution (norm-preserving perturbations) |
| AXM_0117 | [A-AXIOM] | Crystallization tendency (W = const on pure states) |
| AXM_0112 | [A-AXIOM] | Crystal symmetry (exchangeability of noise) |
| AXM_0110 | [A-AXIOM] | Perfect orthogonality (face invariance: decoupling at p_k=0) |
| Perturbation theory | [I-MATH] | dp_k formula from Hermitian perturbation |
| Optional stopping theorem | [I-MATH] | E[p_k(T)] = p_k(0) |
| Backward Kolmogorov eq | [I-MATH] | Robustness: u''=0 for any diffusion coefficient |

## Verification

**Script 1**: `verification/sympy/born_rule_from_crystallization.py` -- 12/12 PASS (original, Session 134)
**Script 2**: `verification/sympy/wright_fisher_from_geometry.py` -- 11/11 PASS (noise existence, Session 169)
**Script 3**: `verification/sympy/wf_uniqueness_born_rule.py` -- 37/37 PASS (uniqueness + robustness, Session 173)

## Implications

> **[LAYER 2/3 CORRESPONDENCE]**: Physical interpretation requires Layer 2 correspondence rules. The stochastic dynamics is Layer 1; identification with quantum measurement is Layer 2/3.

- [LAYER 1] Absorbing boundaries of Wright-Fisher diffusion yield P(exit at k) = initial population p_k(0)
- [LAYER 1] Wright-Fisher noise derived from geometry: sigma^2 = p(1-p) from THM_0493 + AXM_0112
- [LAYER 2/3] Born rule P(k) = |c_k|^2 identified with collapse probability [A-PHYSICAL]
- [LAYER 2/3] Measurement = crystallization to pure state [A-PHYSICAL]

## Assumption Classification (Session 185 Audit)

| Component | Classification | Notes |
|-----------|---------------|-------|
| V_π is Hilbert space | [D] from THM_0491 | CANONICAL |
| Unitary evolution | [D] from THM_0493 | DERIVATION (continuous s is [A-STRUCTURAL]) |
| Crystallization tendency | [A-AXIOM] AXM_0117 | W = const on pure states → zero drift |
| Crystal symmetry → phase symmetry | [A-AXIOM] AXM_0112 | Forces exchangeable noise |
| Perfect orthogonality → face invariance | [A-AXIOM] AXM_0110 | p_k = 0 → component k decouples |
| WF noise form | [D] from Steps 1-5 | Derived, not assumed (S169) |
| WF uniqueness | [D] from AXM_0110 + AXM_0112 | Unique degree-2 face-invariant exchangeable covariance (S173) |
| Born rule robustness | [I-MATH] | u'' = 0 solution u(p) = p for any h(p) |
| Optional stopping theorem | [I-MATH] | E[p_k(T)] = p_k(0) for bounded martingale |
| Norm = probability | [A-PHYSICAL] | Layer 2 correspondence: ||ψ||² identified with probability |
| Measurement = crystallization | [A-PHYSICAL] | Layer 2 correspondence: collapse = reaching absorbing boundary |

### Honest Assessment (Session 185)

**Status: DERIVATION — at ceiling.** Cannot promote to CANONICAL because:

1. **Depends on THM_0493** (DERIVATION), which has the continuous parameter s gap.
2. **Norm = probability** is [A-PHYSICAL] — a Layer 2 correspondence rule.
3. **Measurement = crystallization** is [A-PHYSICAL] — interpretive identification.

**What IS at THEOREM level** (purely mathematical content):
- Given a finite-dimensional Hilbert space with unitary evolution and crystallization noise satisfying AXM_0112 + AXM_0110, the population dynamics is Wright-Fisher (PROVEN, S169).
- WF is the unique such diffusion (PROVEN, S173).
- Exit probability equals initial population for ANY zero-drift bounded diffusion (PROVEN, S173).
- Therefore P(exit at k) = p_k(0) = |c_k|² (PROVEN).

The mathematical derivation is complete and robust. The DERIVATION classification reflects the upstream structural assumptions (continuous s from THM_0493) and Layer 2 physical identifications, not mathematical gaps in the Born rule proof itself.

**This is the framework's strongest QM result**: existence (derived), uniqueness (proven), robustness (proven), with explicit dependency chain and 60/60 PASS across 3 scripts.

## Source

`framework/investigations/crystallization/crystallization_dynamics.md` (Session 134)
`verification/sympy/wright_fisher_from_geometry.py` (Session 169 — noise existence)
`verification/sympy/wf_uniqueness_born_rule.py` (Session 173 — uniqueness + robustness)
