# Negative Findings Analysis

**Purpose**: Document what DIDN'T work and extract lessons. Failed approaches are scientifically valuable.

**Date**: 2026-01-26
**Status**: LIVING DOCUMENT

---

## Why Track Negative Results?

1. **Prevents repeating mistakes** — Future sessions won't retry failed approaches
2. **Reveals framework limitations** — Shows what the axioms CAN'T do
3. **Guides future work** — Knowing what fails helps find what might work
4. **Intellectual honesty** — Real science reports failures, not just successes

---

## Negative Finding 1: Penrose-Diosi Comparison

### What We Tried
Compare perspective framework's gravitational decoherence prediction to Diósi-Penrose model to find a distinguishing experimental test.

### What We Found

The h(γ) = 2γ(1-γ) modification **suppresses** gravitational decoherence:

| System | h(γ) | Effect |
|--------|------|--------|
| Electrons (100nm) | ~10⁻⁵ | Negligible |
| C₆₀ (100nm) | ~10⁻¹¹ | Negligible |
| MAQRO (1μm) | ~10⁻¹² | Negligible |

**Result**: Both models predict undetectable effects → can't distinguish them.

### Lessons Learned

1. **The h(γ) modification makes framework LESS testable, not more**
   - Suppression factor h(γ) → 0 for L >> λ_C
   - All accessible experiments have L >> λ_C

2. **"Different" doesn't mean "testably different"**
   - Mathematical difference exists (h(γ) factor)
   - Practical difference is unmeasurable

3. **Null predictions are weak**
   - "Our model predicts no effect" isn't compelling
   - Can't distinguish from "model is wrong"

### What This Rules Out

- Gravitational decoherence as a novelty claim
- Intermediate-γ experiments at current technology
- h(γ) as a distinguishing prediction

### What This Suggests

- Need predictions that are ENHANCED, not suppressed
- Need regime where γ ~ 0.5 (L ~ λ_C) is accessible
- Maybe focus on non-decoherence predictions

### Documents
- `physics/penrose_diosi_comparison.md` — Full analysis

---

## Negative Finding 2: α = sin²θ_W/(2πn_EW) with n_EW = 5

### What We Tried
Derive fine structure constant from electroweak projection with n_EW = 5 basis dimensions.

### What We Found

**Multiple fatal problems:**

1. **Eddington Pattern**: Same structure as failed 1930s derivation
   - Know answer (α ≈ 1/137)
   - Find integer that works (n_EW = 5)
   - Retroactively justify

2. **Gell-Mann–Nishijima Violation**: Claimed 5D basis is dependent
   - Q = I₃ + Y/2 reduces dimension by 1
   - True dimension ≤ 4, not 5

3. **Internal Contradiction**: gauge_structure.md says n_EW = 3

4. **Standard Physics**: All methods give n = 4

### Lessons Learned

1. **0.7% accuracy with 1 free parameter is fitting, not derivation**
   - Expected accuracy from integer search: ~5%
   - Our "precision" was the result of parameter tuning

2. **Mathematical consistency matters**
   - The 5D claim violated established constraints
   - Should have checked Gell-Mann–Nishijima earlier

3. **Internal consistency matters**
   - Framework contradicted itself (3 vs 5)
   - This was a red flag we initially ignored

4. **Historical patterns repeat**
   - Eddington made the same mistake 90 years ago
   - Learning history could have prevented this

### What This Rules Out

- Any α derivation using arbitrary integer parameters
- Claims based on fitting to known values
- Basis counting arguments without rigorous justification

### What This Suggests

- Need parameter-free derivations
- Check mathematical consistency FIRST
- Compare to historical failed attempts

### Documents
- `archive/deprecated/alpha_derivation.md` — Historical record
- `references/failed_alpha_derivations.md` — Literature context

---

## Negative Finding 3: GR Limit "Derivation"

### What We Tried
Show that low-γ limit gives General Relativity with metric g_μν from Γ-structure.

### What We Found

**No actual derivation exists:**
- g_μν not constructed from Γ (only "proportional to")
- Einstein equations not derived
- Lorentzian signature not explained
- "Limit" is a hope, not a calculation

### Lessons Learned

1. **"Proportional to" is not a formula**
   - Need explicit construction: g_μν = f(Γ)
   - Without formula, no prediction

2. **Emergence is hard**
   - Getting classical geometry from discrete structure is an open problem in QG
   - We shouldn't claim to solve it without solving it

3. **QM limit is stronger than GR limit**
   - QM limit at least has a formula (Schrödinger)
   - GR limit has none

### What This Rules Out

- Claims that framework "derives" GR
- Low-γ as a complete limit

### What This Suggests

- Demote to SPECULATION (done)
- Either construct g_μν explicitly or admit it's open
- Focus on QM limit which is better developed

### Documents
- `physics/gr_limit_investigation.md` — Full analysis
- `physics/gravity_limit.md` — Updated status

---

## Negative Finding 4: Γ_dec and h(γ) "Derivations"

### What We Tried
Derive decoherence rate Γ_dec = (1-2γ)/t_P and modification h(γ) = 2γ(1-γ) from axioms.

### What We Found

**Cannot be derived from static axioms:**
- Axioms A1-A6 define STATIC structure
- Time is not defined in the framework
- Rate equations require dynamics (not present)
- t_P would need G, ℏ, c derived first (circular)

### Lessons Learned

1. **Static axioms can't give dynamics**
   - Structure ≠ dynamics
   - Need separate axioms for time evolution

2. **Dimensional analysis ≠ derivation**
   - Γ_dec has right dimensions
   - But form is assumed, not derived

3. **Many functions would work equally well**
   - h(γ) = 2γ(1-γ) is simplest symmetric polynomial
   - Other choices equally valid without derivation

### What This Rules Out

- Intermediate-γ predictions as "derived"
- Rate formulas without dynamics axioms

### What This Suggests

- Mark as ASSUMPTIONS (A15, A16) — done
- Future work: add dynamics axioms
- Be explicit about what's assumed vs derived

### Documents
- `physics/gamma_dec_investigation.md`
- `physics/h_gamma_investigation.md`

---

## Negative Finding 5: Recoherence Prediction

### What We Tried
Predict that γ > 0.5 gives spontaneous recoherence at Planck rates.

### What We Found

**Contradicts observation:**
- For electron at L = 1pm: γ ≈ 0.71
- Predicted: coherence doubles every 10⁻⁴³ s
- Observed: This doesn't happen

### Lessons Learned

1. **Test predictions against known physics**
   - Planck-rate recoherence would be obvious
   - Should have checked immediately

2. **Negative rates = problem**
   - Γ_dec < 0 for γ > 0.5 is unphysical
   - This should have been a red flag

3. **Retract rather than defend**
   - Correct response: retract claim
   - Wrong response: ad-hoc fixes

### What This Rules Out

- Γ_dec = (1-2γ)/t_P for γ > 0.5
- Recoherence as a prediction

### What This Suggests

- Restrict formula validity (done: γ ≤ 0.5 only)
- γ > 0.5 regime needs new approach
- Check predictions against observation FIRST

### Documents
- `issues_log.md` — I-001 resolution

---

## Negative Finding 6: n_color² in Weak Coupling (Partial)

### What We're Trying
Explain why sin²θ_W = n_weak/n_color² = 2/9.

### Current Status

**Pattern matches numerically (4% error) but mechanism unclear:**

| Approach | Result |
|----------|--------|
| Generator counting | Gives 3/8 at GUT, not 2/9 at low energy |
| Casimir ratios | Doesn't match |
| Projection geometry | Plausible but vague |
| Information theory | Speculative |

### Lessons So Far

1. **Numerical match ≠ understanding**
   - 2/9 ≈ 0.222 is close to 0.231
   - But WHY color squared? Unknown

2. **Multiple interpretations = warning**
   - If several vague stories work, none may be right

3. **Keep investigating but stay skeptical**

### Status
ONGOING — not yet a negative finding, but may become one

---

## Pattern Analysis: What Fails and Why

### Common Failure Modes

1. **Post-hoc fitting**
   - Know answer → find parameters → claim derivation
   - Examples: n_EW = 5, Eddington's 136/137

2. **Dimensional analysis disguised as derivation**
   - Right units ≠ right formula
   - Examples: Γ_dec, h(γ)

3. **Vague correspondence claimed as derivation**
   - "Proportional to" ≠ derived
   - Examples: GR limit

4. **Predictions that suppress rather than enhance**
   - If effect → 0, can't test
   - Examples: h(γ) suppression

5. **Ignoring contradictions**
   - Internal inconsistency ignored
   - Examples: n_EW = 5 vs gauge_structure.md

### What Succeeds (Tentatively)

| Success Criteria | Examples That Meet It |
|------------------|----------------------|
| Parameter-free | |Π| pattern (|Π| has cosmological meaning) |
| Multiple predictions | Coupling hierarchy (α, α_W, α_G from |Π|) |
| No internal contradiction | Current |Π| approach (so far) |
| Falsifiable | sin²θ_W = 2/9 prediction (testable) |

---

## Recommendations from Negative Findings

### Before Claiming a Derivation

1. **Check parameter count** — Zero free parameters?
2. **Check mathematical consistency** — No internal contradictions?
3. **Check against known physics** — Does it contradict observation?
4. **Check historical attempts** — Has this approach failed before?
5. **Check falsifiability** — What would prove it wrong?

### Before Claiming a Prediction

1. **Is effect enhanced or suppressed?** — Can we actually measure it?
2. **Does it differ from existing models?** — In a testable regime?
3. **Is the formula derived or assumed?** — Honest about status?

### Before Abandoning an Approach

1. **Document the failure thoroughly** — What exactly went wrong?
2. **Extract lessons** — What does this teach us?
3. **Preserve the record** — Future sessions need this

---

## Value of Negative Results

This document represents significant scientific value:

| Finding | Effort | Value |
|---------|--------|-------|
| Penrose-Diosi comparison | 1 session | Rules out novelty claim |
| α derivation deprecation | 2 sessions | Prevents future numerology |
| GR limit demotion | 1 session | Honest about gaps |
| Rate formula analysis | 1 session | Shows what axioms CAN'T do |
| Recoherence retraction | 0.5 session | Removes contradiction |

**Total: ~5 sessions of work preserved as lessons**

Without this document, future work might repeat these mistakes.

---

## Open Questions from Negative Findings

1. **What dynamics axioms would enable rate derivations?**
2. **Is there ANY distinguishing experimental test?**
3. **Can the |Π| approach avoid the pitfalls of n_EW = 5?**
4. **What would a genuine GR derivation require?**

---

*Document updated: 2026-01-26*
*Status: Living document — add new negative findings as discovered*
