// src/components/visualizations/depth-graph/interfaces.ts

export interface DepthMetrics {
  cohesion: number;
  nuance: number;
  grounding: number;
  tension: number;
  confidence: {
    cohesion: number;
    nuance: number;
    grounding: number;
    tension: number;
    composite: number;
  };
}

export interface DepthGraphNode {
  id: string;
  type: 'claim' | 'evidence' | 'argument' | 'counterargument' | 'rebuttal' | 'alternative';
  content: string;
  // x, y are handled by the graph engine usually
  x?: number;
  y?: number;
  depthMetrics: DepthMetrics;
  size: number;
  clusterId?: string;
  label?: string;
  polarity?: 'support' | 'attack' | 'neutral';
  impact?: 'low' | 'medium' | 'high';
}

export interface DepthGraphEdge {
  id?: string;
  source: string;
  target: string;
  type: 'supports' | 'challenges' | 'elaborates' | 'contradicts' | 'attacks' | 'rebuts' | 'is-alternative-to' | 'depends-on';
  strength: number;
  tensionScore: number;
}

export interface DepthGraphData {
  nodes: DepthGraphNode[];
  links: DepthGraphEdge[]; // Renamed from edges to links for react-force-graph
}
