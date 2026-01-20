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

  const [layoutCoords, setLayoutCoords] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const measuredCardHeights = useRef<Record<string, number>>({});
  const MIN_CARD_HEIGHT = 120;

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

  // Measure card heights
  const measureCardHeights = useCallback(() => {
    if (!contentRef.current) return;

    data.nodes.forEach((node) => {
      const el = cardRefs.current[node.id];
      const height = el ? el.offsetHeight : MIN_CARD_HEIGHT;
      measuredCardHeights.current[node.id] = height;
    });
  }, [data.nodes]);

  // Calculate node positions based on sequence and depth
  const calculateNodePositions = useCallback((): Record<
    string,
    { x: number; y: number }
  > => {
    const newCoords: Record<string, { x: number; y: number }> = {};

    data.nodes.forEach((node, index) => {
      // Calculate X based on sequence
      const x = index * 320 + 100;

      // Determine Y based on Depth + Collision Avoidance
      // Base Y is determined by depth (inverted)
      // We map 0-10 depth to 0-800px range roughly
      let baseY = (10 - node.depth) * 80 + 50;

      newCoords[node.id] = { x, y: baseY };
    });

    return newCoords;
  }, [data.nodes]);

  // Update edge coordinates based on node positions
  const updateEdgeCoordinates = useCallback(
    (nodeCoords: Record<string, { x: number; y: number }>) => {
      const edgeCoords: Record<string, { x: number; y: number }> = {};

      Object.entries(nodeCoords).forEach(([id, pos]) => {
        // Edges connect to center of card
        // Since we know width (280) and measured height...
        const h = measuredCardHeights.current[id] || MIN_CARD_HEIGHT;
        edgeCoords[id] = {
          x: pos.x + 140, // 280/2
          y: pos.y + h / 2,
        };
      });

      setCoords(edgeCoords);
    },
    [],
  );

  // Main layout update function
  const updateLayout = useCallback(() => {
    if (!contentRef.current) return;

    // Measure actual heights
    measureCardHeights();

    // Calculate positions
    const newCoords = calculateNodePositions();
    setLayoutCoords(newCoords);

    // Update edge coordinates with setTimeout to ensure layout state is processed
    setTimeout(() => {
      if (!contentRef.current) return;
      updateEdgeCoordinates(newCoords);
    }, 0);
  }, [measureCardHeights, calculateNodePositions, updateEdgeCoordinates]);

  useEffect(() => {
    // Initial measure after render
    const timer = setTimeout(updateLayout, 100);
    return () => clearTimeout(timer);
  }, [updateLayout]);

  // No separate updateCoords needed as it is integrated into updateLayout

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
            {data?.nodes.map((node) => {
              // Use layout coords if available, else fallback to initial calculation
              const pos = layoutCoords[node.id];
              if (!pos) return null; // Wait for measurement

              const x = pos.x;
              const y = pos.y;

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
                    top: `${y}px`,
                    zIndex: hoveredNodeId === node.id ? 50 : 10,
                    opacity: isDimmed ? 0.3 : 1,
                    transform:
                      hoveredNodeId === node.id ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label={`Entity: ${node.label}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNodeClick(node.id);
                      }
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
