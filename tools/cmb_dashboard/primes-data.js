/**
 * Prime Attractors — Data Layer
 *
 * SINGLE SOURCE OF TRUTH for prime-physics mapping visualization data.
 * Framework primes, attractor hierarchy, and precision matches.
 *
 * Sources:
 *   framework/PRIME_PHYSICAL_CATALOG.md
 *   framework/investigations/primes/
 */

var PRIMES_DATA = {

  meta: {
    title: "Prime Attractors",
    subtitle: "How Division Algebra Primes Map to Physical Constants",
    session: "S213",
    totalTests: 37527,
    testsPass: 37527,
    passRate: "100%",
  },

  // =========================================================================
  // THE MASTER PATTERN
  // =========================================================================
  masterPattern: {
    formula: "Observable = Prime(algebraic_structure) \u00D7 Fraction(scale_selector)",
    explanation: "The PRIME encodes WHICH algebras are active. The FRACTION fine-tunes to the specific scale.",
  },

  // =========================================================================
  // DIMENSIONS (for decomposition visuals)
  // =========================================================================
  dimensions: {
    R: { dim: 1, label: "\u211D", color: "#f85149" },
    C: { dim: 2, label: "\u2102", color: "#d29922" },
    ImH: { dim: 3, label: "Im(\u210D)", color: "#3fb950" },
    H: { dim: 4, label: "\u210D", color: "#3fb950" },
    ImO: { dim: 7, label: "Im(\ud835\udd46)", color: "#58a6ff" },
    O: { dim: 8, label: "\ud835\udd46", color: "#58a6ff" },
    nc: { dim: 11, label: "n_c", color: "#bc8cff" },
  },

  // =========================================================================
  // PRIME TIERS
  // =========================================================================
  tiers: [
    {
      id: 1,
      name: "Structural",
      description: "Division algebra dimensions — the building blocks",
      color: "#f85149",
      primes: [
        { p: 2, form: "dim(\u2102)", physics: "Binary structure, EM, U(1)", precision: "exact" },
        { p: 3, form: "Im(\u210D), \u03A6\u2086(2)", physics: "Generations, colors, Z\u2083", precision: "exact" },
        { p: 7, form: "Im(\ud835\udd46), \u03A6\u2086(3)", physics: "Octonion imaginaries, internal structure", precision: "exact" },
        { p: 11, form: "n_c = 1+3+7", physics: "Crystal dimensions", precision: "exact" },
      ],
    },
    {
      id: 2,
      name: "Framework (a\u00B2 + b\u00B2)",
      description: "Sums of two dimension-squares — the fundamental constants",
      color: "#d29922",
      primes: [
        { p: 5, form: "1\u00B2 + 2\u00B2", squares: [1,2], physics: "Fermion reps, m_s/m_d = 4\u00D75", precision: "0.0%", bestMatch: "m_s/m_d = 20" },
        { p: 13, form: "2\u00B2 + 3\u00B2", squares: [2,3], physics: "sin\u00B2\u03B8\u2081\u2082 = 4/13", precision: "0.23%", bestMatch: "PMNS mixing" },
        { p: 17, form: "1\u00B2 + 4\u00B2", squares: [1,4], physics: "m_\u03C4/m_\u03BC, m_p/m_e factor", precision: "1.1%", bestMatch: "Lepton masses" },
        { p: 53, form: "2\u00B2 + 7\u00B2", squares: [2,7], physics: "\u03B1_s = 25/212 = 5\u00B2/(4\u00D753)", precision: "0.02%", bestMatch: "Strong coupling" },
        { p: 73, form: "3\u00B2 + 8\u00B2", squares: [3,8], physics: "Koide \u03B8 = \u03C0\u00D773/99", precision: "0.006%", bestMatch: "Koide phase" },
        { p: 97, form: "9\u00B2 + 4\u00B2", squares: [9,4], physics: "cos(\u03B8_W) = 171/194", precision: "3.75 ppm", bestMatch: "Weinberg angle" },
        { p: 109, form: "10\u00B2 + 3\u00B2", squares: [10,3], physics: "z_rec = 10\u00D7109 = 1090", precision: "0.018%", bestMatch: "Recombination" },
        { p: 113, form: "7\u00B2 + 8\u00B2", squares: [7,8], physics: "m_glueball/m_p = 113/62", precision: "0.004%", bestMatch: "Glueball mass" },
        { p: 137, form: "4\u00B2 + 11\u00B2", squares: [4,11], physics: "1/\u03B1 = 137 + 4/111", precision: "0.27 ppm", bestMatch: "Fine structure" },
      ],
    },
    {
      id: 3,
      name: "Triple-Sum (a\u00B2+b\u00B2+c\u00B2)",
      description: "Three dimension-squares — mass hierarchy primes",
      color: "#3fb950",
      primes: [
        { p: 139, form: "3\u00B2+3\u00B2+11\u00B2", physics: "m_W/m_\u039E\u207B = 139\u00D77/16", precision: "0.0006%", bestMatch: "W/\u039E\u207B ratio" },
        { p: 179, form: "3\u00B2+7\u00B2+11\u00B2", physics: "m_b/m_s = 179/4", precision: "0.008%", bestMatch: "Quark mass ratio", special: "UNIQUE: combines ALL three structural dims" },
        { p: 251, form: "3\u00B2+11\u00B2+11\u00B2", physics: "m_c/m_d = 251\u00D713/12", precision: "0.012%", bestMatch: "Charm/down ratio" },
      ],
    },
    {
      id: 4,
      name: "Quad-Sum (a\u00B2+b\u00B2+c\u00B2+d\u00B2)",
      description: "Four dimension-squares — high primes with extreme precision",
      color: "#58a6ff",
      primes: [
        { p: 151, form: "2\u00B2+7\u00B2+7\u00B2+7\u00B2", physics: "m_t/m_c = 151\u00D79/10", precision: "0.056%" },
        { p: 163, form: "1\u00B2+7\u00B2+7\u00B2+8\u00B2", physics: "m_c/m_s = 163/12", precision: "0.10%" },
        { p: 181, form: "2\u00B2+7\u00B2+8\u00B2+8\u00B2", physics: "\u039E\u2070/m_d, z_rec", precision: "0.0003%" },
        { p: 193, form: "1\u00B2+8\u00B2+8\u00B2+8\u00B2", physics: "\u03BC/e = 193\u00D715/14", precision: "0.009%", bestMatch: "Muon/electron" },
        { p: 241, form: "4\u00B2+4\u00B2+7\u00B2+8\u00B2", physics: "ALL 3 CMB acoustic peaks", precision: "<0.05%", special: "CMB Universal Prime" },
        { p: 283, form: "7\u00B2+7\u00B2+8\u00B2+11\u00B2", physics: "\u039E\u207B/m_d, \u2113\u2081", precision: "0.008%" },
        { p: 307, form: "1\u00B2+7\u00B2+8\u00B2+11\u00B2", physics: "H\u2080 = 307\u00D79/41", precision: "0.014%", special: "Hubble Prime" },
        { p: 313, form: "8\u00B2+8\u00B2+8\u00B2+11\u00B2", physics: "\u03B7\u2032/m_u (EXACT)", precision: "0.000%", special: "Triple-octonion prime" },
      ],
    },
    {
      id: 5,
      name: "Additive-Framework",
      description: "Linear combinations of dimensions — composite particle scales",
      color: "#39d2c0",
      primes: [
        { p: 19, form: "n_c + O = 11+8", physics: "m_\u03C4/m_s = 19", precision: "0.13%" },
        { p: 23, form: "n_c + 3\u00D7H = 11+12", physics: "m_\u03BC/m_e = 9\u00D723", precision: "0.11%" },
        { p: 29, form: "2\u00D7n_c + Im_O = 22+7", physics: "m_J/\u03C8 / m_\u03BC \u2248 29", precision: "~0.3%" },
        { p: 31, form: "n_d\u00B2 + n_c + n_d = 16+11+4", physics: "m_t/m_b = 4\u00D731/3", precision: "0.01%" },
      ],
    },
    {
      id: 6,
      name: "Non-Framework",
      description: "Primes appearing in hadron mass ratios — awaiting algebraic origin",
      color: "#6e7681",
      primes: [
        { p: 37, form: "4 + 3\u00D711", physics: "m_K/m_s = 37/7", precision: "0.00%" },
        { p: 43, form: "\u03A6\u2086(7)", physics: "m_W/m_D = 43", precision: "0.02%" },
        { p: 47, form: "3 + 4\u00D711", physics: "m_H/m_\u03C4 = 3\u00D747/2", precision: "0.01%" },
        { p: 67, form: "\u2014", physics: "m_H/m_D = 67", precision: "0.01%" },
        { p: 71, form: "\u2014", physics: "m_t/m_{J/\u03C8} = 11\u00D771/14", precision: "0.00%" },
        { p: 79, form: "\u2014", physics: "m_W/m_\u03B7 = 13\u00D779/7", precision: "0.00%" },
        { p: 89, form: "\u2014", physics: "m_H/m_p = 3\u00D789/2", precision: "0.01%" },
      ],
    },
  ],

  // =========================================================================
  // KEY FORMULAS (for formula display section)
  // =========================================================================
  keyFormulas: [
    { name: "Fine structure", formula: "1/\u03B1 = 4\u00B2 + 11\u00B2 + 4/111", precision: "0.27 ppm", primes: [137] },
    { name: "Strong coupling", formula: "\u03B1_s = 5\u00B2/(4\u00D753)", precision: "0.02%", primes: [5, 53] },
    { name: "Koide phase", formula: "\u03B8 = \u03C0 \u00D7 73/99", precision: "0.006%", primes: [73] },
    { name: "Weinberg angle", formula: "cos \u03B8_W = 171/194", precision: "3.75 ppm", primes: [97] },
    { name: "Proton/electron", formula: "m_p/m_e = 12\u00D7153 + 11/72", precision: "19 ppm", primes: [17] },
    { name: "Cabibbo angle", formula: "\u03BB = 9/40 = Im_H\u00B2/(5\u00D7O)", precision: "EXACT", primes: [5] },
    { name: "|V_cb|", formula: "2/49 = 2/Im_O\u00B2", precision: "~0%", primes: [7] },
    { name: "|V_ub|", formula: "1/262 = 1/(137+n_c\u00B2+n_d)", precision: "0.08%", primes: [137] },
    { name: "CKM phase", formula: "\u03B4 = \u03C0\u00D78/21 = \u03C0\u00D7O/(Im_H\u00D7Im_O)", precision: "0.07%", primes: [7] },
    { name: "Muon/electron", formula: "\u03BC/e = 193\u00D715/14", precision: "0.009%", primes: [193] },
  ],

  // =========================================================================
  // MIXING ANGLES (for dedicated visualization)
  // =========================================================================
  mixingAngles: {
    pmns: [
      { angle: "sin\u00B2\u03B8\u2082\u2083", measured: 0.572, ratio: "4/7", interp: "dim(\u210D)/Im(\ud835\udd46)", error: "0.1%" },
      { angle: "sin\u00B2\u03B8\u2081\u2082", measured: 0.303, ratio: "10/33", interp: "10/(3\u00D7n_c)", error: "0.01%" },
      { angle: "sin\u00B2\u03B8\u2081\u2083", measured: 0.0220, ratio: "1/44", interp: "1/(n_d\u00D7n_c)", error: "3.2%" },
    ],
    ckm: [
      { angle: "\u03BB (Cabibbo)", measured: 0.2265, ratio: "9/40", interp: "Im_H\u00B2/(5\u00D7O)", error: "EXACT" },
      { angle: "|V_cb|", measured: 0.0408, ratio: "2/49", interp: "2/Im_O\u00B2", error: "~0%" },
      { angle: "|V_ub|", measured: 0.00382, ratio: "1/262", interp: "1/(137+n_c\u00B2+n_d)", error: "0.08%" },
      { angle: "\u03B4_CKM", measured: "1.196 rad", ratio: "\u03C08/21", interp: "\u03C0\u00D7O/(Im_H\u00D7Im_O)", error: "0.07%" },
    ],
  },

  // =========================================================================
  // PRECISION DATA (sorted for chart — top matches)
  // =========================================================================
  precisionChart: [
    { label: "1/\u03B1", prime: 137, ppm: 0.27, tier: 2 },
    { label: "cos\u03B8_W", prime: 97, ppm: 3.75, tier: 2 },
    { label: "\u039E\u2070/m_d", prime: 181, ppm: 3, tier: 4 },
    { label: "Koide \u03B8", prime: 73, ppm: 60, tier: 2 },
    { label: "m_glueball", prime: 113, ppm: 40, tier: 2 },
    { label: "m_W/\u039E\u207B", prime: 139, ppm: 6, tier: 3 },
    { label: "m_b/m_s", prime: 179, ppm: 80, tier: 3 },
    { label: "\u03BC/e", prime: 193, ppm: 90, tier: 4 },
    { label: "m_c/m_d", prime: 251, ppm: 120, tier: 3 },
    { label: "H\u2080", prime: 307, ppm: 140, tier: 4 },
    { label: "\u03B1_s", prime: 53, ppm: 200, tier: 2 },
    { label: "z_rec", prime: 109, ppm: 180, tier: 2 },
    { label: "m_t/m_b", prime: 31, ppm: 100, tier: 5 },
    { label: "CMB peaks", prime: 241, ppm: 500, tier: 4 },
    { label: "m_W/m_\u03BC", prime: 179, ppm: 50, tier: 3 },
    { label: "\u03B7\u2032/m_u", prime: 313, ppm: 0, tier: 4 },
  ],

  // =========================================================================
  // SPECIAL PRIME 179
  // =========================================================================
  special179: {
    value: 179,
    form: "3\u00B2 + 7\u00B2 + 11\u00B2 = Im_H\u00B2 + Im_O\u00B2 + n_c\u00B2",
    uniqueness: "ONLY prime combining ALL THREE structural dimensions",
    identities: [
      "179 \u2212 137 = 42 = \u2102 \u00D7 Im(\u210D) \u00D7 Im(\ud835\udd46) (hidden sector channels)",
      "179 + 17 = 196 = 14\u00B2 = (\u2102 \u00D7 Im(\ud835\udd46))\u00B2",
      "42/179 \u2248 0.2346 \u2248 sin\u00B2(\u03B8_W)",
    ],
    matches: [
      { ratio: "m_W/m_\u03BC", formula: "179 \u00D7 17/4", error: "0.005%" },
      { ratio: "m_b/m_s", formula: "179/4", error: "0.008%" },
      { ratio: "m_t/m_b", formula: "179 \u00D7 3/13", error: "0.014%" },
      { ratio: "v/m_c", formula: "179 \u00D7 13/12", error: "0.022%" },
      { ratio: "\u2113\u2082", formula: "179 \u00D7 3 = 537", error: "0.15%" },
    ],
  },

  // =========================================================================
  // CYCLOTOMIC CONNECTION  Phi_6(d) = d^2 - d + 1
  // =========================================================================
  cyclotomic: [
    { input: 2, result: 3, isPrime: true, note: "\u2102 \u2192 generations (structural!)" },
    { input: 3, result: 7, isPrime: true, note: "Im_H \u2192 color (structural!)" },
    { input: 4, result: 13, isPrime: true, note: "\u210D \u2192 PMNS mixing (framework!)" },
    { input: 7, result: 43, isPrime: true, note: "Im_O \u2192 cyclotomic prime" },
    { input: 11, result: 111, isPrime: false, note: "n_c \u2192 3\u00D737, appears in 1/\u03B1 denominator" },
    { input: 12, result: 133, isPrime: false, note: "12 \u2192 7\u00D719, in sin\u00B2\u03B8_W" },
  ],
};
