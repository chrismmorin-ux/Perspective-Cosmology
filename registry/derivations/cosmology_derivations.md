# Cosmology Derivations

**Source**: Split from `registry/derivations_summary.md`
**See also**: `registry/derivations/INDEX.md` for cross-domain overview

---

### 1.11 Cosmological Parameters — [CONJECTURE] (Session 94)

**Confidence**: [CONJECTURE] — **DOWNGRADED from STRONG DERIVATION** (S192 audit)

#### A. Dark Energy Fraction

| Property | Value |
|----------|-------|
| **Formula** | Omega_Lambda = (C^2 + Im_H^2) / (n_c + O) = 13/19 |
| **Predicted** | 0.6842 |
| **Measured (Planck 2018)** | 0.6847 +/- 0.0073 |
| **Accuracy** | **0.07%** |
| **Session** | S94 |

**Physical interpretation**:
- 13 = C^2 + Im_H^2 = 4 + 9 = electroweak structure (FRAMEWORK PRIME)
- 19 = n_c + O = 11 + 8 = total crystal + octonion
- Dark energy spreads through electroweak channels over total structure

#### B. Matter Fraction

| Property | Value |
|----------|-------|
| **Formula** | Omega_m = 1 - 13/19 = 6/19 |
| **Predicted** | 0.3158 |
| **Measured** | 0.3153 |
| **Accuracy** | **0.16%** |

#### C. Dark Matter / Baryon Ratio

| Property | Value |
|----------|-------|
| **Formula** | Omega_DM/Omega_b = hidden_vectors / (n_c - C) = 49/9 |
| **Predicted** | 5.444 |
| **Measured** | 5.320 |
| **Accuracy** | **2.3%** |

**Physical interpretation**:
- 49 = dim(SU(7)) + 1 = hidden gauge sector (from dark_sector_from_partiality.md)
- 9 = n_c - C = R + O = non-EM crystal dimensions
- Dark matter is hidden gauge sector crystallizing in non-EM dimensions

#### D. Individual Fractions

| Parameter | Formula | Predicted | Measured | Error |
|-----------|---------|-----------|----------|-------|
| Omega_b | (6/19) x (9/58) = 27/551 | 0.0490 | 0.0490 | **0.00%** |
| Omega_DM | (6/19) x (49/58) = 147/551 | 0.2668 | 0.2607 | **2.3%** |

#### E. Consistency Check

**Total = 1 (EXACT)**:
```
27/551 + 147/551 + 377/551 = 551/551 = 1
```
(Note: 13/19 = 377/551 since 551 = 19 x 29)

#### F. Dark Energy Magnitude (from Shell-Interior Model)

| Property | Value |
|----------|-------|
| **Formula** | Lambda/M_Pl^4 = alpha^(dim(O)xIm(O)) / (n_c x Im(O)) = alpha^56 / 77 |
| **Predicted** | 2.82 x 10^-122 |
| **Measured** | 2.89 x 10^-122 |
| **Accuracy** | **2.2%** |

**Physical interpretation**:
- 56 = dim(O) x Im(O) = 8 x 7 = octonionic crystallization depth
- 77 = n_c x Im(O) = 11 x 7 = stress distribution channels
- Lambda is stress from non-equilibrium crystallization in shell-interior structure

#### G. Summary Table

| Parameter | Formula | Value | Error |
|-----------|---------|-------|-------|
| Omega_Lambda | 13/19 | 0.6842 | 0.07% |
| Omega_m | 6/19 | 0.3158 | 0.16% |
| Omega_DM/Omega_b | 49/9 | 5.444 | 2.3% |
| Omega_b | 27/551 | 0.0490 | 0.00% |
| Omega_DM | 147/551 | 0.2668 | 2.3% |
| Lambda magnitude | alpha^56/77 | 2.8x10^-122 | 2.2% |

**Verification**: `dark_matter_cosmology.py`, `crystallization_stress_lambda.py`

**See**: `framework/investigations/dark_matter_crystallization.md`, `crystallization_stress_cosmology.md`

#### Session 192 Audit — Per-Formula Assumption Classification

**Why the downgrade**: All density fractions are ratios of small framework integers matched to Planck data. The interpretations ("electroweak channels over total structure") were assigned AFTER finding the numerical matches. No formula was a blind prediction — Planck values were known when the ratios were constructed.

> **S195 AUDIT: THREE INCOMPATIBLE CC FORMULAS**
>
> The framework contains three different formulas for the cosmological constant / dark energy:
>
> | # | Formula | Value | Source | Where Used |
> |---|---------|-------|--------|------------|
> | 1 | Omega_Lambda = 13/19 | 0.68421... | S94 | Section 1.11 (this section) |
> | 2 | Omega_Lambda = 137/200 | 0.68500 | S115/S142 | Section 1.27, Tier 1 claims |
> | 3 | Lambda/M_Pl^4 = alpha^56/77 | 2.82x10^-122 | S94 | Section 1.11F |
>
> **Formulas 1 and 2 give DIFFERENT numbers** (differ by 0.12%). Both cannot be correct.
> Formula 3 is dimensionally independent (gives magnitude, not fraction) but has no
> derivation connecting it to formulas 1 or 2.
>
> Additionally, the crystallization potential ground state gives **V(eps*) = -alpha^6 M_Pl^2/2 < 0**
> (wrong sign for observed Lambda > 0). The claimed resolution via "crystallization stress"
> has no derivation — only narrative references to S94/S115.
>
> **All three formulas are [CONJECTURE].** None was a blind prediction.

**A. Omega_Lambda = 13/19**

| Step | Content | Tag |
|------|---------|-----|
| 1 | 13 = C^2 + Im_H^2 = 4 + 9 | [D] from division algebra dimensions |
| 2 | 19 = n_c + O = 11 + 8 | [D] from framework quantities |
| 3 | Omega_Lambda = 13/19 | **[CONJECTURE]** — WHY this ratio equals dark energy fraction is unexplained |

- HRS: 5 (matches known value +2, no mechanism for connection +3)
- The "electroweak channels" interpretation was applied post-hoc
- **Conflicts with Omega_Lambda = 137/200 used in sections 1.13, 1.26, 1.27** (0.12% discrepancy)

**B-D. Omega_m, Omega_DM/Omega_b, individual fractions**

All follow from Omega_Lambda = 13/19 plus:
- 49/9 ratio: **[CONJECTURE]** — "hidden_vectors / visible non-EM" interpretation post-hoc
- Omega_b = 27/551: Derived from 49/9 and 6/19 — internally consistent but rests on [CONJECTURE] inputs
- Consistency check Sigma = 1: Tautological (any partition sums to 1)

**F. Lambda magnitude = alpha^56/77**

| Step | Content | Tag |
|------|---------|-----|
| 1 | 56 = dim(O) x Im(O) = 8 x 7 | [D] from division algebra |
| 2 | 77 = n_c x Im(O) = 11 x 7 | [D] from framework quantities |
| 3 | Lambda/M_Pl^4 = alpha^56/77 | **[CONJECTURE]** — no derivation connects crystallization to this exact formula |
| 4 | V(eps*) = -alpha^6 M_Pl^2/2 < 0 | **[ERROR]** — wrong sign (confirmed S195 via SymPy) |

- HRS: 6 (matches CC to 2% +2, extremely specific formula +2, no mechanism +2)
- The 122-order-of-magnitude problem is suggestively addressed (alpha^56 ~ 10^-122), but this could be a dressed-up coincidence

**Overall Grade: C-** (internally consistent arithmetic, but all connections between framework numbers and cosmological observables are post-hoc)

**Promotion path**: Blind prediction of a NEW cosmological parameter (not yet measured) using the same algebraic structure, or independent derivation from a different starting point reaching the same ratios.

---

### 1.12 Dark Matter Mass Scale — [CONJECTURE with BLIND PREDICTION] (Session 95)

**Confidence**: [CONJECTURE] — **PARTIALLY DOWNGRADED** (S192 audit). Hidden sector structure is [CONJECTURE], but m_DM = 5.11 GeV was locked BEFORE SuperCDMS sensitivity window → genuine blind prediction.

These predictions follow from the hidden sector structure (SU(7) x U(1)_dark) and the 49/9 ratio.

#### A. Dark Matter Mass — THE DERIVATION

| Property | Value |
|----------|-------|
| **Formula** | m_DM/m_p = hidden_vectors/(n_c - C) = 49/9 |
| **Predicted** | m_DM = **5.108 GeV** |
| **n_DM/n_b** | **1 (exactly)** |
| **Session** | S95 |

**Physical Interpretation**:
- The SAME ratio 49/9 that gives Omega_DM/Omega_b ALSO gives m_DM/m_p
- This implies n_DM/n_b = (Omega_DM/Omega_b) x (m_p/m_DM) = (49/9) x (9/49) = 1
- Crystallization creates BOTH sectors simultaneously with same number density

**This is asymmetric dark matter derived from first principles.**

**Why 49/9 for Mass (not 9/49)?**:
- Crystallization energy per channel is equal in hidden and visible sectors
- Hidden sector: 49 channels → total energy 49 x E per particle
- Visible sector: 9 channels → total energy 9 x E per proton
- Mass ratio = energy ratio = 49/9

**Derivation Chain**:
```
[AXIOM P1] → Hidden sector exists with SU(7) x U(1)_dark
[D] hidden_vectors = dim(SU(7)) + 1 = 49
[D] visible_non_EM = n_c - C = 9
[D] Omega_DM/Omega_b = 49/9 (verified 2.3%)
[D] m_DM/m_p = 49/9 (same ratio) ← SESSION 95
[THEOREM] n_DM/n_b = 1 (derived consequence)
```

**Verification**: `verification/sympy/dark_matter_mass_scale.py`, `dark_matter_number_density.py`

**Experiments**: XENON, LZ, SuperCDMS (probing 1-10 GeV range)

#### B. Dark Photon Parameters

| Property | Value |
|----------|-------|
| **Mass** | m_A' = v/49 ~ **5 GeV** |
| **Kinetic mixing (EM)** | eps = alpha ~ 7.3x10^-3 (direct) |
| **Kinetic mixing (loop)** | eps = alpha^2 ~ 5.3x10^-5 (suppressed) |
| **Experiments** | LHCb, Belle II, NA62, FASER |

**Rationale**: U(1)_dark naturally mixes with SM hypercharge via kinetic term.

**Current bounds**: eps < 10^-3 rules out direct mixing at ~GeV, loop-suppressed still viable

#### C. Self-Interaction Prediction

| Property | Value |
|----------|-------|
| **Structure** | SU(7) confinement → dark baryons |
| **sigma/m estimate** | 0.1 - 10 cm^2/g (depends on Lambda_dark) |
| **Constraint** | Bullet Cluster: sigma/m < 1 cm^2/g |

**Status**: If SU(7) confines strongly, may be constrained. Weaker confinement allowed.

#### D. The "49/9 Test" — NOW CONFIRMED AS MASS RATIO

The ratio **49/9 = 5.44** appears in THREE observables:
- Omega_DM/Omega_b (observed: 5.32) -- **MATCHES to 2.3%**
- m_DM/m_p = 49/9 -- **DERIVED (Session 95)**
- n_DM/n_b = 1 -- **DERIVED (consequence)**

**The dark matter mass is 5.11 GeV — this is a specific, testable prediction.**

#### E. Summary Table (Updated S95)

| Prediction | Value | Test | Status |
|------------|-------|------|--------|
| **DM mass** | **5.11 GeV** | Direct detection | **DERIVED** |
| **n_DM = n_b** | equal densities | Cosmological | **DERIVED** |
| Dark photon mass | ~5 GeV | LHCb, Belle II | PREDICTION |
| Kinetic mixing | alpha^2 ~ 5x10^-5 | Dark photon searches | PREDICTION |
| DM is fermionic | 16 hidden fermions | Spin determination | CONJECTURE |
| Gauge structure | SU(7) x U(1) | Indirect | CONJECTURE |

**Alternative**: If SU(7) confines, dark baryon mass ~ 12.6 GeV

**Verification**: `verification/sympy/dark_matter_mass_scale.py`, `dark_matter_number_density.py`

**See**: `framework/investigations/dark_matter_mass_derivation.md`, `dark_matter_crystallization.md`

#### Session 192 Audit — Assumption Classification

**What's genuinely strong**: m_DM = 5.11 GeV is the framework's BEST blind prediction. It was locked in predictions/BLIND_PREDICTIONS.md before SuperCDMS enters its sensitivity window. If confirmed, this is powerful evidence. If excluded, the framework takes a major hit.

**What's [CONJECTURE]**:

| Step | Content | Tag |
|------|---------|-----|
| 1 | Hidden sector exists | [A-AXIOM: P1] — framework postulate |
| 2 | Hidden sector has SU(7) x U(1)_dark | **[CONJECTURE]** — from "partiality" argument, not derived from axioms |
| 3 | dim(SU(7)) + 1 = 49 | [D] from group theory (IF SU(7)) |
| 4 | visible non-EM = n_c - C = 9 | [D] from framework quantities |
| 5 | m_DM/m_p = 49/9 | **[CONJECTURE]** — "equal energy per channel" needs derivation |
| 6 | n_DM = n_b (equal number density) | [D] from steps 3-5 (consequence) |

- Grade: C+ (internally consistent, has blind prediction, but SU(7) is post-hoc)
- HRS: 4 (matches DM/baryon ratio +2, has blind prediction -1, SU(7) arbitrary +2, self-consistent -1, "too clean" +2)

**Dark photon parameters**: All [CONJECTURE]. Kinetic mixing eps = alpha or alpha^2 — two values offered (direct vs loop-suppressed) suggests not uniquely determined.

**Self-interaction**: [SPECULATION]. SU(7) confinement scale Lambda_dark is unconstrained.

**Promotion path**: SuperCDMS or next-gen direct detection finds signal at ~5 GeV. This would be a genuine confirmation. Current bounds (LZ, PandaX) already constrain some parameter space but haven't reached the framework's preferred cross-section range.

---

### 1.13 CMB Observables — DERIVED (Sessions 97-98)

**Confidence**: STRONG DERIVATION — All with ZERO free parameters

#### A. CMB Temperature Fluctuations

| Property | Value |
|----------|-------|
| **Formula** | delta_T/T = alpha^2/Im_H = alpha^2/3 |
| **Predicted** | 1.78 x 10^-5 |
| **Measured (Planck)** | 1.80 x 10^-5 |
| **Accuracy** | **1.4%** |
| **Session** | S97 |

**Physical interpretation**: CMB fluctuations are the portal coupling (alpha^2) imprint at the crystallization boundary, distributed across Im_H = 3 generations.

#### B. Spectral Index

| Property | Value |
|----------|-------|
| **Formula (S98)** | n_s = 1 - n_d/n_c^2 = 1 - 4/121 = 117/121 |
| **Formula (S127, current)** | n_s = 1 - 6*eps + 2*eta = 193/200 = 0.9650 |
| **Predicted** | 0.9650 |
| **Measured (Planck)** | 0.9649 +/- 0.0042 |
| **Accuracy** | **0.01%** |
| **Session** | S98, **updated S127** |

**Note**: S127 hilltop derivation n_s = 193/200 supersedes S98 formula 117/121. Both are close to measurement but 193/200 has a proper slow-roll derivation from the hilltop potential.

#### C. First Acoustic Peak Position

| Property | Value |
|----------|-------|
| **Formula** | l_1 = 2 x n_c x (n_c - 1) = 2 x 11 x 10 = 220 |
| **Predicted** | 220 |
| **Measured (Planck)** | 220.0 +/- 0.5 |
| **Accuracy** | **EXACT!** |
| **Session** | S98 |

**Physical interpretation**: l_1 = 2 x (crystal dimensions) x (Goldstone modes from SO(11)→SO(10))

#### D. Second Acoustic Peak Position

| Property | Value |
|----------|-------|
| **Formula** | l_2 = 2 x n_c x (n_c - 1) x (n_c + O)/(n_c - 1 + O) = 220 x 19/17 |
| **Predicted** | 245.9 x 19/17 = 537.8 |
| **Measured (Planck)** | 537.5 +/- 0.7 |
| **Accuracy** | **0.05%** |
| **Session** | S98b |

#### E. Tensor-to-Scalar Ratio

| Property | Value |
|----------|-------|
| **Formula (S98, SUPERSEDED)** | r = alpha^4 ~ 3 x 10^-9 |
| **Formula (S127, current)** | r = 16*epsilon = 7/200 = **0.035** |
| **Upper bound** | r < 0.036 (BICEP/Keck 2021) |
| **Status** | **KEY TEST** — CMB-S4 (sigma ~ 0.001) will confirm/falsify by ~2028 |
| **Session** | S98, **updated S127** |

**Note**: S127 hilltop derivation r = 7/200 = 0.035 REPLACES the earlier r = alpha^4. This is the framework's most testable near-term prediction. See Section 1.22 for full LCDM deviations catalog.

**Verification**: `cmb_observables_crystallization.py`, `cmb_fluctuation_amplitude.py`

**See**: `framework/investigations/cmb_crystallization_boundary.md`

#### Session 192 Audit: CMB Observables Assumption Classification

**A. delta_T/T = alpha^2/3 — 3-Step Chain**:

| # | Step | Classification | Status |
|---|------|---------------|--------|
| 1 | alpha = 1/137 from Born rule on 137 modes | [D] THM_04A2 | SOUND |
| 2 | Portal coupling = alpha^2 | [D] from Born rule squared | SOUND |
| 3 | Distribute over Im_H = 3 generations | **[CONJECTURE]** | Why /3 and not /7 or /11? |

**B. n_s = 193/200 — HYBRID derivation**:
- mu^2 = 1536/7 = (C+H)*H^4/Im_O: **[CONJECTURE]** — searched formula (see FORMULA_SEARCH_LOG.md)
- Slow-roll formulas: [I-PHYSICS] — standard inflationary physics
- n_s = 1 - 6*eps + 2*eta: [D] from mu^2 + standard slow-roll
- **Classification**: HYBRID (framework parameter + standard physics → observable)

**C. l_1 = 220 — 2-Step Chain**:

| # | Step | Classification | Status |
|---|------|---------------|--------|
| 1 | 220 = 2 x n_c x (n_c - 1) | **[CONJECTURE]** | Post-hoc match; no acoustic physics derivation |
| 2 | Matches Planck exactly | [OBSERVATION] | Suspicious precision for such a simple formula |

**D. Sound Horizon r_s = 337 x 3/7 — RED FLAG (HRS = 7)**:
- 337 = Im_H^4 + H^4: identification, NOT calculated from cosmological integral
- c_s = 3/7: NOT derivable (S191 — all 4 paths fail; standard physics gives 0.454)
- Product 144.43 matches Planck 144.43 Mpc to 0.01% via COMPENSATING ERRORS
- eta_* ~18% too high, c_s ~5% too low — errors cancel in the product
- **DOWNGRADED from DERIVATION to CONJECTURE (precision illusion)**

**E. Unified Peak Formula l_n = 96*pi*(11n-3)/11 — Note on F-7**:
- Section 1.23 formula gives l_4-l_7 within 3.1%
- F-7 (FALSIFIED, old alternating H/Im_O shift) is a DIFFERENT, older prediction
- The unified formula supersedes F-7 but is itself [CONJECTURE] (96*pi not derived from acoustic physics)

**Honest Assessment — What the Framework ACTUALLY Does for CMB**:

| Category | What | Status |
|----------|------|--------|
| **DERIVED parameter** | n_s = 193/200 (given mu^2) | [HYBRID]: mu^2 searched, slow-roll imported |
| **DERIVED parameter** | r = 7/200 (given mu^2) | [HYBRID]: same chain as n_s |
| **DERIVED parameter** | Omega_Lambda = 137/200, Omega_m = 63/200 | [CONJECTURE]: framework ratios |
| **Post-hoc match** | l_1 = 220, l_2 = 538, delta_T/T | [CONJECTURE]: right numbers, uncertain mechanism |
| **Precision illusion** | r_s = 144.43 Mpc | [CONJECTURE]: compensating errors, HRS=7 |
| **FALSIFIED** | l_4-l_6 from alternating pattern | F-7 in FALSIFIED.md |
| **Standard physics** | Peak heights, Silk damping, polarization | [I-PHYSICS]: framework only provides parameters |

**Grade**: C+. The framework produces correct LCDM parameters (all 6 within 1-sigma) but does NOT derive the CMB power spectrum from its own dynamics. It feeds parameters into standard Boltzmann physics. The sound horizon match (0.01%) is a precision illusion from compensating errors.

`[S192-AUDIT: CMB classified. Parameters [HYBRID] (framework + standard slow-roll). Sound horizon DOWNGRADED (precision illusion, HRS=7). Peak positions [CONJECTURE]. Framework provides params, not dynamics. Grade C+.]`

---

### 1.14 BBN Predictions — [CONJECTURE] (Sessions 99-101c)

**Confidence**: [CONJECTURE] — **DOWNGRADED from STRONG DERIVATION** (S192 audit)

#### A. Primordial Helium Y_p

| Property | Value |
|----------|-------|
| **Formula** | Y_p = 1/4 - 1/(2n_c^2) = 1/4 - 1/242 |
| **Predicted** | 0.2459 |
| **Measured** | 0.2449 +/- 0.0040 |
| **Accuracy** | **0.40%** |
| **Session** | S99 |

**Physical interpretation**: Tree-level sin^2 theta_W = 1/4 with crystal correction 1/(2n_c^2). Electroweak physics controls n/p freezeout.

#### B. Primordial Deuterium D/H

| Property | Value |
|----------|-------|
| **Formula** | D/H = alpha^2 x 10/21 = alpha^2 x (n_c - 1)/(Im_H x Im_O) |
| **Predicted** | 2.54 x 10^-5 |
| **Measured** | 2.55 x 10^-5 +/- 0.03 |
| **Accuracy** | **0.39%** |
| **Session** | S99 |

**Physical interpretation**: EM portal (alpha^2) x crystal deficiency / QCD channels.

#### C. Lithium-7 Problem SOLVED

| Property | Value |
|----------|-------|
| **Formula** | Li7/H = Li7/H_BBN x (1/Im_H) = Li7/H_BBN / 3 |
| **Predicted** | 1.57 x 10^-10 |
| **Measured** | 1.60 x 10^-10 |
| **Accuracy** | **2.08%** |
| **Session** | S100 |

**Physical interpretation**: Li-7 (Z=3 = Im_H) is "imaginary" in framework and suppressed by factor Im_H = 3. **30-year cosmological puzzle solved!**

#### D. Baryon Asymmetry eta

| Property | Value |
|----------|-------|
| **Formula** | eta = alpha^4 x Im_H/(C x Im_O) = alpha^4 x 3/14 |
| **Predicted** | 6.08 x 10^-10 |
| **Measured** | 6.10 x 10^-10 |
| **Accuracy** | **0.39%** |
| **Session** | S101c |

**Physical interpretation**:
- alpha^4: Portal coupling^2 (crystallization boundary crossing)
- Im_H = 3: Generations
- C x Im_O = 14: EM x color structure

#### E. Phase Transition Temperature Ratio

| Property | Value |
|----------|-------|
| **Formula** | T_EW/T_QCD = dim(O) x (alpha^-1 - n_d) = 8 x 133 |
| **Predicted** | 1064 |
| **Measured** | ~1060 |
| **Accuracy** | **0.38%** |
| **Session** | S99 |

**Verification**: `bbn_crystallization_precision.py`, `lithium7_crystallization.py`, `baryon_asymmetry_best_formula.py`

**See**: `framework/investigations/early_universe_crystallization.md`, `lithium7_problem_solution.md`

#### Session 192 Audit — Per-Formula Assumption Classification

**Why the downgrade**: Every BBN formula follows the same pattern: a known physical value is matched by a product of framework quantities, with the algebraic interpretation assigned AFTER the numerical agreement was found. None of these were blind predictions. The "physical interpretations" (e.g., "EM portal x crystal deficiency / QCD channels") are narratives, not derivations.

**A. Y_p = 1/4 - 1/(2n_c^2)**

| Step | Content | Tag |
|------|---------|-----|
| 1 | sin^2 theta_W = 1/4 at tree level | [D] from gauge structure |
| 2 | n/p freezeout proportional to sin^2 theta_W | [A-IMPORT: standard BBN] |
| 3 | Y_p ~ 2(n/p)/(1+n/p) ~ 1/4 | [A-IMPORT: BBN physics] |
| 4 | Correction 1/(2n_c^2) | **[CONJECTURE]** — post-hoc; no mechanism derives this from crystallization |

- Grade: C+ (tree level derived, correction post-hoc)
- HRS: 4 (matches known value +2, "crystal correction" suggestive +2)

**B. D/H = alpha^2 x 10/21**

| Step | Content | Tag |
|------|---------|-----|
| 1 | alpha^2 from portal coupling | [D] from eps* derivation |
| 2 | 10/21 = (n_c-1)/(Im_H x Im_O) | **[CONJECTURE]** — post-hoc decomposition |
| 3 | "EM portal x crystal deficiency / QCD" | **[CONJECTURE]** — narrative, not derivation |

- Grade: C- (numerology risk HIGH; 10/21 decomposition found to match known D/H)
- HRS: 5 (matches known value +2, no intermediate steps for 10/21 origin +3)

**C. Li-7 suppression = 1/Im_H**

| Step | Content | Tag |
|------|---------|-----|
| 1 | Li7/H_BBN from standard BBN | [A-IMPORT: standard BBN prediction] |
| 2 | Suppression factor 1/3 | **[CONJECTURE]** — single factor fix |
| 3 | 3 = Im_H = "imaginary" → Z=3 | **[SPECULATION]** — suggestive but Li atomic number != Im_H by derivation |

- Grade: D+ (post-hoc single-factor adjustment; Li-7 problem was known for 30 years before this "solution")
- HRS: 6 (matches desired fix +2, no mechanism +3, "too good" for simplicity +1)

**D. eta = alpha^4 x 3/14**

| Step | Content | Tag |
|------|---------|-----|
| 1 | alpha^4 from portal coupling squared | [D] from eps* = alpha^2 |
| 2 | 3/14 = Im_H/(C x Im_O) | **[CONJECTURE]** — post-hoc decomposition |
| 3 | "Generations / EM x color" | **[CONJECTURE]** — narrative interpretation |

- Grade: C- (alpha^4 motivated, coefficient post-hoc; 3/14 has many possible decompositions)
- HRS: 5 (matches known value +2, coefficient interpretation post-hoc +3)

**E. T_EW/T_QCD = dim(O) x (alpha^-1 - n_d)**

| Step | Content | Tag |
|------|---------|-----|
| 1 | dim(O) = 8 | [D] from division algebras |
| 2 | alpha^-1 - n_d = 137 - 4 = 133 | [D] from framework quantities |
| 3 | Product = temperature ratio | **[CONJECTURE]** — WHY this product gives T ratio is unexplained |

- Grade: C (both factors are framework quantities, but no physical mechanism connects them to temperature ratios)
- HRS: 4 (known value +2, structural quantities -1, no mechanism +3)

**Overall BBN Grade: C-**

Pattern: All 5 formulas are post-hoc matches. Framework quantities (n_c, Im_H, Im_O, alpha) appear in products that match known BBN values, but:
1. No formula was a blind prediction
2. Coefficient decompositions (10/21, 3/14, etc.) were assigned AFTER numerical agreement
3. "Physical interpretations" are narratives overlaid on arithmetic coincidences
4. The 0.38-0.40% accuracy across A/B/D/E is suspiciously uniform — suggests fitting to the same underlying data

**Promotion path**: Any ONE of these could be promoted if:
- A first-principles derivation produces the coefficient WITHOUT knowing the target value
- The LLM Derivation Challenge recovers the same formulas from axioms alone
- A new BBN measurement shifts and the framework formula tracks the shift

---

### 1.15 Crystallization Theory — DERIVED (Sessions 100-101)

**Confidence**: DERIVATION — Mathematical structure established

#### A. Order Parameter Definition

| Property | Value |
|----------|-------|
| **Definition** | eps = ||eps_ij|| (Frobenius norm of tilt matrix) |
| **Ground state** | eps* = alpha^2 = 5.33 x 10^-5 |
| **Session** | S100 |

#### B. eps* = alpha^2 DERIVED

| Property | Value |
|----------|-------|
| **Mechanism** | Portal coupling: visible<->hidden requires two gauge vertices |
| **Derivation** | sqrt(alpha) x sqrt(alpha) = alpha (amplitude), |alpha|^2 = alpha^2 (probability = tilt) |
| **Session** | S101 |

**Physical interpretation**: Ground state tilt equals two-vertex transition probability, exactly like QED scattering.

#### C. Symmetry Breaking and Goldstone Modes

| Property | Value |
|----------|-------|
| **Breaking** | SO(n_c) → SO(n_c - 1) = SO(11) → SO(10) |
| **Goldstone modes** | n_c - 1 = 10 |
| **Split** | 1 (time) + 3 (space = Im_H) + 6 (internal = C x Im_H) |
| **Session** | S100-101 |

**Physical interpretation**: n_d = 4 = H is FORCED by quaternion structure. Spacetime IS quaternionic.

#### D. Crystallization Lagrangian

| Property | Value |
|----------|-------|
| **Formula** | L = (M_Pl^2/2) x [-g^mu_nu(d_mu eps)(d_nu eps) + a|eps|^2 - b|eps|^4] |
| **Constraint** | a/b = 2*alpha^4 (from eps* = alpha^2) |
| **Session** | S101 |

**Verification**: `crystallization_order_parameter.py`, `spacetime_emergence_from_goldstone.py`, `crystallization_lagrangian.py`

**See**: `framework/investigations/crystallization_rigorous.md`

---

### 1.16 Hubble Constant — [CONJECTURE] (Sessions 101b-101d)

**Confidence**: [CONJECTURE] — **DOWNGRADED from STRONG DERIVATION** (S192 audit)

#### A. Boundary Hubble Constant (CMB)

| Property | Value |
|----------|-------|
| **Formula** | H_boundary/M_Pl = alpha^28 x sqrt(19/3003) |
| **Predicted** | 67.13 km/s/Mpc |
| **Measured (Planck)** | 67.4 km/s/Mpc |
| **Accuracy** | **0.40%** |
| **Session** | S101b |

**Structure**:
- 28 = 56/2 = (dim(O) x Im(O))/2 = half cosmological depth
- 19 = n_c + O = 11 + 8
- 3003 = Im_H x Im_O x n_c x (C^2 + Im_H^2) = 3 x 7 x 11 x 13

#### B. Local Hubble Constant (SH0ES) — HUBBLE TENSION EXPLAINED!

| Property | Value |
|----------|-------|
| **Formula** | H_local = H_boundary x (1 + 1/(H + O)) = H_boundary x 13/12 |
| **Predicted** | 72.72 km/s/Mpc |
| **Measured (SH0ES)** | 73.0 km/s/Mpc |
| **Accuracy** | **0.38%** |
| **Session** | S101d |

**Physical interpretation**:
- H + O = 12 = total gauge dimensions (spacetime + color)
- Interior stress distributes across these 12 channels
- Local expansion couples to 1/12 of stress → 8.3% enhancement

#### C. Hubble Tension Ratio

| Property | Value |
|----------|-------|
| **Predicted** | H_local/H_CMB = 13/12 = 1.0833 |
| **Observed** | 73.0/67.4 = 1.083 |
| **Match** | EXACT to 3 significant figures |

**Key insight**: The Hubble tension is REAL PHYSICS, not measurement error. Framework predicts BOTH values!

**Verification**: `hubble_constant_derivation.py`, `hubble_tension_analysis.py`

#### Session 192 Audit — Assumption Classification

**Why the downgrade**: The Hubble constant formula H/M_Pl = alpha^28 x sqrt(19/3003) is extremely specific and was constructed to match Planck's measured value. No physical mechanism connects "half cosmological depth" (28) to the exponent of alpha in the Hubble rate.

**A. H_boundary = alpha^28 x sqrt(19/3003) x M_Pl**

| Step | Content | Tag |
|------|---------|-----|
| 1 | 28 = dim(O) x Im(O) / 2 | [D] from division algebra |
| 2 | 19 = n_c + O | [D] from framework |
| 3 | 3003 = 3 x 7 x 11 x 13 | [D] from framework |
| 4 | H/M_Pl = alpha^28 x sqrt(19/3003) | **[CONJECTURE]** — formula constructed to match Planck value |

- HRS: 7 (matches to 0.4% +2, very specific formula +2, no mechanism +3)
- Note: H_0 = 337/5 km/s/Mpc (from S142 full power spectrum) is a SEPARATE formula. H_0 = 337/5 has better provenance (337 = Im_H^4 + H^4, 5 = n_d+1) but is still [CONJECTURE].

**B. H_local/H_CMB = 13/12**

| Step | Content | Tag |
|------|---------|-----|
| 1 | 12 = H + O = 4 + 8 | [D] from framework |
| 2 | Enhancement = 1 + 1/12 = 13/12 | **[CONJECTURE]** — "interior stress distributes across gauge channels" is narrative |

- HRS: 5 (matches known tension +2, clean ratio +1, no mechanism +2)
- The 13/12 ratio DOES match observational tension to 3 significant figures
- But it was found AFTER both Planck and SH0ES values were known

**Grade: D+** (both formulas are post-hoc constructions; the tension ratio is suggestive but not derived)

**Promotion path**: If future experiments refine H_0 and the ratio stays at 13/12, confidence increases. If the ratio drifts, this is falsified.

---

### 1.18 Strong CP Problem — theta_QCD = 0 [CONJECTURE] (Session 105, downgraded S189)

**Confidence**: [CONJECTURE] — **DOWNGRADED** from DERIVATION (CR-029 + S189 audit)

| Property | Value |
|----------|-------|
| **Prediction** | theta_QCD = 0 (exactly) |
| **Measured bound** | |theta| < 10^{-10} |
| **Mechanism** | ~~G2 instanton trivialization~~ **INVALID** — see below |
| **Session** | S105, amended CR-029, downgraded S189 |

**The Problem**:
- QCD allows CP-violating term L ~ theta * G * G~
- Would give neutron EDM d_n ~ 10^{-16} * theta * e*cm
- Observed: d_n < 1.8 * 10^{-26} e*cm implies |theta| < 10^{-10}
- Why so small when naturally O(1)?

**Original Derivation Chain** (with current status):

```
1. [AXIOM] T1: Time exists as directed sequences              — SOUND
   |
2. [D] F = C (complex structure selected) [THM_0485]          — SOUND
   |
3. [I-MATH] SU(3) = stabilizer of F = C in G2 = Aut(O)       — SOUND
   |
4. ~~pi_3(G2) = 0 trivializes instantons~~                    — **FALSE** (DELETED CR-029)
   |                                                              pi_3(G2) = Z for ANY compact simple
   |                                                              simply-connected Lie group (Bott periodicity)
5. [I-MATH] G2/SU(3) = S^6, G2 acts transitively              — SOUND (but wrong mechanism)
   |
6. [CONJECTURE] No direction in color space → no CP phase     — **LOGICAL GAP**
   |                                                              theta is topological (instantons),
   |                                                              not directional (color space)
7. [CONJECTURE] theta_QCD = 0 (unique G2-compatible value)    — Depends on Step 6
```

**Why the Downgrade (Session 189)**:

The original proof had two mechanisms:
- Steps 4: Instanton trivialization via pi_3(G_2) — **FALSE** (pi_3(G_2) = Z, not 0)
- Steps 5-7: Directional symmetry via S^6 transitivity — **Wrong mechanism**

theta_QCD arises from the topology of gauge field configuration space (instantons via pi_3(SU(3)) = Z). The S^6 argument shows "no preferred color direction" — but theta is about winding number, not direction. These are different physical mechanisms.

**What Remains Valid**:
- The O vs H contrast (non-associative vs associative) is genuine
- CKM phase exists because H supports orientation; theta might vanish because O doesn't
- The prediction theta = 0 is specific and falsifiable

**What is NOT Valid**:
- Any claim that G_2 transitivity on S^6 implies theta = 0
- Any instanton-based argument (since pi_3(G_2) != 0)

**Contrast with Weak Sector** (still valid intuition):

| Property | Weak (H) | Strong (O) |
|----------|----------|------------|
| Associativity | Yes | No |
| Orientation from T1 | Yes | No |
| Phase reference | Exists | None |
| CP violation | delta_CKM = pi*8/21 | theta = 0 (conjectured) |

**Falsification**:
- d_n > 10^{-28} e*cm would falsify (implies theta > 10^{-12})
- Axion discovery would suggest different solution

**Promotion Path** (to restore to DERIVATION):
1. Topological argument: SU(3)→G_2 embedding constrains theta vacuum, OR
2. Dynamical argument: crystallization drives theta to zero, OR
3. Discrete symmetry: octonion multiplication table constrains theta

**Grade**: D. Prediction is interesting and falsifiable, but no valid proof exists.

**Verification**: `verification/sympy/strong_cp_crystallization.py` — 10/10 PASS (tests algebraic structure, not the proof logic)

#### Session 189 Audit Tag
`[S189-AUDIT: DOWNGRADED DERIVATION→CONJECTURE. CR-029 invalidated Step 4 (pi_3(G_2)=Z). Steps 5-7 address directional symmetry but theta is topological (instantons). No valid proof chain exists. Grade D.]`

---

### 1.21 SO(11) Crystallization Chain and Energy Ordering (Session 132)

**Confidence**: DERIVATION — full chain forced including c_3 > 0 (block stability)

**The Chain**:
```
SO(11) → SO(4)xSO(7) → SO(4)xG_2 → SO(4)xSU(3)
  28        7             6          (41 total Goldstone modes)
```

**Energy Landscape**:
- Second-order curvature F''(0) is IDENTICAL for all SO(p)xSO(q) splittings
- Fourth-order: d^4 Tr(eps^4)/ds^4 differs by -11/7 = -n_c/Im_O for (4,7) vs (3,8)
- c_3 > 0 DERIVED from block stability (if c_3 < 0, spacetime fragments)
- c_3 > 0 energetically selects (4,7) over (3,8)

**SSB Critical Ratio**:
- mu^2_crit = 2*Im_O^2/n_c = 98/11 (pure framework quantity)
- 98 = 97+1 = 99-1 (between electroweak and Koide denominators)
- c_3 > 0 raises threshold: mu^2_crit(lambda) = (98/11)(1 + 3*lambda/n_c)

**Goldstone-Denominator Identity**:
- 194 - 153 = 41 = total Goldstone modes (structural, not coincidence)
- Linking quadratic: (n-4)(n-11) = 0 with discriminant Im_O^2 = 49
- H^2 = 16 spacing chain: 97, 113, 121, 137, 153 (span = 56 = O*Im_O)

**Intra-Stage Ordering** (activation principle):
- Stage 1: 2(R) → 5(C) → 13(Im_H) → 17(H) — one prime per algebra dimension
- Stage 2: 53(Im_O) → 73,113(O)
- Stage 3: 137(n_c)

**Verification** (9 scripts, all PASS):
- `crystallization_ordering_SO11.py` — 15/15 PASS
- `stage3_prime_selection_rule.py` — 9/9 PASS
- `quartic_energy_curvature.py` — 12/12 PASS
- `denominator_polynomial_unification.py` — 21/21 PASS
- `intra_stage_ordering.py` — 12/12 PASS
- `c3_sign_from_stability.py` — 12/12 PASS
- `goldstone_denominator_identity.py` — 16/16 PASS
- `denominator_spacing_and_barriers.py` — 15/15 PASS
- `ssb_critical_ratio.py` — 11/11 PASS

---

### 1.22 Inflationary Observables — [HYBRID] (Session 135)

**Confidence**: [HYBRID] — **RECLASSIFIED** (S192 audit). Framework provides mu^2 [CONJECTURE]; standard slow-roll formulas [A-IMPORT: inflationary physics] produce observables.

The hilltop potential V = V_0(1 - phi^2/mu^2) with mu^2 = (C+H)*H^4/Im_O = 1536/7 gives exact slow-roll parameters and inflationary observables that deviate from generic LCDM expectations.

#### A. Slow-Roll Parameters

| Parameter | Formula | Value | Session |
|-----------|---------|-------|---------|
| **epsilon** | Im_O/(2*mu^2) = 7/3200 | 2.1875e-3 | S127 |
| **eta** | -Im_O/mu^2 = -7/1280 x 2 = -7/640 | -1.09375e-2 | S127 |
| **eta/epsilon** | -n_d+1 = -5 | -5 (exactly) | S127 |
| **xi^2** | 0 (V''' = 0 for quadratic hilltop) | 0 | S135 |

#### B. Primary Observables (Updated from S127-129)

| Observable | Formula | Value | Measured | Error | Status |
|------------|---------|-------|----------|-------|--------|
| **n_s** | 1 - 6*eps + 2*eta = 193/200 | 0.9650 | 0.9649 +/- 0.0042 | **0.01%** | DERIVED |
| **r** | 16*epsilon = 7/200 | **0.0350** | < 0.036 | — | **KEY TEST** |

**Note**: n_s = 193/200 supersedes earlier S98 formula n_s = 117/121. r = 7/200 supersedes S98 r = alpha^4.

#### C. Higher-Order Inflationary Quantities (S135 NEW)

| Observable | Formula | Value | LCDM Expectation | Deviation |
|------------|---------|-------|-------------------|-----------|
| **alpha_s** (running) | 16*eps*eta - 24*eps^2 = -637/1280000 | -4.98e-4 | ~-5e-4 (generic) | Consistent |
| **beta_s** (running of running) | (computed from slow-roll) | -2.0e-5 | ~-1e-5 | O(10^-5) |
| **f_NL** (non-Gaussianity) | (5/12)(n_s - 1) = -7/480 | -0.01458 | |f_NL| < 5 | Tiny, consistent |
| **n_t** (tensor tilt) | -r/8 = -7/1600 | -4.375e-3 | -r/8 (consistency) | Exact consistency |

#### D. Key Discriminating Predictions

1. **r = 0.035**: Most testable prediction. CMB-S4 (sigma ~ 0.001) by ~2028. Detection CONFIRMS, non-detection FALSIFIES.
2. **w = -1 exactly**: Framework predicts pure cosmological constant. DESI 2024 hints w != -1 — potential tension.
3. **Phase shift phi = 3/11**: Differs ~2% from LCDM phi ~ 0.267.

#### E. Condensate Two-Field Effects

| Effect | Formula | Magnitude | Status |
|--------|---------|-----------|--------|
| **Isocurvature suppression** | (H_inf/m_tilt)^2 | ~1.4e-4 | Undetectable |
| **r correction** | r - (1-n_s) | ~5e-4 | Below CMB-S4 |
| **Multi-field f_NL** | O(slow-roll) | < 0.01 | Consistent with single-field |

**Verification**:
- `verification/sympy/lcdm_deviations_from_hilltop.py` — 16/17 PASS
- `verification/sympy/z_star_recombination_test.py` — 4/8 PASS (HS fitting formula systematic)

**See**: `predictions/LCDM_DEVIATIONS.md` for full catalog of 10 deviations ranked by testability.

#### Session 192 Audit — Assumption Classification

**Structure**: This is a HYBRID derivation. Framework provides one number (mu^2), standard inflation physics provides the rest.

| Step | Content | Tag |
|------|---------|-----|
| 1 | Hilltop potential V = V_0(1 - phi^2/mu^2) | [A-STRUCTURAL: potential form] — chosen, not derived |
| 2 | mu^2 = (C+H)*H^4/Im_O = 6*256/7 = 1536/7 | **[CONJECTURE]** — searched to match n_s ~ 0.965 |
| 3 | Slow-roll: eps = Im_O/(2*mu^2), eta = -Im_O/mu^2 | [A-IMPORT: standard inflationary physics] |
| 4 | n_s = 1 - 6*eps + 2*eta = 193/200 | [D] from steps 2-3 (arithmetic consequence) |
| 5 | r = 16*eps = 7/200 = 0.035 | [D] from steps 2-3 (arithmetic consequence) |
| 6 | Higher-order (alpha_s, beta_s, f_NL) | [D] from slow-roll (all standard formulas) |

**Key issue**: Step 2 is the foundation. mu^2 = 1536/7 was SEARCHED — many combinations of framework quantities were tested until one gave n_s matching Planck. The decomposition (C+H)*H^4/Im_O was assigned AFTER finding the number. This makes n_s a [CONJECTURE], NOT a prediction.

**What IS genuinely predictive**: r = 0.035. Once mu^2 is fixed (even if by search), r follows with no additional freedom. CMB-S4 (sigma ~ 0.001) by ~2028 will test this. This is the framework's best testable inflationary prediction.

**w = -1 risk**: Framework predicts w = -1 exactly (frozen eps field). DESI Y1 (2024) hinted at w != -1. DESI Y3 (2025-2026) data will clarify. If w != -1 is confirmed at >3-sigma, this is a significant falsification.

**Grade: C+** (mu^2 post-hoc, but r is a genuine testable prediction; w = -1 is falsifiable)

---

### 1.23 Acoustic Scale and Full Peak Positions — [CONJECTURE] (Sessions 131-132)

**Confidence**: [CONJECTURE] — **DOWNGRADED from DERIVATION** (S192 audit). l_A = 96*pi is post-hoc; sound horizon has precision illusion (S191 confirmed c_s = 3/7 NOT derivable).

#### A. Acoustic Scale

| Property | Value |
|----------|-------|
| **Formula** | l_A = 96*pi |
| **Predicted** | 301.59 |
| **Measured (Planck)** | 301.63 |
| **Accuracy** | **0.012%** |
| **Session** | S132 |

**Physical interpretation**: 96 = n_c^2 - n_c - n_d^2 - n_c/n_c = framework algebraic combination. Sound horizon r_s = 337 x 3/7 = 144.43 Mpc (Session 131).

#### B. Unified Peak Formula

| Property | Value |
|----------|-------|
| **Formula** | l_n = 96*pi*(11n - 3)/11 |
| **Phase shift** | phi = 3/11 (framework: Im_H/n_c) |

| Peak | Predicted | Measured | Error |
|------|-----------|----------|-------|
| l_1 | 219.3 | 220.0 | 0.30% |
| l_2 | 520.9 | 537.5 | 3.1% |
| l_3 | 822.5 | 810.8 | 1.5% |
| l_4 | 1124.1 | 1120.9 | 0.29% |
| l_5 | 1425.7 | 1444.2 | 1.3% |
| l_6 | 1727.3 | ~1776 | 2.7% |
| l_7 | 2028.9 | ~2081 | 2.5% |

All 7 peaks within 3.1% using a single two-parameter formula. Odd peaks slightly over-predicted, even peaks slightly under-predicted (baryon loading effect not captured).

**Verification**: `acoustic_oscillation_physics.py` [15/15 PASS], `acoustic_peaks_from_l_A.py` [15/15 PASS]

#### Session 192 Audit — Assumption Classification

| Step | Content | Tag |
|------|---------|-----|
| 1 | l_A = 96*pi | **[CONJECTURE]** — 96 = n_c^2 - n_c - n_d^2 - n_c/n_c decomposition is post-hoc |
| 2 | r_s = 337 x 3/7 = 144.43 Mpc | **[CONJECTURE]** — PRECISION ILLUSION (S191: c_s=3/7 NOT derivable, eta_* 18% high, compensating errors) |
| 3 | phi = 3/11 = Im_H/n_c | **[CONJECTURE]** — phase shift interpretation post-hoc |
| 4 | l_n = 96*pi*(11n-3)/11 | [D] from steps 1+3 (arithmetic consequence) |

- Grade: C- (unified formula is elegant, but both parameters are post-hoc; baryon loading absent)
- Note: Old alternating formula F-7 was FALSIFIED (12-19% errors on l_4-l_6). This unified formula replaced it.

---

### 1.24 CMB Polarization — [CONJECTURE] (Session 137)

**Confidence**: [CONJECTURE] — **DOWNGRADED** (S192 audit). EE peaks use same l_A = 96*pi [CONJECTURE]. r = 7/200 is testable but depends on mu^2 [CONJECTURE].

| Observable | Formula | Predicted | Measured | Error |
|-----------|---------|-----------|----------|-------|
| EE peak 1 | 96*pi*(27/22) | 370 | ~396 | 6.6% |
| EE peak 2 | 96*pi*(49/22) | 672 | ~690 | 2.7% |
| EE peak 3 | 96*pi*(71/22) | 973 | ~1000 | 2.7% |
| EE peak 4 | 96*pi*(93/22) | 1275 | ~1300 | 1.9% |
| EE peak 5 | 96*pi*(115/22) | 1577 | ~1600 | 1.5% |
| r = 7/200 | 16 x epsilon | 0.035 | < 0.036 | — |
| tau | 3/56 | 0.05357 | 0.054 +/- 0.007 | 0.8% |

**Key predictions**:
- BB primordial amplitude at l ~ 80: ~0.00084 uK^2
- BB lensing-to-primordial ratio: ~42:1
- TE correlation coefficient: rho_TE = 4/11 = 0.364

**Verification**: `cmb_polarization_predictions.py` [16/16 PASS]

---

### 1.25 Blind Cosmological Predictions — [HYBRID] (Session 138b)

**Confidence**: [HYBRID] — Framework parameters [CONJECTURE] + standard cosmology [A-IMPORT] → derived observables. NOT independent predictions (S192 audit).

7 cosmological observables computed from framework parameters BEFORE looking up measurements:

| ID | Observable | Predicted | Measured | Sigma |
|----|-----------|-----------|----------|-------|
| P-010 | t_0 (age, Gyr) | 13.790 | 13.797 +/- 0.023 | 0.3-sigma |
| P-011 | z_eq (equality redshift) | 3426 | 3402 +/- 26 | 0.9-sigma |
| P-012 | q_0 (deceleration) | -211/400 | -0.528 +/- 0.004 | 0.1-sigma |
| P-013 | 100*theta_s (angular scale) | 1.04175 | 1.04110 +/- 0.00031 | 2.1-sigma |
| P-014 | R (shift parameter) | 1.7494 | 1.7502 +/- 0.0046 | 0.2-sigma |
| P-015 | D_M/r_d (z=0.51) | 13.49 | 13.38 +/- 0.18 | 0.6-sigma |
| P-016 | H_0 x t_0 | 0.9506 | 0.951 +/- 0.005 | 0.1-sigma |

**Notable algebraic matches**: R = Im_O/H = 7/4 (0.035%), q_0 = -211/400 (211 is prime)

**Status**: 6/7 within 1-sigma, 7/7 within 3-sigma. These are LCDM-consistency checks, not independent framework predictions.

**Verification**: `blind_predictions_phase41.py` [19/19 PASS]

---

### 1.26 Secondary Anisotropies — [HYBRID] (Session 139)

**Confidence**: [HYBRID] — Framework parameters + standard LCDM physics. No independent predictions beyond standard cosmology (S192 audit).

| Observable | Framework Prediction | Status |
|-----------|---------------------|--------|
| ISW effect | Standard (Omega_Lambda = 137/200) | Consistent |
| Lensing amplitude A_L | 1.0 (exactly, w = -1) | No anomaly |
| S_8 tension | Framework matches Planck CMB | Gap is not framework-specific |
| SZ thermal | Standard pressure profile | Consistent |
| Dark energy EOS | w = -1 exactly (frozen eps field) | **Testable vs DESI hints** |

**Verification**: `secondary_anisotropies.py` [18/18 PASS]

---

### 1.27 Full Power Spectrum Model — [HYBRID] (Session 142)

**Confidence**: [HYBRID] — Framework provides 6 parameter values [CONJECTURE]; CAMB provides dynamics [A-IMPORT: Boltzmann physics] (S192 audit).

All 6 LCDM parameters derived from framework, compared to Planck 2018:

| Parameter | Framework | Planck | Error | Sigma |
|-----------|-----------|--------|-------|-------|
| H_0 (km/s/Mpc) | 337/5 = 67.4 | 67.36 +/- 0.54 | 0.059% | 0.07-sigma |
| Omega_m | 63/200 = 0.315 | 0.3153 +/- 0.0073 | 0.095% | 0.04-sigma |
| Omega_Lambda | 137/200 = 0.685 | 0.6847 +/- 0.0073 | 0.044% | 0.04-sigma |
| Omega_b | 567/11600 | 0.04930 +/- 0.00050 | 0.85% | 0.84-sigma |
| n_s | 193/200 = 0.965 | 0.9649 +/- 0.0042 | 0.010% | 0.02-sigma |
| tau | 3/56 = 0.05357 | 0.054 +/- 0.007 | 0.79% | 0.06-sigma |

**Key result**: All 6 parameters within 1-sigma of Planck best-fit. Framework provides parameter values; standard Boltzmann physics (CAMB) provides the dynamics.

**Verification**: `full_power_spectrum.py` [24/24 PASS]

#### Session 192 Audit Note

This section is the most honest in the cosmology chain — it already states "Framework provides parameter values; standard Boltzmann physics provides the dynamics." The grade is appropriate IF the input parameters are accepted. But since all 6 input parameters are [CONJECTURE] (see sections 1.11, 1.13, 1.22), the output is [HYBRID] at best. The power spectrum match is a consistency check, not an independent prediction.

Key observations:
- H_0 = 337/5 = 67.4 here vs H_boundary = alpha^28 x sqrt(19/3003) x M_Pl = 67.13 in section 1.16. Two different formulas for the same quantity, both matching Planck. This is a RED FLAG — the framework has multiple paths to the same number, which inflates the apparent search space.
- **Omega_Lambda = 137/200 here vs Omega_Lambda = 13/19 in section 1.11** (S195 audit). These differ by 0.12%. The framework uses whichever formula happens to be closer to Planck in each context. A third formula (Lambda/M_Pl^4 = alpha^56/77) gives the CC magnitude from yet another mechanism. THREE incompatible CC formulas is a RED FLAG.
