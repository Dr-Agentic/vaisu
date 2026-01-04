export interface GraphNode {
  id: string;
  type: string;
  label: string;
  description?: string;
  importance?: 'low' | 'medium' | 'high' | number;
  context?: string;
  mentions?: string[];
  metadata?: Record<string, any>;
  // For layout positioning
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  strength?: number;
  rationale?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphThemeColor {
  background: string;
  text: string;
  border: string;
  icon: string;
}
