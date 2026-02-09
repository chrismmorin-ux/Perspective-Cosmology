"""
Weight Variation vs Dimension Reduction for Running of alpha
============================================================

Investigates two mechanisms that could explain the running of alpha:

1. DIMENSION REDUCTION: n_defect and n_crystal change with energy
   - Based on spectral dimension reduction in quantum gravity
   - Predicts discrete values (integers/half-integers)
   - Has 1.6% error at Z scale, 5% at GUT

2. WEIGHT VARIATION: Weights on comparison types (A, B, C) change
   - Dimensions stay fixed at n=4, n=11
   - Can fit any value exactly (no predictive power)
   - Requires w_BC to drop to 0.22 at GUT

3. HYBRID: Dimension reduction provides structure, weights fine-tune
   - Weight corrections are small (~2% at Z, ~6% at GUT)
   - Dimension reduction does most of the work

Key Finding: Dimension reduction is MORE PREDICTIVE but less accurate.
             Weight variation can fit perfectly but predicts nothing.
             The dimension reduction picture is preferred epistemologically.

Session: 2026-01-26-25
"""

print("="*70)
print("RUNNING OF ALPHA: Weight Variation vs Dimension Reduction")
print("="*70)

# ============================================================
# Helper functions
# ============================================================

def get_counts(n):
    """Return (A, B, C) counts for U(n) decomposition.

    A = diagonal (self-comparison): n
    B = symmetric off-diagonal: n(n-1)/2
    C = antisymmetric off-diagonal: n(n-1)/2

    Total: n + n(n-1)/2 + n(n-1)/2 = n^2
    """
    A = n
    B = n * (n - 1) // 2
    C = n * (n - 1) // 2
    return A, B, C

def calc_alpha_inv_dimension(n_d, n_c):
    """1/alpha from dimension reduction: n_d^2 + n_c^2"""
    return n_d**2 + n_c**2

def calc_alpha_inv_weights(w_A, w_B, w_C, n_d=4, n_c=11):
    """1/alpha from weight variation on fixed dimensions."""
    A_d, B_d, C_d = get_counts(n_d)
    A_c, B_c, C_c = get_counts(n_c)
    return w_A * (A_d + A_c) + w_B * (B_d + B_c) + w_C * (C_d + C_c)

# ============================================================
# Data
# ============================================================

# Measured values at different scales
measured_data = {
    'IR': {'energy': 0, 'alpha_inv': 137.036},
    'Z': {'energy': 91.2, 'alpha_inv': 127.9},  # More precise value
    'GUT': {'energy': 1e16, 'alpha_inv': 42}
}

# Dimension reduction parameters (from Session 21)
dim_reduction = {
    'IR': {'n_d': 4, 'n_c': 11},
    'Z': {'n_d': 3, 'n_c': 11},
    'GUT': {'n_d': 2, 'n_c': 6}
}

# ============================================================
# Analysis 1: Pure Dimension Reduction
# ============================================================

print("\n" + "-"*70)
print("MECHANISM 1: Pure Dimension Reduction")
print("-"*70)
print("""
Formula: 1/alpha = n_defect^2 + n_crystal^2

Physical basis:
- Spectral dimension reduction in quantum gravity (4 -> 2)
- Universal across: Asymptotic Safety, CDT, LQG, String theory
- Crystal dimension also reduces (11 -> 6 at GUT)
""")

print(f"{'Scale':<10} {'n_d':>5} {'n_c':>5} {'Predicted':>12} {'Measured':>12} {'Error':>10}")
print("-"*60)

for scale in ['IR', 'Z', 'GUT']:
    n_d = dim_reduction[scale]['n_d']
    n_c = dim_reduction[scale]['n_c']
    pred = calc_alpha_inv_dimension(n_d, n_c)
    meas = measured_data[scale]['alpha_inv']
    error = (pred - meas) / meas * 100
    print(f"{scale:<10} {n_d:>5} {n_c:>5} {pred:>12} {meas:>12.1f} {error:>9.1f}%")

# ============================================================
# Analysis 2: Pure Weight Variation (fixed dimensions)
# ============================================================

print("\n" + "-"*70)
print("MECHANISM 2: Pure Weight Variation (fixed n=4, n=11)")
print("-"*70)
print("""
Formula: 1/alpha = w_A * A_total + w_B * B_total + w_C * C_total

With n=4, n=11:
  A_total = 4 + 11 = 15
  B_total = 6 + 55 = 61
  C_total = 6 + 55 = 61
""")

A_total = 4 + 11  # 15
BC_total = (6 + 55) + (6 + 55)  # 122

print(f"Totals: A={A_total}, B+C={BC_total}")
print()
print(f"{'Scale':<10} {'1/alpha':>10} {'w_A':>10} {'w_B=w_C':>10}")
print("-"*45)

for scale in ['IR', 'Z', 'GUT']:
    meas = measured_data[scale]['alpha_inv']
    # Solve: A_total * w_A + BC_total * w_BC = meas
    # Assume w_A = 1
    w_BC = (meas - A_total) / BC_total
    print(f"{scale:<10} {meas:>10.1f} {1.0:>10.3f} {w_BC:>10.3f}")

print("""
OBSERVATION:
  - At GUT, w_BC drops to 0.22 (78% suppression!)
  - Can fit any value, but no predictive power
  - What physical mechanism would cause such suppression?
""")

# ============================================================
# Analysis 3: Hybrid Approach
# ============================================================

print("\n" + "-"*70)
print("MECHANISM 3: Hybrid (Dimension Reduction + Weight Fine-Tuning)")
print("-"*70)
print("""
Idea: Dimension reduction provides discrete structure,
      small weight variations account for residual errors.
""")

print(f"{'Scale':<10} {'n_d':>5} {'n_c':>5} {'Dim pred':>10} {'Measured':>10} {'w_BC needed':>12}")
print("-"*60)

for scale in ['IR', 'Z', 'GUT']:
    n_d = dim_reduction[scale]['n_d']
    n_c = dim_reduction[scale]['n_c']
    dim_pred = calc_alpha_inv_dimension(n_d, n_c)
    meas = measured_data[scale]['alpha_inv']

    # Calculate weight needed
    A_tot = n_d + n_c
    BC_tot = n_d*(n_d-1) + n_c*(n_c-1)
    if BC_tot > 0:
        w_BC = (meas - A_tot) / BC_tot
    else:
        w_BC = float('nan')

    print(f"{scale:<10} {n_d:>5} {n_c:>5} {dim_pred:>10} {meas:>10.1f} {w_BC:>12.4f}")

print("""
OBSERVATION:
  - Weight corrections are SMALL (< 7% in all cases)
  - At Z: w_BC = 0.98 (just 2% suppression from pure dimension reduction)
  - At GUT: w_BC = 1.06 (6% enhancement! - opposite direction)
  - Dimension reduction does most of the work
""")

# ============================================================
# Comparison Summary
# ============================================================

print("\n" + "="*70)
print("SUMMARY: COMPARISON OF MECHANISMS")
print("="*70)
print("""
                        Dimension Reduction     Weight Variation
                        -------------------     ----------------
Predictive power:       HIGH (discrete values)  LOW (fits anything)
IR accuracy:            0.03%                   exact (by design)
Z accuracy:             1.6%                    exact (by design)
GUT accuracy:           4.8%                    exact (by design)

Physical basis:         Spectral dimension      ???
                        reduction (QG)

What changes:           n_d: 4->3->2            w_B, w_C: 1->0.93->0.22
                        n_c: 11->11->6          w_A: 1 (constant)

Distinguishing test:    Discrete jumps in       Smooth running
                        alpha at transition
                        energies

CONCLUSION: Dimension reduction is epistemologically preferred
            because it makes predictions that can be wrong.
            Weight variation is just curve-fitting.
""")

# ============================================================
# Physical interpretation of three types
# ============================================================

print("\n" + "="*70)
print("APPENDIX: The Three Comparison Types")
print("="*70)
print("""
For U(n) decomposition into n^2 generators:

Type A (diagonal, count = n):
  - Self-comparison (i = j)
  - Symmetric under exchange (trivially)
  - Scalar-like: no direction, phase information

Type B (symmetric off-diagonal, count = n(n-1)/2):
  - Mutual comparison (i != j)
  - gamma(i,j) = gamma(j,i) part
  - Vector-like: has direction but no handedness

Type C (antisymmetric off-diagonal, count = n(n-1)/2):
  - Chiral comparison (i != j)
  - gamma(i,j) = -gamma(j,i) part
  - Fermion-like: has handedness

The three types are mathematically forced:
Any comparison between i and j must be same (A), symmetric (B), or antisymmetric (C).
There are no other options.
""")

for n in [4, 11]:
    A, B, C = get_counts(n)
    print(f"n={n}: A={A}, B={B}, C={C}, total={A+B+C} = {n}^2 = {n**2}")
