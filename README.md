# Perspective Cosmology

A mathematical framework exploring whether division algebra geometry can derive physical constants from first principles. Starting from four axioms about partial observation of a complete structure, the framework uses the Completeness Conjecture Principle (CCP) to force the division algebras {R, C, H, O}, then derives 63+ physical constants with zero free parameters.

**This is speculative, amateur, AI-assisted theoretical work. It is not peer-reviewed.**
An internal adversarial review (Red Team v3.0) estimates a **25-40% probability** this constitutes genuine physics. We document 14 falsified predictions and 4 irreducible assumptions. The math is checkable -- please check it.

---

## The Framework in Brief

1. **Axioms**: Four axioms defining perspective (partial access to a complete static structure)
2. **CCP**: The Completeness Conjecture Principle -- the structure must be maximally self-consistent
3. **Forcing**: Frobenius-Hurwitz theorem forces division algebras with dimensions {1, 2, 4, 8}
4. **Dimensions**: CCP forces crystal dimension n_c = 11 (= 1 + 3 + 7) and defect dimension n_d = 4 (quaternionic spacetime)
5. **Geometry**: The Grassmannian Gr(4, 11) provides the arena; crystallization dynamics yield gauge groups, Einstein equations, and quantum mechanics
6. **Constants**: Democratic counting on End(V) = M_11(C) yields numerical predictions from integers alone

## Key Results

| Constant | Formula | Framework Value | Measured (CODATA/Planck) | Precision |
|----------|---------|----------------|--------------------------|-----------|
| 1/alpha (fine structure) | 137 + 4/111 | 137.036036... | 137.035999... | 0.27 ppm |
| sin^2(theta_W) (Weinberg) | 28/121 | 0.231405... | 0.23122(4) | 3.75 ppm (tree) |
| Omega_m (matter fraction) | 63/200 | 0.315 | 0.315 +/- 0.007 | Exact match |
| m_p/m_e (proton/electron) | 1836 + 11/72 | 1836.15278 | 1836.15267 | 0.06 ppm |
| Gauge group | Pipeline: 121->55->18->12 | U(1) x SU(2) x SU(3) | U(1) x SU(2) x SU(3) | Exact |
| Spacetime dimension | n_d = 4 from no-zero-divisors | 3+1 with Lorentz signature | 3+1 observed | Exact |
| Generations | dim Im(H) = 3 | 3 fermion generations | 3 observed | Exact |

**Full catalog**: 63+ derived constants across particle physics, cosmology, CMB, and BBN. See `claims/` for the complete tiered inventory.

## Why You Should Be Skeptical

- **Author is an amateur** (applied math background, no physics PhD)
- **Heavily AI-assisted** (Claude, Anthropic) -- see `publications/AI_METHODOLOGY.md`
- **Building blocks are not special**: Monte Carlo analysis shows any 7-element subset of {1,...,20} matches ~11 constants at 1% level -- we are at the 51st percentile
- **Most predictions are post-hoc** (derived knowing the answer)
- **Could be sophisticated numerology**: the derivation-vs-discovery problem is unresolved
- **4 irreducible assumptions remain** (see `framework/IRREDUCIBLE_ASSUMPTIONS.md`)
- **Cosmological constant magnitude gap** (~10^111) unsolved

## Why It Might Be Real

- **9 blind predictions succeeded**: made before checking measurements, 6/7 CMB within 1 sigma (combined P ~ 2.5 x 10^-7)
- **Derives structure, not just numbers**: gauge group, spacetime dimension, generations, QM, Einstein equations
- **737+ verification scripts** with 99.8% pass rate (`verification/sympy/`)
- **14 failures documented honestly** (`claims/FALSIFIED.md`) plus 3 retractions
- **Only 4 assumptions** for all of physics (zero conjectural in the alpha derivation chain)
- **Concrete falsification criteria**: 5.11 GeV dark matter (SuperCDMS 2026-2027), r = 0.035 (CMB-S4 ~2028)

---

## Repository Structure

| Directory | Content |
|-----------|---------|
| `publications/` | Paired papers, methodology, honest assessment, and supporting documents |
| `claims/` | Tiered prediction catalog: 12 sub-10 ppm, 16 mid-tier, ~41 broader, 14 falsified |
| `predictions/` | Blind predictions, experimental timeline, dark matter prediction |
| `framework/` | Full mathematical framework with 150+ investigation files |
| `foundations/` | Inevitability chain and prime theory |
| `core/` | Formal axioms (AXM), definitions (DEF), theorems (THM), lemmas -- the mathematical backbone |
| `verification/` | 737+ SymPy verification scripts |

---

## Quick Start

### Run a verification script

```bash
pip install sympy

# The headline alpha result
python verification/sympy/alpha_enhanced_prediction.py

# Weinberg angle
python verification/sympy/weinberg_best_formula.py

# All scripts follow the same pattern: assumptions, calculation, comparison, PASS/FAIL
```

### Read the mathematics

Start with `publications/PC_MATHEMATICAL_FOUNDATIONS.md` -- a self-contained mathematical development from axioms through consequences (2133 lines, v1.0). No physics knowledge required.

### Read the physics

`publications/PC_INTERPRETIVE_COMPANION.md` mirrors the math paper section-by-section, providing physical interpretation with explicit assumption tagging (2131 lines, v1.0).

### For skeptics

`publications/HONEST_ASSESSMENT.md` is the framework's own evaluation -- what works, what doesn't, and what's uncertain.

---

## Publications

| Document | Description |
|----------|-------------|
| [Mathematical Foundations](publications/PC_MATHEMATICAL_FOUNDATIONS.md) | Complete mathematical development: axioms through predictions (2133 lines) |
| [Interpretive Companion](publications/PC_INTERPRETIVE_COMPANION.md) | Physical interpretation, parallel to the math paper (2131 lines) |
| [AI Methodology](publications/AI_METHODOLOGY.md) | How AI assistance was used, hallucination defense |
| [Landscape Comparison](publications/LANDSCAPE_COMPARISON.md) | Comparison with string theory, LQG, E8, NCG, division algebra approaches |
| [Honest Assessment](publications/HONEST_ASSESSMENT.md) | Self-evaluation: what works, what doesn't |
| [Executive Summary](publications/EXECUTIVE_SUMMARY.md) | Two-page overview |
| [FAQ](publications/FAQ.md) | Frequently asked questions |
| [Objections & Responses](publications/OBJECTIONS_AND_RESPONSES.md) | Common criticisms addressed |

## License

- **Content** (all `.md` files): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Code** (all `.py` files): [MIT License](LICENSE.md)

## Citation

```
Morin, C. M. (2026). Perspective Cosmology: Division Algebra Framework for Physical Constants.
https://github.com/chrismmorin-ux/Perspective-Cosmology
```

## AI Disclosure

This work was developed by Christopher M Morin with AI assistance (Claude, Anthropic). All mathematical claims are computationally verified via 737+ SymPy scripts. The AI-assisted methodology is documented in `publications/AI_METHODOLOGY.md`.

## Contact

- **Email**: christopher.morin@perspectivecosmology.com
- **Issues**: [GitHub Issues](../../issues) for errors, questions, or suggestions
- **Website**: perspectivecosmology.com
