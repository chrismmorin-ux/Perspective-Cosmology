"""
Hypercharge Derivation from Division Algebras

This script verifies that all 5 SM hypercharges can be derived from Im(H) = 3
(the dimension of imaginary quaternions), plus standard constraints.

DERIVATION CHAIN:
    T1 (time has direction)
    -> F = C (complex structure required)
    -> Division algebras: R, C, H, O
    -> Im(H) = 3 (imaginary quaternion dimensions)
    -> O gives SU(3) with N_colors = 3
    -> H gives SU(2) with T3 = +/- 1/2
    -> B = 1/N_colors = 1/3 for quarks (color triplets)
    -> L = 1/1 = 1 for leptons (color singlets)
    -> Y_L = (B - L)/2 for left-handed fermions
    -> Y_R = Y_L + T3_L (charge conservation)
    -> All 5 hypercharges: 1/6, 2/3, -1/3, -1/2, -1

Verified: 2026-01-26 (Session 49)
"""

from fractions import Fraction

def derive_hypercharges(Im_H=3):
    """
    Derive all SM hypercharges from Im(H).

    Parameters:
        Im_H: Dimension of imaginary quaternions (default 3)

    Returns:
        dict: All derived hypercharges
    """
    # Step 1: Number of colors from Im(H)
    N_colors = Im_H  # = 3

    # Step 2: Conserved numbers
    # B = 1/N_colors (3 quarks make 1 baryon)
    # L = 1 (leptons are color singlets, no dilution)
    B = Fraction(1, N_colors)
    L = Fraction(1, 1)

    # Step 3: T3 values from SU(2) fundamental representation
    T3_up = Fraction(1, 2)    # up-type: u, nu
    T3_down = Fraction(-1, 2)  # down-type: d, e

    # Step 4: Left-handed hypercharges via Y = (B - L)/2
    Y_Q_L = (B - 0) / 2   # quarks: B = 1/3, L = 0
    Y_L_L = (0 - L) / 2   # leptons: B = 0, L = 1

    # Step 5: Right-handed hypercharges via Y_R = Y_L + T3_L
    # (This preserves electric charge: Q = T3 + Y)
    Y_u_R = Y_Q_L + T3_up    # u_R
    Y_d_R = Y_Q_L + T3_down  # d_R
    Y_e_R = Y_L_L + T3_down  # e_R

    return {
        'Y_Q': Y_Q_L,   # Quark doublet
        'Y_u': Y_u_R,   # Up-type singlet
        'Y_d': Y_d_R,   # Down-type singlet
        'Y_L': Y_L_L,   # Lepton doublet
        'Y_e': Y_e_R,   # Electron singlet
    }


def check_anomalies(Y_Q, Y_u, Y_d, Y_L, Y_e):
    """
    Verify anomaly cancellation with correct chirality signs.

    Left-handed contribute +, right-handed contribute -
    """
    # SU(3)^2 x U(1): color triplets
    su3_u1 = 2*Y_Q - Y_u - Y_d

    # SU(2)^2 x U(1): weak doublets
    su2_u1 = 3*Y_Q + Y_L

    # U(1)^3
    u1_3 = (6*Y_Q**3 + 2*Y_L**3) - (3*Y_u**3 + 3*Y_d**3 + Y_e**3)

    # Gravitational (Tr Y)
    grav = (6*Y_Q + 2*Y_L) - (3*Y_u + 3*Y_d + Y_e)

    return {
        'gravitational': grav,
        'U1_cubed': u1_3,
        'SU2_U1': su2_u1,
        'SU3_U1': su3_u1,
    }


def verify_uniqueness():
    """
    Prove that SM hypercharges are unique given constraints:
    1. Quark charges in multiples of 1/3 (from 3 colors)
    2. Q(proton) = 2*Q_u + Q_d = 1
    3. Q(electron) = -1, Q(neutrino) = 0
    4. All anomalies cancel
    """
    solutions = []

    for Q_u_num in range(-3, 4):
        for Q_d_num in range(-3, 4):
            Q_u = Fraction(Q_u_num, 3)
            Q_d = Fraction(Q_d_num, 3)

            # Constraint: proton charge = 1
            if 2*Q_u + Q_d != 1:
                continue

            Q_e = -1
            Q_nu = 0

            # Derive Y from Q = T3 + Y
            Y_Q = Q_u - Fraction(1, 2)  # u_L has T3 = +1/2
            Y_Q_check = Q_d + Fraction(1, 2)  # d_L has T3 = -1/2
            if Y_Q != Y_Q_check:
                continue  # Doublet members must have same Y

            Y_L = Q_nu - Fraction(1, 2)
            Y_L_check = Q_e + Fraction(1, 2)
            if Y_L != Y_L_check:
                continue

            Y_u = Q_u
            Y_d = Q_d
            Y_e = Fraction(Q_e, 1)

            anomalies = check_anomalies(Y_Q, Y_u, Y_d, Y_L, Y_e)

            if all(v == 0 for v in anomalies.values()):
                solutions.append({
                    'Q_u': Q_u, 'Q_d': Q_d,
                    'Y_Q': Y_Q, 'Y_u': Y_u, 'Y_d': Y_d,
                    'Y_L': Y_L, 'Y_e': Y_e
                })

    return solutions


def main():
    print("=" * 60)
    print("HYPERCHARGE DERIVATION FROM DIVISION ALGEBRAS")
    print("=" * 60)

    # Derive hypercharges
    Im_H = 3  # From division algebra structure
    derived = derive_hypercharges(Im_H)

    # SM values for comparison
    SM = {
        'Y_Q': Fraction(1, 6),
        'Y_u': Fraction(2, 3),
        'Y_d': Fraction(-1, 3),
        'Y_L': Fraction(-1, 2),
        'Y_e': Fraction(-1, 1),
    }

    print(f"\nFrom Im(H) = {Im_H}:")
    print("\n{:<10} {:<12} {:<12} {}".format(
        "Fermion", "Derived", "SM Value", "Match"))
    print("-" * 50)

    all_match = True
    for name in SM:
        d = derived[name]
        s = SM[name]
        match = "PASS" if d == s else "FAIL"
        if d != s:
            all_match = False
        print("{:<10} {:<12} {:<12} {}".format(
            name, str(d), str(s), match))

    # Check anomalies
    print("\n" + "=" * 60)
    print("ANOMALY CANCELLATION CHECK")
    print("=" * 60)

    anomalies = check_anomalies(**derived)
    print("\n{:<20} {:<15} {}".format("Anomaly", "Value", "Status"))
    print("-" * 45)
    for name, value in anomalies.items():
        status = "PASS" if value == 0 else "FAIL"
        print("{:<20} {:<15} {}".format(name, str(value), status))

    # Verify uniqueness
    print("\n" + "=" * 60)
    print("UNIQUENESS VERIFICATION")
    print("=" * 60)

    solutions = verify_uniqueness()
    print(f"\nSolutions found: {len(solutions)}")

    if len(solutions) == 1:
        print("\nRESULT: SM hypercharges are UNIQUELY determined by:")
        print("  1. Quark charges in multiples of 1/3 (from 3 colors)")
        print("  2. Q(proton) = 1")
        print("  3. Q(electron) = -1, Q(neutrino) = 0")
        print("  4. Anomaly cancellation")

    # Final result
    print("\n" + "=" * 60)
    print("FINAL RESULT")
    print("=" * 60)

    if all_match and len(solutions) == 1 and all(v == 0 for v in anomalies.values()):
        print("\nVERIFICATION: PASSED")
        print("\nAll 5 SM hypercharges derived from Im(H) = 3:")
        print("  Y_Q = 1/6    (quark doublet)")
        print("  Y_u = 2/3    (up-type singlet)")
        print("  Y_d = -1/3   (down-type singlet)")
        print("  Y_L = -1/2   (lepton doublet)")
        print("  Y_e = -1     (electron singlet)")
        print("\nDerivation chain:")
        print("  T1 -> F=C -> Div.Alg. -> Im(H)=3 -> N_colors=3")
        print("  -> B=1/3, L=1 -> Y=(B-L)/2 -> All hypercharges")
        return True
    else:
        print("\nVERIFICATION: FAILED")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
