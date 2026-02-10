import { useState, useCallback } from 'react';
import type { FC } from 'react';

// --- Data ---

interface Algebra {
  symbol: string;
  name: string;
  dim: number;
  imDim: number;
  commutative: boolean;
  associative: boolean;
  color: string;
  borderColor: string;
  textColor: string;
  analogy: string;
  physicsRole: string;
  force: string | null;
  gaugeGroup: string | null;
}

const ALGEBRAS: Algebra[] = [
  {
    symbol: 'R', name: 'Real Numbers', dim: 1, imDim: 0,
    commutative: true, associative: true,
    color: 'bg-gray-800', borderColor: 'border-gray-500', textColor: 'text-gray-300',
    analogy: 'The number line',
    physicsRole: 'Scalars — the "canvas" on which everything is painted',
    force: null, gaugeGroup: null,
  },
  {
    symbol: 'C', name: 'Complex Numbers', dim: 2, imDim: 1,
    commutative: true, associative: true,
    color: 'bg-blue-950', borderColor: 'border-blue-500', textColor: 'text-blue-300',
    analogy: 'Points on a plane',
    physicsRole: 'Source of U(1) symmetry',
    force: 'Electromagnetism', gaugeGroup: 'U(1)',
  },
  {
    symbol: 'H', name: 'Quaternions', dim: 4, imDim: 3,
    commutative: false, associative: true,
    color: 'bg-emerald-950', borderColor: 'border-emerald-500', textColor: 'text-emerald-300',
    analogy: 'Rotations in 3D space',
    physicsRole: 'Spacetime (4D, associative) + SU(2) symmetry',
    force: 'Weak force', gaugeGroup: 'SU(2)',
  },
  {
    symbol: 'O', name: 'Octonions', dim: 8, imDim: 7,
    commutative: false, associative: false,
    color: 'bg-purple-950', borderColor: 'border-purple-500', textColor: 'text-purple-300',
    analogy: 'An exotic 8-dimensional algebra',
    physicsRole: 'Source of SU(3) symmetry',
    force: 'Strong force', gaugeGroup: 'SU(3)',
  },
];

// Number coherence: where each key integer appears
interface NumberAppearance {
  label: string;
  formula: string;
  context: string;
}

const NUMBER_MAP: Record<number, NumberAppearance[]> = {
  1: [
    { label: 'dim(R)', formula: 'dim(R) = 1', context: 'Smallest division algebra' },
    { label: 'Im(C)', formula: 'Im(C) = 1', context: 'Imaginary dimension of complex numbers' },
  ],
  2: [
    { label: 'dim(C)', formula: 'dim(C) = 2', context: 'Complex number dimension' },
  ],
  3: [
    { label: 'Im(H)', formula: 'Im(H) = 3', context: 'Imaginary quaternion dimensions (i, j, k)' },
    { label: 'Forces', formula: '3 gauge groups', context: 'U(1) x SU(2) x SU(3) — three forces' },
    { label: 'Generations', formula: '3 fermion generations', context: 'From Im(H) tensor decomposition' },
  ],
  4: [
    { label: 'dim(H)', formula: 'dim(H) = 4', context: 'Quaternion dimension' },
    { label: 'Spacetime', formula: 'n_d = 4', context: 'Spacetime dimensions (3+1)' },
    { label: 'In 137', formula: '4^2 = 16', context: 'Contributes to 137 = 16 + 121' },
    { label: 'In 28', formula: '4 x 7 = 28', context: 'Goldstone boson count' },
  ],
  7: [
    { label: 'Im(O)', formula: 'Im(O) = 7', context: 'Imaginary octonion dimensions' },
    { label: 'In 28', formula: '4 x 7 = 28', context: 'Goldstone boson count' },
  ],
  8: [
    { label: 'dim(O)', formula: 'dim(O) = 8', context: 'Octonion dimension — the largest' },
  ],
  11: [
    { label: 'Crystal dim', formula: 'n_c = 1 + 3 + 7 = 11', context: 'Sum of all imaginary dimensions' },
    { label: 'In 121', formula: '11^2 = 121', context: 'Endomorphism algebra dimension' },
    { label: 'In 137', formula: '4^2 + 11^2 = 137', context: 'Fine structure constant integer part' },
    { label: 'Cyclotomic', formula: 'Phi_6(11) = 111', context: 'Appears in alpha denominator' },
  ],
  28: [
    { label: 'Goldstone', formula: '4 x 7 = 28', context: 'Goldstone boson count in SSB' },
    { label: 'Non-norm', formula: 'Not a^2 + b^2', context: 'Not a Gaussian norm — inert in Z[i]' },
  ],
  121: [
    { label: 'End(V)', formula: '11^2 = 121', context: 'Endomorphism algebra dimension' },
    { label: 'In Weinberg', formula: 'sin^2(theta_W) = 28/121', context: 'Weinberg angle denominator' },
    { label: 'In 137', formula: '137 = 16 + 121', context: 'Fine structure constant decomposition' },
  ],
  137: [
    { label: 'Alpha', formula: '4^2 + 11^2 = 137', context: 'Integer part of 1/alpha' },
    { label: 'Bridge prime', formula: '137 = n_d^2 + n_c^2', context: 'Connects spacetime (4) to crystal (11)' },
    { label: 'Gaussian norm', formula: 'N(4 + 11i) = 137', context: 'Norm in Z[i]' },
  ],
};

const HIGHLIGHT_NUMBERS = [1, 2, 3, 4, 7, 8, 11, 28, 121, 137];

// --- Component ---

const DivisionAlgebraVisualizer: FC = () => {
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [expandedAlgebra, setExpandedAlgebra] = useState<string | null>(null);

  const isHighlighted = useCallback((n: number) => activeNumber === n, [activeNumber]);

  const numClass = useCallback((n: number, base?: string) => {
    const active = activeNumber === n;
    return `${base || ''} cursor-pointer transition-all duration-150 ${
      active
        ? 'text-brand-400 font-bold scale-110 bg-brand-600/20 rounded px-1'
        : activeNumber !== null
          ? 'opacity-40'
          : 'hover:text-brand-400'
    }`;
  }, [activeNumber]);

  const handleNumClick = useCallback((n: number) => {
    setActiveNumber(prev => prev === n ? null : n);
  }, []);

  return (
    <div className="space-y-12">

      {/* ===== Section 1: The Four Algebras ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">The Four Division Algebras</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          A division algebra is a number system where you can always divide — no two nonzero elements
          multiply to zero. Mathematics proves exactly four exist. These aren't chosen; they're the
          only ones possible.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALGEBRAS.map(a => (
            <div
              key={a.symbol}
              className={`${a.color} border ${a.borderColor} rounded-xl p-5 transition-all cursor-pointer ${
                expandedAlgebra === a.symbol ? 'ring-2 ring-brand-500/50' : 'hover:ring-1 hover:ring-gray-600'
              }`}
              onClick={() => setExpandedAlgebra(expandedAlgebra === a.symbol ? null : a.symbol)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-3xl font-bold ${a.textColor}`}>{a.symbol}</span>
                <span
                  className={numClass(a.dim, 'text-2xl font-mono font-bold')}
                  onClick={e => { e.stopPropagation(); handleNumClick(a.dim); }}
                >
                  {a.dim}D
                </span>
              </div>

              <div className="text-sm text-gray-300 font-medium mb-1">{a.name}</div>
              <div className="text-xs text-gray-500 mb-3">{a.analogy}</div>

              {/* Properties */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  a.commutative
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {a.commutative ? 'commutative' : 'non-commutative'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  a.associative
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {a.associative ? 'associative' : 'non-associative'}
                </span>
              </div>

              {/* Imaginary dimension */}
              <div className="text-xs text-gray-500">
                Imaginary dimensions:{' '}
                <span
                  className={numClass(a.imDim, 'font-mono font-semibold')}
                  onClick={e => { e.stopPropagation(); handleNumClick(a.imDim); }}
                >
                  {a.imDim}
                </span>
              </div>

              {/* Expanded details */}
              {expandedAlgebra === a.symbol && (
                <div className="mt-4 pt-3 border-t border-gray-700 space-y-2 text-sm">
                  <div className="text-gray-400">{a.physicsRole}</div>
                  {a.force && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Force:</span>
                      <span className={a.textColor}>{a.force}</span>
                      <span className="text-xs text-gray-600 font-mono">({a.gaugeGroup})</span>
                    </div>
                  )}
                  {a.symbol === 'H' && (
                    <div className="text-xs text-gray-500 mt-1">
                      The quaternions do double duty: their dimension gives spacetime (4D),
                      and their imaginary part (3D) gives the weak force SU(2).
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Section 2: The Dimension Tree ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">How the Numbers Combine</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          The dimensions {'{'}1, 2, 4, 8{'}'} and their imaginary parts {'{'}0, 1, 3, 7{'}'} combine
          to produce every key integer in the framework. No numbers are chosen — they all trace
          back to the algebras.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          {/* Crystal dimension */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-gray-500 text-sm w-40 shrink-0">Crystal dimension</div>
            <div className="flex items-center gap-1 text-lg font-mono flex-wrap">
              <span className="text-gray-500">n_c =</span>
              <span className={numClass(1, '')} onClick={() => handleNumClick(1)}>1</span>
              <span className="text-gray-600">+</span>
              <span className={numClass(3, '')} onClick={() => handleNumClick(3)}>3</span>
              <span className="text-gray-600">+</span>
              <span className={numClass(7, '')} onClick={() => handleNumClick(7)}>7</span>
              <span className="text-gray-600">=</span>
              <span className={numClass(11, 'text-white')} onClick={() => handleNumClick(11)}>11</span>
            </div>
            <span className="text-xs text-gray-600 ml-2">Im(C) + Im(H) + Im(O)</span>
          </div>

          {/* Spacetime dimension */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-gray-500 text-sm w-40 shrink-0">Spacetime dimension</div>
            <div className="flex items-center gap-1 text-lg font-mono flex-wrap">
              <span className="text-gray-500">n_d =</span>
              <span className={numClass(4, 'text-white')} onClick={() => handleNumClick(4)}>4</span>
            </div>
            <span className="text-xs text-gray-600 ml-2">dim(H) — largest associative</span>
          </div>

          <div className="border-t border-gray-800 pt-4" />

          {/* Fine structure constant */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-gray-500 text-sm w-40 shrink-0">Fine structure constant</div>
            <div className="flex items-center gap-1 text-lg font-mono flex-wrap">
              <span className={numClass(137, 'text-white')} onClick={() => handleNumClick(137)}>137</span>
              <span className="text-gray-600">=</span>
              <span className={numClass(4, '')} onClick={() => handleNumClick(4)}>4</span>
              <span className="text-gray-600 text-sm align-super">2</span>
              <span className="text-gray-600">+</span>
              <span className={numClass(11, '')} onClick={() => handleNumClick(11)}>11</span>
              <span className="text-gray-600 text-sm align-super">2</span>
              <span className="text-gray-600">=</span>
              <span className="text-gray-500">16 + 121</span>
            </div>
            <span className="text-xs text-gray-600 ml-2">n_d^2 + n_c^2</span>
          </div>

          {/* Endomorphism */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-gray-500 text-sm w-40 shrink-0">Endomorphism algebra</div>
            <div className="flex items-center gap-1 text-lg font-mono flex-wrap">
              <span className={numClass(121, 'text-white')} onClick={() => handleNumClick(121)}>121</span>
              <span className="text-gray-600">=</span>
              <span className={numClass(11, '')} onClick={() => handleNumClick(11)}>11</span>
              <span className="text-gray-600 text-sm align-super">2</span>
            </div>
            <span className="text-xs text-gray-600 ml-2">n_c^2 — appears in Weinberg angle</span>
          </div>

          {/* Goldstone count */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="text-gray-500 text-sm w-40 shrink-0">Goldstone bosons</div>
            <div className="flex items-center gap-1 text-lg font-mono flex-wrap">
              <span className={numClass(28, 'text-white')} onClick={() => handleNumClick(28)}>28</span>
              <span className="text-gray-600">=</span>
              <span className={numClass(4, '')} onClick={() => handleNumClick(4)}>4</span>
              <span className="text-gray-600">x</span>
              <span className={numClass(7, '')} onClick={() => handleNumClick(7)}>7</span>
            </div>
            <span className="text-xs text-gray-600 ml-2">n_d x Im(O)</span>
          </div>
        </div>
      </section>

      {/* ===== Section 3: The Physics Map ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">From Algebra to Physics</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Each division algebra's symmetry group corresponds to a fundamental force. The connection
          between division algebras and gauge groups is explored by several professional physicists
          (Furey, Dixon, and others). Here, we push further to derive numerical constants.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* EM */}
          <div className="bg-blue-950/50 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-blue-300">C</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm font-mono text-blue-400">U(1)</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm text-blue-300">Electromagnetism</span>
            </div>
            <p className="text-xs text-gray-400">
              The complex numbers have a single imaginary direction. Rotating in
              that direction gives U(1) — the gauge symmetry of electromagnetism.
              This is why electric charge is described by a single number.
            </p>
          </div>

          {/* Weak */}
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-emerald-300">H</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm font-mono text-emerald-400">SU(2)</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm text-emerald-300">Weak Force</span>
            </div>
            <p className="text-xs text-gray-400">
              The quaternions have three imaginary directions (i, j, k). Rotations among
              these give SU(2) — the gauge symmetry of the weak force. This is why the
              weak force has three carriers (W+, W-, Z).
            </p>
          </div>

          {/* Strong */}
          <div className="bg-purple-950/50 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-purple-300">O</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm font-mono text-purple-400">SU(3)</span>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-sm text-purple-300">Strong Force</span>
            </div>
            <p className="text-xs text-gray-400">
              The octonions have seven imaginary directions. Their automorphism group
              contains SU(3) — the gauge symmetry of the strong force. This is why
              quarks come in three "colors."
            </p>
          </div>
        </div>

        {/* Spacetime explanation */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-emerald-300">H</span>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-sm text-white">4D Spacetime</span>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl">
            Why 4 dimensions? Time evolution must be associative — grouping sequential events
            differently can't change the outcome. The quaternions are the largest associative
            division algebra, so spacetime gets 4 dimensions. The non-associative octonions
            describe internal symmetries instead.
          </p>
        </div>
      </section>

      {/* ===== Section 4: Number Coherence ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Number Coherence</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          The same small set of integers appears everywhere. Click any number below to see
          all the places it shows up. This coherence — the same numbers reappearing in
          different contexts — is the framework's central structural claim.
        </p>

        {/* Number pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {HIGHLIGHT_NUMBERS.map(n => (
            <button
              key={n}
              onClick={() => handleNumClick(n)}
              className={`px-4 py-2 rounded-lg border font-mono font-bold text-sm transition-all cursor-pointer ${
                activeNumber === n
                  ? 'bg-brand-600/20 border-brand-500/50 text-brand-400 ring-2 ring-brand-500/30'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
          {activeNumber !== null && (
            <button
              onClick={() => setActiveNumber(null)}
              className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Appearances panel */}
        {activeNumber !== null && NUMBER_MAP[activeNumber] && (
          <div className="bg-gray-900 border border-brand-600/30 rounded-xl p-5 animate-in">
            <h3 className="text-lg font-bold text-brand-400 font-mono mb-4">
              {activeNumber}
              <span className="text-sm font-normal text-gray-400 ml-3">
                appears in {NUMBER_MAP[activeNumber].length} context{NUMBER_MAP[activeNumber].length !== 1 ? 's' : ''}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NUMBER_MAP[activeNumber].map((app, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                  <div className="text-sm font-semibold text-white mb-1">{app.label}</div>
                  <div className="text-xs font-mono text-brand-300 mb-1">{app.formula}</div>
                  <div className="text-xs text-gray-500">{app.context}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNumber === null && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              Click any number above to see where it appears across the framework.
            </p>
          </div>
        )}
      </section>

      {/* ===== The Core Claim ===== */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">The Core Claim</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          The four division algebras {'{'}R, C, H, O{'}'} with dimensions {'{'}1, 2, 4, 8{'}'}
          generate all the structure of the Standard Model: spacetime dimension (4),
          gauge group (U(1) x SU(2) x SU(3)), fermion content, and numerical constants
          like the fine structure constant (1/137...) and the Weinberg angle
          (sin^2 = 28/121). No free parameters — every number traces back to
          these four algebras.
        </p>
        <p className="text-xs text-gray-600 mt-3">
          This is a speculative framework, not established physics. The mathematical connections
          are genuine; the physical interpretation is what needs external scrutiny.
        </p>
      </section>
    </div>
  );
};

export default DivisionAlgebraVisualizer;
