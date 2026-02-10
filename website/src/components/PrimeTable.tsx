import { useState, useMemo } from 'react';
import type { FC } from 'react';

interface Dimension {
  value: number;
  algebra: string;
  meaning: string;
}

interface Prime {
  value: number;
  a: number;
  b: number;
  algebraA: string;
  algebraB: string;
  meaningA: string;
  meaningB: string;
  status: 'mapped' | 'unmapped';
  constant: string | null;
  formula: string | null;
  precision: string | null;
  physics?: string;
  interpretation?: string;
}

interface Props {
  primes: Prime[];
  dimensions: Dimension[];
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

const PrimeTable: FC<Props> = ({ primes, dimensions }) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedPrime, setSelectedPrime] = useState<Prime | null>(null);

  const primeMap = useMemo(() => {
    const m = new Map<number, Prime>();
    for (const p of primes) m.set(p.value, p);
    return m;
  }, [primes]);

  const grid = useMemo(() => {
    return dimensions.map((dRow, ri) =>
      dimensions.map((dCol, ci) => {
        const sum = dRow.value ** 2 + dCol.value ** 2;
        const prime = isPrime(sum);
        const mapped = primeMap.get(sum);
        return { sum, prime, mapped, ri, ci };
      })
    );
  }, [dimensions, primeMap]);

  const handleCellClick = (sum: number) => {
    const p = primeMap.get(sum);
    if (p && p.status === 'mapped') {
      setSelectedPrime(prev => prev?.value === p.value ? null : p);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-[480px]">
          {/* Column headers */}
          <div className="flex">
            <div className="w-20 shrink-0" />
            {dimensions.map(d => (
              <div key={d.value} className="flex-1 min-w-[60px] text-center pb-2">
                <div className="text-sm font-bold text-white">{d.value}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{d.algebra}</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {dimensions.map((dRow, ri) => (
            <div key={dRow.value} className="flex">
              {/* Row header */}
              <div className="w-20 shrink-0 flex items-center justify-end pr-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{dRow.value}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{dRow.algebra}</div>
                </div>
              </div>

              {/* Cells */}
              {grid[ri].map((cell, ci) => {
                const isMapped = cell.mapped?.status === 'mapped';
                const isUnmappedPrime = cell.prime && !isMapped;
                const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                const isSelected = selectedPrime?.value === cell.sum;

                let bg = 'bg-gray-900/50';
                let border = 'border-gray-800/50';
                let text = 'text-gray-600';

                if (isMapped) {
                  bg = 'bg-emerald-950/60';
                  border = 'border-emerald-500/40';
                  text = 'text-emerald-400 font-bold';
                } else if (isUnmappedPrime) {
                  bg = 'bg-brand-950/40';
                  border = 'border-brand-500/30';
                  text = 'text-brand-400 font-semibold';
                }

                if (isSelected) {
                  border = 'border-emerald-400 ring-1 ring-emerald-400/50';
                }

                return (
                  <div
                    key={ci}
                    className={`flex-1 min-w-[60px] aspect-square flex items-center justify-center
                      border ${border} ${bg} ${text} text-sm font-mono
                      transition-all duration-100 relative
                      ${cell.prime ? 'cursor-pointer hover:scale-105' : ''}
                      ${isHovered ? 'z-10' : ''}`}
                    onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => cell.prime && handleCellClick(cell.sum)}
                  >
                    {cell.sum}

                    {/* Tooltip */}
                    {isHovered && cell.prime && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20
                        bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 shadow-xl
                        min-w-[200px] text-left pointer-events-none">
                        <div className="text-white font-bold text-sm mb-1">
                          {cell.sum} = {dimensions[ri].value}&sup2; + {dimensions[ci].value}&sup2;
                        </div>
                        <div className="text-gray-400 text-xs mb-1">
                          {dimensions[ri].algebra}&sup2; + {dimensions[ci].algebra}&sup2;
                        </div>
                        <div className="text-gray-500 text-xs">
                          {dimensions[ri].meaning} + {dimensions[ci].meaning}
                        </div>
                        {cell.mapped?.status === 'mapped' && (
                          <div className="mt-1 pt-1 border-t border-gray-800">
                            <div className="text-emerald-400 text-xs font-semibold">
                              {cell.mapped.constant}
                            </div>
                            <div className="text-gray-500 text-[10px]">Click for details</div>
                          </div>
                        )}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-l-[6px] border-l-transparent
                          border-r-[6px] border-r-transparent
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-500/40" />
          <span>Mapped to physical constant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-950/40 border border-brand-500/30" />
          <span>Unmapped prime (prediction candidate)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-900/50 border border-gray-800/50" />
          <span>Non-prime composite</span>
        </div>
      </div>

      {/* Detail card for selected mapped prime */}
      {selectedPrime && selectedPrime.status === 'mapped' && (
        <div className="bg-gray-900 border border-emerald-500/30 rounded-xl p-5 animate-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 font-mono">{selectedPrime.value}</h3>
              <div className="text-sm text-white mt-0.5">{selectedPrime.constant}</div>
            </div>
            <button
              onClick={() => setSelectedPrime(null)}
              className="text-gray-500 hover:text-white text-sm cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Decomposition</div>
              <div className="text-white font-mono">
                {selectedPrime.value} = {selectedPrime.a}&sup2; + {selectedPrime.b}&sup2;
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                {selectedPrime.algebraA} + {selectedPrime.algebraB}
              </div>
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
              <div className="text-gray-300">{selectedPrime.precision}</div>
            </div>
          </div>

          {selectedPrime.interpretation && (
            <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
              {selectedPrime.interpretation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrimeTable;
