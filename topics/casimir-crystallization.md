# Topic: Casimir Effect and Crystallization

**Current state**: Core Casimir-crystallization correspondence established. E1-E3 explored (S156), E5 done (S152). CC problem NOT solved. E4/E6 remain open but low priority.

---

## What Works

- **Casimir = crystallization pressure on vacuum**: Conducting plates enforce C-channel orthogonality. (S150)
- **Tilt matrix 16 DOF decomposition**: 4 diagonal (massive) + 12 off-diagonal (gauge). (S150)
- **Channel hierarchy**: Only C-channel (photon, 2 modes) at macroscopic distances. (S150)
- **QCD confinement = O-channel Casimir**: Same mechanism, different division algebra channel. [CONJECTURE] (S150)
- **QCD beta coefficients = framework numbers**: b_0=33=Im_H*n_c, b_1=153=Im_H^2*17, b_3=Im_O. (S152)
- **Luscher term = piC/(O*Im_H) = pi/12** with 24 = O*Im_H = n_d!. (S152)
- **CC overcounting reduced**: 10^120 -> 10^109 by alpha^6 factor. But CC NOT solved. (S156)
- **Tilt Casimir properties**: l_tilt ~ 566 l_Planck. Tilt/EM ratio = n_d/C = 2. (S156)

## What Failed / Dead Ends

- **CC solution**: Mexican hat ground state has DIFFERENT alpha power than vacuum energy. No cancellation mechanism. (S156)
- **sqrt(sigma) = 8m_p/17**: Pattern-matched (HRS=6), not derived from QCD dynamics. (S152)
- **17/24 constituent mass ratio**: Cannot derive analytically from non-perturbative QCD. (S152)
- **Lab-scale Casimir deviations**: None predicted. Framework reproduces standard result exactly. (S150, S156)

## Open Paths (Low Priority)

1. **E4**: Cross-channel Casimir (different channel pairs between different boundaries)
2. **E6**: 240 = n_d^2 x 15 and zeta function connection
3. **BH endpoint**: M ~ 300 M_Pl where T_BH ~ m_tilt (quantum gravity connection)
4. **Lattice test**: m_constituent/sqrt(sigma) = 17/24 — needs better lattice data

## Sessions

| Session | Work | Key Result |
|---------|------|------------|
| S150 | Casimir as crystallization pressure | 6 findings, 6 exploration directions (E1-E6) |
| S152 | QCD string tension from O-channel | Beta coefficients, Luscher decomposition, sqrt(sigma) conjecture |
| S156 | E1 (horizons), E2 (CC), E3 (Unruh) | All explored, CC not solved, no new predictions |

## Key Files

| File | Content |
|------|---------|
| `framework/investigations/quantum/casimir_crystallization_pressure.md` | Master investigation |
| `framework/investigations/gauge/qcd_string_tension_o_channel.md` | S152 findings |
| `verification/sympy/casimir_tilt_mode_decomposition.py` | 12/12 PASS (S150) |
| `verification/sympy/qcd_string_tension_from_framework.py` | 18/18 PASS (S152) |
| `verification/sympy/casimir_deeper_E1_E2_E3.py` | 14/14 PASS (S156) |
