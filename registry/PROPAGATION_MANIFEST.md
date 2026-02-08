# Propagation Manifest

**Purpose**: Tracks key facts that, when changed, require propagation across the repository.
**Updated by**: Session workflow (Step 4c) and `/quality-engine` (Phase 7)
**Last updated**: 2026-02-07 (S301)

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

### PROP-001: IRA Count Reduction (S259-S299)
- **Trigger**: Status change (multiple IRA resolutions)
- **Old values**: 13 (pre-S256), 10 (S259), 9 (S286), 8 (S292)
- **Current value**: **6** (S299)
- **Grep patterns**: `"10 irreducible"`, `"9 irreducible"`, `"8 irreducible"`, `"13 assumptions"`, `"IRA.*1[0-3]"` (in non-session files)
- **Key files to check**: publications/, claims/, framework/MATHEMATICAL_PERIODIC_TABLE.md, registry/
- **Status**: ACTIVE
- **Known stale**: sessions/S259.md (historical — acceptable)
- **Known current**: IRREDUCIBLE_ASSUMPTIONS.md, HONEST_ASSESSMENT.md, TECHNICAL_SUMMARY.md, INDEX.md, MPT

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
- **Status**: ACTIVE
- **Known stale**: (none remaining after S301 fixes)
- **Known current**: HONEST_ASSESSMENT.md, RED_TEAM_SUMMARY_V2.md, CLAUDE.md, PLAIN_LANGUAGE_DESCRIPTION.md (fixed S301), OBJECTIONS_AND_RESPONSES.md (was already current)

### PROP-004: CONJ-A3 Proven (S258)
- **Trigger**: Status change (CONJECTURE -> THEOREM)
- **Old value**: CONJ-A3 [CONJECTURE] / unresolved
- **Current value**: **CONJ-A3 [THEOREM]** via Radon-Hurwitz (S258)
- **Grep patterns**: `"CONJ-A3"` + check if marked as unresolved/open
- **Status**: COMPLETE (verified by scan agents — no stale references found)

### PROP-005: CONJ-B1 Fully Resolved (S286)
- **Trigger**: Status change (CONJECTURE -> THEOREM)
- **Old value**: CONJ-B1 [CONJECTURE] / partial
- **Current value**: **CONJ-B1 [THEOREM]** via FFT on Hom(R^4,R^7) (S286)
- **Grep patterns**: `"CONJ-B1"` + check if marked as unresolved
- **Status**: COMPLETE (verified — no stale references)

### PROP-006: CONJ-A1 Resolved (S292)
- **Trigger**: Status change (CONJECTURE -> DERIVATION)
- **Old value**: CONJ-A1 [CONJECTURE] / IRA-02 active
- **Current value**: **CONJ-A1 [DERIVATION]** from C5+IRA-10. IRA-02 eliminated.
- **Grep patterns**: `"CONJ-A1"` + check if marked as open; `"IRA-02"` + check if marked as active
- **Status**: COMPLETE (verified — no stale references)

### PROP-007: Alpha Coefficient C=24/11 (S266)
- **Trigger**: Formula change
- **Old value**: C = 2 (approximate)
- **Current value**: **C = 24/11** (0.0002 ppm from CODATA)
- **Grep patterns**: `"C\s*=\s*2[^4/]"` in alpha-related files (careful: C=2 is common in other contexts)
- **Status**: COMPLETE (verified — all active references use 24/11)

### PROP-008: Yang-Mills CANONICAL (S284)
- **Trigger**: Status change (ACTIVE -> CANONICAL)
- **Old value**: yang_mills_mass_gap.md ACTIVE
- **Current value**: **CANONICAL** (S284, 207/207 PASS)
- **Grep patterns**: `"yang.mills"` + check for non-CANONICAL status
- **Status**: COMPLETE (verified — all references current)

### PROP-009: Weinberg Chain Complete (S292)
- **Trigger**: Derivation chain completion
- **Old value**: Weinberg angle derivation incomplete / open
- **Current value**: **COMPLETE** (S292). Double-trace Band C. cos(theta_W) Band A.
- **Grep patterns**: `"Weinberg.*incomplete"`, `"Weinberg.*open"`, `"Weinberg.*gap"`
- **Status**: ACTIVE (not fully verified)

### PROP-010: Verification Script Count
- **Trigger**: Numeric change (ongoing)
- **Old values**: ~215 (S117), ~400 (S200s), ~500 (S260s)
- **Current value**: **~662+** (as of S289)
- **Grep patterns**: `"~215"`, `"~400"`, `"~500"` + "scripts" context
- **Key files to check**: registry/ACHIEVEMENTS_LOG.md
- **Status**: ACTIVE
- **Known stale**: (none remaining after S301 fixes — ACHIEVEMENTS_LOG.md marked as archival snapshot)
- **Known current**: sessions/INDEX.md, HONEST_ASSESSMENT.md, ACHIEVEMENTS_LOG.md (archival header added S301)

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

---

*Created S301. Seeded with 12 entries from S257-S299 propagation audit.*
