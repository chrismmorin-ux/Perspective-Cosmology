import { useState, useMemo } from 'react';
import type { FC } from 'react';

interface Prediction {
  id: string;
  name: string;
  formula: string;
  framework_value: string;
  measured_value: string;
  measured_source: string | null;
  precision_ppm: number | null;
  precision_display: string;
  tier: number | null;
  status: string;
  blind: boolean;
  domain: string;
  script: string | null;
  caveats: string | null;
}

interface Props {
  predictions: Prediction[];
}

type SortField = 'name' | 'precision' | 'tier' | 'domain';
type SortDir = 'asc' | 'desc';

const DOMAIN_LABELS: Record<string, string> = {
  particles: 'Particles',
  cosmology: 'Cosmology',
  cmb: 'CMB',
  electroweak: 'Electroweak',
  gravity: 'Gravity',
  gauge: 'Gauge/Topology',
  structural: 'Structural',
  bbn: 'BBN',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  marginal: 'Marginal',
  falsified: 'Falsified',
};

function tierLabel(tier: number | null, status: string): string {
  if (status === 'falsified') return 'Falsified';
  if (tier === 1) return 'Tier 1';
  if (tier === 2) return 'Tier 2';
  if (tier === 3) return 'Tier 3';
  return 'Other';
}

function tierColor(tier: number | null, status: string): string {
  if (status === 'falsified') return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (tier === 1) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (tier === 2) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  if (tier === 3) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
}

function precisionColor(ppm: number | null, status: string): string {
  if (status === 'falsified') return 'text-red-400';
  if (ppm === null) return 'text-gray-500';
  if (ppm < 10) return 'text-emerald-400';
  if (ppm < 10000) return 'text-yellow-400';
  return 'text-orange-400';
}

function sortValue(p: Prediction, field: SortField): number | string {
  switch (field) {
    case 'precision':
      if (p.status === 'falsified') return 1e9;
      return p.precision_ppm ?? 1e8;
    case 'tier':
      if (p.status === 'falsified') return 99;
      return p.tier ?? 50;
    case 'domain':
      return p.domain;
    case 'name':
    default:
      return p.name.toLowerCase();
  }
}

const PredictionExplorer: FC<Props> = ({ predictions }) => {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [blindFilter, setBlindFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('precision');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const domains = useMemo(() => {
    const set = new Set(predictions.map(p => p.domain));
    return Array.from(set).sort();
  }, [predictions]);

  const filtered = useMemo(() => {
    let result = [...predictions];

    if (tierFilter !== 'all') {
      if (tierFilter === 'falsified') {
        result = result.filter(p => p.status === 'falsified');
      } else {
        const t = parseInt(tierFilter);
        result = result.filter(p => p.tier === t && p.status !== 'falsified');
      }
    }

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (domainFilter !== 'all') {
      result = result.filter(p => p.domain === domainFilter);
    }

    if (blindFilter !== 'all') {
      const wantBlind = blindFilter === 'blind';
      result = result.filter(p => p.blind === wantBlind);
    }

    result.sort((a, b) => {
      const va = sortValue(a, sortField);
      const vb = sortValue(b, sortField);
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [predictions, tierFilter, statusFilter, domainFilter, blindFilter, sortField, sortDir]);

  const counts = useMemo(() => {
    const tier1 = predictions.filter(p => p.tier === 1 && p.status !== 'falsified').length;
    const tier2 = predictions.filter(p => p.tier === 2 && p.status !== 'falsified').length;
    const tier3 = predictions.filter(p => p.tier === 3 && p.status !== 'falsified').length;
    const falsified = predictions.filter(p => p.status === 'falsified').length;
    const blind = predictions.filter(p => p.blind && p.status !== 'falsified').length;
    return { tier1, tier2, tier3, falsified, blind, total: predictions.length };
  }, [predictions]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <button
          onClick={() => { setTierFilter('all'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            tierFilter === 'all' && statusFilter === 'all'
              ? 'bg-brand-600/20 border-brand-500/50 text-white'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-white">{counts.total}</div>
          <div className="text-xs mt-0.5">Total</div>
        </button>
        <button
          onClick={() => { setTierFilter('1'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            tierFilter === '1'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-emerald-400">{counts.tier1}</div>
          <div className="text-xs mt-0.5">Tier 1</div>
        </button>
        <button
          onClick={() => { setTierFilter('2'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            tierFilter === '2'
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-yellow-400">{counts.tier2}</div>
          <div className="text-xs mt-0.5">Tier 2</div>
        </button>
        <button
          onClick={() => { setTierFilter('3'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            tierFilter === '3'
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-orange-400">{counts.tier3}</div>
          <div className="text-xs mt-0.5">Tier 3</div>
        </button>
        <button
          onClick={() => { setTierFilter('falsified'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            tierFilter === 'falsified'
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-red-400">{counts.falsified}</div>
          <div className="text-xs mt-0.5">Falsified</div>
        </button>
        <button
          onClick={() => { setBlindFilter(blindFilter === 'blind' ? 'all' : 'blind'); setTierFilter('all'); setStatusFilter('all'); }}
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            blindFilter === 'blind'
              ? 'bg-brand-600/20 border-brand-500/50 text-brand-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-xl font-bold text-brand-400">{counts.blind}</div>
          <div className="text-xs mt-0.5">Blind</div>
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Domains</option>
          {domains.map(d => (
            <option key={d} value={d}>{DOMAIN_LABELS[d] || d}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
          <span>Sort:</span>
          <button
            onClick={() => toggleSort('precision')}
            className={`px-2 py-1 rounded ${sortField === 'precision' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
          >
            Precision{sortArrow('precision')}
          </button>
          <button
            onClick={() => toggleSort('tier')}
            className={`px-2 py-1 rounded ${sortField === 'tier' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
          >
            Tier{sortArrow('tier')}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`px-2 py-1 rounded ${sortField === 'name' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
          >
            Name{sortArrow('name')}
          </button>
          <button
            onClick={() => toggleSort('domain')}
            className={`px-2 py-1 rounded ${sortField === 'domain' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
          >
            Domain{sortArrow('domain')}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {predictions.length} predictions
      </div>

      {/* Prediction cards */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div
            key={p.id}
            className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${
              expandedId === p.id ? 'border-brand-600/50' : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Card header — always visible */}
            <button
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer"
            >
              {/* Tier badge */}
              <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${tierColor(p.tier, p.status)}`}>
                {tierLabel(p.tier, p.status)}
              </span>

              {/* Name + formula */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">{p.name}</span>
                  {p.blind && (
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-600/20 text-brand-400 border border-brand-600/30 uppercase tracking-wider">
                      Blind
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 font-mono truncate mt-0.5">{p.formula}</div>
              </div>

              {/* Precision */}
              <div className={`shrink-0 text-right ${precisionColor(p.precision_ppm, p.status)}`}>
                <div className="text-sm font-semibold">{p.precision_display}</div>
                <div className="text-xs text-gray-600">{DOMAIN_LABELS[p.domain] || p.domain}</div>
              </div>

              {/* Expand arrow */}
              <svg
                className={`shrink-0 w-4 h-4 text-gray-600 transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded details */}
            {expandedId === p.id && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Framework Value</div>
                    <div className="text-white font-mono">{p.framework_value}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Measured Value</div>
                    <div className="text-gray-300 font-mono">{p.measured_value}</div>
                    {p.measured_source && (
                      <div className="text-xs text-gray-600 mt-0.5">Source: {p.measured_source}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Formula</div>
                    <div className="text-brand-300 font-mono text-xs break-all">{p.formula}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        p.status === 'confirmed' ? 'bg-emerald-400' :
                        p.status === 'pending' ? 'bg-yellow-400' :
                        p.status === 'marginal' ? 'bg-orange-400' :
                        'bg-red-400'
                      }`}></span>
                      <span className="text-gray-300 capitalize">{p.status}</span>
                    </div>
                  </div>
                </div>

                {p.caveats && (
                  <div className="mt-4 p-3 bg-gray-950 border border-gray-800 rounded-lg">
                    <div className="text-xs text-yellow-500 font-semibold uppercase tracking-wider mb-1">Caveats</div>
                    <div className="text-sm text-gray-400">{p.caveats}</div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3 text-xs">
                  {p.script && (
                    <span className="text-gray-600 font-mono">
                      Script: {p.script}
                    </span>
                  )}
                  <a
                    href="/explore/derivations"
                    className="text-brand-400 hover:text-brand-300 ml-auto"
                  >
                    View derivation chain &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No predictions match the current filters.</p>
          <button
            onClick={() => { setTierFilter('all'); setStatusFilter('all'); setDomainFilter('all'); setBlindFilter('all'); }}
            className="mt-3 text-brand-400 hover:text-brand-300 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictionExplorer;
