import { describe, it, expect } from 'vitest';
import { CentralityService } from '../centralityService';
import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';

describe('CentralityService', () => {
  const service = new CentralityService();

  const createMockNodes = (count: number): GraphNode[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: 'concept',
      size: 30,
      color: '#4F46E5',
      metadata: {
        centrality: 0.5,
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

  it('should calculate centrality scores for all nodes', () => {
    const nodes = createMockNodes(5);
    const edges = createMockEdges(nodes.map(n => n.id));

    const scores = service.calculateCentrality(nodes, edges);

    expect(scores.size).toBe(5);
    scores.forEach(score => {
      expect(score.degree).toBeGreaterThanOrEqual(0);
      expect(score.degree).toBeLessThanOrEqual(1);
      expect(score.betweenness).toBeGreaterThanOrEqual(0);
      expect(score.betweenness).toBeLessThanOrEqual(1);
      expect(score.combined).toBeGreaterThanOrEqual(0);
      expect(score.combined).toBeLessThanOrEqual(1);
    });
  });

  it('should identify central nodes correctly', () => {
    // Create a star topology where node-0 is central
    const nodes = createMockNodes(5);
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'node-0', target: 'node-1', type: 'relates-to', strength: 1 },
      { id: 'e2', source: 'node-0', target: 'node-2', type: 'relates-to', strength: 1 },
      { id: 'e3', source: 'node-0', target: 'node-3', type: 'relates-to', strength: 1 },
      { id: 'e4', source: 'node-0', target: 'node-4', type: 'relates-to', strength: 1 }
    ];

    const scores = service.calculateCentrality(nodes, edges);
    const centralNode = scores.get('node-0');
    const peripheralNode = scores.get('node-1');

    expect(centralNode).toBeDefined();
    expect(peripheralNode).toBeDefined();
    expect(centralNode!.degree).toBeGreaterThan(peripheralNode!.degree);
    expect(centralNode!.combined).toBeGreaterThan(peripheralNode!.combined);
  });

  it('should return top nodes by centrality', () => {
    const nodes = createMockNodes(10);
    const edges = createMockEdges(nodes.map(n => n.id));
    const scores = service.calculateCentrality(nodes, edges);

    const topNodes = service.getTopNodes(nodes, scores, 3);

    expect(topNodes).toHaveLength(3);
    // Verify they are sorted by centrality
    for (let i = 0; i < topNodes.length - 1; i++) {
      const score1 = scores.get(topNodes[i].id)!.combined;
      const score2 = scores.get(topNodes[i + 1].id)!.combined;
      expect(score1).toBeGreaterThanOrEqual(score2);
    }
  });

  it('should calculate percentile threshold correctly', () => {
    const nodes = createMockNodes(10);
    const edges = createMockEdges(nodes.map(n => n.id));
    const scores = service.calculateCentrality(nodes, edges);

    const threshold75 = service.getPercentileThreshold(scores, 75);
    const threshold25 = service.getPercentileThreshold(scores, 25);

    expect(threshold75).toBeGreaterThanOrEqual(threshold25);
    expect(threshold75).toBeGreaterThanOrEqual(0);
    expect(threshold75).toBeLessThanOrEqual(1);
  });

  it('should handle empty graph', () => {
    const scores = service.calculateCentrality([], []);
    expect(scores.size).toBe(0);
  });

  it('should handle disconnected nodes', () => {
    const nodes = createMockNodes(3);
    const edges: GraphEdge[] = []; // No edges

    const scores = service.calculateCentrality(nodes, edges);

    expect(scores.size).toBe(3);
    scores.forEach(score => {
      expect(score.degree).toBe(0);
      expect(score.betweenness).toBe(0);
    });
  });
});
