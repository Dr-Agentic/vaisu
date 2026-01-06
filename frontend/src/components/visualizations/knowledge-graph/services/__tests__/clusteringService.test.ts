import { describe, it, expect } from 'vitest';

import { ClusteringService } from '../clusteringService';

import type { GraphNode, GraphEdge } from '../../../../../../../shared/src/types';

describe('ClusteringService', () => {
  const service = new ClusteringService();

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

  it('should detect clusters in a connected graph', () => {
    const nodes = createMockNodes(6);
    const edges: GraphEdge[] = [
      // Cluster 1: nodes 0, 1, 2
      { id: 'e1', source: 'node-0', target: 'node-1', type: 'relates-to', strength: 1 },
      { id: 'e2', source: 'node-1', target: 'node-2', type: 'relates-to', strength: 1 },
      { id: 'e3', source: 'node-2', target: 'node-0', type: 'relates-to', strength: 1 },
      // Cluster 2: nodes 3, 4, 5
      { id: 'e4', source: 'node-3', target: 'node-4', type: 'relates-to', strength: 1 },
      { id: 'e5', source: 'node-4', target: 'node-5', type: 'relates-to', strength: 1 },
      { id: 'e6', source: 'node-5', target: 'node-3', type: 'relates-to', strength: 1 },
    ];

    const clusters = service.detectClusters(nodes, edges);

    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters.length).toBeLessThanOrEqual(2);

    // Verify all nodes are assigned to clusters
    const allNodeIds = new Set(nodes.map(n => n.id));
    const clusteredNodeIds = new Set(clusters.flatMap(c => c.nodeIds));
    expect(clusteredNodeIds.size).toBe(allNodeIds.size);
  });

  it('should assign cluster colors', () => {
    const nodes = createMockNodes(4);
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'node-0', target: 'node-1', type: 'relates-to', strength: 1 },
      { id: 'e2', source: 'node-2', target: 'node-3', type: 'relates-to', strength: 1 },
    ];

    const clusters = service.detectClusters(nodes, edges);
    const assignments = service.assignClusterColors(clusters);

    expect(assignments.size).toBeGreaterThan(0);
    assignments.forEach(assignment => {
      expect(assignment.clusterId).toBeTruthy();
      expect(assignment.clusterColor).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should calculate convex hull for cluster boundary', () => {
    const nodeIds = ['node-0', 'node-1', 'node-2'];
    const positions = new Map([
      ['node-0', { x: 0, y: 0 }],
      ['node-1', { x: 100, y: 0 }],
      ['node-2', { x: 50, y: 100 }],
    ]);

    const boundary = service.calculateClusterBoundary(nodeIds, positions);

    expect(boundary.length).toBeGreaterThanOrEqual(3);
    boundary.forEach(point => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeGreaterThanOrEqual(0);
    });
  });

  it('should handle empty graph', () => {
    const clusters = service.detectClusters([], []);
    expect(clusters).toEqual([]);
  });

  it('should handle single node', () => {
    const nodes = createMockNodes(1);
    const clusters = service.detectClusters(nodes, []);

    expect(clusters.length).toBe(1);
    expect(clusters[0].nodeIds).toContain('node-0');
  });
});
