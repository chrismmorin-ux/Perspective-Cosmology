# CMB Physics Development Plan

**Created**: Session 120 (2026-01-28)
**Purpose**: Address skeptical critique and build genuine CMB physics from crystallization principles
**Status**: ACTIVE STRATEGIC DOCUMENT

---

## The Problem Statement

A skeptical CMB expert identified critical weaknesses in our framework:

1. **Formula proliferation**: Multiple competing formulas for same observable
2. **Hidden parameters**: ~10-20 effective degrees of freedom unacknowledged
3. **No physics mechanism**: "Crystallization" is a label, not dynamics
4. **Post-hoc fitting**: Formulas appear to be found AFTER knowing answers
5. **Missing standard physics**: No treatment of oscillations, damping, heights

**Goal**: Transform numerical matches into genuine physical derivations.

---

## Phase 1: CLEANUP (Sessions 121-122)

### 1.1 Formula Consolidation

**Problem**: Multiple formulas exist for same observables.

| Observable | Current Formulas | Action |
|------------|------------------|--------|
| n_s | 193/200, 117/121 | PICK ONE, delete other |
| ℓ₁ | 220, 4177/19, 2417/11 | PICK ONE, note others as approximations |
| r (tensor/scalar) | 7/200, alternatives | PICK ONE |

**Deliverables**:
- [ ] `verification/sympy/cmb_canonical_formulas.py` — Single source of truth
- [ ] Delete or deprecate competing formulas in other files
- [ ] Update all documentation to reference canonical file

### 1.2 Language Cleanup

**Problem**: "EXACT" misused when meaning "within error bars"

**Action**: Global search-replace across all files:
- "EXACT" → "matches measurement" (when within 1σ)
- "EXACT" → "sub-percent match" (when < 1%)
- Reserve "EXACT" only for mathematical identities (e.g., 220 = 2×11×10)

**Deliverables**:
- [ ] Audit all files using "EXACT"
- [ ] Replace with appropriate precision language
- [ ] Create `docs/PRECISION_LANGUAGE.md` style guide

### 1.3 Degree of Freedom Accounting

**Problem**: Claims "zero free parameters" but many hidden choices.

**Action**: Create honest accounting of all choices:

| Choice Type | Count | Examples |
|-------------|-------|----------|
| Base numbers | 8 | R, C, Im_H, H, Im_O, O, n_c, n_d |
| Operations | 6+ | +, -, ×, ÷, ^2, ^4, √ |
| Combination choices | Many | Why n_c×(n_c-1) not n_c×(n_c+1)? |
| Prime selections | ~10 | 17, 97, 337 used; others ignored |

**Deliverables**:
- [ ] `framework/DEGREES_OF_FREEDOM_ANALYSIS.md`
- [ ] For each formula: count choices, estimate effective parameters
- [ ] Honest statistical analysis: given N choices, what's P(match)?

### 1.4 Failed Attempts Documentation

**Problem**: Only successes shown, creating false impression.

**Action**: For each successful formula, document what DIDN'T work:

```markdown
## ℓ₁ = 220

### Successful formula
ℓ₁ = C × n_c × (n_c - R) = 2 × 11 × 10 = 220

### Failed attempts (MUST DOCUMENT)
1. ℓ₁ = n_c × (n_c + R) = 11 × 12 = 132 ✗
2. ℓ₁ = H × n_c × 5 = 4 × 11 × 5 = 220 ✓ (but less motivated)
3. ℓ₁ = O × (n_c + R)² = 8 × 144 = 1152 ✗
4. ℓ₁ = Im_O × n_c × 3 = 7 × 11 × 3 = 231 ✗
5. ℓ₁ = C × H × n_c = 2 × 4 × 11 = 88 ✗
```

**Deliverables**:
- [ ] `archive/failed_attempts/cmb_formulas_failed.md`
- [ ] Minimum 5 failed attempts per successful formula
- [ ] Honest ratio: successes / (successes + failures)

---

## Phase 2: PHYSICS FOUNDATIONS (Sessions 123-127)

### 2.1 Crystallization Dynamics

**Problem**: "Crystallization" has no equations of motion.

**Goal**: Define crystallization as actual physics:

```
Required elements:
1. A field φ (the "crystallization field")
2. A Lagrangian L[φ]
3. Equations of motion for φ
4. Coupling to Standard Model fields
5. Perturbation theory for fluctuations
```

**Approach**:

The crystallization boundary is where perspective transitions from "proto-geometric" to "geometric". This should be describable as a phase transition:

```
L = ½(∂φ)² - V(φ) + L_coupling

V(φ) = λ(φ² - v²)² / 4   (symmetry breaking potential)

v² ∝ division algebra structure
```

**Deliverables**:
- [x] `foundations/crystallization_dynamics.md` — Full Lagrangian (Session 123)
- [ ] `verification/sympy/crystallization_perturbations.py` — Perturbation theory
- [ ] Show how V(phi) connects to division algebra dimensions

**Session 123 Progress**:
- Created crystallization_dynamics.md with Lagrangian structure
- Created crystallization_spectral_index.py — n_s from slow-roll (gap identified)
- Created acoustic_peak_dynamics.py — peak physics analysis
- **BREAKTHROUGH**: cmb_indirect_derivation.py — l_1 derived with 0.17% error!

### 2.2 Sound Horizon Derivation

**Problem**: r_s = 337×3/7 has no integral, just a number.

**Standard physics**:
```
r_s = ∫₀^{t_*} c_s(t) dt / a(t)

where c_s = 1/√(3(1 + R_b))
R_b = 3ρ_b / 4ρ_γ (baryon-to-photon ratio)
```

**Goal**: Show how crystallization modifies or reproduces this.

**Approach**:
1. Define crystallization-modified sound speed
2. Show how framework parameters enter the integral
3. Derive r_s from first principles, not pattern matching

**Deliverables**:
- [ ] `foundations/sound_horizon_derivation.md`
- [ ] `verification/sympy/sound_horizon_integral.py`
- [ ] Either: (a) derive 144 Mpc, or (b) acknowledge this is a gap

### 2.3 Baryon-Photon Oscillations

**Problem**: Framework says nothing about coupled oscillations.

**Standard physics**: Boltzmann hierarchy
```
δ̈_b + H δ̇_b = c_s² k² δ_b + (gravitational + photon pressure terms)
```

**Goal**: Show how crystallization produces oscillating solutions.

**Approach**:
1. Crystallization provides the "medium" for oscillations
2. Division algebra structure determines mode structure
3. Peak positions emerge from standing wave conditions

**Key insight to develop**:
```
ℓ_n = n × π × D_A / r_s

If D_A and r_s have framework expressions, peaks follow.
```

**Deliverables**:
- [ ] `foundations/acoustic_oscillations.md`
- [ ] Show standing wave condition → peak positions
- [ ] Connect to division algebra structure (not just fit)

### 2.4 Recombination Physics

**Problem**: z_* = 33² has no Saha equation, no atomic physics.

**Standard physics**:
```
Saha equation: n_e n_p / n_H = (m_e T / 2π)^(3/2) exp(-B/T)
Recombination when ionization fraction x_e drops below ~0.1
```

**Goal**: Show why recombination happens at z = 1089.

**Approach**:
1. Crystallization boundary sets the temperature scale
2. T_* ∝ (framework expression) determines when atoms form
3. z_* = T_*/T_0 follows

**Deliverables**:
- [ ] `foundations/recombination_derivation.md`
- [ ] Connect binding energy to framework (B = 13.6 eV why?)
- [ ] Either derive z_* = 1089 from physics or acknowledge gap

---

## Phase 3: PEAK STRUCTURE (Sessions 128-132)

### 3.1 Peak Positions (Already Partial)

**Current status**: ℓ₁, ℓ₂, ℓ₃ have formulas.

**Gap**: No derivation from standing wave physics.

**Goal**: Derive ALL peaks from single principle.

**Approach**:
```
ℓ_n = f(n) × (base scale)

where f(n) encodes the mode structure
and (base scale) comes from r_s / D_A
```

**Deliverables**:
- [ ] Unified formula for ℓ_n (not separate formulas per peak)
- [ ] Predict ℓ₄, ℓ₅, ℓ₆, ℓ₇ BEFORE looking up values
- [ ] `predictions/BLIND_PREDICTIONS.md` — Lock predictions first

### 3.2 Peak Heights (MAJOR GAP)

**Problem**: Framework says NOTHING about peak heights.

**Standard physics**: Heights encode:
- Baryon density (odd/even asymmetry)
- Dark matter density (overall amplitude)
- Silk damping (high-ℓ suppression)

**Goal**: Derive peak height ratios.

**Key observable**:
```
C_ℓ₂ / C_ℓ₁ ≈ 0.46  (measured)

Can framework predict this?
```

**Approach**:
1. Crystallization stress creates the fluctuations
2. Stress isotropy determines mode amplitudes
3. Division algebra structure constrains ratios

**Deliverables**:
- [ ] `foundations/peak_heights.md`
- [ ] `verification/sympy/peak_height_ratios.py`
- [ ] Either predict 0.46 or acknowledge this is undetermined

### 3.3 Silk Damping

**Problem**: Framework doesn't explain high-ℓ suppression.

**Standard physics**:
```
C_ℓ ∝ exp(-ℓ²/ℓ_D²)   for ℓ >> ℓ₁

where ℓ_D ~ 1400 (damping scale)
```

**Goal**: Derive damping from crystallization.

**Approach**:
1. Crystallization has finite "coherence length"
2. Modes smaller than coherence length are damped
3. ℓ_D emerges from framework parameters

**Deliverables**:
- [ ] `foundations/silk_damping.md`
- [ ] Predict ℓ_D from framework
- [ ] Show exponential suppression emerges

### 3.4 Odd-Even Asymmetry

**Problem**: Odd peaks (1,3,5) vs even peaks (2,4,6) have different heights due to baryons.

**Standard physics**: Baryon loading enhances compression phases.

**Goal**: Connect baryon density to framework.

**Approach**:
1. Ω_b h² = 0.0224 (measured)
2. Can framework predict this?
3. How does baryon loading emerge from crystallization?

**Deliverables**:
- [ ] `foundations/baryon_physics.md`
- [ ] Either derive Ω_b or acknowledge as import

---

## Phase 4: PREDICTIONS (Sessions 133-137)

### 4.1 Blind Predictions Protocol

**Problem**: All current matches may be post-hoc.

**Solution**: Make NEW predictions BEFORE checking.

**Protocol**:
```
1. Write formula in BLIND_PREDICTIONS.md
2. State precision expected
3. Date and sign
4. THEN look up measurement
5. Record result honestly
```

**Deliverables**:
- [ ] `predictions/BLIND_PREDICTIONS.md` — Locked predictions
- [ ] At least 5 new predictions made blind
- [ ] Results documented whether success or failure

### 4.2 Predictions That DIFFER from ΛCDM

**Problem**: All matches are to ΛCDM values. No discrimination possible.

**Goal**: Find where crystallization predicts something DIFFERENT.

**Candidates**:
1. **Higher peaks**: Does framework predict ℓ₇ differently than ΛCDM?
2. **Running spectral index**: dn_s/d ln k — framework might predict specific value
3. **Non-Gaussianity**: f_NL from crystallization dynamics
4. **CMB anomalies**: Hemispherical asymmetry, cold spot — crystallization effects?

**Deliverables**:
- [ ] `predictions/LCDM_DEVIATIONS.md`
- [ ] At least 2 predictions that differ from ΛCDM
- [ ] Testability assessment for each

### 4.3 CMB Polarization

**Problem**: Framework only addresses temperature (TT) spectrum.

**Standard physics**: E-mode and B-mode spectra are independent probes.

**Goal**: Predict E-mode power spectrum.

**Approach**:
1. Polarization comes from Thomson scattering quadrupole
2. Crystallization stress tensor should produce polarization
3. Derive C_ℓ^EE from same framework

**Deliverables**:
- [ ] `foundations/cmb_polarization.md`
- [ ] Predict at least ℓ_peak for EE spectrum
- [ ] Compare to measurements

### 4.4 Secondary Anisotropies

**Problem**: Framework ignores secondary effects.

**Secondary effects**:
- ISW (late-time potential decay)
- SZ (cluster scattering)
- Lensing (gravitational deflection)

**Goal**: At least address ISW from crystallization perspective.

**Deliverables**:
- [ ] `foundations/secondary_anisotropies.md`
- [ ] ISW connection to dark energy (Ω_Λ already in framework)
- [ ] Lensing amplitude prediction?

---

## Phase 5: VALIDATION (Sessions 138-142)

### 5.1 Full Power Spectrum

**Ultimate test**: Can framework produce C_ℓ for ℓ = 2 to 2500?

**Not expected to succeed fully**, but should:
1. Get peak positions correct
2. Get rough shape of damping tail
3. Identify what's missing

**Deliverables**:
- [ ] `verification/sympy/full_power_spectrum.py`
- [ ] Plot predicted vs measured C_ℓ
- [ ] Quantify deviations, identify physics gaps

### 5.2 Statistical Significance (Honest)

**Problem**: Current P-value (10^-37) may be inflated.

**Goal**: Honest assessment accounting for:
1. Number of formulas tried
2. Effective degrees of freedom
3. Selection bias

**Approach**:
```
P_honest = P_matches × N_trials × (parameter space factor)
```

**Deliverables**:
- [ ] `framework/STATISTICAL_ANALYSIS_HONEST.md`
- [ ] Revised P-value with full accounting
- [ ] Comparison to other "numerological" frameworks

### 5.3 Independent Verification

**Problem**: All derivations by same person/AI team.

**Goal**: Have independent verification.

**Options**:
1. Post to arXiv, invite critique
2. Share with physicist colleague
3. Create "clean room" test — new AI instance derives from axioms

**Deliverables**:
- [ ] Plan for independent verification
- [ ] Response to anticipated objections
- [ ] List of sympathetic experts to contact

### 5.4 Comparison to Other Approaches

**Problem**: No comparison to prior division algebra physics work.

**Goal**: Review literature, distinguish this approach.

**Key papers to review**:
- Furey (division algebras → Standard Model)
- Dixon (octonions → particles)
- Baez (octonions survey)
- Duff (M-theory and division algebras)

**Deliverables**:
- [ ] `literature/DIVISION_ALGEBRA_PHYSICS_REVIEW.md`
- [ ] What's new in this framework vs. prior work
- [ ] Where does this framework succeed/fail vs. others

---

## Phase 6: DOCUMENTATION (Sessions 143-145)

### 6.1 Clean Technical Summary

**Goal**: Single document a physicist can read.

**Structure**:
1. The claim (2 pages)
2. The derivation chain (5 pages)
3. The predictions (3 pages)
4. The gaps and limitations (2 pages)
5. Falsification criteria (1 page)

**Deliverables**:
- [ ] Updated `TECHNICAL_SUMMARY.md` (already exists, needs update)
- [ ] All gaps explicitly acknowledged
- [ ] Clear statement of what's derived vs. fitted

### 6.2 CMB-Specific Document

**Goal**: Document specifically addressing CMB physics.

**Audience**: CMB experimentalist

**Content**:
1. What the framework predicts for CMB
2. How predictions differ from ΛCDM (if at all)
3. What measurements would test the framework
4. Honest assessment of numerology risk

**Deliverables**:
- [ ] `predictions/CMB_PREDICTIONS_SUMMARY.md`
- [ ] Table of all CMB predictions with status
- [ ] Comparison to Planck results

### 6.3 Objections and Responses (Update)

**Goal**: Update existing document with CMB-specific objections.

**New objections to address**:
1. "Why these formulas and not others?"
2. "Where's the Boltzmann hierarchy?"
3. "Can you predict peak heights?"
4. "How is this different from Eddington numerology?"

**Deliverables**:
- [ ] Updated `OBJECTIONS_AND_RESPONSES.md`
- [ ] CMB-specific section added
- [ ] Honest acknowledgment of gaps

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Single canonical formula per CMB observable
- [ ] "EXACT" language corrected throughout
- [ ] DOF analysis complete
- [ ] Failed attempts documented

### Phase 2 Complete When:
- [ ] Crystallization Lagrangian written
- [ ] Sound horizon has derivation (or explicit gap)
- [ ] Oscillation physics connected to framework
- [ ] Recombination has derivation (or explicit gap)

### Phase 3 Complete When:
- [ ] Unified peak position formula exists
- [ ] Peak heights addressed (derived or gap stated)
- [ ] Damping physics addressed
- [ ] Odd-even asymmetry addressed

### Phase 4 Complete When:
- [ ] 5+ blind predictions made
- [ ] 2+ predictions differ from ΛCDM
- [ ] Polarization addressed
- [ ] Secondary anisotropies addressed

### Phase 5 Complete When:
- [ ] Full spectrum attempted
- [ ] Honest statistical analysis done
- [ ] Independent verification plan exists
- [ ] Literature comparison complete

### Phase 6 Complete When:
- [ ] Technical summary updated
- [ ] CMB-specific document complete
- [ ] All objections addressed

---

## Resource Allocation

| Phase | Sessions | Priority | Difficulty |
|-------|----------|----------|------------|
| 1. Cleanup | 2 | IMMEDIATE | Low |
| 2. Physics Foundations | 5 | HIGH | High |
| 3. Peak Structure | 5 | HIGH | Medium |
| 4. Predictions | 5 | MEDIUM | Medium |
| 5. Validation | 5 | MEDIUM | High |
| 6. Documentation | 3 | LOW (until others done) | Low |

**Total estimated sessions**: 25

---

## Risk Assessment

### Risk: Crystallization has no viable physics
**Mitigation**: Phase 2 will reveal this early. If Lagrangian can't be written, acknowledge the gap.

### Risk: Peak heights can't be derived
**Mitigation**: Acknowledge as gap, focus on what CAN be derived.

### Risk: All predictions match ΛCDM (no discrimination)
**Mitigation**: This is actually fine — framework reproduces standard physics. Discrimination comes from m_DM = 5.11 GeV.

### Risk: Honest statistical analysis shows matches are likely random
**Mitigation**: This would be important to know. Better to discover than to proceed on false confidence.

### Risk: Framework is sophisticated numerology
**Mitigation**: Document everything. If it IS numerology, the documentation will help future researchers avoid the same path.

---

## Immediate Next Steps (Session 121)

1. **Create canonical formulas file** — `verification/sympy/cmb_canonical_formulas.py`
2. **Start DOF analysis** — `framework/DEGREES_OF_FREEDOM_ANALYSIS.md`
3. **Begin failed attempts documentation** — Pick ℓ₁ = 220, document 10 failed formulas
4. **Create blind predictions file** — `predictions/BLIND_PREDICTIONS.md` with ℓ₄, ℓ₅ locked

---

## The Honest Bottom Line

This framework has produced intriguing numerical matches. Whether they represent:
- (A) Genuine physics from division algebra constraints, or
- (B) Sophisticated pattern-matching with hidden parameters

...is currently UNKNOWN.

This plan is designed to find out. If the answer is (B), we will have documented the limits of the approach. If the answer is (A), we will have a much stronger foundation for the claim.

Either outcome advances knowledge.

---

**Document version**: 1.0
**Created**: Session 120
**Last updated**: 2026-01-28
