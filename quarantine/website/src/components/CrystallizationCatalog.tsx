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
  channel: string;
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
  gaps: string[];
  falsification: string;
}

interface Chain {
  name: string;
  sequence: string[];
  description: string;
  color: string;
}

interface Props {
  data: {
    orderParameter: {
      symbol: string;
      groundState: string;
      states: { eps: string; label: string; physics: string; color: string }[];
    };
    types: CrystalType[];
    chains: Chain[];
    gaps: {
      critical: { description: string; types: string[] }[];
      high: { description: string; types: string[] }[];
    };
    falsified: { claim: string; actual: string; session: string; status: string }[];
    resolved: { description: string; session: string; tests: string }[];
    gPhi: { formula: string; usedIn: { type: string; role: string }[] };
    stats: { totalTypes: number; totalScripts: number; totalTests: number; passRate: string };
  };
}

const CONF: Record<string, { bg: string; text: string; border: string }> = {
  theorem: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  derivation: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'framework-constrained': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  conjecture: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'standard-relabeled': { bg: 'bg-gray-400/10', text: 'text-gray-400', border: 'border-gray-400/30' },
  speculation: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

const confBadge = (conf: string) => {
  const s = CONF[conf] || CONF.conjecture;
  return `${s.bg} ${s.text} ${s.border}`;
};

const CrystallizationCatalog: FC<Props> = ({ data }) => {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const typeColorMap = new Map(data.types.map(t => [t.id, t.color]));
  const confidenceLevels = [...new Set(data.types.map(t => t.confidence))];
  const filteredTypes = filter === 'all' ? data.types : data.types.filter(t => t.confidence === filter);

  return (
    <div className="space-y-10">

      {/* Stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{data.stats.totalTypes}</div>
          <div className="text-xs text-gray-500 mt-1">Types</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{data.stats.totalScripts}</div>
          <div className="text-xs text-gray-500 mt-1">SymPy Scripts</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{data.stats.totalTests}</div>
          <div className="text-xs text-gray-500 mt-1">Tests</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{data.stats.passRate}</div>
          <div className="text-xs text-gray-500 mt-1">Pass Rate</div>
        </div>
      </div>

      {/* Order parameter + g(phi) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Order Parameter: {data.orderParameter.symbol}
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            Ground state: <span className="font-mono text-white">{data.orderParameter.groundState}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {data.orderParameter.states.map(s => (
              <div key={s.label}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm"
                style={{ borderLeftColor: s.color, borderLeftWidth: '3px' }}>
                <div className="font-mono text-xs" style={{ color: s.color }}>
                  {data.orderParameter.symbol} {s.eps}
                </div>
                <div className="text-white text-xs font-medium mt-0.5">{s.label}</div>
                <div className="text-gray-500 text-[10px] mt-0.5">{s.physics}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Unifying Function</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
            <div className="font-mono text-white text-sm">{data.gPhi.formula}</div>
          </div>
          <div className="space-y-2">
            {data.gPhi.usedIn.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: typeColorMap.get(u.type) || '#666' }}>
                  {u.type}
                </span>
                <span className="text-gray-400">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Type cards */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white">
            {data.stats.totalTypes} Crystallization Types
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs cursor-pointer transition-colors
                ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              All
            </button>
            {confidenceLevels.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded text-xs cursor-pointer border transition-colors
                  ${filter === c ? confBadge(c) : 'text-gray-500 hover:text-gray-300 border-transparent'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map(t => {
            const isExpanded = expandedType === t.id;
            return (
              <div key={t.id}
                className={`bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer
                  transition-all hover:border-gray-600
                  ${isExpanded ? 'ring-1 sm:col-span-2 lg:col-span-3' : ''}`}
                style={{
                  borderLeftColor: t.color, borderLeftWidth: '4px',
                  ...(isExpanded ? { ringColor: t.color } : {}),
                }}
                onClick={() => setExpandedType(isExpanded ? null : t.id)}>

                {/* Card header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: t.color + '30', color: t.borderColor }}>
                      {t.id}
                    </span>
                    <span className="text-white font-medium text-sm">{t.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${confBadge(t.confidence)}`}>
                    {t.confidence}
                  </span>
                </div>

                {/* Metadata row */}
                <div className="flex gap-3 text-[10px] text-gray-500 mb-2">
                  <span>{t.direction}</span>
                  <span>{t.scale}</span>
                  <span>{t.channel}</span>
                  <span>{t.mechanism}</span>
                </div>

                {/* Before -> After */}
                <div className="flex items-center gap-2 text-xs font-mono mb-2">
                  <span className="text-gray-400">{t.before}</span>
                  <span className="text-gray-600">-&gt;</span>
                  <span style={{ color: t.borderColor }}>{t.after}</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{t.summary}</p>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-800 space-y-4" onClick={e => e.stopPropagation()}>
                    {/* Key formula */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Key Formula</div>
                      <div className="text-sm font-mono text-white bg-gray-950 rounded-lg px-3 py-2 border border-gray-800">
                        {t.keyFormula}
                      </div>
                    </div>

                    {/* Signatures table */}
                    {t.signatures.length > 0 && (
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
                                    <span className={
                                      s.error === '0%' || s.error === 'Exact' || s.error === 'Confirmed'
                                        ? 'text-emerald-400'
                                        : s.error.includes('Prediction') || s.error === '\u2014' || s.error === 'Consistent'
                                          ? 'text-yellow-400'
                                          : 'text-gray-400'
                                    }>
                                      {s.error}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Gaps */}
                    {t.gaps.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Known Gaps</div>
                        <ul className="space-y-1">
                          {t.gaps.map((g, i) => (
                            <li key={i} className="text-xs text-yellow-400/80 flex items-start gap-1.5">
                              <span className="text-yellow-500 mt-0.5 shrink-0">!</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Script stats + falsification */}
                    <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 pt-2 border-t border-gray-800/50">
                      <span>Scripts: {t.scripts}</span>
                      <span>Tests: {t.testsPass}/{t.testsTotal} PASS</span>
                      {t.testsTotal > 0 && (
                        <span>({((t.testsPass / t.testsTotal) * 100).toFixed(1)}%)</span>
                      )}
                    </div>
                    {t.falsification && (
                      <div className="text-[10px] text-red-400/70 mt-1">
                        Falsification: {t.falsification}
                      </div>
                    )}
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
            <div key={chain.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-2">{chain.name}</div>
              <div className="flex items-center gap-1 flex-wrap mb-2">
                {chain.sequence.map((cid, i) => (
                  <div key={`${cid}-${i}`} className="flex items-center gap-1">
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: typeColorMap.get(cid) || '#666' }}>
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

      {/* Gap Tracker */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Gap Tracker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-2">
              Critical ({data.gaps.critical.length})
            </h4>
            <div className="space-y-2">
              {data.gaps.critical.map((g, i) => (
                <div key={i} className="bg-gray-900 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-300">{g.description}</div>
                  <div className="flex gap-1 mt-1.5">
                    {g.types.map(t => (
                      <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: typeColorMap.get(t) || '#666' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-2">
              High Priority ({data.gaps.high.length})
            </h4>
            <div className="space-y-2">
              {data.gaps.high.map((g, i) => (
                <div key={i} className="bg-gray-900 border border-yellow-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-300">{g.description}</div>
                  <div className="flex gap-1 mt-1.5">
                    {g.types.map(t => (
                      <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: typeColorMap.get(t) || '#666' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Falsified + Resolved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-3">Falsified Claims</h3>
          <p className="text-xs text-gray-500 mb-3">Predictions that were tested and failed. Intellectual honesty requires tracking these.</p>
          <div className="space-y-2">
            {data.falsified.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-300 line-through">{f.claim}</div>
                <div className="text-xs text-gray-400 mt-1">Actual: {f.actual}</div>
                <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                  <span>{f.session}</span>
                  <span className={f.status === 'falsified' ? 'text-red-400' : 'text-emerald-400'}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">Resolved Gaps</h3>
          <p className="text-xs text-gray-500 mb-3">Previously-open questions that have been addressed with verified derivations.</p>
          <div className="space-y-2">
            {data.resolved.map((r, i) => (
              <div key={i} className="bg-gray-900 border border-emerald-500/20 rounded-lg p-3">
                <div className="text-xs text-gray-300">{r.description}</div>
                <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                  <span>{r.session}</span>
                  <span className="text-emerald-400">{r.tests}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrystallizationCatalog;
