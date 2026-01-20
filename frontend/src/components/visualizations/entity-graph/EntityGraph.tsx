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
            style={{ width: `${nodes.length * 280 + 100}px`, height: "800px" }}
          >
            {/* Y-Axis Labels (Depth) */}
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400 font-mono pointer-events-none z-0">
              <span>Surface (Depth 0)</span>
              <span>Foundational (Depth 10)</span>
            </div>

            {/* Nodes Rendered in "Depth Flow" Grid */}
            {data?.nodes.map((node, index) => {
              // Layout Logic:
              // X: Sequence Index * Spacing
              // Y: Depth (0-10) mapped to 10%-90% height
              const x = index * 280 + 80;
              // Invert Y so 10 is at bottom (deeper)
              const yPercent = 10 + node.depth * 8;

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
                  className="absolute w-[240px] transition-opacity duration-300"
                  style={{
                    left: `${x}px`,
                    top: `${yPercent}%`,
                    zIndex: 10,
                    opacity: isDimmed ? 0.3 : 1,
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
