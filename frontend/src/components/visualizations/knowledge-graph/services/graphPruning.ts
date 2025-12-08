import type { GraphNode, GraphEdge } from '../../../../../../shared/src/types';
import type { CentralityScores } from './centralityService';

export class GraphPruningService {
  /**
   * Filter nodes based on importance threshold
   */
  pruneByImportance(
    nodes: GraphNode[],
    edges: GraphEdge[],
    centralityScores: Map<string, CentralityScores>,
    percentileThreshold: number
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    // Calculate threshold value
    const threshold = this.calculatePercentileThreshold(centralityScores, percentileThreshold);

    // Filter nodes above threshold
    const prunedNodes = nodes.filter(node => {
      const score = centralityScores.get(node.id);
      return score && score.combined >= threshold;
    });

    const prunedNodeIds = new Set(prunedNodes.map(n => n.id));

    // Filter edges to only include those between remaining nodes
    const prunedEdges = edges.filter(edge =>
      prunedNodeIds.has(edge.source) && prunedNodeIds.has(edge.target)
    );

    return { nodes: prunedNodes, edges: prunedEdges };
  }

  /**
   * Filter nodes by entity type
   */
  filterByEntityType(
    nodes: GraphNode[],
    edges: GraphEdge[],
    visibleTypes: Set<string>
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const filteredNodes = nodes.filter(node => visibleTypes.has(node.type));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredEdges = edges.filter(edge =>
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }

  /**
   * Filter nodes by search query
   */
  filterBySearch(
    nodes: GraphNode[],
    edges: GraphEdge[],
    searchQuery: string
  ): { nodes: GraphNode[]; edges: GraphEdge[]; matchedNodeIds: string[] } {
    if (!searchQuery.trim()) {
      return {
        nodes,
        edges,
        matchedNodeIds: []
      };
    }

    const query = searchQuery.toLowerCase();
    const matchedNodes = nodes.filter(node =>
      node.label.toLowerCase().includes(query) ||
      node.metadata.description?.toLowerCase().includes(query)
    );

    const matchedNodeIds = matchedNodes.map(n => n.id);

    return {
      nodes,
      edges,
      matchedNodeIds
    };
  }

  /**
   * Filter edges by relationship type
   */
  filterEdgesByType(
    edges: GraphEdge[],
    visibleTypes: Set<string>
  ): GraphEdge[] {
    return edges.filter(edge => visibleTypes.has(edge.type));
  }

  /**
   * Apply multiple filters in sequence
   */
  applyFilters(
    nodes: GraphNode[],
    edges: GraphEdge[],
    filters: {
      centralityScores?: Map<string, CentralityScores>;
      importanceThreshold?: number;
      visibleEntityTypes?: Set<string>;
      visibleRelationTypes?: Set<string>;
      searchQuery?: string;
    }
  ): {
    nodes: GraphNode[];
    edges: GraphEdge[];
    matchedNodeIds?: string[];
  } {
    let filteredNodes = nodes;
    let filteredEdges = edges;
    let matchedNodeIds: string[] | undefined;

    // Apply importance filter
    if (filters.centralityScores && filters.importanceThreshold !== undefined) {
      const result = this.pruneByImportance(
        filteredNodes,
        filteredEdges,
        filters.centralityScores,
        filters.importanceThreshold
      );
      filteredNodes = result.nodes;
      filteredEdges = result.edges;
    }

    // Apply entity type filter
    if (filters.visibleEntityTypes && filters.visibleEntityTypes.size > 0) {
      const result = this.filterByEntityType(
        filteredNodes,
        filteredEdges,
        filters.visibleEntityTypes
      );
      filteredNodes = result.nodes;
      filteredEdges = result.edges;
    }

    // Apply relationship type filter
    if (filters.visibleRelationTypes && filters.visibleRelationTypes.size > 0) {
      filteredEdges = this.filterEdgesByType(
        filteredEdges,
        filters.visibleRelationTypes
      );
    }

    // Apply search filter (doesn't remove nodes, just highlights)
    if (filters.searchQuery) {
      const result = this.filterBySearch(
        filteredNodes,
        filteredEdges,
        filters.searchQuery
      );
      matchedNodeIds = result.matchedNodeIds;
    }

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      matchedNodeIds
    };
  }

  /**
   * Calculate percentile threshold from centrality scores
   */
  private calculatePercentileThreshold(
    scores: Map<string, CentralityScores>,
    percentile: number
  ): number {
    const values = Array.from(scores.values()).map(s => s.combined);
    values.sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * values.length);
    return values[index] || 0;
  }

  /**
   * Get isolated nodes (nodes with no connections)
   */
  getIsolatedNodes(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    return nodes.filter(node => !connectedNodeIds.has(node.id));
  }

  /**
   * Remove isolated nodes from the graph
   */
  removeIsolatedNodes(
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const isolatedNodes = this.getIsolatedNodes(nodes, edges);
    const isolatedNodeIds = new Set(isolatedNodes.map(n => n.id));

    const filteredNodes = nodes.filter(node => !isolatedNodeIds.has(node.id));

    return { nodes: filteredNodes, edges };
  }
}

export const graphPruningService = new GraphPruningService();
