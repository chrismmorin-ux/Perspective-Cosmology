# Hadron Formation Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 227)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C12: Hadronization & Confinement)
**Layer**: Mixed (Layer 1 mode counting + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **mostly [STANDARD-RELABELED]**. The framework's contribution to hadron physics is primarily through the derived color factor N_c = Im_H = 3 (which constrains color singlet formation) and the conjectured string tension sqrt(sigma) = 8*m_p/17 = 441.5 MeV [CONJECTURE, HRS=6]. Individual hadron masses, lifetimes, and decay properties are standard QCD results described in crystallization language. The framework does NOT derive the hadron mass spectrum from first principles.

---

## Processes

### Pion Formation (Lightest Meson)

**Chain**: C12(qq confinement) + C2(chiral symmetry breaking) -> pi as pseudo-Goldstone
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before -> After**:
- Physical: Quark-antiquark pair confined into lightest meson (u-dbar for pi+, etc.)
- Tilt: O-channel tilt binds q-qbar into color singlet; chiral symmetry breaking (C2) makes pion anomalously light

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement: binds q-qbar into color singlet | N_c^2 - 1 = 8 gluon exchange |
| H (Weak) | Pion decay: pi+ -> mu+ nu_mu | V_ud in CKM |
| C (EM) | pi0 -> gamma gamma (anomaly decay) | 2 photon final state |
| R (Gravity) | Negligible | -- |

**Color Singlet Requirement**:
- Meson = q + qbar: color representation 3 x 3bar = 1 + 8
- Singlet (1) extracted: requires N_c = Im_H = 3 [DERIVATION]
- The 8 (adjoint) modes are the gluon field binding them

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_pi+/- | Not derived | 139.570 MeV | -- | PDG 2024 |
| m_pi0 | Not derived | 134.977 MeV | -- | PDG 2024 |
| m_pi+ - m_pi0 | Not derived (EM splitting) | 4.594 MeV | -- | PDG 2024 |
| f_pi | Not derived | 130.2(8) MeV | -- | FLAG 2024 |
| tau_pi+ | Not derived | 26.033 ns | -- | PDG 2024 |
| pi0 -> gg anomaly factor | N_c^2 * alpha^2 / pi^2 uses N_c = 3 | Confirmed | -- | [FRAMEWORK-CONSTRAINED] |

**What framework adds**: N_c = Im_H = 3 enters the chiral anomaly coefficient for pi0 -> gamma gamma (the ABJ anomaly amplitude is proportional to N_c). The prediction Gamma(pi0->gg) ~ N_c^2 is confirmed experimentally and was historically used to verify N_c = 3. The framework derives N_c rather than assuming it.
**What is imported**: Chiral perturbation theory [A-IMPORT], quark masses m_u, m_d [A-IMPORT], f_pi [A-IMPORT], QCD dynamics
**Verification**: `hadron_mass_crystallization.py` (N_c color singlet tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_c in anomaly; [STANDARD-RELABELED] for mass and decay dynamics

**Goldstone nature**: m_pi^2 ~ m_q * Lambda_QCD (GMOR relation). The pion is light because it is the pseudo-Goldstone boson of chiral symmetry breaking. The framework identifies this as C2 (symmetry breaking in the O-channel), but does not derive the specific mass.

---

### Kaon Formation (Strange Mesons)

**Chain**: C12(qs confinement) -> K as pseudo-Goldstone with explicit s-quark mass breaking
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Strange-quark + light antiquark confined into kaon (us-bar for K+, etc.)
- Tilt: O-channel binds q-sbar into color singlet; explicit chiral breaking from m_s >> m_u,d

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement: same as pion but with heavier strange quark | 8 gluon exchange |
| H (Weak) | Kaon decays: strangeness-changing (Delta S = 1) | V_us in CKM |
| C (EM) | EM corrections to K+/K0 mass splitting | Small |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_K+/- | Not derived | 493.677 MeV | -- | PDG 2024 |
| m_K0 | Not derived | 497.611 MeV | -- | PDG 2024 |
| f_K/f_pi | Not derived | 1.1932(19) | -- | FLAG 2024 |
| tau_K+ | Not derived | 12.380 ns | -- | PDG 2024 |
| epsilon_K (CP violation) | Not derived | 2.228(11) x 10^-3 | -- | PDG 2024 |

**What framework adds**: Same N_c = 3 color singlet requirement as pion. No additional framework content specific to kaons.
**What is imported**: m_s [A-IMPORT], CKM matrix elements V_us [A-IMPORT], CP violation parameters [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (color singlet tests)
**Confidence**: [STANDARD-RELABELED] — standard QCD in crystallization language

---

### Proton and Neutron (Lightest Baryons)

**Chain**: C12(qqq confinement) -> color singlet baryon
**Tag**: [FRAMEWORK-CONSTRAINED] (with [CONJECTURE] mass prediction)

**Before -> After**:
- Physical: Three quarks confined into lightest baryons (uud = proton, udd = neutron)
- Tilt: O-channel tilt binds 3 quarks into color singlet; baryon mass dominated by QCD binding energy

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement: binds 3 quarks into color singlet | N_c^2 - 1 = 8 gluon exchange |
| H (Weak) | Neutron beta decay: n -> p + e- + nu_bar_e | V_ud; tau_n = 878.4 s |
| C (EM) | Proton charge; p-n mass splitting (partial) | Coulomb energy |
| R (Gravity) | Negligible for particle physics; dominant for astrophysics | -- |

**Color Singlet Requirement**:
- Baryon = q + q + q: color representation 3 x 3 x 3 = 1 + 8 + 8 + 10
- Singlet (1) requires exactly N_c = Im_H = 3 quarks [DERIVATION]
- Antisymmetric epsilon_{abc} contracts 3 color indices -> singlet
- This is specific to SU(3): SU(2) would need 2 quarks, SU(4) would need 4

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_p | (1836 + 11/72) * m_e = 938.244 MeV | 938.272 MeV | 30 ppm | [CONJECTURE] |
| m_p/m_e | 1836 + 11/72 = 1836.1528 | 1836.1527 | 0.06 ppm | [CONJECTURE, Tier 1] |
| m_n - m_p | Not derived | 1.2934 MeV | -- | PDG 2024 |
| m_p/sqrt(sigma) | 17/8 = 2.125 | ~2.13 (from sigma~440 MeV) | ~0.4% | [CONJECTURE, HRS=6] |
| tau_n | Not derived | 878.4(5) s | -- | PDG 2024 |
| mu_p/mu_N | Not derived | 2.7928 | -- | PDG 2024 |
| r_p (charge radius) | Not derived | 0.8414(19) fm | -- | PDG 2024 |

**What framework adds**:
1. **N_c = Im_H = 3** determines that baryons require exactly 3 quarks [DERIVATION]
2. **m_p/m_e = 1836 + 11/72** is the framework's mass ratio prediction [CONJECTURE, Tier 1, 0.06 ppm]. Decomposition: 12 x 153 + 11/72, where 12 = dim(SM gauge group), 153 = Im_H^2 x 17 = T(17).
3. **sqrt(sigma) = 8*m_p/17** conjectures string tension from proton mass [CONJECTURE, HRS=6]. Note: this uses m_p as INPUT, not as a derivation of m_p.
**What is imported**: m_e [A-IMPORT], QCD dynamics [A-IMPORT], quark masses [A-IMPORT], G_F for neutron lifetime [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (m_p/m_e test, string tension test, color singlet tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_c; [CONJECTURE] for m_p/m_e and string tension

**Honest note on m_p/m_e**: The 0.06 ppm match is striking, but the formula 12 x 153 + 11/72 contains multiple components whose derivation chain includes gaps. The number 153 appears in both QCD beta function and proton mass (structural connection), but the factor 12 and the correction 11/72 are pattern-matched, not derived from axioms.

---

### Delta Baryons (Spin-3/2 Resonances)

**Chain**: C12(qqq confinement, spin-aligned) -> Delta(1232) resonance -> C10(strong decay)
**Tag**: [STANDARD-RELABELED]

**Before -> After**:
- Physical: Three light quarks in spin-3/2, isospin-3/2 state -> resonance at 1232 MeV
- Tilt: O-channel binding with all quark spins aligned; unstable (decays via O-channel to N + pi)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement + decay: Delta -> N + pi | Strong decay, Gamma ~ 117 MeV |
| H (Weak) | Not relevant (Delta decays strongly) | -- |
| C (EM) | EM transition Delta -> N + gamma (small BR) | M1 transition |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_Delta | Not derived | 1232(1) MeV | -- | PDG 2024 |
| Gamma_Delta | Not derived | 117(3) MeV | -- | PDG 2024 |
| m_Delta - m_N | Not derived | 293 MeV | -- | PDG 2024 |
| Quark content | N_c = 3 quarks [DERIVATION] | Confirmed | -- | -- |

**What framework adds**: Same N_c = 3 color singlet requirement. The Delta-nucleon mass splitting (~293 MeV) is a QCD hyperfine effect driven by color-magnetic interaction proportional to alpha_s/m_q. Framework does not predict this splitting.
**What is imported**: Quark spin-flavor wavefunctions [A-IMPORT], QCD hyperfine splitting mechanism [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (color singlet tests)
**Confidence**: [STANDARD-RELABELED] — standard baryon spectroscopy in crystallization language

---

### J/psi (Charmonium)

**Chain**: C12(cc-bar confinement) -> non-relativistic bound state (heavy quarkonium)
**Tag**: [FRAMEWORK-CONSTRAINED] (via N_c in R-ratio and OZI suppression)

**Before -> After**:
- Physical: Charm-anticharm pair forms bound state at 3097 MeV
- Tilt: O-channel binds cc-bar; heavy quark mass allows non-relativistic treatment (Coulomb-like + linear potential)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement: Cornell potential V(r) = -4alpha_s/(3r) + sigma*r | C_F = 4/3 from N_c = 3 |
| H (Weak) | Negligible for formation | -- |
| C (EM) | J/psi -> e+e- (leptonic decay); J/psi -> gamma + hadrons | Significant |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_J/psi | Not derived | 3096.900(6) MeV | -- | PDG 2024 |
| Gamma_J/psi | Not derived | 92.6(1.7) keV | -- | PDG 2024 |
| Gamma(J/psi->e+e-) | Uses alpha^2/m_c^2 * N_c [CONSTRAINED] | 5.53(10) keV | -- | PDG 2024 |
| R at J/psi | N_c contribution to R-ratio | Step at 2m_c | -- | BES |
| OZI suppression factor | ~ (alpha_s)^3 from 3-gluon exchange | Narrow width confirmed | -- | [STANDARD-RELABELED] |

**What framework adds**: The Cornell potential V(r) = -C_F * alpha_s/r + sigma*r uses C_F = (N_c^2-1)/(2*N_c) = 4/3 with N_c = Im_H = 3 [DERIVATION]. The string tension sigma encodes O-channel confinement. The leptonic width Gamma(ee) ~ alpha^2 * |psi(0)|^2 / m_c^2 involves N_c as a color factor. OZI suppression (narrow width despite being above open charm threshold in excited states) arises from the N_c-dependent gluon exchange topology.
**What is imported**: m_c = 1.27 GeV [A-IMPORT], alpha_s(m_c) [A-IMPORT], potential model details [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (C_F = 4/3 test, color factor tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_c in color factors; [STANDARD-RELABELED] for spectrum details

---

### Upsilon (Bottomonium)

**Chain**: C12(bb-bar confinement) -> non-relativistic bound state (heavy quarkonium)
**Tag**: [FRAMEWORK-CONSTRAINED] (via N_c in Cornell potential)

**Before -> After**:
- Physical: Bottom-antibottom pair forms bound state at 9460 MeV
- Tilt: O-channel binds bb-bar; even more non-relativistic than charmonium (m_b >> Lambda_QCD)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| O (Strong) | Confinement: Cornell potential, dominant for bb-bar | C_F = 4/3; sigma ~ (441 MeV)^2 |
| H (Weak) | Negligible for formation; relevant for B-meson decays | -- |
| C (EM) | Upsilon -> e+e- (leptonic decay) | alpha^2 coupling |
| R (Gravity) | Negligible | -- |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| m_Upsilon(1S) | Not derived | 9460.30(26) MeV | -- | PDG 2024 |
| Gamma_Upsilon(1S) | Not derived | 54.02(1.25) keV | -- | PDG 2024 |
| Gamma(Upsilon->e+e-) | Uses N_c in color factor | 1.340(18) keV | -- | PDG 2024 |
| Level splittings | Not derived (use Cornell potential) | Well measured | -- | PDG 2024 |

**What framework adds**: Same as J/psi — Cornell potential with C_F = 4/3 from N_c = Im_H = 3, plus sigma from O-channel. The Upsilon system is a cleaner test of the potential because m_b >> m_c makes relativistic corrections smaller.
**What is imported**: m_b = 4.18 GeV [A-IMPORT], alpha_s(m_b) [A-IMPORT], non-perturbative potential shape [A-IMPORT]
**Verification**: `hadron_mass_crystallization.py` (C_F test, N_c color factor tests)
**Confidence**: [FRAMEWORK-CONSTRAINED] for N_c in potential; [STANDARD-RELABELED] for spectrum

**Lattice comparison**: Bottomonium spectroscopy is one of lattice QCD's most precise predictions. The framework does not improve on these calculations — it only identifies N_c = 3 as a derived quantity rather than an input.

---

## Summary

| Process | Tag | Framework Content | Key Tests | Scripts |
|---------|-----|-------------------|-----------|---------|
| Pion | [FRAMEWORK-CONSTRAINED] | N_c in pi0->gg anomaly | ABJ anomaly factor | `hadron_mass_crystallization.py` |
| Kaon | [STANDARD-RELABELED] | N_c color singlet only | -- | `hadron_mass_crystallization.py` |
| Proton/Neutron | [FRAMEWORK-CONSTRAINED] | N_c = 3 quarks; m_p/m_e; sqrt(sigma) | m_p/m_e 0.06 ppm | `hadron_mass_crystallization.py` |
| Delta | [STANDARD-RELABELED] | N_c color singlet only | -- | `hadron_mass_crystallization.py` |
| J/psi | [FRAMEWORK-CONSTRAINED] | N_c in C_F = 4/3 (Cornell) | Potential, leptonic width | `hadron_mass_crystallization.py` |
| Upsilon | [FRAMEWORK-CONSTRAINED] | N_c in C_F = 4/3 (Cornell) | Potential, leptonic width | `hadron_mass_crystallization.py` |

**Honest count**: 4/6 entries [FRAMEWORK-CONSTRAINED], 2/6 [STANDARD-RELABELED]. All framework content ultimately traces to the single derived quantity N_c = Im_H = 3, plus the conjectured m_p/m_e ratio and string tension. No hadron masses are derived from first principles.

**Total verification**: Tests in `hadron_mass_crystallization.py` covering m_p/m_e, string tension, color singlet structure, and color factors.

---

## Cross-References

- QCD string tension analysis: `verification/sympy/qcd_string_tension_from_framework.py`
- String tension derivation attempt: `verification/sympy/qcd_string_tension_derivation.py`
- R-ratio (mode counting): `framework/crystallization_processes/scattering/strong_scattering.md`
- Color structure (C2): `framework/CRYSTALLIZATION_CATALOG.md` (C2)
- Confinement (C6): `framework/CRYSTALLIZATION_CATALOG.md` (C6)
- Hadronization type (C12): `framework/CRYSTALLIZATION_CATALOG.md` (C12)
- PDG data: `framework/crystallization_processes/data/pdg_particles.md`
- Lattice QCD data: `framework/crystallization_processes/data/lattice_qcd.md`

---

*Created: 2026-02-03 (S227)*
