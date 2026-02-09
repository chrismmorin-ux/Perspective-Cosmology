# Propagation Manifest

**Purpose**: Tracks key facts that, when changed, require propagation across the repository.
**Updated by**: Session workflow (Step 4c) and `/quality-engine` (Phase 7)
**Last updated**: 2026-02-09 (S321)

---

## How This File Works

Each entry records a **propagable fact** — a value, status, or claim referenced by multiple files.
When the fact changes, the old value becomes "stale" in any file not yet updated.

**Entry lifecycle**:
1. **ACTIVE**: Fact recently changed, propagation may be incomplete
2. **COMPLETE**: All known references updated, verified by quality engine
3. **ARCHIVED**: Old entry, kept for audit trail (move to bottom)

**Session workflow**: After any session that triggers a propagation event (status change, retraction,
count change, formula update), add or update the relevant entry here.

---

## Active Entries

### PROP-001: IRA Count Reduction (S259-S304)
- **Trigger**: Status change (multiple IRA resolutions)
- **Old values**: 13 (pre-S256), 10 (S259), 9 (S286), 8 (S292), 6 (S299)
- **Current value**: **4** (S304)
- **Grep patterns**: `"6 irreducible"`, `"10 irreducible"`, `"9 irreducible"`, `"8 irreducible"`, `"13 assumptions"`, `"IRA.*1[0-3]"` (in non-session files)
- **Key files to check**: publications/, claims/, framework/MATHEMATICAL_PERIODIC_TABLE.md, registry/
- **Status**: ACTIVE (updated Run 10 quality engine, S322)
- **Known stale**: sessions/S259.md (historical — acceptable)
- **Known current**: IRREDUCIBLE_ASSUMPTIONS.md, HONEST_ASSESSMENT.md, TECHNICAL_SUMMARY.md, THESIS.md, PLAIN_LANGUAGE_DESCRIPTION.md, CLAIM_DEPENDENCIES.md, INDEX.md, MPT (all publications updated S322 v2.4)

### PROP-002: S291 Grassmannian Topology Correction
- **Trigger**: Retraction (symplectic 2-form, level alpha=2)
- **Old values**: H_2(Gr+) = Z, b_2 = 1, chi = 330, level alpha = 2
- **Current values**: **H_2(Gr+) = Z/2**, **b_2 = 0**, **chi = 20**, **level alpha RETRACTED**
- **Grep patterns**: `"H_2.*= Z[^/]"`, `"b_2.*= 1"`, `"chi.*330"`, `"level alpha.*= 2"`, `"symplectic 2-form"` (check for global claims on real Grassmannian)
- **Key files to check**: framework/investigations/constants/planck_constant_investigation.md, verification/sympy/h_schubert*.py
- **Status**: ACTIVE (S301: chi=330 fixed in planck_constant_investigation.md, h_schubert docstring updated, .quality/report.md fixed, INDEX.md S278 entry fixed)
- **Known stale**: (none remaining after S301 fixes)
- **Known current**: S291.md, h_topological_step.py, MEMORY.md, planck_constant_investigation.md, h_schubert_state_counting.py, .quality/report.md, sessions/INDEX.md

### PROP-003: Red Team Probability Update (S257)
- **Trigger**: Assessment change
- **Old values**: 15-30% (v1.0, S120), 15-25% (some publications)
- **Current value**: **20-35%** (Red Team v2.0, S257)
- **Grep patterns**: `"15-30%"`, `"15-25%"`, `"15.*30.*%"` (in non-session, non-archive files)
- **Key files to check**: publications/, registry/RED_TEAM_SUMMARY.md
- **Status**: COMPLETE (all publications updated S322)
- **Known stale**: (none)
- **Known current**: HONEST_ASSESSMENT.md, RED_TEAM_SUMMARY_V2.md, CLAUDE.md, PLAIN_LANGUAGE_DESCRIPTION.md, OBJECTIONS_AND_RESPONSES.md, PC_INTERPRETIVE_COMPANION.md (fixed S322)


### PROP-009: Weinberg Chain Complete (S292)
- **Trigger**: Derivation chain completion
- **Old value**: Weinberg angle derivation incomplete / open
- **Current value**: **COMPLETE** (S292). Double-trace Band C. cos(theta_W) Band A.
- **Grep patterns**: `"Weinberg.*incomplete"`, `"Weinberg.*open"`, `"Weinberg.*gap"`
- **Status**: ACTIVE (not fully verified)

### PROP-010: Verification Script Count
- **Trigger**: Numeric change (ongoing)
- **Old values**: ~215 (S117), ~400 (S200s), ~500 (S260s), ~662 (S289)
- **Current value**: **~713** (as of Run 10 quality engine)
- **Grep patterns**: `"~215"`, `"~400"`, `"~500"`, `"~662"` + "scripts" context
- **Key files to check**: registry/ACHIEVEMENTS_LOG.md, sessions/INDEX.md, publications/
- **Status**: ACTIVE
- **Known stale**: (none remaining — publications updated S322)
- **Known current**: sessions/INDEX.md, HONEST_ASSESSMENT.md, THESIS.md, TECHNICAL_SUMMARY.md, PLAIN_LANGUAGE_DESCRIPTION.md, OBJECTIONS_AND_RESPONSES.md, ACHIEVEMENTS_LOG.md

### PROP-011: CONJ-A2 Partially Resolved (S297)
- **Trigger**: Status change (CONJECTURE -> A-STRUCTURAL)
- **Old value**: CONJ-A2 / Step 15 [CONJECTURE]
- **Current value**: Step 15 **[A-STRUCTURAL within I-STRUCT-5]**. kappa=1 = standard Tr convention.
- **Grep patterns**: `"CONJ-A2"` + check if marked as fully open/unresolved
- **Status**: ACTIVE (not fully verified)

### PROP-012: Omega_m Derived (S293)
- **Trigger**: Resolution event (EQ-002 substantially resolved)
- **Old value**: Omega_m = 63/200 mechanism unknown / EQ-002 OPEN
- **Current value**: **Omega_m = 63/200 DERIVED** from dual-channel HS equipartition (S293)
- **Grep patterns**: `"EQ-002.*OPEN"`, `"Omega_m.*mechanism.*unknown"`
- **Status**: ACTIVE (not fully verified)

### PROP-013: EQ-039 Essentially Complete (S307)
- **Trigger**: EQ resolution
- **Old value**: EQ-039 OPEN, priority MEDIUM, score 9.0
- **Current value**: **EQ-039 ESSENTIALLY COMPLETE**, priority LOW, score 5.0
- **Details**: All 3 open questions resolved. sin^2+cos^2 = scheme conversion [DERIVATION]. Band A dressed predictions computed. Band structure = organizing principle [CONJECTURE]. cos C=dim(C)=2 candidate [SPECULATION].
- **Grep patterns**: `"EQ-039.*OPEN"`, `"EQ-039.*MEDIUM"`
- **Status**: ACTIVE
- **Known current**: EXPLORATION_QUEUE.md, sessions/S307.md, topics/weinberg-angle.md


### PROP-016: IRA-08/09 Status (S299, CORRECTED S320)
- **Trigger**: Status change (IRA-08 resolved, IRA-09 resolution RETRACTED)
- **Old value**: IRA-08, IRA-09 as independent assumptions
- **Current value**: **IRA-08 RESOLVED** (eps is only DOF on Gr(4,11)). **IRA-09 RESOLUTION RETRACTED S320**: SU(3) c G_2 = color, not generation. Lepton test decisive. Generation mechanism = dim(Im(H))=3.
- **Grep patterns**: `"IRA-09.*RESOLVED"`, `"IRA-09.*generation"`, `"3\+3bar\+1.*generation"` (check for wrong SU(3)=gen claims)
- **Status**: ACTIVE (S320 correction; IRA-09 references in publications may still say "RESOLVED")

### PROP-017: EQ-013 Fully Resolved (S315)
- **Trigger**: EQ resolution (SUBSTANTIALLY RESOLVED -> RESOLVED)
- **Old value**: EQ-013 SUBSTANTIALLY RESOLVED, exponent = n_d [CONJECTURE]
- **Current value**: **EQ-013 RESOLVED**. Exponent n_d DERIVED from det(M) on End(R^n_d). Formula C now [DERIVATION with 1 A-STRUCTURAL]. Trace/det unification with Weinberg (S279).
- **Grep patterns**: `"EQ-013.*SUBSTANTIALLY"`, `"exponent.*CONJECTURE"`, `"weakness.*0"` (now -1)
- **Key files to check**: sessions/S314.md (says "SUBSTANTIALLY RESOLVED"), framework/investigations/particles/generation_structure.md
- **Status**: ACTIVE
- **Known current**: EXPLORATION_QUEUE.md, sessions/INDEX.md, sessions/S315.md

### PROP-018: Dark State Count -- FULLY RETRACTED (S320)
- **Trigger**: Retraction (S320 correction: SU(3) = color, not generation)
- **Old values**: "16 dark states" (S317/S318), "8 dark states" (S319)
- **Current value**: **0 dark states from spinor decomposition**. SO(11) spinor 32 = 1 complete SM generation. No dark sector from spinor. S319 counting RETRACTED (was based on SU(3) = generation, which is WRONG).
- **Grep patterns**: `"8 dark"`, `"dark.*state.*spinor"`, `"Type A.*Type B"`, `"G_2 democracy"` (in non-session files)
- **Key files to check**: framework/investigations/dark_matter/, topics/ (no DM topic file yet)
- **Status**: ACTIVE (S319 session record is historical; dark matter investigation files may reference old counting)
- **Known stale**: sessions/S319.md, sessions/S320.md Phase 1 (both historical, acceptable with retraction notes)

### PROP-019: EQ-043 Status (S319, CORRECTED S320)
- **Trigger**: EQ status change + correction
- **Old value**: EQ-043 OPEN (S318), PARTIALLY RESOLVED (S319), SUBSTANTIALLY RESOLVED (S320 Phase 1)
- **Current value**: **EQ-043 OPEN** (reset). S320 Phase 1 B-D portal result RETRACTED (based on SU(3)=generation). S319 G_2 democracy result RETRACTED (based on wrong dark state counting). Core question (why n_DM = n_baryon?) still open.
- **Grep patterns**: `"EQ-043.*SUBSTANTIALLY"`, `"EQ-043.*PARTIALLY"`, `"B-D portal"`, `"SU(3)_gen triality"`
- **Status**: ACTIVE
- **Known current**: EXPLORATION_QUEUE.md (after S320 correction)

### PROP-020: SU(3) = Color Correction + IRA-09 Resolution (S320/S321)
- **Trigger**: Retraction (S320) + new resolution (S321)
- **Old values**: SU(3) c G_2 = generation symmetry (S299); IRA-09 RESOLVED via SU(3) branching (S299 WRONG)
- **Current values**: **SU(3) c G_2 = COLOR SU(3)_c** [DERIVATION, S320]. **IRA-09 RESOLVED via Hom(H,R^7) decomposition** [DERIVATION, S321]. 3 generation channels from Im(H)=3, Weinberg-forced. No new IRA. 0 dark states from spinor.
- **Grep patterns**: `"SU(3).*generation"`, `"SU(3)_gen"`, `"generation.*SU(3)"`, `"3\+3bar\+1.*generation"`, `"triality.*portal"`, `"B-D portal"`, `"4th.*generation"`, `"dark generation"`
- **Key files to check**: publications/, framework/investigations/dark_matter/
- **Status**: ACTIVE (S321 updated key files; publications may need checking)
- **Known current**: IRREDUCIBLE_ASSUMPTIONS.md (v6.0), sessions/S320.md, sessions/S321.md, generation_structure.md, generations_from_quaternions.md, HALLUCINATION_LOG.md (HP-013)
- **Known stale (acceptable)**: sessions/S299.md, sessions/S319.md (historical session records)
- **Needs checking**: publications/TECHNICAL_SUMMARY.md, publications/THESIS.md, publications/HONEST_ASSESSMENT.md (may still reference old IRA-09 status or "4th dark generation")

### PROP-021: S318 Precision Correction (Omega Ratio)
- **Trigger**: Formula change (Omega ratio match 0.7% -> 1.5%)
- **Old value**: m_DM/m_p = 5.45 vs Omega_c/Omega_b = 5.41, 0.7% match
- **Current value**: **m_DM/m_p = 5.446 vs Omega_c/Omega_b = 5.364, 1.5% match (1.3 sigma)**
- **Grep patterns**: `"0.7%"` in DM context, `"5.45.*5.41"`
- **Status**: COMPLETE (S317 errata added S322)
- **Known current**: sessions/S317.md (errata block), sessions/S318.md

### PROP-022: IRA-09 Mechanism Reopened (S320)
- **Trigger**: Retraction (generation counting mechanism)
- **Old value**: IRA-09 RESOLVED via SU(3) c G_2 branching 7->3+3bar+1 = generation (S299)
- **Current value**: **SU(3) c G_2 = color, not generation** (S320). IRA-09 RE-RESOLVED via Hom(H,R^7) decomposition (S321). Generation mechanism = dim(Im(H))=3. No new IRA.
- **Grep patterns**: `"SU(3).*generation"`, `"3\+3bar\+1.*generation"` (in non-session files)
- **Status**: ACTIVE (overlaps PROP-016/020; publications may still reference old S299 mechanism)
- **Known current**: IRREDUCIBLE_ASSUMPTIONS.md (v6.0), generation_structure.md, generations_from_quaternions.md

### PROP-023: Dark State Count Cascade (S319-S320)
- **Trigger**: Retraction cascade
- **Old values**: "16 dark states" (S317/S318), "8 dark states" (S319)
- **Current value**: **0 dark states from spinor decomposition** (S320). SO(11) spinor 32 = 1 complete SM generation. No dark sector from spinor.
- **Grep patterns**: `"8 dark"`, `"16 dark"`, `"dark.*state.*spinor"`, `"Type A.*Type B"` (in non-session files)
- **Status**: ACTIVE (session records are historical with errata; investigation files checked)
- **Known stale (acceptable)**: sessions/S319.md (errata added S322), sessions/S317.md, sessions/S318.md (historical)

---

## Propagation Trigger Types

For reference, these event types always require a manifest entry:

| Trigger | Example | Urgency |
|---------|---------|---------|
| Status upgrade | CONJ -> THEOREM | HIGH |
| Retraction | Symplectic 2-form S291 | CRITICAL |
| Count change | IRA 8 -> 6 | HIGH |
| Formula change | C=2 -> C=24/11 | HIGH |
| Assessment change | Probability 15-30% -> 20-35% | MEDIUM |
| EQ resolution | EQ-002 RESOLVED | MEDIUM |
| Investigation promotion | ACTIVE -> CANONICAL | MEDIUM |
| New theorem | THM_04B6 created | LOW |

---

## Archived Entries

*(Move COMPLETE entries here after 2 quality engine runs confirm completeness)*

| ID | Summary | Archived |
|----|---------|----------|
| PROP-004 | CONJ-A3 [THEOREM] via Radon-Hurwitz (S258) | S322 (Run 10) |
| PROP-005 | CONJ-B1 [THEOREM] via FFT on Hom(R^4,R^7) (S286) | S322 (Run 10) |
| PROP-006 | CONJ-A1 [DERIVATION] from C5+IRA-10 (S292) | S322 (Run 10) |
| PROP-007 | Alpha C=24/11 (S266) | S322 (Run 10) |
| PROP-008 | Yang-Mills CANONICAL (S284) | S322 (Run 10) |
| PROP-014 | IRA-10 RESOLVED (S302) | S322 (Run 10) |
| PROP-015 | IRA-01 RESOLVED (S304) | S322 (Run 10) |

---

*Created S301. Seeded with 12 entries from S257-S299 propagation audit.*
