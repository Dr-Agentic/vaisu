// Core Argument Map Data Types

export type ArgumentNodeType = 'CLAIM' | 'EVIDENCE' | 'CONCLUSION';

export type RelationshipType = 'SUPPORTS' | 'CONTRADICTS' | 'ELABORATES' | 'DEPENDS_ON';

export interface ArgumentNodeMetadata {
  source?: string;
  strength?: 'WEAK' | 'MEDIUM' | 'STRONG';
  category?: string;
  description?: string;
}

export interface ArgumentEdgeMetadata {
  description?: string;
  evidenceCount?: number;
}

export interface ArgumentNode {
  id: string;
  type: ArgumentNodeType;
  text: string;
  confidence: number; // 0.0 to 1.0
  metadata?: ArgumentNodeMetadata;
  position?: { x: number; y: number; z: number };
}

export interface ArgumentEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number; // 0.0 to 1.0
  metadata?: ArgumentEdgeMetadata;
}

export interface ArgumentMapData {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
  config?: {
    layout?: 'FORCE_DIRECTED' | 'HIERARCHICAL' | 'CIRCULAR';
    clustering?: boolean;
    semanticGrouping?: boolean;
  };
}

// Visualization State Types

export type VisualizationMode = '2D';

export type EntityType = ArgumentNodeType;

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
  target: [number, number, number];
}

export interface StrengthFilter {
  min: number;
  max: number;
}

export interface VisualizationConfig {
  theme: 'dark' | 'light';
  layout: 'FORCE_DIRECTED' | 'HIERARCHICAL' | 'CIRCULAR';
  clustering: boolean;
  semanticGrouping: boolean;
  performance: {
    maxNodes: number;
    enableLOD: boolean;
    adaptiveQuality: boolean;
  };
}

// Component Props Types

export interface GraphEntityCardProps {
  node: ArgumentNode;
  isSelected: boolean;
  isHovered: boolean;
  onFocus: (nodeId: string | null) => void;
}

export interface DynamicBezierPathProps {
  edge: ArgumentEdge;
  nodes: ArgumentNode[];
  theme: 'dark' | 'light';
}

export interface GraphEdgeLayerProps {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
  theme: 'dark' | 'light';
}

export interface ForceDirectedLayoutProps {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
}

export interface NodeDetailPanelProps {
  selectedNodeId: string | null;
}

export interface ArgumentMapProps {
  data?: ArgumentMapData;
  configuration?: VisualizationConfig;
}

// Utility Types

export interface NodeTypeColorScheme {
  background: string;
  border: string;
  glow?: string;
  text: string;
}

export interface ConnectionColorScheme {
  color: string;
  hoverColor: string;
  selectedColor: string;
}

export interface NodeDetailLevel {
  showFullText: boolean;
  showConnections: boolean;
  showMetadata: boolean;
}

// Store Types

export interface ArgumentMapStoreState {
  // Data State
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
  isLoading: boolean;
  error: string | null;

  // Visualization State
  layout: 'FORCE_DIRECTED' | 'HIERARCHICAL' | 'CIRCULAR';
  clustering: boolean;
  semanticGrouping: boolean;

  // Interaction State
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  focusedNodes: string[];

  // View State
  camera: CameraPosition;
  zoom: number;
  mode: VisualizationMode;

  // Filter State
  visibleTypes: EntityType[];
  searchQuery: string;
  strengthFilter: StrengthFilter;
}

export interface ArgumentMapStoreActions {
  setNodes: (nodes: ArgumentNode[]) => void;
  setEdges: (edges: ArgumentEdge[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  toggleFilter: (type: EntityType) => void;
  updateCamera: (camera: Partial<CameraPosition>) => void;
  switchMode: (mode: VisualizationMode) => void;
  loadVisualization: (data: ArgumentMapData) => Promise<void>;
  updateSearchQuery: (query: string) => void;
  updateStrengthFilter: (filter: StrengthFilter) => void;
}

export type ArgumentMapStore = ArgumentMapStoreState & ArgumentMapStoreActions;

// Backend data transformation utilities

export interface BackendArgumentNode {
  id: string;
  label: string;
  summary: string;
  type: 'claim' | 'argument' | 'evidence' | 'conclusion';
  confidence: number;
  impact?: string;
  polarity?: string;
  isCollapsed?: boolean;
  depthMetrics?: any;
  metadata?: ArgumentNodeMetadata;
}

export interface BackendArgumentEdge {
  id: string;
  source: string;
  target: string;
  type: 'supports' | 'contradicts' | 'elaborates' | 'depends_on';
  strength: number;
  rationale?: string;
  metadata?: ArgumentEdgeMetadata;
}

export interface BackendArgumentMapData {
  nodes: BackendArgumentNode[];
  edges: BackendArgumentEdge[];
  metadata?: {
    totalClaims?: number;
    totalArguments?: number;
    totalEvidence?: number;
    mainClaimId?: string;
  };
}

/**
 * Transform backend data format to frontend format
 */
export const transformBackendDataToArgumentMap = (
  backendData: BackendArgumentMapData
): ArgumentMapData => {
  // Map lowercase types to uppercase
  const typeMap: Record<string, ArgumentNodeType> = {
    'claim': 'CLAIM',
    'argument': 'EVIDENCE', // Arguments support claims, treat as evidence
    'evidence': 'EVIDENCE',
    'conclusion': 'CONCLUSION'
  };

  const relationshipMap: Record<string, RelationshipType> = {
    'supports': 'SUPPORTS',
    'contradicts': 'CONTRADICTS',
    'elaborates': 'ELABORATES',
    'depends_on': 'DEPENDS_ON'
  };

  const nodes: ArgumentNode[] = backendData.nodes.map(node => ({
    id: node.id,
    type: typeMap[node.type] || 'EVIDENCE',
    text: node.summary || node.label || '',
    confidence: node.confidence,
    metadata: {
      ...node.metadata,
      source: node.metadata?.source || node.label,
      category: node.impact,
      description: node.summary
    },
    position: node.position
  }));

  const edges: ArgumentEdge[] = backendData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: relationshipMap[edge.type] || 'SUPPORTS',
    strength: edge.strength,
    metadata: {
      ...edge.metadata,
      description: edge.rationale
    }
  }));

  return {
    nodes,
    edges,
    config: {
      layout: 'HIERARCHICAL',
      clustering: false,
      semanticGrouping: false
    }
  };
};