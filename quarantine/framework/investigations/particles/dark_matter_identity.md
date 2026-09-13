# Dark Matter Identity Investigation

**Status**: ACTIVE (Sessions S315-S339)
**Confidence**: Mass formula [DERIVATION], Omega ratio [CONJECTURE], Carrier: UNKNOWN
**Verification**: `dm_identity_revision.py` (34/34 PASS, S335), `det_tr_decoupling_analysis.py` (32/32 PASS, S339), `dm_candidate_systematic_survey.py` (S339), `dm_mass_mechanism_investigation.py` (26/26 PASS, S352)
**Last Updated**: 2026-02-09 (S352)

---

## The Problem

The framework derives a dark matter mass from structural invariants:

```
m_DM = m_e * (n_c - 1)^n_d = 0.511 MeV * 10000 = 5.11 GeV
```

And predicts a density ratio:

```
m_DM / m_p = 5.446  vs  Omega_c / Omega_b = 5.376  (1.3%, 1.3 sigma)
```

**But it cannot identify which particle carries this mass.** The mass formula comes from det(M) on End(R^{n_d}), which is a degree-n_d invariant of the coupling matrix M = (n_c-1)*I_{n_d}. This determines a mass *scale*, not a particle.

---

## What Survives

| Result | Status | Origin | Confidence |
|--------|--------|--------|-----------|
| m_DM = 5.11 GeV | SURVIVES | det(M) on End(R^4), S315 | [DERIVATION] |
| Omega ratio 1.3% | SURVIVES | Mass-based, identity-independent | [CONJECTURE] |
| Asymmetric DM scenario | SURVIVES | From Omega ratio matching | [CONJECTURE] |
| All 28 pNGBs identified | CONFIRMED | 4 Higgs + 24 colored, S335/S339 | [THEOREM] |

---

## Retraction History

| Session | Claim | Reason for Retraction |
|---------|-------|-----------------------|
| S317 | sigma_SI = 0 from G_2 singlet | G_2 singlet = Higgs, not DM (S335) |
| S319 | 8 dark states from spinor | SU(3) = color, not generation (S320) |
| S320 | SO(14) "4th dark generation" | 0 dark states from spinor decomposition |
| S322 | DM = pNGB color singlet | pNGB singlet = Higgs doublet (S335) |
| S335 | det-Tr "different S_4 characters" | Wrong group action (S339): row perm, not conjugation |
| S335 | det(M) mode as DM particle | Not an independent DOF; all 28 pNGBs accounted for (S339) |
| S335 | det-Tr orthogonality as sigma_SI | delta(det) = c^3 * delta(Tr) at first order (S339) |

---

## Full DOF Accounting

### pNGB Sector (28 DOFs)

| DOFs | Under G_2 -> SU(3) | Physical Identity | Status |
|------|---------------------|-------------------|--------|
| 4 | Color singlets (4 x "1" from R^7 = 3+3bar+1) | Higgs doublet: 3 eaten (W+,W-,Z) + 1 Higgs (125 GeV) | IDENTIFIED |
| 24 | Colored (4 x (3+3bar)) | Scalar leptoquarks + diquarks (~1.76 TeV) | IDENTIFIED |
| **28** | | **All accounted for** | **COMPLETE** |

### Spinor Sector (32 DOFs)

SO(11) spinor 32 = 16 + 16' under SO(10) c SO(11). One 16 = 1 complete SM generation (15 SM fermions + 1 nu_R). Three copies via Im(H) give 3 generations. **0 dark states** from spinor (S320 [THEOREM]).

### Other Sectors

| Sector | Mass Scale | DM candidate? |
|--------|-----------|---------------|
| Radial mode (sigma) | ~ f ~ 1.35 TeV | NO (too heavy) |
| Composite baryons | ~ n_c * f ~ 15 TeV | NO (too heavy) |
| Skyrmions | ~ 4*pi*f ~ 17 TeV | NO (too heavy) |
| Non-perturbative condensate | Unknown | SPECULATIVE (no mechanism) |

---

## Candidate Evaluation

### A. nu_R from Spinor — POSSIBLE

The right-handed neutrino (nu_R) from the SO(11) spinor is a complete gauge singlet under SU(2)_L x U(1)_Y x SU(3)_c.

**Pros**:
- Gauge singlet: naturally weakly coupled to SM
- Exists in the framework: 3 copies (one per generation)
- Dirac Yukawa coupling y_nu ~ 5.11/174 ~ 0.029 (comparable to y_b ~ 0.024)

**Cons**:
- Stability mechanism unclear (not protected by any known symmetry)
- 3 copies: only lightest is stable (heavier decay to lighter)
- Standard Dirac mass from Yukawa: m = y_nu * v, but why m = 5.11 GeV?
- The mass formula m_DM = m_e * (n_c-1)^n_d comes from det(M) on End(R^4), not from the spinor sector

**Status**: [SPECULATION] — requires identifying a mass mechanism connecting det(M) scale to nu_R

### B. Non-Perturbative Condensate — SPECULATIVE

A bound state or condensate of the strong sector at a mass scale determined by det(M).

**Pros**:
- det(M) naturally lives in the strong sector
- 't Hooft analogy: det(m_f) in QCD determines the eta' mass

**Cons**:
- No concrete mechanism
- Composite states typically have mass ~ N_HC * Lambda_HC >> 5 GeV
- Would need fine-tuning or a new dynamical mechanism

**Status**: [SPECULATION]

### C. No DM Particle — POSSIBLE

The mass formula may be a structural coincidence. The Omega ratio m_DM/m_p ~ Omega_c/Omega_b could be coincidental at 1.3%.

**Pros**:
- Eliminates the carrier problem
- Framework has other genuine predictions that don't require DM

**Cons**:
- Wastes a structural prediction (det(M) mass scale)
- 1.3% match is suggestive (1.3 sigma)
- Would downgrade P-002

**Status**: POSSIBLE but undesirable

---

## The det(M) Scale: What It IS vs ISN'T

### What det(M) IS [THEOREM, S339]
- A degree-n_d polynomial invariant on End(R^{n_d})
- At the democratic vacuum: det(M_0) = (n_c-1)^{n_d} = 10000 (a NUMBER)
- Analogous to 't Hooft's det(m_f): determines a mass scale from the coupling matrix
- The 4th elementary symmetric polynomial of the eigenvalues

### What det(M) ISN'T [THEOREM, S339]
- NOT an independent degree of freedom beyond the 4 eigenvalue modes
- NOT a separate particle from the Higgs/Goldstones
- NOT orthogonal to Tr at first order (delta(det) = c^3 * delta(Tr))
- NOT distinguished from Tr under the physical group action (both trivial rep under S_4 conjugation)

### Why the S335 S_4 Argument Failed [S339]
1. Under **conjugation** (M -> PMP^{-1}), the physical action: both det and Tr are invariant (trivial rep)
2. Under **row permutation** (M -> PM), a non-physical action: det is the sign rep, Tr is not even a rep
3. S335 conflated these two actions, leading to the incorrect claim of "different S_4 characters"

---

## S352 Investigation: Non-Standard Mass Mechanisms

Two hypotheses investigated in S352 (`dm_mass_mechanism_investigation.py`, 26/26 PASS):

**Hypothesis A** (det(M) as gauge coupling): **REJECTED** [THEOREM]. SO(11) breaking leaves NO residual dark gauge symmetry. All 55 generators accounted for (28 pNGBs + 12 SM gauge + 15 global). Would require new [A-IMPORT].

**Hypothesis B** (density-dependent mass via det-Tr): **QUANTITATIVELY FAILS** [DERIVATION]. Coupling kappa ~ xi/(2c^2) ~ 1.7e-4 is 4 orders of magnitude too weak for galaxy-scale effects. Non-perturbative 't Hooft analogy gives wrong scale (~2700 GeV, not 5 GeV).

**New results from S352**:
- Full det expansion: det(M) = c^4 + c^3*S_1 + c^2*S_2 + c*S_3 + S_4 [THEOREM]
- For traceless fluctuations: sigma_2 = 6h^2 - sum(xi^2)/2 [THEOREM]
- Non-uniform fluctuations REDUCE det(M) [DERIVATION]
- det-Tr density coupling structurally analogous to chameleon/symmetron but with 0 free parameters [DERIVATION]
- Framework does NOT naturally address CDM small-scale crisis [DERIVATION]

See `dm_mass_mechanism_speculation.md` for full details.

---

## Open Questions

1. **nu_R mass mechanism**: Can the det(M) scale be connected to a nu_R Dirac mass?
2. **Stability**: What symmetry (if any) protects the lightest DM candidate from decay?
3. **Whether to maintain P-002**: The mass prediction survives structurally, but the coupling (formerly "portal-mediated") and identity are UNKNOWN
4. ~~**New sectors**: Could the framework contain sectors beyond pNGB + spinor that host a 5 GeV state?~~ **S352**: No non-standard mechanism works. Carrier must be in existing sectors or an orphan prediction.

---

## Derivation Chain

```
CCP [AXIOM]
  -> n_d = 4, n_c = 11 [D]
  -> End(R^{n_d}) [I-MATH]
  -> det(M) at M = (n_c-1)*I [D: S315]
  -> det(M) = (n_c-1)^{n_d} = 10000 [D]
  -> m_DM = m_e * det(M) = 5.11 GeV [D: 1 A-STRUCTURAL (m_e as reference)]
  -> Carrier particle: ??? [OPEN]
```

**Assumptions**: 1 axiom (CCP) + 1 [A-STRUCTURAL: m_e reference mass] + 0 [A-PHYSICAL]

---

*Verification*: `dm_identity_revision.py` (34/34 PASS, S335), `det_tr_decoupling_analysis.py` (32/32 PASS, S339), `dm_candidate_systematic_survey.py` (S339)
*Related*: `generation_structure.md`, `predictions/dark_matter_5gev.md`, `predictions/BLIND_PREDICTIONS.md` (P-002)
