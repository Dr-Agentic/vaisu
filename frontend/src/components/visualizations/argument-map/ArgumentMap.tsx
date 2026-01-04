import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  GraphViewerLayout,
  GraphCanvas,
  GraphBackground,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphEntityCard,
  GraphConnectionModal,
  GraphNode,
  GraphEdge
} from '../../visualizations/toolkit';
import { useArgumentMapStore } from './stores/argumentMapStore';
import { ArgumentMapProps, ArgumentNode, ArgumentEdge, transformBackendDataToArgumentMap } from './types';


// Layout Constants
const COL_WIDTH = 320; // w-80
const COL_GAP = 100;
const START_X = 100;
const START_Y = 220; // Increased from 150 for more header space

// Helper to map ArgumentNode to Toolkit GraphNode
const mapNodeToGraphNode = (node: ArgumentNode, x: number, y: number): GraphNode => ({
  id: node.id,
  type: node.type,
  label: node.text,
  description: node.metadata?.description,
  importance: node.confidence,
  context: node.metadata?.category,
  mentions: [node.metadata?.source].filter(Boolean) as string[],
  metadata: node.metadata,
  x,
  y
});

const mapEdgeToGraphEdge = (edge: ArgumentEdge): GraphEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: edge.type,
  strength: edge.strength,
  rationale: edge.metadata?.description
});

export const ArgumentMap: React.FC<ArgumentMapProps> = ({ data }) => {
  const store = useArgumentMapStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);

  // Initialize Data from props
  useEffect(() => {
    if (data) {
      // Transform backend data to frontend format
      const transformedData = transformBackendDataToArgumentMap(data as any);
      store.loadVisualization(transformedData);
    }
  }, [data, store.loadVisualization]);

  // Deterministic Grid Layout
  const graphNodes = useMemo(() => {
    // 1. Group by Type (Column Logic)
    const columns: Record<string, ArgumentNode[]> = {
      'CLAIM': [],
      'EVIDENCE': [],
      'CONCLUSION': []
    };

    store.nodes.forEach(node => {
      if (columns[node.type]) {
        columns[node.type].push(node);
      } else {
        // Fallback for unknown types
        if (!columns['OTHER']) columns['OTHER'] = [];
        columns['OTHER'].push(node);
      }
    });

    // 2. Define visual columns order
    const colOrder = ['CLAIM', 'EVIDENCE', 'OTHER', 'CONCLUSION'];
    
    // 3. Calculate Positions
    const calculatedNodes: GraphNode[] = [];
    let currentX = START_X;

    colOrder.forEach((colType) => {
      const nodesInCol = columns[colType] || [];
      if (nodesInCol.length === 0) return;

      let currentY = START_Y;
      
      nodesInCol.forEach(node => {
        // Center the card: X is center, Y is center? 
        // GraphEntityCard usually positions top-left if we use simple divs, 
        // but DynamicBezierPath expects centers usually.
        // Let's assume (x,y) is the CENTER of the card for edges, 
        // but for rendering the card div we subtract width/2.
        
        calculatedNodes.push(mapNodeToGraphNode(node, currentX + COL_WIDTH/2, currentY));
        currentY += 400; // Height of card + gap
      });

      currentX += COL_WIDTH + COL_GAP;
    });

    return calculatedNodes;
  }, [store.nodes]);

  const graphEdges = useMemo(() => 
    store.edges.map(mapEdgeToGraphEdge), 
  [store.edges]);

  const activeEdge = useMemo(() => 
    activeEdgeId ? graphEdges.find(e => e.id === activeEdgeId) || null : null,
  [activeEdgeId, graphEdges]);

  const activeSourceNode = useMemo(() => 
    activeEdge ? graphNodes.find(n => n.id === activeEdge.source) : undefined,
  [activeEdge, graphNodes]);

  const activeTargetNode = useMemo(() => 
    activeEdge ? graphNodes.find(n => n.id === activeEdge.target) : undefined,
  [activeEdge, graphNodes]);

  const handleNodeClick = (id: string) => {
    store.selectNode(id);
    setActiveEdgeId(null);
  };

  const handleBackgroundClick = () => {
    store.selectNode(null);
    setActiveEdgeId(null);
  };

  if (store.isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <GraphViewerLayout
      title="Semantic Argument Map"
      description="Kinetic visualization of argument structures."
    >
      <div ref={containerRef} className="relative w-full h-full overflow-auto bg-slate-50 blueprint-grid" onClick={handleBackgroundClick}>
        <GraphBackground />
        
        {/* Render Column Headers */}
        <div className="absolute top-12 left-[100px] flex gap-[100px] pointer-events-none">
           {['Claims', 'Evidence', 'Conclusion'].map((title, i) => (
             <div key={title} style={{ width: COL_WIDTH }} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-purple-600' : 'bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]'}`} />
                   <span className={`text-[11px] font-black uppercase tracking-[0.5em] ${i === 1 ? 'text-gradient nova' : 'text-gradient'}`}>
                     {title}
                   </span>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
             </div>
           ))}
        </div>

        <GraphCanvas>
          {/* Edges Layer */}
          <GraphEdgeLayer>
            {store.edges.map(edge => {
              const source = graphNodes.find(n => n.id === edge.source);
              const target = graphNodes.find(n => n.id === edge.target);
              
              if (!source || !target) return null;
              
              const isSelected = activeEdgeId === edge.id;

              return (
                <g key={edge.id} onClick={(e) => { e.stopPropagation(); setActiveEdgeId(edge.id); }} className="cursor-pointer">
                   <DynamicBezierPath
                    x1={source.x!}
                    y1={source.y!}
                    x2={target.x!}
                    y2={target.y!}
                    label={edge.type}
                    isActive={isSelected}
                  />
                  {/* Invisible hit area */}
                  <path 
                     d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`} 
                     stroke="transparent" 
                     strokeWidth="20" 
                     fill="none" 
                     className="pointer-events-auto"
                  />
                </g>
              );
            })}
          </GraphEdgeLayer>

          {/* Nodes Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {graphNodes.map(node => (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-[100px] pointer-events-auto"
                style={{ left: node.x, top: node.y }}
              >
                <GraphEntityCard
                  node={node}
                  isSelected={store.selectedNodeId === node.id}
                  isRelated={false} 
                  isDimmed={store.selectedNodeId !== null && store.selectedNodeId !== node.id}
                  onClick={handleNodeClick}
                />
              </div>
            ))}
          </div>
        </GraphCanvas>

        {/* Edge Detail Modal */}
        <GraphConnectionModal
          edge={activeEdge}
          sourceNode={activeSourceNode}
          targetNode={activeTargetNode}
          onClose={() => setActiveEdgeId(null)}
        />
      </div>
    </GraphViewerLayout>
  );
};
