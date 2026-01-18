import React, { useEffect, useMemo, useRef } from 'react';

import { MindMapData } from '@shared/types';
import {
  GraphViewerLayout,
  GraphCanvas,
  GraphBackground,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphEntityCard,
} from '../toolkit';

import { useMindMapLayout } from './hooks/useMindMapLayout';
import { useMindMapStore } from './stores/mindMapStore';
import { transformMindMapData } from './utils/dataTransformers';

interface MindMapProps {
  data: MindMapData;
}

export const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const store = useMindMapStore();
  const { visibleNodes, totalWidth, totalHeight } = useMindMapLayout();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize store with data
  useEffect(() => {
    if (data && data.root) {
      const { nodes, edges, rootId } = transformMindMapData(data);
      store.setGraphData(nodes, edges, rootId || '');
    }
  }, [data]);

  const handleNodeClick = (id: string) => {
    store.selectNode(id);
  };

  const handleBackgroundClick = () => {
    store.selectNode(null);
  };

  // Calculate edges for visible nodes
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return store.edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
    );
  }, [store.edges, visibleNodes]);

  // Helper to determine if a node is a child of the selected node (for Aurora effect)
  const isChildOfSelected = (nodeId: string) => {
    if (!store.selectedNodeId) return false;
    const selectedNode = store.nodes.find(n => n.id === store.selectedNodeId);
    return selectedNode?.metadata.childrenIds.includes(nodeId);
  };

  return (
    <GraphViewerLayout
      title="Mind Map"
      description="Hierarchical exploration of concepts with progressive disclosure."
    >
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-auto bg-slate-50 blueprint-grid"
        onClick={handleBackgroundClick}
      >
        <GraphBackground />

        {/* Canvas Container with dynamic size based on layout */}
        <div
          style={{
            width: Math.max(totalWidth + 400, 2000),
            height: Math.max(totalHeight + 400, 1200),
            position: 'relative',
          }}
        >
          <GraphCanvas>
            {/* Edges Layer */}
            <GraphEdgeLayer>
              {visibleEdges.map(edge => {
                const source = visibleNodes.find(n => n.id === edge.source);
                const target = visibleNodes.find(n => n.id === edge.target);

                if (!source || !target) return null;

                const isSelected = store.selectedNodeId === edge.source || store.selectedNodeId === edge.target;

                return (
                  <g key={edge.id}>
                    <DynamicBezierPath
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      label={edge.type !== 'relates-to' ? edge.type : undefined}
                      isActive={isSelected}
                    />
                  </g>
                );
              })}
            </GraphEdgeLayer>

            {/* Nodes Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {visibleNodes.map(node => {
                const isSelected = store.selectedNodeId === node.id;
                const isAurora = isChildOfSelected(node.id);

                // Aurora Style: Soft teal glow for children of selected node
                const auroraClass = isAurora
                  ? 'ring-2 ring-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.3)] border-teal-200'
                  : '';

                return (
                  <div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 ease-in-out"
                    style={{ left: node.x, top: node.y }}
                  >
                    <GraphEntityCard
                      node={node}
                      isSelected={isSelected}
                      isRelated={false}
                      isDimmed={store.selectedNodeId !== null && !isSelected && !isAurora}
                      onClick={handleNodeClick}
                      className={auroraClass}
                    />

                    {/* Expansion Indicator (if has hidden children) */}
                    {node.metadata.childrenIds.length > 0 && !store.expandedNodeIds.has(node.id) && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-300 shadow-sm">
                        +{node.metadata.childrenIds.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GraphCanvas>
        </div>
      </div>
    </GraphViewerLayout>
  );
};
