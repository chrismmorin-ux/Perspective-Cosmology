# Investigation Files

**Purpose**: All active physics work — the single home for investigations
**Updated**: 2026-01-30 (reorganized into topic subdirectories)

**Machine-readable index**: `_INDEX.md`
**Placement rules**: `../../PLACEMENT_GUIDE.md`
**Last Updated**: 2026-02-03

---

## Directory Structure

```
investigations/
  _INDEX.md              ← Canonical lookup (topic, status, layer for every file)
  README.md              ← This file

  alpha/                 ← Fine structure constant (8 files)
  cosmology/             ← CMB, inflation, acoustic peaks (14 files)
  dark_matter/           ← Dark sector, 5 GeV prediction (7 files)
  particles/             ← Fermion masses, Koide, mixing angles (9 files)
  gauge/                 ← Gauge groups, forces, running couplings (11 files)
  crystallization/       ← Crystallization dynamics, ordering (8 files)
  spacetime/             ← GR, Einstein equations, black holes (11 files)
  quantum/               ← QM foundations, Schrodinger (5 files)
  primes/                ← Prime structure in physics (9 files)
  constants/             ← Non-alpha constants (9 files)
  meta/                  ← Session summaries, cross-cutting analyses (15+ files)
```

---

## Key Files by Topic

### Alpha (Fine Structure Constant)
| File | Status |
|------|--------|
| `alpha/ALPHA_DERIVATION_MASTER.md` | **CANONICAL** |
| `alpha/alpha_correction_derivation.md` | COMPLETE |
| `alpha/alpha_crystal_interface.md` | ACTIVE |

### Cosmology
| File | Status |
|------|--------|
| `cosmology/hilltop_inflation_canonical.md` | ACTIVE |
| `cosmology/acoustic_oscillations.md` | ACTIVE |
| `cosmology/cmb_crystallization_boundary.md` | ACTIVE |

### Dark Matter
| File | Status |
|------|--------|
| `dark_matter/DARK_SECTOR_AND_GEOMETRY_CONSOLIDATED.md` | **CANONICAL** |
| `dark_matter/dark_matter_phenomenology.md` | ACTIVE |

### Particles
| File | Status |
|------|--------|
| `particles/fermion_multiplets_from_division_algebras.md` | ACTIVE |
| `particles/mixing_angles_division_algebra.md` | ACTIVE |

### Gauge
| File | Status |
|------|--------|
| `gauge/gauge_from_division_algebras.md` | **CANONICAL** |
| `gauge/field_content_from_orthogonality.md` | ACTIVE |

### Constants
| File | Status |
|------|--------|
| `constants/universal_constants_from_division_algebras.md` | **CANONICAL** |
| `constants/weinberg_prime_attractor.md` | ACTIVE |

### Crystallization
| File | Status |
|------|--------|
| `crystallization/crystallization_dynamics.md` | ACTIVE |
| `crystallization/symmetry_breaking_chain.md` | ACTIVE |

### Spacetime
| File | Status |
|------|--------|
| `spacetime/einstein_equations_rigorous.md` | ACTIVE |
| `spacetime/black_holes_crystallization.md` | ACTIVE |

---

## Status Tags

| Tag | Meaning |
|-----|---------|
| CANONICAL | Verified and promoted — the definitive file for its topic |
| COMPLETE | Finished investigation |
| ACTIVE | Work in progress |
| QUARANTINE | Problems found |
| ARCHIVED | Superseded |

---

## Quick Search

```bash
# Find files by topic keyword
grep -rl "Koide" framework/investigations/particles/
grep -rl "crystallization" framework/investigations/crystallization/

# Find all canonical files
grep -l "CANONICAL" framework/investigations/*/*.md
```

---

*See `_INDEX.md` for the complete file listing.*
*See `registry/STATUS_DASHBOARD.md` for overall framework status.*
