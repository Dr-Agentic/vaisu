import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

import {
  GraphViewerLayout,
  GraphEntityCard,
  DynamicBezierPath,
  GraphBackground,
  GraphConnectionModal,
  GraphEdgeLayer,
} from '../toolkit';
import { GraphNode } from '../toolkit/types';

import { useKnowledgeGraphInteractions, useSectorTitles } from './hooks/useKnowledgeGraphLayout';
import { useKnowledgeGraphStore } from './stores/knowledgeGraphStore';
import { KnowledgeNode, KnowledgeGraphData } from './types';

/**
 * Convert KnowledgeNode to GraphNode for toolkit compatibility
 */
const convertToGraphNode = (node: KnowledgeNode): GraphNode => ({
  id: node.id,
  type: node.type,
  label: node.label,
  description: node.metadata.description,
  importance: node.confidence,
  context: node.metadata.category,
  mentions: node.metadata.sources,
  metadata: {
    ...node.metadata,
    confidence: node.confidence,
  },
});

interface KnowledgeGraphProps {
  data?: KnowledgeGraphData;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data }) => {
  const {
    nodes,
    initializeGraph,
    isInitialized,
    error,
    edges,
    columnWidth,
  } = useKnowledgeGraphStore();

  // Initialize store from props
  useEffect(() => {
    if (data && data.nodes && data.edges) {
      // Only initialize if data has changed or not initialized
      initializeGraph(data.nodes, data.edges);
    }
  }, [data, initializeGraph]);

  const {
    handleNodeClick,
    handleNodeHover,
    handleEdgeHover,
    selectedNodeId,
    hoveredEdgeId,
  } = useKnowledgeGraphInteractions();

  const { getColumnData } = useSectorTitles();
  const columnData = getColumnData();

  // State for tracked coordinates of cards for SVG lines
  const [coords, setCoords] = useState<Record<string, { x: number, y: number }>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to update coordinates based on DOM positions
  const updateCoords = useCallback(() => {
    const newCoords: Record<string, { x: number, y: number }> = {};
    const container = scrollContainerRef.current;
    if (!container) return;

    // We calculate coordinates relative to the inner content div
    const contentRect = container.querySelector('.kg-content-wrapper')?.getBoundingClientRect();
    if (!contentRect) return;

    nodes.forEach(node => {
      const el = cardRefs.current[node.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[node.id] = {
          x: rect.left - contentRect.left + rect.width / 2,
          y: rect.top - contentRect.top + rect.height / 2,
        };
      }
    });
    setCoords(newCoords);
  }, [nodes]);

  // Track resizing and scrolling to keep lines aligned
  useEffect(() => {
    if (!isInitialized || nodes.length === 0) return;

    const observer = new ResizeObserver(() => updateCoords());
    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      observer.observe(scrollContainer);
      scrollContainer.addEventListener('scroll', updateCoords, { capture: true });
    }

    // Settling timeout
    const timeout = setTimeout(updateCoords, 100);

    return () => {
      observer.disconnect();
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateCoords, { capture: true });
      }
      clearTimeout(timeout);
    };
  }, [isInitialized, nodes.length, updateCoords]);

  // Initialize graph if needed
  useEffect(() => {
    if (!isInitialized && nodes.length > 0) {
      initializeGraph(nodes, edges);
    }
  }, [nodes.length, isInitialized, initializeGraph, edges]);

  // Derived Edge Data
  const graphEdges = useMemo(() => edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.relation,
    strength: e.weight,
    rationale: e.evidence?.join('; '),
  })), [edges]);

  const activeEdge = useMemo(() =>
    hoveredEdgeId ? graphEdges.find(e => e.id === hoveredEdgeId) || null : null,
  [hoveredEdgeId, graphEdges]);

  const activeSourceNode = useMemo(() =>
    activeEdge ? nodes.find(n => n.id === activeEdge.source) : undefined,
  [activeEdge, nodes]);

  const activeTargetNode = useMemo(() =>
    activeEdge ? nodes.find(n => n.id === activeEdge.target) : undefined,
  [activeEdge, nodes]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-red-100 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">System Error</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold">Reload Engine</button>
        </div>
      </div>
    );
  }

  if (!isInitialized && nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-mono text-sm uppercase tracking-widest">
        Waiting for neural data stream...
      </div>
    );
  }

  return (
    <GraphViewerLayout
      title="Neural Knowledge Graph"
      description="Hierarchical mapping of entities and relationships using natural flow."
    >
      <div className="relative w-full h-full bg-slate-50">
        <GraphBackground />

        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-auto custom-scrollbar"
        >
          <div className="kg-content-wrapper flex gap-24 p-24 min-w-max min-h-full relative z-10">
            {/* Sector Columns */}
            {columnData.map((column, i) => (
              <div key={column.id} className="flex flex-col gap-12" style={{ width: columnWidth }}>
                {/* Header */}
                <div className="flex flex-col gap-4 mb-4 sticky top-0 bg-slate-50/80 backdrop-blur py-4 z-30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-purple-600' : 'bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.4)]'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-[0.5em] text-gradient ${i === 1 ? 'nova' : ''}`}>
                      {column.title}
                    </span>
                  </div>
                  <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Nodes in this column */}
                <div className="flex flex-col gap-12">
                  {column.nodes.map((node) => (
                    <div
                      key={node.id}
                      ref={el => cardRefs.current[node.id] = el}
                      className="transition-transform duration-300"
                    >
                      <GraphEntityCard
                        node={convertToGraphNode(node)}
                        isSelected={selectedNodeId === node.id}
                        isRelated={selectedNodeId !== null && edges.some(e => (e.source === node.id && e.target === selectedNodeId) || (e.target === node.id && e.source === selectedNodeId))}
                        isDimmed={selectedNodeId !== null && selectedNodeId !== node.id && !edges.some(e => (e.source === node.id && e.target === selectedNodeId) || (e.target === node.id && e.source === selectedNodeId))}
                        onClick={() => handleNodeClick(node.id)}
                        onMouseEnter={() => handleNodeHover(node.id)}
                        onMouseLeave={() => handleNodeHover(null)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Connection Layer Overlaid */}
            <GraphEdgeLayer>
              {graphEdges.map((edge) => {
                const s = coords[edge.source];
                const t = coords[edge.target];
                if (!s || !t) return null;

                return (
                  <g
                    key={edge.id}
                    onMouseEnter={() => handleEdgeHover(edge.id)}
                    onMouseLeave={() => handleEdgeHover(null)}
                    className="cursor-pointer"
                  >
                    <DynamicBezierPath
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                      label={edge.type}
                      isActive={hoveredEdgeId === edge.id}
                    />
                    <path d={`M ${s.x} ${s.y} L ${t.x} ${t.y}`} stroke="transparent" strokeWidth="25" fill="none" className="pointer-events-auto" />
                  </g>
                );
              })}
            </GraphEdgeLayer>
          </div>
        </div>

        <GraphConnectionModal
          edge={activeEdge ? { ...activeEdge, source: activeEdge.source, target: activeEdge.target, type: activeEdge.type || 'linked', strength: activeEdge.strength || 0.5, rationale: activeEdge.rationale || '' } : null}
          sourceNode={activeSourceNode ? convertToGraphNode(activeSourceNode) : undefined}
          targetNode={activeTargetNode ? convertToGraphNode(activeTargetNode) : undefined}
          onClose={() => handleEdgeHover(null)}
        />
      </div>
    </GraphViewerLayout>
  );
};
