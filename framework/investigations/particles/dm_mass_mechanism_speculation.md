# Dark Matter Mass Mechanism: Non-Standard Possibilities

**Status**: INVESTIGATED (S352). Both hypotheses fail. See findings below.
**Created**: S349 (2026-02-09)
**Investigated**: S352 (2026-02-09)
**Dependencies**: dark_matter_identity.md, det_tr_decoupling_analysis.py
**Verification**: `dm_mass_mechanism_investigation.py` (26/26 PASS, S352)

---

## Motivation

The CDM small-scale crisis suggests DM doesn't behave as pure gravitating mass at galaxy scales:

1. **Core-cusp problem**: CDM predicts cuspy NFW profiles; observations show flat cores
2. **Missing satellites**: CDM predicts more dwarfs than observed
3. **Too-big-to-fail**: Predicted subhalos too dense vs observed dwarfs
4. **Diversity problem**: Rotation curves far more varied than simulations predict
5. **Lensing anomalies**: Subhalo lensing stronger than CDM at galaxy+cluster scales

Baryonic feedback partially helps (~20% suppression) but may be insufficient.
MOND disfavored by Gaia Milky Way rotation curve data (2025).
SIDM actively explored but not yet confirmed.

**Framework context**: We showed det(M) gives DM mass from algebraic structure, NOT from Higgs VEV. This opens the door to non-standard mass mechanisms.

---

## Hypothesis A: Gauge Interaction Mimicking Mass [REJECTED, S352]

**Idea**: DM doesn't have rest mass. det(M) sets an interaction coupling, not a rest mass. A residual gauge force from SO(11) -> SO(4) x SO(7) breaking produces gravity-like effects.

### Investigation Result (S352)

**REJECTED** [THEOREM]: SO(11) breaking leaves NO residual dark gauge symmetry.

Full generator accounting of SO(11) (dim=55):
- 28 broken -> pNGBs (4 Higgs + 24 colored) [THEOREM, S335]
- 27 unbroken = SO(4) x SO(7)
  - 12 gauged = SM gauge group (SU(2)_L + U(1)_Y + SU(3)_c)
  - 15 ungauged = GLOBAL symmetries only (not gauge forces)

The 15 ungauged generators include:
- 2 from SU(2)_R minus U(1)_Y (custodial symmetry)
- 6 from G_2 minus SU(3)_c
- 7 from SO(7) minus G_2

These are global symmetries, NOT gauge bosons. They don't mediate forces.

**Additional blocks**:
- All composite resonances (sigma, rho, colored pNGBs) are >> 5 GeV [DERIVATION]
- No light mediator exists in the pNGB or composite spectrum
- Would require [A-IMPORT]: "additional gauge symmetry beyond SM" (adds to IRA count)
- Even if added: N_eff constraints (Planck: 2.99 +/- 0.17) and fifth force limits are severe

**Falsification of rejection**: Find an unbroken gauge generator beyond SM in SO(11) breaking chain

---

## Hypothesis B: Density-Dependent Mass from det-Tr Coupling [QUANTITATIVE FAILURE, S352]

**Idea**: DM couples to the Higgs only through the nonlinear det-Tr relationship. Mass "turns on" collectively at sufficient density.

### Investigation Result (S352)

**QUANTITATIVELY FAILS** [DERIVATION]: The coupling strength is 4 orders of magnitude too weak.

**Mathematical structure** (PROVEN):
```
det(M) = c^4 + c^3*S_1 + c^2*S_2 + c*S_3 + S_4
where S_k = sigma_k(dl_1,...,dl_4)
```

For fluctuations dl_i = h + xi_i with Tr(xi) = 0:
- sigma_2 = 6h^2 - sum(xi_i^2)/2 [THEOREM, S352]
- The density-dependent part is -c^2 * sum(xi^2)/2 [DERIVATION]
- This is NEGATIVE: non-uniform fluctuations REDUCE det(M)

**Effective mass formula** [DERIVATION, S352]:
```
m_eff(rho) = m_DM * [1 - kappa * (rho/rho_0)]
kappa = xi/(2*c^2) = v^2/(2*f^2*c^2) ~ 1.66e-4
```

**Why it fails**:
1. kappa ~ 10^-4 is far too small for observable galaxy-scale effects [DERIVATION]
2. To get kappa ~ O(1), need sigma_xi ~ c/2 (50% perturbations) [DERIVATION]
3. This is outside the perturbative regime -- expansion breaks down
4. Non-perturbative 't Hooft analogy gives m_det ~ sqrt(n_d)*f ~ 2700 GeV [DERIVATION]
   - Wrong scale entirely (not 5 GeV)
5. Chameleon/symmetron models need tunable parameters (2+); framework has 0

| Feature | Chameleon | Symmetron | det-Tr (ours) |
|---------|-----------|-----------|---------------|
| Free parameters | 2+ | 2+ | 0 |
| Effect size | Tunable | Tunable | Fixed ~10^-4 |
| Origin | Ad hoc | Ad hoc | Algebraic |
| Sufficient? | Yes | Yes | No |

**Falsification of failure**: Find a non-perturbative mechanism giving kappa ~ O(1) from the composite sector.

---

## Observational Consistency (both hypotheses moot)

| Constraint | Status |
|-----------|--------|
| Bullet Cluster (sigma/m < 1 cm^2/g) | Trivially satisfied (no self-interaction) |
| Equivalence principle | No violation (kappa ~ 10^-4) |
| CMB/BAO | Consistent (standard CDM-like behavior) |
| N_eff (Planck: 2.99 +/- 0.17) | No new light species |
| BBN | 5.11 GeV > 2 GeV lower bound for ADM |

---

## What Survives

The det(M) mass formula works best as a **standard asymmetric DM prediction** [DERIVATION]:
- m_DM = m_e * (n_c-1)^n_d = 5.11 GeV
- m_DM / m_p = 5.446 vs Omega_c/Omega_b = 5.376 (1.3%, 1.0 sigma)
- Carrier particle: UNKNOWN [OPEN]

The framework does NOT naturally address the CDM small-scale crisis. This would require new physics (SIDM, warm DM, etc.) beyond current axioms.

---

## Conclusion and Recommendations (S352)

**Neither hypothesis resolves the DM mass mechanism problem.** Both are structurally blocked:
- Hyp A by the absence of dark gauge symmetry in the SO(11) breaking pattern
- Hyp B by the quantitative weakness of the det-Tr nonlinear coupling

**The genuine open problem remains identifying the CARRIER PARTICLE.** Most promising directions:
1. **nu_R from spinor** [SPECULATION]: Gauge singlet, exists in framework, but needs mass mechanism connecting det(M) scale to nu_R Dirac mass
2. **Non-perturbative condensate** [SPECULATION]: 't Hooft-like, but gives wrong scale (~2700 GeV)
3. **Accept as orphan prediction** [POSSIBLE]: Mass formula correct, carrier unknown indefinitely

**Import count**: Both hypotheses would have required new [A-IMPORT] values. The framework as-is does not provide a DM mass mechanism -- only a mass SCALE.

---

## Eigenvalue Landscape Analysis (S352)

**Verification**: `grassmannian_eigenvalue_landscape.py` (23/23 PASS)

Five mathematically significant structures on the eigenvalue space of End(R^4):

### 1. AM-GM Maximum [THEOREM]
det(M) is maximized at the democratic vacuum on any Tr = const surface. For trace-preserving perturbation lambda = (c+a, c+b, c-a, c-b): det = c^4 - c^2(a^2+b^2) + a^2*b^2. Leading correction is negative. Mass scale is maximal at equilibrium.

### 2. Vandermonde Repulsion [THEOREM]
Vandermonde V = prod_{i<j}(lambda_i - lambda_j) vanishes at the democratic vacuum. The eigenvalue measure includes |V|^beta, producing an entropic repulsion that pushes eigenvalues apart. Competition with confining potential gives a Wigner semicircle-like distribution. **Key connection**: Dyson's threefold way matches division algebra dimensions: R->beta=1, C->beta=2, H->beta=4. The quaternionic structure of spacetime gives strong level repulsion.

### 3. det = 0 Phase Boundary [THEOREM]
Codimension-1 locus at distance c = 10 (in eigenvalue units) from democratic vacuum. One eigenvalue must go to zero -- a 100% perturbation. The boundary is far from the physical vacuum.

### 4. Unique Morse Critical Point [THEOREM]
log(det) has exactly one critical point on the Tr-const simplex: the democratic vacuum (Morse index 3, a maximum). No saddle points, no local minima. The mass scale is topologically protected.

### 5. RMT Fluctuation Corrections [DERIVATION]
Quantum/thermal dressing: <D_4> = 1 - (n_d-1)/(2*beta*c^2) * T_eff. For physical parameters: correction < 0.05% (GOE) or < 0.013% (GSE). The mass formula is robust.

### Democracy Index [DERIVATION]
D_k = e_k / [C(n,k) * (e_1/n)^k] measures departure from democracy. D_k = 1 at democracy, D_k < 1 away. Maclaurin chain: D_2 >= D_3 >= D_4. Higher-order invariants are MORE sensitive to departures. D_4 = det/(Tr/4)^4 is the natural order parameter.

### Conclusion
The eigenvalue landscape is **simple** (one extremum), **stable** (topologically protected), and **rigid** (tiny fluctuation corrections). The framework predicts standard CDM with a specific mass, not exotic density-dependent DM. The carrier problem is a particle physics question, not a cosmology question.

---

## Dyson-Division Algebra Correspondence (S352)

**Verification**: `dyson_division_algebra_correspondence.py` (35/35 PASS)

### End(R^4) Decomposition [THEOREM]
Under SU(2)_L x SU(2)_R: End(R^4) = (1,1) + (3,1) + (1,3) + (3,3) = 1+3+3+9 = 16.
- (1,1) = span{I} = trace/Higgs mode
- (3,1) = span{L_i, L_j, L_k} = left-quaternionic (SU(2)_L adjoint)
- (1,3) = span{R_i, R_j, R_k} = right-quaternionic (SU(2)_R adjoint)
- (3,3) = mixed = 9 dim

Quaternionic-linear subspace: End_H(H) = (1,1) + (3,1) = 4 dim = eigenvalue sector.

### Quaternionic Eigenvalue Theorem [THEOREM]
char poly of L_q = (t^2 - 2Re(q)t + |q|^2)^2. Real eigenvalues ONLY for q in R. The democratic vacuum is the ONLY quaternionic-linear configuration with real eigenvalues.

### (1,3) Antisymmetry [THEOREM]
R_i, R_j, R_k are antisymmetric matrices. The (1,3) perturbation M = cI + eps*(alpha R_i + beta R_j + gamma R_k) has char poly (t^2 - 2ct + c^2 + eps^2|v|^2)^2 with eigenvalues c +/- i*eps*r (COMPLEX). The quaternionic structure blocks real eigenvalue splitting from these modes.

### Kramers Enhancement [DERIVATION]
SU(2)_L gauge symmetry forces Kramers degeneracy: eigenvalues in pairs with multiplicity m=2. The inter-pair Vandermonde exponent is beta_base * m^2 = 1 * 4 = 4, matching GSE. This is EXACT because SU(2)_L is gauged. Mass formula stability: D_4 correction suppressed by 1/4.

### Octonionic Sector [DERIVATION]
G_2 = Aut(O) on R^7: under SU(3) subset G_2, R^7 = 1 + 3 + 3bar. Eigenvalue multiplicities 1+3+3. Effective beta for 3-3bar channel: beta * 3 * 3 = 9.

### beta_eff = m^2 Pattern [CONJECTURE]
beta_eff = (dim of fundamental color rep)^2:
- R^1: m=1, beta_eff=1 (trivial)
- R^4=H: m=2 (SU(2) fund), beta_eff=4
- R^7~Im(O): m=3 (SU(3) fund), beta_eff=9
- Pattern terminates at SU(3) -- matches real-world color group

---

## Sources (Observational Context)

- [Cold dark matter: Controversies on small scales (PNAS)](https://www.pnas.org/doi/10.1073/pnas.1308716112)
- [Small Scale Problems of LCDM: A Short Review](https://www.mdpi.com/2075-4434/5/1/17)
- [Milky Way rotation curve confirms DM, disfavors MOND (2025)](https://www.irap.omp.eu/en/2025/10/the-rotation-curve-of-the-milky-way-confirms-the-existence-of-dark-matter/)
- [DARKSKIES: SIDM cluster simulations (2025)](https://www.aanda.org/articles/aa/full_html/2025/11/aa55180-25/aa55180-25.html)
- [AIDA-TNG: Galaxy formation in alternative DM models (2025)](https://www.aanda.org/articles/aa/full_html/2025/05/aa53836-25/aa53836-25.html)
- [Confronting the Diversity Problem (2024)](https://arxiv.org/html/2404.16247v1)
- [SIDM mass segregation: unified explanation (2025)](https://arxiv.org/html/2506.14898)
- [Baryonic feedback evidence at low redshifts (2024)](https://arxiv.org/abs/2407.07152)
- [DM self-interaction cross-section via ML (2026)](https://www.aanda.org/articles/aa/full_html/2026/01/aa56629-25/aa56629-25.html)
