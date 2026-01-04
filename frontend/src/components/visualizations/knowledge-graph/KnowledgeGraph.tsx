import React, { useEffect, useMemo } from 'react';
import { useKnowledgeGraphStore } from './stores/knowledgeGraphStore';
import { useKnowledgeGraphLayout, useKnowledgeGraphInteractions, useSectorTitles } from './hooks/useKnowledgeGraphLayout';
import { GraphEntityCard } from '../toolkit/GraphEntityCard';
import { DynamicBezierPath } from '../toolkit/DynamicBezierPath';
import { GraphBackground } from '../toolkit/GraphBackground';
import { GraphConnectionModal } from '../toolkit/GraphConnectionModal';
import { GraphCanvas } from '../toolkit/GraphCanvas';
import { GraphEdgeLayer } from '../toolkit/GraphEdgeLayer';
import { GraphNode } from '../toolkit/types';
import { KnowledgeNode } from './types';

/**
 * Convert KnowledgeNode to GraphNode for toolkit compatibility
 */
const convertToGraphNode = (node: KnowledgeNode): GraphNode => ({
  id: node.id,
  type: node.type,
  label: node.label,
  description: node.metadata.description,
  importance: node.confidence,
  context: node.metadata.category, // Use category as context
  mentions: node.metadata.sources,
  metadata: {
    ...node.metadata,
    confidence: node.confidence
  },
  x: node.x,
  y: node.y
});

export const KnowledgeGraph: React.FC = () => {
  const {
    nodes,
    initializeGraph,
    isInitialized,
    error,
    edges,
    columnWidth,
    spacing
  } = useKnowledgeGraphStore();

  // Interaction management
  const {
    handleNodeClick,
    handleNodeHover,
    handleEdgeHover,
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId
  } = useKnowledgeGraphInteractions();

  // Sector title management
  const { getColumnData } = useSectorTitles();
  const columnData = getColumnData();

  // Initialize graph if needed (only once)
  useEffect(() => {
    if (!isInitialized && nodes.length > 0) {
      // If data is already in store but not flagged initialized (e.g. hydration), init
      initializeGraph(nodes, edges);
    }
  }, [nodes.length, isInitialized, initializeGraph, edges]);

  // Handle active edge details
  const activeEdge = useMemo(() => 
    hoveredEdgeId ? edges.find(e => e.id === hoveredEdgeId) || null : null,
  [hoveredEdgeId, edges]);

  const activeSourceNode = useMemo(() => 
    activeEdge ? nodes.find(n => n.id === activeEdge.source) : undefined,
  [activeEdge, nodes]);

  const activeTargetNode = useMemo(() => 
    activeEdge ? nodes.find(n => n.id === activeEdge.target) : undefined,
  [activeEdge, nodes]);


  if (error) {
    return (
      <div className="knowledge-graph-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Knowledge Graph Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Graph</button>
        </div>
      </div>
    );
  }

  if (!isInitialized && nodes.length === 0) {
    return (
      <div className="knowledge-graph-empty">
        <div className="empty-content">
          <div className="empty-icon">🕸️</div>
          <h3>No Knowledge Graph Data</h3>
          <p>Select a document with a knowledge graph visualization to view it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph-container relative w-full h-full overflow-hidden bg-slate-50">
      <GraphBackground />

      <GraphCanvas>
        {/* Render Column Headers (Absolute) */}
        <div className="absolute top-12 left-0 w-full pointer-events-none z-10">
           {columnData.map((column, i) => (
             <div 
                key={column.id} 
                style={{ 
                    position: 'absolute',
                    left: column.id * (columnWidth + spacing) + 100, // Match store layout padding
                    width: columnWidth,
                    paddingLeft: '24px'
                }} 
                className="flex flex-col gap-4"
             >
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-purple-600' : 'bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]'}`} />
                   <span className={`text-[11px] font-black uppercase tracking-[0.5em] text-gradient ${i === 1 ? 'nova' : ''}`}>
                     {column.title}
                   </span>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
             </div>
           ))}
        </div>

        {/* Edges Layer */}
        <GraphEdgeLayer>
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;
            if (sourceNode.x === undefined || sourceNode.y === undefined) return null;
            if (targetNode.x === undefined || targetNode.y === undefined) return null;

            return (
              <g 
                key={edge.id} 
                onMouseEnter={() => handleEdgeHover(edge.id)}
                onMouseLeave={() => handleEdgeHover(null)}
                className="cursor-pointer"
              >
                <DynamicBezierPath
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  label={edge.relation}
                  isActive={hoveredEdgeId === edge.id}
                />
                 {/* Invisible hit area */}
                  <path 
                     d={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`} 
                     stroke="transparent" 
                     strokeWidth="15" 
                     fill="none" 
                     className="pointer-events-auto"
                  />
              </g>
            );
          })}
        </GraphEdgeLayer>

        {/* Nodes Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => {
             if (node.x === undefined || node.y === undefined) return null;
             const graphNode = convertToGraphNode(node);
             
             return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: node.x, top: node.y }}
              >
                <GraphEntityCard
                  node={graphNode}
                  isSelected={selectedNodeId === node.id}
                  isHovered={hoveredNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => handleNodeHover(node.id)}
                  onMouseLeave={() => handleNodeHover(null)}
                />
              </div>
            );
          })}
        </div>
      </GraphCanvas>

      {/* Graph Connection Modal */}
      <GraphConnectionModal
        edge={activeEdge ? { ...activeEdge, source: activeEdge.source, target: activeEdge.target, type: activeEdge.relation, strength: activeEdge.weight, rationale: activeEdge.evidence?.join('; ') } : null}
        sourceNode={activeSourceNode ? convertToGraphNode(activeSourceNode) : undefined}
        targetNode={activeTargetNode ? convertToGraphNode(activeTargetNode) : undefined}
        onClose={() => handleEdgeHover(null)}
      />
    </div>
  );
};
