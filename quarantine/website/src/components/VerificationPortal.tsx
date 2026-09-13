import { useState, useMemo } from 'react';
import type { FC } from 'react';

// --- Types ---
interface ScriptEntry {
  id: string;
  filename: string;
  title: string;
  description: string;
  formula?: string;
  measured?: string | null;
  precision: string;
  domain: string;
  tests: number;
  featured_order?: number;
  start_here?: boolean;
}

interface DomainInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

interface Stats {
  total_scripts: number;
  pass_rate: number;
  domains: number;
  total_tests: number;
  codata_year: number;
}

interface VerificationData {
  stats: Stats;
  domains: DomainInfo[];
  featured: ScriptEntry[];
  curated: ScriptEntry[];
}

interface Props {
  data: VerificationData;
}

// --- Helpers ---
const DOMAIN_COLORS: Record<string, string> = {
  alpha: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  weinberg: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  cosmology: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  particles: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  gauge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  qm: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  gravity: 'border-red-500/40 bg-red-500/10 text-red-400',
  math: 'border-gray-500/40 bg-gray-500/10 text-gray-400',
};

const DOMAIN_DOT: Record<string, string> = {
  alpha: 'bg-blue-400',
  weinberg: 'bg-violet-400',
  cosmology: 'bg-cyan-400',
  particles: 'bg-amber-400',
  gauge: 'bg-emerald-400',
  qm: 'bg-pink-400',
  gravity: 'bg-red-400',
  math: 'bg-gray-400',
};

function domainLabel(domains: DomainInfo[], id: string): string {
  return domains.find(d => d.id === id)?.name ?? id;
}

// --- Stat Card ---
const StatCard: FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
    {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
  </div>
);

// --- Script Card ---
const ScriptCard: FC<{
  script: ScriptEntry;
  domains: DomainInfo[];
  expanded: boolean;
  onToggle: () => void;
  startHere?: boolean;
}> = ({ script, domains, expanded, onToggle, startHere }) => (
  <div
    className={`border rounded-lg transition-all cursor-pointer ${
      startHere
        ? 'border-brand-500/40 bg-brand-500/5 hover:border-brand-500/60'
        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
    }`}
    onClick={onToggle}
  >
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {startHere && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded">
                Start here
              </span>
            )}
            <span className={`text-[10px] font-medium uppercase tracking-wider border px-1.5 py-0.5 rounded ${DOMAIN_COLORS[script.domain] || DOMAIN_COLORS.math}`}>
              {domainLabel(domains, script.domain)}
            </span>
          </div>
          <h3 className="text-white font-medium mt-1.5 text-sm leading-snug">{script.title}</h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{script.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">Precision</div>
          <div className="text-sm font-mono text-emerald-400">{script.precision}</div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
          {script.formula && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Formula</div>
              <code className="text-xs text-blue-300 font-mono bg-gray-950 px-2 py-1 rounded block overflow-x-auto">
                {script.formula}
              </code>
            </div>
          )}
          {script.measured && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Measured value</div>
              <div className="text-xs text-gray-400">{script.measured}</div>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-gray-600">Tests: </span>
              <span className="text-gray-400">{script.tests}</span>
            </div>
            <div>
              <span className="text-gray-600">File: </span>
              <code className="text-gray-400 font-mono text-[11px]">{script.filename}</code>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Run locally: <code className="text-gray-500 font-mono">python verification/sympy/{script.filename}</code>
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- Main Component ---
const VerificationPortal: FC<Props> = ({ data }) => {
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCurated, setShowCurated] = useState(false);

  const allScripts = useMemo(() => {
    const featured = data.featured.map(s => ({ ...s, _featured: true }));
    const curated = data.curated.map(s => ({ ...s, _featured: false }));
    return [...featured, ...curated];
  }, [data]);

  const filtered = useMemo(() => {
    let scripts = showCurated ? allScripts : allScripts.filter((s: any) => s._featured);
    if (domainFilter !== 'all') {
      scripts = scripts.filter(s => s.domain === domainFilter);
    }
    return scripts;
  }, [allScripts, domainFilter, showCurated]);

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Verification scripts" value={data.stats.total_scripts.toLocaleString()} />
        <StatCard label="Pass rate" value={`${data.stats.pass_rate}%`} sub="All tests automated" />
        <StatCard label="Physics domains" value={String(data.stats.domains)} />
        <StatCard label="Reference data" value={`CODATA ${data.stats.codata_year}`} sub="+ PDG 2022" />
      </div>

      {/* Domain pills */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDomainFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              domainFilter === 'all'
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
            }`}
          >
            All domains
          </button>
          {data.domains.map(d => (
            <button
              key={d.id}
              onClick={() => setDomainFilter(domainFilter === d.id ? 'all' : d.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                domainFilter === d.id
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${DOMAIN_DOT[d.id] || 'bg-gray-500'}`} />
              {d.name}
              <span className="text-gray-600">({d.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {showCurated ? 'All curated scripts' : 'Start here'}
          <span className="text-gray-600 font-normal text-sm ml-2">({filtered.length} scripts)</span>
        </h2>
        <button
          onClick={() => setShowCurated(!showCurated)}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          {showCurated ? 'Show featured only' : `Show all ${allScripts.length} curated scripts`}
        </button>
      </div>

      {/* Script grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(script => (
          <ScriptCard
            key={script.id}
            script={script}
            domains={data.domains}
            expanded={expandedId === script.id}
            onToggle={() => setExpandedId(expandedId === script.id ? null : script.id)}
            startHere={script.start_here}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No scripts match the selected domain filter.
        </div>
      )}
    </div>
  );
};

export default VerificationPortal;
