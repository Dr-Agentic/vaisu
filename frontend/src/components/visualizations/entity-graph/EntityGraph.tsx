import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { EntityGraphData, EntityGraphNode } from "@shared/types";
import {
  GraphViewerLayout,
  GraphBackground,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphEntityCard,
  GraphConnectionModal,
} from "@/components/visualizations/toolkit";
import { GraphNode } from "@/components/visualizations/toolkit/types";

interface EntityGraphProps {
  data: EntityGraphData;
}

// Convert EntityGraphNode to standard GraphNode
const convertToGraphNode = (node: EntityGraphNode): GraphNode => ({
  id: node.id,
  type:
    node.type === "mechanism"
      ? "technical"
      : node.type === "evidence"
        ? "metric"
        : "concept",
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
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Prepare Nodes and Calculate Range
  const { nodes, depthRange } = useMemo(() => {
    if (!data?.nodes) return { nodes: [], depthRange: { min: 0, max: 10 } };

    const convertedNodes = data.nodes.map(convertToGraphNode);
    const depths = data.nodes.map((n) => n.depth);
    const min = Math.min(...depths);
    const max = Math.max(...depths);

    // Ensure we have a span to avoid division by zero
    // If all nodes are same depth (span=0), force a span of 2 to center them
    const span = Math.max(2, max - min);

    return {
      nodes: convertedNodes,
      depthRange: { min, max: min + span },
    };
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

  // Derived state for Modal
  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null),
    [selectedNodeId, nodes],
  );

  // 3. Coordinate Tracking
  const updateCoords = useCallback(() => {
    if (!contentRef.current) return;

    const contentRect = contentRef.current.getBoundingClientRect();
    const newCoords: Record<string, { x: number; y: number }> = {};

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
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => updateCoords());
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    // Initial calculation
    setTimeout(updateCoords, 100);
    return () => observer.disconnect();
  }, [updateCoords]);

  // Recalculate on scroll
  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", updateCoords, { capture: true });
      return () =>
        container.removeEventListener("scroll", updateCoords, {
          capture: true,
        });
    }
  }, [updateCoords]);

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
        >
          {/* Main Layout Container */}
          <div
            className="relative min-w-max min-h-full"
            style={{
              width: `${nodes.length * 320 + 200}px`,
              minHeight: "800px",
            }}
          >
            {/* Y-Axis Labels (Depth) */}
            <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between text-xs text-slate-400 font-mono pointer-events-none z-0">
              <span>Surface / Context</span>
              <span className="opacity-50">Operational</span>
              <span className="opacity-50">Mechanism</span>
              <span>Foundational Core</span>
            </div>

            {/* Depth Zones (Visual Guides) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="w-full h-full border-t border-dashed border-slate-200/50 dark:border-slate-800/50 absolute top-[25%]" />
              <div className="w-full h-full border-t border-dashed border-slate-200/50 dark:border-slate-800/50 absolute top-[50%]" />
              <div className="w-full h-full border-t border-dashed border-slate-200/50 dark:border-slate-800/50 absolute top-[75%]" />
            </div>

            {/* Nodes Rendered in "Depth Flow" Grid */}
            {data?.nodes.map((node, index) => {
              // Layout Logic:
              // X: Sequence Index * Spacing (increased to 320px)
              const x = index * 320 + 100;

              // Y: Normalized Depth Mapping with Zig-Zag
              // 1. Normalize depth to 0-1 range based on actual data variance
              const normalizedDepth =
                (node.depth - depthRange.min) /
                (depthRange.max - depthRange.min);

              // 2. Map to 15%-85% screen height (giving distinct buffer at top/bottom)
              // We invert logic: High Depth -> Bottom, Low Depth -> Top
              let yPercent = 15 + normalizedDepth * 70;

              // 3. Add Zig-Zag offset to separate sequential nodes at similar depth
              // If nodes are close in depth, this pushes them apart visually
              const stagger = index % 2 === 0 ? -8 : 8;
              yPercent = Math.max(10, Math.min(90, yPercent + stagger));

              const isDimmed =
                hoveredNodeId !== null &&
                hoveredNodeId !== node.id &&
                !edges.some(
                  (e) =>
                    (e.source === hoveredNodeId && e.target === node.id) ||
                    (e.target === hoveredNodeId && e.source === node.id),
                );

              return (
                <div
                  key={node.id}
                  ref={(el) => (cardRefs.current[node.id] = el)}
                  className="absolute w-[280px] transition-all duration-500 ease-out"
                  style={{
                    left: `${x}px`,
                    top: `${yPercent}%`,
                    zIndex: hoveredNodeId === node.id ? 50 : 10,
                    opacity: isDimmed ? 0.3 : 1,
                    transform:
                      hoveredNodeId === node.id ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <GraphEntityCard
                    node={convertToGraphNode(node)}
                    isSelected={selectedNodeId === node.id}
                    isRelated={false}
                    isDimmed={false} // Handled by parent opacity for smoother effect
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  />
                </div>
              );
            })}

            {/* Edges Layer */}
            <GraphEdgeLayer>
              {edges.map((edge) => {
                const s = coords[edge.source];
                const t = coords[edge.target];
                if (!s || !t) return null;

                const isHovered =
                  hoveredNodeId === edge.source ||
                  hoveredNodeId === edge.target;
                const isSelected =
                  selectedNodeId === edge.source ||
                  selectedNodeId === edge.target;

                // Hide edge if not hovered/selected when in "focus mode"
                if (
                  (hoveredNodeId || selectedNodeId) &&
                  !isHovered &&
                  !isSelected
                ) {
                  return null;
                }

                return (
                  <DynamicBezierPath
                    key={edge.id}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    label={edge.label}
                    isActive={isHovered || isSelected}
                  />
                );
              })}
            </GraphEdgeLayer>
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
