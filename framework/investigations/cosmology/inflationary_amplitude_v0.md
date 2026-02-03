# Inflationary Amplitude V₀ Derivation

**Status**: GAP (G-CMB-V0)
**Created**: Session 189, 2026-02-02
**Last Updated**: Session 189, 2026-02-02

---

## Plain Language

The CMB's temperature fluctuations have a specific amplitude — about 1 part in 100,000. In the framework's hilltop inflation model, this amplitude is set by V₀, the height of the potential hill. The shape of the hill (encoded in μ²) is derived from division algebra dimensions, giving n_s = 0.965 and r = 0.035. But the *height* — the overall energy scale of inflation — remains underived.

This is the hardest kind of quantity to derive: an absolute energy scale, not a ratio. The framework excels at ratios (things like 3/7 or 28/121) but has no mechanism to set an overall scale without importing it from measurement.

Four derivation paths were tested. All failed. V₀ requires approximately α^4.2 × M_Pl⁴, which is not a clean power of the fine structure constant.

**One-sentence version**: The inflationary amplitude V₀ has no framework derivation — it requires an absolute energy scale the framework cannot currently produce.

---

## Question

Can V₀ (the hilltop potential height) be derived from framework principles, fixing A_s without imports?

## The Back-Calculation

From Planck 2018: A_s = 2.1 × 10⁻⁹

The slow-roll formula:
```
A_s = V / (24π²ε M_Pl⁴)
    = V₀(5/6) / (24π² × 7/3200 × M_Pl⁴)
    = V₀ / (M_Pl⁴ × 63π²/1000)
```

Therefore: **V₀/M_Pl⁴ ≈ 1.3 × 10⁻⁹**

Notable: The coefficient 63π²/1000 has framework structure:
- 63 = Im_O × Im_H² = 7 × 9
- 1000 = (Im_H + Im_O)³ = 10³

But A_s itself is [A-IMPORT], so this reformulation doesn't derive V₀.

## Four Paths Tested

### Path 1: Democratic Energy — FAIL

V₀ = M_Pl⁴/N_I^k for integer k?

| k | A_s | Ratio to measured |
|---|-----|-------------------|
| 3 | 6.3 × 10⁻⁷ | 298× |
| 4 | 4.6 × 10⁻⁹ | 2.2× |
| 5 | 3.3 × 10⁻¹¹ | 0.02× |

Best fit: k ≈ 4.16 — not a clean integer.

### Path 2: Tilt Potential Connection — FAIL

| Expression | V₀/M_Pl⁴ | A_s | Ratio |
|-----------|-----------|-----|-------|
| b = α M_Pl⁴ | 7.3 × 10⁻³ | 1.2 × 10⁻² | 5.6M× |
| a = 2α³ M_Pl⁴ | 7.8 × 10⁻⁷ | 1.3 × 10⁻⁶ | 596× |
| W(ε*) = α⁵ M_Pl⁴ | 2.1 × 10⁻¹¹ | 3.3 × 10⁻¹¹ | 0.016× |
| a·b = 2α⁴ M_Pl⁴ | 5.7 × 10⁻⁹ | 9.1 × 10⁻⁹ | 4.3× |

Closest: a·b = 2α⁴ M_Pl⁴, giving A_s = 9.1 × 10⁻⁹ (4.3× too large).

**Notable near-miss**: V₀ = α⁴ × Im_O/n_c gives ratio 1.38 — within a factor of 1.4. But this is post-hoc and HRS would be high.

### Path 3: Expression Search — PARTIAL

| Expression | Ratio to target |
|-----------|----------------|
| α⁴ × Im_O/n_c | 1.38 |
| ε × α³ | 0.65 |
| α⁵ × π² | 0.16 |

The coefficient in the A_s formula is framework-structured: 63/1000 = Im_O·Im_H²/(Im_H+Im_O)³.

But A_s is imported, making this circular.

### Path 4: Mode Counting — FAIL

No combination of α powers and G₁ = 28 (Stage-1 Goldstones) produces A_s ~ 2.1 × 10⁻⁹.

## Summary

| Path | Verdict | Best attempt |
|------|---------|-------------|
| 1. Democratic | FAIL | k = 4.16 (non-integer) |
| 2. Tilt potential | FAIL | 2α⁴ gives 4.3× |
| 3. Expression search | PARTIAL | α⁴·Im_O/n_c gives 1.38× |
| 4. Mode counting | FAIL | No match |

## Why This Is Hard

The framework derives *ratios* well (dimensionless quantities from division algebra counting). V₀ is an *absolute energy scale*. Setting it requires knowing the Planck mass in "crystallization units," which the framework doesn't specify.

This is structurally analogous to the cosmological constant problem: the framework can derive the shape of the potential but not its normalization.

## Open Questions

1. **Planck mass in framework units**: What sets M_Pl in terms of crystallization parameters?
2. **Radiative corrections**: Does the one-loop CW potential fix V₀ once the other parameters are known?
3. **Alternative inflation models**: Could V₀ emerge from a tunneling calculation (Hawking-Moss) rather than a classical potential?
4. **The α⁴·Im_O/n_c near-miss**: Is 7/11 × α⁴ meaningful, or post-hoc?

## Dependencies

- Uses: THM_0496 (democratic distribution), hilltop potential (μ² = 1536/7), [A-IMPORT] A_s
- Used by: CMB amplitude, inflationary energy scale, reheating temperature

## Verification

**Script**: `verification/sympy/v0_democratic_derivation.py` — 14/14 PASS

## Session History

| Session | Work Done | Outcome |
|---------|-----------|---------|
| 189 | 4-path derivation search | All fail. Gap G-CMB-V0 OPEN. α⁴·Im_O/n_c near-miss noted. |
