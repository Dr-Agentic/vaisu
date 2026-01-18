import { X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Section } from '../../../../shared/src/types';

import {
  GraphViewerLayout,
  GraphEntityCard,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphNode,
} from './toolkit';

interface StructuredViewProps {
  data: {
    sections: Section[];
    hierarchy: any[];
  };
}

// Helper to reconstruct tree from flat list if needed
interface TreeNode extends Section {
  parentId?: string;
  subSections: TreeNode[];
  x: number;
  y: number;
  height: number; // Height of the subtree
}

// Convert nested sections to TreeNodes recursively
const convertSectionsToTree = (sections: Section[]): TreeNode[] => {
  return sections.map(section => ({
    ...section,
    subSections: section.children ? convertSectionsToTree(section.children) : [],
    x: 0,
    y: 0,
    height: 0,
  } as TreeNode));
};

// Layout Algorithm
const CARD_WIDTH = 256;
const CARD_HEIGHT = 250; // Increased to accommodate multi-line text
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 40;

const calculateLayout = (nodes: TreeNode[], depth: number, startY: number): number => {
  let currentY = startY;

  nodes.forEach(node => {
    node.x = depth * (CARD_WIDTH + HORIZONTAL_GAP);

    if (node.subSections.length > 0) {
      // Recursively layout children
      const childrenHeight = calculateLayout(node.subSections, depth + 1, currentY);

      // Center parent relative to children
      const firstChildY = node.subSections[0].y;
      const lastChildY = node.subSections[node.subSections.length - 1].y;
      node.y = (firstChildY + lastChildY) / 2;

      // Update Y for next sibling based on children's total height
      currentY = childrenHeight + VERTICAL_GAP;
    } else {
      // Leaf node
      node.y = currentY;
      currentY += CARD_HEIGHT + VERTICAL_GAP;
    }

    node.height = currentY - startY;
  });

  return currentY - VERTICAL_GAP; // Return total used height
};

export const StructuredViewRenderer: React.FC<StructuredViewProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  console.log('🏗️ StructuredViewRenderer received data:', {
    type: (data as any)?.type,
    sectionsCount: data?.sections?.length,
    hierarchyType: typeof data?.hierarchy,
    hierarchyLength: Array.isArray(data?.hierarchy) ? data.hierarchy.length : 'not-array',
    hasSections: !!data?.sections,
    sectionsData: data?.sections?.slice(0, 2).map(s => ({ id: s.id, title: s.title, level: s.level })),
  });

  const { nodes, edges, totalHeight } = useMemo(() => {
    if (!data || !data.sections) {
      console.log('❌ StructuredViewRenderer: No data or sections available');
      return { nodes: [], edges: [], totalHeight: 0 };
    }

    // 1. Build Tree
    const roots = convertSectionsToTree(data.sections);

    // 2. Calculate Layout
    const totalHeight = calculateLayout(roots, 0, 50); // Start at (0, 50) padding
    console.log('📏 StructuredView Layout Height:', totalHeight, 'Nodes:', roots.length);

    // 3. Flatten for Rendering
    const flattenedNodes: GraphNode[] = [];
    const flattenedEdges: any[] = [];

    const traverse = (node: TreeNode) => {
      flattenedNodes.push({
        id: node.id,
        type: 'Document Section', // Generic type for now
        label: node.title,
        description: node.summary,
        mentions: node.keywords || [], // Map keywords to mentions for card tags
        importance: node.level === 1 ? 'high' : 'medium',
        x: node.x,
        y: node.y,
        metadata: {
          level: node.level,
          keywords: node.keywords?.join(', '),
          content: node.content,
          range: `Chars ${node.startIndex} - ${node.endIndex}`,
        },
      });

      node.subSections.forEach(child => {
        flattenedEdges.push({
          id: `edge-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          x1: node.x + CARD_WIDTH, // Right edge of parent
          y1: node.y + CARD_HEIGHT / 2, // Center Y
          x2: child.x, // Left edge of child
          y2: child.y + CARD_HEIGHT / 2,
        });
        traverse(child);
      });
    };

    roots.forEach(traverse);

    return { nodes: flattenedNodes, edges: flattenedEdges, totalHeight };
  }, [data]);

  return (
    <GraphViewerLayout
      title="Document Structure"
      description="Hierarchical view of document sections and subsections."
    >
      <div className="absolute inset-0 overflow-auto custom-scrollbar bg-[var(--color-surface-base)]">
        <div
          className="relative min-w-full p-8"
          style={{
            height: totalHeight ? Math.max(totalHeight + 200, 800) : '100%',
            minHeight: '100%',
          }}
        >
          {/* Render Edges First */}
          <GraphEdgeLayer>
            {edges.map((e: any) => (
              <DynamicBezierPath
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
              />
            ))}
          </GraphEdgeLayer>

          {/* Render Nodes */}
          {nodes.map((node: GraphNode) => (
            <GraphEntityCard
              key={node.id}
              node={node}
              onClick={() => setSelectedNode(node)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: CARD_WIDTH,
              }}
            />
          ))}
        </div>
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-[var(--color-surface-elevated)] border-l border-[var(--color-border-subtle)] shadow-2xl overflow-y-auto z-10 transition-transform duration-300 custom-scrollbar">
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
                <h3 id="detail-title" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2">
                  Title
                </h3>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                  {selectedNode.label}
                </p>
              </section>

              {selectedNode.description && (
                <section aria-labelledby="detail-summary">
                  <h3 id="detail-summary" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] font-medium italic">
                    {selectedNode.description}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-2 gap-6">
                <section aria-labelledby="detail-level">
                  <h3 id="detail-level" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2">
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
                          className={`w-1 h-3 rounded-full ${i < (selectedNode.metadata?.level || 1) ? 'bg-[var(--aurora-1)]' : 'bg-[var(--color-border-subtle)]'}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
                <section aria-labelledby="detail-range">
                  <h3 id="detail-range" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-2">
                    Scope
                  </h3>
                  <p className="text-xs font-bold font-mono text-[var(--color-text-tertiary)]">
                    {selectedNode.metadata?.range}
                  </p>
                </section>
              </div>

              {selectedNode.metadata?.keywords && (
                <section aria-labelledby="detail-keywords">
                  <h3 id="detail-keywords" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-3">
                    Key Insights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.metadata.keywords.split(', ').map((keyword: string) => (
                      <span key={keyword} className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-[var(--color-background-secondary)] text-[var(--aurora-1)] rounded-lg border border-[var(--color-border-subtle)]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {selectedNode.metadata?.content && (
                <section aria-labelledby="detail-content">
                  <h3 id="detail-content" className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] block mb-3">
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
