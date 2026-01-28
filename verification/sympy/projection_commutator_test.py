#!/usr/bin/env python3
"""
Test: Do projection operators (perspectives) commute?

KEY QUESTION: If projections don't commute, the framework naturally has
non-commutativity — a key feature of quantum mechanics.

In QM: [A, B] != 0 means measuring A disturbs B
In framework: [pi₁, pi₂] != 0 would mean perspectives don't commute

Created: Session 108
"""

from sympy import *
from sympy.matrices import Matrix
import numpy as np

def projection_onto_line(theta):
    """
    2D projection matrix onto line at angle theta from x-axis.
    P = |u><u| where u = (cos θ, sin θ)
    """
    c, s = cos(theta), sin(theta)
    return Matrix([
        [c**2, c*s],
        [c*s, s**2]
    ])

def projection_onto_plane_3d(n):
    """
    3D projection matrix onto plane perpendicular to unit vector n.
    P = I - |n><n|
    """
    nx, ny, nz = n
    return Matrix([
        [1 - nx**2, -nx*ny, -nx*nz],
        [-nx*ny, 1 - ny**2, -ny*nz],
        [-nx*nz, -ny*nz, 1 - nz**2]
    ])

def projection_onto_subspace_3d(v1, v2):
    """
    3D projection onto 2D subspace spanned by v1, v2.
    Uses Gram-Schmidt to get orthonormal basis, then P = Sum|e_i><e_i|
    """
    # Normalize v1
    e1 = Matrix(v1) / sqrt(sum(x**2 for x in v1))

    # Gram-Schmidt for v2
    v2_vec = Matrix(v2)
    proj = (v2_vec.dot(e1)) * e1
    e2_raw = v2_vec - proj
    e2 = e2_raw / sqrt(e2_raw.dot(e2_raw))

    # P = |e1><e1| + |e2><e2|
    P = e1 * e1.T + e2 * e2.T
    return P

def test_2d_projections():
    """Test commutativity of 2D projections onto lines."""
    print("=" * 60)
    print("TEST 1: 2D Projections onto lines")
    print("=" * 60)

    theta = Symbol('theta', real=True)

    # P1: projection onto x-axis
    P1 = Matrix([[1, 0], [0, 0]])

    # P2: projection onto line at angle theta
    P2 = projection_onto_line(theta)

    print("\nP1 (onto x-axis):")
    print(P1)

    print("\nP2 (onto line at angle theta):")
    print(P2)

    # Compute products
    P1P2 = P1 * P2
    P2P1 = P2 * P1

    print("\nP1 · P2:")
    print(simplify(P1P2))

    print("\nP2 · P1:")
    print(simplify(P2P1))

    # Commutator
    commutator = simplify(P1P2 - P2P1)
    print("\n[P1, P2] = P1·P2 - P2·P1:")
    print(commutator)

    # Check if it's zero
    is_zero = commutator.equals(zeros(2, 2))
    print(f"\nCommutator is zero? {is_zero}")

    # Check at specific angle
    comm_at_pi4 = commutator.subs(theta, pi/4)
    print(f"\nAt theta = pi/4: [P1, P2] = {simplify(comm_at_pi4)}")

    # Compute norm of commutator
    comm_norm_sq = sum(x**2 for x in commutator)
    print(f"\n||[P1, P2]||² = {simplify(comm_norm_sq)}")
    print(f"Simplified: {simplify(trigsimp(comm_norm_sq))}")

    return commutator

def test_3d_projections():
    """Test commutativity of 3D projections."""
    print("\n" + "=" * 60)
    print("TEST 2: 3D Projections onto 2D planes")
    print("=" * 60)

    # P1: projection onto xy-plane (perpendicular to z)
    P1 = Matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ])

    # P2: projection onto xz-plane (perpendicular to y)
    P2 = Matrix([
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1]
    ])

    print("\nP1 (onto xy-plane):")
    print(P1)

    print("\nP2 (onto xz-plane):")
    print(P2)

    # Compute products
    P1P2 = P1 * P2
    P2P1 = P2 * P1

    print("\nP1 · P2:")
    print(P1P2)

    print("\nP2 · P1:")
    print(P2P1)

    # Commutator
    commutator = P1P2 - P2P1
    print("\n[P1, P2] = P1·P2 - P2·P1:")
    print(commutator)

    is_zero = commutator.equals(zeros(3, 3))
    print(f"\nCommutator is zero? {is_zero}")

    return commutator

def test_tilted_projections():
    """Test projections with tilt (generic angle)."""
    print("\n" + "=" * 60)
    print("TEST 3: Tilted 3D projections (parametric)")
    print("=" * 60)

    theta, phi = symbols('theta phi', real=True)

    # P1: projection onto xy-plane
    P1 = Matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ])

    # P2: projection onto plane perpendicular to (sin θ cos φ, sin θ sin φ, cos θ)
    n = [sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta)]
    P2 = projection_onto_plane_3d(n)

    print("\nP1 (onto xy-plane):")
    print(P1)

    print("\nP2 (onto plane perpendicular to n(theta,phi)):")
    print("(too complex to print fully)")

    # Commutator
    commutator = simplify(P1 * P2 - P2 * P1)

    # Check at specific values
    comm_specific = commutator.subs([(theta, pi/4), (phi, 0)])
    print(f"\nAt theta=pi/4, phi=0: [P1, P2] = ")
    print(simplify(comm_specific))

    is_zero = simplify(comm_specific).equals(zeros(3, 3))
    print(f"\nCommutator is zero at this point? {is_zero}")

    return commutator

def interpretation():
    """Physical interpretation of non-commuting projections."""
    print("\n" + "=" * 60)
    print("INTERPRETATION FOR QUANTUM MECHANICS")
    print("=" * 60)

    print("""
KEY FINDING: Projection operators generally DO NOT COMMUTE.

In standard linear algebra:
- P1 P2 != P2 P1 unless the subspaces are orthogonal or nested
- [P1, P2] != 0 is the GENERIC case

Connection to QM:
- Position projection |x><x| and momentum projection |p><p| don't commute
- This is the origin of [x, p] = i*hbar
- Framework's perspectives (projections) naturally have this structure!

HOWEVER, there's a subtlety:
- QM observables are Hermitian operators, not just projections
- Observable A has spectral decomposition A = Sum a_i P_i
- The non-commutativity comes from non-orthogonal eigenspaces

What the framework provides:
- Perspectives pi are projection operators
- Different perspectives don't commute (pi₁pi₂ != pi₂pi₁)
- This is COMPATIBLE with QM non-commutativity

What's still missing:
- Why specific observables (position, momentum)?
- Why [x, p] = ihbar specifically?
- The VALUE of hbar

CONCLUSION: The framework has natural non-commutativity from projection structure.
This is COMPATIBLE with QM but doesn't DERIVE the specific form [x,p] = ihbar.
""")

def main():
    print("Testing whether perspective projections commute")
    print("=" * 60)

    # Test 1: 2D
    comm_2d = test_2d_projections()

    # Test 2: 3D coordinate planes
    comm_3d = test_3d_projections()

    # Test 3: Generic tilted
    comm_tilted = test_tilted_projections()

    # Interpretation
    interpretation()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    tests = [
        ("2D line projections", not comm_2d.equals(zeros(2, 2))),
        ("3D plane projections (coordinate)", comm_3d.equals(zeros(3, 3))),
    ]

    print("\nResults:")
    for name, commutes_to_zero in tests:
        status = "COMMUTE" if commutes_to_zero else "DON'T COMMUTE"
        print(f"  {name}: {status}")

    print("""
KEY INSIGHT:
- Projections onto orthogonal subspaces: [P1, P2] = 0
- Projections onto non-orthogonal subspaces: [P1, P2] != 0

The framework's perspectives (projections) naturally exhibit non-commutativity
when they access overlapping but non-identical subspaces.

This provides a STRUCTURAL basis for QM non-commutativity,
even if the specific commutation relations aren't derived.
""")

if __name__ == "__main__":
    main()
