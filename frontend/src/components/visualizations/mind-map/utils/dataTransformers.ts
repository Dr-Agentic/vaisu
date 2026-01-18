import { MindMapData, MindMapNode } from '../../../../../../shared/src/types';
import { GraphEdge } from '../../toolkit/types';
import { MindMapGraphNode } from '../types';

export const transformMindMapData = (data: MindMapData): { nodes: MindMapGraphNode[], edges: GraphEdge[], rootId: string | null } => {
  const nodes: MindMapGraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  if (!data.root) {
    return { nodes: [], edges: [], rootId: null };
  }

  const traverse = (node: MindMapNode, parentId: string | null, level: number) => {
    // Map MindMapNode to GraphNode structure
    const graphNode: MindMapGraphNode = {
      id: node.id,
      type: 'concept', // Default type for MindMap nodes
      label: node.label,
      color: node.color,
      // We'll calculate position in the layout engine, init to 0
      x: 0,
      y: 0,
      metadata: {
        level,
        parentId,
        childrenIds: node.children?.map(c => c.id) || [],
        subtitle: node.subtitle,
        icon: node.icon,
        detailedExplanation: node.detailedExplanation,
        importance: node.metadata.importance,
        description: node.subtitle, // For toolkit compatibility
        context: node.icon, // For toolkit compatibility
        centrality: 0,
        connections: node.children?.length || 0
      }
    };
    
    nodes.push(graphNode);

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'relates-to',
        strength: 1,
        rationale: 'Hierarchical connection'
      });
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, node.id, level + 1));
    }
  };

  traverse(data.root, null, 0);

  return { nodes, edges, rootId: data.root.id };
};
