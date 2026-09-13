import { useState, useMemo } from 'react';
import type { FC } from 'react';

interface Dimension { value: number; algebra: string; meaning: string }
interface PrimeTier { id: number; name: string; description: string; form: string }
interface FrameworkPrime {
  value: number; a: number; b: number; form: string;
  algebras: string; constant: string; formula: string; precision: string;
  physics: string; stage: number; note?: string;
}

interface Props {
  primes: {
    structural: { value: number; role: string; physics: string; status: string }[];
    framework: FrameworkPrime[];
    highPrimes: { value: number; form: string; dims: string; physics: string; precision: string; tier: number; note?: string }[];
    nonFramework: { value: number; form: string; physics: string; precision: string }[];
    mixingAngles: {
      pmns: { angle: string; value: string; meaning: string; precision: string }[];
      ckm: { angle: string; value: string; meaning: string; precision: string }[];
    };
    couplings: { name: string; formula: string; value: string; precision: string }[];
    masterPattern: string;
  };
  dimensions: Dimension[];
  primeTiers: PrimeTier[];
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

const STAGE: Record<number, { bg: string; border: string; text: string; labelBg: string }> = {
  1: { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-400', labelBg: 'bg-emerald-500/10' },
  2: { bg: 'bg-blue-950/60', border: 'border-blue-500/40', text: 'text-blue-400', labelBg: 'bg-blue-500/10' },
  3: { bg: 'bg-purple-950/60', border: 'border-purple-500/40', text: 'text-purple-400', labelBg: 'bg-purple-500/10' },
};

const PrimeTable: FC<Props> = ({ primes, dimensions, primeTiers }) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedPrime, setSelectedPrime] = useState<FrameworkPrime | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['framework']));

  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const frameworkMap = useMemo(() => {
    const m = new Map<number, FrameworkPrime>();
    for (const p of primes.framework) m.set(p.value, p);
    return m;
  }, [primes.framework]);

  const grid = useMemo(() =>
    dimensions.map((dRow, ri) =>
      dimensions.map((dCol, ci) => {
        const sum = dRow.value ** 2 + dCol.value ** 2;
        return { sum, prime: isPrime(sum), framework: frameworkMap.get(sum), ri, ci };
      })
    ), [dimensions, frameworkMap]);

  const SectionHeader = ({ id, title, count, desc }: { id: string; title: string; count?: number; desc: string }) => (
    <button onClick={() => toggle(id)}
      className="w-full flex items-center gap-3 py-3 text-left group cursor-pointer">
      <span className={`text-gray-500 transition-transform text-xs ${expanded.has(id) ? 'rotate-90' : ''}`}>&#9654;</span>
      <span className="text-white font-semibold text-sm">{title}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
      )}
      <span className="text-xs text-gray-600 hidden sm:inline flex-1 text-right">{desc}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Master Pattern */}
      <div className="bg-gray-900/80 border border-gray-700 rounded-xl px-5 py-3 text-center">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Master Pattern</span>
        <div className="text-white font-mono text-sm mt-1">{primes.masterPattern}</div>
      </div>

      {/* Tier overview */}
      <div className="flex flex-wrap gap-2">
        {primeTiers.map(t => (
          <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-white font-bold">Tier {t.id}</span>
            <span className="text-gray-500 ml-1.5">{t.name}</span>
            <span className="text-gray-600 ml-1.5 hidden sm:inline">({t.form})</span>
          </div>
        ))}
      </div>

      {/* ========== GRID ========== */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-[480px]">
          <div className="flex">
            <div className="w-20 shrink-0" />
            {dimensions.map(d => (
              <div key={d.value} className="flex-1 min-w-[56px] text-center pb-2">
                <div className="text-sm font-bold text-white">{d.value}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{d.algebra}</div>
              </div>
            ))}
          </div>
          {dimensions.map((dRow, ri) => (
            <div key={dRow.value} className="flex">
              <div className="w-20 shrink-0 flex items-center justify-end pr-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{dRow.value}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{dRow.algebra}</div>
                </div>
              </div>
              {grid[ri].map((cell, ci) => {
                const fw = cell.framework;
                const stage = fw ? STAGE[fw.stage] : null;
                const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                const isSelected = selectedPrime?.value === cell.sum;

                let bg = 'bg-gray-900/50', border = 'border-gray-800/50', text = 'text-gray-600';
                if (fw && stage) {
                  bg = stage.bg; border = stage.border; text = `${stage.text} font-bold`;
                } else if (cell.prime) {
                  bg = 'bg-brand-950/40'; border = 'border-brand-500/30'; text = 'text-brand-400 font-semibold';
                }
                if (isSelected) border += ' ring-1 ring-white/40';

                return (
                  <div key={ci}
                    className={`flex-1 min-w-[56px] aspect-square flex items-center justify-center
                      border ${border} ${bg} ${text} text-sm font-mono transition-all duration-100 relative
                      ${fw || cell.prime ? 'cursor-pointer hover:scale-105' : ''} ${isHovered ? 'z-10' : ''}`}
                    onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => fw && setSelectedPrime(prev => prev?.value === fw.value ? null : fw)}
                  >
                    {cell.sum}
                    {isHovered && (cell.prime || fw) && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20
                        bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 shadow-xl
                        min-w-[220px] text-left pointer-events-none">
                        <div className="text-white font-bold text-sm mb-1">
                          {cell.sum} = {dimensions[ri].value}&sup2; + {dimensions[ci].value}&sup2;
                        </div>
                        <div className="text-gray-400 text-xs">{dimensions[ri].algebra} + {dimensions[ci].algebra}</div>
                        {fw && (
                          <>
                            <div className={`text-xs font-semibold mt-1.5 ${stage?.text || 'text-white'}`}>{fw.constant}</div>
                            <div className="text-gray-500 text-[10px] mt-0.5">{fw.formula}</div>
                            <div className="text-gray-600 text-[10px] mt-1">Click for details</div>
                          </>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent
                          border-t-[6px] border-t-gray-700" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Grid legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-500/40" />
          <span>Stage 1 (early)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-950/60 border border-blue-500/40" />
          <span>Stage 2 (precision)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-950/60 border border-purple-500/40" />
          <span>Stage 3 (derived)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-900/50 border border-gray-800/50" />
          <span>Non-prime</span>
        </div>
      </div>

      {/* Selected prime detail card */}
      {selectedPrime && (() => {
        const s = STAGE[selectedPrime.stage] || STAGE[1];
        return (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`text-lg font-bold font-mono ${s.text}`}>{selectedPrime.value}</h3>
                <div className="text-sm text-gray-300">{selectedPrime.constant}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.labelBg} ${s.text} ${s.border}`}>
                  Stage {selectedPrime.stage}
                </span>
                <button onClick={() => setSelectedPrime(null)} className="text-gray-500 hover:text-white text-sm cursor-pointer">Close</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Decomposition</div>
                <div className="text-white font-mono">{selectedPrime.form}</div>
                <div className="text-gray-400 text-xs mt-0.5">{selectedPrime.algebras}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Formula</div>
                <div className="text-white">{selectedPrime.formula}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Physics</div>
                <div className="text-gray-300">{selectedPrime.physics}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Precision</div>
                <div className="text-emerald-400">{selectedPrime.precision}</div>
              </div>
            </div>
            {selectedPrime.note && (
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">{selectedPrime.note}</div>
            )}
          </div>
        );
      })()}

      {/* ========== EXPANDABLE SECTIONS ========== */}
      <div className="border-t border-gray-800 pt-2 space-y-0">

        {/* Structural Primes */}
        <div className="border-b border-gray-800/50">
          <SectionHeader id="structural" title="Tier 1: Structural Primes" count={primes.structural.length}
            desc="Primes that ARE division algebra dimensions" />
          {expanded.has('structural') && (
            <div className="pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {primes.structural.map(p => (
                <div key={p.value} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-2xl font-bold text-white font-mono">{p.value}</div>
                  <div className="text-xs text-brand-400 font-medium mt-1">{p.role}</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed">{p.physics}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Framework Primes */}
        <div className="border-b border-gray-800/50">
          <SectionHeader id="framework" title="Tier 2: Framework Primes" count={primes.framework.length}
            desc="All mapped to physical constants via a² + b²" />
          {expanded.has('framework') && (
            <div className="pb-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2 pr-2 font-medium">Prime</th>
                    <th className="text-left py-2 pr-2 font-medium">Form</th>
                    <th className="text-left py-2 pr-2 font-medium hidden sm:table-cell">Algebras</th>
                    <th className="text-left py-2 pr-2 font-medium">Constant</th>
                    <th className="text-left py-2 pr-2 font-medium hidden md:table-cell">Formula</th>
                    <th className="text-left py-2 pr-2 font-medium">Precision</th>
                    <th className="text-left py-2 font-medium">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {primes.framework.map(p => {
                    const s = STAGE[p.stage] || STAGE[1];
                    return (
                      <tr key={p.value} className="border-b border-gray-800/30 hover:bg-gray-900/50">
                        <td className={`py-2 pr-2 font-mono font-bold ${s.text}`}>{p.value}</td>
                        <td className="py-2 pr-2 font-mono text-gray-300">{p.form}</td>
                        <td className="py-2 pr-2 text-gray-400 hidden sm:table-cell">{p.algebras}</td>
                        <td className="py-2 pr-2 text-white">{p.constant}</td>
                        <td className="py-2 pr-2 font-mono text-gray-300 hidden md:table-cell">{p.formula}</td>
                        <td className="py-2 pr-2 text-emerald-400">{p.precision}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${s.labelBg} ${s.text} ${s.border}`}>
                            {p.stage}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Higher Primes */}
        <div className="border-b border-gray-800/50">
          <SectionHeader id="higher" title="Tier 3-4: Higher Primes" count={primes.highPrimes.length}
            desc="Triple-sum and four-square primes with physical manifestations" />
          {expanded.has('higher') && (
            <div className="pb-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2 pr-2 font-medium">Prime</th>
                    <th className="text-left py-2 pr-2 font-medium">Tier</th>
                    <th className="text-left py-2 pr-2 font-medium">Form</th>
                    <th className="text-left py-2 pr-2 font-medium">Physics</th>
                    <th className="text-left py-2 font-medium">Precision</th>
                  </tr>
                </thead>
                <tbody>
                  {primes.highPrimes.map(p => (
                    <tr key={p.value} className="border-b border-gray-800/30 hover:bg-gray-900/50">
                      <td className="py-2 pr-2 font-mono font-bold text-orange-400">{p.value}</td>
                      <td className="py-2 pr-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.tier === 3 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>{p.tier}</span>
                      </td>
                      <td className="py-2 pr-2 font-mono text-gray-300">{p.form}</td>
                      <td className="py-2 pr-2 text-gray-300">{p.physics}</td>
                      <td className="py-2 text-emerald-400">{p.precision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Non-Framework */}
        <div className="border-b border-gray-800/50">
          <SectionHeader id="nonframework" title="Tier 5: Additive / Non-Framework" count={primes.nonFramework.length}
            desc="Primes in mass ratios via additive combinations" />
          {expanded.has('nonframework') && (
            <div className="pb-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2 pr-2 font-medium">Prime</th>
                    <th className="text-left py-2 pr-2 font-medium">Form</th>
                    <th className="text-left py-2 pr-2 font-medium">Physics</th>
                    <th className="text-left py-2 font-medium">Precision</th>
                  </tr>
                </thead>
                <tbody>
                  {primes.nonFramework.map(p => (
                    <tr key={p.value} className="border-b border-gray-800/30 hover:bg-gray-900/50">
                      <td className="py-2 pr-2 font-mono font-bold text-gray-300">{p.value}</td>
                      <td className="py-2 pr-2 font-mono text-gray-400">{p.form}</td>
                      <td className="py-2 pr-2 text-gray-300">{p.physics}</td>
                      <td className="py-2 text-emerald-400">{p.precision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mixing Angles */}
        <div className="border-b border-gray-800/50">
          <SectionHeader id="mixing" title="Mixing Angles"
            count={primes.mixingAngles.pmns.length + primes.mixingAngles.ckm.length}
            desc="PMNS and CKM matrix elements from framework fractions" />
          {expanded.has('mixing') && (
            <div className="pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">PMNS (Neutrino)</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 pr-2">Angle</th>
                      <th className="text-left py-1.5 pr-2">Value</th>
                      <th className="text-left py-1.5 pr-2">Meaning</th>
                      <th className="text-left py-1.5">Precision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {primes.mixingAngles.pmns.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800/30">
                        <td className="py-1.5 pr-2 font-mono text-white">{a.angle}</td>
                        <td className="py-1.5 pr-2 font-mono text-blue-400">{a.value}</td>
                        <td className="py-1.5 pr-2 text-gray-400">{a.meaning}</td>
                        <td className="py-1.5 text-emerald-400">{a.precision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">CKM (Quark)</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 pr-2">Angle</th>
                      <th className="text-left py-1.5 pr-2">Value</th>
                      <th className="text-left py-1.5 pr-2">Meaning</th>
                      <th className="text-left py-1.5">Precision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {primes.mixingAngles.ckm.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800/30">
                        <td className="py-1.5 pr-2 font-mono text-white">{a.angle}</td>
                        <td className="py-1.5 pr-2 font-mono text-purple-400">{a.value}</td>
                        <td className="py-1.5 pr-2 text-gray-400">{a.meaning}</td>
                        <td className="py-1.5 text-emerald-400">{a.precision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Couplings */}
        <div>
          <SectionHeader id="couplings" title="Coupling Constants" count={primes.couplings.length}
            desc="Fundamental interactions from framework primes" />
          {expanded.has('couplings') && (
            <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primes.couplings.map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-white font-medium text-sm">{c.name}</div>
                  <div className="font-mono text-brand-400 mt-1">{c.formula}</div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>= {c.value}</span>
                    <span className="text-emerald-400">{c.precision}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrimeTable;
