import React, { useEffect, useMemo } from 'react';
import { useKnowledgeGraphStore } from './stores/knowledgeGraphStore';
import { useKnowledgeGraphInteractions, useSectorTitles } from './hooks/useKnowledgeGraphLayout';
import { 
  GraphViewerLayout,
  GraphEntityCard, 
  DynamicBezierPath, 
  GraphBackground, 
  GraphConnectionModal,
  GraphCanvas,
  GraphEdgeLayer
} from '../toolkit';
import { GraphNode } from '../toolkit/types';
import { KnowledgeNode } from './types';

/**
 * Knowledge Graph Visualization Component
 * Displays nodes and edges in a hierarchical grid layout with sector headers
 */

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
    columnWidth
  } = useKnowledgeGraphStore();

  const {
    handleNodeClick,
    handleNodeHover,
    handleEdgeHover,
    selectedNodeId,
    hoveredEdgeId
  } = useKnowledgeGraphInteractions();

  const { getColumnData } = useSectorTitles();
  const columnData = getColumnData();

  // Initialize graph if needed
  useEffect(() => {
    if (!isInitialized && nodes.length > 0) {
      initializeGraph(nodes, edges);
    }
  }, [nodes.length, isInitialized, initializeGraph, edges]);

  // Derived Data
  const graphNodes = useMemo(() => nodes.map(convertToGraphNode), [nodes]);
  
  const graphEdges = useMemo(() => edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.relation,
    strength: e.weight,
    rationale: e.evidence?.join('; ')
  })), [edges]);

    const canvasBounds = useMemo(() => {

      if (nodes.length === 0) return { width: '100%', height: '100%' };

      const maxX = Math.max(...nodes.map(n => n.x || 0));

      const maxY = Math.max(...nodes.map(n => n.y || 0));

      return {

        width: Math.max(maxX + columnWidth + 400, 1200), // Ensure minimum width and extra padding

        height: Math.max(maxY + 600, 800)

      };

    }, [nodes, columnWidth]);

  

    const activeEdge = useMemo(() => 

      hoveredEdgeId ? graphEdges.find(e => e.id === hoveredEdgeId) || null : null,

    [hoveredEdgeId, graphEdges]);

  

    const activeSourceNode = useMemo(() => 

      activeEdge ? graphNodes.find(n => n.id === activeEdge.source) : undefined,

    [activeEdge, graphNodes]);

  

    const activeTargetNode = useMemo(() => 

      activeEdge ? graphNodes.find(n => n.id === activeEdge.target) : undefined,

    [activeEdge, graphNodes]);

  

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

        description="Hierarchical mapping of entities, technical concepts, and causal relationships."

      >

        <div className="relative w-full h-full overflow-auto bg-slate-50 custom-scrollbar">

          <GraphCanvas>

            <div style={{ width: canvasBounds.width, height: canvasBounds.height, position: 'relative' }}>

              <GraphBackground />

              

              {/* Sector Headers */}

              <div className="absolute top-12 left-0 w-full pointer-events-none z-10">

                {columnData.map((column, i) => {

                  const firstNodeInCol = column.nodes[0];

                  if (!firstNodeInCol) return null;

                  

                  return (

                    <div 

                      key={column.id} 

                      style={{ 

                        position: 'absolute',

                        left: (firstNodeInCol.x || 0) - 160, 

                        width: columnWidth,

                        paddingLeft: '24px'

                      }} 

                      className="flex flex-col gap-4"

                    >

                      <div className="flex items-center gap-3">

                        <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-purple-600' : 'bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.4)]'}`} />

                        <span className={`text-[11px] font-black uppercase tracking-[0.5em] text-gradient ${i === 1 ? 'nova' : ''}`}>

                          {column.title}

                        </span>

                      </div>

                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

                    </div>

                  );

                })}

              </div>

  

              {/* Connections */}

              <GraphEdgeLayer>

                {graphEdges.map((edge) => {

                  const s = nodes.find(n => n.id === edge.source);

                  const t = nodes.find(n => n.id === edge.target);

                  if (!s || !t || s.x === undefined || t.x === undefined) return null;

  

                  return (

                    <g 

                      key={edge.id} 

                      onMouseEnter={() => handleEdgeHover(edge.id)}

                      onMouseLeave={() => handleEdgeHover(null)}

                      className="cursor-pointer"

                    >

                      <DynamicBezierPath

                        x1={s.x} y1={s.y!} x2={t.x} y2={t.y!}

                        label={edge.type}

                        isActive={hoveredEdgeId === edge.id}

                      />

                      <path d={`M ${s.x} ${s.y} L ${t.x} ${t.y}`} stroke="transparent" strokeWidth="20" fill="none" className="pointer-events-auto" />

                    </g>

                  );

                })}

              </GraphEdgeLayer>

  

              {/* Entities */}

              <div className="absolute inset-0 pointer-events-none">

                {nodes.map((node) => {

                  if (node.x === undefined || node.y === undefined) return null;

                  return (

                    <div

                      key={node.id}

                      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"

                      style={{ left: node.x, top: node.y }}

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

                  );

                })}

              </div>

            </div>

          </GraphCanvas>

  

          <GraphConnectionModal

            edge={activeEdge}

            sourceNode={activeSourceNode}

            targetNode={activeTargetNode}

            onClose={() => handleEdgeHover(null)}

          />

        </div>

      </GraphViewerLayout>

    );

  };
