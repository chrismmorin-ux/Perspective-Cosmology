#!/usr/bin/env python3
"""
Mass Ratio Prime Search
=======================
Search for prime structure in fundamental mass ratios.

Goal: If every prime is a crystallization attractor, we should find
primes appearing in mass ratios and other dimensionless quantities.

Created: 2026-01-27 (Session 79)
"""

from sympy import *
from sympy.ntheory import isprime, factorint, primerange
import math

print("="*70)
print("MASS RATIO PRIME SEARCH")
print("="*70)

# PDG 2024 masses (MeV)
m_e = 0.51099895  # electron
m_mu = 105.6583755  # muon
m_tau = 1776.86  # tau

m_u = 2.16  # up quark (MS-bar at 2 GeV)
m_d = 4.67  # down quark
m_s = 93.4  # strange
m_c = 1270  # charm
m_b = 4180  # bottom
m_t = 172760  # top

m_W = 80369  # W boson
m_Z = 91187.6  # Z boson
m_H = 125250  # Higgs

m_p = 938.272  # proton

print("\n" + "="*70)
print("PART 1: LEPTON MASS RATIOS")
print("="*70)

# Lepton mass ratios
r_mu_e = m_mu / m_e
r_tau_e = m_tau / m_e
r_tau_mu = m_tau / m_mu

print(f"\nm_mu/m_e = {r_mu_e:.4f}")
print(f"m_tau/m_e = {r_tau_e:.4f}")
print(f"m_tau/m_mu = {r_tau_mu:.4f}")

# Check tau/muon ratio
print(f"\n--- m_tau/m_mu Analysis ---")
print(f"Exact value: {r_tau_mu:.6f}")
print(f"Nearest integer: {round(r_tau_mu)}")

# Is it close to 17?
print(f"Distance from 17: {abs(r_tau_mu - 17):.4f} ({100*abs(r_tau_mu - 17)/17:.2f}%)")

# 17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2
print(f"\n17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2")
print(f"  This would connect tau/muon ratio to R (scalar) and H (spacetime)")

# Check sqrt ratio
sqrt_r_tau_mu = math.sqrt(r_tau_mu)
print(f"\nsqrt(m_tau/m_mu) = {sqrt_r_tau_mu:.6f}")
print(f"Distance from 4: {abs(sqrt_r_tau_mu - 4):.4f} ({100*abs(sqrt_r_tau_mu - 4)/4:.2f}%)")

# Muon/electron ratio
print(f"\n--- m_mu/m_e Analysis ---")
print(f"Exact value: {r_mu_e:.6f}")

# Check nearby integers
for n in range(200, 215):
    if abs(r_mu_e - n) < 2:
        factors = factorint(n)
        print(f"  {n} = {factors}, distance = {abs(r_mu_e - n):.4f}")

# 207 = 9 * 23 = 3^2 * 23
print(f"\n207 = 3^2 * 23 where 23 is PRIME")
print(f"  Distance from 207: {abs(r_mu_e - 207):.4f} ({100*abs(r_mu_e - 207)/207:.2f}%)")

# 206 = 2 * 103 where 103 is prime
print(f"\n206 = 2 * 103 where 103 is PRIME")
print(f"  Distance from 206: {abs(r_mu_e - 206):.4f}")

print("\n" + "="*70)
print("PART 2: PROTON/ELECTRON RATIO")
print("="*70)

r_p_e = m_p / m_e
print(f"\nm_p/m_e = {r_p_e:.4f}")

# Prime factorization of nearby integers
for n in range(1834, 1840):
    factors = factorint(n)
    print(f"  {n} = {factors}")

# 1836 = 4 * 459 = 4 * 9 * 51 = 4 * 9 * 3 * 17 = 2^2 * 3^3 * 17
print(f"\n1836 = 2^2 * 3^3 * 17")
print(f"  Contains primes 2, 3, and 17!")
print(f"  17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2")

print("\n" + "="*70)
print("PART 3: FRAMEWORK PRIME CATALOG")
print("="*70)

# Framework dimensions
dims = [1, 2, 3, 4, 7, 8, 11]
print(f"\nFramework dimensions: {dims}")

# Find all primes expressible as a^2 + b^2 for a,b in dims
framework_primes = set()
sum_of_squares_primes = {}

for i, a in enumerate(dims):
    for b in dims[i:]:  # avoid duplicates
        n = a*a + b*b
        if isprime(n):
            framework_primes.add(n)
            sum_of_squares_primes[n] = (a, b)

print(f"\nPrimes expressible as a^2 + b^2 for framework dimensions:")
for p in sorted(framework_primes):
    a, b = sum_of_squares_primes[p]
    print(f"  {p} = {a}^2 + {b}^2")

print("\n" + "="*70)
print("PART 4: SEARCHING FOR MISSING PRIMES")
print("="*70)

# Low primes that are NOT directly framework dimensions
low_primes = [5, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]

print(f"\nSearching for primes: {low_primes}")

# Check which appear in sum-of-squares form
print("\nAs sums of framework dimension squares:")
for p in low_primes:
    if p in framework_primes:
        a, b = sum_of_squares_primes[p]
        print(f"  {p} = {a}^2 + {b}^2 [YES]")
    else:
        print(f"  {p} -- NOT expressible [NO]")

# Check if they appear in mass ratios
print("\nIn lepton mass ratios:")
print(f"  23 appears in 207 = 3^2 * 23 (near m_mu/m_e)")
print(f"  17 appears in m_tau/m_mu ~ 17 (1.1% off)")
print(f"  17 appears in 1836 = 2^2 * 3^3 * 17 (m_p/m_e)")

print("\n" + "="*70)
print("PART 5: KOIDE FORMULA CHECK")
print("="*70)

# Koide Q parameter
sqrt_me = math.sqrt(m_e)
sqrt_mmu = math.sqrt(m_mu)
sqrt_mtau = math.sqrt(m_tau)

sum_masses = m_e + m_mu + m_tau
sum_sqrt_sq = (sqrt_me + sqrt_mmu + sqrt_mtau)**2

Q = sum_masses / sum_sqrt_sq
print(f"\nKoide Q = {Q:.7f}")
print(f"Expected: 2/3 = {2/3:.7f}")
print(f"Error: {100*abs(Q - 2/3)/(2/3):.4f}%")

# Koide mass parameter M
M_koide = ((sqrt_me + sqrt_mmu + sqrt_mtau)/3)**2
print(f"\nKoide M = {M_koide:.4f} MeV")

# Check if M relates to framework
v = 246000  # Higgs VEV in MeV
# M = v / (n_d * Im(O))^2 = v / (4 * 7)^2 = v / 784
M_predicted = v / 784
print(f"Predicted M = v/784 = {M_predicted:.4f} MeV")
print(f"Error: {100*abs(M_koide - M_predicted)/M_predicted:.2f}%")

print("\n" + "="*70)
print("PART 6: PRIME STRUCTURE OF SQRT MASS RATIOS")
print("="*70)

# The Koide formula uses sqrt masses. What about sqrt ratios?
sqrt_r_mu_e = math.sqrt(m_mu/m_e)
sqrt_r_tau_e = math.sqrt(m_tau/m_e)
sqrt_r_tau_mu = math.sqrt(m_tau/m_mu)

print(f"\nsqrt(m_mu/m_e) = {sqrt_r_mu_e:.4f}")
print(f"sqrt(m_tau/m_e) = {sqrt_r_tau_e:.4f}")
print(f"sqrt(m_tau/m_mu) = {sqrt_r_tau_mu:.4f}")

# Check ratios
print(f"\nRatio sqrt(m_tau/m_e) / sqrt(m_mu/m_e) = {sqrt_r_tau_e/sqrt_r_mu_e:.4f}")
print(f"This equals sqrt(m_tau/m_mu) = {sqrt_r_tau_mu:.4f}")

# Close to 4?
print(f"\nsqrt(m_tau/m_mu) ~ 4 = dim(H)?")
print(f"Error: {100*abs(sqrt_r_tau_mu - 4)/4:.2f}%")

print("\n" + "="*70)
print("PART 7: SUMMARY OF PRIME APPEARANCES")
print("="*70)

print("""
CONFIRMED PRIME APPEARANCES:
  2: dim(C), binary structure
  3: Im(H), generations, colors
  7: Im(O), octonion imaginaries
  11: n_c, crystal dimensions
  73: Koide theta = pi*73/99 (8^2 + 3^2)
  137: 1/alpha (4^2 + 11^2)

POTENTIAL NEW FINDINGS (this analysis):
  17: m_tau/m_mu ~ 17 (1.1% error)
      1836 = 2^2 * 3^3 * 17 (m_p/m_e)
      17 = 1^2 + 4^2 = dim(R)^2 + dim(H)^2

  23: 207 = 3^2 * 23 (near m_mu/m_e ~ 206.77)

STILL MISSING:
  5: No clear appearance found
  13: 13 = 2^2 + 3^2 but no physical constant yet
  19, 29, 31, ...: Not yet identified
""")

print("="*70)
print("CONCLUSION")
print("="*70)
print("""
The mass ratio m_tau/m_mu ~ 16.82 is within 1.1% of prime 17.
This is HIGHLY SUGGESTIVE because:
  - 17 = 1^2 + 4^2 involves dim(R) and dim(H)
  - 17 also appears in m_p/m_e = 1836 = 2^2 * 3^3 * 17
  - The tau/muon ratio should have SOME framework explanation

If m_tau/m_mu = 17 exactly, this would be a MAJOR prediction.
The 1% discrepancy might be quantum corrections.

Next steps:
1. Check if loop corrections bring m_tau/m_mu closer to 17
2. Search for prime 5 in other constants
3. Build complete prime -> physics mapping
""")
