import { useState, useMemo, useCallback } from 'react';
import type { FC } from 'react';

// --- Types ---
interface GraphNode {
  id: string;
  label: string;
  type: 'axiom' | 'theorem' | 'definition' | 'prediction' | 'import' | 'assumption';
  layer: number;
  description: string;
  status: string;
  script?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  tag: 'A' | 'I' | 'D';
}

interface Chain {
  id: string;
  name: string;
  description: string;
  target: string;
  highlight: string[];
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  chains: Chain[];
}

interface Props {
  graphData: GraphData;
}

// --- Style constants ---
const NODE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  axiom:      { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', glow: 'rgba(59,130,246,0.3)' },
  theorem:    { bg: '#1a3d2e', border: '#22c55e', text: '#86efac', glow: 'rgba(34,197,94,0.3)' },
  definition: { bg: '#3b2e1a', border: '#f59e0b', text: '#fcd34d', glow: 'rgba(245,158,11,0.3)' },
  prediction: { bg: '#3b1a3b', border: '#a855f7', text: '#d8b4fe', glow: 'rgba(168,85,247,0.3)' },
  import:     { bg: '#3b2a1a', border: '#f97316', text: '#fdba74', glow: 'rgba(249,115,22,0.3)' },
  assumption: { bg: '#3b3b1a', border: '#eab308', text: '#fde047', glow: 'rgba(234,179,8,0.3)' },
};

const TAG_COLORS: Record<string, string> = {
  A: '#3b82f6',
  I: '#f97316',
  D: '#22c55e',
};

const TAG_LABELS: Record<string, string> = {
  A: 'Axiom',
  I: 'Import',
  D: 'Derived',
};

// --- Layout computation ---
function computeLayout(nodes: GraphNode[], edges: GraphEdge[], highlightSet: Set<string>) {
  // Filter to highlighted nodes (or all if none highlighted)
  const activeNodes = highlightSet.size > 0
    ? nodes.filter(n => highlightSet.has(n.id))
    : nodes;

  const activeIds = new Set(activeNodes.map(n => n.id));
  const activeEdges = edges.filter(e => activeIds.has(e.source) && activeIds.has(e.target));

  // Group by layer
  const layerMap = new Map<number, GraphNode[]>();
  for (const node of activeNodes) {
    const arr = layerMap.get(node.layer) || [];
    arr.push(node);
    layerMap.set(node.layer, arr);
  }

  const layers = Array.from(layerMap.keys()).sort((a, b) => a - b);
  const maxInLayer = Math.max(...Array.from(layerMap.values()).map(a => a.length), 1);

  const NODE_W = 156;
  const NODE_H = 44;
  const LAYER_GAP_Y = 80;
  const NODE_GAP_X = 16;

  const totalWidth = Math.max((maxInLayer * (NODE_W + NODE_GAP_X)) - NODE_GAP_X + 60, 600);
  const totalHeight = (layers.length * LAYER_GAP_Y) + 60;

  // Position nodes
  const positions = new Map<string, { x: number; y: number }>();
  for (const layer of layers) {
    const nodesInLayer = layerMap.get(layer) || [];
    const layerWidth = nodesInLayer.length * (NODE_W + NODE_GAP_X) - NODE_GAP_X;
    const startX = (totalWidth - layerWidth) / 2;
    const layerIndex = layers.indexOf(layer);
    const y = 30 + layerIndex * LAYER_GAP_Y;

    nodesInLayer.forEach((node, i) => {
      positions.set(node.id, {
        x: startX + i * (NODE_W + NODE_GAP_X),
        y,
      });
    });
  }

  return { positions, activeNodes, activeEdges, totalWidth, totalHeight, NODE_W, NODE_H };
}

// --- Component ---
const DerivationChainViewer: FC<Props> = ({ graphData }) => {
  const { nodes, edges, chains } = graphData;
  const [selectedChain, setSelectedChain] = useState<string>(chains[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const highlightSet = useMemo(() => {
    const chain = chains.find(c => c.id === selectedChain);
    return new Set(chain?.highlight || []);
  }, [chains, selectedChain]);

  const layout = useMemo(
    () => computeLayout(nodes, edges, highlightSet),
    [nodes, edges, highlightSet]
  );

  const selectedNodeData = useMemo(
    () => nodes.find(n => n.id === selectedNode) || null,
    [nodes, selectedNode]
  );

  // Edges connected to hovered node
  const hoveredEdges = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>();
    for (const e of layout.activeEdges) {
      if (e.source === hoveredNode || e.target === hoveredNode) {
        set.add(e.source);
        set.add(e.target);
      }
    }
    return set;
  }, [hoveredNode, layout.activeEdges]);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  const currentChain = chains.find(c => c.id === selectedChain);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Derivation Chains
          </h3>
          <div className="space-y-2">
            {chains.map(chain => (
              <button
                key={chain.id}
                onClick={() => { setSelectedChain(chain.id); setSelectedNode(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  selectedChain === chain.id
                    ? 'bg-brand-600/20 border border-brand-500/50 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                }`}
              >
                <div className="font-medium">{chain.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{chain.description}</div>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Node Types</h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(NODE_COLORS).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm border"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                  />
                  <span className="text-gray-400 capitalize">{type}</span>
                </div>
              ))}
            </div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-3">Edge Tags</h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(TAG_COLORS).map(([tag, color]) => (
                <div key={tag} className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
                  <span className="text-gray-400">[{tag}] {TAG_LABELS[tag]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main graph area */}
      <div className="flex-1 min-w-0">
        {/* Chain title */}
        {currentChain && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">{currentChain.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{currentChain.description}</p>
            <p className="text-xs text-gray-600 mt-1">
              {layout.activeNodes.length} nodes, {layout.activeEdges.length} edges. Click any node for details.
            </p>
          </div>
        )}

        {/* SVG Graph */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto">
          <svg
            width={layout.totalWidth}
            height={layout.totalHeight}
            viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
            className="min-w-full"
          >
            <defs>
              <marker id="arrow-A" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill={TAG_COLORS.A} />
              </marker>
              <marker id="arrow-I" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill={TAG_COLORS.I} />
              </marker>
              <marker id="arrow-D" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill={TAG_COLORS.D} />
              </marker>
            </defs>

            {/* Edges */}
            {layout.activeEdges.map((edge, i) => {
              const src = layout.positions.get(edge.source);
              const tgt = layout.positions.get(edge.target);
              if (!src || !tgt) return null;

              const x1 = src.x + layout.NODE_W / 2;
              const y1 = src.y + layout.NODE_H;
              const x2 = tgt.x + layout.NODE_W / 2;
              const y2 = tgt.y;
              const midY = (y1 + y2) / 2;

              const isHoverHighlighted = hoveredNode
                ? (edge.source === hoveredNode || edge.target === hoveredNode)
                : true;

              return (
                <path
                  key={`edge-${i}`}
                  d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                  fill="none"
                  stroke={TAG_COLORS[edge.tag] || '#666'}
                  strokeWidth={isHoverHighlighted ? 2 : 1}
                  opacity={isHoverHighlighted ? 0.7 : 0.15}
                  markerEnd={`url(#arrow-${edge.tag})`}
                />
              );
            })}

            {/* Nodes */}
            {layout.activeNodes.map(node => {
              const pos = layout.positions.get(node.id);
              if (!pos) return null;

              const colors = NODE_COLORS[node.type] || NODE_COLORS.theorem;
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const isConnected = hoveredNode ? hoveredEdges.has(node.id) : true;
              const opacity = hoveredNode ? (isConnected ? 1 : 0.3) : 1;

              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer', opacity }}
                >
                  {(isSelected || isHovered) && (
                    <rect
                      x={pos.x - 3}
                      y={pos.y - 3}
                      width={layout.NODE_W + 6}
                      height={layout.NODE_H + 6}
                      rx={10}
                      fill="none"
                      stroke={colors.border}
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  )}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={layout.NODE_W}
                    height={layout.NODE_H}
                    rx={8}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={pos.x + layout.NODE_W / 2}
                    y={pos.y + 17}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                  </text>
                  <text
                    x={pos.x + layout.NODE_W / 2}
                    y={pos.y + 32}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={8}
                    fontFamily="Inter, sans-serif"
                  >
                    [{node.type}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedNodeData && (
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm border"
                    style={{
                      backgroundColor: (NODE_COLORS[selectedNodeData.type] || NODE_COLORS.theorem).bg,
                      borderColor: (NODE_COLORS[selectedNodeData.type] || NODE_COLORS.theorem).border,
                    }}
                  />
                  <h3 className="text-lg font-semibold text-white">{selectedNodeData.label}</h3>
                  <span className="text-xs text-gray-500 font-mono">{selectedNodeData.id}</span>
                </div>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${
                  selectedNodeData.type === 'axiom' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  selectedNodeData.type === 'theorem' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  selectedNodeData.type === 'prediction' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                  selectedNodeData.type === 'import' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                  selectedNodeData.type === 'assumption' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                  'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedNodeData.type}
                </span>
                <span className={`inline-block mt-1 ml-2 text-xs px-2 py-0.5 rounded-full border ${
                  selectedNodeData.status === 'canonical' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  selectedNodeData.status === 'derivation' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                }`}>
                  {selectedNodeData.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-white text-lg leading-none cursor-pointer"
              >
                x
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-3">{selectedNodeData.description}</p>

            {/* Dependencies */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Depends On</h4>
                <div className="space-y-1">
                  {edges
                    .filter(e => e.target === selectedNodeData.id && highlightSet.has(e.source))
                    .map((e, i) => {
                      const src = nodes.find(n => n.id === e.source);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedNode(e.source)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TAG_COLORS[e.tag] }} />
                          <span>[{e.tag}]</span>
                          <span>{src?.label || e.source}</span>
                        </button>
                      );
                    })}
                  {edges.filter(e => e.target === selectedNodeData.id && highlightSet.has(e.source)).length === 0 && (
                    <span className="text-xs text-gray-600">Foundational (no dependencies)</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Used By</h4>
                <div className="space-y-1">
                  {edges
                    .filter(e => e.source === selectedNodeData.id && highlightSet.has(e.target))
                    .map((e, i) => {
                      const tgt = nodes.find(n => n.id === e.target);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedNode(e.target)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TAG_COLORS[e.tag] }} />
                          <span>[{e.tag}]</span>
                          <span>{tgt?.label || e.target}</span>
                        </button>
                      );
                    })}
                  {edges.filter(e => e.source === selectedNodeData.id && highlightSet.has(e.target)).length === 0 && (
                    <span className="text-xs text-gray-600">Terminal node</span>
                  )}
                </div>
              </div>
            </div>

            {selectedNodeData.script && (
              <div className="mt-3 text-xs text-gray-500">
                Verification: <span className="font-mono text-brand-400">{selectedNodeData.script}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DerivationChainViewer;
