/**
 * Crystallization Catalogue — Data Layer
 *
 * SINGLE SOURCE OF TRUTH for crystallization type visualization data.
 * Nine crystallization types (C1–C9) and their composability chains.
 *
 * Sources:
 *   framework/CRYSTALLIZATION_CATALOG.md
 *   framework/investigations/crystallization/
 */

var CATALOG_DATA = {

  meta: {
    title: "Crystallization Catalogue",
    subtitle: "Nine Types of Crystallization in the Perspective Framework",
    session: "S213",
    scripts: 51,
    testsPass: 607,
    testsTotal: 616,
    passRate: "98.5%",
  },

  // =========================================================================
  // ORDER PARAMETER STATES
  // =========================================================================
  orderParameter: {
    symbol: "\u03B5",
    groundState: "\u03B5* = \u03B1\u00B2 \u2248 10\u207B\u2075",
    states: [
      { eps: "0", label: "Pure Crystal", physics: "No physics. Pre-Big-Bang.", color: "#bc8cff" },
      { eps: "\u226A \u03B5*", label: "Near-Symmetric", physics: "Inflation era", color: "#58a6ff" },
      { eps: "\u2248 \u03B5*", label: "Ground State", physics: "Normal physics (our universe)", color: "#3fb950" },
      { eps: "> \u03B5*", label: "Excited", physics: "High-energy processes", color: "#d29922" },
      { eps: "\u2192 0", label: "De-crystallization", physics: "Black hole singularity", color: "#f85149" },
    ],
  },

  // =========================================================================
  // NINE CRYSTALLIZATION TYPES
  // =========================================================================
  types: [
    {
      id: "C1", name: "Cosmic Crystallization",
      direction: "Forward", scale: "Universe", channel: "All", mechanism: "Potential-driven",
      color: "#1565C0", borderColor: "#42A5F5",
      before: "\u03B5 = 0", after: "\u03B5 = \u03B5*",
      summary: "The Big Bang as nucleation from pristine crystal to imperfect ground state.",
      keyFormula: "V(\u03B5) = V\u2080(1 \u2212 \u03B5\u00B2/\u03BC\u00B2)",
      signatures: [
        { observable: "n_s", predicted: "0.965", measured: "0.9649 \u00B1 0.0042", error: "<1\u03C3" },
        { observable: "r", predicted: "0.035", measured: "<0.036", error: "Within limit" },
        { observable: "N (e-folds)", predicted: "52", measured: "45\u201370", error: "Within range" },
      ],
      scripts: 3, testsPass: 27, testsTotal: 29,
      confidence: "derivation",
    },
    {
      id: "C2", name: "Symmetry Breaking",
      direction: "Forward", scale: "Universe\u2013Particle", channel: "All\u2192RCHO", mechanism: "Symmetry",
      color: "#6A1B9A", borderColor: "#AB47BC",
      before: "SO(11)", after: "SO(4)\u00D7SU(3)",
      summary: "SO(11) breaks into spacetime \u00D7 internal via division algebra boundaries.",
      keyFormula: "41 Goldstones: 28 + 7 + 6 + 2 \u2212 2(adj)",
      signatures: [
        { observable: "Spacetime dim", predicted: "4", measured: "4", error: "0%" },
        { observable: "Color group", predicted: "SU(3)", measured: "SU(3)", error: "Exact" },
        { observable: "Goldstones", predicted: "41", measured: "(structural)", error: "\u2014" },
      ],
      scripts: 11, testsPass: 171, testsTotal: 172,
      confidence: "derivation",
    },
    {
      id: "C3", name: "Tilt Dynamics",
      direction: "Forward+Osc", scale: "All", channel: "All", mechanism: "Potential",
      color: "#E65100", borderColor: "#FF8F00",
      before: "Tilt fluctuations", after: "Equilibrium",
      summary: "The tilt matrix settles into its ground state via Mexican hat potential.",
      keyFormula: "W = \u2212a g(\u03C6)|\u03B5|\u00B2 + b|\u03B5|\u2074",
      signatures: [
        { observable: "n_d = 4 (from 2\u207F = n\u00B2)", predicted: "4", measured: "4", error: "0%" },
        { observable: "137 = n_d\u00B2 + n_c\u00B2", predicted: "137", measured: "1/\u03B1", error: "Exact" },
      ],
      scripts: 7, testsPass: 64, testsTotal: 64,
      confidence: "derivation",
    },
    {
      id: "C4", name: "Quantum Measurement",
      direction: "Forward", scale: "Quantum", channel: "All", mechanism: "Noise-driven",
      color: "#00838F", borderColor: "#4DD0E1",
      before: "Superposition", after: "Eigenstate",
      summary: "Wavefunction collapse as crystallization: Born rule emerges from geometry.",
      keyFormula: "P(k) = |c_k|\u00B2 (Born rule derived)",
      signatures: [
        { observable: "Born rule", predicted: "P = |c|\u00B2", measured: "Confirmed", error: "0%" },
        { observable: "Bell/CHSH", predicted: "2\u221A2", measured: "2\u221A2", error: "0%" },
        { observable: "Born violations", predicted: "~ \u03B1\u00B2 \u2248 10\u207B\u2075", measured: "Not tested", error: "Prediction" },
      ],
      scripts: 9, testsPass: 113, testsTotal: 113,
      confidence: "derivation",
    },
    {
      id: "C5", name: "Black Holes",
      direction: "Reverse", scale: "Astrophysical", channel: "\u211D", mechanism: "Potential",
      color: "#B71C1C", borderColor: "#EF5350",
      before: "\u03B5 = \u03B5*", after: "\u03B5 \u2192 0",
      summary: "Black holes as de-crystallization: tilt returns to zero at singularity.",
      keyFormula: "S = A/(4 L_Pl\u00B2), r_crit = 137 L_Pl",
      signatures: [
        { observable: "S_BH = A/4", predicted: "A/(4 L_Pl\u00B2)", measured: "Standard", error: "0%" },
        { observable: "T_Hawking", predicted: "Standard", measured: "Standard", error: "0%" },
        { observable: "GW echoes", predicted: "None (R ~ 0)", measured: "LIGO non-detect", error: "Consistent" },
      ],
      scripts: 5, testsPass: 60, testsTotal: 60,
      confidence: "derivation",
    },
    {
      id: "C6", name: "Forces / Boundaries",
      direction: "Forward", scale: "Particle\u2013Astro", channel: "\u2102 or \ud835\udd46", mechanism: "Boundary",
      color: "#2E7D32", borderColor: "#66BB6A",
      before: "Vacuum fluctuations", after: "Reduced modes",
      summary: "Gauge forces as boundary-induced crystallization. Casimir, QCD confinement.",
      keyFormula: "F = \u2212\u03C0\u00B2/(240a\u2074), \u221A\u03C3 = 8m_p/17",
      signatures: [
        { observable: "Casimir force", predicted: "Standard", measured: "Confirmed", error: "0%" },
        { observable: "sin\u00B2\u03B8_W(eff)", predicted: "28/121", measured: "0.23153", error: "\u22120.78\u03C3" },
        { observable: "b\u2080(SU(3), N_f=6)", predicted: "7 = Im_O", measured: "7", error: "0%" },
        { observable: "\u221A\u03C3", predicted: "441.5 MeV", measured: "~440 MeV", error: "0.35%" },
      ],
      scripts: 7, testsPass: 109, testsTotal: 112,
      confidence: "conjecture",
    },
    {
      id: "C7", name: "Cosmological Phases",
      direction: "Forward", scale: "Cosmological", channel: "Sequential", mechanism: "Potential",
      color: "#4527A0", borderColor: "#7E57C2",
      before: "Post-inflation", after: "Phase transitions",
      summary: "Cosmological evolution as sequential crystallization through g(\u03C6) epochs.",
      keyFormula: "\u03A9_\u039B = 0.685, g(\u03C6_CMB) = 5/6",
      signatures: [
        { observable: "\u03A9_\u039B", predicted: "0.685", measured: "0.685 \u00B1 0.007", error: "<1\u03C3" },
        { observable: "n_s", predicted: "0.965", measured: "0.9649", error: "<1\u03C3" },
        { observable: "sin\u00B2\u03B8_W(M_Z)", predicted: "0.231", measured: "0.23122", error: "0.1%" },
        { observable: "\u2113\u2082 (\u03C6_odd = 3/11)", predicted: "~537", measured: "~537", error: "~0.4%" },
      ],
      scripts: 7, testsPass: 53, testsTotal: 55,
      confidence: "conjecture",
    },
    {
      id: "C8", name: "Photon Emission",
      direction: "Forward", scale: "Quantum/Particle", channel: "\u2102", mechanism: "Emission",
      color: "#F9A825", borderColor: "#FDD835",
      before: "Higher tilt", after: "Lower tilt + photon",
      summary: "Photon emission as C-channel crystallization step. Produces \u03B1 = 1/137.",
      keyFormula: "\u03B1\u207B\u00B9 = 137 + 4/111 = n_d\u00B2 + n_c\u00B2 + n_d/\u03A6\u2086(n_c)",
      signatures: [
        { observable: "\u03B1\u207B\u00B9 (integer part)", predicted: "137 = N_I", measured: "137", error: "Exact" },
        { observable: "\u03B1(Thomson)", predicted: "111/15211", measured: "1/137.036...", error: "~0.3 ppm" },
      ],
      scripts: 3, testsPass: 47, testsTotal: 47,
      confidence: "conjecture",
    },
    {
      id: "C9", name: "Mass Freezing",
      direction: "Static", scale: "Particle", channel: "Mixed", mechanism: "Symmetry",
      color: "#AD1457", borderColor: "#F06292",
      before: "Massless", after: "Massive particles",
      summary: "Particle masses freeze in via EWSB crystallization. 15 fermions, 3 generations.",
      keyFormula: "m_H = v \u00D7 121/238 = 125.22 GeV",
      signatures: [
        { observable: "Fermions/gen", predicted: "15", measured: "15", error: "0%" },
        { observable: "Generations", predicted: "3", measured: "3", error: "0%" },
        { observable: "m_p/m_e", predicted: "1836 + 11/72", measured: "1836.153", error: "19 ppm" },
        { observable: "m_H", predicted: "125.22 GeV", measured: "125.25 GeV", error: "0.057%" },
        { observable: "y_t = 120/121", predicted: "0.9917", measured: "0.9916", error: "145 ppm" },
      ],
      scripts: 0, testsPass: 0, testsTotal: 0,
      confidence: "conjecture",
    },
  ],

  // =========================================================================
  // COMPOSABILITY CHAINS
  // =========================================================================
  chains: [
    {
      name: "Universe History",
      sequence: ["C1", "C2", "C7", "C3"],
      description: "Big Bang \u2192 symmetry breaking \u2192 cosmological phases \u2192 tilt dynamics",
      color: "#58a6ff",
    },
    {
      name: "Quantum Measurement",
      sequence: ["C4", "C8"],
      description: "Collapse selects eigenstate \u2192 photon emission",
      color: "#3fb950",
    },
    {
      name: "Stellar Collapse",
      sequence: ["C1", "C7", "C3", "C5"],
      description: "Forward crystallization \u2192 black hole de-crystallization",
      color: "#f85149",
    },
    {
      name: "Collider Process",
      sequence: ["C8", "C6", "C4", "C8"],
      description: "Inject \u2192 confine \u2192 collapse \u2192 emit",
      color: "#d29922",
    },
    {
      name: "EWSB",
      sequence: ["C2", "C9", "C8"],
      description: "Eigenvalue partitioning \u2192 mass freeze \u2192 Higgs emission",
      color: "#bc8cff",
    },
    {
      name: "Particle Creation",
      sequence: ["C7", "C9", "C8"],
      description: "Phase transition \u2192 mass freeze \u2192 emission",
      color: "#39d2c0",
    },
  ],

  // =========================================================================
  // GAP TRACKER (Top items by severity)
  // =========================================================================
  gaps: [
    { id: "G-01", severity: "critical", description: "Landau coefficients c_1, c_2, c_3 magnitudes", types: ["C2"], status: "open" },
    { id: "G-02", severity: "critical", description: "V_0 not derived (inflation amplitude A_s)", types: ["C1"], status: "open" },
    { id: "G-03", severity: "critical", description: "Individual particle masses not derived", types: ["C9"], status: "open" },
    { id: "G-04", severity: "critical", description: "CMB peak heights not fully derived", types: ["C7"], status: "open" },
    { id: "G-05", severity: "high", description: "b\u2082 < 0 sign: mechanism is [CONJECTURE]", types: ["C2"], status: "open" },
    { id: "G-06", severity: "high", description: "g(\u03C6) quadratic form assumed, not derived", types: ["C3"], status: "open" },
    { id: "G-07", severity: "high", description: "QCD string tension formula (HRS=6)", types: ["C6"], status: "open" },
    { id: "G-08", severity: "high", description: "\u03A9_m mechanism unknown", types: ["C7"], status: "open" },
    { id: "G-09", severity: "medium", description: "Basis selection in quantum measurement", types: ["C4"], status: "open" },
    { id: "G-10", severity: "medium", description: "Confinement threshold T_c ~ 155 MeV", types: ["C6"], status: "open" },
  ],

  // =========================================================================
  // FALSIFIED CLAIMS
  // =========================================================================
  falsified: [
    { id: "F-10", description: "\u039B from V(\u03B5*): wrong sign", session: "S199" },
    { id: "F-rs", description: "\u03B7* = 337 Mpc: actual 280 Mpc", session: "S198" },
    { id: "F-cs", description: "c_s = 3/7: actual 1/\u221A3", session: "S198" },
  ],

  // =========================================================================
  // RESOLVED GAPS
  // =========================================================================
  resolved: [
    { description: "c_3 > 0: dynamic curvature derivation", session: "S207", tests: "7/8 PASS" },
    { description: "b\u2082 \u2260 0: degenerate minima contradiction", session: "S207", tests: "10/10 PASS" },
    { description: "Noise structure: Fubini-Study geometry", session: "S169", tests: "PASS" },
    { description: "\u2113\u2082 peak: baryon loading \u03C6_odd = 3/11", session: "S199", tests: "0.4%" },
    { description: "Coset space: Gr(4,11) gives 28 Goldstones", session: "S195", tests: "PASS" },
  ],

  // =========================================================================
  // g(phi) UNIFICATION
  // =========================================================================
  gPhi: {
    formula: "g(\u03C6) = 1 \u2212 \u03C6\u00B2/\u03BC\u00B2",
    epochs: [
      { value: "1", label: "Pre-crystallization", physics: "All mechanisms full strength" },
      { value: "5/6", label: "CMB epoch", physics: "Sound horizon, acoustic peaks" },
      { value: "0", label: "Crystallization complete", physics: "Phase transition" },
      { value: "< 0", label: "Post-crystallization", physics: "Pure crystal regime" },
    ],
    usedIn: [
      { type: "C1", role: "Drives expansion: V(\u03C6) = V\u2080 g(\u03C6)" },
      { type: "C3", role: "Mexican hat: W = \u2212a g(\u03C6)|\u03B5|\u00B2 + b|\u03B5|\u2074" },
      { type: "C4", role: "Decoherence: \u0393_dec = 4a g(\u03C6) \u0393" },
      { type: "C7", role: "Spectral index: n_s from g\u2033/g" },
    ],
  },
};
