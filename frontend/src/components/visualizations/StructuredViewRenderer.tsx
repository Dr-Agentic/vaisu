import React, { useMemo, useState } from 'react';
import { Section } from '../../../../shared/src/types';
import {
  GraphViewerLayout,
  GraphCanvas,
  GraphEntityCard,
  GraphEdgeLayer,
  DynamicBezierPath,
  GraphNode
} from './toolkit';
import { X } from 'lucide-react';

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
    height: 0
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
    sectionsData: data?.sections?.slice(0, 2).map(s => ({ id: s.id, title: s.title, level: s.level }))
  });

  const { nodes, edges } = useMemo(() => {
    if (!data || !data.sections) {
      console.log('❌ StructuredViewRenderer: No data or sections available');
      return { nodes: [], edges: [] };
    }

    // 1. Build Tree
    const roots = convertSectionsToTree(data.sections);

    // 2. Calculate Layout
    calculateLayout(roots, 0, 50); // Start at (0, 50) padding

    // 3. Flatten for Rendering
    const flattenedNodes: GraphNode[] = [];
    const flattenedEdges: any[] = [];

    const traverse = (node: TreeNode) => {
      flattenedNodes.push({
        id: node.id,
        type: 'Document Section', // Generic type for now
        label: node.title,
        description: node.summary,
        importance: node.level === 1 ? 'high' : 'medium',
        x: node.x,
        y: node.y,
        metadata: {
            level: node.level,
            keywords: node.keywords?.join(', '),
            content: node.content,
            range: `${node.startIndex} - ${node.endIndex}`
        }
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

    return { nodes: flattenedNodes, edges: flattenedEdges };
  }, [data]);

  return (
    <GraphViewerLayout 
        title="Document Structure" 
        description="Hierarchical view of document sections and subsections."
    >
      <GraphCanvas>
        {/* Render Edges First */}
        <GraphEdgeLayer>
            {edges.map(e => (
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
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {nodes.map(node => (
                <GraphEntityCard
                    key={node.id}
                    node={node}
                    onClick={() => setSelectedNode(node)}
                    style={{
                        position: 'absolute',
                        left: node.x,
                        top: node.y,
                        width: CARD_WIDTH
                    }}
                />
            ))}
        </div>
      </GraphCanvas>

      {/* Details Panel */}
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-y-auto z-10 transition-transform duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Section Details
              </h2>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Title</label>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">{selectedNode.label}</p>
              </div>

              {selectedNode.description && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</label>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{selectedNode.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level</label>
                  <p className="mt-1 text-sm font-mono">{selectedNode.metadata?.level}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Char Range</label>
                  <p className="mt-1 text-sm font-mono">{selectedNode.metadata?.range}</p>
                </div>
              </div>

              {selectedNode.metadata?.keywords && (
                <div>
                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</label>
                   <div className="mt-2 flex flex-wrap gap-2">
                     {selectedNode.metadata.keywords.split(', ').map((keyword: string) => (
                       <span key={keyword} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 rounded-full border border-blue-100 dark:border-blue-800">
                         {keyword}
                       </span>
                     ))}
                   </div>
                </div>
              )}

              {selectedNode.metadata?.content && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Content</label>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                    <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {selectedNode.metadata.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GraphViewerLayout>
  );
};
