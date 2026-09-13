import { useState, useCallback } from 'react';
import type { FC } from 'react';

// --- Tower Level Data ---

interface TowerLevel {
  level: number;
  label: string;
  startDim: number;
  rank: number;
  rankAlgebra: string;
  gapDim: number;
  gapAlgebra: string;
  color: string;
  borderColor: string;
  description: string;
  accessible: string;
  hidden: string;
}

const TOWER_LEVELS: TowerLevel[] = [
  {
    level: 0, label: 'Level 0: The Crystal',
    startDim: 11, rank: 4, rankAlgebra: 'dim(H)',
    gapDim: 7, gapAlgebra: 'Im(O)',
    color: 'bg-purple-950/50', borderColor: 'border-purple-500/40',
    description: 'Start with the full 11-dimensional crystal V. Apply a perspective of rank 4 (quaternion dimension). The gap — what perspective cannot see — has 7 dimensions: the imaginary octonions.',
    accessible: '4 dimensions accessible (spacetime)',
    hidden: '7 dimensions hidden (Im(O) — octonion imaginaries)',
  },
  {
    level: 1, label: 'Level 1: The First Blind Spot',
    startDim: 7, rank: 4, rankAlgebra: 'dim(H)',
    gapDim: 3, gapAlgebra: 'Im(H)',
    color: 'bg-emerald-950/50', borderColor: 'border-emerald-500/40',
    description: 'The 7-dimensional gap can itself be examined by a new perspective. Apply rank 4 again (Frobenius + maximality). The new gap has 3 dimensions: the imaginary quaternions.',
    accessible: '4 dimensions accessible',
    hidden: '3 dimensions hidden (Im(H) — quaternion imaginaries)',
  },
  {
    level: 2, label: 'Level 2: The Second Blind Spot',
    startDim: 3, rank: 2, rankAlgebra: 'dim(C)',
    gapDim: 1, gapAlgebra: 'Im(C)',
    color: 'bg-blue-950/50', borderColor: 'border-blue-500/40',
    description: 'The 3-dimensional gap admits one more perspective. Rank 4 exceeds dim-1=2, so the maximum valid rank is 2 (complex dimension). The final gap has 1 dimension: the imaginary complex numbers.',
    accessible: '2 dimensions accessible',
    hidden: '1 dimension hidden (Im(C) — the imaginary unit i)',
  },
];

const TERMINAL = {
  label: 'Terminal: Im(C)',
  dim: 1,
  color: 'bg-red-950/50',
  borderColor: 'border-red-500/40',
  description: 'Dimension 1 is below the threshold for perspective (Corollary 1.8: need dim >= 2). No further examination is possible. This single direction — Im(C), spanned by the imaginary unit i — is permanently inaccessible.',
};

// --- Im(C) Property Data ---

interface ImCProperty {
  id: number;
  name: string;
  shortName: string;
  statement: string;
  proof: string;
  physics: string;
  color: string;
}

const IMC_PROPERTIES: ImCProperty[] = [
  {
    id: 1, name: 'Half-Negation', shortName: 'i^2 = -1',
    statement: 'The element i is the square root of negation. Its powers form the cyclic group Z_4 = {1, i, -1, -i}. Two applications of i produce negation; four return to identity.',
    proof: 'Direct computation: i^1 = i, i^2 = -1, i^3 = -i, i^4 = 1. The equation z^2 = -1 has exactly two solutions in C: {i, -i}.',
    physics: 'Every quantum transition e^{-iHt} passes through this intermediate. The factor i mediates between identity (do nothing) and reversal (negate).',
    color: 'text-red-400',
  },
  {
    id: 2, name: 'Self-Ejection', shortName: 'Im x Im -> Re',
    statement: 'The product of two imaginary numbers is real: (ai)(bi) = -ab. Im(C) is not closed under its own multiplication — it ejects itself into Re(C).',
    proof: '(ai)(bi) = ab * i^2 = ab * (-1) = -ab. The result is real. The imaginary part of the product is zero.',
    physics: 'This is the algebraic core of the Born rule: |psi|^2 = psi-bar * psi maps complex amplitudes to real probabilities via Im x Im -> Re.',
    color: 'text-orange-400',
  },
  {
    id: 3, name: 'Z_2 Indistinguishability', shortName: 'i ~ -i',
    statement: 'The elements i and -i satisfy the same minimal polynomial x^2 + 1 = 0. No real-coefficient polynomial can tell them apart: Re(p(i)) = Re(p(-i)) for all real polynomials p.',
    proof: 'p(i) and p(-i) = p(i-bar) = p(i)-bar are complex conjugates (since p has real coefficients). Conjugates have equal real parts.',
    physics: 'Even if perspective could access Im(C), it would find an intrinsic two-fold ambiguity. This is algebraic, not a measurement limitation.',
    color: 'text-yellow-400',
  },
  {
    id: 4, name: 'Phase Unitarity', shortName: '|e^{i*theta}| = 1',
    statement: 'The exponential of Im(C) has unit norm always: |e^{i*theta}|^2 = cos^2(theta) + sin^2(theta) = 1. Absolute phase is invisible to any magnitude measurement.',
    proof: 'e^{i*theta} * e^{-i*theta} = e^0 = 1. The conjugate of e^{i*theta} is e^{-i*theta}, so |e^{i*theta}|^2 = 1.',
    physics: 'Relative phase IS observable: |e^{i*theta_1} + e^{i*theta_2}|^2 = 2 + 2cos(theta_1 - theta_2). This is quantum interference. Im(C) operates entirely through differences.',
    color: 'text-emerald-400',
  },
  {
    id: 5, name: 'Lie Algebra Generation', shortName: 'Im(C) -> U(1)',
    statement: 'The exponential map exp: Im(C) -> U(1) wraps the real line onto the circle group. The Lie algebra u(1) = Im(C). The fundamental group pi_1(U(1)) = Z (integer winding numbers).',
    proof: 'e^{2*pi*i} = 1 (full winding = identity), e^{pi*i} = -1 (Euler), e^{pi*i/2} = i (quarter turn). The tangent space to U(1) at the identity is iR.',
    physics: 'Topology forces discreteness from continuous wrapping: winding numbers are integers. This is the mathematical origin of charge quantization.',
    color: 'text-blue-400',
  },
];

// --- Epistemic Classification ---

interface EpistemicItem {
  label: string;
  name: string;
  confidence: 'theorem' | 'derivation' | 'conjecture';
}

const EPISTEMIC_ITEMS: EpistemicItem[] = [
  { label: 'P.1', name: 'Symmetry Breaking', confidence: 'theorem' },
  { label: 'THM_04B0', name: 'All 512 towers terminate at dim=1', confidence: 'theorem' },
  { label: '3.2-3.6', name: 'Five properties of Im(C)', confidence: 'theorem' },
  { label: 'THM_04B1', name: 'Permanent inaccessibility + necessity', confidence: 'theorem' },
  { label: '4.5', name: 'Non-removability (all-or-nothing)', confidence: 'theorem' },
  { label: '2.6', name: 'Division algebra cascade (rank selection)', confidence: 'derivation' },
  { label: 'THM_04B2', name: 'The seed: Im(C) + CCP forces n_c=11', confidence: 'derivation' },
  { label: '2.13', name: 'Top-down = bottom-up identification', confidence: 'derivation' },
  { label: 'Tower B', name: 'Infinite meta-theory tower (Godel)', confidence: 'conjecture' },
  { label: '2.12', name: 'Maximality at meta-levels', confidence: 'conjecture' },
];

const CONFIDENCE_STYLES = {
  theorem: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'THEOREM' },
  derivation: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'DERIVATION' },
  conjecture: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'CONJECTURE' },
};

// --- Component ---

const PerspectiveMathExplorer: FC = () => {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [activeProperty, setActiveProperty] = useState<number | null>(null);
  const [towerStep, setTowerStep] = useState(3); // 0-3 for animation steps; start fully expanded

  const stepForward = useCallback(() => setTowerStep(s => Math.min(s + 1, 3)), []);
  const stepBack = useCallback(() => setTowerStep(s => Math.max(s - 1, 0)), []);
  const resetTower = useCallback(() => setTowerStep(0), []);

  return (
    <div className="space-y-12">

      {/* ===== Section 1: Tower Cascade Visualizer ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">The Recursive Gap Tower</h2>
        <p className="text-gray-400 text-sm mb-2 max-w-3xl">
          A perspective on an 11-dimensional space sees 4 dimensions and misses 7.
          But that 7-dimensional blind spot can itself be examined by a new perspective,
          producing a smaller blind spot. This recursion terminates when the gap shrinks
          to dimension 1 — too small for any perspective to exist.
        </p>
        <p className="text-gray-500 text-xs mb-6">
          Step through the cascade, or click any level for details. All 512 possible towers from dim=11
          terminate at gap dimension 1. The specific cascade 7 -&gt; 3 -&gt; 1 traces the imaginary
          parts of the division algebras in reverse.
        </p>

        {/* Step controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={resetTower}
            className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={stepBack}
            disabled={towerStep === 0}
            className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={stepForward}
            disabled={towerStep === 3}
            className="px-3 py-1.5 rounded-lg text-xs bg-brand-600/20 border border-brand-500/50 text-brand-400 hover:bg-brand-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Next Level
          </button>
          <span className="text-xs text-gray-600 ml-2">
            Step {towerStep}/3
          </span>
        </div>

        {/* Tower visualization */}
        <div className="space-y-3">
          {TOWER_LEVELS.map((level, idx) => {
            const visible = idx < towerStep;
            if (!visible) return null;
            const expanded = activeLevel === idx;

            return (
              <div
                key={level.level}
                className={`${level.color} border ${level.borderColor} rounded-xl p-5 transition-all cursor-pointer ${
                  expanded ? 'ring-2 ring-brand-500/30' : 'hover:ring-1 hover:ring-gray-600'
                }`}
                onClick={() => setActiveLevel(expanded ? null : idx)}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="text-white font-semibold text-sm">{level.label}</div>
                  <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
                    <span className="text-gray-400">dim</span>
                    <span className="text-white font-bold text-lg">{level.startDim}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-brand-400">{level.rank}</span>
                    <span className="text-gray-500 text-xs">({level.rankAlgebra})</span>
                    <span className="text-gray-600">=</span>
                    <span className="text-white font-bold text-lg">{level.gapDim}</span>
                    <span className="text-gray-500 text-xs">({level.gapAlgebra})</span>
                  </div>
                </div>

                {/* Dimension bar */}
                <div className="mt-3 flex h-4 rounded-full overflow-hidden bg-gray-900">
                  <div
                    className="bg-brand-600/40 border-r border-gray-800 transition-all duration-500"
                    style={{ width: `${(level.rank / level.startDim) * 100}%` }}
                    title={`Accessible: ${level.rank} dims`}
                  />
                  <div
                    className="bg-gray-700/40 transition-all duration-500"
                    style={{ width: `${(level.gapDim / level.startDim) * 100}%` }}
                    title={`Hidden: ${level.gapDim} dims`}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-brand-400">{level.accessible}</span>
                  <span className="text-gray-500">{level.hidden}</span>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="mt-4 pt-3 border-t border-gray-700 text-sm text-gray-400">
                    {level.description}
                  </div>
                )}
              </div>
            );
          })}

          {/* Terminal */}
          {towerStep === 3 && (
            <div className={`${TERMINAL.color} border ${TERMINAL.borderColor} rounded-xl p-5`}>
              <div className="flex items-center gap-3">
                <div className="text-red-400 font-semibold text-sm">{TERMINAL.label}</div>
                <span className="font-mono text-white font-bold text-lg">dim = 1</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30`}>
                  NO PERSPECTIVE POSSIBLE
                </span>
              </div>
              <div className="mt-2 h-4 rounded-full overflow-hidden bg-gray-900">
                <div className="bg-red-600/30 h-full w-full" />
              </div>
              <p className="mt-3 text-sm text-gray-400">
                {TERMINAL.description}
              </p>
            </div>
          )}

          {towerStep === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">
                Click "Next Level" to step through the recursive gap tower.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Start: V with dim = 11 (the full crystal)
              </p>
            </div>
          )}
        </div>

        {/* Summary equation */}
        {towerStep === 3 && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="font-mono text-sm text-gray-300">
              <span className="text-brand-400">4</span>
              <span className="text-gray-600"> + </span>
              <span className="text-brand-400">4</span>
              <span className="text-gray-600"> + </span>
              <span className="text-brand-400">2</span>
              <span className="text-gray-600"> + </span>
              <span className="text-red-400">1</span>
              <span className="text-gray-600"> = </span>
              <span className="text-white font-bold">11</span>
              <span className="text-gray-500 text-xs ml-3">(accessible + terminal = n_c)</span>
            </div>
            <div className="font-mono text-sm text-gray-300 mt-1">
              <span className="text-purple-400">7</span>
              <span className="text-gray-600"> + </span>
              <span className="text-emerald-400">3</span>
              <span className="text-gray-600"> + </span>
              <span className="text-blue-400">1</span>
              <span className="text-gray-600"> = </span>
              <span className="text-white font-bold">11</span>
              <span className="text-gray-500 text-xs ml-3">(Im(O) + Im(H) + Im(C) = n_c)</span>
            </div>
          </div>
        )}
      </section>

      {/* ===== Section 2: Five Properties of Im(C) ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">The Irreducible Element: Im(C)</h2>
        <p className="text-gray-400 text-sm mb-2 max-w-3xl">
          The tower terminates at a 1-dimensional subspace. It is not just "a copy of R" — it is
          Im(C), the imaginary axis of the complex numbers, carrying five independent algebraic
          properties. Each is verified computationally.
        </p>
        <p className="text-gray-500 text-xs mb-6">
          Click any property for its proof sketch and physical consequence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {IMC_PROPERTIES.map(prop => {
            const expanded = activeProperty === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => setActiveProperty(expanded ? null : prop.id)}
                className={`text-left bg-gray-900 border rounded-xl p-4 transition-all cursor-pointer ${
                  expanded
                    ? 'border-brand-500/50 ring-2 ring-brand-500/30'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className={`text-xs font-mono font-bold ${prop.color} mb-1`}>
                  Property {prop.id}
                </div>
                <div className="text-sm font-semibold text-white mb-1">{prop.name}</div>
                <div className="text-xs font-mono text-gray-500">{prop.shortName}</div>
              </button>
            );
          })}
        </div>

        {/* Expanded property detail */}
        {activeProperty !== null && (() => {
          const prop = IMC_PROPERTIES.find(p => p.id === activeProperty);
          if (!prop) return null;
          return (
            <div className="mt-4 bg-gray-900 border border-brand-600/30 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-lg font-bold ${prop.color}`}>Property {prop.id}: {prop.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  THEOREM
                </span>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Statement</div>
                  <div className="text-gray-300">{prop.statement}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Proof Sketch</div>
                  <div className="text-gray-400 font-mono text-xs bg-gray-950 rounded-lg p-3">{prop.proof}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Physical Consequence</div>
                  <div className="text-gray-300">{prop.physics}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {activeProperty === null && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">
              Click any property above to see its proof and physical consequence.
            </p>
          </div>
        )}
      </section>

      {/* ===== Section 3: The Paradox ===== */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">The Self-Knowledge Paradox</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            The mathematics establishes a precise paradox:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-gray-950 border border-red-500/20 rounded-lg p-4">
              <div className="text-red-400 font-semibold text-xs uppercase mb-2">Necessary</div>
              <p className="text-gray-400 text-xs">
                Without Im(C), unitarity, uncertainty, and interference all collapse simultaneously.
                No quantum mechanics is possible. Perspective cannot function.
              </p>
            </div>
            <div className="bg-gray-950 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-yellow-400 font-semibold text-xs uppercase mb-2">Inaccessible</div>
              <p className="text-gray-400 text-xs">
                Dimension 1 is below the threshold for perspective (need dim &gt;= 2).
                No perspective in any tower can examine Im(C). Structurally impossible.
              </p>
            </div>
            <div className="bg-gray-950 border border-purple-500/20 rounded-lg p-4">
              <div className="text-purple-400 font-semibold text-xs uppercase mb-2">Non-Removable</div>
              <p className="text-gray-400 text-xs">
                Removing Im(C) doesn't weaken the framework — it destroys it entirely.
                There is no intermediate state. All or nothing.
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs italic">
            The one direction perspective can never access is the one direction without which
            perspective cannot exist. This holds for all perspectives, all towers, all starting
            dimensions &gt;= 2.
          </p>
        </div>
      </section>

      {/* ===== Section 4: Epistemic Boundary ===== */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-2">Epistemic Boundary</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Not all results carry equal confidence. The framework explicitly classifies each claim.
          Theorems are computationally verified. Derivations have gaps. Conjectures are plausible
          but unproven. 185/185 tests PASS across 7 scripts.
        </p>

        <div className="space-y-2">
          {EPISTEMIC_ITEMS.map((item, i) => {
            const style = CONFIDENCE_STYLES[item.confidence];
            return (
              <div key={i} className={`flex items-center gap-3 ${style.bg} border ${style.border} rounded-lg px-4 py-2.5`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.bg} ${style.text} border ${style.border} shrink-0 w-24 text-center`}>
                  {style.label}
                </span>
                <span className="text-xs font-mono text-gray-500 shrink-0 w-20">{item.label}</span>
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
            );
          })}
        </div>

        {/* Hierarchy */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Confidence Hierarchy</div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
            <span className="text-emerald-400">Terminal gap has dim = 1</span>
            <span className="text-gray-600">{'>'}</span>
            <span className="text-yellow-400">Terminal gap is Im(C)</span>
            <span className="text-gray-600">{'>'}</span>
            <span className="text-yellow-400">Specific cascade is 7 -&gt; 3 -&gt; 1</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Each layer depends on all previous layers plus additional assumptions.
            The outermost claim is the most robust; the innermost is the most assumption-dependent.
          </p>
        </div>
      </section>

      {/* ===== Verification Summary ===== */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">Verification</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            185/185 PASS
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-950 rounded-lg p-3">
            <div className="text-gray-400 font-mono mb-1">recursive_gap_tower.py</div>
            <div className="text-emerald-400">38/38 PASS</div>
            <div className="text-gray-600">Tower, 512 paths, cascade</div>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <div className="text-gray-400 font-mono mb-1">imc_irreducible_element.py</div>
            <div className="text-emerald-400">67/67 PASS</div>
            <div className="text-gray-600">Five properties, seed</div>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <div className="text-gray-400 font-mono mb-1">imc_necessity_consequences.py</div>
            <div className="text-emerald-400">46/46 PASS</div>
            <div className="text-gray-600">QM necessity proofs</div>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <div className="text-gray-400 font-mono mb-1">+ 4 more scripts</div>
            <div className="text-emerald-400">34/34 PASS</div>
            <div className="text-gray-600">Evaluation, self-model, rank</div>
          </div>
        </div>
      </section>

      {/* ===== Disclaimer ===== */}
      <div className="text-xs text-gray-600 text-center">
        Speculative theoretical framework. Not peer-reviewed. Amateur work with AI assistance.
        The mathematical theorems are computationally verified; the physical interpretation is what needs external scrutiny.
      </div>
    </div>
  );
};

export default PerspectiveMathExplorer;
