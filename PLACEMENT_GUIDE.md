# File Placement Guide

**Purpose**: Decide where new files go. One clear rule per directory.

---

## Decision Tree

For every new file, ask these questions in order:

```
1. Formal axiom/definition/theorem (AXM/DEF/THM numbered)?
   → core/

2. Part of the 9-step "observation → physics" narrative chain?
   → foundations/

3. Number theory / prime patterns (independent of physics)?
   → foundations/prime_theory/

4. Statistical claim assessment or falsification record?
   → claims/

5. Testable prediction locked before measurement?
   → predictions/

6. Tracking, status, logs, recommendations?
   → registry/

7. Verification script?
   → verification/sympy/

8. External communication (papers, summaries)?
   → publications/

9. EVERYTHING ELSE → framework/investigations/[topic]/
   Pick the matching subdirectory. If none fits, put at investigations/ root.
   If 3+ files accumulate on a new topic, create a new subdirectory.
```

**The rule**: when in doubt, `framework/investigations/`. Every other directory has narrow, specific criteria. Investigations is the catch-all for active work.

---

## Directory Criteria (Specific)

| Directory | What Goes Here | What Does NOT Go Here |
|-----------|---------------|----------------------|
| `core/` | Numbered AXM_, DEF_, THM_ files only | Physics applications, investigations |
| `foundations/` | The 9-step Chain narrative + supporting docs | CMB predictions, Einstein eqns, physics applications |
| `foundations/prime_theory/` | Pure number theory research | Physics uses of primes |
| `claims/` | Tiered claim assessments, falsified results | Derivations, investigations |
| `predictions/` | Locked predictions (before measurement) | Post-hoc analysis |
| `registry/` | Status tracking, dashboards, logs, plans | Content documents |
| `verification/sympy/` | Python verification scripts | Documentation |
| `publications/` | Papers, guides, external comms | Internal working docs |
| `framework/investigations/` | **Everything else** — active physics work | — |

---

## Investigation Subdirectories

```
framework/investigations/
  _INDEX.md              ← Canonical lookup (machine-parseable)
  README.md              ← Human navigation

  alpha/                 ← Fine structure constant
  cosmology/             ← CMB, inflation, acoustic peaks, expansion
  dark_matter/           ← Dark sector, 5 GeV prediction
  particles/             ← Fermion masses, Koide, mixing angles, CKM/PMNS
  gauge/                 ← Gauge groups, forces, running couplings
  crystallization/       ← Crystallization dynamics, ordering
  spacetime/             ← GR, Einstein equations, black holes, dimensions
  quantum/               ← QM foundations, Schrodinger, measurement
  primes/                ← Prime structure in physics, attractors
  constants/             ← Non-alpha constants (Weinberg, Higgs VEV, Planck)
  meta/                  ← Session summaries, cross-cutting analyses
```

Pick the best match. Files at the investigations/ root are fine temporarily.

---

## Standardized File Header

Every investigation file should have:

```markdown
**Status**: ACTIVE | CANONICAL | QUARANTINE | ARCHIVED
**Layer**: 0 | 1 | 2 | 3 | mixed
**Topic**: alpha | cosmology | dark_matter | particles | gauge | crystallization | spacetime | quantum | primes | constants
**Canonical**: YES | NO
**Verification**: script_name.py | none
```

Add when creating new files. Update existing files when touched.

---

## Session-End Check (30 seconds)

For every NEW file created this session:
1. Does it have the standard header (Status/Layer/Topic)?
2. Is it in the correct directory per this guide?
3. Add it to `framework/investigations/_INDEX.md` if it's an investigation file.
