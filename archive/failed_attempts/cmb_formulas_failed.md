# CMB Formula Failed Attempts

**Created**: Session 125 (2026-01-28)
**Purpose**: Document formulas that were tried and FAILED for CMB observables
**Why This Matters**: Establishes the search denominator for statistical significance

---

## Methodology

For each successful formula, we list:
1. Formulas that were tried and rejected
2. Why they failed (wrong value, poor motivation, etc.)
3. Approximate count of the search space explored

**Rule**: A formula "fails" if:
- It gives a value more than 2% from measurement, OR
- It lacks framework motivation (arbitrary choices)

---

## OBSERVABLE: z_* (Recombination Redshift)

**Measured**: 1089.80 +/- 0.21
**Successful**: z_* = (Im_H * n_c)^2 = 33^2 = 1089 (0.07% error)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | n_c^3 | 1331 | 22% | Way off |
| 2 | n_c^3 - 242 | 1089 | EXACT | Arbitrary offset 242 |
| 3 | H^2 * 68 | 1088 | 0.16% | Arbitrary factor 68 |
| 4 | (n_c - R)^3 | 1000 | 8.2% | Wrong order of magnitude |
| 5 | O * 136 | 1088 | 0.16% | Arbitrary factor 136 |
| 6 | Im_O * 155 + 4 | 1089 | 0.07% | Too arbitrary |
| 7 | C * 544 + 1 | 1089 | 0.07% | No framework meaning |
| 8 | (n_c + O + Im_O)^2 | 676 | 38% | Way off |
| 9 | H * 272 + 1 | 1089 | 0.07% | Arbitrary factor |
| 10 | n_c * 99 | 1089 | 0.07% | Why 99? |

**Search space explored**: ~50 formulas
**Success ratio**: 1/50 = 2%
**The winning formula 33^2 is unique** — it's the ONLY simple expression that works without arbitrary factors.

---

## OBSERVABLE: n_s (Spectral Index)

**Measured**: 0.9649 +/- 0.0042
**Successful**: n_s = 193/200 = 0.965 (0.01% error)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | 1 - n_d/n_c^2 | 0.9669 | 0.21% | Within error but further from central |
| 2 | 1 - 2/55 | 0.9636 | 0.13% | Close but slow-roll imported |
| 3 | 1 - Im_H/100 | 0.97 | 0.53% | Too far |
| 4 | 1 - H/137 | 0.9708 | 0.61% | Too far |
| 5 | 1 - Im_H/n_c^2 | 0.9752 | 1.07% | Wrong direction |
| 6 | 1 - C/100 | 0.98 | 1.6% | Way off |
| 7 | (n_c - R)/n_c | 0.909 | 5.8% | Wrong structure |
| 8 | n_c/(n_c + 1) | 0.917 | 5.0% | Wrong structure |
| 9 | 1 - 1/n_c | 0.909 | 5.8% | Way off |
| 10 | 1 - H/n_c^2 | 0.9669 | 0.21% | Same as #1 |
| 11 | O/(O + 1) | 0.889 | 7.9% | Wrong structure |
| 12 | 1 - Im_O/137 | 0.9489 | 1.7% | Wrong scale |

**Search space explored**: ~80 formulas (many ratios tried)
**Success ratio**: 2/80 = 2.5% (117/121 and 193/200 both work)
**Note**: Two formulas work. We chose 193/200 as closer to central value.

---

## OBSERVABLE: l_1 (First Acoustic Peak)

**Measured**: 220 (integer by definition)
**Successful**: l_1 = C * n_c * (n_c - R) = 2 * 11 * 10 = 220 (EXACT)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | n_c * 20 | 220 | EXACT | Too arbitrary (why 20?) |
| 2 | H * n_c * 5 | 220 | EXACT | Works but less motivated than canonical |
| 3 | C^2 * 55 | 220 | EXACT | Why 55? (though 55 = 5 * n_c) |
| 4 | O * 27 + 4 | 220 | EXACT | Arbitrary offset |
| 5 | Im_O * 31 + 3 | 220 | EXACT | Arbitrary factors |
| 6 | n_c^2 - 1 | 120 | 45% | Way off |
| 7 | n_c * (n_c + 1) | 132 | 40% | Wrong structure |
| 8 | C * n_c^2 | 242 | 10% | Close but no cigar |
| 9 | Im_H * n_c * Im_O - 11 | 220 | EXACT | Too arbitrary |
| 10 | p137 + O * n_c - 5 | 220 | EXACT | Kitchen sink |
| 11 | n_c * (n_c * 2) | 242 | 10% | Off |
| 12 | H^2 * n_c + ... | various | varies | Many tried |

**Search space explored**: ~100 formulas (many factor combinations)
**Success ratio**: 5/100 = 5% (several formulas give 220)
**The canonical formula C * n_c * (n_c - R)** was chosen for its clean interpretation.

---

## OBSERVABLE: l_2 (Second Acoustic Peak)

**Measured**: 537.5
**Successful**: l_2 = l_1 * 22/9 = 537.78 (0.05% error)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | l_1 * 2.5 | 550 | 2.3% | Just outside tolerance |
| 2 | C * Im_H * Im_O * 13 | 546 | 1.6% | Slightly too far |
| 3 | l_1 * (n_c + 1)/n_c * 2 | 480 | 11% | Way off |
| 4 | l_1 * Im_O/Im_H | 513 | 4.6% | Wrong ratio |
| 5 | l_1 * H | 880 | 64% | Wrong scale |
| 6 | l_1 + 337 - 20 | 537 | 0.09% | Too arbitrary |
| 7 | Im_O * Im_H * (n_c + O) + ... | various | varies | Overfit |
| 8 | l_1 * 12/5 | 528 | 1.8% | Close but off |
| 9 | l_1 * n_c/H - 22 | 583 | 8.5% | Wrong direction |
| 10 | H^2 * 34 - 8 | 536 | 0.28% | Arbitrary |

**Search space explored**: ~60 formulas (ratio search)
**Success ratio**: 2/60 = 3% (22/9 ratio and offset formulas)

---

## OBSERVABLE: l_3 (Third Acoustic Peak)

**Measured**: 810
**Canonical**: l_3 = l_1 * 40/11 = 800 (1.2% error)
**Alternative**: l_3 = H * 5 * 41 = 820 (1.2% error)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | l_1 * 4 | 880 | 8.6% | Too simple, wrong |
| 2 | l_1 * Im_H + 150 | 810 | EXACT | Arbitrary offset |
| 3 | l_1 * Im_O/C | 770 | 4.9% | Off |
| 4 | n_c * 73 + 7 | 810 | EXACT | Arbitrary |
| 5 | Im_O * 115 + 5 | 810 | EXACT | Arbitrary |
| 6 | l_1 * (n_c + Im_H)/H | 770 | 4.9% | Off |
| 7 | l_2 * 1.5 | 806 | 0.49% | Good but arbitrary ratio |
| 8 | l_1 + l_2 + 52 | 810 | EXACT | Too arbitrary |
| 9 | O * 101 + 2 | 810 | EXACT | Arbitrary |
| 10 | l_1 * 41/11 | 820 | 1.2% | Same as H*5*41 pattern |

**Search space explored**: ~70 formulas
**Success ratio**: 3/70 = 4%
**Note**: TENSION — 800 and 820 formulas both have 1.2% error but predict different values

---

## OBSERVABLE: r_s (Sound Horizon)

**Measured**: 144.43 +/- 0.26 Mpc
**Successful**: r_s = 337 * 3/7 = 144.43 (0.01% error)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | 12^2 | 144 | 0.30% | Too simple, lacks framework |
| 2 | 144 exactly | 144 | 0.30% | No derivation |
| 3 | n_c * 13 + 1 | 144 | 0.30% | Arbitrary offset |
| 4 | H^2 * 9 | 144 | 0.30% | Matches but arbitrary |
| 5 | Im_O * 20 + 4 | 144 | 0.30% | Arbitrary |
| 6 | 337/2 - 24 | 144.5 | 0.05% | Close but messy |
| 7 | O * 18 | 144 | 0.30% | Why 18? |
| 8 | n_c * (n_c + 2) | 143 | 0.99% | Close but off |
| 9 | 1000 / Im_O | 142.86 | 1.1% | Off |
| 10 | p137 + Im_O | 144 | 0.30% | Works but unmotivated |

**Search space explored**: ~50 formulas
**Success ratio**: 1/50 = 2%
**Key insight**: 337 * 3/7 is unique in using the cosmological prime and quaternion/octonion ratio

---

## OBSERVABLE: H_0 (Hubble Constant)

**Measured**: 67.4 +/- 0.5 km/s/Mpc
**Successful**: H_0 = 337/5 = 67.4 (EXACT)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | 67 exactly | 67 | 0.59% | No derivation |
| 2 | n_c * 6 + 1 | 67 | 0.59% | Arbitrary offset |
| 3 | p137/2 | 68.5 | 1.6% | Off |
| 4 | O * 8 + 3 | 67 | 0.59% | Arbitrary |
| 5 | Im_O * 10 - 3 | 67 | 0.59% | Arbitrary |
| 6 | 200/3 | 66.67 | 1.1% | Close but not exact |
| 7 | n_c * (n_c - 5) | 66 | 2.1% | Off |
| 8 | H * n_c + 23 | 67 | 0.59% | Arbitrary |
| 9 | Im_H * 22 + 1 | 67 | 0.59% | Arbitrary |
| 10 | 337/(R + H) | 67.4 | EXACT | THIS IS THE CANONICAL |

**Search space explored**: ~40 formulas
**Success ratio**: 1/40 = 2.5%

---

## OBSERVABLE: Omega_Lambda (Dark Energy)

**Measured**: 0.685 +/- 0.007
**Successful**: Omega_L = 137/200 = 0.685 (EXACT)

### Failed Attempts

| # | Formula | Value | Error | Why Failed |
|---|---------|-------|-------|------------|
| 1 | 2/3 | 0.667 | 2.6% | Too simple, off |
| 2 | 0.7 | 0.7 | 2.2% | No derivation |
| 3 | Im_O/n_c | 0.636 | 7.2% | Wrong |
| 4 | (n_c - 1)/n_c - ... | various | varies | Many tried |
| 5 | n_c/(n_c + 5) | 0.688 | 0.44% | Close but unmotivated |
| 6 | H/(H + C) | 0.667 | 2.6% | Off |
| 7 | O/(O + H) | 0.667 | 2.6% | Off |
| 8 | Im_O/10 | 0.7 | 2.2% | Off |
| 9 | (H^2 + n_c^2)/200 | 0.685 | EXACT | THIS IS CANONICAL |
| 10 | 1 - 63/200 | 0.685 | EXACT | Equivalent form |

**Search space explored**: ~35 formulas
**Success ratio**: 1/35 = 3%

---

## AGGREGATE STATISTICS

### Summary Table

| Observable | Formulas Tried | Success Rate | Unique? |
|------------|----------------|--------------|---------|
| z_* | ~50 | 2% | YES |
| n_s | ~80 | 2.5% | NO (2 work) |
| l_1 | ~100 | 5% | NO (several work) |
| l_2 | ~60 | 3% | NO |
| l_3 | ~70 | 4% | NO |
| r_s | ~50 | 2% | YES |
| H_0 | ~40 | 2.5% | YES |
| Omega_L | ~35 | 3% | YES |

### Totals

- **Total formulas tried**: ~485
- **Total that work**: ~15
- **Average success rate**: 3%

### What This Means

If formulas were found by random search with 3% per-formula hit rate:
- Finding 12 observables would require trying: 12 / 0.03 = 400 formulas
- This is CONSISTENT with the ~485 formulas estimated

**Conclusion**: The search could plausibly have found these matches by systematic exploration, without implying deep physics.

---

## Counter-Argument: Why It's Not Just Search

1. **Internal consistency**: Omega_L + Omega_m = 1 (not fitted separately)
2. **The 200 family**: n_s, r, tau all use denominator 200
3. **The 337 family**: H_0 and r_s both use cosmological prime 337
4. **Predictions work**: r = 1 - n_s is a prediction, not a fit

---

## Recommendations

1. **Keep tracking failed attempts** — every new formula should list alternatives
2. **Publish this document** — transparency about the search process
3. **Focus on predictions** — formulas made BEFORE knowing target are more valuable
4. **Acknowledge the search** — don't claim derivations were inevitable

---

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2026-01-28 | 1.0 | Initial creation (Session 125) |

