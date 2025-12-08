import { describe, it, expect } from 'vitest';
import { GraphPruningService } from '../graphPruning';
import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';
import type { CentralityScores } from '../centralityService';

describe('GraphPruningService', () => {
  const service = new GraphPruningService();

  const createMockNodes = (count: number): GraphNode[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: 'concept',
      size: 30,
      color: '#4F46E5',
      metadata: {
        centrality: i / count, // Increasing centrality
        connections: 0
      }
    }));
  };

  const createMockEdges = (nodeIds: string[]): GraphEdge[] => {
    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: nodeIds[i],
        target: nodeIds[i + 1],
        type: 'relates-to',
        strength: 0.5
      });
    }
    return edges;
  };

  it('should prune nodes by importance threshold', () => {
    const nodes = createMockNodes(10);
    const edges = createMockEdges(nodes.map(n => n.id));
    
    const centralityScores = new Map<string, CentralityScores>();
    nodes.forEach(node => {
      centralityScores.set(node.id, {
        degree: node.metadata.centrality,
        betweenness: node.metadata.centrality,
        eigenvector: node.metadata.centrality,
        combined: node.metadata.centrality
      });
    });

    const result = service.pruneByImportance(nodes, edges, centralityScores, 50);

    expect(result.nodes.length).toBeLessThan(nodes.length);
    expect(result.edges.length).toBeLessThan(edges.length);
    
    // Verify remaining nodes have higher centrality
    result.nodes.forEach(node => {
      expect(node.metadata.centrality).toBeGreaterThanOrEqual(0.5);
    });
  });

  it('should filter nodes by entity type', () => {
    const nodes: GraphNode[] = [
      { id: '1', label: 'A', type: 'person', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } },
      { id: '2', label: 'B', type: 'organization', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } },
      { id: '3', label: 'C', type: 'person', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } }
    ];
    const edges: GraphEdge[] = [
      { id: 'e1', source: '1', target: '2', type: 'relates-to', strength: 1 },
      { id: 'e2', source: '2', target: '3', type: 'relates-to', strength: 1 }
    ];

    const visibleTypes = new Set(['person']);
    const result = service.filterByEntityType(nodes, edges, visibleTypes);

    expect(result.nodes.length).toBe(2);
    expect(result.nodes.every(n => n.type === 'person')).toBe(true);
    expect(result.edges.length).toBe(0); // No edges between two persons
  });

  it('should filter nodes by search query', () => {
    const nodes: GraphNode[] = [
      { id: '1', label: 'Apple', type: 'concept', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } },
      { id: '2', label: 'Banana', type: 'concept', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } },
      { id: '3', label: 'Application', type: 'concept', size: 30, color: '#000', metadata: { centrality: 0.5, connections: 0 } }
    ];
    const edges: GraphEdge[] = [];

    const result = service.filterBySearch(nodes, edges, 'app');

    expect(result.matchedNodeIds.length).toBe(2);
    expect(result.matchedNodeIds).toContain('1');
    expect(result.matchedNodeIds).toContain('3');
  });

  it('should remove isolated nodes', () => {
    const nodes = createMockNodes(5);
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'node-0', target: 'node-1', type: 'relates-to', strength: 1 }
      // nodes 2, 3, 4 are isolated
    ];

    const result = service.removeIsolatedNodes(nodes, edges);

    expect(result.nodes.length).toBe(2);
    expect(result.nodes.map(n => n.id)).toContain('node-0');
    expect(result.nodes.map(n => n.id)).toContain('node-1');
  });

  it('should apply multiple filters in sequence', () => {
    const nodes = createMockNodes(10);
    const edges = createMockEdges(nodes.map(n => n.id));
    
    const centralityScores = new Map<string, CentralityScores>();
    nodes.forEach(node => {
      centralityScores.set(node.id, {
        degree: node.metadata.centrality,
        betweenness: node.metadata.centrality,
        eigenvector: node.metadata.centrality,
        combined: node.metadata.centrality
      });
    });

    const result = service.applyFilters(nodes, edges, {
      centralityScores,
      importanceThreshold: 50,
      searchQuery: 'Node'
    });

    expect(result.nodes.length).toBeLessThan(nodes.length);
    expect(result.matchedNodeIds).toBeDefined();
  });
});
