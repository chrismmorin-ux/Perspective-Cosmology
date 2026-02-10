import { useState } from 'react';
import type { FC } from 'react';

interface Signature {
  observable: string;
  predicted: string;
  measured: string;
  error: string;
}

interface CrystalType {
  id: string;
  name: string;
  direction: string;
  scale: string;
  mechanism: string;
  color: string;
  borderColor: string;
  before: string;
  after: string;
  summary: string;
  keyFormula: string;
  signatures: Signature[];
  scripts: number;
  testsPass: number;
  testsTotal: number;
  confidence: string;
}

interface Chain {
  name: string;
  sequence: string[];
  description: string;
  color: string;
}

interface OrderState {
  eps: string;
  label: string;
  physics: string;
  color: string;
}

interface OrderParameter {
  symbol: string;
  groundState: string;
  states: OrderState[];
}

interface CrystallizationData {
  types: CrystalType[];
  chains: Chain[];
  orderParameter: OrderParameter;
}

interface Props {
  data: CrystallizationData;
}

const confidenceBadge = (conf: string) => {
  const styles: Record<string, string> = {
    derivation: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    conjecture: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    speculation: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return styles[conf] || styles.conjecture;
};

const CrystallizationCatalog: FC<Props> = ({ data }) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const typeColorMap = new Map(data.types.map(t => [t.id, t.color]));

  return (
    <div className="space-y-10">

      {/* Order parameter states */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Order Parameter: {data.orderParameter.symbol}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Ground state: {data.orderParameter.groundState}
        </p>
        <div className="flex flex-wrap gap-2">
          {data.orderParameter.states.map(s => (
            <div
              key={s.label}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm"
              style={{ borderLeftColor: s.color, borderLeftWidth: '3px' }}
            >
              <div className="font-mono text-xs" style={{ color: s.color }}>
                {data.orderParameter.symbol} {s.eps}
              </div>
              <div className="text-white text-xs font-medium mt-0.5">{s.label}</div>
              <div className="text-gray-500 text-[10px] mt-0.5">{s.physics}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Nine Crystallization Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.types.map(t => {
            const isExpanded = expandedType === t.id;
            return (
              <div
                key={t.id}
                className={`bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer
                  transition-all hover:border-gray-600
                  ${isExpanded ? 'ring-1 sm:col-span-2 lg:col-span-3' : ''}`}
                style={{
                  borderLeftColor: t.color,
                  borderLeftWidth: '4px',
                  ...(isExpanded ? { ringColor: t.color } : {}),
                }}
                onClick={() => setExpandedType(isExpanded ? null : t.id)}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: t.color + '30', color: t.borderColor }}
                    >
                      {t.id}
                    </span>
                    <span className="text-white font-medium text-sm">{t.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${confidenceBadge(t.confidence)}`}>
                    {t.confidence}
                  </span>
                </div>

                {/* Direction + scale */}
                <div className="flex gap-3 text-[10px] text-gray-500 mb-2">
                  <span>{t.direction}</span>
                  <span>{t.scale}</span>
                  <span>{t.mechanism}</span>
                </div>

                {/* Before -> After */}
                <div className="flex items-center gap-2 text-xs font-mono mb-2">
                  <span className="text-gray-400">{t.before}</span>
                  <span className="text-gray-600">-&gt;</span>
                  <span style={{ color: t.borderColor }}>{t.after}</span>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-400 leading-relaxed">{t.summary}</p>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                    {/* Key formula */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Key Formula</div>
                      <div className="text-sm font-mono text-white bg-gray-950 rounded-lg px-3 py-2 border border-gray-800">
                        {t.keyFormula}
                      </div>
                    </div>

                    {/* Signatures table */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Experimental Signatures</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                              <th className="text-left py-1.5 pr-3 font-medium">Observable</th>
                              <th className="text-left py-1.5 pr-3 font-medium">Predicted</th>
                              <th className="text-left py-1.5 pr-3 font-medium">Measured</th>
                              <th className="text-left py-1.5 font-medium">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {t.signatures.map((s, i) => (
                              <tr key={i} className="border-b border-gray-800/50">
                                <td className="py-1.5 pr-3 text-gray-300">{s.observable}</td>
                                <td className="py-1.5 pr-3 text-white font-mono">{s.predicted}</td>
                                <td className="py-1.5 pr-3 text-gray-400 font-mono">{s.measured}</td>
                                <td className="py-1.5">
                                  <span className={`${
                                    s.error === '0%' || s.error === 'Exact'
                                      ? 'text-emerald-400'
                                      : s.error.includes('Prediction') || s.error === '\u2014'
                                        ? 'text-yellow-400'
                                        : 'text-gray-400'
                                  }`}>
                                    {s.error}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Script stats */}
                    <div className="flex gap-4 text-[10px] text-gray-500">
                      <span>Scripts: {t.scripts}</span>
                      <span>Tests: {t.testsPass}/{t.testsTotal} PASS</span>
                      {t.testsTotal > 0 && (
                        <span>
                          ({((t.testsPass / t.testsTotal) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Composability chains */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Composability Chains</h3>
        <p className="text-sm text-gray-400 mb-4">
          Crystallization types compose into physical processes. Each chain reads left to right.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.chains.map(chain => (
            <div
              key={chain.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="text-sm font-medium text-white mb-2">{chain.name}</div>

              {/* Pill sequence */}
              <div className="flex items-center gap-1 flex-wrap mb-2">
                {chain.sequence.map((cid, i) => (
                  <div key={`${cid}-${i}`} className="flex items-center gap-1">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: typeColorMap.get(cid) || '#666' }}
                    >
                      {cid}
                    </span>
                    {i < chain.sequence.length - 1 && (
                      <span className="text-gray-600 text-xs">-&gt;</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500">{chain.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrystallizationCatalog;
