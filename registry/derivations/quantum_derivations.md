# Quantum Mechanics Derivations

**Source**: Split from `registry/derivations_summary.md`
**See also**: `registry/derivations/INDEX.md` for cross-domain overview

---

### 1.7 Schrodinger Equation — DERIVED from Layer 0 Axioms

**Confidence**: DERIVATION — Form derived, h-bar value empirical

| Property | Value |
|----------|-------|
| **Formula** | ih-bar d-psi/dt = H-hat psi |
| **Framework derivation** | Stone's theorem on unitary groups |
| **Session** | S66 |

**Derivation Chain**:
```
[C1-C2] Inner product space → Hilbert space V_pi [THEOREM]
[P3] Finite access → dim(V_pi) < infinity [THEOREM]
[T1] Directed time → F = C (complex field) [DERIVATION]
[T0] Transitions form group → U(t) = exp(itH) [THEOREM]
[Conservation] → Unitarity → H-dagger = H [DERIVATION]
```

| Component | Status |
|-----------|--------|
| Hilbert space | THEOREM |
| Linear evolution | THEOREM |
| Hermitian generator | THEOREM |
| Factor i | THEOREM (from unitarity) |
| h-bar value | EMPIRICAL (minimum action quantum) |
| Born rule |psi|^2 | DERIVATION (from overlap symmetry) |

**See**: `framework/investigations/schrodinger_derivation.md`

---

### 1.31 Counting Metric and Born Rule (Sessions 165, 173)

**Confidence**: DERIVATION — Gap G2 closed, Wright-Fisher uniqueness proven

#### A. Counting Metric = Hilbert-Schmidt (S165)

| Result | Status |
|--------|--------|
| V_pi decomposes into 4 irreducible blocks under U(4)xU(11) | [THEOREM] |
| Schur's lemma forces uniform within blocks | [THEOREM] |
| HS inner product from AXM_0110 → all generators unit norm | [DERIVATION] |
| Killing metric ruled out: gives 1/alpha ~ 126.8 (7.5% off) | [THEOREM] |
| Max entropy → rho = I/N_I → Born rule P = 1/137 | [DERIVATION] |

#### B. Born Rule Three-Layer Structure (S173)

| Layer | Result | Status |
|-------|--------|--------|
| **Existence** | WF noise from Hermitian perturbation + phase symmetry (S169) | [DERIVATION] |
| **Uniqueness** | Degree-2 face-invariant exchangeable covariance is WF up to scale | [DERIVATION] |
| **Robustness** | Born rule u(p) = p holds for any diffusion coefficient | [THEOREM] |

- Wright-Fisher is UNIQUE at degree 2: 8 params → 3 (exchangeability) → 2 (constraint) → 1 (face invariance)
- Degree-3 corrections exist but do NOT affect Born rule (backward Kolmogorov)
- Axiom chain: AXM_0110 + AXM_0112 + simplex + Schur's lemma

**Verification**: `hilbert_schmidt_counting_metric.py` [15/15 PASS], `uniformity_irrep_analysis.py` [27/27 PASS], `wf_uniqueness_born_rule.py` [37/37 PASS]
