# Process Entry Template

**Status**: CORE REFERENCE
**Created**: 2026-02-03 (Session 221)

Use this template for every process entry in the sub-catalogs.

---

## Template

```markdown
### [Process Name] (e.g., "Neutron Beta Decay")

**Chain**: C10(H-channel) -> C4(collapse) -> C8(EM emission)
**Tag**: [FRAMEWORK-DERIVED] | [FRAMEWORK-CONSTRAINED] | [STANDARD-RELABELED]

**Before -> After**:
- Physical: [initial state] -> [final state] (e.g., n -> p + e- + nu_bar_e)
- Tilt: [crystallization language description]

**Channel Decomposition**:

| Channel | Role | Modes |
|---------|------|-------|
| H (Weak) | [role in this process] | [mode count] |
| C (EM) | [role] | [mode count] |
| O (Strong) | [role] | [mode count] |
| R (Gravity) | [role] | [mode count] |

**Key Data**:

| Observable | Framework | Measured | Error | Source |
|-----------|-----------|----------|-------|--------|
| [quantity] | [prediction or A-IMPORT] | [value +/- unc] | [ppm or %] | [PDG/Planck/etc] |

**What framework adds**: [Specific non-trivial content from crystallization picture]
**What is imported**: [Explicitly list all [A-IMPORT] values]
**Verification**: `script_name.py` or "needed"
**Confidence**: [tag] for [aspect]; [tag] for [aspect]
```

---

## Tag Criteria

### [FRAMEWORK-DERIVED]
The framework makes a **quantitative prediction** not available in standard physics alone:
- Uses n_d, n_c, division algebra dimensions to compute a number
- The prediction is falsifiable against measurement
- Example: alpha = 1/(n_d^2 + n_c^2) = 1/137

### [FRAMEWORK-CONSTRAINED]
The framework **structures the calculation** but the result matches standard physics:
- Channel decomposition applies meaningfully
- Mode counting constrains the physics
- But the final number comes from standard QFT/GR
- Example: Z branching ratios from sin^2(theta_W) = 28/121

### [STANDARD-RELABELED]
The process is described in crystallization language but the framework adds **no predictive content**:
- Standard physics calculation in different words
- The crystallization description is interpretive, not computational
- Example: "Compton scattering is C8(absorb) -> C4 -> C8(emit)" — true but not predictive

---

## Quality Checklist

Before submitting a process entry:

- [ ] Chain uses only defined types (C1-C17)
- [ ] Tag is honest (not inflated)
- [ ] All [A-IMPORT] values are listed explicitly
- [ ] Measured values cite specific sources (PDG year, Planck release, etc.)
- [ ] "What framework adds" is genuinely non-trivial, or tag is [STANDARD-RELABELED]
- [ ] Verification script exists or is marked "needed"
- [ ] Confidence tags follow the standard hierarchy

---

*Created: 2026-02-03 (S221)*
