# Perspective Cosmology

**This repository is under reconstruction.** The prior corpus — roughly 330
sessions of work — has been moved to [`quarantine/`](quarantine/README.md)
intact. Nothing has been deleted. Nothing has been rewritten. But nothing in
there may be cited by live content until it has passed an admissibility test,
and a gate enforces that rather than a convention.

## Why

The framework proposed that four axioms about partial observation, plus a
completeness principle, force the division algebras {ℝ, ℂ, ℍ, 𝕆}, and that ~63
physical constants follow with zero free parameters. An audit in September 2026
established the following. Every figure is reproducible from this repository.

**The two flagship results are excluded by measurement.** Against CODATA 2022,
with exact rational arithmetic:

| Claim | Relative agreement | In experimental standard deviations |
|---|---|---|
| `1/α = 137 + 4/111` | 0.269 ppm | **1,755 σ** |
| `m_p/m_e = 1836 + 11/72` | 0.057 ppm | **3,261 σ** |

Both ppm figures are correct. They are also the wrong comparison: α⁻¹ is
measured to 0.00015 ppm, so a 0.27 ppm formula is not a near-miss, it is a
refutation. Quoting ppm instead of σ is what made a refutation look like a
headline.

**The integers were not derived.** `15211/111` and `132203/72` are *continued
fraction convergents of the measured values* — convergent #4 and #6, stable
across every CODATA adjustment from 2002 to 2022. The continued-fraction
algorithm, applied to the measurement and nothing else, produces 111 and 72.
Deriving 111 from Φ₆(11) supplies a second explanation for a number that
already had one. And the precision is close to free: approximation theory
guarantees `|err| < 1/(q·q_next)` for *any* real number, and `m_p/m_e` beats
that bound by 1.02×.

The "exact matches" are restated roundings. Planck quotes Ω_m = 0.315; every
terminating decimal is a rational; 0.315 *is* 63/200 identically.

**The repository already contained its own refutation.** Three documents in the
prior corpus, two of them marked CANONICAL, are now promoted to
[`record/`](record/README.md):

- `cd_closure_irreducibility.md` proves **by explicit countermodel** that
  n_c = 11 follows from *none* of the framework's twenty axioms. Its own words:
  "We must assume it."
- `division_algebra_ambiguity_analysis.md` records a blind test in which a
  different model derived 25 rather than 137 from the same axioms, with valid
  arguments.
- `DEGREES_OF_FREEDOM_ANALYSIS.md` and `STATISTICAL_ANALYSIS_HONEST.md` place
  the framework's integer set at the 51st percentile of a Monte Carlo null.

The work was honest with itself in private and did not propagate that honesty
into its claims. That gap, rather than any single error, is what the
reconstruction is designed to close.

## What is here now

| Path | Contents |
|---|---|
| [`record/`](record/README.md) | The epistemic record — promoted, citable. What was falsified, what was assumed, what the null model showed. |
| [`quarantine/`](quarantine/README.md) | The entire prior corpus. Preserved, versioned, **not citable**. |
| `gates/` | Admissibility and hygiene checks. Each one can prove that it fails. |

## What the reconstruction is for

The numerical-constants programme does not survive the audit above. The
**structural** questions are a different matter, and they sit next to a real,
peer-reviewed literature — Furey, Todorov & Dubois-Violette, Krasnov, Boyle,
Baez & Schwahn — deriving Standard Model structure from division algebras. That
literature has produced theorems and no numerical constants, and it knows it.

The intended target is a structural result, stated in Lean 4 so that the kernel
checks it rather than a reader, with a negative result counted as success.

## Running the gates

```bash
python gates/check_xrefs.py --self-test       # prove the checker can fail
python gates/check_xrefs.py                   # every internal reference resolves
python gates/check_quarantine.py --self-test
python gates/check_quarantine.py              # nothing live cites quarantine
```

## Status of the public claims

The website and the published papers still state the prior results. Until they
are revised they should be read against this README and against `record/`.

## License

- Content (`.md`): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Code (`.py`): MIT — see [LICENSE.md](LICENSE.md)
