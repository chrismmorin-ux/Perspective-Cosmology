# Formalization Queue

**Purpose**: Track work products that need their own file or formal update but were deferred to maintain session flow.
**Rule**: Every entry must include a reasoning sketch — enough to reconstruct the argument without the original conversation.

---

## How to Use

**During a session**: When a derivation, finding, or insight is produced but formalizing it now would interrupt flow, add an entry here instead.

**At session end**: Triage every entry:
- **Formalize now** — Write the file/update before closing the session
- **Defer** — Leave in queue with a target session or priority note
- **Discard** — Remove if superseded or not worth formalizing

**At session start**: Check this file. If deferred items match the session's focus, formalize them first.

---

## Entry Format

```markdown
### [Short title]

**Added**: Session [N], YYYY-MM-DD
**Type**: derivation | finding | correction | new-file | update-existing
**Target**: [file to create or update]
**Priority**: HIGH | MEDIUM | LOW

**What**: [1 sentence — the result]

**Why/How** (reasoning sketch):
[2-5 sentences. Enough to reconstruct the argument. Include: key assumptions,
the critical step, and what makes this non-obvious. A future session with NO
access to this conversation should be able to formalize this from the sketch alone.]

**Status**: PENDING | DEFERRED (session [M]) | DONE | DISCARDED
```

---

## Active Queue

### 8 planned scripts in crystallization_dynamics.md

**Added**: Quality Engine Run 3 follow-up, 2026-02-03
**Type**: new-file (8 verification scripts)
**Target**: `verification/sympy/` — scripts referenced in `framework/investigations/crystallization/crystallization_dynamics.md`
**Priority**: MEDIUM

**What**: 8 TODO scripts in crystallization_dynamics.md were never created. Deferring to a future CMB/cosmology-focused session.

**Why/How** (reasoning sketch):
These scripts cover CMB-related calculations from the crystallization dynamics investigation. They require substantive physics work, not mechanical stubs. The scripts are:
1. `crystallization_potential.py` — Calculate V(φ), v², λ from SO(11) Landau expansion
2. `slow_roll_parameters.py` — Calculate ε, η slow-roll parameters from framework potential
3. `spectral_index_derivation.py` — Derive n_s from slow-roll (connects to hilltop inflation)
4. `sound_horizon_integral.py` — Calculate r_s from first principles (note: r_s claim demoted S205)
5. `peak_height_ratios.py` — Attempt to derive C_ℓ₂/C_ℓ₁ peak ratios
6. `crystallization_coupled_potential.py` — Verify W(ε,φ) coupled potential behavior
7. `attractor_eigenvalue_structure.py` — Check prime classification of attractor eigenvalues
8. `collapse_threshold_estimate.py` — Estimate U_threshold for gravitational collapse
Scripts 1-3 form a coherent chain (potential → slow-roll → n_s). Script 4 lower priority after r_s demotion.

**Status**: DEFERRED (next CMB/cosmology session)

### Glueball mass gap conjecture: m_0++ = n_d * sqrt(sigma)

**Added**: Session S268, 2026-02-07
**Type**: finding
**Target**: `framework/investigations/gauge/yang_mills_mass_gap.md` (already created), potentially promote to catalog entry
**Priority**: LOW

**What**: The lightest 0++ glueball mass (= Yang-Mills mass gap) satisfies m_0++/sqrt(sigma) ~ n_d = 4. Prediction: 1766 MeV vs lattice 1730 +/- 80 MeV (2.1%, within uncertainty). HRS = 5.

**Why/How** (reasoning sketch):
The glueball is a color-singlet excitation of the confined (crystallized O-channel) vacuum. It lives in n_d = 4 spacetime dimensions. The conjecture m_0++ = n_d * sqrt(sigma) says the mass gap equals spacetime dimension times the confinement scale. S274 structural derivation: base mass = n_d = 2 * dim_C (transverse DOF of 2 gluons). Excitation costs {3/2, 2, 3} identified as {J(J+1)/n_d, dim_C*L, Im_H*(n_g-2)}. The spin cost has a uniqueness theorem: holds only for n_d=4. Two new predictions (1-+, 2-+) match lattice. HRS reduced from 6 to 4. Verified in glueball_structural_derivation.py (39/39 PASS).

**Status**: DEFERRED (S277 exotic cost DERIVED, HRS 4->2. All 3 excitation costs now [DERIVATION]. Promote to catalog when 1-+ lattice confirms at <2% precision. Base mass m_0++ = n_d * sqrt(sigma) remains [CONJECTURE].)

---

## Completed / Discarded

### Pi-power sum theorems: promote to core theorem — DONE (S270, 2026-02-07)
THM_04B5 created. MPT Group II updated with pi-power sums paragraph. 58/58 PASS.

### Triple identity n_d^2 = 2^n_d and alpha connection — DONE (S270, 2026-02-07)
ALPHA_DERIVATION_MASTER.md Section 2 updated with pi-power decomposition paragraph.

### CCP truncation necessity argument — DONE (S270, 2026-02-07)
AXM_0120 updated with "Pi-Power Truncation Consistency Check" section.

### F = C audit: restructure 17 so F = C is from time only — DONE (2026-01-30)
Restructured `core/17_complex_structure.md`: Part I is sole justification for F = C; §2.4 and Thm 17.3 now state "given F = C, generator count = 137" and point to alpha chain Step 5 for 1/α identification.

*Items move here after triage. Keep the last 10 for reference, then delete.*
