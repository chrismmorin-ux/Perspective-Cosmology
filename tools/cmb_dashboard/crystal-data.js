/**
 * Crystal Structure — Data Layer
 *
 * SINGLE SOURCE OF TRUTH for crystal visualization data.
 * Division algebra dimensions and the SO(11) breaking chain.
 *
 * Sources:
 *   framework/CRYSTALLIZATION_CATALOG.md
 *   framework/investigations/crystallization/symmetry_breaking_chain.md
 *   core/axioms/AXM_0109_crystal_existence.md
 */

var CRYSTAL_DATA = {

  // =========================================================================
  // META
  // =========================================================================
  meta: {
    title: "Crystal Structure",
    subtitle: "11-Dimensional Symmetric Crystal from Division Algebras",
    session: "S213",
  },

  // =========================================================================
  // DIVISION ALGEBRAS
  // =========================================================================
  algebras: {
    R: { dim: 1, imag: 0, name: "Reals", symbol: "\u211D", role: "Counting, scalars" },
    C: { dim: 2, imag: 1, name: "Complex", symbol: "\u2102", role: "Phase, U(1), EM" },
    H: { dim: 4, imag: 3, name: "Quaternions", symbol: "\u210D", role: "Spacetime (n_d=4), SU(2), weak" },
    O: { dim: 8, imag: 7, name: "Octonions", symbol: "\ud835\udd46", role: "Internal structure, G\u2082\u2192SU(3), strong" },
  },

  // =========================================================================
  // CRYSTAL DIMENSIONS
  // =========================================================================
  crystal: {
    n_c: 11,
    n_d: 4,
    total: 15,
    formula: "Im(\u2102) + Im(\u210D) + Im(\ud835\udd46) = 1 + 3 + 7 = 11",
    defectFormula: "\u210D = 4 (max associative algebra)",
    interfaceModes: 137,
    interfaceFormula: "n_d\u00B2 + n_c\u00B2 = 16 + 121 = 137 = 1/\u03B1",
  },

  // =========================================================================
  // SYMMETRY BREAKING CASCADE
  // =========================================================================
  breakingChain: {
    summary: "SO(11) \u2192 SO(4)\u00D7SO(7) \u2192 SO(4)\u00D7G\u2082 \u2192 SO(4)\u00D7SU(3) \u2192 SU(2)_L\u00D7U(1)_Y\u00D7SU(3)_c",
    totalGoldstones: 43,
    totalGenerators: 55,
    generatorFormula: "n_c(n_c\u22121)/2 = 11\u00D710/2 = 55",

    stages: [
      {
        id: 0,
        group: "SO(11)",
        generators: 55,
        label: "Pristine Crystal",
        sublabel: "Full rotational symmetry, \u03B5 = 0",
        color: "#E65100",
        borderColor: "#FF8F00",
      },
      {
        id: 1,
        group: "SO(4) \u00D7 SO(7)",
        generators: 27,
        generatorDetail: "6 + 21",
        label: "Spacetime \u2297 Internal",
        sublabel: "Associative splits from non-associative",
        goldstones: 28,
        goldstoneFormula: "n_d \u00D7 Im(\ud835\udd46) = 4 \u00D7 7",
        mechanism: "\u210D \u2260 \ud835\udd46: associativity boundary",
        mechanismDetail: "Quaternions (associative) separate from octonions (non-associative). n_d = 4 is FORCED as the max associative algebra dimension.",
        color: "#1565C0",
        borderColor: "#42A5F5",
        epoch: "Inflation (~10\u00B9\u2076 GeV)",
      },
      {
        id: 2,
        group: "SO(4) \u00D7 G\u2082",
        generators: 20,
        generatorDetail: "6 + 14",
        label: "Spacetime \u2297 Aut(\ud835\udd46)",
        sublabel: "Octonion automorphisms preserved",
        goldstones: 7,
        goldstoneFormula: "Im(\ud835\udd46) = 7",
        mechanism: "G\u2082 = Aut(\ud835\udd46)",
        mechanismDetail: "G\u2082 is the unique automorphism group of the octonions. It preserves the octonionic multiplication table. dim(G\u2082) = 14.",
        color: "#6A1B9A",
        borderColor: "#AB47BC",
        epoch: "Post-inflation (GUT-like)",
      },
      {
        id: 3,
        group: "SO(4) \u00D7 SU(3)",
        generators: 14,
        generatorDetail: "6 + 8",
        label: "Spacetime \u2297 Color",
        sublabel: "Complex structure selects stabilizer",
        goldstones: 6,
        goldstoneFormula: "dim(G\u2082) \u2212 dim(SU(3)) = 14 \u2212 8",
        mechanism: "SU(3) = Stab_{G\u2082}(\u2102)",
        mechanismDetail: "When \ud835\udd3d = \u2102 is imposed, the stabilizer of the complex subalgebra inside G\u2082 is SU(3). This is the color gauge group.",
        color: "#E65100",
        borderColor: "#FF8F00",
        epoch: "QCD emergence",
      },
      {
        id: 4,
        group: "SU(2)_L \u00D7 U(1)_Y \u00D7 SU(3)_c",
        generators: 12,
        generatorDetail: "3 + 1 + 8",
        label: "Standard Model",
        sublabel: "K\u00E4hler form on \u211D\u2074 = \u2102\u00B2",
        goldstones: 2,
        goldstoneFormula: "dim(SO(4)) \u2212 dim(U(2)) = 6 \u2212 4",
        mechanism: "K\u00E4hler J on \u211D\u2074 = \u2102\u00B2",
        mechanismDetail: "The K\u00E4hler form on \u211D\u2074 = \u2102\u00B2 breaks SO(4) = SU(2)\u208A \u2295 SU(2)\u208B chirally. \ud835\udd3d = \u2102 selects U(2) = SU(2)_L \u00D7 U(1)_Y.",
        color: "#2E7D32",
        borderColor: "#66BB6A",
        epoch: "EWSB (246 GeV)",
      },
    ],
  },

  // =========================================================================
  // CRYSTAL DECOMPOSITION
  // =========================================================================
  decomposition: {
    defect: {
      dim: 4,
      algebra: "\u210D",
      algebraName: "Quaternions",
      reason: "Max associative algebra",
      physics: "3+1 Spacetime",
      gaugeGroup: "SO(3,1) Lorentz",
      particles: "Graviton (spin-2)",
      hermModes: 16,
      color: "#E53935",
    },
    subspaces: [
      {
        name: "Im(\u2102)",
        dim: 1,
        algebra: "\u2102",
        algebraName: "Complex numbers",
        physics: "Phase rotation",
        gaugeGroup: "U(1)_Y",
        particles: "Photon (\u03B3)",
        color: "#F9A825",
        colorLight: "rgba(249, 168, 37, 0.15)",
      },
      {
        name: "Im(\u210D)",
        dim: 3,
        algebra: "\u210D",
        algebraName: "Quaternions (i, j, k)",
        physics: "Isospin directions",
        gaugeGroup: "SU(2)_L",
        particles: "W\u00B1, Z bosons",
        extra: "3 generations of fermions",
        color: "#2E7D32",
        colorLight: "rgba(46, 125, 50, 0.15)",
      },
      {
        name: "Im(\ud835\udd46)",
        dim: 7,
        algebra: "\ud835\udd46",
        algebraName: "Octonions (e\u2081..e\u2087)",
        physics: "Color structure",
        gaugeGroup: "G\u2082 \u2192 SU(3)_c",
        particles: "8 Gluons",
        extra: "Color confinement",
        color: "#1565C0",
        colorLight: "rgba(21, 101, 192, 0.15)",
      },
    ],
    interface: {
      total: 137,
      formula: "n_d\u00B2 + n_c\u00B2 = 16 + 121",
      defectModes: 16,
      crystalModes: 121,
      coupling: 44,
      couplingFormula: "n_d \u00D7 n_c = 4 \u00D7 11",
      couplingPhysics: "Higgs sector",
    },
  },

  // =========================================================================
  // TILT MATRIX
  // =========================================================================
  tiltMatrix: {
    size: 15,
    description: "\u03B5_ij = \u27E8\u03C0(b_i), \u03C0(b_j)\u27E9 \u2212 \u03B4_ij encodes deviations from perfect orthogonality",
    pristine: "\u03B5 = 0 (all dimensions perfectly independent)",
    observed: "|\u03B5| ~ \u03B1\u00B2 ~ 10\u207B\u2075 (tiny but stable tilts)",
    traceConstraint: "Tr(\u03B5) = n_d \u2212 n_c = 4 \u2212 11 = \u22127",
    independentDOF: 119,
    dofFormula: "15\u00D716/2 \u2212 1 = 120 \u2212 1 (symmetric, minus trace)",

    blocks: [
      { start: 0, end: 4, name: "Defect (\u210D)", shortName: "Def",
        labels: ["d\u2081","d\u2082","d\u2083","d\u2084"],
        physLabels: ["t","x","y","z"] },
      { start: 4, end: 5, name: "Im(\u2102)", shortName: "Im\u2102",
        labels: ["c\u2081"],
        physLabels: ["phase"] },
      { start: 5, end: 8, name: "Im(\u210D)", shortName: "Im\u210D",
        labels: ["h\u2081","h\u2082","h\u2083"],
        physLabels: ["i","j","k"] },
      { start: 8, end: 15, name: "Im(\ud835\udd46)", shortName: "Im\ud835\udd46",
        labels: ["o\u2081","o\u2082","o\u2083","o\u2084","o\u2085","o\u2086","o\u2087"],
        physLabels: ["e\u2081","e\u2082","e\u2083","e\u2084","e\u2085","e\u2086","e\u2087"] },
    ],

    blockTypes: {
      "0-0": { color: "#E74C3C", name: "Defect \u00D7 Defect", physics: "Spacetime curvature \u2192 Gravity", dim: "4\u00D74 = 10 ind." },
      "0-1": { color: "#9B59B6", name: "Defect \u00D7 Im(\u2102)", physics: "Interface \u2192 Higgs", dim: "4\u00D71" },
      "0-2": { color: "#9B59B6", name: "Defect \u00D7 Im(\u210D)", physics: "Interface \u2192 Higgs", dim: "4\u00D73" },
      "0-3": { color: "#9B59B6", name: "Defect \u00D7 Im(\ud835\udd46)", physics: "Interface \u2192 Higgs", dim: "4\u00D77" },
      "1-0": { color: "#9B59B6", name: "Im(\u2102) \u00D7 Defect", physics: "Interface \u2192 Higgs", dim: "1\u00D74" },
      "1-1": { color: "#F1C40F", name: "Im(\u2102) \u00D7 Im(\u2102)", physics: "Electromagnetic", dim: "1\u00D71" },
      "1-2": { color: "#E67E22", name: "Im(\u2102) \u00D7 Im(\u210D)", physics: "Electroweak mixing", dim: "1\u00D73" },
      "1-3": { color: "#D4AC0D", name: "Im(\u2102) \u00D7 Im(\ud835\udd46)", physics: "Hypercharge\u2013color", dim: "1\u00D77" },
      "2-0": { color: "#9B59B6", name: "Im(\u210D) \u00D7 Defect", physics: "Interface \u2192 Higgs", dim: "3\u00D74" },
      "2-1": { color: "#E67E22", name: "Im(\u210D) \u00D7 Im(\u2102)", physics: "Electroweak mixing", dim: "3\u00D71" },
      "2-2": { color: "#27AE60", name: "Im(\u210D) \u00D7 Im(\u210D)", physics: "Weak force / SU(2)", dim: "3\u00D73 = 6 ind." },
      "2-3": { color: "#16A085", name: "Im(\u210D) \u00D7 Im(\ud835\udd46)", physics: "GUT interface", dim: "3\u00D77" },
      "3-0": { color: "#9B59B6", name: "Im(\ud835\udd46) \u00D7 Defect", physics: "Interface \u2192 Higgs", dim: "7\u00D74" },
      "3-1": { color: "#D4AC0D", name: "Im(\ud835\udd46) \u00D7 Im(\u2102)", physics: "Hypercharge\u2013color", dim: "7\u00D71" },
      "3-2": { color: "#16A085", name: "Im(\ud835\udd46) \u00D7 Im(\u210D)", physics: "GUT interface", dim: "7\u00D73" },
      "3-3": { color: "#2980B9", name: "Im(\ud835\udd46) \u00D7 Im(\ud835\udd46)", physics: "Strong force / SU(3)", dim: "7\u00D77 = 28 ind." },
    },

    legendItems: [
      { key: "0-0", label: "Defect \u00D7 Defect", detail: "Spacetime curvature \u2192 Gravity" },
      { key: "0-1", label: "Defect \u00D7 Crystal", detail: "Interface \u2192 Higgs sector" },
      { key: "1-1", label: "Im(\u2102) \u00D7 Im(\u2102)", detail: "Electromagnetic phase" },
      { key: "1-2", label: "Im(\u2102) \u00D7 Im(\u210D)", detail: "Electroweak mixing" },
      { key: "1-3", label: "Im(\u2102) \u00D7 Im(\ud835\udd46)", detail: "Hypercharge\u2013color" },
      { key: "2-2", label: "Im(\u210D) \u00D7 Im(\u210D)", detail: "Weak force / SU(2)" },
      { key: "2-3", label: "Im(\u210D) \u00D7 Im(\ud835\udd46)", detail: "GUT interface" },
      { key: "3-3", label: "Im(\ud835\udd46) \u00D7 Im(\ud835\udd46)", detail: "Strong force / SU(3)" },
    ],

    keyNumbers: [
      { value: "137", label: "Hermitian modes = 1/\u03B1", formula: "n_d\u00B2 + n_c\u00B2" },
      { value: "16", label: "Defect modes", formula: "n_d\u00B2" },
      { value: "121", label: "Crystal modes", formula: "n_c\u00B2" },
      { value: "44", label: "Interface coupling", formula: "n_d \u00D7 n_c" },
      { value: "\u22127", label: "Trace constraint", formula: "n_d \u2212 n_c" },
    ],
  },
};
