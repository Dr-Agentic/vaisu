import { describe, it, expect } from 'vitest';

import { ForceDirectedLayout } from '../forceDirectedLayout';

import type { GraphNode, GraphEdge } from '../../../../../../../../shared/src/types';

describe('ForceDirectedLayout', () => {
  const layout = new ForceDirectedLayout();

  const createMockNodes = (count: number): GraphNode[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: 'concept',
      size: 30,
      color: '#4F46E5',
      metadata: {
        centrality: 0.5,
        connections: 0,
      },
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
        strength: 0.5,
      });
    }
    return edges;
  };

  it('should compute positions for all nodes', async () => {
    const nodes = createMockNodes(10);
    const edges = createMockEdges(nodes.map(n => n.id));

    const positions = await layout.compute(nodes, edges);

    expect(positions.size).toBe(10);
    positions.forEach(pos => {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    });
  });

  it('should handle empty graph', async () => {
    const positions = await layout.compute([], []);
    expect(positions.size).toBe(0);
  });

  it('should complete within time limit', async () => {
    const nodes = createMockNodes(100);
    const edges = createMockEdges(nodes.map(n => n.id));

    const startTime = Date.now();
    await layout.compute(nodes, edges);
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should respect custom dimensions', async () => {
    const nodes = createMockNodes(5);
    const edges = createMockEdges(nodes.map(n => n.id));

    const positions = await layout.compute(nodes, edges, {
      width: 800,
      height: 600,
    });

    positions.forEach(pos => {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(800);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThanOrEqual(600);
    });
  });

  it('should filter out edges with invalid node references', async () => {
    const nodes = createMockNodes(3);
    const validEdges = createMockEdges(nodes.map(n => n.id));

    // Add edges with invalid node references
    const invalidEdges: GraphEdge[] = [
      {
        id: 'invalid-1',
        source: 'non-existent-node',
        target: nodes[0].id,
        type: 'relates-to',
        strength: 0.5,
      },
      {
        id: 'invalid-2',
        source: nodes[0].id,
        target: 'another-missing-node',
        type: 'relates-to',
        strength: 0.5,
      },
    ];

    const allEdges = [...validEdges, ...invalidEdges];

    // Should not throw error
    const positions = await layout.compute(nodes, allEdges);

    // Should still compute positions for all nodes
    expect(positions.size).toBe(3);
  });

  it('should handle graph with only invalid edges', async () => {
    const nodes = createMockNodes(3);
    const invalidEdges: GraphEdge[] = [
      {
        id: 'invalid-1',
        source: 'missing-1',
        target: 'missing-2',
        type: 'relates-to',
        strength: 0.5,
      },
    ];

    // Should not throw error
    const positions = await layout.compute(nodes, invalidEdges);

    // Should still compute positions for all nodes
    expect(positions.size).toBe(3);
  });
});
