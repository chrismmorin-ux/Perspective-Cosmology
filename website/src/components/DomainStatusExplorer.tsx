import { useState, useMemo } from 'react';
import type { FC } from 'react';

interface DomainPrediction {
  name: string;
  precision: string;
  status: string;
  tier: number | null;
}

interface Experiment {
  name: string;
  timeline: string;
  decisive: boolean;
}

interface ConfidenceCounts {
  theorem: number;
  derivation: number;
  conjecture: number;
}

interface Domain {
  id: string;
  name: string;
  status: string;
  description: string;
  keyResult: string;
  predictions: DomainPrediction[];
  experiments: Experiment[];
  confidence: ConfidenceCounts;
  lastUpdated: string;
  narrative: string;
  predictionDomain: string;
  caveat?: string;
}

interface Summary {
  totalPredictions: number;
  confirmed: number;
  pending: number;
  marginal: number;
  falsified: number;
  iraCount: number;
  overallGrade: string;
  nextDecisiveExperiment: string;
  probabilityRange: string;
}

interface DomainStatusData {
  summary: Summary;
  domains: Domain[];
}

interface Props {
  data: DomainStatusData;
}

type StatusType = 'strong' | 'active' | 'developing' | 'testable' | 'structural' | 'open';

const STATUS_ORDER: StatusType[] = ['strong', 'testable', 'active', 'developing', 'structural', 'open'];

const STATUS_LABELS: Record<string, string> = {
  strong: 'Strong',
  active: 'Active',
  developing: 'Developing',
  testable: 'Testable',
  structural: 'Structural',
  open: 'Open',
};

function statusColor(status: string): string {
  switch (status) {
    case 'strong': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'active': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'developing': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'testable': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    case 'structural': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'open': return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

function statusDot(status: string): string {
  switch (status) {
    case 'strong': return 'bg-emerald-400';
    case 'active': return 'bg-yellow-400';
    case 'developing': return 'bg-orange-400';
    case 'testable': return 'bg-cyan-400';
    case 'structural': return 'bg-purple-400';
    case 'open': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

function predictionStatusColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-emerald-500';
    case 'pending': return 'bg-yellow-500';
    case 'marginal': return 'bg-orange-500';
    case 'falsified': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function predictionStatusDot(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-emerald-400';
    case 'pending': return 'bg-yellow-400';
    case 'marginal': return 'bg-orange-400';
    case 'falsified': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
}

function tierBadgeColor(tier: number | null): string {
  if (tier === 1) return 'text-emerald-400';
  if (tier === 2) return 'text-yellow-400';
  if (tier === 3) return 'text-orange-400';
  return 'text-gray-500';
}

function confidencePillColor(type: string): string {
  switch (type) {
    case 'theorem': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'derivation': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'conjecture': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

const PredictionMiniBar: FC<{ predictions: DomainPrediction[] }> = ({ predictions }) => {
  const confirmed = predictions.filter(p => p.status === 'confirmed').length;
  const pending = predictions.filter(p => p.status === 'pending').length;
  const marginal = predictions.filter(p => p.status === 'marginal').length;
  const falsified = predictions.filter(p => p.status === 'falsified').length;
  const total = predictions.length;

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-20 rounded-full overflow-hidden bg-gray-800">
        {confirmed > 0 && (
          <div className="bg-emerald-500" style={{ width: `${(confirmed / total) * 100}%` }} />
        )}
        {marginal > 0 && (
          <div className="bg-orange-500" style={{ width: `${(marginal / total) * 100}%` }} />
        )}
        {pending > 0 && (
          <div className="bg-yellow-500" style={{ width: `${(pending / total) * 100}%` }} />
        )}
        {falsified > 0 && (
          <div className="bg-red-500" style={{ width: `${(falsified / total) * 100}%` }} />
        )}
      </div>
      <span className="text-xs text-gray-500">{confirmed}/{total}</span>
    </div>
  );
};

const DomainStatusExplorer: FC<Props> = ({ data }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...data.domains];

    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Sort by status priority, then by prediction count
    result.sort((a, b) => {
      const aIdx = STATUS_ORDER.indexOf(a.status as StatusType);
      const bIdx = STATUS_ORDER.indexOf(b.status as StatusType);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return b.predictions.length - a.predictions.length;
    });

    return result;
  }, [data.domains, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_ORDER) counts[s] = 0;
    for (const d of data.domains) {
      counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return counts;
  }, [data.domains]);

  const { summary } = data;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-white">{summary.totalPredictions}</div>
          <div className="text-xs text-gray-400 mt-0.5">Predictions</div>
        </div>
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{summary.confirmed}</div>
          <div className="text-xs text-gray-400 mt-0.5">Confirmed</div>
        </div>
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{summary.pending}</div>
          <div className="text-xs text-gray-400 mt-0.5">Pending</div>
        </div>
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-red-400">{summary.falsified}</div>
          <div className="text-xs text-gray-400 mt-0.5">Falsified</div>
        </div>
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-brand-400">{summary.overallGrade}</div>
          <div className="text-xs text-gray-400 mt-0.5">Grade</div>
        </div>
        <div className="rounded-lg border bg-gray-900 border-gray-800 p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{summary.probabilityRange}</div>
          <div className="text-xs text-gray-400 mt-0.5">P(genuine)</div>
        </div>
      </div>

      {/* Status filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer border ${
            statusFilter === 'all'
              ? 'bg-brand-600/20 border-brand-500/50 text-white'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
          }`}
        >
          All ({data.domains.length})
        </button>
        {STATUS_ORDER.map(s => (
          statusCounts[s] > 0 && (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer border ${
                statusFilter === s
                  ? statusColor(s)
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              {STATUS_LABELS[s]} ({statusCounts[s]})
            </button>
          )
        ))}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {data.domains.length} domains
      </div>

      {/* Domain cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(domain => (
          <div
            key={domain.id}
            className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${
              expandedId === domain.id
                ? 'border-brand-600/50 md:col-span-2'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Card header */}
            <button
              onClick={() => setExpandedId(expandedId === domain.id ? null : domain.id)}
              className="w-full text-left px-5 py-4 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Status badge */}
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border mt-0.5 ${statusColor(domain.status)}`}>
                  {STATUS_LABELS[domain.status] || domain.status}
                </span>

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{domain.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">{domain.description}</div>
                </div>

                {/* Mini bar + chevron */}
                <div className="shrink-0 flex items-center gap-3">
                  <PredictionMiniBar predictions={domain.predictions} />
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${expandedId === domain.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Key result line */}
              <div className="mt-2 ml-[calc(2.5rem+0.75rem)] text-xs text-gray-600 font-mono truncate">
                {domain.keyResult}
              </div>
            </button>

            {/* Expanded details */}
            {expandedId === domain.id && (
              <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                {/* Narrative */}
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{domain.narrative}</p>

                {/* Predictions table */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Predictions</div>
                  <div className="space-y-1.5">
                    {domain.predictions.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${predictionStatusDot(p.status)}`} />
                        <span className="text-gray-300 flex-1 min-w-0 truncate">{p.name}</span>
                        {p.tier && (
                          <span className={`text-xs shrink-0 ${tierBadgeColor(p.tier)}`}>T{p.tier}</span>
                        )}
                        <span className="text-xs text-gray-500 shrink-0 font-mono">{p.precision}</span>
                        <span className={`text-xs capitalize shrink-0 ${
                          p.status === 'confirmed' ? 'text-emerald-400' :
                          p.status === 'pending' ? 'text-yellow-400' :
                          p.status === 'marginal' ? 'text-orange-400' :
                          p.status === 'falsified' ? 'text-red-400' : 'text-gray-400'
                        }`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experiments */}
                {domain.experiments.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Upcoming Experiments</div>
                    <div className="flex flex-wrap gap-2">
                      {domain.experiments.map((exp, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            exp.decisive
                              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {exp.name} ({exp.timeline})
                          {exp.decisive && <span className="ml-1 font-bold">DECISIVE</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence pills + last updated */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  {domain.confidence.theorem > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${confidencePillColor('theorem')}`}>
                      {domain.confidence.theorem} theorem
                    </span>
                  )}
                  {domain.confidence.derivation > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${confidencePillColor('derivation')}`}>
                      {domain.confidence.derivation} derivation
                    </span>
                  )}
                  {domain.confidence.conjecture > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${confidencePillColor('conjecture')}`}>
                      {domain.confidence.conjecture} conjecture
                    </span>
                  )}
                  <span className="text-xs text-gray-600 ml-auto">Updated {domain.lastUpdated}</span>
                </div>

                {/* Caveat box */}
                {domain.caveat && (
                  <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg mb-3">
                    <div className="text-xs text-yellow-500 font-semibold uppercase tracking-wider mb-1">Caveat</div>
                    <div className="text-sm text-gray-400">{domain.caveat}</div>
                  </div>
                )}

                {/* Footer link */}
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={`/explore?domain=${domain.predictionDomain}`}
                    className="text-brand-400 hover:text-brand-300 ml-auto"
                  >
                    View in Prediction Explorer &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No domains match the current filter.</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="mt-3 text-brand-400 hover:text-brand-300 text-sm"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

export default DomainStatusExplorer;
