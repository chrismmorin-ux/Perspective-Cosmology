# Weak Decays Sub-Catalog

**Status**: ACTIVE
**Created**: 2026-02-03 (Session 223)
**Parent**: `framework/CRYSTALLIZATION_CATALOG.md` (C10: Weak Decay)
**Layer**: Mixed (Layer 1 mode counting + Layer 2 correspondence + Layer 3 predictions)

---

## Disclaimer

This sub-catalog is **majority [STANDARD-RELABELED]**. The framework constrains the *number of decay channels* (via Im_H = 3 and N_c = 3) but does not predict individual *decay rates* — those require G_F, CKM elements, and fermion masses as [A-IMPORT]. The CKM matrix values remain a major gap. Honest tagging is applied throughout.

---

## Processes

### Neutron Beta Decay

**Chain**: C10(H-channel: d→u) → C4(collapse to definite state)
**Tag**: [STANDARD-RELABELED]

**Before → After**:
- Physical: n → p + e⁻ + ν̄_e
- Tilt: H-channel tilt excess on d-quark transfers to u-quark via virtual W; remaining tilt exits as lepton pair

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Mediates d→u flavor change via W⁻ | 1 (single mode) |
| C (EM) | Coulomb interaction in final state | Correction only |
| O (Strong) | Binds quarks inside nucleons | Spectator |
| R (Gravity) | Negligible at this scale | — |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Decay mode | 1 mode (d→u only) | Confirmed | — | [STANDARD-RELABELED] |
| τ_n | Not predicted | 878.4 ± 0.5 s | — | PDG 2024 |
| V_ud | Not derived [A-IMPORT] | 0.97435(16) | — | PDG 2024 |
| g_A | Not derived [A-IMPORT] | 1.2756(13) | — | PDG 2024 |

**What framework adds**: H-channel identification of weak vertex; generation transition in Im(H) space
**What is imported**: G_F, V_ud, g_A, nucleon masses — ALL inputs for rate calculation
**Verification**: `weak_decay_mode_counting.py` (16/16 PASS)
**Confidence**: [STANDARD-RELABELED] for rate; [CONJECTURE] for Im(H) generation mapping

---

### Muon Decay

**Chain**: C10(H-channel: μ→e generation transition) → C4(collapse)
**Tag**: [STANDARD-RELABELED]

**Before → After**:
- Physical: μ⁻ → e⁻ + ν_μ + ν̄_e
- Tilt: H-channel generation-2 tilt transitions to generation-1; energy exits as lepton pair

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Mediates μ→e generation change via W | 1 (only lighter lepton available) |
| C (EM) | Radiative corrections (μ→eγ at 1-loop) | O(α) correction |
| O (Strong) | Not involved (purely leptonic) | — |
| R (Gravity) | Negligible | — |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Decay modes | 1 dominant (e channel) | ~100% | — | PDG 2024 |
| τ_μ (Born) | 192π³ℏ/(G_F²m_μ⁵) = 2.187 μs | 2.197 μs | 0.44% | PDG 2024 |
| BR(μ→eνν) | ~100% | 100% (by definition) | — | PDG 2024 |

**What framework adds**: Mode counting — only 1 leptonic channel (tau too heavy). H-channel interpretation.
**What is imported**: G_F, m_μ — fully determine the rate
**Verification**: `weak_decay_mode_counting.py` (16/16 PASS)
**Confidence**: [STANDARD-RELABELED] for rate; [CONJECTURE] for generation mapping

**Note**: The muon mass ratio m_μ/m_e = Φ₆(43) = 206.786 is a separate framework prediction ([CONJECTURE], Tier 1 at 4.1 ppm). If confirmed, it would upgrade the muon lifetime to [FRAMEWORK-CONSTRAINED] since m_μ⁵ dominates the rate.

---

### Charged Pion Decay

**Chain**: C10(H-channel: ud̄ annihilation via W) → C4(collapse to lepton pair)
**Tag**: [STANDARD-RELABELED]

**Before → After**:
- Physical: π⁺ (ud̄) → μ⁺ + ν_μ (dominant); π⁺ → e⁺ + ν_e (suppressed)
- Tilt: O-channel bound state (pion) converts tilt to H-channel (weak) then exits as lepton

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Mediates qq̄ annihilation via W | 2 (μ and e channels) |
| C (EM) | Radiative corrections | Small |
| O (Strong) | Pion as qq̄ bound state; f_π sets amplitude | Enters via decay constant |
| R (Gravity) | Negligible | — |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Dominant mode | π→μν (helicity favored) | BR = 99.99% | — | PDG 2024 |
| R_π = Γ(eν)/Γ(μν) | (m_e/m_μ)² × phase space | 1.233 × 10⁻⁴ | 4.1% | PDG 2024 |
| τ_π | Not predicted | 26.033 ± 0.005 ns | — | PDG 2024 |
| f_π | Not derived [A-IMPORT] | 130.2 ± 0.8 MeV | — | PDG/lattice |

**What framework adds**: Helicity suppression structure (V-A); if m_μ/m_e = Φ₆(43), the suppression ratio is [FRAMEWORK-CONSTRAINED]
**What is imported**: f_π, V_ud, fermion masses
**Verification**: `weak_decay_mode_counting.py` (R_π test, 16/16 PASS)
**Confidence**: [STANDARD-RELABELED] for mechanism; [FRAMEWORK-CONSTRAINED] for R_π if m_μ/m_e confirmed

---

### Kaon Decays

**Chain**: C10(H-channel: s→u transition, CKM-suppressed) → C4 → C8/C10 (various final states)
**Tag**: [STANDARD-RELABELED]

**Before → After**:
- Physical: K⁺ → μ⁺ν_μ (63.6%), K⁺ → π⁺π⁰ (20.7%), K⁺ → π⁰e⁺ν_e (5.1%), etc.
- Tilt: Generation-2 (strange) quark transfers to generation-1 (up/down) via H-channel

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Mediates s→u (Cabibbo-suppressed) | Multiple final states |
| C (EM) | Enters radiative modes (K→πγ, K→πeν) | Secondary |
| O (Strong) | Kaon/pion as qq̄ bound states | Via decay constants |
| R (Gravity) | Negligible | — |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| V_us | Not derived [A-IMPORT] | 0.22500(67) | — | PDG 2024 |
| K⁺ lifetime | Not predicted | 12.380(20) ns | — | PDG 2024 |
| K_L-K_S mass diff | Not predicted | 3.484(6) × 10⁻¹² MeV | — | PDG 2024 |
| ε (CP violation) | Not predicted | 2.228(11) × 10⁻³ | — | PDG 2024 |

**What framework adds**: Identification as generation-2→generation-1 H-channel transition. CKM suppression (V_us ≈ 0.225) reflects angle between Im(H) directions. CP violation in K system requires complex CKM phase.
**What is imported**: CKM elements, meson decay constants, all rate inputs
**Verification**: Needed (no framework-specific predictions to verify)
**Confidence**: [STANDARD-RELABELED] — crystallization language adds no predictive content for kaon physics

**Gap**: The framework claims CKM should emerge from Im(H) generation structure, but provides no mechanism to derive V_us ≈ 0.225 or the CP phase δ ≈ 65.5°. This is the single most important gap in C10.

---

### Tau Decay

**Chain**: C10(H-channel: τ→lighter generations) → C4 → {C8 (EM final states), C12 (hadronic final states)}
**Tag**: [FRAMEWORK-CONSTRAINED]

**Before → After**:
- Physical: τ⁻ → e⁻ν̄_eν_τ (17.82%), τ⁻ → μ⁻ν̄_μν_τ (17.39%), τ⁻ → hadrons + ν_τ (64.79%)
- Tilt: Generation-3 H-channel tilt transitions to generation-1 or -2 (leptonic) or to O-channel (hadronic)

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | Mediates τ→e/μ/qq' via virtual W | 2 leptonic + N_c hadronic |
| C (EM) | QED corrections to leptonic modes | O(α) |
| O (Strong) | Hadronic final states; QCD corrections | R_τ = N_c × (1+QCD) |
| R (Gravity) | Negligible | — |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| Leptonic modes | 2 (e, μ) | Confirmed | 0% | [DERIVATION: Im_H−1] |
| R_τ (Born) | N_c = 3 | — | — | [DERIVATION: SU(3)] |
| R_τ (corrected) | 3 × S_EW × (1+δ) ≈ 3.54 | 3.64 | 2.7% | PDG 2024 |
| BR(τ→eνν) | 18.1% | 17.82% | 1.3% | PDG 2024 |
| BR(τ→μνν) | 18.1% | 17.39% | 3.8% | PDG 2024 |
| BR(τ→had) | 63.9% | 64.79% | 1.4% | PDG 2024 |

**What framework adds**: Mode counting — R_τ = N_c at Born level, with N_c = 3 from SU(3) [DERIVATION]. The 2 leptonic + N_c×(CKM sum) hadronic structure is [FRAMEWORK-CONSTRAINED]. QCD corrections run with b₀ = Im_O = 7 [DERIVATION].
**What is imported**: α_s(m_τ), S_EW, higher-order QCD coefficients
**Verification**: `weak_decay_mode_counting.py` (tau BR tests, 16/16 PASS)
**Confidence**: [FRAMEWORK-CONSTRAINED] for branching structure; [DERIVATION] for N_c = 3; [A-IMPORT] for QCD corrections

**Note**: Tau decay is the strongest weak-decay test of the framework's mode counting. The R_τ = N_c result at Born level is a genuine structural prediction, although it's also a standard QCD result.

---

## Summary

| Process | Tag | Framework Content | Scripts |
|---------|-----|-------------------|---------|
| Neutron beta decay | [STANDARD-RELABELED] | H-channel identification only | `weak_decay_mode_counting.py` |
| Muon decay | [STANDARD-RELABELED] | 1 mode count; m_μ/m_e connection | `weak_decay_mode_counting.py` |
| Pion decay | [STANDARD-RELABELED] | R_π if m_μ/m_e confirmed | `weak_decay_mode_counting.py` |
| Kaon decays | [STANDARD-RELABELED] | Generation mapping only; CKM gap | Needed |
| Tau decay | [FRAMEWORK-CONSTRAINED] | R_τ = N_c = 3 (Born) | `weak_decay_mode_counting.py` |

**Honest count**: 1/5 entries [FRAMEWORK-CONSTRAINED], 4/5 [STANDARD-RELABELED]. This sub-catalog is majority relabeled. The CKM matrix derivation remains the critical missing piece.

---

*Created: 2026-02-03 (S223)*
