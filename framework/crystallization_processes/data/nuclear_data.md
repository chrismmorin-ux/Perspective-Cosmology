# Nuclear Data Reference

**Status**: DATA REFERENCE [A-IMPORT]
**Source**: NNDC/NUBASE 2020, AME 2020, ENSDF
**Created**: 2026-02-03 (Session 221)
**Layer**: 2 (correspondence)

All values are [A-IMPORT]. No framework predictions currently exist for nuclear physics.

---

## Binding Energy Per Nucleon

| Nucleus | B/A (MeV) | Note |
|---------|----------|------|
| 2H (deuteron) | 1.112 | Weakest stable |
| 3He | 2.573 | |
| 4He | 7.074 | Magic N=Z=2 |
| 12C | 7.680 | Triple-alpha product |
| 16O | 7.976 | Doubly magic |
| 40Ca | 8.551 | Doubly magic |
| 56Fe | 8.790 | Maximum B/A |
| 62Ni | 8.795 | True maximum |
| 208Pb | 7.867 | Doubly magic |
| 238U | 7.570 | Heaviest long-lived |

**Framework note**: No derivation of binding energies exists. C13 (Nuclear Binding) maps multi-channel short-range crystallization but provides no quantitative predictions. The semi-empirical mass formula (Bethe-Weizsacker) would need channel-by-channel decomposition.

## Magic Numbers

| Magic Number | Shells | Framework Connection |
|-------------|--------|---------------------|
| 2 | 1s1/2 | dim(C) = 2 |
| 8 | + 1p3/2, 1p1/2 | dim(O) = 8 |
| 20 | + 1d5/2, 2s1/2, 1d3/2 | — |
| 28 | + 1f7/2 | n_d x Im_O = 4 x 7 |
| 50 | + ... (spin-orbit) | — |
| 82 | + ... | — |
| 126 | + ... | — |

**Framework note**: Magic numbers 2, 8, 28 coincide with division algebra dimensions. Whether this is meaningful or coincidental is unknown. Currently [SPECULATION].

## Select Cross-Sections

| Reaction | Cross-Section | Energy | Source |
|----------|--------------|--------|--------|
| n + p -> d + gamma | 334.2(5) mb | thermal | NNDC |
| d(p,gamma)3He | S(0) = 0.214(17) keV b | zero energy | Solar |
| 3He(3He,2p)4He | S(0) = 5.21(27) MeV b | zero energy | Solar |
| p(p,e+nu)d | S(0) = 4.01(4) x 10^-25 MeV b | zero energy | Solar (weak) |
| 12C(alpha,gamma)16O | S(300) = 162(39) keV b | 300 keV | Critical for nucleosynthesis |

## Nuclear Decay Constants

| Decay Type | Example | Half-Life | Mechanism |
|-----------|---------|-----------|-----------|
| Alpha | 238U -> 234Th + 4He | 4.468 x 10^9 yr | O-channel tunneling (C13) |
| Beta- | n -> p + e- + nu_bar | 10.2 min | H-channel (C10) |
| Beta+ | 22Na -> 22Ne + e+ + nu | 2.602 yr | H-channel (C10) |
| EC | 7Be + e- -> 7Li + nu | 53.22 d | H-channel (C10) |
| Gamma | Various | 10^-15 - 10^3 s | C-channel (C8) |

---

*Sources: NNDC (nndc.bnl.gov), AME 2020 (Wang et al.), ENSDF, Solar fusion compilations.*
*Created: 2026-02-03 (S221)*
