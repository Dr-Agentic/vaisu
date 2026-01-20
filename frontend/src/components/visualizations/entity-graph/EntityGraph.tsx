import { EntityGraphData, EntityGraphNode } from '@shared/types';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';

import {
  GraphViewerLayout,
  GraphBackground,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphEntityCard,
  GraphConnectionModal,
} from '@/components/visualizations/toolkit';
import { GraphNode } from '@/components/visualizations/toolkit/types';

interface EntityGraphProps {
  data: EntityGraphData;
}

// Convert EntityGraphNode to standard GraphNode
const convertToGraphNode = (node: EntityGraphNode): GraphNode => ({
  id: node.id,
  type:
    node.type === 'mechanism'
      ? 'technical'
      : node.type === 'evidence'
        ? 'metric'
        : 'concept',
  label: node.label,
  description: node.summary,
  importance: node.depth / 10, // Normalize 0-10 to 0-1
  context: `Depth: ${node.depth}/10`,
  metadata: {
    centrality: node.clarityScore,
    connections: 0, // Will be calculated
    description: node.summary,
  },
});

export const EntityGraph: React.FC<EntityGraphProps> = ({ data }) => {
  const [coords, setCoords] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Prepare Nodes
  const nodes = useMemo(() => {
    if (!data?.nodes) return [];
    return data.nodes.map(convertToGraphNode);
  }, [data]);

  // 2. Prepare Edges
  const edges = useMemo(() => {
    if (!data?.edges) return [];
    return data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      strength: e.strength,
      label: e.label || e.type,
    }));
  }, [data]);

  // 3. Compute Columns (Ranked Layout)
  const columns = useMemo(() => {
    if (!data?.nodes || data.nodes.length === 0) return [];

    const adjacency: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    const ranks: Record<string, number> = {};

    // Initialize
    data.nodes.forEach((n) => {
      adjacency[n.id] = [];
      inDegree[n.id] = 0;
      ranks[n.id] = 0;
    });

    // Build Graph
    data.edges?.forEach((e) => {
      if (adjacency[e.source] && adjacency[e.target] !== undefined) {
        adjacency[e.source].push(e.target);
        inDegree[e.target]++;
      }
    });

    // Kahn's Algorithm for Longest Path Layering
    const queue: string[] = [];

    // Start with roots
    data.nodes.forEach((n) => {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    });

    const processed = new Set<string>();

    while (queue.length > 0) {
      const u = queue.shift();
      if (!u) {
        break;
      }
      processed.add(u);

      const r = ranks[u];

      adjacency[u].forEach((v) => {
        inDegree[v]--;
        // Ensure v is at least one rank higher than u
        ranks[v] = Math.max(ranks[v], r + 1);

        if (inDegree[v] === 0) {
          queue.push(v);
        }
      });
    }

    // Handle Cycles / Unprocessed nodes
    // If nodes are in a cycle, they never hit inDegree 0.
    // We arbitrarily assign them to the next available rank or keep them at 0 (or calculated max).
    // A simple heuristic: if not processed, put them in a later column?
    // Let's just group them by whatever rank they accumulated or 0.

    // Group by rank
    const cols: Record<number, EntityGraphNode[]> = {};
    data.nodes.forEach((n) => {
      const r = ranks[n.id];
      // Fallback for cycles: if inDegree > 0, force it to 'end' or just leave it?
      // Leaving it is fine, it will just be where it is.
      if (!cols[r]) cols[r] = [];
      cols[r].push(n);
    });

    // Convert to array
    const result: EntityGraphNode[][] = [];
    const keys = Object.keys(cols)
      .map(Number)
      .sort((a, b) => a - b);
    keys.forEach((k) => result.push(cols[k]));

    return result;
  }, [data]);

  // Derived state for Modal
  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null),
    [selectedNodeId, nodes],
  );

  // Measure positions for edges
  const updateEdgeCoords = useCallback(() => {
    // We calculate relative to the layout container (the inner div)
    // This avoids issues with padding on the scroll container
    if (!layoutRef.current) return;

    const parentRect = layoutRef.current.getBoundingClientRect();
    // Scroll is handled by the browser moving the layoutRef element,
    // so getBoundingClientRect() already accounts for scroll position relative to viewport.
    // We don't need to add scrollTop/scrollLeft if we compare two clientRects directly.

    const newCoords: Record<string, { x: number; y: number }> = {};

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        // Calculate center relative to the layout container's top-left
        newCoords[id] = {
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top + rect.height / 2,
        };
      }
    });
    setCoords(newCoords);
  }, []);

  useEffect(() => {
    // Observer for resizing/layout changes
    const ro = new ResizeObserver(updateEdgeCoords);
    if (contentRef.current) {
      ro.observe(contentRef.current);
      // We also want to observe the container's children if possible,
      // but just observing the container and window resize is usually enough for flex flows
    }

    window.addEventListener('resize', updateEdgeCoords);

    // Initial measure
    setTimeout(updateEdgeCoords, 100);
    // Double check after animation
    setTimeout(updateEdgeCoords, 500);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateEdgeCoords);
    };
  }, [updateEdgeCoords, columns]); // Re-run when layout (columns) changes

  // Guard clause for empty data
  if (!data?.nodes || data.nodes.length === 0) {
    return (
      <GraphViewerLayout
        title="Entity Flow Graph"
        description="No data to display"
      >
        <div className="flex items-center justify-center h-full text-slate-500">
          No entity data available
        </div>
      </GraphViewerLayout>
    );
  }

  const handleNodeClick = (id: string) => {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  };

  return (
    <GraphViewerLayout
      title="Entity Flow Graph"
      description="Mapping the narrative trajectory and conceptual depth of the document."
    >
      <div className="relative w-full h-full bg-[var(--color-surface-base)]">
        <GraphBackground />

        <div
          ref={contentRef}
          className="absolute inset-0 overflow-auto custom-scrollbar p-16"
          onScroll={updateEdgeCoords}
        >
          {/* Main Layout Container - Flex Columns */}
          <div
            ref={layoutRef}
            className="relative min-w-full min-h-full inline-block"
          >
            {/* Flex Container for Rank Columns */}
            <div className="flex flex-row gap-24 items-start min-h-full pb-16">
              {columns.map((colNodes, colIndex) => (
                <div
                  key={colIndex}
                  className="flex flex-col gap-8 items-center min-w-[280px]"
                >
                  {/* Optional Column Header */}
                  {/* <div className="text-xs font-mono text-slate-400 mb-4">RANK {colIndex}</div> */}

                  {colNodes.map((node) => {
                    const isDimmed
                      = hoveredNodeId !== null
                      && hoveredNodeId !== node.id
                      && !edges.some(
                        (e) =>
                          (e.source === hoveredNodeId
                            && e.target === node.id)
                          || (e.target === hoveredNodeId && e.source === node.id),
                      );

                    return (
                      <div
                        key={node.id}
                        className="relative w-full flex justify-center transition-all duration-300 ease-out"
                        style={{
                          zIndex: hoveredNodeId === node.id ? 50 : 10,
                          opacity: isDimmed ? 0.3 : 1,
                          transform:
                            hoveredNodeId === node.id
                              ? 'scale(1.02)'
                              : 'scale(1)',
                        }}
                      >
                        <div
                          ref={(el) => (cardRefs.current[node.id] = el)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Entity: ${node.label}`}
                          className="w-[280px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNodeClick(node.id);
                            }
                          }}
                        >
                          <GraphEntityCard
                            node={convertToGraphNode(node)}
                            isSelected={selectedNodeId === node.id}
                            isRelated={false}
                            isDimmed={false}
                            onClick={() => handleNodeClick(node.id)}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Base Edges Layer - Behind Cards (z-0) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <GraphEdgeLayer>
                {edges.map((edge) => {
                  const s = coords[edge.source];
                  const t = coords[edge.target];
                  if (!s || !t) return null;

                  const isHovered
                    = hoveredNodeId === edge.source
                    || hoveredNodeId === edge.target;
                  const isSelected
                    = selectedNodeId === edge.source
                    || selectedNodeId === edge.target;
                  const isActive = isHovered || isSelected;

                  // Skip active edges here - they will be rendered in the top layer
                  if (isActive) return null;

                  // Hide inactive edges if focus mode is active (hover/select existing)
                  // BUT keep them visible (dimmed) if nothing is selected?
                  // User request: "dimmed but visible when no nodes are selected"

                  // Logic:
                  // 1. If NO focus (no hover, no select) -> Show all edges dimmed/normal
                  // 2. If FOCUS (hover/select) -> Show ACTIVE edges bright, INACTIVE edges hidden or super dimmed

                  // Current implementation hides them completely on focus.
                  // The user wants them visible when NO nodes are selected.
                  // My previous code was:
                  // if ((hoveredNodeId || selectedNodeId) && !isActive) return null;

                  // This is correct for "Focus Mode".
                  // If no nodes selected (hoveredNodeId/selectedNodeId are null), this check is false, so it returns the edge.
                  // So edges ARE visible when no nodes are selected.

                  // Maybe they want them "dimmed" by default?
                  // Let's check the DynamicBezierPath props. It takes 'isActive'.
                  // If isActive=false, it uses 'var(--color-border-strong)'.
                  // Maybe that color is too faint?

                  // Let's modify the check to always render, but maybe strictly control opacity?

                  const isFocusMode = !!(hoveredNodeId || selectedNodeId);

                  // If in focus mode and this edge is NOT active, hide it to reduce clutter
                  if (isFocusMode && !isActive) {
                    return null;
                  }

                  // Otherwise render it (default state)
                  return (
                    <DynamicBezierPath
                      key={edge.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      label={edge.label}
                      isActive={false}
                      isDimmed={!isFocusMode} // Pass a prop to force dimming?
                      // Actually, 'isActive=false' is already the "dimmed" state relative to "active".
                      // If the user feels they are not visible enough, maybe I should check the color.
                    />
                  );
                })}
              </GraphEdgeLayer>
            </div>

            {/* Active Edges Layer - On Top of Cards (z-60) */}
            <div className="absolute inset-0 pointer-events-none z-[60]">
              <GraphEdgeLayer>
                {edges.map((edge) => {
                  const s = coords[edge.source];
                  const t = coords[edge.target];
                  if (!s || !t) return null;

                  const isHovered
                    = hoveredNodeId === edge.source
                    || hoveredNodeId === edge.target;
                  const isSelected
                    = selectedNodeId === edge.source
                    || selectedNodeId === edge.target;
                  const isActive = isHovered || isSelected;

                  // Only render active edges here
                  if (!isActive) return null;

                  return (
                    <DynamicBezierPath
                      key={edge.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      label={edge.label}
                      isActive
                    />
                  );
                })}
              </GraphEdgeLayer>
            </div>
          </div>
        </div>

        {/* Modal for Details */}
        {selectedNode && (
          <GraphConnectionModal
            edge={null} // We focus on the node here
            sourceNode={selectedNode} // Reuse the modal to show node details
            targetNode={undefined}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </GraphViewerLayout>
  );
};
