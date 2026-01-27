import { X } from "lucide-react";
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { Section } from "../../../../shared/src/types";

import {
  GraphViewerLayout,
  GraphEntityCard,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphNode,
} from "./toolkit";

interface StructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

// Helper to reconstruct tree from flat list if needed
interface TreeNode extends Section {
  subSections: TreeNode[];
}

// Convert nested sections to TreeNodes recursively
const convertSectionsToTree = (sections: Section[]): TreeNode[] => {
  return sections.map((section) => ({
    ...section,
    subSections: section.children
      ? convertSectionsToTree(section.children)
      : [],
  }));
};

// Helper to map Section to GraphNode
const mapSectionToNode = (section: Section): GraphNode => ({
  id: section.id,
  type: "Document Section",
  label: section.title,
  description: section.punchingMessage || section.summary,
  mentions: section.keywords || [],
  importance: section.level === 1 ? "high" : "medium",
  metadata: {
    level: section.level,
    keywords: section.keywords?.join(", "),
    content: section.content,
    range: `Chars ${section.startIndex} - ${section.endIndex}`,
    punchingMessage: section.punchingMessage,
  },
  x: 0, // Placeholder, will be ignored by relative layout
  y: 0,
});

// Extracted Component
const RenderTree = React.memo(
  ({
    nodes,
    depth = 0,
    cardRefs,
    selectedNode,
    onSelectNode,
    onLayoutUpdate,
  }: {
    nodes: TreeNode[];
    depth?: number;
    cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
    selectedNode: GraphNode | null;
    onSelectNode: (node: GraphNode) => void;
    onLayoutUpdate: () => void;
  }) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <div className="flex flex-col gap-8">
        {nodes.map((node) => {
          const graphNode = mapSectionToNode(node);
          const isSelected = selectedNode?.id === node.id;

          return (
            <div key={node.id} className="flex flex-row items-center">
              {/* Node Card */}
              <div
                ref={(el) => (cardRefs.current[node.id] = el)}
                className="relative z-10"
              >
                <GraphEntityCard
                  node={graphNode}
                  onClick={() => onSelectNode(graphNode)}
                  isSelected={isSelected}
                  // Override style to be relative
                  style={{
                    position: "relative",
                    width: "320px",
                    left: "auto",
                    top: "auto",
                  }}
                  // Trigger layout update on interaction (e.g. expansion)
                  onMouseEnter={() => setTimeout(onLayoutUpdate, 350)} // Wait for animation
                  onMouseLeave={() => setTimeout(onLayoutUpdate, 350)}
                />
              </div>

              {/* Children */}
              {node.subSections.length > 0 && (
                <div className="ml-24 border-l-2 border-[var(--color-border-subtle)]/30 pl-8 py-4">
                  <RenderTree
                    nodes={node.subSections}
                    depth={depth + 1}
                    cardRefs={cardRefs}
                    selectedNode={selectedNode}
                    onSelectNode={onSelectNode}
                    onLayoutUpdate={onLayoutUpdate}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

export const StructuredViewRenderer: React.FC<StructuredViewProps> = ({
  data,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Coordinate Tracking State
  const [coords, setCoords] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Build Tree Structure
  const roots = useMemo(() => {
    if (!data || !data.sections) return [];
    return convertSectionsToTree(data.sections);
  }, [data]);

  // 2. Collect all edges for the SVG layer
  const edges = useMemo(() => {
    const collectedEdges: { id: string; source: string; target: string }[] = [];
    const traverse = (node: TreeNode) => {
      node.subSections.forEach((child) => {
        collectedEdges.push({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
        });
        traverse(child);
      });
    };
    roots.forEach(traverse);
    return collectedEdges;
  }, [roots]);

  // 3. Coordinate Update Logic (ResizeObserver)
  const updateCoords = useCallback(() => {
    if (!contentRef.current) return;

    // Get the offset of the content container relative to the viewport/scroll parent
    // We'll treat the contentRef as the origin (0,0)
    const contentRect = contentRef.current.getBoundingClientRect();
    const newCoords: Record<string, { x: number; y: number }> = {};

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[id] = {
          x: rect.left - contentRect.left + rect.width / 2, // Center X
          y: rect.top - contentRect.top + rect.height / 2, // Center Y
        };
      }
    });

    setCoords(newCoords);
  }, [roots]); // Re-run if structure changes

  useEffect(() => {
    const observer = new ResizeObserver(() => updateCoords());
    if (contentRef.current) {
      observer.observe(contentRef.current);
      // Observe all card elements too if possible, but observing container captures most layout shifts
      // For more granular updates (e.g., expanding a single card), we might need to rely on the fact
      // that card expansion changes the container size or triggers a re-render.
    }

    // Initial calculation
    setTimeout(updateCoords, 100);

    return () => observer.disconnect();
  }, [updateCoords]);

  return (
    <GraphViewerLayout
      title="Document Structure"
      description="Hierarchical view of document sections and subsections."
    >
      <div className="absolute inset-0 overflow-auto custom-scrollbar bg-[var(--color-surface-base)]">
        <div className="relative min-w-max p-16" ref={contentRef}>
          {/* Render Nodes (Natural Flow) */}
          <RenderTree
            nodes={roots}
            cardRefs={cardRefs}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onLayoutUpdate={updateCoords}
          />

          {/* Render Edges (Overlay) */}
          <GraphEdgeLayer>
            {edges.map((edge) => {
              const start = coords[edge.source];
              const end = coords[edge.target];

              if (!start || !end) return null;

              return (
                <DynamicBezierPath
                  key={edge.id}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  isActive={
                    selectedNode?.id === edge.source ||
                    selectedNode?.id === edge.target
                  }
                />
              );
            })}
          </GraphEdgeLayer>
        </div>
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-[var(--color-surface-elevated)] border-l border-[var(--color-border-subtle)] shadow-2xl overflow-y-auto z-30 transition-transform duration-300 custom-scrollbar">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Section Details
              </h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 rounded-xl hover:bg-[var(--color-background-secondary)] transition-all duration-200 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <section aria-labelledby="detail-title">
                <h3
                  id="detail-title"
                  className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2"
                >
                  Title
                </h3>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                  {selectedNode.label}
                </p>
              </section>

              {selectedNode.metadata?.punchingMessage && (
                <section aria-labelledby="detail-punching">
                  <h3
                    id="detail-punching"
                    className="text-[10px] font-black text-[var(--color-accent)] uppercase tracking-[0.2em] block mb-2"
                  >
                    Core Insight
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-primary)] font-bold border-l-2 border-[var(--color-accent)] pl-3">
                    {selectedNode.metadata.punchingMessage}
                  </p>
                </section>
              )}

              {selectedNode.description && (
                <section aria-labelledby="detail-summary">
                  <h3
                    id="detail-summary"
                    className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2"
                  >
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-medium italic">
                    {selectedNode.description}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-2 gap-6">
                <section aria-labelledby="detail-level">
                  <h3
                    id="detail-level"
                    className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2"
                  >
                    Level
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                      L{selectedNode.metadata?.level}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-3 rounded-full ${i < (selectedNode.metadata?.level || 1) ? "bg-[var(--aurora-1)]" : "bg-[var(--color-border-subtle)]"}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
                <section aria-labelledby="detail-range">
                  <h3
                    id="detail-range"
                    className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2"
                  >
                    Scope
                  </h3>
                  <p className="text-xs font-bold font-mono text-[var(--color-text-tertiary)]">
                    {selectedNode.metadata?.range}
                  </p>
                </section>
              </div>

              {selectedNode.metadata?.keywords && (
                <section aria-labelledby="detail-keywords">
                  <h3
                    id="detail-keywords"
                    className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-3"
                  >
                    Key Insights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.metadata.keywords
                      .split(", ")
                      .map((keyword: string) => (
                        <span
                          key={keyword}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-[var(--color-background-secondary)] text-[var(--aurora-1)] rounded-lg border border-[var(--color-border-subtle)]"
                        >
                          {keyword}
                        </span>
                      ))}
                  </div>
                </section>
              )}

              {selectedNode.metadata?.content && (
                <section aria-labelledby="detail-content">
                  <h3
                    id="detail-content"
                    className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-3"
                  >
                    Raw Content
                  </h3>
                  <div className="p-4 bg-[var(--color-background-secondary)] rounded-2xl border border-[var(--color-border-subtle)] max-h-[300px] overflow-y-auto custom-scrollbar">
                    <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
                      {selectedNode.metadata.content}
                    </pre>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </GraphViewerLayout>
  );
};
