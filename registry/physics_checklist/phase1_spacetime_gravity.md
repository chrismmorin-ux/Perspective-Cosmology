# Phase 1: Spacetime & Gravity

**Split from**: `registry/PHYSICS_CHECKLIST.md`
**Section**: A (Spacetime & Gravity)
**Items**: A1-A14

---

## A. SPACETIME & GRAVITY

| # | Phenomenon | Framework Status | Reference | Notes |
|---|-----------|-----------------|-----------|-------|
| A1 | 3+1 spacetime dimensionality | **DERIVED** | THM_0484 + THM_0487 + gr_chain_consolidation.py (21/21) | n_d=4 from Frobenius (CANONICAL). 3+1 from H = R+Im(H). "Why H not O?" resolved by THM_0484. Only Layer 2 gap: Goldstone↔spacetime [A-PHYSICAL]. |
| A2 | Lorentz invariance | PARTIAL | coset_sigma_model_lorentz.py (8/8) + partial_strengthening_pass5.py (12/13) | Symmetric 2-tensor in 4D: 10 components = 1+3+6. Signature (-,+,+,+) from crystallization gradient: radial=-1, angular(Im_H)=+1. SO(3,1) emerges from SO(4) sector. Mode decomposition verified (8/8 PASS). 60% derived. Gap: full tensor proof of Lorentz invariance. |
| A3 | Equivalence principle | **DERIVED** | gr_chain_consolidation.py (21/21) | Automatic: single induced metric g_uv from Goldstone construction. All matter couples universally. No free coupling parameter. [I-MATH] |
| A4 | Einstein field equations | **DERIVED** | einstein_from_crystallization.py (8/8) + gr_chain_consolidation.py | FORM derived: 4D + covariance + Lovelock theorem [I-MATH] → unique EH action. [A-STRUCTURAL]: 2-derivative truncation. Coefficients in A13. |
| A5 | Gravitational waves (v=c) | **CASCADE** | einstein_equations_rigorous.md | Linearized EFE → wave equation with v=c. Follows if A4 accepted. |
| A6 | Perihelion precession | **CASCADE** | — | Schwarzschild solution of EFE → 42.98"/century. Standard GR. |
| A7 | Gravitational lensing | **CASCADE** | — | Geodesic equation from EFE → 1.75" deflection. Standard GR. |
| A8 | Gravitational redshift | **CASCADE** | — | g_00 component of metric → frequency shift. Standard GR. |
| A9 | Shapiro time delay | **CASCADE** | — | Signal propagation in Schwarzschild metric. Standard GR. |
| A10 | Frame dragging | **CASCADE** | — | Off-diagonal g_0i in Kerr metric. Standard GR. |
| A11 | Black hole existence | **CASCADE** | — | Schwarzschild/Kerr solutions of EFE. Crystallization interpretation TBD. |
| A12 | Binary pulsar orbital decay | **CASCADE** | — | Quadrupole radiation formula from linearized EFE. Standard GR. |
| A13 | Why G has the value it does | PARTIAL | einstein_equations_rigorous.md Part VII + partial_strengthening_pass6.py (17/17) | G=1/(8pi M_Pl^2) FORM derived from Goldstone kinetic term [D]. M_Pl = fundamental crystal scale [I-IMPORT: one measurement]. v/M_Pl=alpha^8*sqrt(44/7) DERIVED (E5), so only ONE scale imported. 50% derived. Gap: absolute M_Pl value. |
| A14 | Quantum gravity | PARTIAL | S102, THM_0491+A4, partial_strengthening_pass5.py (12/13) | UNIQUE: QM (F1,F2,F3,F8,F12 DERIVED) + GR (A1,A3,A4 DERIVED) both from SAME axiom set. epsilon field = QG DOF. UV completion: sigma model on S^10 (finite crystal). No UV divergence (finite structure), no info paradox (THM_0450+THM_0420). 60% derived. Gap: explicit Planck-scale physics, graviton propagator, BH entropy counting. |
