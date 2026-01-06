/**
 * Knowledge Graph Type Definitions
 * Defines the structure for nodes, edges, and graph data
 */

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'SOURCE' | 'CONCEPT' | 'REGULATION' | 'IMPACT' | 'RISK' | 'OPPORTUNITY';
  confidence: number;
  metadata: {
    sources: string[];
    description?: string;
    category?: string;
  };
  x?: number;
  y?: number;
  column?: number;
  row?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
  evidence: string[];
  relationshipType: 'CAUSES' | 'INFLUENCES' | 'REGULATES' | 'MEDIATES' | 'DEPENDS_ON';
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

/**
 * Layout types for the knowledge graph
 */
export type LayoutType = 'grid' | 'force' | 'hierarchical';

/**
 * Visualization record for persistence
 */
export interface KnowledgeGraphVisualizationRecord {
  documentId: string;
  visualizationType: 'knowledge-graph';
  data: KnowledgeGraphData;
  createdAt: Date;
  updatedAt: Date;
}
