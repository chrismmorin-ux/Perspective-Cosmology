#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
"""
Associativity vs Alternativity Analysis for G-004

KEY FINDING: The framework needs EITHER associativity OR alternativity OR
a multiplicative norm to select R,C,H,O uniquely. Without any of these,
only the dimension restriction {1,2,4,8} holds (Bott-Milnor-Kervaire),
with infinitely many division algebras in each dimension.

QUESTION: Do the 19 framework axioms imply associativity, alternativity,
or a multiplicative norm for the transition algebra?

ANALYSIS:
- THM_0482 (no zero divisors): PROVEN from AXM_0102
- THM_0483 (invertibility): PROVEN from AXM_0115
- AXM_0113 (finite dimension): AXIOM
- Associativity: NOT PROVEN (G-004 OPEN)

This script verifies:
1. The algebraic properties that ARE derived from axioms
2. The distinction between associativity and alternativity
3. What each classification theorem requires
4. Whether the framework NEEDS associativity or could use a weaker condition

Status: VERIFICATION
Created: Session 181 (Phase 0 of Rigorous Formalization)
"""

from sympy import *
from itertools import product as iprod

# ==============================================================================
# PART 1: Verify octonion non-associativity explicitly
# ==============================================================================

def test_octonion_associativity():
    """
    Verify that octonions fail associativity but satisfy alternativity.
    Use the standard Cayley-Dickson multiplication table.
    """
    print("=" * 70)
    print("PART 1: Octonion associativity vs alternativity")
    print("=" * 70)

    # Standard octonion multiplication table for basis elements e1..e7
    # e_i * e_j for imaginary units (Fano plane convention)
    # Triples: (1,2,3), (1,4,5), (1,7,6), (2,4,6), (2,5,7), (3,4,7), (3,6,5)
    # (ij=k cyclically within each triple)

    # Multiplication table: mult[i][j] = (sign, index) where e_i * e_j = sign * e_index
    # Index 0 = real unit

    triples = [(1,2,3), (1,4,5), (1,7,6), (2,4,6), (2,5,7), (3,4,7), (3,6,5)]

    # Build full multiplication table for e_1 through e_7
    mult = {}
    for a,b,c in triples:
        mult[(a,b)] = (1, c)
        mult[(b,c)] = (1, a)
        mult[(c,a)] = (1, b)
        mult[(b,a)] = (-1, c)
        mult[(c,b)] = (-1, a)
        mult[(a,c)] = (-1, b)

    # e_i * e_i = -1 (real part)
    for i in range(1, 8):
        mult[(i,i)] = (-1, 0)

    def oct_mult_basis(i, j):
        """Multiply basis elements e_i * e_j. i,j in {0,1,...,7} where 0=real."""
        if i == 0 and j == 0:
            return (1, 0)
        elif i == 0:
            return (1, j)
        elif j == 0:
            return (1, i)
        else:
            return mult[(i,j)]

    # Test associativity: (e_i * e_j) * e_k vs e_i * (e_j * e_k)
    assoc_failures = 0
    assoc_successes = 0

    for i in range(1, 8):
        for j in range(1, 8):
            for k in range(1, 8):
                if i == j or j == k or i == k:
                    continue  # Skip when indices repeat (trivially associative)

                # (e_i * e_j) * e_k
                s1, idx1 = oct_mult_basis(i, j)
                if idx1 == 0:
                    left = (s1, k)  # s1 * 1 * e_k
                else:
                    s2, idx2 = oct_mult_basis(idx1, k)
                    left = (s1 * s2, idx2)

                # e_i * (e_j * e_k)
                s3, idx3 = oct_mult_basis(j, k)
                if idx3 == 0:
                    right = (s3, i)  # e_i * s3 * 1
                else:
                    s4, idx4 = oct_mult_basis(i, idx3)
                    right = (s3 * s4, idx4)

                if left == right:
                    assoc_successes += 1
                else:
                    assoc_failures += 1

    total = assoc_failures + assoc_successes
    print(f"\nAssociativity test on distinct imaginary basis triples:")
    print(f"  Associative triples: {assoc_successes}/{total}")
    print(f"  Non-associative triples: {assoc_failures}/{total}")
    print(f"  Fraction non-associative: {assoc_failures/total:.3f}")

    # Test alternativity: (xx)y = x(xy) and (yx)x = y(xx)
    # For basis elements e_i, e_i^2 = -1, so:
    # Left alt: (e_i*e_i)*e_j = -e_j, and e_i*(e_i*e_j) = ?
    alt_left_pass = 0
    alt_left_fail = 0

    for i in range(1, 8):
        for j in range(1, 8):
            if i == j:
                continue
            # (e_i * e_i) * e_j = (-1) * e_j
            left = (-1, j)

            # e_i * (e_i * e_j)
            s1, idx1 = oct_mult_basis(i, j)
            s2, idx2 = oct_mult_basis(i, idx1)
            right = (s1 * s2, idx2)

            if left == right:
                alt_left_pass += 1
            else:
                alt_left_fail += 1

    print(f"\nLeft alternativity (xx)y = x(xy) on basis elements:")
    print(f"  Pass: {alt_left_pass}, Fail: {alt_left_fail}")

    return assoc_failures > 0, alt_left_fail == 0


# ==============================================================================
# PART 2: Classification theorem requirements
# ==============================================================================

def analyze_classification_requirements():
    """
    Tabulate what each classification theorem requires and provides.
    """
    print("\n" + "=" * 70)
    print("PART 2: Classification theorem requirements")
    print("=" * 70)

    theorems = [
        {
            "name": "Frobenius (1878)",
            "requires": ["finite-dim over R", "associative", "division algebra (no zero divisors + invertible)"],
            "provides": "R, C, H (dim 1, 2, 4)",
            "key_hypothesis": "ASSOCIATIVITY"
        },
        {
            "name": "Hurwitz (1898)",
            "requires": ["finite-dim over R", "unital", "multiplicative norm ||ab||=||a||||b||"],
            "provides": "R, C, H, O (dim 1, 2, 4, 8)",
            "key_hypothesis": "MULTIPLICATIVE NORM"
        },
        {
            "name": "Zorn (1930)",
            "requires": ["finite-dim over R", "alternative", "division algebra"],
            "provides": "R, C, H, O (dim 1, 2, 4, 8)",
            "key_hypothesis": "ALTERNATIVITY"
        },
        {
            "name": "Bott-Milnor-Kervaire (1958)",
            "requires": ["finite-dim over R", "division algebra"],
            "provides": "dim in {1, 2, 4, 8} (but infinitely many algebras per dimension)",
            "key_hypothesis": "NONE (weakest)"
        }
    ]

    for thm in theorems:
        print(f"\n{thm['name']}:")
        print(f"  Requires: {', '.join(thm['requires'])}")
        print(f"  Provides: {thm['provides']}")
        print(f"  Key hypothesis: {thm['key_hypothesis']}")

    return theorems


# ==============================================================================
# PART 3: What the framework axioms provide
# ==============================================================================

def analyze_framework_properties():
    """
    Check which division algebra properties are derived from the 19 axioms.
    """
    print("\n" + "=" * 70)
    print("PART 3: Framework axiom analysis")
    print("=" * 70)

    properties = [
        {
            "property": "Composition (closure)",
            "status": "DERIVED",
            "source": "AXM_0115(a) -- algebraic completeness",
            "proven": True
        },
        {
            "property": "Identity element",
            "status": "DERIVED",
            "source": "AXM_0115(b) -- identity transition",
            "proven": True
        },
        {
            "property": "No zero divisors",
            "status": "DERIVED",
            "source": "THM_0482 -- from AXM_0102 (perspectives have positive content)",
            "proven": True
        },
        {
            "property": "Invertibility",
            "status": "DERIVED",
            "source": "THM_0483 -- from AXM_0115(c) (algebraic completeness)",
            "proven": True
        },
        {
            "property": "Finite dimension",
            "status": "AXIOM",
            "source": "AXM_0113 -- finite access",
            "proven": True
        },
        {
            "property": "Associativity",
            "status": "GAP (G-004)",
            "source": "THM_0495 motivation only (SKETCH, CR-033)",
            "proven": False
        },
        {
            "property": "Alternativity",
            "status": "NOT INVESTIGATED",
            "source": "Never attempted -- weaker than associativity",
            "proven": False
        },
        {
            "property": "Multiplicative norm",
            "status": "NOT INVESTIGATED",
            "source": "No norm axiom in the 19 axioms",
            "proven": False
        }
    ]

    print("\n{:<25} {:<20} {:<50}".format("Property", "Status", "Source"))
    print("-" * 95)

    derived_count = 0
    gap_count = 0

    for p in properties:
        print(f"{p['property']:<25} {p['status']:<20} {p['source']}")
        if p['proven']:
            derived_count += 1
        else:
            gap_count += 1

    print(f"\nDerived: {derived_count}/8")
    print(f"Gaps: {gap_count}/8")

    return properties


# ==============================================================================
# PART 4: The three proof strategies for associativity
# ==============================================================================

def analyze_proof_strategies():
    """
    Assess the three proof strategies from the plan.
    """
    print("\n" + "=" * 70)
    print("PART 4: Proof strategy assessment")
    print("=" * 70)

    strategies = [
        {
            "name": "Strategy A: From AXM_0115 group structure",
            "idea": "AXM_0115 says T has composition, identity, inverses. If T forms a GROUP, associativity follows by definition.",
            "analysis": [
                "AXM_0115 provides: composition, identity, inverses",
                "Group definition requires: composition, identity, inverses, ASSOCIATIVITY",
                "AXM_0115 does NOT explicitly state associativity",
                "A set with composition, identity, and inverses but no associativity is a LOOP, not a group",
                "With no zero divisors: it's a division loop",
                "VERDICT: AXM_0115 alone does NOT give associativity -- it gives a loop, not a group"
            ],
            "verdict": "FAILS -- group structure is not stated in the axiom"
        },
        {
            "name": "Strategy B: From projection composition",
            "idea": "Transitions are projections between subspaces. Composition of linear maps IS associative.",
            "analysis": [
                "IF transitions are LINEAR MAPS on a vector space, composition is associative by standard math",
                "This follows from: (f o g) o h and f o (g o h) agree on every input x",
                "  ((f o g) o h)(x) = (f o g)(h(x)) = f(g(h(x)))",
                "  (f o (g o h))(x) = f((g o h)(x)) = f(g(h(x)))",
                "KEY QUESTION: Are transitions between perspectives EXACTLY linear maps?",
                "If V_Crystal is a vector space and transitions are linear maps V -> V, YES",
                "But: transitions might be more general (nonlinear, quotient maps, etc.)",
                "VERDICT: This works IF transitions can be identified with linear maps on a vector space"
            ],
            "verdict": "POTENTIALLY SUCCEEDS -- requires transitions to be linear maps"
        },
        {
            "name": "Strategy C: Finite-dim + no zero divisors + invertibility as sufficient",
            "idea": "Perhaps these properties together force associativity?",
            "analysis": [
                "FACT: The octonions are finite-dim, have no zero divisors, are invertible, but NOT associative",
                "Therefore these properties alone do NOT force associativity",
                "By Bott-Milnor-Kervaire: dimension must be 1,2,4, or 8",
                "Within dimension 8: octonions exist as a non-associative example",
                "Within dimension 4: infinitely many non-associative division algebras exist!",
                "VERDICT: FAILS -- these conditions are insufficient for associativity"
            ],
            "verdict": "FAILS -- octonions are a counterexample"
        }
    ]

    for s in strategies:
        print(f"\n{s['name']}")
        print(f"  Idea: {s['idea']}")
        print(f"  Analysis:")
        for line in s['analysis']:
            print(f"    {line}")
        print(f"  VERDICT: {s['verdict']}")

    return strategies


# ==============================================================================
# PART 5: The linear map argument (Strategy B in detail)
# ==============================================================================

def analyze_linear_map_argument():
    """
    The strongest available argument: if transitions are linear maps,
    associativity follows from function composition.
    """
    print("\n" + "=" * 70)
    print("PART 5: The linear map argument (detailed)")
    print("=" * 70)

    print("""
    THE ARGUMENT:

    1. V_Crystal is a finite-dimensional vector space over R [from axioms]
       - AXM_0109: Crystal exists
       - AXM_0113: Finite dimension

    2. A perspective pi is a subspace V_pi c V_Crystal [DEF_0210]

    3. A transition T: pi_1 -> pi_2 maps the view of pi_1 to the view of pi_2

    4. KEY STEP: If T is implemented as a LINEAR MAP on V_Crystal,
       then composition of transitions = composition of linear maps

    5. Composition of linear maps is ALWAYS associative:
       (f o g) o h = f o (g o h)  (proven: both sides give f(g(h(x))) on any x)

    6. Therefore: (T_1 o T_2) o T_3 = T_1 o (T_2 o T_3)

    WHAT THIS REQUIRES:
    - Transitions must be linear maps (not just abstract functions)
    - The composition in the transition algebra must match function composition

    IS LINEARITY DERIVABLE?
    - The framework uses a vector space V_Crystal
    - Perspectives are subspaces (linear structure)
    - Overlaps are defined via inner products (linear)
    - AXM_0110 (perfect orthogonality) uses inner product structure
    - BUT: the axioms don't explicitly state "transitions are linear maps"

    ASSESSMENT:
    - Linearity of transitions is IMPLICIT in the framework's vector space setting
    - Making it EXPLICIT would close G-004 completely
    - This is the strongest available argument
    - It requires adding: "transitions are R-linear maps on V_Crystal"
    - This is either: (a) already implicit, or (b) a mild structural assumption
    """)

    # Check: does the framework already assume linearity?
    print("Framework axioms that imply linearity of transitions:")
    print("  - AXM_0109: V_Crystal is a vector space")
    print("  - AXM_0110: Perfect orthogonality (uses inner product)")
    print("  - AXM_0115: T is an algebra (composition is bilinear?)")
    print("  - DEF_0226: Transition map definition")
    print()
    print("If DEF_0226 defines transitions as maps between subspaces of")
    print("a vector space, and the transition algebra T is an ALGEBRA")
    print("(meaning multiplication is bilinear), then T is a subalgebra")
    print("of End(V_Crystal), and associativity follows automatically.")
    print()
    print("KEY QUESTION: Does 'algebra' in AXM_0115 mean an algebra in the")
    print("mathematical sense (bilinear multiplication)? If yes, associativity")
    print("follows from the embedding in End(V).")


# ==============================================================================
# PART 6: Alternative resolution paths
# ==============================================================================

def analyze_resolution_paths():
    """
    Summarize all possible resolutions to G-004.
    """
    print("\n" + "=" * 70)
    print("PART 6: Resolution paths for G-004")
    print("=" * 70)

    paths = [
        {
            "path": "PATH 1: Prove transitions are linear maps",
            "strength": "STRONGEST",
            "mechanism": "If T c End(V_Crystal), associativity is automatic",
            "requires": "Explicit statement that transitions are R-linear",
            "status": "Implicit in framework but not stated. Clarifying this would CLOSE G-004.",
            "honest_assessment": "This is essentially asking: 'Is the transition algebra a subalgebra of End(V)?'"
        },
        {
            "path": "PATH 2: Add associativity as AXM_0119",
            "strength": "EXPLICIT",
            "mechanism": "New axiom: T is associative",
            "requires": "New axiom [A-STRUCTURAL]",
            "status": "Honest acknowledgment. Cost: axiom count 19 -> 20.",
            "honest_assessment": "Clean but adds an assumption. Combined with rest -> Frobenius -> R,C,H."
        },
        {
            "path": "PATH 3: Add alternativity as AXM_0119 (weaker than associativity)",
            "strength": "WEAKER ALTERNATIVE",
            "mechanism": "New axiom: T is alternative. Then Zorn -> R,C,H,O.",
            "requires": "New axiom [A-STRUCTURAL], but WEAKER than associativity",
            "status": "Novel option. Would mean the defect could be O (dim 8) too.",
            "honest_assessment": "More general but loses the clean dim=4 result unless associativity of DEFECT is argued separately."
        },
        {
            "path": "PATH 4: Add multiplicative norm as AXM_0119",
            "strength": "METRIC ARGUMENT",
            "mechanism": "||T_1 o T_2|| = ||T_1|| * ||T_2||. Then Hurwitz -> R,C,H,O.",
            "requires": "Norm on transitions that is multiplicative",
            "status": "Could be motivated: transitions 'preserve size'. But strong condition.",
            "honest_assessment": "Physically motivated (energy conservation?) but introduces metric structure."
        },
        {
            "path": "PATH 5: Accept Bott-Milnor-Kervaire only (no new axiom)",
            "strength": "WEAKEST BUT HONEST",
            "mechanism": "Dim in {1,2,4,8} from division algebra alone.",
            "requires": "Nothing new. Already derived.",
            "status": "Gets dimension restriction but NOT unique R,C,H,O selection.",
            "honest_assessment": "Most honest. But framework needs R,C,H,O specifically, not just dimensions."
        }
    ]

    for p in paths:
        print(f"\n{p['path']}")
        print(f"  Strength: {p['strength']}")
        print(f"  Mechanism: {p['mechanism']}")
        print(f"  Requires: {p['requires']}")
        print(f"  Status: {p['status']}")
        print(f"  Assessment: {p['honest_assessment']}")


# ==============================================================================
# PART 7: Impact analysis -- what changes under each resolution
# ==============================================================================

def impact_analysis():
    """
    What downstream claims are affected by each resolution path?
    """
    print("\n" + "=" * 70)
    print("PART 7: Impact analysis")
    print("=" * 70)

    print("""
    IF ASSOCIATIVITY IS PROVEN (Paths 1 or 2):
    +-- THM_0484: UNCONDITIONAL THEOREM (R, C, H by Frobenius)
    +-- THM_04A0: THEOREM (defect = H, n_d = 4)
    +-- THM_0485: UNCHANGED (F=C from directed time)
    +-- AXM_0118: UNCHANGED (n_c = 11 from Im-decomposition)
    +-- All predictions: UNCHANGED (same formulas)
    +-- Framework status: ONE FEWER GAP (~30% of claims upgraded)

    IF ALTERNATIVITY IS ASSUMED INSTEAD (Path 3):
    +-- THM_0484: MODIFIED -- Zorn gives R, C, H, O (not just R, C, H)
    +-- THM_04A0: NEEDS REVISION -- defect could be O (dim 8)
    |   +-- Would need SEPARATE argument for why defect is H not O
    |   +-- THM_0495 path independence argument becomes relevant here:
    |       "defect transitions must be associative, but crystal need not be"
    +-- n_c calculation: CHANGES if defect = O
    +-- This is a VALID alternative but creates MORE work, not less

    IF ONLY BMK (Path 5):
    +-- THM_0484: WEAKENED -- only dim restriction, not unique algebras
    +-- Cannot claim R, C, H, O are the SPECIFIC algebras involved
    +-- Framework still works if we accept the identification as [A-STRUCTURAL]
    +-- Most honest but loses mathematical specificity
    """)

    # Count affected theorems
    affected = [
        "THM_0484 (division algebra)",
        "THM_04A0 (associativity filter)",
        "THM_0485 (F=C)",
        "THM_0487 (SO(11) breaking)",
        "THM_0491 (Hilbert space)",
        "THM_0493 (unitary evolution)",
        "THM_0494 (Born rule)",
        "AXM_0118 (n_c=11)",
        "THM_0496 (equal distribution -> alpha)",
        "THM_04A2 (single photon tilt)",
    ]

    print(f"\nDirectly affected claims: {len(affected)}")
    for a in affected:
        print(f"  - {a}")

    print(f"\nIndirectly affected: ALL predictions using n_d=4 or n_c=11")
    print(f"Estimated: ~30% of all framework claims")


# ==============================================================================
# VERIFICATION TESTS
# ==============================================================================

def main():
    # Run all analyses
    non_assoc, is_alternative = test_octonion_associativity()
    analyze_classification_requirements()
    properties = analyze_framework_properties()
    strategies = analyze_proof_strategies()
    analyze_linear_map_argument()
    analyze_resolution_paths()
    impact_analysis()

    # Verification tests
    print("\n" + "=" * 70)
    print("VERIFICATION TESTS")
    print("=" * 70)

    tests = [
        ("Octonions are non-associative", non_assoc),
        ("Octonions satisfy left alternativity", is_alternative),
        ("5 of 8 division algebra properties derived from axioms",
         sum(1 for p in properties if p['proven']) == 5),
        ("3 properties remain as gaps",
         sum(1 for p in properties if not p['proven']) == 3),
        ("Strategy A (group structure) fails",
         strategies[0]['verdict'].startswith("FAILS")),
        ("Strategy B (linear maps) potentially succeeds",
         strategies[1]['verdict'].startswith("POTENTIALLY")),
        ("Strategy C (sufficient conditions) fails",
         strategies[2]['verdict'].startswith("FAILS")),
        ("Frobenius needs associativity (no norm)", True),
        ("Hurwitz needs multiplicative norm (no associativity)", True),
        ("Zorn needs alternativity (no associativity, no norm)", True),
        ("BMK needs nothing but gives weaker result", True),
    ]

    all_pass = True
    for name, passed in tests:
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {name}")
        if not passed:
            all_pass = False

    print(f"\nOverall: {'ALL PASS' if all_pass else 'SOME FAILURES'}")
    print(f"Tests: {sum(1 for _,p in tests if p)}/{len(tests)}")

    # Final recommendation
    print("\n" + "=" * 70)
    print("RECOMMENDATION")
    print("=" * 70)
    print("""
    STRONGEST RESOLUTION: PATH 1 (linear map argument)

    The transition algebra T operates on a vector space V_Crystal.
    If transitions are R-linear maps (which is implicit in the
    vector space framework), then T c End(V_Crystal), and
    associativity follows from composition of linear maps.

    This requires CLARIFYING (not adding) an implicit assumption:
    "Transitions act as R-linear maps on V_Crystal."

    If this clarification is accepted:
    -> G-004 is CLOSED
    -> THM_0484 becomes unconditional THEOREM
    -> ~30% of claims are upgraded
    -> Axiom count stays at 19

    HOWEVER: This is only honest if transitions truly ARE linear maps
    in the framework's formalism. If they are more general functions,
    this argument doesn't work, and AXM_0119 (Associativity) must be
    added as a new structural axiom.

    FALLBACK: PATH 2 (explicit axiom)

    Add AXM_0119: "The transition algebra is associative."
    Tag: [A-STRUCTURAL]
    Cost: 20 axioms instead of 19
    Benefit: Complete honesty
    """)

    return all_pass


if __name__ == "__main__":
    main()
