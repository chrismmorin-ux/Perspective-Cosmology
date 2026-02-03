/**
 * CMB Comparison Dashboard — Data Layer
 *
 * SINGLE SOURCE OF TRUTH for all dashboard numbers.
 * When framework numbers change, update ONLY this file.
 *
 * Sources:
 *   verification/sympy/cmb_canonical_formulas.py
 *   predictions/BLIND_PREDICTIONS.md
 *   predictions/LCDM_DEVIATIONS.md
 *   verification/sympy/cmb_polarization_predictions.py
 *   verification/sympy/blind_predictions_phase41.py
 *   verification/sympy/bbn_crystallization_precision.py
 */

const CMB_DATA = {

  // =========================================================================
  // META
  // =========================================================================
  meta: {
    title: "Perspective Framework — CMB Comparison Dashboard",
    lastUpdated: "2026-02-02",
    sessionRef: "Session 194",
    disclaimer:
      "This is a speculative mathematical framework, NOT established physics. " +
      "All claims are [CONJECTURE] unless stated otherwise. " +
      "These are NUMERICAL MATCHES, not physics derivations.",
    redTeamProbability: "15-30%",
    canonicalScript: "verification/sympy/cmb_canonical_formulas.py",
  },

  // =========================================================================
  // FRAMEWORK CONSTANTS (Layer 0 — Division Algebras)
  // =========================================================================
  framework: {
    R: 1,
    C: 2,
    Im_H: 3,
    H: 4,
    Im_O: 7,
    O: 8,
    n_c: 11,
    n_d: 4,
    composites: {
      p137: { value: 137, formula: "H^2 + n_c^2", decomposition: "16 + 121" },
      p337: { value: 337, formula: "Im_H^4 + H^4", decomposition: "81 + 256" },
      p200: { value: 200, formula: "C * (n_c - R)^2", decomposition: "2 * 100" },
    },
  },

  // =========================================================================
  // CMB SKY MAP — Annotation Data
  // =========================================================================
  cmbSkyMap: {
    image: "cmb_map.jpg",
    credit: "ESA / Planck Collaboration (SMICA pipeline)",
    description:
      "Temperature fluctuations in the Cosmic Microwave Background, measured by the Planck satellite. " +
      "Each colored patch is a region of slightly different temperature from 13.8 billion years ago " +
      "\u2014 the seeds that grew to become galaxies and the large-scale structure we see today.",
    meanTemp: "2.7255 K",
    fluctuationRange: "\u00B1300 \u03BCK",

    // Coverage: what fraction of CMB physics is addressed
    coverage: [
      { category: "Peak positions (l_1, l_2, l_3)", covered: true, weight: 15, note: "EXACT to 1.2% for first 3 peaks" },
      { category: "6 LCDM parameters", covered: true, weight: 15, note: "All 6 as exact rationals" },
      { category: "CMB temperature", covered: true, weight: 5, note: "T = 109/40 K (0.02%)" },
      { category: "Recombination redshift z_*", covered: true, weight: 5, note: "33\u00B2 = 1089 (0.07%)" },
      { category: "Spectral index n_s", covered: true, weight: 5, note: "193/200 (0.01%)" },
      { category: "Tensor-to-scalar ratio r", covered: true, weight: 5, note: "r = 7/200 (testable)" },
      { category: "Sound horizon r_s", covered: true, weight: 5, note: "Standard integral with framework params: 0.03% (eta*x3/7 FALSIFIED)" },
      { category: "Peak heights / amplitudes", covered: false, weight: 12, note: "No power spectrum shape" },
      { category: "Silk damping (high-l tail)", covered: false, weight: 8, note: "No photon diffusion physics" },
      { category: "Higher peaks l_4+ ", covered: false, weight: 5, note: "FALSIFIED" },
      { category: "Boltzmann transport", covered: false, weight: 8, note: "No oscillation dynamics" },
      { category: "Polarization spectra (EE/TE shape)", covered: false, weight: 5, note: "Only EE peak positions" },
      { category: "Reionization physics", covered: false, weight: 3, note: "tau is a number, not physics" },
      { category: "Lensing of CMB", covered: false, weight: 2, note: "Not addressed" },
      { category: "ISW effect", covered: false, weight: 2, note: "Not addressed" },
    ],

    structures: [
      {
        id: "hot-patch", x: 27, y: 30, radius: 4,
        label: "Hot Spot (~1\u00B0)",
        detail: "A ~1\u00B0 hot patch \u2014 temperature excess of ~100 \u03BCK above the 2.725 K mean. " +
          "These degree-scale features are the dominant pattern in the CMB, imprinted by acoustic oscillations " +
          "in the primordial plasma at the moment of last scattering (z \u2248 1090). " +
          "They correspond to the first acoustic peak at multipole l \u2248 220.",
      },
      {
        id: "cold-patch", x: 60, y: 58, radius: 4,
        label: "Cold Spot (~1\u00B0)",
        detail: "A ~1\u00B0 cold patch \u2014 temperature deficit of ~100 \u03BCK. " +
          "These are the troughs of the same acoustic oscillations. Together, hot and cold spots at this scale " +
          "create the pattern you see across the entire sky. Their statistical distribution encodes the physics " +
          "of the early universe.",
      },
      {
        id: "cold-spot-anomaly", x: 73, y: 67, radius: 8,
        label: "CMB Cold Spot (anomaly)",
        detail: "The anomalous Cold Spot \u2014 a roughly 5\u00B0 region significantly colder than expected. " +
          "One of the few known CMB anomalies. Its origin is debated: a supervoid along the line of sight, " +
          "a cosmic texture, or a statistical fluke. Neither standard cosmology nor this framework explains it.",
      },
      {
        id: "large-scale", x: 18, y: 46, radius: 14,
        label: "Large-Scale Pattern (>5\u00B0)",
        detail: "Features spanning several degrees correspond to low multipoles (l < 30). " +
          "These encode information about the geometry of the universe via the Sachs-Wolfe effect \u2014 " +
          "photons climbing out of gravitational potential wells at the last scattering surface. " +
          "The quadrupole (l=2) and octupole (l=3) show a puzzling alignment ('Axis of Evil').",
      },
      {
        id: "fine-structure", x: 45, y: 32, radius: 3,
        label: "Sub-Degree Structure",
        detail: "Finer patterns below 0.5\u00B0 correspond to higher acoustic peaks (l > 500). " +
          "These are progressively suppressed by Silk damping \u2014 photon diffusion that erases small-scale " +
          "fluctuations before recombination. The framework has NOT derived this damping effect.",
      },
    ],

    frameworkAnnotations: [
      {
        id: "fw-peak1", x: 33, y: 24, radius: 5, scope: "global",
        label: "1st Peak: l\u2081 = 220",
        formula: "C \u00B7 n_c \u00B7 (n_c \u2212 R) = 2\u00B711\u00B710 = 220",
        match: "EXACT", error: "0.00%",
        detail: "The dominant ~1\u00B0 spots you see everywhere. Framework predicts this scale EXACTLY " +
          "from division algebra dimensions alone: Complex(2) \u00D7 Crystal(11) \u00D7 (Crystal \u2212 Real)(10). " +
          "No free parameters. Standard model also predicts l \u2248 220, but from sound horizon geometry.",
      },
      {
        id: "fw-peak2", x: 53, y: 40, radius: 3, scope: "global",
        label: "2nd Peak: l\u2082 = 538",
        formula: "l\u2081 \u00B7 22/9 = 537.78",
        match: "0.05%", error: "0.05%",
        detail: "Sub-degree features, harder to see by eye. The second harmonic of acoustic oscillations. " +
          "Framework predicts the ratio 22/9 from algebraic structure: 22 = 2\u00D711 and 9 = Im_H\u00B2. " +
          "Standard model derives this from baryon loading effects.",
      },
      {
        id: "fw-peak3", x: 70, y: 30, radius: 2, scope: "global",
        label: "3rd Peak: l\u2083 = 800",
        formula: "l\u2081 \u00B7 40/11 = 800",
        match: "1.2%", error: "1.2%",
        detail: "Even finer structure at ~0.2\u00B0 scale. Third harmonic. Framework predicts ratio " +
          "40/11 where 40 = (R+H)\u00B7O. Standard model predicts ~810 from third compression peak. " +
          "Framework is 1.2% off \u2014 the largest error for the low peaks.",
      },
      {
        id: "fw-temp", x: 48, y: 82, scope: "global",
        label: "T = 109/40 K",
        formula: "T_CMB = 109/40 = 2.725 K (0.02% error)",
        match: "0.02%", error: "0.02%",
        detail: "The mean temperature of this entire image. Framework says T = 109/40 K, where " +
          "109 = (n_c\u2212R)\u00B2 + Im_H\u00B2 = 100 + 9 and 40 = (R+H)\u00B7O = 5\u00D78. " +
          "Measured: 2.7255 \u00B1 0.0006 K. This is a [CONJECTURE] \u2014 numerical match, not dynamical derivation.",
      },
      {
        id: "fw-surface", x: 22, y: 75, scope: "global",
        label: "z_* = 33\u00B2 = 1089",
        formula: "(Im_H \u00B7 n_c)\u00B2 = (3\u00B711)\u00B2 = 1089",
        match: "0.07%", error: "0.07%",
        detail: "You are looking at the 'surface of last scattering' at redshift z \u2248 1089. " +
          "Framework identifies this with 33\u00B2 = (Im_H\u00B7n_c)\u00B2. Standard derives z_* = 1089.80 from " +
          "the Saha equation and recombination physics. Framework has NO connection to atomic physics here.",
      },
      {
        id: "fw-bmode", x: 75, y: 80, scope: "hidden",
        label: "B-modes r = 0.035",
        formula: "r = Im_O/200 = 7/200 = 0.035",
        match: "testable", error: "TBD",
        detail: "NOT visible in this temperature map. Framework predicts gravitational wave imprint " +
          "(B-mode polarization) at r = 0.035 \u2014 just below the current upper limit of 0.036. " +
          "CMB-S4 will test this by ~2028. Most standard inflationary models predict r < 0.01. " +
          "This is the framework's strongest falsifiable prediction.",
      },
    ],

    standardAnnotations: [
      {
        id: "std-peak1", x: 33, y: 37, radius: 5, scope: "global",
        label: "1st Peak: l \u2248 220",
        detail: "Predicted from sound horizon geometry: \u03B8_s = r_s / D_A, where r_s is the comoving sound " +
          "horizon at last scattering. Depends on baryon density, matter density, and expansion history. " +
          "The angular scale l \u2248 \u03C0/\u03B8_s \u2248 220 is a DERIVED result, not a free parameter. " +
          "Agrees with framework prediction \u2014 both get l\u2081 = 220.",
      },
      {
        id: "std-peak2", x: 53, y: 52, radius: 3, scope: "global",
        label: "2nd Peak: l \u2248 538",
        detail: "Second harmonic of acoustic oscillations. The amplitude is suppressed relative to odd peaks " +
          "due to baryon loading: baryons add inertia, enhancing compression (odd) peaks and suppressing " +
          "rarefaction (even) peaks. The peak ratio l\u2082/l\u2081 encodes \u03A9_b. " +
          "Standard: ~537.5. Framework: 537.8. Both match to 0.05%.",
      },
      {
        id: "std-peak3", x: 70, y: 42, radius: 2, scope: "global",
        label: "3rd Peak: l \u2248 810",
        detail: "Third harmonic, enhanced by baryon loading. The ratio l\u2083/l\u2081 is sensitive to " +
          "the matter-to-radiation ratio \u03A9_m/\u03A9_r, which determines when matter begins to dominate. " +
          "Standard: ~810. Framework: 800. Here they differ by ~1.2%. " +
          "Standard model derives this from full Boltzmann transport code (CAMB/CLASS).",
      },
      {
        id: "std-temp", x: 48, y: 72, scope: "global",
        label: "T\u2080 = 2.7255 K",
        detail: "From Big Bang nucleosynthesis and adiabatic expansion: T(z) = T\u2080(1+z). " +
          "At last scattering, T \u2248 3000 K. Redshifted by z \u2248 1090 to today's 2.7255 K. " +
          "Standard model explains this as a consequence of the universe's expansion history. " +
          "The exact value is measured, not predicted, in standard cosmology.",
      },
      {
        id: "std-surface", x: 22, y: 65, scope: "global",
        label: "z_* = 1089.80",
        detail: "Derived from the Saha equation (hydrogen recombination) and Boltzmann physics. " +
          "When the universe cools to ~3000 K, electrons combine with protons, photons decouple, " +
          "and the CMB is released. Standard gives z_* = 1089.80 \u00B1 0.21 from first principles. " +
          "Framework gives 33\u00B2 = 1089 (no atomic physics).",
      },
      {
        id: "std-silk", x: 55, y: 27, radius: 2, scope: "global",
        label: "Silk Damping",
        detail: "At small angular scales (l > 1000), fluctuations are exponentially suppressed " +
          "by photon diffusion before recombination. Derived from photon mean free path and " +
          "diffusion length. Standard model calculates this precisely. " +
          "The framework has NO derivation of Silk damping \u2014 a significant gap.",
      },
    ],

    angularScales: [
      { l: 2, theta: "90\u00B0", label: "Quadrupole" },
      { l: 10, theta: "18\u00B0", label: "Large scale" },
      { l: 220, theta: "0.82\u00B0", label: "1st peak" },
      { l: 538, theta: "0.33\u00B0", label: "2nd peak" },
      { l: 800, theta: "0.23\u00B0", label: "3rd peak" },
      { l: 2500, theta: "0.07\u00B0", label: "Damping tail" },
    ],

    comparisonNotes: [
      { aspect: "Peak positions", verdict: "agree", note: "Both predict l\u2081\u2248220, l\u2082\u2248538, l\u2083\u2248800-810. Framework uses algebra; standard uses sound horizon." },
      { aspect: "Peak heights", verdict: "framework-gap", note: "Standard derives full power spectrum shape. Framework predicts ONLY positions, not amplitudes." },
      { aspect: "Silk damping", verdict: "framework-gap", note: "Standard derives exponential suppression at high l. Framework has no damping physics." },
      { aspect: "Tensor modes (r)", verdict: "differs", note: "Framework: r = 0.035. Most standard models: r < 0.01. CMB-S4 will distinguish." },
      { aspect: "Parameter origin", verdict: "differs", note: "Framework: exact rationals from algebra. Standard: continuous parameters fit to data." },
      { aspect: "z_* origin", verdict: "differs", note: "Framework: 33\u00B2 (numerological). Standard: Saha equation (atomic physics)." },
    ],
  },

  // =========================================================================
  // LCDM PARAMETERS (6 base parameters)
  // =========================================================================
  lcdmParams: [
    {
      id: "H0",
      symbol: "H_0",
      name: "Hubble Constant",
      unit: "km/s/Mpc",
      formula: "337/5",
      formulaDecomposition: "(Im_H^4 + H^4) / (R + H)",
      predicted: 67.4,
      measured: 67.4,
      uncertainty: 0.5,
      errorPercent: 0.0,
      source: "Planck 2018",
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      notes: "Matches CMB-derived value. Local measurements give ~73 km/s/Mpc (Hubble tension). Framework predicts H_local/H_cmb = 13/12.",
    },
    {
      id: "Omega_m",
      symbol: "\u03A9_m",
      name: "Matter Density",
      unit: "",
      formula: "63/200",
      formulaDecomposition: "Im_O * Im_H^2 / (C * (n_c - R)^2)",
      predicted: 0.315,
      measured: 0.315,
      uncertainty: 0.007,
      errorPercent: 0.0,
      source: "Planck 2018",
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      notes: "63 = 200 - 137 = Im_O * Im_H^2. Matter = primordial budget minus dark energy.",
    },
    {
      id: "Omega_L",
      symbol: "\u03A9_\u039B",
      name: "Dark Energy Density",
      unit: "",
      formula: "137/200",
      formulaDecomposition: "(H^2 + n_c^2) / (C * (n_c - R)^2)",
      predicted: 0.685,
      measured: 0.685,
      uncertainty: 0.007,
      errorPercent: 0.0,
      source: "Planck 2018",
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      notes: "137 = fine structure integer. Omega_L + Omega_m = 200/200 = 1 (flat universe).",
    },
    {
      id: "n_s",
      symbol: "n_s",
      name: "Spectral Index",
      unit: "",
      formula: "193/200",
      formulaDecomposition: "1 - Im_O / (C * (n_c - R)^2)",
      predicted: 0.965,
      measured: 0.9649,
      uncertainty: 0.0042,
      errorPercent: 0.01,
      source: "Planck 2018",
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      notes: "193/200 = 1 - 7/200. 200 = primordial mode count, 7 hidden octonionic modes. Within 1 sigma.",
    },
    {
      id: "tau",
      symbol: "\u03C4",
      name: "Optical Depth",
      unit: "",
      formula: "11/200",
      formulaDecomposition: "n_c / (C * (n_c - R)^2)",
      predicted: 0.055,
      measured: 0.054,
      uncertainty: 0.007,
      errorPercent: 1.9,
      source: "Planck 2018",
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      notes: "Alternative candidate: tau = 3/56 = 0.0536 (0.8% error). No physics connecting n_c to reionization.",
      alternatives: [
        { formula: "Im_H/(O*Im_O) = 3/56", value: 0.05357, errorPercent: 0.8, note: "Better fit but less motivated" },
      ],
    },
    {
      id: "Omega_b",
      symbol: "\u03A9_b",
      name: "Baryon Density",
      unit: "",
      formula: "567/11600",
      formulaDecomposition: "\u03A9_m * Im_H^2 / (Im_O^2 + Im_H^2)",
      predicted: 0.04888,
      measured: 0.0493,
      uncertainty: 0.0003,
      errorPercent: 0.85,
      source: "Planck 2018",
      confidence: "derivation",
      verificationScript: "lcdm_deviations_from_hilltop.py",
      notes: "1.4-sigma tension. Framework underestimates Omega_b by ~0.9%.",
    },
  ],

  // =========================================================================
  // CANONICAL OBSERVABLES (12 from cmb_canonical_formulas.py)
  // =========================================================================
  canonicalObservables: [
    {
      id: "z_star",
      symbol: "z_*",
      name: "Recombination Redshift",
      category: "cmb",
      formula: "(Im_H * n_c)^2 = 33^2",
      predicted: 1089,
      measured: 1089.80,
      uncertainty: 0.21,
      errorPercent: 0.07,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "No connection to atomic physics (Saha equation). Numerological identification.",
    },
    {
      id: "n_s_obs",
      symbol: "n_s",
      name: "Spectral Index",
      category: "cmb",
      formula: "1 - Im_O/200 = 193/200",
      predicted: 0.965,
      measured: 0.9649,
      uncertainty: 0.0042,
      errorPercent: 0.01,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "No derivation from slow-roll parameters epsilon, eta.",
    },
    {
      id: "l_1",
      symbol: "\u2113_1",
      name: "First Acoustic Peak",
      category: "peaks",
      formula: "C * n_c * (n_c - R) = 220",
      predicted: 220,
      measured: 220.0,
      uncertainty: 0.5,
      errorPercent: 0.0,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "Not derived from D_A/r_s ratio and standing wave physics.",
    },
    {
      id: "l_2",
      symbol: "\u2113_2",
      name: "Second Acoustic Peak",
      category: "peaks",
      formula: "\u2113_1 * 22/9 = 537.8",
      predicted: 537.78,
      measured: 537.5,
      uncertainty: 2.0,
      errorPercent: 0.05,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "Multiple formulas give similar values. Need standing wave derivation.",
    },
    {
      id: "l_3",
      symbol: "\u2113_3",
      name: "Third Acoustic Peak",
      category: "peaks",
      formula: "\u2113_1 * 40/11 = 800",
      predicted: 800,
      measured: 810.0,
      uncertainty: 10.0,
      errorPercent: 1.2,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "Tension: l_3 = 820 formula gives slightly worse match.",
    },
    {
      id: "r_s",
      symbol: "r_s",
      name: "Sound Horizon",
      category: "cmb",
      unit: "Mpc",
      formula: "d_C / 96 = d_C / (O*(n_c+R)) via standard integral",
      predicted: 144.48,
      measured: 144.43,
      uncertainty: 0.26,
      errorPercent: 0.03,
      confidence: "derivation",
      verificationScript: "rs_derivation_from_framework.py",
      gap: "r_s = d_C/96 from cosmological integral (0.03%). l_A = pi*d_C/r_s = 96*pi confirmed to 0.04%. Prior claim r_s=337*3/7 FALSIFIED (S194).",
    },
    {
      id: "l_A",
      symbol: "l_A",
      name: "Acoustic Scale",
      category: "cmb",
      formula: "pi * d_C / r_s = 96*pi (integral confirms algebra)",
      predicted: 301.47,
      measured: 301.59,
      measuredLabel: "96\u03C0 (framework algebra)",
      uncertainty: null,
      errorPercent: 0.04,
      confidence: "derivation",
      verificationScript: "rs_derivation_from_framework.py",
      gap: "The ratio d_C/r_s = 95.96 from cosmological integrals matches 96 = O*(n_c+R) to 0.04%. This confirms the algebraic formula l_A = 96*pi is encoded in the framework parameters.",
    },
    {
      id: "theta_s",
      symbol: "100\u03B8_*",
      name: "Angular Sound Horizon",
      category: "cmb",
      formula: "100 * r_s / d_C (from integrals)",
      predicted: 1.04209,
      measured: 1.04110,
      uncertainty: 0.00031,
      errorPercent: 0.095,
      confidence: "derivation",
      verificationScript: "rs_derivation_from_framework.py",
      gap: "3.2-sigma tension. Framework H0=67.4 is slightly above Planck best-fit 67.36.",
    },
    {
      id: "r_tensor",
      symbol: "r",
      name: "Tensor-to-Scalar Ratio",
      category: "inflation",
      formula: "Im_O/200 = 7/200",
      predicted: 0.035,
      measured: null,
      measuredLabel: "< 0.036 (95% CL)",
      uncertainty: null,
      errorPercent: null,
      confidence: "derivation",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "Testable by CMB-S4 (~2028). Key discriminating prediction.",
    },
    {
      id: "T_cmb",
      symbol: "T_CMB",
      name: "CMB Temperature",
      category: "cmb",
      unit: "K",
      formula: "109/40",
      predicted: 2.725,
      measured: 2.7255,
      uncertainty: 0.0006,
      errorPercent: 0.02,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "No derivation from recombination physics and redshift scaling.",
    },
    {
      id: "H_0",
      symbol: "H_0",
      name: "Hubble Constant",
      category: "cmb",
      unit: "km/s/Mpc",
      formula: "337/5",
      predicted: 67.4,
      measured: 67.4,
      uncertainty: 0.5,
      errorPercent: 0.0,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "Matches CMB value. Hubble tension: local H_0 ~ 73. Framework predicts ratio 13/12.",
    },
    {
      id: "Omega_L_obs",
      symbol: "\u03A9_\u039B",
      name: "Dark Energy Density",
      category: "cmb",
      formula: "137/200",
      predicted: 0.685,
      measured: 0.685,
      uncertainty: 0.007,
      errorPercent: 0.0,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "",
    },
    {
      id: "Omega_m_obs",
      symbol: "\u03A9_m",
      name: "Matter Density",
      category: "cmb",
      formula: "63/200",
      predicted: 0.315,
      measured: 0.315,
      uncertainty: 0.007,
      errorPercent: 0.0,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "63 = 200 - 137 = Im_O * Im_H^2. Consistency check: Omega_L + Omega_m = 1.",
    },
    {
      id: "tau_obs",
      symbol: "\u03C4",
      name: "Optical Depth",
      category: "cmb",
      formula: "n_c/200 = 11/200",
      predicted: 0.055,
      measured: 0.054,
      uncertainty: 0.007,
      errorPercent: 1.9,
      confidence: "conjecture",
      verificationScript: "cmb_canonical_formulas.py",
      gap: "No physics connecting n_c to reionization epoch.",
    },
  ],

  // =========================================================================
  // ACOUSTIC PEAKS
  // =========================================================================
  acousticPeaks: {
    acousticScale: { formula: "O * (n_c + R) * pi = 96pi", value: 301.59 },
    phaseShift: { formula: "Im_H / n_c = 3/11", value: 0.2727 },
    unifiedFormula: "\u2113_n = 96\u03C0 * (n - 3/11)",
    peaks: [
      { n: 1, predicted: 220, measured: 220.0, errorPercent: 0.0 },
      { n: 2, predicted: 537.8, measured: 537.5, errorPercent: 0.05 },
      { n: 3, predicted: 800, measured: 810.0, errorPercent: 1.2 },
    ],
    higherPeaks: {
      status: "FALSIFIED",
      note: "Blind predictions for l_4, l_5, l_6 were FALSIFIED in Session 124. The pattern extending from l_1, l_2, l_3 does NOT work for higher peaks.",
      predictions: [
        { n: 4, predicted: 960, measured: 1129, errorPercent: 15, status: "falsified" },
        { n: 5, predicted: 1240, measured: 1402, errorPercent: 12, status: "falsified" },
        { n: 6, predicted: 1400, measured: 1735, errorPercent: 19, status: "falsified" },
      ],
    },
  },

  // =========================================================================
  // BLIND PREDICTIONS (Session 138, Phase 4.1)
  // =========================================================================
  blindPredictions: [
    {
      id: "P-010",
      observable: "Age of the Universe",
      symbol: "t_0",
      unit: "Gyr",
      predicted: 13.790,
      measured: 13.797,
      uncertainty: 0.023,
      sigma: 0.3,
      errorPercent: 0.05,
      status: "pass",
      algebraicCandidate: "H_0*t_0 ~ 19/20",
      source: "Planck 2018",
    },
    {
      id: "P-011",
      observable: "Matter-Radiation Equality",
      symbol: "z_eq",
      unit: "",
      predicted: 3426,
      measured: 3402,
      uncertainty: 26,
      sigma: 0.9,
      errorPercent: 0.7,
      status: "pass",
      algebraicCandidate: null,
      source: "Planck 2018",
    },
    {
      id: "P-012",
      observable: "Deceleration Parameter",
      symbol: "q_0",
      unit: "",
      predicted: -0.5275,
      measured: -0.528,
      uncertainty: 0.004,
      sigma: 0.1,
      errorPercent: 0.09,
      status: "pass",
      algebraicCandidate: "-211/400 (211 is prime)",
      source: "Planck 2018 (derived)",
    },
    {
      id: "P-013",
      observable: "Angular Sound Horizon",
      symbol: "100\u03B8_s",
      unit: "",
      predicted: 1.04175,
      measured: 1.04110,
      uncertainty: 0.00031,
      sigma: 2.1,
      errorPercent: 0.062,
      status: "marginal",
      algebraicCandidate: "100/96 = 25/24",
      source: "Planck 2018",
      notes: "2.1-sigma tension reflects H_0 = 67.4 being slightly above Planck best-fit 67.36.",
    },
    {
      id: "P-014",
      observable: "CMB Shift Parameter",
      symbol: "R",
      unit: "",
      predicted: 1.7494,
      measured: 1.7502,
      uncertainty: 0.0046,
      sigma: 0.2,
      errorPercent: 0.05,
      status: "pass",
      algebraicCandidate: "Im_O/H = 7/4 = 1.750 (0.035%)",
      source: "Planck 2018 (derived)",
    },
    {
      id: "P-015",
      observable: "BAO Distance Ratio",
      symbol: "D_M/r_d (z=0.51)",
      unit: "",
      predicted: 13.49,
      measured: 13.38,
      uncertainty: 0.18,
      sigma: 0.6,
      errorPercent: 0.8,
      status: "pass",
      algebraicCandidate: null,
      source: "BOSS DR12",
      notes: "Framework r_s (recombination) vs r_d (drag epoch) differ by ~1.8%.",
    },
    {
      id: "P-016",
      observable: "Dimensionless Age",
      symbol: "H_0 t_0",
      unit: "",
      predicted: 0.9506,
      measured: 0.951,
      uncertainty: 0.005,
      sigma: 0.1,
      errorPercent: 0.04,
      status: "pass",
      algebraicCandidate: "19/20 (19 = n_c + O)",
      source: "Planck 2018 (derived)",
    },
  ],

  // =========================================================================
  // POLARIZATION
  // =========================================================================
  polarization: {
    eePeaks: [
      { n: 1, predicted: 370, measured: 396, errorPercent: 6.6, confidence: "derivation" },
      { n: 2, predicted: 672, measured: 690, errorPercent: 2.6, confidence: "derivation" },
      { n: 3, predicted: 974, measured: 1000, errorPercent: 2.6, confidence: "derivation" },
      { n: 4, predicted: 1275, measured: 1300, errorPercent: 1.9, confidence: "derivation" },
      { n: 5, predicted: 1577, measured: 1600, errorPercent: 1.4, confidence: "derivation" },
    ],
    eeFormula: "\u2113_n^EE = 96\u03C0 * (22n + 5) / 22",
    eeTTOffset: { formula: "\u2113_A/2 = 48\u03C0", value: 150.8, note: "EXACT for all n (velocity pi/2 out of phase with density)" },
    bMode: {
      r: 0.035,
      bbAmplitude: "0.00084 \u03BCK^2 at \u2113 ~ 80",
      experiments: [
        { name: "BICEP/Keck 2021", sensitivity: "r < 0.036", detectionSigma: "compatible" },
        { name: "CMB-S4", sensitivity: "\u03C3(r) ~ 0.001", detectionSigma: "35\u03C3" },
        { name: "LiteBIRD", sensitivity: "\u03C3(r) ~ 0.002", detectionSigma: "17\u03C3" },
        { name: "Simons Observatory", sensitivity: "\u03C3(r) ~ 0.003", detectionSigma: "12\u03C3" },
      ],
    },
    teCorrelation: { formula: "H/n_c = 4/11", value: 0.364, measured: "~0.4", errorPercent: 10, confidence: "conjecture" },
    etRatio: { formula: "1/n_c = 1/11", value: 0.091, measured: "~0.1", errorPercent: 9, confidence: "conjecture" },
  },

  // =========================================================================
  // BBN
  // =========================================================================
  bbn: [
    {
      id: "eta",
      symbol: "\u03B7",
      name: "Baryon-to-Photon Ratio",
      formula: "\u03B1^4 * Im_H/(H + n_c) = \u03B1^4 * 3/15",
      predicted: 5.67e-10,
      measured: 6.104e-10,
      uncertainty: 0.058e-10,
      errorPercent: 7.1,
      confidence: "conjecture",
      highlight: null,
    },
    {
      id: "Y_p",
      symbol: "Y_p",
      name: "Primordial Helium-4",
      formula: "1/4 - 1/(2*n_c^2) = 119/484",
      predicted: 0.24587,
      measured: 0.2449,
      uncertainty: 0.004,
      errorPercent: 0.40,
      confidence: "conjecture",
      highlight: null,
    },
    {
      id: "DH",
      symbol: "D/H",
      name: "Primordial Deuterium",
      formula: "\u03B1^2 * (n_c - 1)/(Im_H * Im_O) = \u03B1^2 * 10/21",
      predicted: 2.534e-5,
      measured: 2.547e-5,
      uncertainty: 0.025e-5,
      errorPercent: 0.51,
      confidence: "conjecture",
      highlight: null,
    },
  ],

  // =========================================================================
  // LCDM DEVIATIONS (what distinguishes the framework)
  // =========================================================================
  lcdmDeviations: [
    {
      id: "D-01",
      description: "Tensor-to-scalar ratio r = 0.035",
      tier: 1,
      framework: "7/200 = 0.035",
      standard: "Most models predict r < 0.01",
      testable: "CMB-S4 (~2028)",
      status: "key-test",
      severity: "critical",
    },
    {
      id: "D-02",
      description: "z_* = 33^2 = 1089 (numerological)",
      tier: 2,
      framework: "33^2 = 1089",
      standard: "1089.80 +/- 0.21",
      testable: "Resolved (numerological approximation)",
      status: "resolved",
      severity: "low",
    },
    {
      id: "D-03",
      description: "Dark energy w = -1 exactly",
      tier: 1,
      framework: "w = -1 (cosmological constant)",
      standard: "DESI hints w != -1 at 2.5 sigma",
      testable: "DESI/Euclid (~2026-2028)",
      status: "monitoring",
      severity: "high",
    },
    {
      id: "D-04",
      description: "Baryon density Omega_b = 567/11600",
      tier: 2,
      framework: "567/11600 = 0.04888",
      standard: "0.0493 +/- 0.0003 (1.4 sigma tension)",
      testable: "Borderline",
      status: "tension",
      severity: "medium",
    },
    {
      id: "D-05",
      description: "Phase shift phi = 3/11",
      tier: 3,
      framework: "Im_H/n_c = 0.2727",
      standard: "~0.267 (from baryon loading)",
      testable: "Difficult (sub-% peak measurement)",
      status: "open",
      severity: "low",
    },
    {
      id: "D-06",
      description: "Running spectral index alpha_s",
      tier: 3,
      framework: "-637/1280000 = -5.0e-4",
      standard: "0 +/- 0.007 (Planck)",
      testable: "Needs ~10x sensitivity improvement",
      status: "open",
      severity: "low",
    },
    {
      id: "D-07",
      description: "Exact rational parameter values",
      tier: 2,
      framework: "H_0 = 337/5, etc.",
      standard: "Continuous parameters",
      testable: "Needs significantly reduced error bars",
      status: "open",
      severity: "medium",
    },
    {
      id: "D-08",
      description: "Non-Gaussianity f_NL = -7/480",
      tier: 3,
      framework: "-7/480 = -0.015",
      standard: "-0.9 +/- 5.1 (Planck)",
      testable: "Needs ~300x sensitivity improvement",
      status: "open",
      severity: "low",
    },
    {
      id: "D-09",
      description: "Tensor spectral index n_t = -7/1600",
      tier: 3,
      framework: "-7/1600 = -0.004375",
      standard: "Unconstrained",
      testable: "Requires GW detection + spectrum",
      status: "open",
      severity: "low",
    },
    {
      id: "D-10",
      description: "r = 1 - n_s breaking (~5e-4)",
      tier: 3,
      framework: "Condensate shifts r and n_s differently",
      standard: "Not measured",
      testable: "Marginal (needs ~3e-4 precision)",
      status: "open",
      severity: "low",
    },
  ],

  // =========================================================================
  // FALSIFICATION CRITERIA
  // =========================================================================
  falsification: [
    {
      criterion: "r measured and r != 0.035",
      target: "r < 0.01 or r > 0.06",
      timeline: "CMB-S4 (~2028-2030)",
      severity: "critical",
      detail: "Framework's strongest prediction. Detection at r~0.035 = strong evidence; r < 0.01 = falsification.",
    },
    {
      criterion: "w != -1 confirmed at 5 sigma",
      target: "Dynamical dark energy by multiple surveys",
      timeline: "DESI/Euclid (~2026-2030)",
      severity: "critical",
      detail: "Framework predicts cosmological constant. Dynamical DE would require new mechanism.",
    },
    {
      criterion: "H_0 converges outside 66.9-67.9",
      target: "CMB-derived H_0 > 68 or < 67",
      timeline: "Future CMB missions",
      severity: "high",
      detail: "Framework predicts H_0 = 337/5 = 67.4 exactly.",
    },
    {
      criterion: "Omega_L or Omega_m excludes framework rationals",
      target: "Omega_L != 0.685 +/- 0.3%",
      timeline: "Future surveys",
      severity: "high",
      detail: "Framework predicts exact rational values 137/200 and 63/200.",
    },
    {
      criterion: "Higher peaks: pattern fails for l_1, l_2, l_3",
      target: "Reanalysis of low-l peaks shifts them from 220, 538, 810",
      timeline: "Current data",
      severity: "medium",
      detail: "Higher peak predictions (l_4+) already falsified. If l_1-l_3 formulas also fail, framework is further constrained.",
    },
    {
      criterion: "n_s precision excludes 193/200",
      target: "n_s measured at 10^-4 excluding 0.965",
      timeline: "CMB-S4 / future missions",
      severity: "medium",
      detail: "Currently within 1-sigma. More precise measurement is the test.",
    },
  ],

  // =========================================================================
  // HONEST ASSESSMENT
  // =========================================================================
  honestAssessment: {
    isDerived: [
      "Peak POSITIONS from l_A = 96pi and phi = 3/11",
      "Tensor-to-scalar ratio r = 7/200 from hilltop potential",
      "Consistency relation n_t = -r/8 from slow-roll",
      "Cosmic sum rule Omega_L + Omega_m = 1",
      "All 6 LCDM parameters as exact rationals",
      "EE peak positions (shifted by l_A/2 from TT)",
      "SO(11) breaking chain: 4 stages, 43 Goldstones tracked (S191)",
      "Hilltop inflation parameters: mu^2 = 1536/7, n_s = 193/200 (S191)",
      "r_s = 144.48 Mpc from standard integral with framework params (0.03%, S194)",
      "r_d = 147.06 Mpc at drag epoch (0.02% match to Planck, S194)",
      "l_A = 96*pi CONFIRMED: d_C/r_s = 95.96 from integrals matches algebra to 0.04% (S194)",
      "100*theta_s = 1.04209, matching Planck 1.04110 to 0.095% (S194)",
    ],
    isNotDerived: [
      "No equations of motion for n_s (slow-roll not derived)",
      "r_s = 337*3/7 FALSIFIED: eta* = 280 Mpc (not 337), c_s = 0.454 (not 3/7) (S194)",
      "No Boltzmann hierarchy (no oscillation dynamics)",
      "No peak HEIGHTS (only positions)",
      "No Silk damping derivation",
      "Higher peaks l_4, l_5, l_6 FALSIFIED",
      "No connection to Saha equation for z_*",
      "No reionization physics for tau",
      "c_s = 3/7 NOT derivable -- all 4 paths fail, standard gives 0.454 (S191)",
      "V_0 NOT derivable -- requires alpha^4.16, no clean expression (S191)",
      "Stage 2-3 energy scales (SO(7)->G2->SU(3)) not derived (S191)",
    ],
    caveats: [
      "Red Team estimated 15-30% probability this is genuine physics",
      "All formulas are [CONJECTURE] -- numerical matches, not dynamics",
      "The derivation vs. discovery problem remains unresolved",
      "~3 structural assumptions are hidden (not zero free parameters)",
      "LLM may have memorized some target values",
      "r_s = 337*3/7 FALSIFIED (S194): eta* = 280 Mpc (not 337), c_s = 0.515 effective (not 3/7). Product was numerical coincidence.",
    ],
  },

  // =========================================================================
  // SO(11) EPOCH MAPPING (Session 191)
  // =========================================================================
  so11Epochs: {
    breakingChain: "SO(11) \u2192 SO(4)\u00D7SO(7) \u2192 SO(4)\u00D7G\u2082 \u2192 SO(4)\u00D7SU(3) \u2192 U(2)\u00D7SU(3)",
    smResult: "U(1)\u00D7SU(2)\u00D7SU(3) = Standard Model",
    totalGoldstones: 43,
    totalDOF: 55,
    totalDOFFormula: "n_c(n_c\u22121)/2 = 11\u00D710/2",
    stages: [
      {
        stage: 1,
        label: "Inflation",
        breaking: "SO(11) \u2192 SO(4)\u00D7SO(7)",
        goldstones: 28,
        formula: "n_d \u00D7 Im_O = 4 \u00D7 7",
        epoch: "Inflation",
        energyScale: "~10\u00B9\u2076 GeV",
        scaleConfidence: "physical",
        fates: [
          { count: 24, description: "Colored scalars (frozen at high energy)" },
          { count: 3, description: "Eaten by W\u00B1, Z (later, at EWSB)" },
          { count: 1, description: "Higgs singlet (pNGB, fraction 1/7)" },
        ],
        note: "Drives hilltop inflation: V(\u03C6) = V\u2080(1 \u2212 \u03C6\u00B2/\u03BC\u00B2), \u03BC\u00B2 = 1536/7",
      },
      {
        stage: 2,
        label: "Post-Inflation",
        breaking: "SO(7) \u2192 G\u2082",
        goldstones: 7,
        formula: "Im_O = 7",
        epoch: "Post-inflation (GUT-like)",
        energyScale: "GAP",
        scaleConfidence: "gap",
        fates: [
          { count: 7, description: "All frozen (massive)" },
        ],
        note: "G\u2082 = Aut(O). Octonion automorphism group preserves multiplication table.",
      },
      {
        stage: 3,
        label: "QCD Emergence",
        breaking: "G\u2082 \u2192 SU(3)",
        goldstones: 6,
        formula: "dim(G\u2082) \u2212 dim(SU(3)) = 14 \u2212 8",
        epoch: "QCD-like confinement",
        energyScale: "GAP",
        scaleConfidence: "gap",
        fates: [
          { count: 6, description: "All frozen (massive)" },
        ],
        note: "SU(3) color gauge group emerges. Strong force becomes distinct.",
      },
      {
        stage: 4,
        label: "EWSB",
        breaking: "SO(4) \u2192 U(2)",
        goldstones: 2,
        formula: "dim(SO(4)) \u2212 dim(U(2)) = 6 \u2212 4",
        epoch: "Electroweak symmetry breaking",
        energyScale: "246 GeV",
        scaleConfidence: "import",
        fates: [
          { count: 2, description: "Eaten by W\u00B1 (longitudinal modes)" },
        ],
        note: "C = 2. Final step to Standard Model gauge group.",
      },
    ],
    dofAccounting: [
      { category: "SM gauge bosons", count: 12, detail: "8 gluons + W\u00B1 + Z + \u03B3" },
      { category: "Higgs doublet", count: 1, detail: "pNGB from Stage 1 (singlet fraction 1/7)" },
      { category: "Eaten by W/Z", count: 3, detail: "3 Goldstones give W\u00B1, Z mass" },
      { category: "Frozen scalars", count: 39, detail: "24 (Stage 1) + 7 (Stage 2) + 6 (Stage 3) + 2 (Stage 4)" },
    ],
    verificationScript: "so11_epoch_dof_counting.py",
    tests: "28/28 PASS",
  },

  // =========================================================================
  // CMB SYNTHESIS — "What IS the CMB?" (Session 191)
  // =========================================================================
  cmbSynthesis: {
    interpretation: "The CMB is the fossil record of SO(11) crystallization \u2014 the thermal afterglow " +
      "of the first symmetry-breaking stage, when 28 Goldstone modes drove hilltop inflation " +
      "and the universe transitioned from the full SO(11) perspective symmetry to the broken " +
      "SO(4)\u00D7SO(7) phase. Temperature fluctuations encode the geometry of this transition.",

    scorecard: {
      derived: { count: 11, label: "Derived", color: "green" },
      imported: { count: 6, label: "Imported", color: "cyan" },
      conjectured: { count: 2, label: "Conjectured", color: "yellow" },
      falsified: { count: 3, label: "Falsified", color: "red" },
      gaps: { count: 7, label: "Open Gaps", color: "orange" },
    },

    derivedItems: [
      { item: "n_s = 193/200 = 0.965", source: "Hilltop inflation with \u03BC\u00B2 = 1536/7", confidence: "derivation" },
      { item: "r = 7/200 = 0.035", source: "r = 1 \u2212 n_s from slow-roll", confidence: "derivation" },
      { item: "N ~ 52 e-folds", source: "From \u03BC\u00B2 value", confidence: "derivation" },
      { item: "\u03BC\u00B2 = 1536/7", source: "(C+H)\u00B7H\u2074/Im_O = 6\u00B7256/7", confidence: "derivation" },
      { item: "SO(11) breaking chain (4 stages)", source: "Group theory from THM_0487", confidence: "derivation" },
      { item: "43 Goldstone modes", source: "Exact: 28 + 7 + 6 + 2", confidence: "theorem" },
      { item: "Higgs as pNGB", source: "Singlet fraction 1/7 from SO(7) decomposition", confidence: "derivation" },
      { item: "Peak positions l\u2081\u2013l\u2083", source: "l_A = 96\u03C0, \u03C6 = 3/11, within 1.2%", confidence: "conjecture" },
      { item: "r_s = 144.48 Mpc (0.03%)", source: "Standard integral with framework H0, Om_m, Om_b (S194)", confidence: "derivation" },
      { item: "l_A = 96\u03C0 confirmed (0.04%)", source: "d_C/r_s = 95.96 from cosmological integrals (S194)", confidence: "derivation" },
      { item: "100\u03B8_* = 1.04209 (0.095%)", source: "r_s/d_C from integrals matches Planck (S194)", confidence: "derivation" },
    ],

    importedItems: [
      { item: "M_Pl (Planck mass)", use: "Sets absolute energy scale" },
      { item: "v = 246 GeV", use: "EWSB scale (Stage 4)" },
      { item: "\u03B1_EM (fine structure constant)", use: "Correction terms" },
      { item: "Standard Boltzmann physics", use: "Photon-baryon dynamics" },
      { item: "Saha equation", use: "Recombination redshift z_*" },
      { item: "Photon diffusion", use: "Silk damping at high l" },
    ],

    conjecturedItems: [
      { item: "H\u2080 = 337/5 = 67.4 km/s/Mpc", hrs: 5, note: "Matches Planck CMB value" },
      { item: "\u03A9_b/\u03A9_m = 9/58", hrs: 5, note: "From Im_H\u00B2/(Im_O\u00B2+Im_H\u00B2)" },
    ],

    falsifiedItems: [
      { item: "r_s = 337 \u00D7 3/7 = 144.43 Mpc", note: "FALSIFIED S194: eta* = 280 Mpc, not 337. Coincidental product." },
      { item: "c_s = 3/7 \u2248 0.429", note: "FALSIFIED S191+S194: standard c_s = 0.454, effective avg = 0.515" },
      { item: "\u03B7_* = 337 Mpc", note: "FALSIFIED S194: integral gives 280.4 Mpc (16.8% off)" },
    ],

    openGaps: [
      { id: "G-CMB-V0", description: "Inflationary amplitude V\u2080", severity: "critical",
        detail: "Required \u03B1^4.16 \u2014 not a clean framework expression. Near-miss: \u03B1\u2074\u00B7Im_O/n_c (ratio 1.38\u00D7). A_s coefficient 63\u03C0\u00B2/1000 has framework structure (63 = Im_O\u00B7Im_H\u00B2) but A_s itself is imported." },
      { id: "G-CMB-RS-DERIVE", description: "Derive r_s from framework principles (not just standard integral)", severity: "high",
        detail: "Standard integral gives r_s = 144.48 Mpc (0.03%) using framework params. But this uses imported Boltzmann physics. Can framework derive r_s without importing sound speed equation?" },
      { id: "G-CMB-SCALE23", description: "Stage 2\u20133 energy scales", severity: "medium",
        detail: "SO(7)\u2192G\u2082 and G\u2082\u2192SU(3) transition energies not derived from framework." },
      { id: "G-CMB-NEFF", description: "N_eff from Goldstone thermalization", severity: "medium",
        detail: "Do the 39 frozen scalars contribute to the radiation budget?" },
      { id: "G-CMB-COLORED", description: "Colored scalar masses", severity: "medium",
        detail: "24 colored scalars from Stage 1. What are their masses? LHC constraints?" },
      { id: "G-CMB-TAU", description: "Optical depth \u03C4 physics", severity: "low",
        detail: "No connection between n_c = 11 and reionization epoch." },
      { id: "G-CMB-SIGMA8", description: "\u03C3\u2088 amplitude", severity: "low",
        detail: "No structure formation or matter power spectrum physics." },
    ],

    soundSpeedInvestigation: {
      claimed: "3/7 \u2248 0.429",
      standard: "0.454",
      effectiveAverage: "0.515",
      discrepancy: "20.2% (from effective avg)",
      status: "FALSIFIED (S194)",
      pathsTested: 4,
      pathsSucceeded: 0,
      paths: [
        { name: "Path A: DOF ratio", result: "c_s\u00B2 = 3/7 \u2192 c_s = 0.655 (wrong level)", status: "fail" },
        { name: "Path B: Tilt decomposition", result: "No unique mechanism for Im_H/Im_O", status: "fail" },
        { name: "Path C: Standard formula", result: "c_s = 0.454, REFUTES c_s = 3/7", status: "refuted" },
        { name: "Path D: Channel weight", result: "No crystallization pressure derivation", status: "fail" },
      ],
      integralResult: "S194: eta* = 280.4 Mpc (not 337). Effective <c_s> = r_s/eta* = 0.515 (not 0.429). Both factors wrong by ~17-20%.",
      positiveResult: "Standard integral with framework H0, Om_m, Om_b gives r_s = 144.48 Mpc (0.03% match to Planck).",
    },

    inflationaryAmplitude: {
      targetAs: "2.1 \u00D7 10\u207B\u2079",
      requiredPower: "\u03B1^4.16",
      nearMiss: "\u03B1\u2074 \u00B7 Im_O/n_c (ratio 1.38\u00D7)",
      asCoefficient: "63\u03C0\u00B2/1000",
      asCoefficientNote: "63 = Im_O\u00B7Im_H\u00B2, 1000 = (Im_H+Im_O)\u00B3",
      conclusion: "NOT derivable \u2014 no clean framework expression for V\u2080",
    },

    verificationScripts: [
      { name: "so11_epoch_dof_counting.py", tests: 28, status: "PASS" },
      { name: "sound_speed_from_crystallization.py", tests: 17, status: "PASS" },
      { name: "v0_democratic_derivation.py", tests: 14, status: "PASS" },
      { name: "cmb_framework_integration.py", tests: 51, status: "PASS" },
      { name: "eta_star_cosmological_integral.py", tests: 18, status: "16/18 PASS (2 FAIL = eta*!=337)" },
      { name: "rs_derivation_from_framework.py", tests: 14, status: "13/14 PASS (1 FAIL = l_2 baryon shift)" },
    ],
    totalTests: 142,
    session: "S194",
  },
};
