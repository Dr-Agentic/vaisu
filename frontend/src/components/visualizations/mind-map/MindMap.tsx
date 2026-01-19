import { MindMapData } from '@shared/types';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

import {
  GraphViewerLayout,
  GraphBackground,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphEntityCard,
} from '../toolkit';
import { MindMapGraphNode } from './types';

import { useMindMapStore } from './stores/mindMapStore';
import { transformMindMapData } from './utils/dataTransformers';

interface MindMapProps {
  data: MindMapData;
}

// Helper to build tree structure from flat nodes
interface TreeNode extends MindMapGraphNode {
  children: TreeNode[];
}

const buildTree = (nodes: MindMapGraphNode[], rootId: string): TreeNode | null => {
  const nodeMap = new Map<string, TreeNode>();
  
  // 1. Create all TreeNode wrappers
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  // 2. Link children
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id);
    if (treeNode) {
      node.metadata.childrenIds.forEach((childId: string) => {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          treeNode.children.push(childNode);
        }
      });
    }
  });

  return nodeMap.get(rootId) || null;
};

export const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const store = useMindMapStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [coords, setCoords] = useState<Record<string, { x: number, y: number }>>({});

  // Initialize store with data
  useEffect(() => {
    if (data && data.root) {
      const { nodes, edges, rootId } = transformMindMapData(data);
      store.setGraphData(nodes, edges, rootId || '');
    }
  }, [data]);

  const rootNode = useMemo(() => {
    if (!store.rootId || store.nodes.length === 0) return null;
    return buildTree(store.nodes, store.rootId);
  }, [store.nodes, store.rootId]);

  // Coordinate Tracking (ResizeObserver)
  const updateCoords = useCallback(() => {
    if (!contentRef.current) return;
    
    const contentRect = contentRef.current.getBoundingClientRect();
    const newCoords: Record<string, { x: number, y: number }> = {};

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[id] = {
          x: rect.left - contentRect.left + rect.width / 2,
          y: rect.top - contentRect.top + rect.height / 2,
        };
      }
    });

    setCoords(newCoords);
  }, [store.nodes, store.expandedNodeIds]); // Re-run if structure changes

  useEffect(() => {
    const observer = new ResizeObserver(() => updateCoords());
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    // Initial calculation
    setTimeout(updateCoords, 100);
    return () => observer.disconnect();
  }, [updateCoords]);

  // Force update when expansion changes to allow animation to settle
  useEffect(() => {
    const timer = setTimeout(updateCoords, 350); // Match transition duration
    return () => clearTimeout(timer);
  }, [store.expandedNodeIds, updateCoords]);


  // Recursive Node Renderer
  const RenderNode = ({ node }: { node: TreeNode }) => {
    const isExpanded = store.expandedNodeIds.has(node.id);
    const isSelected = store.selectedNodeId === node.id;
    
    // Aurora Logic
    const isAurora = useMemo(() => {
        if (!store.selectedNodeId) return false;
        const selectedNode = store.nodes.find(n => n.id === store.selectedNodeId);
        return selectedNode?.metadata.childrenIds.includes(node.id);
    }, [store.selectedNodeId, node.id, store.nodes]);

    const auroraClass = isAurora
      ? 'ring-2 ring-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.3)] border-teal-200'
      : '';

    return (
      <div className="flex flex-row items-center">
        {/* Node Card Wrapper */}
        <div className="relative flex flex-col items-center z-10">
          <div ref={el => (cardRefs.current[node.id] = el)}>
            <GraphEntityCard
              node={node}
              isSelected={isSelected}
              isRelated={false}
              isDimmed={store.selectedNodeId !== null && !isSelected && !isAurora}
              onClick={(id) => store.selectNode(id)}
              className={auroraClass}
              // Allow card to size itself naturally
              style={{ position: 'relative', width: '320px', left: 'auto', top: 'auto' }}
              onMouseEnter={() => setTimeout(updateCoords, 350)} 
              onMouseLeave={() => setTimeout(updateCoords, 350)}
            />
          </div>

          {/* Expansion Toggle Button */}
          {node.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                store.toggleNodeExpansion(node.id);
              }}
              className={`
                mt-2 z-20 flex items-center justify-center w-6 h-6 rounded-full 
                border shadow-sm transition-all duration-200
                ${isExpanded 
                  ? 'bg-[var(--color-surface-base)] border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-background-secondary)]' 
                  : 'bg-[var(--color-primary)] border-transparent text-white hover:brightness-110 shadow-md'}
              `}
            >
              <span className="text-[10px] font-bold leading-none">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
          )}
        </div>

        {/* Children Column */}
        {isExpanded && node.children.length > 0 && (
          <div className="flex flex-col gap-8 ml-24 border-l-2 border-[var(--color-border-subtle)]/30 pl-8 py-4">
            {node.children.map(child => (
              <RenderNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleBackgroundClick = () => {
    store.selectNode(null);
  };

  // Filter edges for visible nodes
  // We can just iterate over the full edges list and check if both ends are in `coords`
  // This is simpler than tracking "visibleNodes" manually
  const visibleEdges = useMemo(() => {
    return store.edges.filter(edge => coords[edge.source] && coords[edge.target]);
  }, [store.edges, coords]);

  return (
    <GraphViewerLayout
      title="Mind Map"
      description="Hierarchical exploration of concepts with progressive disclosure."
    >
      <div
        className="relative w-full h-full overflow-auto bg-[var(--color-surface-base)] blueprint-grid"
        onClick={handleBackgroundClick}
      >
        <GraphBackground />

        <div 
            ref={contentRef}
            className="relative min-w-max min-h-full p-16"
        >
             {/* Render Root (and recursively children) */}
             {rootNode && <RenderNode node={rootNode} />}

             {/* Edges Layer */}
             <GraphEdgeLayer>
              {visibleEdges.map(edge => {
                const s = coords[edge.source];
                const t = coords[edge.target];
                if (!s || !t) return null;

                const isSelected = store.selectedNodeId === edge.source || store.selectedNodeId === edge.target;

                return (
                  <DynamicBezierPath
                    key={edge.id}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    label={edge.type !== 'relates-to' ? edge.type : undefined}
                    isActive={isSelected}
                  />
                );
              })}
             </GraphEdgeLayer>
        </div>
      </div>
    </GraphViewerLayout>
  );
};
