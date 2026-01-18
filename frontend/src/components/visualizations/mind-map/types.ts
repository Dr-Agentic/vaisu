import { GraphNode, GraphEdge } from '../toolkit/types';

export interface MindMapNodeMetadata {
  level: number;
  parentId: string | null;
  childrenIds: string[];
  subtitle: string;
  icon: string;
  detailedExplanation?: string;
  importance: number;
  collapsed?: boolean;
}

// Extend GraphNode metadata type locally if needed, or just cast it
export type MindMapGraphNode = GraphNode & {
  metadata: MindMapNodeMetadata & GraphNode['metadata'];
};

export interface MindMapState {
  nodes: MindMapGraphNode[];
  edges: GraphEdge[];
  rootId: string | null;

  // Interaction State
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  expandedNodeIds: Set<string>;

  // Actions
  setGraphData: (nodes: MindMapGraphNode[], edges: GraphEdge[], rootId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  expandBranch: (nodeId: string, levels: number) => void;
}
